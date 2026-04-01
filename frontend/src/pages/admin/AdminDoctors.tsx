import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Star, Phone, Mail } from 'lucide-react';
import { adminModuleApi } from '@/services/api';

const AdminDoctors = () => {
    const [search, setSearch] = useState('');
    const [doctors, setDoctors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        adminModuleApi.getDoctors()
            .then(res => {
                const formatted = res.data.map((d: any) => ({
                    id: d.id,
                    name: d.user.name,
                    specialty: d.specialization,
                    phone: d.user.phone || '+91 98765 43210',
                    email: d.user.email,
                    rating: 4.8 + Math.random() * 0.2, // Mocking rating for now
                    patients: d.appointments?.length || 0,
                    status: 'Active',
                }));
                setDoctors(formatted);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch doctors", err);
                setLoading(false);
            });
    }, []);

    const filtered = doctors.filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || d.specialty.toLowerCase().includes(search.toLowerCase()));

    if (loading) {
        return <div className="flex items-center justify-center min-h-[50vh]"><span style={{ color: 'var(--text-faint)' }}>Loading doctors...</span></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Doctors</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-faint)' }}>{doctors.length} registered doctors</p>
                </div>
                <button className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg, #6366F1, #3B82F6)' }}>+ Add Doctor</button>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-faint)' }} />
                <input type="text" placeholder="Search doctors..." value={search} onChange={e => setSearch(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 rounded-xl text-sm outline-none theme-input" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((doc, i) => (
                    <motion.div key={doc.email} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                        className="p-5 rounded-2xl theme-card">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white"
                                    style={{ background: 'linear-gradient(135deg, #6366F1, #3B82F6)' }}>
                                    {doc.name.split(' ').slice(1).map((n: string) => n[0]).join('') || doc.name[0]}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{doc.name}</p>
                                    <p className="text-xs" style={{ color: 'var(--text-faint)' }}>{doc.specialty}</p>
                                </div>
                            </div>
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                                style={{ color: doc.status === 'Active' ? '#10B981' : '#F59E0B', background: doc.status === 'Active' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)' }}>
                                {doc.status}
                            </span>
                        </div>
                        <div className="space-y-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                            <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> {doc.phone}</p>
                            <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> {doc.email}</p>
                            <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid var(--card-inner-border)' }}>
                                <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5" style={{ color: '#F59E0B' }} /> {doc.rating.toFixed(1)}</span>
                                <span>{doc.patients} encounters</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default AdminDoctors;
