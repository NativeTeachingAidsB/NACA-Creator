import { WebSocketServer, WebSocket } from "ws";
import type { Server as HttpServer } from "http";
import type { IncomingMessage } from "http";
import { storage } from "./storage";

interface DevSyncMessage {
  type: string;
  componentId: string;
  payload: any;
}

// Editor-Host Negotiation Protocol Types
interface HostCapabilities {
  version: string;
  apiVersion: string;
  // Auth capabilities
  auth: {
    methods: ('api_key' | 'session' | 'oauth' | 'jwt' | 'none')[];
    headerNames: string[];  // Which headers the host respects
    requiresAuth: boolean;
  };
  // Community/subdomain handling
  subdomain: {
    extraction: 'header' | 'hostname' | 'both';  // How the host extracts subdomain
    headerNames: string[];  // Which headers to check (e.g., X-Community-Subdomain)
    allowOverride: boolean;  // Can external clients override subdomain detection
    defaultCommunity?: string;  // Default community for bootstrap
  };
  // CORS and external access
  cors: {
    allowExternalOrigins: boolean;
    allowedOrigins: string[];  // Empty means all allowed
  };
  // Feature flags
  features: string[];
  // Schema versions for compatibility
  schemaVersions: {
    activity: string;
    vocabulary: string;
    media: string;
  };
}

interface NegotiationRequest {
  editorVersion: string;
  editorOrigin: string;
  requestedSubdomain?: string;
  preferredAuthMethod?: string;
}

interface NegotiationResponse {
  success: boolean;
  configuration?: {
    subdomain: string;
    authMethod: string;
    authHeaders: Record<string, string>;
    baseUrl: string;
    websocketUrl?: string;
  };
  error?: string;
  capabilities: HostCapabilities;
}

interface ActivityVocabularyEntry {
  id: string;
  word: string;
  translation: string;
  imageUrl: string | null;
  audioUrl: string | null;
  category: string | null;
}

interface ActivityDefinition {
  id: string;
  componentId: string;
  version: string;
  screens: ActivityScreen[];
  vocabulary: ActivityVocabularyEntry[];
}

interface ActivityScreen {
  id: string;
  title: string;
  figmaFrameId: string | null;
  imageUrl: string;
  width: number;
  height: number;
  objects: ActivityObject[];
  scenes: ActivityScene[];
}

interface ActivityObject {
  id: string;
  customId: string | null;
  classes: string[];
  tags: string[];
  figmaNodeId: string | null;
  type: string;
  name: string;
  bounds: { x: number; y: number; width: number; height: number };
  zIndex: number;
  dataKey: string | null;
  mediaUrl: string | null;
  audioUrl: string | null;
  rotation: number;
  scaleX: number;
  scaleY: number;
  opacity: number;
  visible: boolean;
  metadata: Record<string, unknown> | null;
}

interface ActivityScene {
  id: string;
  name: string;
  isDefault: boolean;
  order: number;
  objectStates: any[];
  triggers: any[];
}

interface ConnectedClient {
  ws: WebSocket;
  componentId: string | null;
  connectedAt: Date;
}

class DevSyncService {
  private wss: WebSocketServer | null = null;
  private clients: Map<WebSocket, ConnectedClient> = new Map();

  private log(message: string) {
    const formattedTime = new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
    console.log(`${formattedTime} [DevSync] ${message}`);
  }

  initialize(httpServer: HttpServer) {
    this.wss = new WebSocketServer({ noServer: true });

    httpServer.on("upgrade", (request: IncomingMessage, socket, head) => {
      const { pathname } = new URL(request.url || "", `http://${request.headers.host}`);
      
      if (pathname === "/ws/dev-sync") {
        this.wss!.handleUpgrade(request, socket, head, (ws) => {
          this.wss!.emit("connection", ws, request);
        });
      }
    });

    this.wss.on("connection", (ws: WebSocket, request: IncomingMessage) => {
      const clientInfo: ConnectedClient = {
        ws,
        componentId: null,
        connectedAt: new Date(),
      };
      this.clients.set(ws, clientInfo);
      
      const clientIp = request.socket.remoteAddress || "unknown";
      this.log(`Client connected from ${clientIp}. Total clients: ${this.clients.size}`);

      ws.on("message", async (data) => {
        try {
          const message: DevSyncMessage = JSON.parse(data.toString());
          await this.handleMessage(ws, message);
        } catch (error) {
          this.log(`Error parsing message: ${error}`);
          ws.send(JSON.stringify({ type: "error", payload: { message: "Invalid message format" } }));
        }
      });

      ws.on("close", () => {
        const client = this.clients.get(ws);
        const componentId = client?.componentId || "unknown";
        this.clients.delete(ws);
        this.log(`Client disconnected (componentId: ${componentId}). Total clients: ${this.clients.size}`);
        this.broadcastClientCount();
      });

      ws.on("error", (error) => {
        this.log(`WebSocket error: ${error.message}`);
      });

      ws.send(JSON.stringify({ 
        type: "connected", 
        payload: { message: "Connected to DevSync service" } 
      }));

      this.broadcastClientCount();
    });

    this.log("DevSync WebSocket server initialized at /ws/dev-sync");
  }

