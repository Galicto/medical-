import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// ── Prisma setup (SQLite in /tmp for Vercel read-only FS) ────────────────────
let dbUrl = process.env.DATABASE_URL || '';
if (!dbUrl) {
  const sourcePath = path.join(process.cwd(), 'prisma', 'dev.db');
  const targetPath = '/tmp/dev.db';
  try {
    if (fs.existsSync(sourcePath) && !fs.existsSync(targetPath)) {
      fs.copyFileSync(sourcePath, targetPath);
    }
    dbUrl = `file:${targetPath}`;
  } catch (e) {
    dbUrl = `file:${sourcePath}`;
  }
}

const prisma = new PrismaClient({ datasources: { db: { url: dbUrl } } });

// ── Auth helpers ─────────────────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET || 'medlife_secret_key_2024';

function generateToken(id: string): string {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' });
}

function protect(req: Request & { user?: any }, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Not authorized' });
    return;
  }
  try {
    const decoded: any = jwt.verify(auth.split(' ')[1], JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Token invalid' });
  }
}

function authorize(...roles: string[]) {
  return (req: Request & { user?: any }, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }
    next();
  };
}

// ── Express app ──────────────────────────────────────────────────────────────
const app = express();
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// ── AUTH routes ──────────────────────────────────────────────────────────────
app.post('/api/auth/register', async (req: Request, res: Response) => {
  const { name, email, password, role = 'PATIENT' } = req.body;
  try {
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) { res.status(400).json({ message: 'User already exists' }); return; }
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { name, email, password: hashed, role } });
    if (role === 'PATIENT') await prisma.patient.create({ data: { userId: user.id } });
    const token = generateToken(user.id);
    res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (e: any) { res.status(500).json({ message: e.message }); }
});

app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) { res.status(401).json({ message: 'Invalid credentials' }); return; }
    const match = await bcrypt.compare(password, user.password);
    if (!match) { res.status(401).json({ message: 'Invalid credentials' }); return; }
    const token = generateToken(user.id);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (e: any) { res.status(500).json({ message: e.message }); }
});

// ── PATIENT routes ───────────────────────────────────────────────────────────
app.get('/api/patient/dashboard', protect, authorize('PATIENT'), async (req: Request & { user?: any }, res: Response) => {
  try {
    const patient = await prisma.patient.findUnique({ where: { userId: req.user.id } });
    if (!patient) { res.status(404).json({ message: 'Patient not found' }); return; }
    const [upcomingAppointments, prescriptions, invoices] = await Promise.all([
      prisma.appointment.findMany({ where: { patientId: patient.id, date: { gte: new Date() }, status: { in: ['PENDING', 'CONFIRMED'] } }, include: { doctor: { include: { user: true } } }, orderBy: { date: 'asc' }, take: 5 }),
      prisma.prescription.findMany({ where: { patientId: patient.id }, include: { doctor: { include: { user: true } } }, orderBy: { createdAt: 'desc' }, take: 3 }),
      prisma.invoice.findMany({ where: { patientId: patient.id } })
    ]);
    const pendingInvoices = invoices.filter((i: any) => i.status === 'PENDING');
    res.json({ upcomingAppointments, prescriptions, stats: { totalAppointments: invoices.length + (await prisma.appointment.count({ where: { patientId: patient.id } })), activePrescriptions: prescriptions.length, pendingBillsCount: pendingInvoices.length, pendingAmount: pendingInvoices.reduce((a: number, b: any) => a + b.totalAmount, 0) } });
  } catch (e: any) { res.status(500).json({ message: e.message }); }
});

app.get('/api/patient/doctors', protect, async (_req, res: Response) => {
  try {
    const doctors = await prisma.doctor.findMany({ include: { user: true } });
    res.json(doctors);
  } catch (e: any) { res.status(500).json({ message: e.message }); }
});

