import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Search } from 'lucide-react';
import { doctorModuleApi } from '@/services/api';

const statusStyle: Record<string, { color: string; bg: string }> = {
    CONFIRMED: { color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
    COMPLETED: { color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
    PENDING: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
    CANCELLED: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
};

const DoctorAppointments = () => {
    const [filter, setFilter] = useState('All');
    const [search, setSearch] = useState('');
    const [appointments, setAppointments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const filters = ['All', 'CONFIRMED', 'COMPLETED', 'PENDING', 'CANCELLED'];

    useEffect(() => {
        doctorModuleApi.getAppointments()
            .then(res => {
                const formatted = res.data.map((appt: any) => ({
                    id: appt.id,
                    patient: appt.patient?.user?.name || 'Unknown',
                    age: appt.patient?.dob ? new Date().getFullYear() - new Date(appt.patient.dob).getFullYear() : '-',
                    date: new Date(appt.date).toLocaleDateString(),
                    time: new Date(appt.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    status: appt.status,
                    reason: appt.reason || 'Consultation'
                }));
                setAppointments(formatted);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch doctor appointments", err);
                setLoading(false);
            });
    }, []);

    const filtered = appointments.filter(a => {
        const matchesFilter = filter === 'All' || a.status === filter;
        const matchesSearch = a.patient.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    if (loading) {
        return <div className="flex items-center justify-center min-h-[50vh]"><span style={{ color: 'var(--text-faint)' }}>Loading appointments...</span></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Appointments</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-faint)' }}>{appointments.length} total appointments</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-faint)' }} />
                    <input type="text" placeholder="Search by patient name..." value={search} onChange={e => setSearch(e.target.value)}
                        className="w-full h-10 pl-10 pr-4 rounded-xl text-sm outline-none theme-input" />
                </div>
                <div className="flex gap-2">
                    {filters.map((f) => (
                        <button key={f} onClick={() => setFilter(f)}
                            className="px-3 py-2 rounded-lg text-xs font-medium transition-all"
                            style={{
                                background: filter === f ? 'rgba(99,102,241,0.2)' : 'var(--card-bg)',
                                color: filter === f ? 'var(--accent-indigo-light)' : 'var(--text-faint)',
                                border: `1px solid ${filter === f ? 'rgba(99,102,241,0.3)' : 'var(--card-border)'}`,
                            }}>
                            {f === 'All' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="rounded-2xl overflow-hidden theme-card">
                <div className="overflow-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                                {['Patient', 'Date', 'Time', 'Reason', 'Status', 'Actions'].map((h) => (
                                    <th key={h} className="text-left font-medium px-5 py-4" style={{ color: 'var(--text-muted)' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-8" style={{ color: 'var(--text-faint)' }}>No appointments found.</td>
                                </tr>
                            ) : filtered.map((appt, i) => {
                                const style = statusStyle[appt.status] || { color: '#64748B', bg: 'rgba(100,116,139,0.1)' };
                                return (
                                    <motion.tr key={appt.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 + i * 0.03 }}
                                        className="transition-colors" style={{ borderBottom: '1px solid var(--table-row-border)' }}>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                                                    style={{ background: 'linear-gradient(135deg, #6366F1, #3B82F6)' }}>
                                                    {appt.patient.split(' ').map((n: string) => n[0]).join('') || '?'}
                                                </div>
                                                <div>
                                                    <p className="font-medium" style={{ color: 'var(--text-secondary)' }}>{appt.patient}</p>
                                                    <p className="text-xs" style={{ color: 'var(--text-faint)' }}>Age: {appt.age}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4" style={{ color: 'var(--text-muted)' }}>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3.5 h-3.5" style={{ color: 'var(--text-faint)' }} />
                                                {appt.date}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4" style={{ color: 'var(--text-muted)' }}>
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-3.5 h-3.5" style={{ color: 'var(--text-faint)' }} />
                                                {appt.time}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4" style={{ color: 'var(--text-muted)' }}>{appt.reason}</td>
                                        <td className="px-5 py-4">
                                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                                                style={{ color: style.color, background: style.bg }}>
                                                {appt.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <button className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all theme-btn-secondary">
                                                View
                                            </button>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
};

export default DoctorAppointments;