  private async handleMessage(ws: WebSocket, message: DevSyncMessage) {
    const client = this.clients.get(ws);
    if (!client) return;

    if (message.componentId) {
      client.componentId = message.componentId;
    }

    this.log(`Received message type: ${message.type} from componentId: ${message.componentId || "unknown"}`);

    switch (message.type) {
      case "identify":
        this.handleIdentify(ws, message);
        break;
      case "activity_update":
        await this.handleActivityUpdate(ws, message);
        break;
      case "vocabulary_push":
        await this.handleVocabularyPush(ws, message);
        break;
      case "preview_request":
        await this.handlePreviewRequest(ws, message);
        break;
      case "request_activity":
        await this.handleRequestActivity(ws, message);
        break;
      case "media_library_update":
        await this.handleMediaLibraryUpdate(ws, message);
        break;
      case "dictionary_sync":
        await this.handleDictionarySync(ws, message);
        break;
      // New NACA integration topics
      case "capabilities_update":
        await this.handleCapabilitiesUpdate(ws, message);
        break;
      case "media_upload":
        await this.handleMediaUpload(ws, message);
        break;
      case "media_link":
        await this.handleMediaLink(ws, message);
        break;
      case "media_delete":
        await this.handleMediaDelete(ws, message);
        break;
      case "media_update":
        await this.handleMediaUpdate(ws, message);
        break;
      case "help_content_sync":
        await this.handleHelpContentSync(ws, message);
        break;
      case "help_content_request":
        await this.handleHelpContentRequest(ws, message);
        break;
      case "config_update":
        await this.handleConfigUpdate(ws, message);
        break;
      // Editor-Host Negotiation Protocol
      case "capabilities_request":
        await this.handleCapabilitiesRequest(ws, message);
        break;
      case "negotiate_connection":
        await this.handleNegotiateConnection(ws, message);
        break;
      case "configure_subdomain":
        await this.handleConfigureSubdomain(ws, message);
        break;
      default:
        this.log(`Unknown message type: ${message.type}`);
        ws.send(JSON.stringify({ 
          type: "error", 
          payload: { message: `Unknown message type: ${message.type}` } 
        }));
    }
  }

  private handleIdentify(ws: WebSocket, message: DevSyncMessage) {
    const client = this.clients.get(ws);
    if (!client) return;

    const componentId = message.componentId;
    client.componentId = componentId;
    this.log(`Client identified as componentId: ${componentId}`);
  }

  private async handleActivityUpdate(_ws: WebSocket, message: DevSyncMessage) {
    this.log(`Broadcasting activity update for componentId: ${message.componentId}`);
    this.broadcast({
      type: "activity_update",
      componentId: message.componentId,
      payload: message.payload,
    });
  }

  private async handleVocabularyPush(ws: WebSocket, message: DevSyncMessage) {
    try {
      const vocabItems = message.payload.vocabulary;
      if (!Array.isArray(vocabItems)) {
        ws.send(JSON.stringify({ 
          type: "error", 
          payload: { message: "vocabulary must be an array" } 
        }));
        return;
      }

      const projectId = message.payload.projectId;
      let imported = 0;

      for (const item of vocabItems) {
        await storage.createVocabulary({
          projectId: projectId || null,
          word: item.word,
          translation: item.translation,
          imageUrl: item.imageUrl || null,
          audioUrl: item.audioUrl || null,
          category: item.category || null,
          difficulty: item.difficulty || 1,
          metadata: item.metadata || null,
        });
        imported++;
      }

      this.log(`Imported ${imported} vocabulary items for project: ${projectId || "global"}`);
      ws.send(JSON.stringify({ 
        type: "vocabulary_push_result", 
        payload: { success: true, imported } 
      }));
    } catch (error) {
      this.log(`Error importing vocabulary: ${error}`);
      ws.send(JSON.stringify({ 
        type: "error", 
        payload: { message: "Failed to import vocabulary" } 
      }));
    }
  }

