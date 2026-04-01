import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, DollarSign, FileText, CheckCircle } from 'lucide-react';
import { receptionistModuleApi } from '@/services/api';

const statusColor: Record<string, string> = { PAID: '#10B981', PENDING: '#F59E0B', OVERDUE: '#EF4444' };

const ReceptionistBilling = () => {
    const [search, setSearch] = useState('');
    const [invoices, setInvoices] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        receptionistModuleApi.getInvoices()
            .then(res => {
                const data = res.data;
                let dailyCollected = 0;
                let pendingBills = 0;
                
                const today = new Date();
                today.setHours(0,0,0,0);

                const formatted = data.map((inv: any) => {
                    const invDate = new Date(inv.createdAt);
                    if (inv.status === 'PAID' && invDate >= today) {
                        dailyCollected += inv.totalAmount;
                    }
                    if (inv.status === 'PENDING') {
                        pendingBills++;
                    }

                    return {
                        id: inv.id.split('-')[0].toUpperCase(),
                        patient: inv.patient?.user?.name || 'Unknown',
                        doctor: inv.appointment?.doctor?.user?.name || 'N/A',
                        amount: `₹${inv.totalAmount.toLocaleString()}`,
                        date: new Date(inv.createdAt).toLocaleDateString(),
                        status: inv.status,
                        method: 'Card / UPI'
                    };
                });

                setStats({ dailyCollected, pendingBills, totalInvoices: data.length });
                setInvoices(formatted);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch invoices", err);
                setLoading(false);
            });
    }, []);

    const filtered = invoices.filter(inv => inv.patient.toLowerCase().includes(search.toLowerCase()) || inv.id.toLowerCase().includes(search.toLowerCase()));

    if (loading || !stats) {
        return <div className="flex items-center justify-center min-h-[50vh]"><span style={{ color: 'var(--text-faint)' }}>Loading billing data...</span></div>;
    }

    const cards = [
        { label: 'Daily Collection', value: `₹${stats.dailyCollected.toLocaleString()}`, icon: DollarSign, color: '#10B981' },
        { label: 'Pending Invoices', value: stats.pendingBills, icon: FileText, color: '#F59E0B' },
        { label: 'Total Processed', value: stats.totalInvoices, icon: CheckCircle, color: '#6366F1' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Billing POS</h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-faint)' }}>Manage patient invoices and payments</p>
                </div>
                <button className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white" style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>
                    + Generate Bill
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {cards.map((card, i) => {
                    const Icon = card.icon;
                    return (
                        <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                            className="p-5 rounded-2xl theme-card flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: `${card.color}20` }}>
                                <Icon className="w-6 h-6" style={{ color: card.color }} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{card.value}</p>
                                <p className="text-xs" style={{ color: 'var(--text-faint)' }}>{card.label}</p>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-faint)' }} />
                <input type="text" placeholder="Search invoices by patient or ID..." value={search} onChange={e => setSearch(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 rounded-xl text-sm outline-none theme-input" />
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="rounded-2xl overflow-hidden theme-card">
                <div className="overflow-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                                {['Invoice ID', 'Patient', 'Consulting Doctor', 'Amount', 'Date', 'Status', 'Action'].map(h => (
                                    <th key={h} className="text-left font-medium px-5 py-4" style={{ color: 'var(--text-muted)' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center py-8" style={{ color: 'var(--text-faint)' }}>No invoices found.</td>
                                </tr>
                            ) : filtered.map((inv, i) => (
                                <motion.tr key={inv.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 + i * 0.03 }}
                                    className="transition-colors" style={{ borderBottom: '1px solid var(--table-row-border)' }}>
                                    <td className="px-5 py-4 font-mono text-xs" style={{ color: 'var(--accent-indigo)' }}>INV-{inv.id}</td>
                                    <td className="px-5 py-4 font-medium" style={{ color: 'var(--text-secondary)' }}>{inv.patient}</td>
                                    <td className="px-5 py-4" style={{ color: 'var(--text-muted)' }}>{inv.doctor}</td>
                                    <td className="px-5 py-4 font-semibold" style={{ color: 'var(--text-primary)' }}>{inv.amount}</td>
                                    <td className="px-5 py-4" style={{ color: 'var(--text-muted)' }}>{inv.date}</td>
                                    <td className="px-5 py-4">
                                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                                            style={{ color: statusColor[inv.status] || '#10B981', background: `${statusColor[inv.status] || '#10B981'}15` }}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4">
                                        {inv.status === 'PENDING' ? (
                                            <button className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all text-white hover:opacity-90"
                                                style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}>
                                                Process Pay
                                            </button>
                                        ) : (
                                            <button className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all theme-btn-secondary" style={{ color: 'var(--text-primary)' }}>
                                                Print
                                            </button>
                                        )}
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

export default ReceptionistBilling;
