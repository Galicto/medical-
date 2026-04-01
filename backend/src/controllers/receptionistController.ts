import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../prisma/client';

export const getReceptionistStats = async (req: Request, res: Response) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const totalPatients = await prisma.patient.count();
        const appointmentsToday = await prisma.appointment.count({
            where: { date: { gte: today } }
        });
        const currentWaitlist = await prisma.appointment.count({
            where: { status: 'PENDING', date: { gte: today } }
        });
        const availableDoctors = await prisma.doctor.count();

        res.json({ totalPatients, appointmentsToday, currentWaitlist, availableDoctors });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const getAllPatients = async (req: Request, res: Response) => {
    try {
        const patients = await prisma.patient.findMany({
            include: { user: { select: { name: true, phone: true, email: true } }, appointments: { take: 1, orderBy: { date: 'desc' } } },
            orderBy: { user: { createdAt: 'desc' } }
        });
        res.json(patients);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const getAllAppointments = async (req: Request, res: Response) => {
    try {
        const appointments = await prisma.appointment.findMany({
            include: { patient: { include: { user: { select: { name: true } } } }, doctor: { include: { user: { select: { name: true } } } } },
            orderBy: { date: 'desc' }
        });
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const getAllInvoices = async (req: Request, res: Response) => {
    try {
        const invoices = await prisma.invoice.findMany({
            include: { patient: { include: { user: { select: { name: true } } } }, appointment: { include: { doctor: { include: { user: { select: { name: true } } } } } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const registerPatientOffline = async (req: Request, res: Response) => {
    const { name, email, phone, dob, gender, address, bloodGroup } = req.body;
    try {
        const userExists = await prisma.user.findUnique({ where: { email } });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('patient123', salt); // Default offline pass

        const user = await prisma.user.create({
            data: { name, email, phone, password: hashedPassword, role: 'PATIENT' }
        });

        const patient = await prisma.patient.create({
            data: {
                userId: user.id,
                dob: new Date(dob),
                gender,
                address,
                bloodGroup
            }
        });

        res.status(201).json({ user, patient });
    } catch (error) {
        res.status(500).json({ message: 'Server error during offline registration' });
    }
};

export const bookAppointmentForPatient = async (req: Request, res: Response) => {
    const { patientId, doctorId, date, reason } = req.body;
    try {
        const appointment = await prisma.appointment.create({
            data: {
                patientId, doctorId, date: new Date(date), reason, status: 'CONFIRMED'
            }
        });
        res.status(201).json(appointment);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const updateAppointmentStatus = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, date } = req.body;
    try {
        const appointment = await prisma.appointment.update({
            where: { id: id as string },
            data: { status, date: date ? new Date(date) : undefined }
        });
        res.json(appointment);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const generateBill = async (req: Request, res: Response) => {
    const { patientId, appointmentId, items, totalAmount } = req.body;
    try {
        const invoice = await prisma.invoice.create({
            data: {
                patientId,
                totalAmount,
                items: JSON.stringify(items),
                status: 'PENDING',
                appointmentId: appointmentId || undefined
            }
        });
        res.status(201).json(invoice);
    } catch (error) {
        res.status(500).json({ message: 'Server error generating bill' });
    }
};

export const getReceipt = async (req: Request, res: Response) => {
    try {
        const invoice = await prisma.invoice.findUnique({
            where: { id: req.params.id as string },
            include: { patient: { include: { user: true } }, appointment: true }
        });
        if (!invoice) return res.status(404).json({ message: 'Receipt not found' });
        res.json(invoice);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
