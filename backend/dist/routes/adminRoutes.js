"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adminController_1 = require("../controllers/adminController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.use(authMiddleware_1.protect);
router.use((0, authMiddleware_1.authorize)('ADMIN'));
router.get('/dashboard', adminController_1.getDashboardStats);
router.get('/doctors', adminController_1.getAdminDoctors);
router.get('/patients', adminController_1.getAdminPatients);
router.get('/billing', adminController_1.getAdminBilling);
router.route('/users')
    .get(adminController_1.getUsers)
    .post(adminController_1.addUser);
router.delete('/users/:id', adminController_1.removeUser);
exports.default = router;
