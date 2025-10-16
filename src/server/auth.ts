// server/auth.ts
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const SECRET = process.env.JWT_SECRET ?? 'dev-secret';
const TTL = '7d';

export function signToken(userId: string) {
  return jwt.sign({ sub: userId }, SECRET, { expiresIn: TTL });
}

export function verifyToken(token?: string): string | null {
  if (!token) return null;
  try {
    const payload = jwt.verify(token, SECRET) as { sub?: string };
    return payload.sub ?? null;
  } catch {
    return null;
  }
}

// Express middleware to protect routes (expects Authorization: Bearer <token>)
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const h = req.header('authorization') ?? '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : undefined;
  const sub = verifyToken(token);
  if (!sub) return res.status(401).json({ error: 'unauthorized' });
  (req as any).userId = sub;
  next();
}
