import { type NextFunction, type Request, type Response } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthPayload {
  sub: string;
  role: 'admin';
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw Object.assign(new Error('JWT_SECRET is not configured'), { status: 500 });
  }
  return secret;
}

export function signAdminToken(username: string): string {
  const payload: AuthPayload = { sub: username, role: 'admin' };
  return jwt.sign(payload, getJwtSecret(), { expiresIn: '7d' });
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  void res;
  try {
    const header = req.headers.authorization;
    if (!header || !header.toLowerCase().startsWith('bearer ')) {
      throw Object.assign(new Error('Missing Authorization header'), { status: 401 });
    }

    const token = header.slice(7).trim();
    const decoded = jwt.verify(token, getJwtSecret()) as AuthPayload;

    (req as Request & { auth?: AuthPayload }).auth = decoded;
    next();
  } catch (err) {
    const e = err as Error & { status?: number };
    next(Object.assign(new Error(e.message || 'Unauthorized'), { status: e.status ?? 401 }));
  }
}
