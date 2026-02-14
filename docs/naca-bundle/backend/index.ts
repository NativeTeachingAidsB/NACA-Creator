import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// CORS configuration for custom domain support
// This is the allowlist for cross-origin requests. The Activity Editor uses
// API key authentication via Authorization header, not session cookies, so
// SameSite cookie configuration is not required for cross-origin auth.
const ALLOWED_ORIGINS = [
  'https://create.naca.community',      // Production custom domain
  'https://api.create.naca.community',  // API documentation subdomain
  'https://naca.community',             // Parent NACA server
  'http://localhost:5000',              // Local development
  'http://localhost:3000',              // Alternative local dev
];

// Get the app base URL from environment - used by capabilities/negotiate endpoints
export const APP_BASE_URL = process.env.APP_BASE_URL || 'http://localhost:5000';

app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Allow requests from allowed origins
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key, X-Community-Subdomain, X-Subdomain, X-Community-Id, X-Editor-Version');
  }
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  
  next();
});

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

// Serve attached_assets directory for help videos and other static assets
import path from "path";
const attachedAssetsPath = path.resolve(process.cwd(), "attached_assets");
app.use("/attached_assets", express.static(attachedAssetsPath));

// API subdomain routing - serve API docs at api.create.naca.community
app.use((req, res, next) => {
  const host = req.hostname || req.headers.host?.split(':')[0] || '';
  
  // Check if request is coming from api.create.naca.community
  if (host === 'api.create.naca.community') {
    // Redirect root to API docs
    if (req.path === '/' || req.path === '') {
      return res.redirect('/api/docs/activity-editor');
    }
    // Allow /api/* paths through normally
    if (req.path.startsWith('/api/')) {
      return next();
    }
    // For other paths, redirect to API docs root
    return res.redirect('/api/docs/activity-editor');
  }
  
  next();
});

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
