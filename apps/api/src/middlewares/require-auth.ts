import type { Context, Next } from 'hono';
import type { AuthContext } from './types.js';

export const requireAuth = async (c: Context<AuthContext>, next: Next) => {
  const user = c.get('user');

  if (!user) {
    return c.json({ message: 'Unauthorized - Please sign in' }, 401);
  }

  await next();
};
