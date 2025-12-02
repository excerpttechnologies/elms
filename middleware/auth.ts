import { NextRequest } from 'next/server';
import { ApiResponseBuilder } from '@/lib/utils/api-response';
import { getUserFromRequest } from '@/lib/utils/token-helper';
import { UserRole } from '@/types';

export function requireAuth(handler: (req: NextRequest, user: any, context?: any) => Promise<Response>) {
  return async (req: NextRequest, context?: any) => {
    const user = getUserFromRequest(req);
    
    if (!user) {
      return ApiResponseBuilder.unauthorized('Authentication required');
    }

    return handler(req, user, context);
  };
}

export function requireRoles(...allowedRoles: UserRole[]) {
  return function (handler: (req: NextRequest, user: any, context?: any) => Promise<Response>) {
    return async (req: NextRequest, context?: any) => {
      const user = getUserFromRequest(req);
      
      if (!user) {
        return ApiResponseBuilder.unauthorized('Authentication required');
      }

      if (!allowedRoles.includes(user.role as UserRole)) {
        return ApiResponseBuilder.forbidden('Insufficient permissions');
      }

      return handler(req, user, context);
    };
  };
}

// Convenience functions for common roles
export const requireAdmin = requireRoles(UserRole.ADMIN);
export const requireTeacher = requireRoles(UserRole.ADMIN, UserRole.TEACHER);
export const requireStudent = requireRoles(UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT);