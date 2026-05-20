// Shared library: Prisma client + auth helpers
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

export const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'change-this-secret-in-production';

export function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Middleware: require valid JWT
export function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const token = header.slice(7);
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Middleware: require specific role(s)
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

// Helper: write audit log
export async function audit(userId, action, target, ip) {
  try {
    await prisma.auditLog.create({
      data: { userId: userId || null, action, target: target || null, ip: ip || null },
    });
  } catch (e) {
    console.warn('Audit log failed:', e.message);
  }
}
