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
exports.getBilling = exports.getPrescriptions = exports.cancelAppointment = exports.bookAppointment = exports.getAppointments = exports.getDashboardStats = exports.getDoctors = void 0;
const client_1 = __importDefault(require("../prisma/client"));
const getDoctors = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const doctors = yield client_1.default.doctor.findMany({
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
    }
    catch (error) {
        res.status(500).json({ message: 'Server error fetching doctors' });
    }
});
exports.getDoctors = getDoctors;
const getDashboardStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const patient = yield client_1.default.patient.findUnique({ where: { userId: req.user.id } });
        if (!patient)
            return res.status(404).json({ message: 'Patient not found' });
        const today = new Date();
        const upcomingAppointments = yield client_1.default.appointment.findMany({
            where: { patientId: patient.id, date: { gte: today }, status: { in: ['CONFIRMED', 'PENDING'] } },
            include: { doctor: { include: { user: { select: { name: true } } } } },
            orderBy: { date: 'asc' },
            take: 3
        });
        const prescriptions = yield client_1.default.prescription.findMany({
            where: { patientId: patient.id },
            include: { doctor: { include: { user: { select: { name: true } } } } },
            orderBy: { createdAt: 'desc' },
            take: 3
        });
        const totalAppointments = yield client_1.default.appointment.count({ where: { patientId: patient.id } });
        const activePrescriptions = yield client_1.default.prescription.count({ where: { patientId: patient.id } }); // simplifying active logic
        const pendingBillsRaw = yield client_1.default.invoice.aggregate({
            _sum: { totalAmount: true },
            where: { patientId: patient.id, status: 'PENDING' }
        });
        const pendingBillsCount = yield client_1.default.invoice.count({ where: { patientId: patient.id, status: 'PENDING' } });
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
    }
    catch (error) {
        res.status(500).json({ message: 'Server error fetching patient dashboard stats' });
    }
});
exports.getDashboardStats = getDashboardStats;
const getAppointments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const patient = yield client_1.default.patient.findUnique({ where: { userId: req.user.id } });
        if (!patient)
            return res.status(404).json({ message: 'Patient record not found' });
        const appointments = yield client_1.default.appointment.findMany({
            where: { patientId: patient.id },
            include: { doctor: { include: { user: { select: { name: true } } } } },
            orderBy: { date: 'desc' }
        });
        res.json(appointments);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getAppointments = getAppointments;
const bookAppointment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { doctorId, date, reason } = req.body;
    try {
        const patient = yield client_1.default.patient.findUnique({ where: { userId: req.user.id } });
        if (!patient)
            return res.status(404).json({ message: 'Patient record not found' });
        const appointment = yield client_1.default.appointment.create({
            data: {
                patientId: patient.id,
                doctorId,
                date: new Date(date),
                reason,
                status: 'PENDING'
            }
        });
        res.status(201).json(appointment);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.bookAppointment = bookAppointment;
const cancelAppointment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const appointment = yield client_1.default.appointment.update({
            where: { id: req.params.id },
            data: { status: 'CANCELLED' }
        });
        res.json(appointment);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.cancelAppointment = cancelAppointment;
const getPrescriptions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const patient = yield client_1.default.patient.findUnique({ where: { userId: req.user.id } });
        if (!patient)
            return res.status(404).json({ message: 'Patient record not found' });
        const prescriptions = yield client_1.default.prescription.findMany({
            where: { patientId: patient.id },
            include: { doctor: { include: { user: { select: { name: true } } } }, appointment: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(prescriptions);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getPrescriptions = getPrescriptions;
const getBilling = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const patient = yield client_1.default.patient.findUnique({ where: { userId: req.user.id } });
        if (!patient)
            return res.status(404).json({ message: 'Patient record not found' });
        const invoices = yield client_1.default.invoice.findMany({
            where: { patientId: patient.id },
            include: { appointment: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(invoices);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getBilling = getBilling;
