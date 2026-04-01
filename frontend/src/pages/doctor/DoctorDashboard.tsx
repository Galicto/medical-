import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Clock, CheckCircle, ArrowUp, Stethoscope } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { doctorModuleApi } from '@/services/api';

const statusStyle: Record<string, { color: string; bg: string }> = {
    COMPLETED: { color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
    CONFIRMED: { color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
    PENDING: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
    CANCELLED: { color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
};

const DoctorDashboard = () => {
    const { user } = useAuthStore();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        doctorModuleApi.getDashboardStats()
            .then(res => {
                setData(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch doctor dashboard stats", err);
                setLoading(false);
            });
    }, []);

    if (loading || !data) {
        return <div className="flex items-center justify-center min-h-[50vh]"><span style={{ color: 'var(--text-faint)' }}>Loading dashboard...</span></div>;
    }

    const stats = [
        { label: 'Today\'s Appointments', value: data.appointmentsToday, change: '+2', up: true, icon: Calendar, color: '#6366F1' },
        { label: 'Total Patients', value: data.totalPatients, change: '+8', up: true, icon: Users, color: '#3B82F6' },
        { label: 'Pending Reviews', value: data.pendingReviews, change: '-1', up: false, icon: Clock, color: '#F59E0B' },
        { label: 'Completed Today', value: data.completedToday, change: '+3', up: true, icon: CheckCircle, color: '#10B981' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    Good morning, {user?.name || 'Doctor'} 🩺
                </h1>
                <p className="text-sm mt-1" style={{ color: 'var(--text-faint)' }}>
                    You have {data.appointmentsToday} appointments scheduled for today
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                            className="p-5 rounded-2xl theme-card">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${stat.color}20` }}>
                                    <Icon className="w-5 h-5" style={{ color: stat.color }} />
                                </div>
                                <span className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full"
                                    style={{ color: stat.up ? '#10B981' : '#F87171', background: stat.up ? 'rgba(16,185,129,0.1)' : 'rgba(248,113,113,0.1)' }}>
                                    <ArrowUp className="w-3 h-3" style={{ transform: stat.up ? 'none' : 'rotate(180deg)' }} />
                                    {stat.change}
                                </span>
                            </div>
                            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
                            <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>{stat.label}</p>
                        </motion.div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="lg:col-span-2 rounded-2xl p-5 theme-card">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Today's Schedule</h2>
                        <Calendar className="w-5 h-5" style={{ color: 'var(--text-faint)' }} />
                    </div>
                    <div className="space-y-3">
                        {data.todayAppointments.length === 0 ? (
                            <p className="text-sm text-center py-6" style={{ color: 'var(--text-faint)' }}>No appointments scheduled for today.</p>
                        ) : data.todayAppointments.map((appt: any, i: number) => {
                            const style = statusStyle[appt.status] || { color: '#64748B', bg: 'rgba(100,116,139,0.1)' };
                            const timeStr = new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                            return (
                                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.05 }}
                                    className="flex items-center justify-between p-3 rounded-xl transition-all theme-card-inner">
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-mono w-20" style={{ color: 'var(--accent-indigo)' }}>{timeStr}</span>
                                        <div>
                                            <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{appt.patient?.user?.name || 'Unknown Patient'}</p>
                                            <p className="text-xs" style={{ color: 'var(--text-faint)' }}>{appt.reason || 'Consultation'}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ color: style.color, background: style.bg }}>
                                        {appt.status}
                                    </span>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                    className="rounded-2xl p-5 theme-card">
                    <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Quick Actions</h2>
                    <div className="space-y-3">
                        {[
                            { label: 'Write Prescription', icon: Stethoscope, color: '#6366F1' },
                            { label: 'View Patient Records', icon: Users, color: '#3B82F6' },
                            { label: 'Schedule Appointment', icon: Calendar, color: '#8B5CF6' },
                            { label: 'Review Lab Results', icon: CheckCircle, color: '#10B981' },
                        ].map((action) => {
                            const Icon = action.icon;
                            return (
                                <button key={action.label}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-all theme-card-inner"
                                    style={{ color: 'var(--text-secondary)' }}>
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${action.color}15` }}>
                                        <Icon className="w-4 h-4" style={{ color: action.color }} />
                                    </div>
                                    {action.label}
                                </button>
                            );
                        })}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default DoctorDashboard;
