import { type Request, type Response } from 'express';
import { timingSafeEqual } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import bcrypt from 'bcrypt';
import { signAdminToken } from '../middleware/auth.js';

interface LoginBody {
  username: string;
  password: string;
}

interface ChangePasswordBody {
  currentPassword: string;
  newPassword: string;
}

const isProduction = process.env.NODE_ENV === 'production';
const BCRYPT_ROUNDS = 12;

if (isProduction) {
  if (!process.env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD === 'admin') {
    console.error('FATAL: ADMIN_PASSWORD must be set to a strong value in production');
    process.exit(1);
  }
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'bestcars-panel-secret-change-in-production') {
    console.error('FATAL: JWT_SECRET must be set to a strong value in production');
    process.exit(1);
  }
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
  if (isProduction) {
    return process.env.ADMIN_PASSWORD!;
  }
  return process.env.ADMIN_PASSWORD ?? 'admin';
}

function isHashedPassword(password: string): boolean {
  return password.startsWith('$2b$') || password.startsWith('$2a$');
}

export const login = async (req: Request<object, object, LoginBody>, res: Response): Promise<void> => {
  const { username, password } = req.body ?? ({} as LoginBody);

  if (!username || !password) {
    res.status(400).json({
      error: {
        message: 'username and password are required',
        code: 'VALIDATION_ERROR',
      },
    });
    return;
  }

  const adminUser = isProduction ? process.env.ADMIN_USERNAME! : (process.env.ADMIN_USERNAME ?? 'admin');
  const adminPass = getAdminPassword();

  const okUser = safeEquals(username, adminUser);
  const okPass = isHashedPassword(adminPass)
    ? await bcrypt.compare(password, adminPass)
    : safeEquals(password, adminPass);

  if (!okUser || !okPass) {
    res.status(401).json({
      error: {
        message: 'Credenciales incorrectas',
        code: 'AUTH_INVALID',
      },
    });
    return;
  }

  const token = signAdminToken(username);
  res.json({ token, role: 'admin' });
};

export const changePassword = async (req: Request<object, object, ChangePasswordBody>, res: Response): Promise<void> => {
  const { currentPassword, newPassword } = req.body ?? ({} as ChangePasswordBody);

  if (!currentPassword || !newPassword || typeof newPassword !== 'string') {
    res.status(400).json({ error: { message: 'currentPassword and newPassword are required', code: 'VALIDATION_ERROR' } });
    return;
  }

  const adminPass = getAdminPassword();
  const currentOk = isHashedPassword(adminPass)
    ? await bcrypt.compare(currentPassword, adminPass)
    : safeEquals(currentPassword, adminPass);

  if (!currentOk) {
    res.status(400).json({ error: { message: 'Contraseña actual incorrecta', code: 'AUTH_INVALID' } });
    return;
  }

  const trimmed = newPassword.trim();
  if (trimmed.length < 6) {
    res.status(400).json({ error: { message: 'La nueva contraseña debe tener al menos 6 caracteres', code: 'VALIDATION_ERROR' } });
    return;
  }

  try {
    const hashed = await bcrypt.hash(trimmed, BCRYPT_ROUNDS);
    writeFileSync(ADMIN_PASSWORD_FILE, hashed, 'utf8');
    res.json({ success: true, message: 'Contraseña actualizada' });
  } catch (err) {
    res.status(500).json({ error: { message: 'No se pudo guardar la contraseña', code: 'INTERNAL_ERROR' } });
  }
};
