import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import { adminModuleApi } from '@/services/api';

const AdminPatients = () => {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [patients, setPatients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        adminModuleApi.getPatients()
            .then(res => {
                // Map the complex backend object to a flatter structure for the table
                const formatted = res.data.map((p: any) => {
                    const lastAppt = p.appointments[0] || {};
                    return {
                        id: p.id.split('-')[0],
                        name: p.user.name,
                        age: p.dob ? new Date().getFullYear() - new Date(p.dob).getFullYear() : '-',
                        condition: lastAppt.reason || 'Checkup',
                        doctor: lastAppt.doctor?.user?.name || 'Unassigned',
                        lastVisit: lastAppt.date ? new Date(lastAppt.date).toLocaleDateString() : 'N/A',
                        status: lastAppt.status === 'COMPLETED' ? 'Discharged' : 'Active',
                    };
                });
                setPatients(formatted);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch patients", err);
                setLoading(false);
            });
    }, []);

    const filtered = patients.filter(p =>
        (statusFilter === 'All' || p.status === statusFilter) &&
        (p.name.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase()))
    );

    if (loading) {
        return <div className="flex items-center justify-center min-h-[50vh]"><span style={{ color: 'var(--text-faint)' }}>Loading patients...</span></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Patients</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-faint)' }}>{patients.length} total patients</p>
                </div>
                <button className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg, #6366F1, #3B82F6)' }}>+ Add Patient</button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-faint)' }} />
                    <input type="text" placeholder="Search by name or ID..." value={search} onChange={e => setSearch(e.target.value)}
                        className="w-full h-10 pl-10 pr-4 rounded-xl text-sm outline-none theme-input" />
                </div>
                <div className="flex gap-2 items-center">
                    <Filter className="w-4 h-4" style={{ color: 'var(--text-faint)' }} />
                    {['All', 'Active', 'Discharged'].map(s => (
                        <button key={s} onClick={() => setStatusFilter(s)}
                            className="px-3 py-2 rounded-lg text-xs font-medium transition-all"
                            style={{
                                background: statusFilter === s ? 'rgba(99,102,241,0.2)' : 'var(--card-bg)',
                                color: statusFilter === s ? 'var(--accent-indigo-light)' : 'var(--text-faint)',
                                border: `1px solid ${statusFilter === s ? 'rgba(99,102,241,0.3)' : 'var(--card-border)'}`,
                            }}>
                            {s}
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
                                {['ID', 'Patient', 'Age', 'Condition', 'Doctor', 'Last Visit', 'Status'].map(h => (
                                    <th key={h} className="text-left font-medium px-5 py-4" style={{ color: 'var(--text-muted)' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((p, i) => (
                                <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 + i * 0.03 }}
                                    className="transition-colors" style={{ borderBottom: '1px solid var(--table-row-border)' }}>
                                    <td className="px-5 py-4 font-mono text-xs" style={{ color: 'var(--accent-indigo)' }}>#{p.id.toUpperCase()}</td>
                                    <td className="px-5 py-4 font-medium" style={{ color: 'var(--text-secondary)' }}>{p.name}</td>
                                    <td className="px-5 py-4" style={{ color: 'var(--text-muted)' }}>{p.age}</td>
                                    <td className="px-5 py-4" style={{ color: 'var(--text-muted)' }}>{p.condition}</td>
                                    <td className="px-5 py-4" style={{ color: 'var(--text-muted)' }}>{p.doctor}</td>
                                    <td className="px-5 py-4" style={{ color: 'var(--text-muted)' }}>{p.lastVisit}</td>
                                    <td className="px-5 py-4">
                                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                                            style={{ color: p.status === 'Active' ? '#10B981' : '#64748B', background: p.status === 'Active' ? 'rgba(16,185,129,0.1)' : 'rgba(100,116,139,0.1)' }}>
                                            {p.status}
                                        </span>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminPatients;
