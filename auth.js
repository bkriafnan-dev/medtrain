// Auth routes
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma, signToken, authenticate, audit } from '../lib/db.js';

const router = Router();

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user || !user.active) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });
    await audit(user.id, 'login', user.email, req.ip);
    const token = signToken(user);
    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, email: true, name: true, role: true, active: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout (client just discards token; we log it)
router.post('/logout', authenticate, async (req, res) => {
  await audit(req.user.id, 'logout', req.user.email, req.ip);
  res.json({ ok: true });
});

export default router;
