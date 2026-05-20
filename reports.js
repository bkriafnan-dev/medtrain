// Reports & analytics routes
import { Router } from 'express';
import { prisma, authenticate } from '../lib/db.js';

const router = Router();
router.use(authenticate);

// GET /api/reports/dashboard
router.get('/dashboard', async (req, res, next) => {
  try {
    const [totalTrainees, byProgram, bySpecialty, totalCourses, totalOrientation] = await Promise.all([
      prisma.trainee.count(),
      prisma.trainee.groupBy({ by: ['programCode'], _count: true }),
      prisma.trainee.groupBy({ by: ['specialtyId'], _count: true }),
      prisma.course.count(),
      prisma.orientationSession.count(),
    ]);
    res.json({
      totalTrainees, totalCourses, totalOrientation,
      byProgram: byProgram.map(p => ({ program: p.programCode, count: p._count })),
      bySpecialtyCount: bySpecialty.length,
    });
  } catch (err) { next(err); }
});

// GET /api/reports/by-specialty
router.get('/by-specialty', async (req, res, next) => {
  try {
    const specialties = await prisma.specialty.findMany({
      include: { _count: { select: { trainees: true } } },
      orderBy: { nameEn: 'asc' },
    });
    res.json({
      data: specialties.map(s => ({
        id: s.id, name_en: s.nameEn, name_ar: s.nameAr,
        color: s.color, count: s._count.trainees,
      })).filter(s => s.count > 0),
    });
  } catch (err) { next(err); }
});

export default router;
