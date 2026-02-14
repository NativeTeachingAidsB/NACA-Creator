import { execFile } from "child_process";
import { promisify } from "util";
import path from "path";
import fs from "fs";

const execFileAsync = promisify(execFile);

const THUMBNAILS_DIR = "attached_assets/help_videos/thumbnails";
const ALLOWED_VIDEO_DIR = "attached_assets/help_videos";

if (!fs.existsSync(THUMBNAILS_DIR)) {
  fs.mkdirSync(THUMBNAILS_DIR, { recursive: true });
}

function validateVideoPath(videoPath: string): string | null {
  const normalized = path.normalize(videoPath.replace(/^\//, ""));
  const resolved = path.resolve(normalized);
  const allowedDir = path.resolve(ALLOWED_VIDEO_DIR);
  
  if (!resolved.startsWith(allowedDir)) {
    console.error(`Video path not in allowed directory: ${resolved}`);
    return null;
  }
  
  return resolved;
}

export async function extractThumbnailFromVideo(
  videoPath: string,
  thumbnailFilename?: string
): Promise<{ thumbnailUrl: string; duration: number } | null> {
  try {
    const absVideoPath = validateVideoPath(videoPath);
    
    if (!absVideoPath) {
      return null;
    }
    
    if (!fs.existsSync(absVideoPath)) {
      console.error(`Video file not found: ${absVideoPath}`);
      return null;
    }

    const videoFilename = path.basename(videoPath, path.extname(videoPath));
    const thumbnailName = thumbnailFilename || `${videoFilename}_thumb.jpg`;
    const thumbnailPath = path.join(THUMBNAILS_DIR, thumbnailName);

    const { stdout: durationOutput } = await execFileAsync(
      "ffprobe",
      ["-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", absVideoPath],
      { timeout: 10000 }
    );
    const duration = Math.round(parseFloat(durationOutput.trim()) || 0);

    const seekTime = Math.min(1, duration / 2);

    await execFileAsync(
      "ffmpeg",
      ["-y", "-ss", String(seekTime), "-i", absVideoPath, "-vframes", "1", "-q:v", "3", "-s", "320x180", thumbnailPath],
      { timeout: 30000 }
    );

    if (!fs.existsSync(thumbnailPath)) {
      console.error(`Failed to create thumbnail at: ${thumbnailPath}`);
      return null;
    }

    const thumbnailUrl = `/${THUMBNAILS_DIR}/${thumbnailName}`;
    
    console.log(`Generated thumbnail: ${thumbnailUrl} (duration: ${duration}s)`);
    return { thumbnailUrl, duration };
  } catch (error) {
    console.error("Error extracting thumbnail:", error);
    return null;
  }
}

export async function getVideoDuration(videoPath: string): Promise<number> {
  try {
    const absVideoPath = validateVideoPath(videoPath);
    
    if (!absVideoPath) {
      return 0;
    }
    
    if (!fs.existsSync(absVideoPath)) {
      return 0;
    }

    const { stdout } = await execFileAsync(
      "ffprobe",
      ["-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", absVideoPath],
      { timeout: 10000 }
    );
    
    return Math.round(parseFloat(stdout.trim()) || 0);
  } catch (error) {
    console.error("Error getting video duration:", error);
    return 0;
  }
}