app.get('/api/patient/appointments', protect, authorize('PATIENT'), async (req: Request & { user?: any }, res: Response) => {
  try {
    const patient = await prisma.patient.findUnique({ where: { userId: req.user.id } });
    if (!patient) { res.status(404).json({ message: 'Not found' }); return; }
    const appts = await prisma.appointment.findMany({ where: { patientId: patient.id }, include: { doctor: { include: { user: true } } }, orderBy: { date: 'desc' } });
    res.json(appts);
  } catch (e: any) { res.status(500).json({ message: e.message }); }
});

app.post('/api/patient/appointments', protect, authorize('PATIENT'), async (req: Request & { user?: any }, res: Response) => {
  try {
    const patient = await prisma.patient.findUnique({ where: { userId: req.user.id } });
    if (!patient) { res.status(404).json({ message: 'Not found' }); return; }
    const { doctorId, date, reason } = req.body;
    const appt = await prisma.appointment.create({ data: { patientId: patient.id, doctorId, date: new Date(date), reason, status: 'PENDING' } });
    res.status(201).json(appt);
  } catch (e: any) { res.status(500).json({ message: e.message }); }
});

app.put('/api/patient/appointments/:id/cancel', protect, authorize('PATIENT'), async (req: Request, res: Response) => {
  try {
    const appt = await prisma.appointment.update({ where: { id: req.params.id }, data: { status: 'CANCELLED' } });
    res.json(appt);
  } catch (e: any) { res.status(500).json({ message: e.message }); }
});

app.get('/api/patient/prescriptions', protect, authorize('PATIENT'), async (req: Request & { user?: any }, res: Response) => {
  try {
    const patient = await prisma.patient.findUnique({ where: { userId: req.user.id } });
    if (!patient) { res.status(404).json({ message: 'Not found' }); return; }
    const rxs = await prisma.prescription.findMany({ where: { patientId: patient.id }, include: { doctor: { include: { user: true } } }, orderBy: { createdAt: 'desc' } });
    res.json(rxs);
  } catch (e: any) { res.status(500).json({ message: e.message }); }
});

app.get('/api/patient/billing', protect, authorize('PATIENT'), async (req: Request & { user?: any }, res: Response) => {
  try {
    const patient = await prisma.patient.findUnique({ where: { userId: req.user.id } });
    if (!patient) { res.status(404).json({ message: 'Not found' }); return; }
    const invoices = await prisma.invoice.findMany({ where: { patientId: patient.id }, orderBy: { createdAt: 'desc' } });
    res.json(invoices);
  } catch (e: any) { res.status(500).json({ message: e.message }); }
});

// ── DOCTOR routes ────────────────────────────────────────────────────────────
app.get('/api/doctor/dashboard', protect, authorize('DOCTOR'), async (req: Request & { user?: any }, res: Response) => {
  try {
    const doctor = await prisma.doctor.findUnique({ where: { userId: req.user.id } });
    if (!doctor) { res.status(404).json({ message: 'Not found' }); return; }
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const [todayAppts, totalPatients, totalRx, upcomingAppts] = await Promise.all([
      prisma.appointment.count({ where: { doctorId: doctor.id, date: { gte: today, lt: tomorrow } } }),
      prisma.appointment.groupBy({ by: ['patientId'], where: { doctorId: doctor.id } }),
      prisma.prescription.count({ where: { doctorId: doctor.id } }),
      prisma.appointment.findMany({ where: { doctorId: doctor.id, date: { gte: new Date() }, status: { in: ['PENDING', 'CONFIRMED'] } }, include: { patient: { include: { user: true } } }, orderBy: { date: 'asc' }, take: 5 })
    ]);
    res.json({ stats: { todayAppointments: todayAppts, totalPatients: totalPatients.length, totalPrescriptions: totalRx, completedToday: 0 }, upcomingAppointments: upcomingAppts });
  } catch (e: any) { res.status(500).json({ message: e.message }); }
});

app.get('/api/doctor/appointments', protect, authorize('DOCTOR'), async (req: Request & { user?: any }, res: Response) => {
  try {
    const doctor = await prisma.doctor.findUnique({ where: { userId: req.user.id } });
    if (!doctor) { res.status(404).json({ message: 'Not found' }); return; }
    const appts = await prisma.appointment.findMany({ where: { doctorId: doctor.id }, include: { patient: { include: { user: true } } }, orderBy: { date: 'desc' } });
    res.json(appts);
  } catch (e: any) { res.status(500).json({ message: e.message }); }
});

