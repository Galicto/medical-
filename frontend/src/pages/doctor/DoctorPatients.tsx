import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Phone, Calendar } from 'lucide-react';
import { doctorModuleApi } from '@/services/api';

const DoctorPatients = () => {
    const [search, setSearch] = useState('');
    const [patients, setPatients] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        doctorModuleApi.getPatients()
            .then(res => {
                const formatted = res.data.map((p: any) => {
                    const dob = p.dob ? new Date(p.dob) : null;
                    const age = dob ? new Date().getFullYear() - dob.getFullYear() : '-';
                    // Approximating last visit/next visit etc from the patient data if we had it,
                    // but since this is just a list of patients returning from distinct appointments...
                    return {
                        id: p.id,
                        name: p.user.name,
                        age: age,
                        condition: 'Regular Patient', // Mapped since we didn't join all appointments here deeply
                        phone: p.user.phone || '+91 -',
                        visits: 1, // Placeholder for now
                        lastVisit: 'Recent',
                        nextVisit: 'Not Scheduled'
                    };
                });
                setPatients(formatted);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch doctor patients", err);
                setLoading(false);
            });
    }, []);

    const filtered = patients.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.condition.toLowerCase().includes(search.toLowerCase()));

    if (loading) {
        return <div className="flex items-center justify-center min-h-[50vh]"><span style={{ color: 'var(--text-faint)' }}>Loading patients...</span></div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>My Patients</h1>
                <p className="text-sm mt-1" style={{ color: 'var(--text-faint)' }}>{patients.length} patients under your care</p>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-faint)' }} />
                <input type="text" placeholder="Search patients..." value={search} onChange={e => setSearch(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 rounded-xl text-sm outline-none theme-input" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filtered.map((patient, i) => (
                    <motion.div key={patient.id || i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                        className="p-5 rounded-2xl theme-card">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white"
                                style={{ background: 'linear-gradient(135deg, #6366F1, #3B82F6)' }}>
                                {patient.name.split(' ').map((n: string) => n[0]).join('') || '?'}
                            </div>
                            <div>
                                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{patient.name}</p>
                                <p className="text-xs" style={{ color: 'var(--text-faint)' }}>Age {patient.age} • {patient.visits} encounters</p>
                            </div>
                        </div>
                        <div className="space-y-2 text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
                            <p><span className="font-medium" style={{ color: 'var(--text-secondary)' }}>Status:</span> {patient.condition}</p>
                            <p className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> Last: {patient.lastVisit}</p>
                            <p className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> Next: {patient.nextVisit}</p>
                            <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> {patient.phone}</p>
                        </div>
                        <div className="flex gap-2">
                            <button className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all theme-btn-secondary">View Records</button>
                            <button className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all theme-btn-secondary">Prescribe</button>
                        </div>
                    </motion.div>
                ))}
            </div>
            {filtered.length === 0 && (
                <div className="text-center py-10" style={{ color: 'var(--text-faint)' }}>
                    No patients found.
                </div>
            )}
        </div>
    );
};

export default DoctorPatients;
