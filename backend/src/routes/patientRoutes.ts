import express from 'express';
import { getAppointments, bookAppointment, cancelAppointment, getPrescriptions, getBilling, getDoctors, getDashboardStats } from '../controllers/patientController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect);
router.use(authorize('PATIENT'));

router.get('/dashboard', getDashboardStats);
router.get('/doctors', getDoctors);
router.get('/appointments', getAppointments);
router.post('/appointments', bookAppointment);
router.put('/appointments/:id/cancel', cancelAppointment);

router.get('/prescriptions', getPrescriptions);
router.get('/billing', getBilling);

export default router;
