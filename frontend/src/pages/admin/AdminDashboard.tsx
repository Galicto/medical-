import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, Calendar, DollarSign, Activity, ArrowUp, ArrowDown } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { adminModuleApi } from '@/services/api';

const statusColor: Record<string, string> = {
    COMPLETED: '#10B981',
    PENDING: '#F59E0B',
    CONFIRMED: '#3B82F6',
    CANCELLED: '#EF4444',
};

const AdminDashboard = () => {
    const { user } = useAuthStore();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        adminModuleApi.getDashboard()
            .then(res => {
                setData(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Failed to fetch admin stats', err);
                setLoading(false);
            });
    }, []);

    if (loading || !data) {
        return <div className="flex items-center justify-center min-h-[50vh]"><span style={{ color: 'var(--text-faint)' }}>Loading metrics...</span></div>;
    }

    const stats = [
        { label: 'Total Patients', value: data.totalPatients, change: '+12.5%', up: true, icon: Users, color: '#6366F1' },
        { label: 'Active Doctors', value: data.totalDoctors, change: '+3.2%', up: true, icon: UserCheck, color: '#3B82F6' },
        { label: 'Appointments Today', value: data.appointmentsToday, change: '-2.4%', up: false, icon: Calendar, color: '#8B5CF6' },
        { label: 'Total Revenue', value: `₹${(data.totalRevenue / 1000).toFixed(1)}k`, change: '+18.7%', up: true, icon: DollarSign, color: '#10B981' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    Welcome back, {user?.name || 'Admin'} 👋
                </h1>
                <p className="text-sm mt-1" style={{ color: 'var(--text-faint)' }}>
                    Here's what's happening at your hospital today
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
                                    {stat.up ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
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
                        <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Recent Patients</h2>
                        <Activity className="w-5 h-5" style={{ color: 'var(--text-faint)' }} />
                    </div>
                    <div className="overflow-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                                    {['Patient', 'Age', 'Condition', 'Doctor', 'Status'].map((h) => (
                                        <th key={h} className="pb-3 text-left font-medium px-3" style={{ color: 'var(--text-muted)' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {data.recentPatients.map((p: any, i: number) => {
                                    const age = p.dob ? new Date().getFullYear() - new Date(p.dob).getFullYear() : '-';
                                    const appt = p.appointments[0] || {};
                                    return (
                                        <tr key={i} className="transition-colors" style={{ borderBottom: '1px solid var(--table-row-border)' }}>
                                            <td className="py-3 px-3 font-medium" style={{ color: 'var(--text-secondary)' }}>{p.user.name}</td>
                                            <td className="py-3 px-3" style={{ color: 'var(--text-muted)' }}>{age}</td>
                                            <td className="py-3 px-3" style={{ color: 'var(--text-muted)' }}>{appt.reason || 'Checkup'}</td>
                                            <td className="py-3 px-3" style={{ color: 'var(--text-muted)' }}>{appt.doctor?.user?.name || '-'}</td>
                                            <td className="py-3 px-3">
                                                <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                                                    style={{ color: statusColor[appt.status] || '#94A3B8', background: `${statusColor[appt.status] || '#94A3B8'}15` }}>
                                                    {appt.status || 'N/A'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                    className="rounded-2xl p-5 theme-card">
                    <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Department Stats</h2>
                    <div className="space-y-4">
                        {data.departmentData.map((dept: any) => (
                            <div key={dept.name} className="flex items-center justify-between p-3 rounded-xl transition-all theme-card-inner">
                                <div className="flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: dept.color }} />
                                    <div>
                                        <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>{dept.name}</p>
                                        <p className="text-xs" style={{ color: 'var(--text-faint)' }}>{dept.patients} Patients</p>
                                    </div>
                                </div>
                                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{dept.revenue}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AdminDashboard;
