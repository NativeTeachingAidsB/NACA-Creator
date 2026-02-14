
export interface Community {
  id: string;
  name: string;
  language: string;
  languagePair: string; // e.g., "Cree-English"
  dropboxPath: string;
}

export interface MediaAsset {
  id: string;
  communityId: string;
  type: 'audio' | 'image' | 'video';
  category: 'vocabulary' | 'cultural' | 'activity' | 'pronunciation';
  filename: string;
  url: string; // Dropbox or local cache URL
  thumbnailUrl?: string;
  tags: string[];
  metadata?: {
    duration?: number; // for audio/video
    dimensions?: { width: number; height: number }; // for images
    fileSize?: number;
    uploadedAt?: Date;
  };
}

export interface VocabularySet {
  id: string;
  communityId: string;
  name: string;
  category: string;
  items: VocabularyItem[];
}

export interface VocabularyItem {
  word: string;
  translation: string;
  imageUrl?: string;
  audioUrl?: string;
  category?: string;
  culturalNotes?: string;
}

// NACA Activity Folder Types
export interface NacaFolder {
  id: string;
  name: string;
  path: string;
  type: 'folder';
  parentId?: string;
  children?: NacaFolderEntry[];
  metadata?: {
    createdAt?: string;
    modifiedAt?: string;
    owner?: string;
  };
}

export interface NacaFile {
  id: string;
  name: string;
  path: string;
  type: 'file';
  parentId: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  metadata?: {
    createdAt?: string;
    modifiedAt?: string;
    width?: number;
    height?: number;
    duration?: number;
  };
}

export type NacaFolderEntry = NacaFolder | NacaFile;

export interface NacaCapability {
  name: string;
  version: string;
  enabled: boolean;
  endpoints?: string[];
}

export interface NacaCapabilities {
  version: string;
  apiVersion: string;
  features: NacaCapability[];
  schemaHashes?: Record<string, string>;
}
