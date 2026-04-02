import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, FileText, Heart, Activity, DollarSign } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { patientModuleApi } from '@/services/api';

const statusColor: Record<string, { color: string; bg: string }> = {
    CONFIRMED: { color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
    PENDING: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' }
};

const PatientDashboard = () => {
    const { user } = useAuthStore();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        patientModuleApi.getDashboardStats()
            .then(res => {
                setData(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch patient dashboard stats", err);
                if (err.response?.status === 401) {
                    setError("Session expired or unauthorized. Please log out and sign in again.");
                } else {
                    setError("Failed to load dashboard data.");
                }
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div className="flex items-center justify-center min-h-[50vh]"><span style={{ color: 'var(--text-faint)' }}>Loading dashboard...</span></div>;
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <span className="text-red-500 font-semibold">{error}</span>
                <button 
                    onClick={() => useAuthStore.getState().logout().then(() => window.location.href = '/login')}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                    Return to Login
                </button>
            </div>
        );
    }

    if (!data) return null;

    const { upcomingAppointments, prescriptions, stats } = data;

    const metrics = [
        { label: 'Total Appointments', value: stats.totalAppointments, icon: Calendar, color: '#3B82F6' },
        { label: 'Active Prescriptions', value: stats.activePrescriptions, icon: FileText, color: '#10B981' },
        { label: 'Pending Bills', value: stats.pendingBillsCount, icon: Activity, color: '#F59E0B' },
        { label: 'Outstanding Balance', value: `₹${stats.pendingAmount.toLocaleString()}`, icon: DollarSign, color: '#EF4444' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    Hello, {user?.name || 'Patient'} 💊
                </h1>
                <p className="text-sm mt-1" style={{ color: 'var(--text-faint)' }}>
                    Here's your health & appointment overview
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {metrics.map((metric, i) => {
                    const Icon = metric.icon;
                    return (
                        <motion.div key={metric.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                            className="p-5 rounded-2xl theme-card">
                            <div className="flex items-center justify-between mb-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${metric.color}20` }}>
                                    <Icon className="w-5 h-5" style={{ color: metric.color }} />
                                </div>
                            </div>
                            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{metric.value}</p>
                            <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>{metric.label}</p>
                        </motion.div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    className="rounded-2xl p-5 theme-card">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Upcoming Appointments</h2>
                        <Calendar className="w-5 h-5" style={{ color: 'var(--text-faint)' }} />
                    </div>
                    {upcomingAppointments.length === 0 ? (
                        <p className="text-sm py-4" style={{ color: 'var(--text-faint)' }}>You have no upcoming appointments.</p>
                    ) : (
                        <div className="space-y-3">
                            {upcomingAppointments.map((appt: any, i: number) => {
                                const style = statusColor[appt.status] || { color: '#64748B', bg: 'rgba(100,116,139,0.1)' };
                                return (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-xl transition-all theme-card-inner">
                                        <div>
                                            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{appt.doctor?.user?.name || 'Doctor'}</p>
                                            <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{appt.reason || 'Consultation'}</p>
                                            <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>{new Date(appt.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                                        </div>
                                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full text-center"
                                            style={{ color: style.color, background: style.bg }}>
                                            {appt.status}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                    className="rounded-2xl p-5 theme-card">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Prescriptions</h2>
                        <FileText className="w-5 h-5" style={{ color: 'var(--text-faint)' }} />
                    </div>
                    {prescriptions.length === 0 ? (
                        <p className="text-sm py-4" style={{ color: 'var(--text-faint)' }}>No recent prescriptions written.</p>
                    ) : (
                        <div className="space-y-4">
                            {prescriptions.map((rx: any, i: number) => {
                                const meds = JSON.parse(rx.medicines || '[]');
                                return (
                                    <div key={i} className="p-3 rounded-xl transition-all theme-card-inner">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{rx.doctor?.user?.name || 'Clinic'}</p>
                                                <p className="text-xs" style={{ color: 'var(--text-faint)' }}>{new Date(rx.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1.5 border-t pt-2" style={{ borderColor: 'var(--card-border)' }}>
                                            {meds.map((med: any, j: number) => (
                                                <div key={j} className="flex items-center justify-between text-xs">
                                                    <span style={{ color: 'var(--text-secondary)' }}>
                                                        {typeof med === 'string' ? med : `${med.name} - ${med.dosage || ''}`}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default PatientDashboard;
