import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Pill, FileText, Calendar, Clock, ShoppingBag } from 'lucide-react';
import { patientModuleApi } from '@/services/api';

const PatientPrescriptions = () => {
    const [prescriptions, setPrescriptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        patientModuleApi.getPrescriptions()
            .then(res => {
                const formatted = res.data.map((rx: any) => {
                    const meds = JSON.parse(rx.medicines || '[]');
                    // We assume Active for all recent ones, simple mock status
                    return {
                        id: rx.id,
                        doctor: rx.doctor?.user?.name || 'Clinic',
                        date: new Date(rx.createdAt).toLocaleDateString(),
                        status: 'Active',
                        medicines: meds.map((m: any) => ({ 
                            name: m.name || m, 
                            dosage: m.dosage || 'As prescribed', 
                            times: m.frequency || m.times || 'Daily', 
                            duration: m.duration || 'Till finished' 
                        }))
                    };
                });
                setPrescriptions(formatted);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch patient prescriptions", err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div className="flex items-center justify-center min-h-[50vh]"><span style={{ color: 'var(--text-faint)' }}>Loading prescriptions...</span></div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>My Prescriptions</h1>
                <p className="text-sm mt-1" style={{ color: 'var(--text-faint)' }}>Manage your medications and refills</p>
            </div>

            {prescriptions.length === 0 ? (
                <div className="text-center py-10" style={{ color: 'var(--text-faint)' }}>
                    No prescriptions found.
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {prescriptions.map((rx, i) => (
                        <motion.div key={rx.id} initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
                            className="rounded-2xl theme-card overflow-hidden">
                            <div className="p-5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--card-inner-border)', background: 'rgba(99,102,241,0.02)' }}>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center p-3 shadow-sm" style={{ background: '#fff' }}>
                                        <FileText className="w-6 h-6" style={{ color: '#6366F1' }} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>{rx.doctor}</p>
                                        <p className="text-xs flex items-center gap-1.5 mt-1" style={{ color: 'var(--text-faint)' }}>
                                            <Calendar className="w-3.5 h-3.5" /> Prescribed on {rx.date}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-xs font-bold px-3 py-1.5 rounded-full"
                                    style={{
                                        color: rx.status === 'Active' ? '#10B981' : '#64748B',
                                        background: rx.status === 'Active' ? 'rgba(16,185,129,0.1)' : 'rgba(100,116,139,0.1)'
                                    }}>
                                    {rx.status}
                                </span>
                            </div>

                            <div className="p-5 space-y-4">
                                {rx.medicines.map((med: any, j: number) => (
                                    <div key={j} className="flex items-start justify-between p-3 rounded-xl transition-all hover:bg-[rgba(99,102,241,0.03)]"
                                        style={{ border: '1px solid var(--card-border)' }}>
                                        <div className="flex gap-3">
                                            <Pill className="w-5 h-5 mt-0.5" style={{ color: '#8B5CF6' }} />
                                            <div>
                                                <p className="font-semibold text-sm" style={{ color: 'var(--text-secondary)' }}>{med.name}</p>
                                                <p className="text-xs mt-1 font-medium" style={{ color: 'var(--text-faint)' }}>{med.dosage}</p>
                                                <div className="flex items-center gap-4 mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                                                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {med.times}</span>
                                                    <span>Duration: {med.duration}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <div className="mt-4 pt-4 flex gap-3" style={{ borderTop: '1px dashed var(--card-border)' }}>
                                    <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-90"
                                        style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>
                                        <ShoppingBag className="w-4 h-4" /> Order Refill
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PatientPrescriptions;
