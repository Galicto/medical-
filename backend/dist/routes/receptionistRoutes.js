"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const receptionistController_1 = require("../controllers/receptionistController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.use(authMiddleware_1.protect);
router.use((0, authMiddleware_1.authorize)('RECEPTIONIST', 'ADMIN')); // Admin can also do receptionist duties
router.get('/dashboard', receptionistController_1.getReceptionistStats);
router.get('/patients', receptionistController_1.getAllPatients);
router.get('/appointments', receptionistController_1.getAllAppointments);
router.get('/invoices', receptionistController_1.getAllInvoices);
router.post('/patients', receptionistController_1.registerPatientOffline);
router.post('/appointments', receptionistController_1.bookAppointmentForPatient);
router.put('/appointments/:id', receptionistController_1.updateAppointmentStatus);
router.post('/billing', receptionistController_1.generateBill);
router.get('/receipt/:id', receptionistController_1.getReceipt);
exports.default = router;
