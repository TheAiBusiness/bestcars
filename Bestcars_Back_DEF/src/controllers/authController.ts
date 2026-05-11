import { type Request, type Response } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../config/database.js';
import { signAdminToken, type AuthPayload } from '../middleware/auth.js';

interface LoginBody {
  username: string;
  password: string;
}

interface ChangePasswordBody {
  currentPassword: string;
  newPassword: string;
}

const BCRYPT_ROUNDS = 12;
const MIN_PASSWORD_LENGTH = 8;
const isProduction = process.env.NODE_ENV === 'production';

let bootstrapPromise: Promise<void> | null = null;

async function bootstrapIfEmpty(): Promise<void> {
  if (bootstrapPromise) return bootstrapPromise;
  bootstrapPromise = (async () => {
    const count = await prisma.admin.count();
    if (count > 0) return;

    const username = process.env.ADMIN_USERNAME?.trim();
    const password = process.env.ADMIN_PASSWORD?.trim();

    if (!username || !password) {
      console.warn(
        '[auth] Admin table is empty and ADMIN_USERNAME/ADMIN_PASSWORD are not set. ' +
          'No admin can log in until you create one (set env vars and restart, or insert a row manually).'
      );
      return;
    }
    if (isProduction && password === 'admin') {
      console.error('[auth] Refusing to bootstrap admin with default password "admin" in production.');
      return;
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    try {
      await prisma.admin.create({ data: { username, passwordHash } });
      console.log(
        `[auth] Bootstrapped initial admin "${username}" from env. ` +
          'You can now change the password from the panel; ADMIN_PASSWORD env is no longer authoritative.'
      );
    } catch (err) {
      // Race condition: another request bootstrapped first. Verify before re-throwing.
      const exists = await prisma.admin.findUnique({ where: { username } });
      if (!exists) throw err;
    }
  })();

  try {
    await bootstrapPromise;
  } catch (err) {
    bootstrapPromise = null;
    throw err;
  }
}

export const login = async (req: Request<object, object, LoginBody>, res: Response): Promise<void> => {
  const { username, password } = req.body ?? ({} as LoginBody);

  if (!username || !password) {
    res.status(400).json({
      error: { message: 'username and password are required', code: 'VALIDATION_ERROR' },
    });
    return;
  }

  await bootstrapIfEmpty();

  const admin = await prisma.admin.findUnique({ where: { username } });
  const ok = admin ? await bcrypt.compare(password, admin.passwordHash) : false;

  if (!admin || !ok) {
    res.status(401).json({
      error: { message: 'Credenciales incorrectas', code: 'AUTH_INVALID' },
    });
    return;
  }

  const token = signAdminToken(admin.username);
  res.json({ token, role: 'admin' });
};

export const changePassword = async (
  req: Request<object, object, ChangePasswordBody>,
  res: Response
): Promise<void> => {
  const { currentPassword, newPassword } = req.body ?? ({} as ChangePasswordBody);

  if (!currentPassword || !newPassword || typeof newPassword !== 'string') {
    res.status(400).json({
      error: { message: 'currentPassword and newPassword are required', code: 'VALIDATION_ERROR' },
    });
    return;
  }

  const auth = (req as Request & { auth?: AuthPayload }).auth;
  if (!auth?.sub) {
    res.status(401).json({ error: { message: 'Unauthorized', code: 'AUTH_INVALID' } });
    return;
  }

  const admin = await prisma.admin.findUnique({ where: { username: auth.sub } });
  if (!admin) {
    res.status(401).json({
      error: { message: 'Credenciales incorrectas', code: 'AUTH_INVALID' },
    });
    return;
  }

  const currentOk = await bcrypt.compare(currentPassword, admin.passwordHash);
  if (!currentOk) {
    res.status(400).json({
      error: { message: 'Contraseña actual incorrecta', code: 'AUTH_INVALID' },
    });
    return;
  }

  const trimmed = newPassword.trim();
  if (trimmed.length < MIN_PASSWORD_LENGTH) {
    res.status(400).json({
      error: {
        message: `La nueva contraseña debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`,
        code: 'VALIDATION_ERROR',
      },
    });
    return;
  }

  const passwordHash = await bcrypt.hash(trimmed, BCRYPT_ROUNDS);
  await prisma.admin.update({ where: { id: admin.id }, data: { passwordHash } });
  res.json({ success: true, message: 'Contraseña actualizada' });
};
