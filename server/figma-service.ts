import { storage } from "./storage";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

interface FigmaNode {
  id: string;
  name: string;
  type: string;
  absoluteBoundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  fills?: any[];
  strokes?: any[];
  effects?: any[];
  children?: FigmaNode[];
}

interface FigmaFile {
  name: string;
  document: FigmaNode;
  components: Record<string, any>;
  lastModified: string;
  version: string;
}

interface FigmaImageResponse {
  images: Record<string, string>;
}

interface SyncResult {
  success: boolean;
  framesFound: number;
  framesImported: number;
  framesUpdated: number;
  errors: string[];
}

interface LayerSyncResult {
  success: boolean;
  layersFound: number;
  layersImported: number;
  layersUpdated: number;
  layersSkipped: number;
  errors: string[];
}

const FIGMA_API_BASE = "https://api.figma.com/v1";
const IMAGES_DIR = path.join(process.cwd(), "attached_assets", "figma_screens");
const BATCH_SIZE = 30;

function ensureImagesDir() {
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
  }
}

function getApiToken(): string | null {
  return process.env.FIGMA_API_TOKEN || null;
}

async function fetchFigmaFile(fileKey: string, depth: number = 2): Promise<FigmaFile> {
  const token = getApiToken();
  if (!token) {
    throw new Error("FIGMA_API_TOKEN not configured. Please add your Figma Personal Access Token.");
  }

  const response = await fetch(`${FIGMA_API_BASE}/files/${fileKey}?depth=${depth}`, {
    headers: {
      "X-Figma-Token": token,
    },
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error("Invalid or expired Figma API token");
    }
    if (response.status === 404) {
      throw new Error("Figma file not found. Check the file key and your access permissions.");
    }
    const error = await response.text();
    throw new Error(`Failed to fetch Figma file: ${response.status} - ${error}`);
  }

  return response.json();
}

