import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, UserPlus } from 'lucide-react';
import { receptionistModuleApi } from '@/services/api';

const ReceptionistPatients = () => {
    const [search, setSearch] = useState('');
    const [patients, setPatients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        receptionistModuleApi.getPatients()
            .then(res => {
                const formatted = res.data.map((p: any) => ({
                    id: p.id,
                    name: p.user.name,
                    phone: p.user.phone || '+91 -',
                    email: p.user.email,
                    age: p.dob ? new Date().getFullYear() - new Date(p.dob).getFullYear() : '-',
                    bloodGroup: p.bloodGroup || '-',
                    registeredAt: new Date(p.user.createdAt).toLocaleDateString()
                }));
                setPatients(formatted);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch patients", err);
                setLoading(false);
            });
    }, []);

    const filtered = patients.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) || p.phone.includes(search)
    );

    if (loading) {
        return <div className="flex items-center justify-center min-h-[50vh]"><span style={{ color: 'var(--text-faint)' }}>Loading patients...</span></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Patient Registry</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-faint)' }}>Manage {patients.length} total hospital patients</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg, #6366F1, #3B82F6)' }}>
                    <UserPlus className="w-4 h-4" /> Register Patient
                </button>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-faint)' }} />
                <input type="text" placeholder="Search by name or phone..." value={search} onChange={e => setSearch(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 rounded-xl text-sm outline-none theme-input" />
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="rounded-2xl overflow-hidden theme-card">
                <div className="overflow-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                                {['Patient Name', 'Age', 'Phone', 'Email', 'Blood Group', 'Registered', 'Actions'].map(h => (
                                    <th key={h} className="text-left font-medium px-5 py-4" style={{ color: 'var(--text-muted)' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-8" style={{ color: 'var(--text-faint)' }}>No patients found.</td>
                                </tr>
                            ) : filtered.map((p, i) => (
                                <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 + i * 0.03 }}
                                    className="transition-colors" style={{ borderBottom: '1px solid var(--table-row-border)' }}>
                                    <td className="px-5 py-4 font-medium" style={{ color: 'var(--text-secondary)' }}>{p.name}</td>
                                    <td className="px-5 py-4" style={{ color: 'var(--text-muted)' }}>{p.age}</td>
                                    <td className="px-5 py-4" style={{ color: 'var(--text-muted)' }}>{p.phone}</td>
                                    <td className="px-5 py-4" style={{ color: 'var(--text-muted)' }}>{p.email}</td>
                                    <td className="px-5 py-4 font-mono text-xs" style={{ color: 'var(--accent-indigo)' }}>{p.bloodGroup}</td>
                                    <td className="px-5 py-4" style={{ color: 'var(--text-muted)' }}>{p.registeredAt}</td>
                                    <td className="px-5 py-4">
                                        <button className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all theme-btn-secondary">View Profile</button>
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

export default ReceptionistPatients;
