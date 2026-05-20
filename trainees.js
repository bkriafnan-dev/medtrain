// Trainee routes — full CRUD with search, filter, pagination
import { Router } from 'express';
import { z } from 'zod';
import { prisma, authenticate, requireRole, audit } from '../lib/db.js';

const router = Router();
router.use(authenticate); // all trainee routes require login

// GET /api/trainees?page=1&limit=50&search=&program=&specialty=&status=
router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(200, parseInt(req.query.limit) || 50);
    const { search, program, specialty, status } = req.query;

    const where = {};
    if (search) where.name = { contains: search, mode: 'insensitive' };
    if (program) where.programCode = program;
    if (specialty) where.specialtyId = specialty;
    if (status) where.status = status.toUpperCase();

    const [total, trainees] = await Promise.all([
      prisma.trainee.count({ where }),
      prisma.trainee.findMany({
        where,
        include: { specialty: true, programType: true },
        orderBy: { name: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    res.json({
      data: trainees,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/trainees/:id
router.get('/:id', async (req, res, next) => {
  try {
    const trainee = await prisma.trainee.findUnique({
      where: { id: req.params.id },
      include: { specialty: true, programType: true },
    });
    if (!trainee) return res.status(404).json({ error: 'Trainee not found' });
    res.json({ data: trainee });
  } catch (err) {
    next(err);
  }
});

const traineeSchema = z.object({
  name: z.string().min(1),
  specialtyId: z.string().nullable().optional(),
  programCode: z.string(),
  status: z.enum(['ACTIVE', 'COMPLETED', 'INACTIVE']).optional(),
  gender: z.string().optional(),
  email: z.string().email().nullable().optional().or(z.literal('')),
  mobile: z.string().nullable().optional(),
  nationalId: z.string().nullable().optional(),
  university: z.string().nullable().optional(),
  startDate: z.string().nullable().optional(),
  revenue: z.number().optional(),
  certs: z.any().optional(),
});

// POST /api/trainees  (admin + coordinator)
router.post('/', requireRole('ADMIN', 'COORDINATOR'), async (req, res, next) => {
  try {
    const parsed = traineeSchema.parse(req.body);
    const programType = await prisma.programType.findUnique({ where: { code: parsed.programCode } });
    const trainee = await prisma.trainee.create({
      data: {
        ...parsed,
        programTypeId: programType?.id || null,
        email: parsed.email || null,
      },
    });
    await audit(req.user.id, 'create_trainee', trainee.name, req.ip);
    res.status(201).json({ data: trainee });
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: err.errors });
    next(err);
  }
});

// PUT /api/trainees/:id  (admin + coordinator)
router.put('/:id', requireRole('ADMIN', 'COORDINATOR'), async (req, res, next) => {
  try {
    const parsed = traineeSchema.partial().parse(req.body);
    const data = { ...parsed };
    if (parsed.programCode) {
      const pt = await prisma.programType.findUnique({ where: { code: parsed.programCode } });
      data.programTypeId = pt?.id || null;
    }
    if (parsed.email === '') data.email = null;
    const trainee = await prisma.trainee.update({ where: { id: req.params.id }, data });
    await audit(req.user.id, 'edit_trainee', trainee.name, req.ip);
    res.json({ data: trainee });
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: err.errors });
    next(err);
  }
});

// DELETE /api/trainees/:id  (admin only)
router.delete('/:id', requireRole('ADMIN'), async (req, res, next) => {
  try {
    const trainee = await prisma.trainee.delete({ where: { id: req.params.id } });
    await audit(req.user.id, 'delete_trainee', trainee.name, req.ip);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
