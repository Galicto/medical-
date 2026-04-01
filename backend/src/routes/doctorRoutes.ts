import express from 'express';
import { getDashboardStats, getDailyAppointments, getPatientDetails, addPrescription, getDoctorPatients, getDoctorPrescriptions } from '../controllers/doctorController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect);
router.use(authorize('DOCTOR'));

router.get('/dashboard', getDashboardStats);
router.get('/appointments', getDailyAppointments);
router.get('/patients', getDoctorPatients);
router.get('/patient/:id', getPatientDetails);
router.get('/prescriptions', getDoctorPrescriptions);
router.post('/prescriptions', addPrescription);

export default router;