  private async handlePreviewRequest(ws: WebSocket, message: DevSyncMessage) {
    try {
      const { projectId, sceneId } = message.payload;
      
      this.log(`Preview request for project: ${projectId}, scene: ${sceneId}`);

      if (sceneId) {
        const states = await storage.getStatesByScene(sceneId);
        const triggers = await storage.getTriggersByScene(sceneId);
        
        ws.send(JSON.stringify({
          type: "preview_response",
          componentId: message.componentId,
          payload: {
            sceneId,
            objectStates: states,
            triggers,
          },
        }));
      } else {
        ws.send(JSON.stringify({
          type: "error",
          payload: { message: "sceneId is required for preview_request" },
        }));
      }
    } catch (error) {
      this.log(`Error handling preview request: ${error}`);
      ws.send(JSON.stringify({ 
        type: "error", 
        payload: { message: "Failed to process preview request" } 
      }));
    }
  }

  private async handleRequestActivity(ws: WebSocket, message: DevSyncMessage) {
    try {
      const { projectId } = message.payload;
      
      if (!projectId) {
        ws.send(JSON.stringify({ 
          type: "error", 
          payload: { message: "projectId is required" } 
        }));
        return;
      }

      const activity = await this.exportActivity(projectId);
      
      if (!activity) {
        ws.send(JSON.stringify({ 
          type: "error", 
          payload: { message: "Project not found" } 
        }));
        return;
      }

      ws.send(JSON.stringify({
        type: "activity_definition",
        componentId: message.componentId,
        payload: activity,
      }));

      this.log(`Sent activity definition for project: ${projectId}`);
    } catch (error) {
      this.log(`Error exporting activity: ${error}`);
      ws.send(JSON.stringify({ 
        type: "error", 
        payload: { message: "Failed to export activity" } 
      }));
    }
  }

  private async handleMediaLibraryUpdate(ws: WebSocket, message: DevSyncMessage) {
    try {
      const { communityId, files } = message.payload;
      
      this.log(`Received media library update from community: ${communityId}, files: ${files?.length || 0}`);

      this.broadcast({
        type: "media_library_updated",
        componentId: message.componentId,
        payload: {
          communityId,
          files: files || [],
          timestamp: new Date().toISOString(),
        },
      }, ws);

      ws.send(JSON.stringify({
        type: "media_library_update_ack",
        payload: { success: true, filesReceived: files?.length || 0 },
      }));
    } catch (error) {
      this.log(`Error handling media library update: ${error}`);
      ws.send(JSON.stringify({ 
        type: "error", 
        payload: { message: "Failed to process media library update" } 
      }));
    }
  }

  private async handleDictionarySync(ws: WebSocket, message: DevSyncMessage) {
    try {
      const { communityId, dictionaryId, entries, projectId } = message.payload;
      
      this.log(`Dictionary sync request: community=${communityId}, dictionary=${dictionaryId}, entries=${entries?.length || 0}`);

      if (!entries || !Array.isArray(entries)) {
        ws.send(JSON.stringify({
          type: "error",
          payload: { message: "entries must be an array" },
        }));
        return;
      }

      let synced = 0;
      for (const entry of entries) {
        await storage.createVocabulary({
          projectId: projectId || null,
          word: entry.word,
          translation: entry.translation,
          imageUrl: entry.imageUrl || null,
          audioUrl: entry.audioUrl || null,
          category: entry.category || null,
          difficulty: entry.difficulty || 1,
          metadata: {
            nacaCommunityId: communityId,
            nacaDictionaryId: dictionaryId,
            nacaEntryId: entry.id,
          },
        });
        synced++;
      }

      this.log(`Synced ${synced} dictionary entries from NACA`);
      
      ws.send(JSON.stringify({
        type: "dictionary_sync_result",
        payload: {
          success: true,
          synced,
          communityId,
          dictionaryId,
        },
      }));

      this.broadcast({
        type: "vocabulary_updated",
        componentId: message.componentId,
        payload: { projectId, synced },
      }, ws);
    } catch (error) {
      this.log(`Error syncing dictionary: ${error}`);
      ws.send(JSON.stringify({ 
        type: "error", 
        payload: { message: "Failed to sync dictionary" } 
      }));
    }
  }

