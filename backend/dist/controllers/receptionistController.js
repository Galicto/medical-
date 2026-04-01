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
exports.getReceipt = exports.generateBill = exports.updateAppointmentStatus = exports.bookAppointmentForPatient = exports.registerPatientOffline = exports.getAllInvoices = exports.getAllAppointments = exports.getAllPatients = exports.getReceptionistStats = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = __importDefault(require("../prisma/client"));
const getReceptionistStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const totalPatients = yield client_1.default.patient.count();
        const appointmentsToday = yield client_1.default.appointment.count({
            where: { date: { gte: today } }
        });
        const currentWaitlist = yield client_1.default.appointment.count({
            where: { status: 'PENDING', date: { gte: today } }
        });
        const availableDoctors = yield client_1.default.doctor.count();
        res.json({ totalPatients, appointmentsToday, currentWaitlist, availableDoctors });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getReceptionistStats = getReceptionistStats;
const getAllPatients = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const patients = yield client_1.default.patient.findMany({
            include: { user: { select: { name: true, phone: true, email: true } }, appointments: { take: 1, orderBy: { date: 'desc' } } },
            orderBy: { user: { createdAt: 'desc' } }
        });
        res.json(patients);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getAllPatients = getAllPatients;
const getAllAppointments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const appointments = yield client_1.default.appointment.findMany({
            include: { patient: { include: { user: { select: { name: true } } } }, doctor: { include: { user: { select: { name: true } } } } },
            orderBy: { date: 'desc' }
        });
        res.json(appointments);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getAllAppointments = getAllAppointments;
const getAllInvoices = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const invoices = yield client_1.default.invoice.findMany({
            include: { patient: { include: { user: { select: { name: true } } } }, appointment: { include: { doctor: { include: { user: { select: { name: true } } } } } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(invoices);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getAllInvoices = getAllInvoices;
const registerPatientOffline = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, phone, dob, gender, address, bloodGroup } = req.body;
    try {
        const userExists = yield client_1.default.user.findUnique({ where: { email } });
        if (userExists)
            return res.status(400).json({ message: 'User already exists' });
        const salt = yield bcryptjs_1.default.genSalt(10);
        const hashedPassword = yield bcryptjs_1.default.hash('patient123', salt); // Default offline pass
        const user = yield client_1.default.user.create({
            data: { name, email, phone, password: hashedPassword, role: 'PATIENT' }
        });
        const patient = yield client_1.default.patient.create({
            data: {
                userId: user.id,
                dob: new Date(dob),
                gender,
                address,
                bloodGroup
            }
        });
        res.status(201).json({ user, patient });
    }
    catch (error) {
        res.status(500).json({ message: 'Server error during offline registration' });
    }
});
exports.registerPatientOffline = registerPatientOffline;
const bookAppointmentForPatient = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { patientId, doctorId, date, reason } = req.body;
    try {
        const appointment = yield client_1.default.appointment.create({
            data: {
                patientId, doctorId, date: new Date(date), reason, status: 'CONFIRMED'
            }
        });
        res.status(201).json(appointment);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.bookAppointmentForPatient = bookAppointmentForPatient;
const updateAppointmentStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { status, date } = req.body;
    try {
        const appointment = yield client_1.default.appointment.update({
            where: { id: id },
            data: { status, date: date ? new Date(date) : undefined }
        });
        res.json(appointment);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.updateAppointmentStatus = updateAppointmentStatus;
const generateBill = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { patientId, appointmentId, items, totalAmount } = req.body;
    try {
        const invoice = yield client_1.default.invoice.create({
            data: {
                patientId,
                totalAmount,
                items: JSON.stringify(items),
                status: 'PENDING',
                appointmentId: appointmentId || undefined
            }
        });
        res.status(201).json(invoice);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error generating bill' });
    }
});
exports.generateBill = generateBill;
const getReceipt = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const invoice = yield client_1.default.invoice.findUnique({
            where: { id: req.params.id },
            include: { patient: { include: { user: true } }, appointment: true }
        });
        if (!invoice)
            return res.status(404).json({ message: 'Receipt not found' });
        res.json(invoice);
    }
    catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
exports.getReceipt = getReceipt;
