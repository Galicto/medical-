import { Request, Response } from 'express';
import prisma from '../prisma/client';

export const getDashboardStats = async (req: any, res: Response) => {
    try {
        const doctor = await prisma.doctor.findUnique({ where: { userId: req.user.id } });
        if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const appointmentsToday = await prisma.appointment.count({
            where: { doctorId: doctor.id, date: { gte: today, lt: tomorrow } }
        });

        const completedToday = await prisma.appointment.count({
            where: { doctorId: doctor.id, date: { gte: today, lt: tomorrow }, status: 'COMPLETED' }
        });

        const pendingReviews = await prisma.appointment.count({
            where: { doctorId: doctor.id, status: 'PENDING' }
        });

        const totalPatientsRaw = await prisma.appointment.groupBy({
            by: ['patientId'],
            where: { doctorId: doctor.id }
        });
        const totalPatients = totalPatientsRaw.length;

        // Also get today's appointments for the dashboard
        const todayAppointments = await prisma.appointment.findMany({
            where: { doctorId: doctor.id, date: { gte: today, lt: tomorrow } },
            include: { patient: { include: { user: { select: { name: true } } } } },
            orderBy: { date: 'asc' }
        });

        res.json({
            appointmentsToday,
            completedToday,
            pendingReviews,
            totalPatients,
            todayAppointments
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching stats' });
    }
};

export const getDoctorPatients = async (req: any, res: Response) => {
    try {
        const doctor = await prisma.doctor.findUnique({ where: { userId: req.user.id } });
        if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

        // Get unique patients that had appointments with this doctor
        const appointments = await prisma.appointment.findMany({
            where: { doctorId: doctor.id },
            include: { patient: { include: { user: { select: { name: true, email: true, phone: true } } } } },
            distinct: ['patientId']
        });
        
        const patients = appointments.map(a => a.patient);
        res.json(patients);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const getDoctorPrescriptions = async (req: any, res: Response) => {
    try {
        const doctor = await prisma.doctor.findUnique({ where: { userId: req.user.id } });
        if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

        const prescriptions = await prisma.prescription.findMany({
            where: { doctorId: doctor.id },
            include: { patient: { include: { user: { select: { name: true } } } }, appointment: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(prescriptions);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const getDailyAppointments = async (req: any, res: Response) => {
    try {
        const doctor = await prisma.doctor.findUnique({ where: { userId: req.user.id } });
        if (!doctor) return res.status(404).json({ message: 'Doctor record not found' });

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const appointments = await prisma.appointment.findMany({
            where: {
                doctorId: doctor.id,
                date: {
                    gte: today, // Modified to just fetch ALL appointments to match DoctorAppointments.tsx generic view, or we can use getDashboardStats for today's. Let's remove date filter so DoctorAppointments tab works completely.
                }
            },
            include: { patient: { include: { user: { select: { name: true } } } } },
            orderBy: { date: 'desc' }
        });
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const getPatientDetails = async (req: any, res: Response) => {
    try {
        const patient = await prisma.patient.findUnique({
            where: { id: req.params.id },
            include: {
                user: { select: { name: true, email: true, phone: true } },
                prescriptions: { orderBy: { createdAt: 'desc' }, take: 5 },
                labReports: { orderBy: { createdAt: 'desc' }, take: 5 }
            }
        });
        if (!patient) return res.status(404).json({ message: 'Patient not found' });
        res.json(patient);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const addPrescription = async (req: any, res: Response) => {
    const { appointmentId, patientId, medicines, notes } = req.body;
    try {
        const doctor = await prisma.doctor.findUnique({ where: { userId: req.user.id } });
        if (!doctor) return res.status(404).json({ message: 'Doctor record not found' });

        const prescription = await prisma.prescription.create({
            data: {
                appointmentId,
                doctorId: doctor.id,
                patientId,
                medicines: JSON.stringify(medicines),
                notes
            }
        });

        // Auto mark appointment as completed
        await prisma.appointment.update({
            where: { id: appointmentId },
            data: { status: 'COMPLETED' }
        });

        res.status(201).json(prescription);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