  // Config update handler - allows host to update editor configuration dynamically
  private async handleConfigUpdate(ws: WebSocket, message: DevSyncMessage) {
    try {
      const { baseUrl, communityId, features } = message.payload;
      
      this.log(`Config update received: baseUrl=${baseUrl}, communityId=${communityId}, features=${features?.join(',')}`);
      
      // Broadcast to all clients so they can update their configuration
      this.broadcast({
        type: "config_update",
        componentId: message.componentId,
        payload: {
          baseUrl,
          communityId,
          features: features || [],
          timestamp: new Date().toISOString(),
        },
      });

      ws.send(JSON.stringify({
        type: "config_update_ack",
        payload: { success: true },
      }));
    } catch (error) {
      this.log(`Error handling config update: ${error}`);
      ws.send(JSON.stringify({
        type: "error",
        payload: { message: "Failed to process config update" },
      }));
    }
  }

  // ============================================================================
  // Editor-Host Negotiation Protocol Handlers
  // ============================================================================
  
  // Get the current host capabilities - this describes what the host server supports
  private getHostCapabilities(): HostCapabilities & { endpoints: Record<string, string>; baseUrl: string; websocketUrl: string } {
    // Use APP_BASE_URL for absolute URLs in capabilities
    const baseUrl = process.env.APP_BASE_URL || 'http://localhost:5000';
    const wsProtocol = baseUrl.startsWith('https') ? 'wss' : 'ws';
    const wsBaseUrl = baseUrl.replace(/^https?:/, wsProtocol + ':');
    
    return {
      version: "1.0.0",
      apiVersion: "1.0.0",
      baseUrl,  // Absolute base URL for this editor
      websocketUrl: `${wsBaseUrl}/ws/dev-sync`,  // Absolute WebSocket URL
      auth: {
        methods: ['api_key', 'session', 'none'],
        headerNames: ['Authorization', 'X-API-Key'],
        requiresAuth: false,  // This editor doesn't require auth for basic operations
      },
      subdomain: {
        extraction: 'header',  // We prefer header-based subdomain extraction
        headerNames: ['X-Community-Subdomain', 'X-Subdomain', 'X-Community-Id'],
        allowOverride: true,  // External editors can override subdomain
        defaultCommunity: undefined,
      },
      cors: {
        allowExternalOrigins: true,
        allowedOrigins: ['https://create.naca.community', 'https://naca.community'],
      },
      features: [
        'activity_sync',
        'vocabulary_push',
        'media_library',
        'dictionary_sync',
        'help_content_sync',
        'preview_request',
        'real_time_updates',
        'editor_negotiation',
      ],
      schemaVersions: {
        activity: "1.0.0",
        vocabulary: "1.0.0",
        media: "1.0.0",
      },
      endpoints: {
        capabilities: `${baseUrl}/api/activity-editor/capabilities`,
        negotiate: `${baseUrl}/api/activity-editor/negotiate`,
        configureSubdomain: `${baseUrl}/api/activity-editor/configure-subdomain`,
        communities: `${baseUrl}/api/activity-editor/communities`,
        websocket: `${wsBaseUrl}/ws/dev-sync`,
      },
    };
  }

  // Handle capability discovery request from external editor
  private async handleCapabilitiesRequest(ws: WebSocket, message: DevSyncMessage) {
    const { editorVersion, editorOrigin } = message.payload || {};
    
    this.log(`Capabilities request from editor: version=${editorVersion}, origin=${editorOrigin}`);
    
    const capabilities = this.getHostCapabilities();
    
    ws.send(JSON.stringify({
      type: "capabilities_response",
      componentId: message.componentId,
      payload: {
        success: true,
        capabilities,
        serverTime: new Date().toISOString(),
        message: "Host capabilities retrieved successfully",
      },
    }));
    
    this.log(`Sent capabilities response to editor`);
  }

