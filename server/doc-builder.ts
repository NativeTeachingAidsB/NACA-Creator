import { storage } from "./storage";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

// Use process.cwd() for paths that work in both development and bundled production
const projectRoot = process.cwd();

// Check if running in production (source files may not be present)
const isProduction = process.env.NODE_ENV === 'production';

// Helper to check if source files exist for documentation generation
function sourceFilesExist(): boolean {
  const routesPath = path.resolve(projectRoot, 'server', 'routes.ts');
  const schemaPath = path.resolve(projectRoot, 'shared', 'schema.ts');
  return fs.existsSync(routesPath) && fs.existsSync(schemaPath);
}

interface EndpointInfo {
  id: string;
  path: string;
  method: string;
  description: string;
  category: string;
  requestSchema?: Record<string, unknown>;
  responseSchema?: Record<string, unknown>;
  samples?: {
    request?: Record<string, unknown>;
    response?: Record<string, unknown>;
  };
  parameters?: Array<{
    name: string;
    in: 'path' | 'query' | 'body';
    type: string;
    required: boolean;
    description?: string;
  }>;
}

interface SchemaInfo {
  name: string;
  fields: Array<{
    name: string;
    type: string;
    required: boolean;
    description?: string;
  }>;
}

interface WebSocketTopic {
  name: string;
  direction: 'inbound' | 'outbound' | 'bidirectional';
  description: string;
  payloadSchema?: Record<string, unknown>;
}

interface ApiDocPayload {
  apiVersion: string;
  generatedAt: string;
  schemaHash: string;
  endpoints: EndpointInfo[];
  schemas: Record<string, SchemaInfo>;
  sharedComponents?: Record<string, {
    name: string;
    description: string;
    props?: Record<string, unknown>;
    usage?: string;
  }>;
  websocketTopics?: WebSocketTopic[];
  nacaProtocol?: {
    title: string;
    description: string;
    details?: string[];
    examples?: Array<{
      title: string;
      code: string;
      language?: string;
    }>;
  }[];
  integrationGuide?: {
    quickStart: string[];
    authenticationFlow: string;
    syncPattern: string[];
    errorRecovery: Record<string, string>;
    baseUrls: Record<string, { rest: string; ws?: string }>;
    featureFlags: Array<{ feature: string; description: string; default: string }>;
  };
}

// ========================================
// LIVE ROUTE PARSER - parses actual routes.ts file
// ========================================

interface ParsedRoute {
  method: string;
  path: string;
  lineNumber: number;
  comment?: string;
}

