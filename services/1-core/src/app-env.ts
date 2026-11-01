import type { Role } from '@borondo/contracts';
import type { createClient } from '@borondo/db';

// Variables de contexto de Hono compartidas por middlewares y routers del servicio core.
export type AppEnv = {
  Variables: {
    requestId: string;
    db: ReturnType<typeof createClient>;
    currentUser: { id: string; role: Role };
  };
};