  // Handle connection negotiation - editor requests to establish a configured connection
  private async handleNegotiateConnection(ws: WebSocket, message: DevSyncMessage) {
    try {
      const request = message.payload as NegotiationRequest;
      const { editorVersion, editorOrigin, requestedSubdomain, preferredAuthMethod } = request;
      
      this.log(`Negotiation request: editor=${editorVersion}, origin=${editorOrigin}, subdomain=${requestedSubdomain}`);
      
      const capabilities = this.getHostCapabilities();
      
      // Determine the best auth method
      let authMethod = 'none';
      if (preferredAuthMethod && capabilities.auth.methods.includes(preferredAuthMethod as any)) {
        authMethod = preferredAuthMethod;
      } else if (capabilities.auth.requiresAuth) {
        authMethod = capabilities.auth.methods[0];
      }
      
      // Determine subdomain configuration
      let subdomain = requestedSubdomain || '';
      if (!subdomain && capabilities.subdomain.defaultCommunity) {
        subdomain = capabilities.subdomain.defaultCommunity;
      }
      
      // Use absolute URLs from host capabilities
      const appBaseUrl = process.env.APP_BASE_URL || 'http://localhost:5000';
      const wsProtocol = appBaseUrl.startsWith('https') ? 'wss' : 'ws';
      const wsBaseUrl = appBaseUrl.replace(/^https?:/, wsProtocol + ':');
      
      const response: NegotiationResponse = {
        success: true,
        configuration: {
          subdomain,
          authMethod,
          authHeaders: {},
          baseUrl: appBaseUrl,
          websocketUrl: `${wsBaseUrl}/ws/dev-sync`,
        },
        capabilities,
      };
      
      // Store the negotiated configuration for this client
      const client = this.clients.get(ws);
      if (client) {
        (client as any).negotiatedConfig = response.configuration;
      }
      
      ws.send(JSON.stringify({
        type: "negotiate_connection_response",
        componentId: message.componentId,
        payload: response,
      }));
      
      this.log(`Negotiation successful: subdomain=${subdomain}, auth=${authMethod}`);
      
      // Broadcast that a new editor has connected
      this.broadcast({
        type: "editor_connected",
        componentId: message.componentId,
        payload: {
          editorVersion,
          editorOrigin,
          subdomain,
          timestamp: new Date().toISOString(),
        },
      }, ws);
      
    } catch (error) {
      this.log(`Error during negotiation: ${error}`);
      ws.send(JSON.stringify({
        type: "negotiate_connection_response",
        componentId: message.componentId,
        payload: {
          success: false,
          error: "Failed to negotiate connection",
          capabilities: this.getHostCapabilities(),
        } as NegotiationResponse,
      }));
    }
  }

  // Validate subdomain format: alphanumeric with dashes, max 63 chars
  private isValidSubdomain(subdomain: string): boolean {
    if (!subdomain || subdomain.length > 63) {
      return false;
    }
    // Must be alphanumeric with dashes allowed, cannot start or end with dash
    const subdomainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/;
    return subdomainRegex.test(subdomain);
  }

  // Handle subdomain configuration request
  private async handleConfigureSubdomain(ws: WebSocket, message: DevSyncMessage) {
    try {
      const { subdomain, communityId } = message.payload;
      
      this.log(`Subdomain configuration request: subdomain=${subdomain}, communityId=${communityId}`);
      
      // Validate subdomain format if provided
      if (subdomain && !this.isValidSubdomain(subdomain)) {
        ws.send(JSON.stringify({
          type: "configure_subdomain_response",
          componentId: message.componentId,
          payload: {
            success: false,
            error: "Invalid subdomain format. Must be alphanumeric with dashes allowed, max 63 characters, cannot start or end with dash.",
          },
        }));
        return;
      }
      
      // Update the client's negotiated config
      const client = this.clients.get(ws);
      if (client) {
        const config = (client as any).negotiatedConfig || {};
        config.subdomain = subdomain;
        if (communityId) {
          config.communityId = communityId;
        }
        (client as any).negotiatedConfig = config;
      }
      
      ws.send(JSON.stringify({
        type: "configure_subdomain_response",
        componentId: message.componentId,
        payload: {
          success: true,
          subdomain,
          communityId,
          message: `Subdomain configured to: ${subdomain}`,
        },
      }));
      
      // Broadcast the subdomain change to other clients
      this.broadcast({
        type: "subdomain_changed",
        componentId: message.componentId,
        payload: {
          subdomain,
          communityId,
          timestamp: new Date().toISOString(),
        },
      }, ws);
      
    } catch (error) {
      this.log(`Error configuring subdomain: ${error}`);
      ws.send(JSON.stringify({
        type: "configure_subdomain_response",
        componentId: message.componentId,
        payload: {
          success: false,
          error: "Failed to configure subdomain",
        },
      }));
    }
  }