function parseRoutesFile(): { routes: ParsedRoute[]; fileHash: string } {
  const routesPath = path.resolve(projectRoot, 'server', 'routes.ts');
  const content = fs.readFileSync(routesPath, 'utf-8');
  
  // Generate hash from the actual file content
  const fileHash = crypto.createHash('md5').update(content).digest('hex').substring(0, 8);
  
  const routes: ParsedRoute[] = [];
  const lines = content.split('\n');
  
  // Regex to match Express route definitions: app.get, app.post, app.patch, app.delete, app.put, app.all
  const routeRegex = /app\.(get|post|patch|delete|put|all)\s*\(\s*["'`]([^"'`]+)["'`]/i;
  
  // Look for comment lines before route definitions
  let pendingComment = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;
    
    // Check for section comments like "// ==================== Projects ===================="
    const sectionMatch = line.match(/\/\/\s*=+\s*([^=]+?)\s*=+/);
    if (sectionMatch) {
      pendingComment = sectionMatch[1].trim();
      continue;
    }
    
    // Check for regular comments
    const commentMatch = line.match(/\/\/\s*(.+)/);
    if (commentMatch && !line.includes('app.')) {
      pendingComment = commentMatch[1].trim();
      continue;
    }
    
    // Check for route definition
    const routeMatch = line.match(routeRegex);
    if (routeMatch) {
      routes.push({
        method: routeMatch[1].toUpperCase(),
        path: routeMatch[2],
        lineNumber,
        comment: pendingComment || undefined
      });
      pendingComment = '';
    }
  }
  
  return { routes, fileHash };
}

function categorizeRoute(path: string, comment?: string): string {
  // Use comment if it looks like a category
  if (comment) {
    const normalized = comment.toLowerCase();
    if (normalized.includes('project')) return 'Projects';
    if (normalized.includes('screen')) return 'Screens';
    if (normalized.includes('object') && !normalized.includes('state')) return 'Game Objects';
    if (normalized.includes('scene')) return 'Scenes';
    if (normalized.includes('state')) return 'Object States';
    if (normalized.includes('trigger')) return 'Triggers';
    if (normalized.includes('vocabulary') || normalized.includes('vocab')) return 'Vocabulary';
    if (normalized.includes('animation') || normalized.includes('anim')) return 'Animations';
    if (normalized.includes('keyframe')) return 'Keyframes';
    if (normalized.includes('figma')) return 'Figma';
    if (normalized.includes('export') || normalized.includes('import') || normalized.includes('activity')) return 'Activity';
    if (normalized.includes('help') || normalized.includes('feature')) return 'Help System';
    if (normalized.includes('devsync') || normalized.includes('websocket')) return 'DevSync';
    if (normalized.includes('naca')) return 'NACA Integration';
    if (normalized.includes('media')) return 'Media';
    if (normalized.includes('settings')) return 'Settings';
    if (normalized.includes('doc')) return 'API Documentation';
  }
  
  // Infer from path
  if (path.includes('/projects')) return 'Projects';
  if (path.includes('/screens')) return 'Screens';
  if (path.includes('/objects')) return 'Game Objects';
  if (path.includes('/scenes')) return 'Scenes';
  if (path.includes('/states')) return 'Object States';
  if (path.includes('/triggers')) return 'Triggers';
  if (path.includes('/vocabulary')) return 'Vocabulary';
  if (path.includes('/animations') || path.includes('/animat')) return 'Animations';
  if (path.includes('/keyframes')) return 'Keyframes';
  if (path.includes('/figma')) return 'Figma';
  if (path.includes('/export') || path.includes('/import')) return 'Activity';
  if (path.includes('/feature-help') || path.includes('/help')) return 'Help System';
  if (path.includes('/devsync')) return 'DevSync';
  if (path.includes('/naca') || path.includes('/communities') || path.includes('/dictionaries')) return 'NACA Integration';
  if (path.includes('/media')) return 'Media';
  if (path.includes('/settings')) return 'Settings';
  if (path.includes('/docs')) return 'API Documentation';
  if (path.includes('/activity-editor')) return 'Activity Editor';
  if (path.includes('/video')) return 'Video';
  if (path.includes('/timeline')) return 'Timeline';
  
  return 'Other';
}

function extractPathParams(path: string): Array<{ name: string; in: 'path'; type: string; required: boolean }> {
  const params: Array<{ name: string; in: 'path'; type: string; required: boolean }> = [];
  const matches = path.match(/:([a-zA-Z_][a-zA-Z0-9_]*)/g);
  
  if (matches) {
    for (const match of matches) {
      params.push({
        name: match.substring(1), // Remove the colon
        in: 'path',
        type: 'string',
        required: true
      });
    }
  }
  
  return params;
}

function generateRouteId(method: string, path: string): string {
  // Convert path to a readable ID
  const pathPart = path
    .replace(/^\/api\//, '')
    .replace(/:[a-zA-Z_][a-zA-Z0-9_]*/g, 'by_id')
    .replace(/\//g, '_')
    .replace(/-/g, '_')
    .replace(/\*/g, 'wildcard')
    .toLowerCase();
  
  return `${method.toLowerCase()}_${pathPart}`;
}

function generateDescription(method: string, path: string, category: string): string {
  const resource = category.toLowerCase().replace(/ /g, ' ');
  
  switch (method) {
    case 'GET':
      if (path.includes(':')) {
        return `Get a specific ${resource.slice(0, -1)} by ID`;
      }
      return `Get all ${resource}`;
    case 'POST':
      if (path.includes('sync')) return `Sync ${resource}`;
      if (path.includes('parse')) return `Parse ${resource}`;
      if (path.includes('rebuild')) return `Rebuild ${resource}`;
      if (path.includes('publish')) return `Publish ${resource}`;
      if (path.includes('configure')) return `Configure ${resource}`;
      return `Create a new ${resource.slice(0, -1)}`;
    case 'PATCH':
      if (path.includes('batch')) return `Batch update ${resource}`;
      return `Update a ${resource.slice(0, -1)}`;
    case 'PUT':
      return `Replace a ${resource.slice(0, -1)}`;
    case 'DELETE':
      return `Delete a ${resource.slice(0, -1)}`;
    case 'ALL':
      return `Handle all methods for ${resource}`;
    default:
      return `${method} ${path}`;
  }
}

function buildEndpointsFromParsedRoutes(parsedRoutes: ParsedRoute[]): EndpointInfo[] {
  return parsedRoutes.map(route => {
    const category = categorizeRoute(route.path, route.comment);
    const parameters = extractPathParams(route.path);
    
    const endpoint: EndpointInfo = {
      id: generateRouteId(route.method, route.path),
      path: route.path,
      method: route.method,
      description: route.comment || generateDescription(route.method, route.path, category),
      category
    };
    
    if (parameters.length > 0) {
      endpoint.parameters = parameters;
    }
    
    return endpoint;
  });
}

// ========================================
// SCHEMA PARSER - parses shared/schema.ts
// ========================================

interface ParsedField {
  name: string;
  type: string;
  required: boolean;
  description?: string;
}

interface ParsedSchema {
  name: string;
  fields: ParsedField[];
}

function parseSchemaFile(): { schemas: Record<string, ParsedSchema>; schemaHash: string } {
  const schemaPath = path.resolve(projectRoot, 'shared', 'schema.ts');
  const content = fs.readFileSync(schemaPath, 'utf-8');
  
  const schemaHash = crypto.createHash('md5').update(content).digest('hex').substring(0, 8);
  const schemas: Record<string, ParsedSchema> = {};
  
  // Match table definitions: export const tableName = pgTable("table_name", { ... })
  // Note: Using [^}]+ to match fields block - works for single-level braces
  const tableRegex = /export\s+const\s+(\w+)\s*=\s*pgTable\s*\(\s*["'`](\w+)["'`]\s*,\s*\{([^}]+)\}/g;
  
  let match;
  while ((match = tableRegex.exec(content)) !== null) {
    const varName = match[1];
    const tableName = match[2];
    const fieldsBlock = match[3];
    
    // Parse individual fields
    const fields: ParsedField[] = [];
    const fieldRegex = /(\w+)\s*:\s*([\w.()]+(?:\([^)]*\))?(?:\.[\w()]+)*)/g;
    
    let fieldMatch;
    while ((fieldMatch = fieldRegex.exec(fieldsBlock)) !== null) {
      const fieldName = fieldMatch[1];
      const fieldDef = fieldMatch[2];
      
      // Determine type from Drizzle definition
      let type = 'unknown';
      let required = true;
      
      if (fieldDef.includes('uuid(') || fieldDef.includes('varchar(') || fieldDef.includes('text(')) {
        type = 'string';
      } else if (fieldDef.includes('integer(') || fieldDef.includes('serial(') || fieldDef.includes('real(')) {
        type = 'number';
      } else if (fieldDef.includes('boolean(')) {
        type = 'boolean';
      } else if (fieldDef.includes('timestamp(') || fieldDef.includes('date(')) {
        type = 'datetime';
      } else if (fieldDef.includes('jsonb(') || fieldDef.includes('json(')) {
        type = 'object';
      }
      
      // Check if field is optional (has .default() or allows null)
      if (fieldDef.includes('.default(') || fieldDef.includes('.notNull()') === false) {
        required = !fieldDef.includes('.default(') && !fieldDef.includes('.$defaultFn');
      }
      
      // Handle arrays
      if (fieldDef.includes('.array()')) {
        type = `${type}[]`;
      }
      
      fields.push({
        name: fieldName,
        type,
        required: fieldDef.includes('.notNull()') || fieldDef.includes('.primaryKey()')
      });
    }
    
    // Convert varName to PascalCase schema name
    const schemaName = varName.charAt(0).toUpperCase() + varName.slice(1).replace(/s$/, '');
    
    schemas[schemaName] = {
      name: schemaName,
      fields
    };
  }
  
  return { schemas, schemaHash };
}

// ========================================
// NACA COMMUNICATION PROTOCOL DOCUMENTATION
// ========================================

interface ProtocolSection {
  title: string;
  description: string;
  details?: string[];
  examples?: Array<{
    title: string;
    code: string;
    language?: string;
  }>;
}

const NACA_PROTOCOL: ProtocolSection[] = [
  {
    title: "Authentication",
    description: "The Activity Editor supports dual-mode authentication for flexible integration with NACA hosts.",
    details: [
      "**Session-based Auth**: Traditional cookie-based sessions via `/api/login` (Replit OAuth). Used when Activity Editor is accessed directly.",
      "**Token-based Auth (JWT)**: Bearer token authentication via `Authorization: Bearer <token>` header. Used when embedded as iframe or accessed cross-origin.",
      "**API Key Auth**: NACA API key authentication for server-to-server communication. Pass via `Authorization: Bearer <api-key>` or `X-API-Key: <api-key>` header.",
      "API keys can be configured via the Settings panel or set as the `NACA_API_KEY` environment variable."
    ],
    examples: [
      {
        title: "JWT Authentication",
        code: `fetch('https://create.naca.community/api/projects', {
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    'Content-Type': 'application/json'
  }
})`,
        language: "javascript"
      },
      {
        title: "API Key Authentication",
        code: `fetch('https://create.naca.community/api/activity-editor/capabilities', {
  headers: {
    'X-API-Key': 'naca_key_xxxxx',
    'Content-Type': 'application/json'
  }
})`,
        language: "javascript"
      }
    ]
  },
  {
    title: "Rate Limiting",
    description: "Token bucket algorithm implementation to prevent API abuse while allowing burst traffic.",
    details: [
      "**Limit**: 60 requests per minute per IP/API key",
      "**Burst**: Up to 10 requests can be made simultaneously",
      "**Queue**: Requests exceeding limits are automatically queued (max 100 pending)",
      "**Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` included in responses",
      "**429 Response**: Returned when limits exceeded with `Retry-After` header"
    ],
    examples: [
      {
        title: "Rate Limit Response",
        code: `{
  "error": "Rate limit exceeded",
  "retryAfter": 5,
  "limit": 60,
  "remaining": 0,
  "reset": "2024-01-15T10:00:05Z"
}`,
        language: "json"
      }
    ]
  },
  {
    title: "Error Handling",
    description: "Consistent error response format across all endpoints for reliable integration.",
    details: [
      "**400 Bad Request**: Invalid request body or parameters. Check the `errors` array for field-specific issues.",
      "**401 Unauthorized**: Missing or invalid authentication. Refresh token or re-authenticate.",
      "**403 Forbidden**: Valid auth but insufficient permissions for this resource.",
      "**404 Not Found**: Resource doesn't exist. Check the ID and endpoint path.",
      "**409 Conflict**: Resource conflict (e.g., duplicate name). Modify request and retry.",
      "**429 Too Many Requests**: Rate limited. Wait for `Retry-After` seconds.",
      "**500 Internal Server Error**: Server-side issue. Retry with exponential backoff."
    ],
    examples: [
      {
        title: "Validation Error Response",
        code: `{
  "error": "Validation failed",
  "errors": [
    { "field": "name", "message": "Name is required" },
    { "field": "screenId", "message": "Invalid screen ID format" }
  ]
}`,
        language: "json"
      }
    ]
  },
  {
    title: "CORS Configuration",
    description: "Cross-origin requests are allowed from authorized NACA domains.",
    details: [
      "**Allowed Origins**: `https://create.naca.community`, `https://api.create.naca.community`, `https://naca.community`, `https://*.naca.community`",
      "**Allowed Methods**: GET, POST, PATCH, PUT, DELETE, OPTIONS",
      "**Allowed Headers**: Authorization, Content-Type, X-API-Key, X-Community-Id, X-Subdomain",
      "**Credentials**: Supported for session-based auth (cookies)",
      "**Preflight Cache**: OPTIONS requests cached for 86400 seconds (24 hours)"
    ]
  },
  {
    title: "Server Environment",
    description: "The Activity Editor can connect to different NACA server environments.",
    details: [
      "**Production** (default): `https://naca.community` - Live community data",
      "**Development**: `https://native-tongue-lexicon.replit.app` - Testing environment",
      "Environment can be switched via Settings dropdown in the UI",
      "Server URL can be locked via `NACA_API_URL` environment variable",
      "The `APP_BASE_URL` environment variable determines the base URL for absolute URLs in API responses"
    ]
  }
];

// ========================================
// WEBSOCKET TOPICS - comprehensive DevSync documentation
// ========================================

const WEBSOCKET_TOPICS: WebSocketTopic[] = [
  // Outbound topics (Activity Editor -> NACA)
  {
    name: "activity_update",
    direction: "outbound",
    description: "Push activity changes to NACA in real-time. Sent automatically when objects, scenes, or triggers are modified.",
    payloadSchema: {
      type: "object",
      properties: {
        componentId: { type: "string", description: "Unique activity component ID" },
        version: { type: "string", description: "Activity version (semantic versioning)" },
        timestamp: { type: "string", format: "ISO8601", description: "When the update occurred" },
        payload: {
          type: "object",
          description: "ActivityDefinition object with screens, objects, scenes, triggers"
        }
      },
      required: ["componentId", "payload"]
    }
  },
  {
    name: "request_activity",
    direction: "outbound",
    description: "Request the full activity definition from NACA. Used for initial sync or recovery.",
    payloadSchema: {
      type: "object",
      properties: {
        componentId: { type: "string", description: "Activity component ID to request" },
        includeMedia: { type: "boolean", description: "Whether to include media URLs", default: true }
      },
      required: ["componentId"]
    }
  },
  {
    name: "vocabulary_push",
    direction: "outbound",
    description: "Push vocabulary entries created in the editor to NACA dictionary.",
    payloadSchema: {
      type: "object",
      properties: {
        dictionaryId: { type: "string", description: "Target dictionary ID" },
        entries: {
          type: "array",
          items: {
            type: "object",
            properties: {
              indigenousWord: { type: "string" },
              englishTranslation: { type: "string" },
              audioUrl: { type: "string", optional: true },
              imageUrl: { type: "string", optional: true }
            }
          }
        }
      },
      required: ["dictionaryId", "entries"]
    }
  },
  {
    name: "preview_request",
    direction: "outbound",
    description: "Request NACA to open a preview of the current activity state.",
    payloadSchema: {
      type: "object",
      properties: {
        componentId: { type: "string" },
        mode: { type: "string", enum: ["standalone", "embedded"], default: "standalone" }
      },
      required: ["componentId"]
    }
  },
  // Inbound topics (NACA -> Activity Editor)
  {
    name: "activityDiff",
    direction: "inbound",
    description: "Receive incremental activity changes from NACA. Apply these diffs to maintain sync.",
    payloadSchema: {
      type: "object",
      properties: {
        activityId: { type: "string", description: "Activity being updated" },
        version: { type: "string", description: "New version after applying diff" },
        changes: {
          type: "object",
          description: "JSON Patch format (RFC 6902) array of operations",
          properties: {
            op: { type: "string", enum: ["add", "remove", "replace", "move", "copy"] },
            path: { type: "string", description: "JSON Pointer to target location" },
            value: { type: "any", description: "New value (for add/replace)" }
          }
        },
        timestamp: { type: "string", format: "ISO8601" }
      },
      required: ["activityId", "changes"]
    }
  },
  {
    name: "mediaUpload",
    direction: "inbound",
    description: "Notification when new media is uploaded to NACA. Activity Editor can then reference this media.",
    payloadSchema: {
      type: "object",
      properties: {
        mediaId: { type: "string", description: "Unique media identifier" },
        url: { type: "string", description: "CDN URL for the media file" },
        type: { type: "string", enum: ["image", "audio", "video"], description: "Media type" },
        filename: { type: "string", description: "Original filename" },
        size: { type: "number", description: "File size in bytes" },
        communityId: { type: "string", description: "Owning community" }
      },
      required: ["mediaId", "url", "type"]
    }
  },
  {
    name: "mediaLink",
    direction: "inbound",
    description: "Media has been linked to a dictionary entry in NACA. Update vocabulary bindings.",
    payloadSchema: {
      type: "object",
      properties: {
        mediaId: { type: "string" },
        entryId: { type: "string", description: "Dictionary entry ID" },
        mediaType: { type: "string", enum: ["image", "audio"] },
        dictionaryId: { type: "string" }
      },
      required: ["mediaId", "entryId"]
    }
  },
  {
    name: "mediaDelete",
    direction: "inbound",
    description: "Media has been deleted from NACA. Remove references from activity.",
    payloadSchema: {
      type: "object",
      properties: {
        mediaId: { type: "string" },
        reason: { type: "string", optional: true }
      },
      required: ["mediaId"]
    }
  },
  {
    name: "vocabularySync",
    direction: "inbound",
    description: "Full vocabulary sync from NACA dictionary. Replace local cache with this data.",
    payloadSchema: {
      type: "object",
      properties: {
        communityId: { type: "string" },
        dictionaryId: { type: "string" },
        entries: {
          type: "array",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              indigenousWord: { type: "string" },
              englishTranslation: { type: "string" },
              audioUrl: { type: "string", optional: true },
              imageUrl: { type: "string", optional: true },
              categories: { type: "array", items: { type: "string" } }
            }
          }
        },
        totalCount: { type: "number" }
      },
      required: ["communityId", "dictionaryId", "entries"]
    }
  },
  {
    name: "capabilitiesUpdate",
    direction: "inbound",
    description: "NACA host capabilities have changed. Re-negotiate features and update UI accordingly.",
    payloadSchema: {
      type: "object",
      properties: {
        version: { type: "string", description: "Capabilities version" },
        features: {
          type: "array",
          items: { type: "string" },
          description: "List of enabled features: mediaSearch, dropboxIntegration, realTimeSync, activityFolders"
        },
        authMethods: {
          type: "array",
          items: { type: "string", enum: ["session", "jwt", "apiKey"] }
        },
        subdomainHandling: { type: "string", enum: ["path", "subdomain", "header"] }
      },
      required: ["version", "features"]
    }
  },
  // Bidirectional topics
  {
    name: "ping",
    direction: "bidirectional",
    description: "Heartbeat to maintain connection. Both sides should respond with pong.",
    payloadSchema: {
      type: "object",
      properties: {
        timestamp: { type: "number", description: "Unix timestamp in milliseconds" }
      }
    }
  },
  {
    name: "sync_status",
    direction: "bidirectional",
    description: "Exchange synchronization status. Used to detect and resolve conflicts.",
    payloadSchema: {
      type: "object",
      properties: {
        activityId: { type: "string" },
        localVersion: { type: "string" },
        lastSyncAt: { type: "string", format: "ISO8601" },
        pendingChanges: { type: "number" },
        status: { type: "string", enum: ["synced", "pending", "conflict", "offline"] }
      }
    }
  }
];

