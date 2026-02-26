import { type Request, type Response } from 'express';
import { timingSafeEqual } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { signAdminToken } from '../middleware/auth.js';

interface LoginBody {
  username: string;
  password: string;
}

interface ChangePasswordBody {
  currentPassword: string;
  newPassword: string;
}

function safeEquals(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

const ADMIN_PASSWORD_FILE = join(process.cwd(), '.admin-password');

function getAdminPassword(): string {
  if (existsSync(ADMIN_PASSWORD_FILE)) {
    try {
      const content = readFileSync(ADMIN_PASSWORD_FILE, 'utf8').trim();
      if (content) return content;
    } catch {
      // fallback to env
    }
  }
  return process.env.ADMIN_PASSWORD ?? 'admin';
}

export const login = (req: Request<object, object, LoginBody>, res: Response): void => {
  const { username, password } = req.body ?? ({} as LoginBody);

  if (!username || !password) {
    res.status(400).json({ error: 'username and password are required' });
    return;
  }

  const adminUser = process.env.ADMIN_USERNAME ?? 'admin';
  const adminPass = getAdminPassword();

  const okUser = safeEquals(username, adminUser);
  const okPass = safeEquals(password, adminPass);

  if (!okUser || !okPass) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const token = signAdminToken(username);
  res.json({ token, role: 'admin' });
};

export const changePassword = (req: Request<object, object, ChangePasswordBody>, res: Response): void => {
  const { currentPassword, newPassword } = req.body ?? ({} as ChangePasswordBody);

  if (!currentPassword || !newPassword || typeof newPassword !== 'string') {
    res.status(400).json({ error: 'currentPassword and newPassword are required' });
    return;
  }

  const adminPass = getAdminPassword();
  if (!safeEquals(currentPassword, adminPass)) {
    res.status(400).json({ error: 'Contraseña actual incorrecta' });
    return;
  }

  const trimmed = newPassword.trim();
  if (trimmed.length < 6) {
    res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
    return;
  }

  try {
    writeFileSync(ADMIN_PASSWORD_FILE, trimmed, 'utf8');
    res.json({ success: true, message: 'Contraseña actualizada' });
  } catch (err) {
    res.status(500).json({ error: 'No se pudo guardar la contraseña' });
  }
};