  // ============================================================================
  // New NACA integration handlers
  // ============================================================================

  private async handleCapabilitiesUpdate(_ws: WebSocket, message: DevSyncMessage) {
    const { version, apiVersion, features, schemaHashes } = message.payload;
    
    this.log(`Received capabilities update: version=${version}, apiVersion=${apiVersion}`);
    
    // Broadcast to all clients so they can refresh their capability cache
    this.broadcast({
      type: "capabilities_update",
      componentId: message.componentId,
      payload: {
        version,
        apiVersion,
        features,
        schemaHashes,
        timestamp: new Date().toISOString(),
      },
    });
  }

  private async handleMediaUpload(ws: WebSocket, message: DevSyncMessage) {
    const { communityId, file, uploaderId } = message.payload;
    
    this.log(`Media upload event: file=${file?.filename}, community=${communityId}`);
    
    // Broadcast to all clients to refresh media library
    this.broadcast({
      type: "media_upload",
      componentId: message.componentId,
      payload: {
        communityId,
        file,
        uploaderId,
        timestamp: new Date().toISOString(),
      },
    }, ws);

    ws.send(JSON.stringify({
      type: "media_upload_ack",
      payload: { success: true, fileId: file?.id },
    }));
  }

  private async handleMediaLink(ws: WebSocket, message: DevSyncMessage) {
    const { communityId, fileId, linkedTo, linkedBy } = message.payload;
    
    this.log(`Media link event: fileId=${fileId}, linkedTo=${linkedTo}`);
    
    // Broadcast to clients tracking this community/media
    this.broadcast({
      type: "media_link",
      componentId: message.componentId,
      payload: {
        communityId,
        fileId,
        linkedTo,
        linkedBy,
        timestamp: new Date().toISOString(),
      },
    }, ws);

    ws.send(JSON.stringify({
      type: "media_link_ack",
      payload: { success: true },
    }));
  }

  private async handleMediaDelete(ws: WebSocket, message: DevSyncMessage) {
    const { communityId, fileId, deletedBy } = message.payload;
    
    this.log(`Media delete event: fileId=${fileId}, community=${communityId}`);
    
    // Broadcast to all clients to remove from media library cache
    this.broadcast({
      type: "media_delete",
      componentId: message.componentId,
      payload: {
        communityId,
        fileId,
        deletedBy,
        timestamp: new Date().toISOString(),
      },
    }, ws);

    ws.send(JSON.stringify({
      type: "media_delete_ack",
      payload: { success: true },
    }));
  }

  private async handleMediaUpdate(ws: WebSocket, message: DevSyncMessage) {
    const { communityId, fileId, updates, updatedBy } = message.payload;
    
    this.log(`Media update event: fileId=${fileId}, community=${communityId}`);
    
    // Broadcast to clients so they can update cached media metadata
    this.broadcast({
      type: "media_update",
      componentId: message.componentId,
      payload: {
        communityId,
        fileId,
        updates,
        updatedBy,
        timestamp: new Date().toISOString(),
      },
    }, ws);

    ws.send(JSON.stringify({
      type: "media_update_ack",
      payload: { success: true },
    }));
  }

