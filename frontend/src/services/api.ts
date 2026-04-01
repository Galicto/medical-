import axios from 'axios';

// In production (Vercel), the backend is served under /api on the same domain
// In development, proxy to localhost:5000
const API_BASE_URL = import.meta.env.VITE_API_URL 
  || (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api');

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Auth
export const authApi = {
    login: (email: string, password: string) =>
        api.post('/auth/login', { email, password }),
    register: (data: { name: string; email: string; password: string; role: string }) =>
        api.post('/auth/register', data),
    logout: () => api.post('/auth/logout'),
};

// Role-based APIs
export const patientModuleApi = {
    getDashboardStats: () => api.get('/patient/dashboard'),
    getDoctors: () => api.get('/patient/doctors'),
    getAppointments: () => api.get('/patient/appointments'),
    bookAppointment: (data: any) => api.post('/patient/appointments', data),
    cancelAppointment: (id: string) => api.put(`/patient/appointments/${id}/cancel`),
    getPrescriptions: () => api.get('/patient/prescriptions'),
    getBilling: () => api.get('/patient/billing'),
};

export const doctorModuleApi = {
    getDashboardStats: () => api.get('/doctor/dashboard'),
    getAppointments: () => api.get('/doctor/appointments'),
    getPatients: () => api.get('/doctor/patients'),
    getPatientDetails: (id: string) => api.get(`/doctor/patient/${id}`),
    getPrescriptions: () => api.get('/doctor/prescriptions'),
    addPrescription: (data: any) => api.post('/doctor/prescriptions', data),
};

export const receptionistModuleApi = {
    getDashboardStats: () => api.get('/receptionist/dashboard'),
    getPatients: () => api.get('/receptionist/patients'),
    getAppointments: () => api.get('/receptionist/appointments'),
    getInvoices: () => api.get('/receptionist/invoices'),
    registerPatient: (data: any) => api.post('/receptionist/patients', data),
    bookAppointment: (data: any) => api.post('/receptionist/appointments', data),
    updateAppointment: (id: string, data: any) => api.put(`/receptionist/appointments/${id}`, data),
    generateBill: (data: any) => api.post('/receptionist/billing', data),
    getReceipt: (id: string) => api.get(`/receptionist/receipt/${id}`),
};

export const adminModuleApi = {
    getDashboard: () => api.get('/admin/dashboard'),
    getDoctors: () => api.get('/admin/doctors'),
    getPatients: () => api.get('/admin/patients'),
    getBilling: () => api.get('/admin/billing'),
    getUsers: () => api.get('/admin/users'),
    addUser: (data: any) => api.post('/admin/users', data),
    removeUser: (id: string) => api.delete(`/admin/users/${id}`),
};

export default api;
