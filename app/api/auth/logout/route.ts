// app/api/auth/logout/route.ts (or wherever your route is)
import { NextRequest } from 'next/server';
import connectDB from '@/lib/db/mongodb';
import User from '@/models/User';
import { ApiResponseBuilder } from '@/lib/utils/api-response';
import { handleApiError } from '@/lib/utils/error-handler';
import { getUserFromRequest } from '@/lib/utils/token-helper';

// helper to read cookies in Next's NextRequest
function getCookieValue(req: NextRequest, name: string) {
  const cookie = req.headers.get('cookie') || '';
  const match = cookie.split(';').map(s => s.trim()).find(s => s.startsWith(name + '='));
  return match ? decodeURIComponent(match.split('=')[1]) : undefined;
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const user = getUserFromRequest(request);
    if (!user) {
      // still clear cookie server-side (best-effort)
      const resp = ApiResponseBuilder.unauthorized('Not authenticated');
      resp.cookies.delete('token');
      resp.cookies.delete('refreshToken');
      return resp;
    }

    // Read refresh token from cookie (preferred)
    const refreshToken = getCookieValue(request, 'refreshToken');

    if (refreshToken) {
      await User.findByIdAndUpdate(user.userId, {
        $pull: { refreshTokens: refreshToken },
      });
    }

    // Build response and clear cookies
    const response = ApiResponseBuilder.success(null, 'Logout successful');
    response.cookies.delete('token'); // access token cookie
    response.cookies.delete('refreshToken'); // refresh token cookie
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