  // Help content sync handlers for host application integration
  private async handleHelpContentSync(ws: WebSocket, message: DevSyncMessage) {
    try {
      const { source, items } = message.payload;
      
      if (!items || !Array.isArray(items)) {
        ws.send(JSON.stringify({
          type: "error",
          payload: { message: "items must be an array" },
        }));
        return;
      }

      let imported = 0;
      let updated = 0;
      let skipped = 0;

      for (const item of items) {
        if (!item.featureKey || !item.title || !item.description || !item.category) {
          skipped++;
          continue;
        }

        // Check if help item exists by featureKey
        const existing = await storage.getFeatureHelpByKey(item.featureKey);
        
        if (existing) {
          // Update existing item
          await storage.updateFeatureHelp(existing.id, {
            title: item.title,
            description: item.description,
            videoUrl: item.videoUrl || existing.videoUrl,
            thumbnailUrl: item.thumbnailUrl || existing.thumbnailUrl,
            category: item.category,
            shortcutKey: item.shortcutKey,
            relatedFeatures: item.relatedFeatures,
            order: item.order,
            isNew: item.isNew ?? existing.isNew,
          });
          updated++;
        } else {
          // Create new item
          await storage.createFeatureHelp({
            featureKey: item.featureKey,
            title: item.title,
            description: item.description,
            videoUrl: item.videoUrl || null,
            thumbnailUrl: item.thumbnailUrl || null,
            category: item.category,
            shortcutKey: item.shortcutKey || null,
            relatedFeatures: item.relatedFeatures || [],
            order: item.order ?? 0,
            isNew: item.isNew ?? true,
          });
          imported++;
        }
      }

      this.log(`Help content sync from ${source || 'unknown'}: ${imported} imported, ${updated} updated, ${skipped} skipped`);
      
      ws.send(JSON.stringify({
        type: "help_content_sync_result",
        payload: {
          success: true,
          source: source || "unknown",
          imported,
          updated,
          skipped,
          timestamp: new Date().toISOString(),
        },
      }));

      // Broadcast to other clients that help content has changed
      this.broadcast({
        type: "help_content_updated",
        componentId: message.componentId,
        payload: {
          source: source || "unknown",
          itemsChanged: imported + updated,
          timestamp: new Date().toISOString(),
        },
      }, ws);
    } catch (error) {
      this.log(`Error syncing help content: ${error}`);
      ws.send(JSON.stringify({
        type: "error",
        payload: { message: "Failed to sync help content" },
      }));
    }
  }

  private async handleHelpContentRequest(ws: WebSocket, message: DevSyncMessage) {
    try {
      const { category, featureKey } = message.payload || {};
      
      let helpItems;
      
      if (featureKey) {
        // Request for specific feature
        const item = await storage.getFeatureHelpByKey(featureKey);
        helpItems = item ? [item] : [];
      } else if (category) {
        // Request for a category
        const allItems = await storage.getAllFeatureHelp();
        helpItems = allItems.filter(item => item.category === category);
      } else {
        // Request all help items
        helpItems = await storage.getAllFeatureHelp();
      }

      const exportData = {
        exportedAt: new Date().toISOString(),
        version: "1.0",
        source: "indigamate-studio",
        items: helpItems.map(item => ({
          featureKey: item.featureKey,
          title: item.title,
          description: item.description,
          videoUrl: item.videoUrl,
          thumbnailUrl: item.thumbnailUrl,
          category: item.category,
          shortcutKey: item.shortcutKey,
          relatedFeatures: item.relatedFeatures,
          order: item.order,
          isNew: item.isNew,
        })),
      };

      this.log(`Help content request: returning ${helpItems.length} items`);
      
      ws.send(JSON.stringify({
        type: "help_content_response",
        componentId: message.componentId,
        payload: exportData,
      }));
    } catch (error) {
      this.log(`Error handling help content request: ${error}`);
      ws.send(JSON.stringify({
        type: "error",
        payload: { message: "Failed to fetch help content" },
      }));
    }
  }

  // Method to broadcast help content updates (can be called from routes)
  broadcastHelpContentUpdate(source: string, itemsChanged: number) {
    this.broadcast({
      type: "help_content_updated",
      componentId: "system",
      payload: {
        source,
        itemsChanged,
        timestamp: new Date().toISOString(),
      },
    });
  }

  // Send preview_ready notification to host when preview is loaded
  // Per Host Agent Communication Protocol section 4
  sendPreviewReady(componentId: string, sceneId: string, ready: boolean = true) {
    this.broadcast({
      type: "preview_ready",
      componentId,
      payload: {
        sceneId,
        ready,
        timestamp: new Date().toISOString(),
      },
    });
    this.log(`Preview ready notification sent: componentId=${componentId}, sceneId=${sceneId}`);
  }

  // Request media asset from host application
  // Per Host Agent Communication Protocol section 4
  sendMediaRequest(componentId: string, communityId: string, mediaId: string, type: 'audio' | 'image' | 'video') {
    this.broadcast({
      type: "media_request",
      componentId,
      payload: {
        communityId,
        mediaId,
        type,
        timestamp: new Date().toISOString(),
      },
    });
    this.log(`Media request sent: communityId=${communityId}, mediaId=${mediaId}, type=${type}`);
  }

  // Send activity_update to host (export and notify)
  async sendActivityUpdate(projectId: string) {
    const activity = await this.exportActivity(projectId);
    if (activity) {
      this.broadcast({
        type: "activity_update",
        componentId: projectId,
        payload: activity,
      });
      this.log(`Activity update broadcast: projectId=${projectId}`);
    }
  }

