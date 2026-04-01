import { Request, Response } from 'express';
import prisma from '../prisma/client';

export const getDoctors = async (req: Request, res: Response) => {
    try {
        const doctors = await prisma.doctor.findMany({
            include: { user: { select: { name: true } } }
        });
        
        // Format for frontend
        const formattedDoctors = doctors.map(d => ({
            id: d.id,
            name: d.user.name,
            specialization: d.specialization,
            location: 'Consultation Room' // Mock location since we removed it
        }));
        res.json(formattedDoctors);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching doctors' });
    }
};

export const getDashboardStats = async (req: any, res: Response) => {
    try {
        const patient = await prisma.patient.findUnique({ where: { userId: req.user.id } });
        if (!patient) return res.status(404).json({ message: 'Patient not found' });

        const today = new Date();
        const upcomingAppointments = await prisma.appointment.findMany({
            where: { patientId: patient.id, date: { gte: today }, status: { in: ['CONFIRMED', 'PENDING'] } },
            include: { doctor: { include: { user: { select: { name: true } } } } },
            orderBy: { date: 'asc' },
            take: 3
        });

        const prescriptions = await prisma.prescription.findMany({
            where: { patientId: patient.id },
            include: { doctor: { include: { user: { select: { name: true } } } } },
            orderBy: { createdAt: 'desc' },
            take: 3
        });

        const totalAppointments = await prisma.appointment.count({ where: { patientId: patient.id } });
        const activePrescriptions = await prisma.prescription.count({ where: { patientId: patient.id } }); // simplifying active logic
        const pendingBillsRaw = await prisma.invoice.aggregate({
            _sum: { totalAmount: true },
            where: { patientId: patient.id, status: 'PENDING' }
        });
        const pendingBillsCount = await prisma.invoice.count({ where: { patientId: patient.id, status: 'PENDING' } });

        res.json({
            upcomingAppointments,
            prescriptions,
            stats: {
                totalAppointments,
                activePrescriptions,
                pendingBillsCount,
                pendingAmount: pendingBillsRaw._sum.totalAmount || 0
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching patient dashboard stats' });
    }
};

export const getAppointments = async (req: any, res: Response) => {
    try {
        const patient = await prisma.patient.findUnique({ where: { userId: req.user.id } });
        if (!patient) return res.status(404).json({ message: 'Patient record not found' });

        const appointments = await prisma.appointment.findMany({
            where: { patientId: patient.id },
            include: { doctor: { include: { user: { select: { name: true } } } } },
            orderBy: { date: 'desc' }
        });
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const bookAppointment = async (req: any, res: Response) => {
    const { doctorId, date, reason } = req.body;
    try {
        const patient = await prisma.patient.findUnique({ where: { userId: req.user.id } });
        if (!patient) return res.status(404).json({ message: 'Patient record not found' });

        const appointment = await prisma.appointment.create({
            data: {
                patientId: patient.id,
                doctorId,
                date: new Date(date),
                reason,
                status: 'PENDING'
            }
        });
        res.status(201).json(appointment);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const cancelAppointment = async (req: any, res: Response) => {
    try {
        const appointment = await prisma.appointment.update({
            where: { id: req.params.id },
            data: { status: 'CANCELLED' }
        });
        res.json(appointment);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const getPrescriptions = async (req: any, res: Response) => {
    try {
        const patient = await prisma.patient.findUnique({ where: { userId: req.user.id } });
        if (!patient) return res.status(404).json({ message: 'Patient record not found' });

        const prescriptions = await prisma.prescription.findMany({
            where: { patientId: patient.id },
            include: { doctor: { include: { user: { select: { name: true } } } }, appointment: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(prescriptions);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const getBilling = async (req: any, res: Response) => {
    try {
        const patient = await prisma.patient.findUnique({ where: { userId: req.user.id } });
        if (!patient) return res.status(404).json({ message: 'Patient record not found' });

        const invoices = await prisma.invoice.findMany({
            where: { patientId: patient.id },
            include: { appointment: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
