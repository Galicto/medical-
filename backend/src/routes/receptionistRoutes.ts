import express from 'express';
import { 
    registerPatientOffline, 
    bookAppointmentForPatient, 
    updateAppointmentStatus, 
    generateBill, 
    getReceipt,
    getReceptionistStats,
    getAllPatients,
    getAllAppointments,
    getAllInvoices
} from '../controllers/receptionistController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect);
router.use(authorize('RECEPTIONIST', 'ADMIN')); // Admin can also do receptionist duties

router.get('/dashboard', getReceptionistStats);
router.get('/patients', getAllPatients);
router.get('/appointments', getAllAppointments);
router.get('/invoices', getAllInvoices);

router.post('/patients', registerPatientOffline);
router.post('/appointments', bookAppointmentForPatient);
router.put('/appointments/:id', updateAppointmentStatus);
router.post('/billing', generateBill);
router.get('/receipt/:id', getReceipt);

export default router;
