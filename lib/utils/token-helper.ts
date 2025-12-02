import { NextRequest } from 'next/server';
import { verifyAccessToken } from '../auth/jwt';

export function extractTokenFromRequest(request: NextRequest): string | null {
  // Check Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Check cookie
  const tokenFromCookie = request.cookies.get('token')?.value;
  if (tokenFromCookie) {
    return tokenFromCookie;
  }

  return null;
}

export function getUserFromRequest(request: NextRequest) {
  const token = extractTokenFromRequest(request);
  if (!token) return null;

  return verifyAccessToken(token);
}