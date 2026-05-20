// User management routes (admin only)
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma, authenticate, requireRole, audit } from '../lib/db.js';

const router = Router();
router.use(authenticate);

// GET /api/users (admin only)
router.get('/', requireRole('ADMIN'), async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, active: true, lastLogin: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ data: users });
  } catch (err) { next(err); }
});

// POST /api/users (admin only)
router.post('/', requireRole('ADMIN'), async (req, res, next) => {
  try {
    const { email, password, name, role } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: 'Missing fields' });
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash: await bcrypt.hash(password, 10),
        name, role: role || 'VIEWER',
      },
      select: { id: true, email: true, name: true, role: true },
    });
    await audit(req.user.id, 'create_user', email, req.ip);
    res.status(201).json({ data: user });
  } catch (err) {
    if (err.code === 'P2002') return res.status(400).json({ error: 'Email already exists' });
    next(err);
  }
});

// GET /api/users/audit (admin only)
router.get('/audit', requireRole('ADMIN'), async (req, res, next) => {
  try {
    const logs = await prisma.auditLog.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { timestamp: 'desc' }, take: 200,
    });
    res.json({ data: logs });
  } catch (err) { next(err); }
});

export default router;