// ========================================
// ENDPOINT ENHANCEMENTS - detailed documentation for key endpoints
// ========================================

interface EndpointEnhancement {
  pathPattern: string;
  method: string;
  description: string;
  requestSchema?: Record<string, unknown>;
  responseSchema?: Record<string, unknown>;
  samples?: {
    request?: Record<string, unknown>;
    response?: Record<string, unknown>;
  };
}

const ENDPOINT_ENHANCEMENTS: EndpointEnhancement[] = [
  // Activity Editor Capabilities
  {
    pathPattern: "/api/activity-editor/capabilities",
    method: "GET",
    description: "Get Activity Editor capabilities for NACA host negotiation. Returns supported features, auth methods, and API version.",
    responseSchema: {
      type: "object",
      properties: {
        apiVersion: { type: "string" },
        features: { type: "array", items: { type: "string" } },
        authMethods: { type: "array", items: { type: "string" } },
        endpoints: { type: "object" },
        websocket: { type: "object" }
      }
    },
    samples: {
      response: {
        apiVersion: "1.0.0",
        features: ["figmaSync", "vocabularyBinding", "animationTimeline", "realTimeSync", "mediaLibrary"],
        authMethods: ["session", "jwt", "apiKey"],
        endpoints: {
          projects: "/api/projects",
          screens: "/api/screens",
          export: "/api/export",
          devSync: "/ws/dev-sync"
        },
        websocket: {
          url: "wss://create.naca.community/ws/dev-sync",
          protocols: ["naca-devsync-v1"]
        }
      }
    }
  },
  {
    pathPattern: "/api/activity-editor/negotiate",
    method: "POST",
    description: "Negotiate connection parameters with NACA host. Establishes optimal configuration for communication.",
    requestSchema: {
      type: "object",
      properties: {
        hostVersion: { type: "string", description: "NACA host API version" },
        requestedFeatures: { type: "array", items: { type: "string" } },
        authMethod: { type: "string", enum: ["session", "jwt", "apiKey"] },
        communityId: { type: "string" },
        subdomain: { type: "string" }
      },
      required: ["hostVersion"]
    },
    samples: {
      request: {
        hostVersion: "2.1.0",
        requestedFeatures: ["realTimeSync", "mediaLibrary"],
        authMethod: "apiKey",
        communityId: "comm_abc123",
        subdomain: "tlingit"
      },
      response: {
        negotiated: true,
        activeFeatures: ["realTimeSync", "mediaLibrary"],
        authMethod: "apiKey",
        syncInterval: 15000,
        websocketUrl: "wss://create.naca.community/ws/dev-sync"
      }
    }
  },
  // Projects
  {
    pathPattern: "/api/projects",
    method: "POST",
    description: "Create a new project (activity container). Projects organize screens, objects, and assets.",
    requestSchema: {
      type: "object",
      properties: {
        name: { type: "string", minLength: 1, maxLength: 255 },
        description: { type: "string", optional: true }
      },
      required: ["name"]
    },
    samples: {
      request: { name: "Vocabulary Matching Game", description: "Match words to images" },
      response: { id: "proj_abc123", name: "Vocabulary Matching Game", description: "Match words to images", createdAt: "2024-01-15T10:00:00Z" }
    }
  },
  // Export
  {
    pathPattern: "/api/export",
    method: "GET",
    description: "Export complete activity definition. Returns all screens, objects, scenes, triggers, and vocabulary bindings.",
    responseSchema: {
      type: "object",
      properties: {
        version: { type: "string" },
        exportedAt: { type: "string", format: "ISO8601" },
        project: { type: "object" },
        screens: { type: "array" },
        objects: { type: "array" },
        scenes: { type: "array" },
        triggers: { type: "array" },
        vocabulary: { type: "array" },
        animations: { type: "array" }
      }
    },
    samples: {
      response: {
        version: "1.0.0",
        exportedAt: "2024-01-15T10:00:00Z",
        project: { id: "proj_abc123", name: "Vocabulary Game" },
        screens: [{ id: "screen_1", name: "Main", width: 1920, height: 1080 }],
        objects: [{ id: "obj_1", name: "Word Card", screenId: "screen_1", x: 100, y: 100 }],
        scenes: [{ id: "scene_1", name: "Initial State", isDefault: true }],
        triggers: [{ id: "trig_1", selector: ".card", event: "click", action: "goToScene" }],
        vocabulary: [],
        animations: []
      }
    }
  },
  // NACA Proxy
  {
    pathPattern: "/api/naca-proxy/*",
    method: "ALL",
    description: "Proxy requests to NACA server. Handles authentication, CORS, and request/response transformation.",
    requestSchema: {
      type: "object",
      description: "Pass-through to NACA API. See NACA API documentation for specific endpoint schemas."
    },
    samples: {
      request: { note: "Request body is passed through to NACA unchanged" },
      response: { note: "Response from NACA is returned unchanged with CORS headers added" }
    }
  }
];

