import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, FileText, Calendar, CreditCard, Clock } from 'lucide-react';
import { patientModuleApi } from '@/services/api';

const statusColor: Record<string, { color: string; bg: string }> = {
    PAID: { color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
    PENDING: { color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
    OVERDUE: { color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
};

const PatientBilling = () => {
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        patientModuleApi.getBilling()
            .then(res => {
                const formatted = res.data.map((inv: any) => ({
                    id: inv.id,
                    invoiceNumber: `INV-${inv.id.split('-')[0].toUpperCase()}`,
                    amount: inv.totalAmount,
                    date: new Date(inv.createdAt).toLocaleDateString(),
                    status: inv.status,
                    method: 'Card/UPI',
                    items: JSON.parse(inv.items || '[]')
                }));
                setInvoices(formatted);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch billing", err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div className="flex items-center justify-center min-h-[50vh]"><span style={{ color: 'var(--text-faint)' }}>Loading billing data...</span></div>;
    }

    const totalDue = invoices.filter(i => i.status === 'PENDING').reduce((a, b) => a + b.amount, 0);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Billing & Payments</h1>
                <p className="text-sm mt-1" style={{ color: 'var(--text-faint)' }}>Manage your invoices and payment history</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-6 rounded-2xl text-white relative overflow-hidden shadow-xl"
                    style={{ background: 'linear-gradient(135deg, #6366F1, #3B82F6)' }}>
                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-lg font-medium opacity-90">Current Outstanding Due</h2>
                            <DollarSign className="w-6 h-6 opacity-80" />
                        </div>
                        <p className="text-4xl font-bold tracking-tight mb-2">₹{totalDue.toLocaleString()}</p>
                        <p className="text-sm opacity-80 mb-6">Due immediately for pending invoices</p>
                        <button className="px-6 py-2.5 bg-white text-blue-600 rounded-xl font-bold text-sm shadow-md hover:bg-opacity-90 transition-all" disabled={totalDue === 0}>
                            {totalDue > 0 ? 'Pay Now via Razorpay' : 'No Dues Paid'}
                        </button>
                    </div>
                </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="rounded-2xl overflow-hidden theme-card">
                <div className="p-5 border-b" style={{ borderColor: 'var(--card-border)' }}>
                    <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Invoice History</h2>
                </div>
                <div className="overflow-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                                {['Invoice', 'Date', 'Amount', 'Status', 'Action'].map(h => (
                                    <th key={h} className="text-left font-medium px-5 py-4" style={{ color: 'var(--text-muted)' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-8" style={{ color: 'var(--text-faint)' }}>No billing records found.</td>
                                </tr>
                            ) : invoices.map((inv, i) => {
                                const style = statusColor[inv.status] || { color: '#10B981', bg: 'rgba(16,185,129,0.1)' };
                                return (
                                    <motion.tr key={inv.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 + i * 0.05 }}
                                        className="transition-colors" style={{ borderBottom: '1px solid var(--table-row-border)' }}>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(59,130,246,0.1)' }}>
                                                    <FileText className="w-5 h-5" style={{ color: '#3B82F6' }} />
                                                </div>
                                                <div>
                                                    <p className="font-semibold font-mono" style={{ color: 'var(--text-secondary)' }}>{inv.invoiceNumber}</p>
                                                    <p className="text-xs" style={{ color: 'var(--text-faint)' }}>Clinic Services</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4" style={{ color: 'var(--text-muted)' }}>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" /> {inv.date}
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 font-semibold" style={{ color: 'var(--text-primary)' }}>₹{inv.amount.toLocaleString()}</td>
                                        <td className="px-5 py-4">
                                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 w-max"
                                                style={{ color: style.color, background: style.bg }}>
                                                {inv.status === 'PENDING' && <Clock className="w-3 h-3" />}
                                                {inv.status === 'PAID' && <CreditCard className="w-3 h-3" />}
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            {inv.status === 'PENDING' ? (
                                                <button className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white shadow-sm hover:opacity-90 transition-all"
                                                    style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>
                                                    Pay
                                                </button>
                                            ) : (
                                                <button className="px-4 py-1.5 rounded-lg text-xs font-medium transition-all theme-btn-secondary" style={{ color: 'var(--text-secondary)' }}>
                                                    Receipt
                                                </button>
                                            )}
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

export default PatientBilling;