  async exportActivity(projectId: string): Promise<ActivityDefinition | null> {
    const project = await storage.getProject(projectId);
    if (!project) {
      return null;
    }

    const screens = await storage.getScreensByProject(projectId);
    const activityScreens: ActivityScreen[] = [];

    for (const screen of screens) {
      const objects = await storage.getObjectsByScreen(screen.id);
      const scenesData = await storage.getScenesByScreen(screen.id);

      const activityObjects: ActivityObject[] = objects.map((obj) => ({
        id: obj.id,
        customId: obj.customId,
        classes: obj.classes || [],
        tags: obj.tags || [],
        figmaNodeId: obj.figmaNodeId,
        type: obj.type,
        name: obj.name,
        bounds: {
          x: obj.x,
          y: obj.y,
          width: obj.width,
          height: obj.height,
        },
        zIndex: obj.zIndex ?? 0,
        dataKey: obj.dataKey,
        mediaUrl: obj.mediaUrl,
        audioUrl: obj.audioUrl,
        rotation: obj.rotation ?? 0,
        scaleX: obj.scaleX ?? 1,
        scaleY: obj.scaleY ?? 1,
        opacity: obj.opacity ?? 1,
        visible: obj.visible ?? true,
        metadata: obj.metadata as Record<string, unknown> | null,
      }));

      const activityScenes: ActivityScene[] = [];
      for (const scene of scenesData) {
        const states = await storage.getStatesByScene(scene.id);
        const triggers = await storage.getTriggersByScene(scene.id);

        activityScenes.push({
          id: scene.id,
          name: scene.name,
          isDefault: scene.isDefault ?? false,
          order: scene.order,
          objectStates: states.map((state) => ({
            id: state.id,
            objectId: state.objectId,
            x: state.x,
            y: state.y,
            rotation: state.rotation,
            scaleX: state.scaleX,
            scaleY: state.scaleY,
            opacity: state.opacity,
            visible: state.visible,
            animationDuration: state.animationDuration,
            animationEase: state.animationEase,
          })),
          triggers: triggers.map((trigger) => ({
            id: trigger.id,
            objectId: trigger.objectId,
            type: trigger.type,
            targetSceneId: trigger.targetSceneId,
            delay: trigger.delay,
            condition: trigger.condition,
          })),
        });
      }

      activityScreens.push({
        id: screen.id,
        title: screen.title,
        figmaFrameId: screen.figmaFrameId,
        imageUrl: screen.imageUrl,
        width: screen.width,
        height: screen.height,
        objects: activityObjects,
        scenes: activityScenes,
      });
    }

    const vocabularyData = await storage.getAllVocabulary();
    const projectVocabulary = vocabularyData.filter(v => v.projectId === projectId);
    
    const activityVocabulary: ActivityVocabularyEntry[] = projectVocabulary.map((v) => ({
      id: v.id,
      word: v.word,
      translation: v.translation,
      imageUrl: v.imageUrl,
      audioUrl: v.audioUrl,
      category: v.category,
    }));

    return {
      id: project.id,
      componentId: project.id,
      version: "1.0.0",
      screens: activityScreens,
      vocabulary: activityVocabulary,
    };
  }

  broadcast(message: DevSyncMessage, excludeWs?: WebSocket) {
    const messageStr = JSON.stringify(message);
    let sentCount = 0;

    this.clients.forEach((client, ws) => {
      if (ws !== excludeWs && ws.readyState === WebSocket.OPEN) {
        ws.send(messageStr);
        sentCount++;
      }
    });

    this.log(`Broadcast message type: ${message.type} to ${sentCount} clients`);
  }

  private broadcastClientCount() {
    const count = this.clients.size;
    const message = JSON.stringify({ type: "client_count", payload: { count } });
    
    this.clients.forEach((client, ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(message);
      }
    });

    this.log(`Broadcast client count: ${count}`);
  }

  broadcastActivityUpdate(projectId: string, payload: any) {
    this.broadcast({
      type: "activity_update",
      componentId: projectId,
      payload,
    });
  }

  getClientCount(): number {
    return this.clients.size;
  }

  getConnectedComponentIds(): string[] {
    return Array.from(this.clients.values())
      .map((client) => client.componentId)
      .filter((id): id is string => id !== null);
  }
}

export const devSyncService = new DevSyncService();
export { DevSyncService, ActivityDefinition };