// ========================================
// HASH GENERATION - combines routes + schemas
// ========================================

function generateCombinedHash(): string {
  const routesPath = path.resolve(projectRoot, 'server', 'routes.ts');
  const schemaPath = path.resolve(projectRoot, 'shared', 'schema.ts');
  
  const routesContent = fs.readFileSync(routesPath, 'utf-8');
  const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
  
  // Hash both files to detect any changes
  const combined = routesContent + '||' + schemaContent;
  return crypto.createHash('md5').update(combined).digest('hex').substring(0, 8);
}

// ========================================
// MARKDOWN GENERATOR
// ========================================

function generateMarkdown(payload: ApiDocPayload): string {
  const lines: string[] = [];
  
  lines.push("# Activity Editor API Documentation");
  lines.push("");
  lines.push(`**API Version:** ${payload.apiVersion}`);
  lines.push(`**Generated:** ${new Date(payload.generatedAt).toLocaleString()}`);
  lines.push(`**Schema Hash:** \`${payload.schemaHash}\``);
  lines.push("");
  lines.push("---");
  lines.push("");
  
  lines.push("## Overview");
  lines.push("");
  lines.push("The Activity Editor API provides endpoints for managing interactive language learning activities. It supports:");
  lines.push("- Project and screen management");
  lines.push("- Game object creation and manipulation");
  lines.push("- Scene and state management");
  lines.push("- Animation and timeline control");
  lines.push("- Vocabulary management");
  lines.push("- Figma integration");
  lines.push("- Real-time synchronization via WebSocket");
  lines.push("");
  
  // Group endpoints by category
  const categories = new Map<string, EndpointInfo[]>();
  for (const endpoint of payload.endpoints) {
    const cat = endpoint.category;
    if (!categories.has(cat)) {
      categories.set(cat, []);
    }
    categories.get(cat)!.push(endpoint);
  }
  
  lines.push("## Endpoints");
  lines.push("");
  
  // Sort categories for consistent output
  const sortedCategories = Array.from(categories.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  
  for (const [category, endpoints] of sortedCategories) {
    lines.push(`### ${category}`);
    lines.push("");
    
    for (const ep of endpoints) {
      lines.push(`#### \`${ep.method}\` ${ep.path}`);
      lines.push("");
      lines.push(ep.description);
      lines.push("");
      
      if (ep.parameters && ep.parameters.length > 0) {
        lines.push("**Parameters:**");
        lines.push("");
        lines.push("| Name | In | Type | Required | Description |");
        lines.push("|------|-----|------|----------|-------------|");
        for (const param of ep.parameters) {
          lines.push(`| ${param.name} | ${param.in} | ${param.type} | ${param.required ? 'Yes' : 'No'} | ${param.description || '-'} |`);
        }
        lines.push("");
      }
      
      if (ep.samples) {
        if (ep.samples.request) {
          lines.push("**Request Example:**");
          lines.push("```json");
          lines.push(JSON.stringify(ep.samples.request, null, 2));
          lines.push("```");
          lines.push("");
        }
        if (ep.samples.response) {
          lines.push("**Response Example:**");
          lines.push("```json");
          lines.push(JSON.stringify(ep.samples.response, null, 2));
          lines.push("```");
          lines.push("");
        }
      }
    }
  }
  
  lines.push("## Schemas");
  lines.push("");
  
  for (const [name, schema] of Object.entries(payload.schemas)) {
    lines.push(`### ${name}`);
    lines.push("");
    lines.push("| Field | Type | Required | Description |");
    lines.push("|-------|------|----------|-------------|");
    for (const field of schema.fields) {
      lines.push(`| ${field.name} | ${field.type} | ${field.required ? 'Yes' : 'No'} | ${field.description || '-'} |`);
    }
    lines.push("");
  }
  
  if (payload.websocketTopics && payload.websocketTopics.length > 0) {
    lines.push("## WebSocket Topics");
    lines.push("");
    lines.push("Connect to `/ws/dev-sync` for real-time synchronization with NACA.");
    lines.push("");
    lines.push("**Connection URL:** `wss://create.naca.community/ws/dev-sync`");
    lines.push("");
    lines.push("**Protocol:** `naca-devsync-v1`");
    lines.push("");
    lines.push("**Message Format:**");
    lines.push("```json");
    lines.push(JSON.stringify({ topic: "topic_name", payload: { "..." : "topic-specific data" }, timestamp: "ISO8601" }, null, 2));
    lines.push("```");
    lines.push("");
    
    lines.push("### Inbound Topics (NACA → Activity Editor)");
    lines.push("");
    lines.push("These topics are sent by NACA to update the Activity Editor state.");
    lines.push("");
    for (const topic of payload.websocketTopics.filter(t => t.direction === 'inbound' || t.direction === 'bidirectional')) {
      lines.push(`#### \`${topic.name}\``);
      lines.push("");
      lines.push(topic.description);
      lines.push("");
      if (topic.payloadSchema) {
        lines.push("**Payload Schema:**");
        lines.push("```json");
        lines.push(JSON.stringify(topic.payloadSchema, null, 2));
        lines.push("```");
        lines.push("");
      }
    }
    
    lines.push("### Outbound Topics (Activity Editor → NACA)");
    lines.push("");
    lines.push("These topics are sent by the Activity Editor to push changes to NACA.");
    lines.push("");
    for (const topic of payload.websocketTopics.filter(t => t.direction === 'outbound' || t.direction === 'bidirectional')) {
      lines.push(`#### \`${topic.name}\``);
      lines.push("");
      lines.push(topic.description);
      lines.push("");
      if (topic.payloadSchema) {
        lines.push("**Payload Schema:**");
        lines.push("```json");
        lines.push(JSON.stringify(topic.payloadSchema, null, 2));
        lines.push("```");
        lines.push("");
      }
    }
  }
  
  // NACA Communication Protocol Section
  lines.push("## NACA Communication Protocol");
  lines.push("");
  lines.push("This section describes the bi-directional communication protocol between the Activity Editor and NACA hosts.");
  lines.push("");
  
  for (const section of NACA_PROTOCOL) {
    lines.push(`### ${section.title}`);
    lines.push("");
    lines.push(section.description);
    lines.push("");
    
    if (section.details && section.details.length > 0) {
      for (const detail of section.details) {
        lines.push(`- ${detail}`);
      }
      lines.push("");
    }
    
    if (section.examples && section.examples.length > 0) {
      for (const example of section.examples) {
        lines.push(`**${example.title}:**`);
        lines.push(`\`\`\`${example.language || 'text'}`);
        lines.push(example.code);
        lines.push("```");
        lines.push("");
      }
    }
  }
  
  // Integration Guide Section
  lines.push("## NACA Integration Guide");
  lines.push("");
  lines.push("This guide helps NACA developers integrate with the Activity Editor API.");
  lines.push("");
  
  lines.push("### Quick Start");
  lines.push("");
  lines.push("1. **Discover Capabilities**: Call `GET /api/activity-editor/capabilities` to discover supported features");
  lines.push("2. **Negotiate Connection**: Call `POST /api/activity-editor/negotiate` with your host version and required features");
  lines.push("3. **Authenticate**: Use API key or JWT authentication based on your integration type");
  lines.push("4. **Connect WebSocket**: Establish a WebSocket connection to `/ws/dev-sync` for real-time sync");
  lines.push("5. **Start Building**: Create projects, screens, and objects using the REST API");
  lines.push("");
  
  lines.push("### Authentication Flow");
  lines.push("");
  lines.push("```mermaid");
  lines.push("sequenceDiagram");
  lines.push("    participant NACA");
  lines.push("    participant Editor as Activity Editor");
  lines.push("    NACA->>Editor: GET /api/activity-editor/capabilities");
  lines.push("    Editor-->>NACA: {apiVersion, features, authMethods}");
  lines.push("    NACA->>Editor: POST /api/activity-editor/negotiate");
  lines.push("    Editor-->>NACA: {negotiated: true, activeFeatures}");
  lines.push("    NACA->>Editor: WebSocket /ws/dev-sync");
  lines.push("    Editor-->>NACA: Connection established");
  lines.push("```");
  lines.push("");
  
  lines.push("### Recommended Sync Pattern");
  lines.push("");
  lines.push("1. **Initial Sync**: On connection, send `request_activity` to get current state");
  lines.push("2. **Real-time Updates**: Listen for `activityDiff` messages and apply JSON Patch operations");
  lines.push("3. **Push Changes**: Send `activity_update` when user modifies the activity in NACA");
  lines.push("4. **Conflict Resolution**: Compare versions and merge changes when conflicts detected");
  lines.push("5. **Heartbeat**: Exchange `ping`/`pong` messages every 30 seconds to maintain connection");
  lines.push("");
  
  lines.push("### Error Recovery");
  lines.push("");
  lines.push("| Scenario | Action |");
  lines.push("|----------|--------|");
  lines.push("| WebSocket disconnect | Reconnect with exponential backoff (1s, 2s, 4s, max 60s) |");
  lines.push("| 429 Rate Limited | Wait for `Retry-After` header value, then retry |");
  lines.push("| 401 Unauthorized | Refresh authentication token and retry |");
  lines.push("| 500 Server Error | Retry with exponential backoff, max 3 attempts |");
  lines.push("| Sync conflict | Request full activity state and merge changes |");
  lines.push("");
  
  lines.push("### Base URLs");
  lines.push("");
  lines.push("| Environment | Base URL | WebSocket URL |");
  lines.push("|-------------|----------|---------------|");
  lines.push("| Production | `https://create.naca.community` | `wss://create.naca.community/ws/dev-sync` |");
  lines.push("| API Docs | `https://api.create.naca.community` | N/A |");
  lines.push("| Development | `http://localhost:5000` | `ws://localhost:5000/ws/dev-sync` |");
  lines.push("");
  
  lines.push("### Feature Flags");
  lines.push("");
  lines.push("The Activity Editor supports the following feature flags that can be negotiated:");
  lines.push("");
  lines.push("| Feature | Description | Default |");
  lines.push("|---------|-------------|---------|");
  lines.push("| `figmaSync` | Sync designs from Figma | Enabled |");
  lines.push("| `vocabularyBinding` | Bind vocabulary to objects | Enabled |");
  lines.push("| `animationTimeline` | Adobe Animate-style timeline | Enabled |");
  lines.push("| `realTimeSync` | WebSocket real-time sync | Enabled |");
  lines.push("| `mediaLibrary` | Access NACA media library | Enabled |");
  lines.push("| `dropboxIntegration` | Dropbox file integration | Depends on host |");
  lines.push("| `activityFolders` | Organize activities in folders | Depends on host |");
  lines.push("");
  
  // NACA Build Agent Instructions Section
  lines.push("---");
  lines.push("");
  lines.push("## NACA Build Agent Instructions");
  lines.push("");
  lines.push("This section contains implementation requests and updates for the NACA development team.");
  lines.push("");
  
  lines.push("### Requested API Endpoints");
  lines.push("");
  lines.push("The Activity Editor would benefit from the following NACA API endpoints:");
  lines.push("");
  lines.push("#### 1. Embeddable Components API");
  lines.push("");
  lines.push("**Endpoint**: `GET /api/communities/:id/components`");
  lines.push("");
  lines.push("Returns reusable UI components that can be imported into activities.");
  lines.push("");
  lines.push("```json");
  lines.push("{");
  lines.push('  "components": [');
  lines.push("    {");
  lines.push('      "id": "flashcard-basic",');
  lines.push('      "name": "Basic Flashcard",');
  lines.push('      "type": "interactive",');
  lines.push('      "thumbnail": "https://...",');
  lines.push('      "config": { "flippable": true, "audioSupport": true }');
  lines.push("    }");
  lines.push("  ]");
  lines.push("}");
  lines.push("```");
  lines.push("");
  
  lines.push("#### 2. Activity Push/Update API");
  lines.push("");
  lines.push("**Endpoint**: `PUT /api/activities/:id`");
  lines.push("");
  lines.push("Allow Activity Editor to push activity updates back to NACA.");
  lines.push("");
  lines.push("```json");
  lines.push("{");
  lines.push('  "name": "Updated Activity Name",');
  lines.push('  "screens": [...],');
  lines.push('  "vocabulary": [...],');
  lines.push('  "metadata": { "editorVersion": "1.0.0" }');
  lines.push("}");
  lines.push("```");
  lines.push("");
  
  lines.push("#### 3. Vocabulary Sync API");
  lines.push("");
  lines.push("**Endpoint**: `POST /api/dictionaries/:id/entries/sync`");
  lines.push("");
  lines.push("Bidirectional vocabulary synchronization with conflict resolution.");
  lines.push("");
  lines.push("```json");
  lines.push("{");
  lines.push('  "action": "sync",');
  lines.push('  "entries": [');
  lines.push('    { "id": "...", "word": "...", "translation": "...", "version": 2 }');
  lines.push("  ],");
  lines.push('  "lastSyncTimestamp": "2024-01-15T10:30:00Z"');
  lines.push("}");
  lines.push("```");
  lines.push("");
  
  lines.push("### Current Integration Status");
  lines.push("");
  lines.push("| Feature | Status | Notes |");
  lines.push("|---------|--------|-------|");
  lines.push("| Community browsing | ✅ Complete | Full read access to communities, activities, dictionaries, media |");
  lines.push("| Dictionary-to-Object binding | ✅ Complete | Field-level binding (word/translation/image/audio) |");
  lines.push("| Activity-to-Screen mapping | ✅ Complete | Attach activities to screens with persistence |");
  lines.push("| Insert Activity Items as Objects | ✅ Complete | Auto-create canvas objects from activity items |");
  lines.push("| Preview mode data resolution | ✅ Complete | Bound vocabulary displays in preview mode |");
  lines.push("| Media URL proxying | ✅ Complete | All media accessed via secure backend proxy |");
  lines.push("| API version monitoring | ✅ Complete | 60-second polling for API changes |");
  lines.push("| Push updates to NACA | ⏳ Pending | Awaiting NACA API endpoint |");
  lines.push("| Components import | ⏳ Pending | Awaiting NACA components API |");
  lines.push("| Real-time WebSocket sync | ⏳ Partial | Inbound messages handled, outbound needs NACA support |");
  lines.push("");
  
  lines.push("### WebSocket Topics Needed from NACA");
  lines.push("");
  lines.push("The Activity Editor is prepared to handle these WebSocket topics:");
  lines.push("");
  lines.push("| Topic | Direction | Description |");
  lines.push("|-------|-----------|-------------|");
  lines.push("| `vocabulary_update` | NACA → Editor | Push vocabulary changes to editor |");
  lines.push("| `activity_published` | NACA → Editor | Notify when activity is published |");
  lines.push("| `media_uploaded` | NACA → Editor | New media available for binding |");
  lines.push("| `component_available` | NACA → Editor | New reusable component added |");
  lines.push("");
  
  lines.push("### Schema Additions for NACA");
  lines.push("");
  lines.push("Activity Editor screens now include NACA integration fields:");
  lines.push("");
  lines.push("```sql");
  lines.push("ALTER TABLE screens ADD COLUMN naca_activity_id TEXT;");
  lines.push("ALTER TABLE screens ADD COLUMN naca_community_id TEXT;");
  lines.push("```");
  lines.push("");
  lines.push("These fields link screens to NACA activities for bidirectional sync.");
  lines.push("");
  
  lines.push("### Contact");
  lines.push("");
  lines.push("For integration questions or feature requests, update this documentation");
  lines.push("or contact the Activity Editor development team.");
  lines.push("");
  lines.push(`*Last updated: ${new Date().toISOString().split('T')[0]}*`);
  lines.push("");
  
  return lines.join("\n");
}

// ========================================
// PUBLIC API
// ========================================

// Apply endpoint enhancements from ENDPOINT_ENHANCEMENTS to parsed endpoints
function applyEndpointEnhancements(endpoints: EndpointInfo[]): EndpointInfo[] {
  return endpoints.map(endpoint => {
    // Find matching enhancement
    const enhancement = ENDPOINT_ENHANCEMENTS.find(e => {
      // Match by path pattern (supports wildcards)
      const pattern = e.pathPattern.replace(/\*/g, '.*');
      const regex = new RegExp(`^${pattern}$`);
      return regex.test(endpoint.path) && (e.method === 'ALL' || e.method === endpoint.method);
    });
    
    if (enhancement) {
      return {
        ...endpoint,
        description: enhancement.description,
        requestSchema: enhancement.requestSchema,
        responseSchema: enhancement.responseSchema,
        samples: enhancement.samples
      };
    }
    
    return endpoint;
  });
}

export async function buildApiDocs(): Promise<{ json: ApiDocPayload; markdown: string; schemaHash: string }> {
  // Parse the actual source files
  const { routes } = parseRoutesFile();
  const { schemas } = parseSchemaFile();
  
  // Generate hash from both source files
  const schemaHash = generateCombinedHash();
  
  // Build endpoints from parsed routes and apply enhancements
  const rawEndpoints = buildEndpointsFromParsedRoutes(routes);
  const endpoints = applyEndpointEnhancements(rawEndpoints);
  
  // Build integration guide object for JSON payload
  const integrationGuide = {
    quickStart: [
      "Discover Capabilities: GET /api/activity-editor/capabilities",
      "Negotiate Connection: POST /api/activity-editor/negotiate",
      "Authenticate: Use API key or JWT authentication",
      "Connect WebSocket: /ws/dev-sync for real-time sync",
      "Start Building: Create projects, screens, and objects via REST API"
    ],
    authenticationFlow: "GET capabilities -> POST negotiate -> Connect WebSocket",
    syncPattern: [
      "Initial: Send request_activity to get current state",
      "Real-time: Listen for activityDiff messages",
      "Push: Send activity_update when user modifies activity",
      "Conflict: Compare versions and merge changes",
      "Heartbeat: Exchange ping/pong every 30 seconds"
    ],
    errorRecovery: {
      "WebSocket disconnect": "Reconnect with exponential backoff (1s, 2s, 4s, max 60s)",
      "429 Rate Limited": "Wait for Retry-After header value, then retry",
      "401 Unauthorized": "Refresh authentication token and retry",
      "500 Server Error": "Retry with exponential backoff, max 3 attempts",
      "Sync conflict": "Request full activity state and merge changes"
    },
    baseUrls: {
      production: { rest: "https://create.naca.community", ws: "wss://create.naca.community/ws/dev-sync" },
      apiDocs: { rest: "https://api.create.naca.community" },
      development: { rest: "http://localhost:5000", ws: "ws://localhost:5000/ws/dev-sync" }
    },
    featureFlags: [
      { feature: "figmaSync", description: "Sync designs from Figma", default: "Enabled" },
      { feature: "vocabularyBinding", description: "Bind vocabulary to objects", default: "Enabled" },
      { feature: "animationTimeline", description: "Adobe Animate-style timeline", default: "Enabled" },
      { feature: "realTimeSync", description: "WebSocket real-time sync", default: "Enabled" },
      { feature: "mediaLibrary", description: "Access NACA media library", default: "Enabled" },
      { feature: "dropboxIntegration", description: "Dropbox file integration", default: "Depends on host" },
      { feature: "activityFolders", description: "Organize activities in folders", default: "Depends on host" }
    ]
  };
  
  const jsonPayload: ApiDocPayload = {
    apiVersion: "1.0.0",
    generatedAt: new Date().toISOString(),
    schemaHash,
    endpoints,
    schemas,
    websocketTopics: WEBSOCKET_TOPICS,
    nacaProtocol: NACA_PROTOCOL,
    integrationGuide
  };
  
  const markdown = generateMarkdown(jsonPayload);
  
  console.log(`[Doc Builder] Parsed ${routes.length} routes, ${Object.keys(schemas).length} schemas, ${WEBSOCKET_TOPICS.length} WebSocket topics`);
  
  return { json: jsonPayload, markdown, schemaHash };
}

export async function saveApiDocs(): Promise<void> {
  // In production, source files may not exist - skip regeneration
  if (!sourceFilesExist()) {
    console.log("[Doc Builder] Source files not available (production mode) - skipping regeneration");
    return;
  }
  
  const { json, markdown, schemaHash } = await buildApiDocs();
  
  await storage.upsertApiDocsBySlug("activity-editor", {
    title: "Activity Editor API",
    description: "API documentation for the Activity Editor, enabling NACA integration for language learning activities",
    version: "1.0.0",
    jsonPayload: json,
    markdownPayload: markdown,
    schemaHash,
    lastUpdated: new Date(),
    publishStatus: "published",
    publishedAt: new Date()
  });
  
  console.log("[Doc Builder] API documentation saved successfully");
}

export async function checkForDrift(): Promise<boolean> {
  // In production, source files may not exist - skip drift detection
  if (!sourceFilesExist()) {
    console.log("[Doc Builder] Source files not available (production mode) - using cached docs");
    return false;
  }
  
  // Generate hash from CURRENT source files
  const currentHash = generateCombinedHash();
  
  const existingDoc = await storage.getApiDocsBySlug("activity-editor");
  
  if (!existingDoc) {
    console.log("[Doc Builder] No existing documentation found - needs rebuild");
    return true;
  }
  
  if (existingDoc.schemaHash !== currentHash) {
    console.log(`[Doc Builder] Schema drift detected: ${existingDoc.schemaHash} -> ${currentHash}`);
    return true;
  }
  
  console.log("[Doc Builder] Documentation is up to date");
  return false;
}
