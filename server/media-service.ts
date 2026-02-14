
import { db } from "./db";
import type { Community, MediaAsset } from "@shared/types";
import path from "path";
import fs from "fs/promises";

export class MediaService {
  private dropboxBasePath = process.env.DROPBOX_PATH || "/mnt/dropbox";
  private localCachePath = path.join(process.cwd(), "attached_assets", "communities");

  async getCommunities(): Promise<Community[]> {
    // This would be populated from database or config
    // For now, return sample structure
    return [
      {
        id: "community-1",
        name: "Plains_Cree",
        language: "Cree",
        languagePair: "Cree-English",
        dropboxPath: path.join(this.dropboxBasePath, "Plains_Cree")
      }
    ];
  }

  async getMediaAssets(communityId: string, type?: string, category?: string): Promise<MediaAsset[]> {
    const community = (await this.getCommunities()).find(c => c.id === communityId);
    if (!community) return [];

    const mediaPath = path.join(community.dropboxPath, type === 'audio' ? 'Audio' : 'Images');
    const assets: MediaAsset[] = [];

    try {
      const categoryPath = category ? path.join(mediaPath, category) : mediaPath;
      const files = await fs.readdir(categoryPath, { withFileTypes: true });

      for (const file of files) {
        if (file.isFile()) {
          assets.push({
            id: `${communityId}-${file.name}`,
            communityId,
            type: type as any || 'image',
            category: category as any || 'vocabulary',
            filename: file.name,
            url: path.join(categoryPath, file.name),
            tags: [],
          });
        }
      }
    } catch (error) {
      console.error(`Error reading media assets:`, error);
    }

    return assets;
  }

  async cacheAsset(asset: MediaAsset): Promise<string> {
    const cachePath = path.join(
      this.localCachePath,
      asset.communityId,
      asset.type,
      asset.category,
      asset.filename
    );

    await fs.mkdir(path.dirname(cachePath), { recursive: true });
    await fs.copyFile(asset.url, cachePath);

    return cachePath;
  }
}

export const mediaService = new MediaService();
