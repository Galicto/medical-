import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, Clock, Stethoscope } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { receptionistModuleApi } from '@/services/api';

const ReceptionistDashboard = () => {
    const { user } = useAuthStore();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        receptionistModuleApi.getDashboardStats()
            .then(res => {
                setStats(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch dashboard stats", err);
                setLoading(false);
            });
    }, []);

    if (loading || !stats) {
        return <div className="flex items-center justify-center min-h-[50vh]"><span style={{ color: 'var(--text-faint)' }}>Loading dashboard...</span></div>;
    }

    const cards = [
        { label: 'Total Patients', value: stats.totalPatients, icon: Users, color: '#3B82F6' },
        { label: 'Appointments Today', value: stats.appointmentsToday, icon: Calendar, color: '#6366F1' },
        { label: 'Current Waitlist', value: stats.currentWaitlist, icon: Clock, color: '#F59E0B' },
        { label: 'Available Doctors', value: stats.availableDoctors, icon: Stethoscope, color: '#10B981' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    Welcome back, {user?.name || 'Receptionist'} 👋
                </h1>
                <p className="text-sm mt-1" style={{ color: 'var(--text-faint)' }}>
                    Front Desk Overview
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((card, i) => {
                    const Icon = card.icon;
                    return (
                        <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                            className="p-5 rounded-2xl theme-card">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${card.color}20` }}>
                                    <Icon className="w-5 h-5" style={{ color: card.color }} />
                                </div>
                            </div>
                            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{card.value}</p>
                            <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>{card.label}</p>
                        </motion.div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="rounded-2xl p-5 theme-card flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: 'rgba(99,102,241,0.1)' }}>
                        <Users className="w-8 h-8" style={{ color: '#6366F1' }} />
                    </div>
                    <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Register New Patient</h3>
                    <p className="text-sm mt-2 mb-6" style={{ color: 'var(--text-faint)' }}>Create a profile for walk-in patients</p>
                    <button className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 shadow-md"
                        style={{ background: 'linear-gradient(135deg, #6366F1, #3B82F6)' }}>
                        Register Patient
                    </button>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                    className="rounded-2xl p-5 theme-card flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: 'rgba(16,185,129,0.1)' }}>
                        <Calendar className="w-8 h-8" style={{ color: '#10B981' }} />
                    </div>
                    <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Book Appointment</h3>
                    <p className="text-sm mt-2 mb-6" style={{ color: 'var(--text-faint)' }}>Schedule an appointment for an existing patient</p>
                    <button className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 shadow-md"
                        style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>
                        Book Appointment
                    </button>
                </motion.div>
            </div>
        </div>
    );
};

export default ReceptionistDashboard;
