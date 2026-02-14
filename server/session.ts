import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { Pool } from "@neondatabase/serverless";

declare module "express-session" {
  interface SessionData {
    nacaConfig?: {
      subdomain: string;
      communityId?: string;
      authMethod: string;
      authHeaders: Record<string, string>;
      baseUrl: string;
      websocketUrl?: string;
      negotiatedAt: number;
      expiresAt?: number;
    };
    nacaTokens?: {
      accessToken?: string;
      refreshToken?: string;
      expiresAt?: number;
    };
  }
}

const PgSession = connectPgSimple(session);

export function createSessionMiddleware() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const sessionSecret = process.env.SESSION_SECRET || "naca-editor-session-secret-dev-only";
  const isProduction = process.env.NODE_ENV === "production";

  return session({
    store: new PgSession({
      pool: pool as any,
      tableName: "session",
      createTableIfMissing: true,
    }),
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    name: "naca.sid",
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      domain: isProduction ? ".naca.community" : undefined,
    },
  });
}

export function getNacaSessionConfig(req: Express.Request) {
  return req.session?.nacaConfig || null;
}

export function setNacaSessionConfig(
  req: Express.Request,
  config: NonNullable<session.SessionData["nacaConfig"]>
) {
  req.session.nacaConfig = config;
}

export function clearNacaSession(req: Express.Request) {
  delete req.session.nacaConfig;
  delete req.session.nacaTokens;
}