app.get('/api/doctor/patients', protect, authorize('DOCTOR'), async (req: Request & { user?: any }, res: Response) => {
  try {
    const doctor = await prisma.doctor.findUnique({ where: { userId: req.user.id } });
    if (!doctor) { res.status(404).json({ message: 'Not found' }); return; }
    const appts = await prisma.appointment.findMany({ where: { doctorId: doctor.id }, select: { patient: { include: { user: true } } } });
    const unique = Array.from(new Map(appts.map((a: any) => [a.patient.id, a.patient])).values());
    res.json(unique);
  } catch (e: any) { res.status(500).json({ message: e.message }); }
});

app.get('/api/doctor/prescriptions', protect, authorize('DOCTOR'), async (req: Request & { user?: any }, res: Response) => {
  try {
    const doctor = await prisma.doctor.findUnique({ where: { userId: req.user.id } });
    if (!doctor) { res.status(404).json({ message: 'Not found' }); return; }
    const rxs = await prisma.prescription.findMany({ where: { doctorId: doctor.id }, include: { patient: { include: { user: true } }, appointment: true }, orderBy: { createdAt: 'desc' } });
    res.json(rxs);
  } catch (e: any) { res.status(500).json({ message: e.message }); }
});

app.post('/api/doctor/prescriptions', protect, authorize('DOCTOR'), async (req: Request & { user?: any }, res: Response) => {
  try {
    const doctor = await prisma.doctor.findUnique({ where: { userId: req.user.id } });
    if (!doctor) { res.status(404).json({ message: 'Not found' }); return; }
    const { appointmentId, patientId, medicines, notes } = req.body;
    const rx = await prisma.prescription.create({ data: { appointmentId, doctorId: doctor.id, patientId, medicines: JSON.stringify(medicines), notes } });
    await prisma.appointment.update({ where: { id: appointmentId }, data: { status: 'COMPLETED' } });
    res.status(201).json(rx);
  } catch (e: any) { res.status(500).json({ message: e.message }); }
});

// ── RECEPTIONIST routes ──────────────────────────────────────────────────────
app.get('/api/receptionist/dashboard', protect, authorize('RECEPTIONIST'), async (_req, res: Response) => {
  try {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const [patients, todayAppts, pendingInvoices, totalRevenue] = await Promise.all([
      prisma.patient.count(),
      prisma.appointment.count({ where: { date: { gte: today, lt: tomorrow } } }),
      prisma.invoice.count({ where: { status: 'PENDING' } }),
      prisma.invoice.aggregate({ where: { status: 'PAID' }, _sum: { totalAmount: true } })
    ]);
    res.json({ stats: { totalPatients: patients, todayAppointments: todayAppts, pendingBills: pendingInvoices, totalRevenue: totalRevenue._sum.totalAmount || 0 } });
  } catch (e: any) { res.status(500).json({ message: e.message }); }
});

app.get('/api/receptionist/patients', protect, authorize('RECEPTIONIST'), async (_req, res: Response) => {
  try {
    const patients = await prisma.patient.findMany({ include: { user: true }, orderBy: { user: { name: 'asc' } } });
    res.json(patients);
  } catch (e: any) { res.status(500).json({ message: e.message }); }
});

app.get('/api/receptionist/appointments', protect, authorize('RECEPTIONIST'), async (_req, res: Response) => {
  try {
    const appts = await prisma.appointment.findMany({ include: { patient: { include: { user: true } }, doctor: { include: { user: true } } }, orderBy: { date: 'desc' } });
    res.json(appts);
  } catch (e: any) { res.status(500).json({ message: e.message }); }
});

