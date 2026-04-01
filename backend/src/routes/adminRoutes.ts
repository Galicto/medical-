import express from 'express';
import { getDashboardStats, getUsers, addUser, removeUser, getAdminDoctors, getAdminPatients, getAdminBilling } from '../controllers/adminController';
import { protect, authorize } from '../middleware/authMiddleware';

const router = express.Router();

router.use(protect);
router.use(authorize('ADMIN'));

router.get('/dashboard', getDashboardStats);
router.get('/doctors', getAdminDoctors);
router.get('/patients', getAdminPatients);
router.get('/billing', getAdminBilling);

router.route('/users')
    .get(getUsers)
    .post(addUser);

router.delete('/users/:id', removeUser);

export default router;
