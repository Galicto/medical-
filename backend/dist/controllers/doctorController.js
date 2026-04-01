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
exports.addPrescription = exports.getPatientDetails = exports.getDailyAppointments = exports.getDoctorPrescriptions = exports.getDoctorPatients = exports.getDashboardStats = void 0;
const client_1 = __importDefault(require("../prisma/client"));
const getDashboardStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const doctor = yield client_1.default.doctor.findUnique({ where: { userId: req.user.id } });
        if (!doctor)
            return res.status(404).json({ message: 'Doctor not found' });
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const appointmentsToday = yield client_1.default.appointment.count({
            where: { doctorId: doctor.id, date: { gte: today, lt: tomorrow } }
        });
        const completedToday = yield client_1.default.appointment.count({
            where: { doctorId: doctor.id, date: { gte: today, lt: tomorrow }, status: 'COMPLETED' }
        });
        const pendingReviews = yield client_1.default.appointment.count({
            where: { doctorId: doctor.id, status: 'PENDING' }
        });
        const totalPatientsRaw = yield client_1.default.appointment.groupBy({
            by: ['patientId'],
            where: { doctorId: doctor.id }
        });
        const totalPatients = totalPatientsRaw.length;
        // Also get today's appointments for the dashboard
        const todayAppointments = yield client_1.default.appointment.findMany({
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
    }
    catch (error) {
        res.status(500).json({ message: 'Server error fetching stats' });
    }
});
exports.getDashboardStats = getDashboardStats;
const getDoctorPatients = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const doctor = yield client_1.default.doctor.findUnique({ where: { userId: req.user.id } });
        if (!doctor)
            return res.status(404).json({ message: 'Doctor not found' });
        // Get unique patients that had appointments with this doctor
        const appointments = yield client_1.default.appointment.findMany({
            where: { doctorId: doctor.id },
            include: { patient: { include: { user: { select: { name: true, email: true, phone: true } } } } },
            distinct: ['patientId']
        });
        const patients = appointments.map(a => a.patient);
        res.json(patients);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getDoctorPatients = getDoctorPatients;
const getDoctorPrescriptions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const doctor = yield client_1.default.doctor.findUnique({ where: { userId: req.user.id } });
        if (!doctor)
            return res.status(404).json({ message: 'Doctor not found' });
        const prescriptions = yield client_1.default.prescription.findMany({
            where: { doctorId: doctor.id },
            include: { patient: { include: { user: { select: { name: true } } } }, appointment: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(prescriptions);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getDoctorPrescriptions = getDoctorPrescriptions;
const getDailyAppointments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const doctor = yield client_1.default.doctor.findUnique({ where: { userId: req.user.id } });
        if (!doctor)
            return res.status(404).json({ message: 'Doctor record not found' });
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const appointments = yield client_1.default.appointment.findMany({
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
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getDailyAppointments = getDailyAppointments;
const getPatientDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const patient = yield client_1.default.patient.findUnique({
            where: { id: req.params.id },
            include: {
                user: { select: { name: true, email: true, phone: true } },
                prescriptions: { orderBy: { createdAt: 'desc' }, take: 5 },
                labReports: { orderBy: { createdAt: 'desc' }, take: 5 }
            }
        });
        if (!patient)
            return res.status(404).json({ message: 'Patient not found' });
        res.json(patient);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getPatientDetails = getPatientDetails;
const addPrescription = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { appointmentId, patientId, medicines, notes } = req.body;
    try {
        const doctor = yield client_1.default.doctor.findUnique({ where: { userId: req.user.id } });
        if (!doctor)
            return res.status(404).json({ message: 'Doctor record not found' });
        const prescription = yield client_1.default.prescription.create({
            data: {
                appointmentId,
                doctorId: doctor.id,
                patientId,
                medicines: JSON.stringify(medicines),
                notes
            }
        });
        // Auto mark appointment as completed
        yield client_1.default.appointment.update({
            where: { id: appointmentId },
            data: { status: 'COMPLETED' }
        });
        res.status(201).json(prescription);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.addPrescription = addPrescription;
