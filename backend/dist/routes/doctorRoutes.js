"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const doctorController_1 = require("../controllers/doctorController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.use(authMiddleware_1.protect);
router.use((0, authMiddleware_1.authorize)('DOCTOR'));
router.get('/dashboard', doctorController_1.getDashboardStats);
router.get('/appointments', doctorController_1.getDailyAppointments);
router.get('/patients', doctorController_1.getDoctorPatients);
router.get('/patient/:id', doctorController_1.getPatientDetails);
router.get('/prescriptions', doctorController_1.getDoctorPrescriptions);
router.post('/prescriptions', doctorController_1.addPrescription);
exports.default = router;
