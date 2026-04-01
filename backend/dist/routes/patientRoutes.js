"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const patientController_1 = require("../controllers/patientController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.use(authMiddleware_1.protect);
router.use((0, authMiddleware_1.authorize)('PATIENT'));
router.get('/dashboard', patientController_1.getDashboardStats);
router.get('/doctors', patientController_1.getDoctors);
router.get('/appointments', patientController_1.getAppointments);
router.post('/appointments', patientController_1.bookAppointment);
router.put('/appointments/:id/cancel', patientController_1.cancelAppointment);
router.get('/prescriptions', patientController_1.getPrescriptions);
router.get('/billing', patientController_1.getBilling);
exports.default = router;