async function fetchFrameImagesBatched(fileKey: string, nodeIds: string[]): Promise<Record<string, string>> {
  const token = getApiToken();
  if (!token) {
    throw new Error("FIGMA_API_TOKEN not configured");
  }

  if (nodeIds.length === 0) return {};

  const allImages: Record<string, string> = {};
  
  for (let i = 0; i < nodeIds.length; i += BATCH_SIZE) {
    const batch = nodeIds.slice(i, i + BATCH_SIZE);
    const idsParam = batch.join(",");
    
    const response = await fetch(
      `${FIGMA_API_BASE}/images/${fileKey}?ids=${encodeURIComponent(idsParam)}&format=png&scale=2`,
      {
        headers: {
          "X-Figma-Token": token,
        },
      }
    );

    if (!response.ok) {
      console.error(`Failed to fetch batch ${i / BATCH_SIZE + 1}: ${response.status}`);
      continue;
    }

    const data: FigmaImageResponse = await response.json();
    Object.assign(allImages, data.images || {});
    
    if (i + BATCH_SIZE < nodeIds.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  return allImages;
}

async function downloadAndSaveImage(url: string, frameId: string): Promise<string> {
  ensureImagesDir();
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status}`);
  }
  
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  const hash = crypto.createHash("md5").update(buffer).digest("hex").substring(0, 8);
  const safeFrameId = frameId.replace(/[^a-zA-Z0-9]/g, "_");
  const filename = `${safeFrameId}_${hash}.png`;
  const filepath = path.join(IMAGES_DIR, filename);
  
  fs.writeFileSync(filepath, buffer);
  
  return `/@fs${filepath}`;
}

function findFrames(node: FigmaNode, frames: FigmaNode[] = []): FigmaNode[] {
  if (node.type === "FRAME" || node.type === "COMPONENT" || node.type === "COMPONENT_SET") {
    if (node.absoluteBoundingBox && node.absoluteBoundingBox.width > 100 && node.absoluteBoundingBox.height > 100) {
      frames.push(node);
    }
  }
  
  if (node.children) {
    for (const child of node.children) {
      findFrames(child, frames);
    }
  }
  
  return frames;
}

function computeChildHashes(children: FigmaNode[] | undefined, depth: number = 0): any[] {
  if (!children || depth > 3) return [];
  return children.map(child => ({
    id: child.id,
    name: child.name,
    type: child.type,
    bounds: child.absoluteBoundingBox,
    fills: child.fills,
    strokes: child.strokes,
    effects: child.effects,
    children: computeChildHashes(child.children, depth + 1),
  }));
}

function computeNodeHash(node: FigmaNode): string {
  const data = {
    name: node.name,
    type: node.type,
    bounds: node.absoluteBoundingBox,
    fills: node.fills,
    strokes: node.strokes,
    effects: node.effects,
    children: computeChildHashes(node.children),
  };
  return crypto.createHash("md5").update(JSON.stringify(data)).digest("hex").substring(0, 12);
}

export async function syncFigmaProject(projectId: string): Promise<SyncResult> {
  const result: SyncResult = {
    success: false,
    framesFound: 0,
    framesImported: 0,
    framesUpdated: 0,
    errors: [],
  };

  try {
    const project = await storage.getProject(projectId);
    if (!project) {
      result.errors.push("Project not found");
      return result;
    }

    if (!project.figmaFileKey) {
      result.errors.push("No Figma file connected to this project");
      return result;
    }

    const figmaFile = await fetchFigmaFile(project.figmaFileKey);
    const frames = findFrames(figmaFile.document);
    result.framesFound = frames.length;

    if (frames.length === 0) {
      result.errors.push("No frames found in the Figma file");
      return result;
    }

    const frameIds = frames.map(f => f.id);
    const figmaImageUrls = await fetchFrameImagesBatched(project.figmaFileKey, frameIds);

    for (const frame of frames) {
      const figmaTempUrl = figmaImageUrls[frame.id];
      if (!figmaTempUrl) {
        result.errors.push(`No image for frame: ${frame.name}`);
        continue;
      }

      const hash = computeNodeHash(frame);
      const existingScreen = await storage.getScreenByFigmaFrame(frame.id);

      const needsUpdate = !existingScreen || existingScreen.figmaNodeHash !== hash;
      
      if (needsUpdate) {
        const localImageUrl = await downloadAndSaveImage(figmaTempUrl, frame.id);
        
        if (existingScreen) {
          await storage.updateScreen(existingScreen.id, {
            title: frame.name,
            width: Math.round(frame.absoluteBoundingBox?.width || 1194),
            height: Math.round(frame.absoluteBoundingBox?.height || 834),
            imageUrl: localImageUrl,
            figmaNodeHash: hash,
          });
          result.framesUpdated++;
        } else {
          await storage.createScreen({
            projectId,
            title: frame.name,
            width: Math.round(frame.absoluteBoundingBox?.width || 1194),
            height: Math.round(frame.absoluteBoundingBox?.height || 834),
            imageUrl: localImageUrl,
            figmaFrameId: frame.id,
            figmaNodeHash: hash,
          });
          result.framesImported++;
        }
      }

      await storage.upsertFigmaNode({
        projectId,
        nodeId: frame.id,
        name: frame.name,
        type: frame.type,
        hash,
        x: frame.absoluteBoundingBox?.x,
        y: frame.absoluteBoundingBox?.y,
        width: frame.absoluteBoundingBox?.width,
        height: frame.absoluteBoundingBox?.height,
      });
    }

    await storage.updateProject(projectId, {
      figmaLastSyncedAt: new Date(),
    });

    result.success = true;
  } catch (error) {
    result.errors.push(error instanceof Error ? error.message : "Unknown error");
  }

  return result;
}

export function hasFigmaToken(): boolean {
  return !!getApiToken();
}

const SUPPORTED_LAYER_TYPES = [
  "FRAME",
  "GROUP", 
  "RECTANGLE",
  "TEXT",
  "VECTOR",
  "ELLIPSE",
  "LINE",
  "INSTANCE",
  "COMPONENT"
];

function findNodeById(node: FigmaNode, targetId: string): FigmaNode | null {
  if (node.id === targetId) {
    return node;
  }
  if (node.children) {
    for (const child of node.children) {
      const found = findNodeById(child, targetId);
      if (found) return found;
    }
  }
  return null;
}

function collectChildLayers(node: FigmaNode, layers: { node: FigmaNode; zIndex: number }[], zIndex: { current: number }): void {
  if (node.children) {
    for (const child of node.children) {
      if (SUPPORTED_LAYER_TYPES.includes(child.type) && child.absoluteBoundingBox) {
        layers.push({ node: child, zIndex: zIndex.current++ });
      }
      collectChildLayers(child, layers, zIndex);
    }
  }
}

export async function syncFigmaLayers(screenId: string, frameId: string): Promise<LayerSyncResult> {
  const result: LayerSyncResult = {
    success: false,
    layersFound: 0,
    layersImported: 0,
    layersUpdated: 0,
    layersSkipped: 0,
    errors: [],
  };

  try {
    const screen = await storage.getScreen(screenId);
    if (!screen) {
      result.errors.push("Screen not found");
      return result;
    }

    if (!screen.projectId) {
      result.errors.push("Screen has no associated project");
      return result;
    }

    const project = await storage.getProject(screen.projectId);
    if (!project) {
      result.errors.push("Project not found");
      return result;
    }

    if (!project.figmaFileKey) {
      result.errors.push("No Figma file connected to this project");
      return result;
    }

    const figmaFile = await fetchFigmaFile(project.figmaFileKey, 4);
    
    const frame = findNodeById(figmaFile.document, frameId);
    if (!frame) {
      result.errors.push(`Frame with ID ${frameId} not found in Figma file`);
      return result;
    }

    if (!frame.absoluteBoundingBox) {
      result.errors.push("Frame has no bounding box");
      return result;
    }

    const frameBounds = frame.absoluteBoundingBox;
    const layers: { node: FigmaNode; zIndex: number }[] = [];
    collectChildLayers(frame, layers, { current: 0 });

    result.layersFound = layers.length;

    for (const { node: child, zIndex } of layers) {
      try {
        if (!child.absoluteBoundingBox) {
          result.layersSkipped++;
          continue;
        }

        const relativeX = child.absoluteBoundingBox.x - frameBounds.x;
        const relativeY = child.absoluteBoundingBox.y - frameBounds.y;
        const width = child.absoluteBoundingBox.width;
        const height = child.absoluteBoundingBox.height;

        const existingObject = await storage.getObjectByFigmaNode(child.id);

        if (existingObject) {
          await storage.updateObject(existingObject.id, {
            name: child.name,
            type: child.type.toLowerCase(),
            x: relativeX,
            y: relativeY,
            width,
            height,
            zIndex,
          });
          result.layersUpdated++;
        } else {
          await storage.createObject({
            screenId,
            figmaNodeId: child.id,
            name: child.name,
            type: child.type.toLowerCase(),
            x: relativeX,
            y: relativeY,
            width,
            height,
            zIndex,
          });
          result.layersImported++;
        }
      } catch (layerError) {
        result.errors.push(`Error processing layer ${child.name}: ${layerError instanceof Error ? layerError.message : "Unknown error"}`);
        result.layersSkipped++;
      }
    }

    result.success = true;
  } catch (error) {
    result.errors.push(error instanceof Error ? error.message : "Unknown error");
  }

  return result;
}
