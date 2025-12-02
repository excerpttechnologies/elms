import * as jwt from "jsonwebtoken";

const JWT_SECRET: string = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN: jwt.SignOptions["expiresIn"] = (process.env.JWT_EXPIRES_IN ?? "7d") as any;

const JWT_REFRESH_SECRET: string = process.env.JWT_REFRESH_SECRET as string;
const JWT_REFRESH_EXPIRES_IN: jwt.SignOptions["expiresIn"] = (process.env.JWT_REFRESH_EXPIRES_IN ?? "30d") as any;

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error("JWT secrets are not defined in environment variables");
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN,
  });
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
  } catch {
    return null;
  }
}

export function generateTokenPair(payload: TokenPayload) {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
}