app.post('/api/receptionist/appointments', protect, authorize('RECEPTIONIST'), async (req: Request, res: Response) => {
  try {
    const { patientId, doctorId, date, reason } = req.body;
    const appt = await prisma.appointment.create({ data: { patientId, doctorId, date: new Date(date), reason, status: 'CONFIRMED' } });
    res.status(201).json(appt);
  } catch (e: any) { res.status(500).json({ message: e.message }); }
});

app.put('/api/receptionist/appointments/:id', protect, authorize('RECEPTIONIST'), async (req: Request, res: Response) => {
  try {
    const appt = await prisma.appointment.update({ where: { id: req.params.id }, data: req.body });
    res.json(appt);
  } catch (e: any) { res.status(500).json({ message: e.message }); }
});

app.get('/api/receptionist/invoices', protect, authorize('RECEPTIONIST'), async (_req, res: Response) => {
  try {
    const invoices = await prisma.invoice.findMany({ include: { patient: { include: { user: true } } }, orderBy: { createdAt: 'desc' } });
    res.json(invoices);
  } catch (e: any) { res.status(500).json({ message: e.message }); }
});

app.post('/api/receptionist/billing', protect, authorize('RECEPTIONIST'), async (req: Request, res: Response) => {
  try {
    const { patientId, appointmentId, totalAmount, items } = req.body;
    const invoice = await prisma.invoice.create({ data: { patientId, appointmentId, totalAmount, items: JSON.stringify(items), status: 'PENDING' } });
    res.status(201).json(invoice);
  } catch (e: any) { res.status(500).json({ message: e.message }); }
});

// ── ADMIN routes ─────────────────────────────────────────────────────────────
app.get('/api/admin/dashboard', protect, authorize('ADMIN'), async (_req, res: Response) => {
  try {
    const [patients, doctors, appts, revenue, topDoctors] = await Promise.all([
      prisma.patient.count(),
      prisma.doctor.count(),
      prisma.appointment.count(),
      prisma.invoice.aggregate({ where: { status: 'PAID' }, _sum: { totalAmount: true } }),
      prisma.doctor.findMany({ include: { user: true, _count: { select: { appointments: true } } }, orderBy: { appointments: { _count: 'desc' } }, take: 5 })
    ]);
    res.json({ stats: { totalPatients: patients, totalDoctors: doctors, totalAppointments: appts, totalRevenue: revenue._sum.totalAmount || 0 }, topDoctors });
  } catch (e: any) { res.status(500).json({ message: e.message }); }
});

app.get('/api/admin/doctors', protect, authorize('ADMIN'), async (_req, res: Response) => {
  try {
    const doctors = await prisma.doctor.findMany({ include: { user: true, _count: { select: { appointments: true } } } });
    res.json(doctors);
  } catch (e: any) { res.status(500).json({ message: e.message }); }
});

app.get('/api/admin/patients', protect, authorize('ADMIN'), async (_req, res: Response) => {
  try {
    const patients = await prisma.patient.findMany({ include: { user: true, _count: { select: { appointments: true } } } });
    res.json(patients);
  } catch (e: any) { res.status(500).json({ message: e.message }); }
});

app.get('/api/admin/billing', protect, authorize('ADMIN'), async (_req, res: Response) => {
  try {
    const invoices = await prisma.invoice.findMany({ include: { patient: { include: { user: true } } }, orderBy: { createdAt: 'desc' } });
    res.json(invoices);
  } catch (e: any) { res.status(500).json({ message: e.message }); }
});

app.get('/api/admin/users', protect, authorize('ADMIN'), async (_req, res: Response) => {
  try {
    const users = await prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, createdAt: true } });
    res.json(users);
  } catch (e: any) { res.status(500).json({ message: e.message }); }
});

app.post('/api/admin/users', protect, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { name, email, password: hashed, role } });
    res.status(201).json(user);
  } catch (e: any) { res.status(500).json({ message: e.message }); }
});

app.delete('/api/admin/users/:id', protect, authorize('ADMIN'), async (req: Request, res: Response) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (e: any) { res.status(500).json({ message: e.message }); }
});

// ── Error handler ────────────────────────────────────────────────────────────
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
