import { motion } from 'framer-motion';
import { FileText, PlusCircle } from 'lucide-react';
import { useState } from 'react';

const categories = ['All', 'Blood', 'Imaging', 'Cardiology'];

const PatientReports = () => {
    const [category, setCategory] = useState('All');
    const reports: any[] = []; // Intentionally blank as we don't have report uploads configured
    
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Medical Reports</h1>
                <p className="text-sm mt-1" style={{ color: 'var(--text-faint)' }}>{reports.length} reports available</p>
            </div>

            <div className="flex gap-2">
                {categories.map(c => (
                    <button key={c} onClick={() => setCategory(c)}
                        className="px-3 py-2 rounded-lg text-xs font-medium transition-all"
                        style={{
                            background: category === c ? 'rgba(99,102,241,0.2)' : 'var(--card-bg)',
                            color: category === c ? 'var(--accent-indigo-light)' : 'var(--text-faint)',
                            border: `1px solid ${category === c ? 'rgba(99,102,241,0.3)' : 'var(--card-border)'}`,
                        }}>
                        {c}
                    </button>
                ))}
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="rounded-2xl overflow-hidden theme-card min-h-[40vh] flex flex-col items-center justify-center text-center p-6">
                
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: 'rgba(99,102,241,0.1)' }}>
                    <FileText className="w-8 h-8" style={{ color: '#6366F1' }} />
                </div>
                <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>No Reports Available</h2>
                <p className="text-sm mt-2 max-w-sm" style={{ color: 'var(--text-faint)' }}>
                    Your medical reports, lab results, and imaging scans will appear here once uploaded by your doctor or clinic.
                </p>
                <button className="mt-6 flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-90 shadow-md text-white"
                        style={{ background: 'linear-gradient(135deg, #6366F1, #3B82F6)' }}>
                    <PlusCircle className="w-4 h-4" /> Request Report Upload
                </button>
            </motion.div>
        </div>
    );
};

export default PatientReports;
