"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeUser = exports.addUser = exports.getUsers = exports.getAdminBilling = exports.getAdminPatients = exports.getAdminDoctors = exports.getDashboardStats = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = __importDefault(require("../prisma/client"));
const getDashboardStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const totalPatients = yield client_1.default.patient.count();
        const totalDoctors = yield client_1.default.doctor.count();
        // Appointments today
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        const appointmentsToday = yield client_1.default.appointment.count({
            where: { date: { gte: startOfDay, lte: endOfDay } }
        });
        const pendingAppointments = yield client_1.default.appointment.count({ where: { status: 'PENDING' } });
        const revenueAggr = yield client_1.default.invoice.aggregate({
            _sum: { totalAmount: true },
            where: { status: 'PAID' }
        });
        // Recent Patients with their appointments
        const recentPatients = yield client_1.default.patient.findMany({
            take: 5,
            orderBy: { user: { createdAt: 'desc' } },
            include: { user: { select: { name: true } }, appointments: { include: { doctor: { include: { user: { select: { name: true } } } } }, take: 1, orderBy: { date: 'desc' } } }
        });
        // Department Stats
        const doctors = yield client_1.default.doctor.findMany({ include: { appointments: { include: { invoice: true } } } });
        const deptStatsMap = {};
        doctors.forEach(doc => {
            if (!deptStatsMap[doc.specialization])
                deptStatsMap[doc.specialization] = { patients: 0, revenue: 0 };
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
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getDashboardStats = getDashboardStats;
const getAdminDoctors = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const doctors = yield client_1.default.doctor.findMany({
            include: { user: { select: { name: true, email: true, phone: true } }, appointments: true }
        });
        res.json(doctors);
    }
    catch (err) {
        res.status(500).json({ message: 'Error' });
    }
});
exports.getAdminDoctors = getAdminDoctors;
const getAdminPatients = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const patients = yield client_1.default.patient.findMany({
            include: { user: { select: { name: true, email: true, phone: true } }, appointments: { take: 1, orderBy: { date: 'desc' }, include: { doctor: { include: { user: { select: { name: true } } } } } } }
        });
        res.json(patients);
    }
    catch (err) {
        res.status(500).json({ message: 'Error' });
    }
});
exports.getAdminPatients = getAdminPatients;
const getAdminBilling = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const invoices = yield client_1.default.invoice.findMany({
            include: { patient: { include: { user: { select: { name: true } } } }, appointment: { include: { doctor: { include: { user: { select: { name: true } } } } } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(invoices);
    }
    catch (err) {
        res.status(500).json({ message: 'Error' });
    }
});
exports.getAdminBilling = getAdminBilling;
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield client_1.default.user.findMany({
            select: { id: true, name: true, email: true, role: true, createdAt: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getUsers = getUsers;
const addUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password, role, department, specialization, availability } = req.body;
    try {
        const userExists = yield client_1.default.user.findUnique({ where: { email } });
        if (userExists)
            return res.status(400).json({ message: 'User already exists' });
        const salt = yield bcryptjs_1.default.genSalt(10);
        const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
        const user = yield client_1.default.user.create({
            data: { name, email, password: hashedPassword, role }
        });
        if (role === 'DOCTOR') {
            yield client_1.default.doctor.create({
                data: {
                    userId: user.id,
                    specialization,
                    availability: JSON.stringify(availability || {})
                }
            });
        }
        else if (role === 'RECEPTIONIST') {
            yield client_1.default.staff.create({
                data: { userId: user.id, department: department || 'Reception' }
            });
        }
        res.status(201).json({ id: user.id, name: user.name, role: user.role });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error adding user' });
    }
});
exports.addUser = addUser;
const removeUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Simple deletion by ID, cascading might be needed based on relations
        yield client_1.default.user.delete({ where: { id: req.params.id } });
        res.json({ message: 'User removed' });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error removing user' });
    }
});
exports.removeUser = removeUser;
