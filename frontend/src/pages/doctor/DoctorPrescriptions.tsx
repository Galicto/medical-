import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Pill, FileText } from 'lucide-react';
import { doctorModuleApi } from '@/services/api';

const DoctorPrescriptions = () => {
    const [search, setSearch] = useState('');
    const [prescriptions, setPrescriptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        doctorModuleApi.getPrescriptions()
            .then(res => {
                const formatted = res.data.map((rx: any) => ({
                    id: `RX-${rx.id.split('-')[0].toUpperCase()}`,
                    patient: rx.patient?.user?.name || 'Unknown',
                    diagnosis: rx.appointment?.reason || 'Consultation',
                    medicines: JSON.parse(rx.medicines || '[]'),
                    date: new Date(rx.createdAt).toLocaleDateString(),
                    status: 'Active'
                }));
                setPrescriptions(formatted);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch doctor prescriptions", err);
                setLoading(false);
            });
    }, []);

    const filtered = prescriptions.filter(p => p.patient.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase()));

    if (loading) {
        return <div className="flex items-center justify-center min-h-[50vh]"><span style={{ color: 'var(--text-faint)' }}>Loading prescriptions...</span></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Prescriptions</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-faint)' }}>{prescriptions.length} prescriptions written</p>
                </div>
                <button className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg, #6366F1, #3B82F6)' }}>+ New Prescription</button>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-faint)' }} />
                <input type="text" placeholder="Search prescriptions..." value={search} onChange={e => setSearch(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 rounded-xl text-sm outline-none theme-input" />
            </div>

            <div className="space-y-4">
                {filtered.map((rx, i) => (
                    <motion.div key={rx.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                        className="p-5 rounded-2xl theme-card">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.15)' }}>
                                    <FileText className="w-5 h-5" style={{ color: '#A78BFA' }} />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{rx.patient}</p>
                                    <p className="text-xs" style={{ color: 'var(--text-faint)' }}>{rx.id} • {rx.date}</p>
                                </div>
                            </div>
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                                style={{ color: rx.status === 'Active' ? '#10B981' : '#64748B', background: rx.status === 'Active' ? 'rgba(16,185,129,0.1)' : 'rgba(100,116,139,0.1)' }}>
                                {rx.status}
                            </span>
                        </div>
                        <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}><span className="font-medium">Diagnosis:</span> {rx.diagnosis}</p>
                        <div className="flex flex-wrap gap-2">
                            {rx.medicines.map((med: any, j: number) => (
                                <span key={j} className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full"
                                    style={{ background: 'rgba(99,102,241,0.08)', color: 'var(--accent-indigo)', border: '1px solid rgba(99,102,241,0.15)' }}>
                                    <Pill className="w-3 h-3" /> {typeof med === 'string' ? med : `${med.name} - ${med.dosage || ''}`}
                                </span>
                            ))}
                        </div>
                    </motion.div>
                ))}
                {filtered.length === 0 && (
                    <div className="text-center py-10" style={{ color: 'var(--text-faint)' }}>
                        No prescriptions found.
                    </div>
                )}
            </div>
        </div>
    );
};

export default DoctorPrescriptions;
