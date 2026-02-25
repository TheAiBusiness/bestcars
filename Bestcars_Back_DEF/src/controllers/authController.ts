import { type Request, type Response } from 'express';
import { timingSafeEqual } from 'node:crypto';
import { signAdminToken } from '../middleware/auth.js';

interface LoginBody {
  username: string;
  password: string;
}

function safeEquals(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export const login = (req: Request<object, object, LoginBody>, res: Response): void => {
  const { username, password } = req.body ?? ({} as LoginBody);

  if (!username || !password) {
    res.status(400).json({ error: 'username and password are required' });
    return;
  }

  const adminUser = process.env.ADMIN_USERNAME ?? 'admin';
  const adminPass = process.env.ADMIN_PASSWORD ?? 'admin';

  const okUser = safeEquals(username, adminUser);
  const okPass = safeEquals(password, adminPass);

  if (!okUser || !okPass) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const token = signAdminToken(username);
  res.json({ token, role: 'admin' });
};
