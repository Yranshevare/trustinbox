import type { User, Session } from 'better-auth';

export type AuthContext = {
  Variables: {
    user: User | null;
    session: Session | null;
  };
};
