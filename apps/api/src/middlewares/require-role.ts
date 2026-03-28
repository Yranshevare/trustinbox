import type { Context, Next } from 'hono';
import { auth } from '../core/lib/auth/init.js';
import type { AuthContext } from './types.js';

export const requireRole = (role: string, orgId: string) => {
  return async (c: Context<AuthContext>, next: Next) => {
    const user = c.get('user');

    if (!user) {
      return c.json({ message: 'Unauthorized - Please sign in' }, 401);
    }
    const userRole = await auth.api.getActiveMemberRole({
      query: {
        userId: user.id,
        organizationId: orgId,
      },
      headers: c.req.header(),
    });

    if (userRole.role !== role) {
      return c.json({ message: 'Forbidden - Insufficient permissions' }, 403);
    }

    await next();
  };
};
