import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../prisma/client';

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const totalPatients = await prisma.patient.count();
        const totalDoctors = await prisma.doctor.count();
        
        // Appointments today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        const appointmentsToday = await prisma.appointment.count({
            where: { date: { gte: startOfDay, lte: endOfDay } }
        });

        const pendingAppointments = await prisma.appointment.count({ where: { status: 'PENDING' } });
        const revenueAggr = await prisma.invoice.aggregate({
            _sum: { totalAmount: true },
            where: { status: 'PAID' }
        });

        // Recent Patients with their appointments
        const recentPatients = await prisma.patient.findMany({
            take: 5,
            orderBy: { user: { createdAt: 'desc' } },
            include: { user: { select: { name: true } }, appointments: { include: { doctor: { include: { user: { select: { name: true } } } } }, take: 1, orderBy: { date: 'desc' } } }
        });

        // Department Stats
        const doctors = await prisma.doctor.findMany({ include: { appointments: { include: { invoice: true } } } });
        const deptStatsMap: any = {};
        doctors.forEach(doc => {
            if (!deptStatsMap[doc.specialization]) deptStatsMap[doc.specialization] = { patients: 0, revenue: 0 };
            deptStatsMap[doc.specialization].patients += doc.appointments.length;
            doc.appointments.forEach(appt => {
                if (appt.invoice && appt.invoice.status === 'PAID') {
                    deptStatsMap[doc.specialization].revenue += appt.invoice.totalAmount;
                }
            });
        });

        const departmentData = Object.keys(deptStatsMap).map(key => ({
            name: key,
            patients: deptStatsMap[key].patients,
            revenue: `₹${(deptStatsMap[key].revenue / 100000).toFixed(1)}L`,
            color: '#6366F1'
        }));

        res.json({
            totalPatients,
            totalDoctors,
            appointmentsToday,
            pendingAppointments,
            totalRevenue: revenueAggr._sum.totalAmount || 0,
            recentPatients,
            departmentData
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const getAdminDoctors = async (req: Request, res: Response) => {
    try {
        const doctors = await prisma.doctor.findMany({
            include: { user: { select: { name: true, email: true, phone: true } }, appointments: true }
        });
        res.json(doctors);
    } catch (err) { res.status(500).json({ message: 'Error' }); }
};

export const getAdminPatients = async (req: Request, res: Response) => {
    try {
        const patients = await prisma.patient.findMany({
            include: { user: { select: { name: true, email: true, phone: true } }, appointments: { take: 1, orderBy: { date: 'desc' }, include: { doctor: { include: { user: { select: { name: true} } } } } } }
        });
        res.json(patients);
    } catch (err) { res.status(500).json({ message: 'Error' }); }
};

export const getAdminBilling = async (req: Request, res: Response) => {
    try {
        const invoices = await prisma.invoice.findMany({
            include: { patient: { include: { user: { select: { name: true } } } }, appointment: { include: { doctor: { include: { user: { select: { name: true } } } } } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(invoices);
    } catch (err) { res.status(500).json({ message: 'Error' }); }
};

export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, name: true, email: true, role: true, createdAt: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const addUser = async (req: Request, res: Response) => {
    const { name, email, password, role, department, specialization, availability } = req.body;
    try {
        const userExists = await prisma.user.findUnique({ where: { email } });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await prisma.user.create({
            data: { name, email, password: hashedPassword, role }
        });

        if (role === 'DOCTOR') {
            await prisma.doctor.create({
                data: {
                    userId: user.id,
                    specialization,
                    availability: JSON.stringify(availability || {})
                }
            });
        } else if (role === 'RECEPTIONIST') {
            await prisma.staff.create({
                data: { userId: user.id, department: department || 'Reception' }
            });
        }

        res.status(201).json({ id: user.id, name: user.name, role: user.role });
    } catch (error) {
        res.status(500).json({ message: 'Server error adding user' });
    }
};

export const removeUser = async (req: Request, res: Response) => {
    try {
        // Simple deletion by ID, cascading might be needed based on relations
        await prisma.user.delete({ where: { id: req.params.id as string } });
        res.json({ message: 'User removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error removing user' });
    }
};
