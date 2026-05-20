// Course routes
import { Router } from 'express';
import { prisma, authenticate, requireRole, audit } from '../lib/db.js';

const router = Router();
router.use(authenticate);

// GET /api/courses?year=
router.get('/', async (req, res, next) => {
  try {
    const where = {};
    if (req.query.year) where.year = parseInt(req.query.year);
    const courses = await prisma.course.findMany({
      where, include: { files: true }, orderBy: { date: 'asc' },
    });
    res.json({ data: courses });
  } catch (err) { next(err); }
});

// POST /api/courses
router.post('/', requireRole('ADMIN', 'COORDINATOR', 'TRAINER'), async (req, res, next) => {
  try {
    const c = req.body;
    const course = await prisma.course.create({
      data: {
        title: c.title, category: c.category || 'course',
        date: c.date || null, year: parseInt(c.year) || 2026,
        sessions: parseInt(c.sessions) || 1,
        totalAttendance: parseInt(c.totalAttendance) || 0,
        speaker: c.speaker || null, jobTitle: c.jobTitle || null,
        department: c.department || null, pathway: c.pathway || null,
        hospital: c.hospital || null, description: c.description || null,
      },
    });
    await audit(req.user.id, 'create_course', course.title, req.ip);
    res.status(201).json({ data: course });
  } catch (err) { next(err); }
});

// PUT /api/courses/:id
router.put('/:id', requireRole('ADMIN', 'COORDINATOR', 'TRAINER'), async (req, res, next) => {
  try {
    const course = await prisma.course.update({ where: { id: req.params.id }, data: req.body });
    await audit(req.user.id, 'edit_course', course.title, req.ip);
    res.json({ data: course });
  } catch (err) { next(err); }
});

// DELETE /api/courses/:id
router.delete('/:id', requireRole('ADMIN', 'COORDINATOR'), async (req, res, next) => {
  try {
    await prisma.course.delete({ where: { id: req.params.id } });
    await audit(req.user.id, 'delete_course', req.params.id, req.ip);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

export default router;
