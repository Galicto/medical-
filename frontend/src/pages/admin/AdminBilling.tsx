import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, Users, FileText, Search } from 'lucide-react';
import { adminModuleApi } from '@/services/api';

const statusColor: Record<string, string> = { PAID: '#10B981', PENDING: '#F59E0B', OVERDUE: '#EF4444' };

const AdminBilling = () => {
    const [search, setSearch] = useState('');
    const [invoices, setInvoices] = useState<any[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        adminModuleApi.getBilling()
            .then(res => {
                const data = res.data;
                let totalRev = 0;
                let outstanding = 0;
                const uniquePatients = new Set();
                
                const formatted = data.map((inv: any) => {
                    if (inv.status === 'PAID') totalRev += inv.totalAmount;
                    if (inv.status === 'PENDING') outstanding += inv.totalAmount;
                    uniquePatients.add(inv.patientId);

                    return {
                        id: inv.id.split('-')[0].toUpperCase(),
                        patient: inv.patient?.user?.name || 'Unknown',
                        amount: `₹${inv.totalAmount.toLocaleString()}`,
                        date: new Date(inv.createdAt).toLocaleDateString(),
                        status: inv.status,
                        method: 'Card / UPI'
                    };
                });

                setStats({
                    revenue: totalRev,
                    outstanding: outstanding,
                    patientsBilled: uniquePatients.size,
                    totalInvoices: data.length
                });

                setInvoices(formatted);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch billing", err);
                setLoading(false);
            });
    }, []);

    const filtered = invoices.filter(inv => inv.patient.toLowerCase().includes(search.toLowerCase()) || inv.id.toLowerCase().includes(search.toLowerCase()));

    if (loading || !stats) {
        return <div className="flex items-center justify-center min-h-[50vh]"><span style={{ color: 'var(--text-faint)' }}>Loading billing data...</span></div>;
    }

    const revenueStats = [
        { label: 'Total Revenue', value: `₹${stats.revenue.toLocaleString()}`, change: '+14.2%', icon: DollarSign, color: '#10B981' },
        { label: 'Outstanding', value: `₹${stats.outstanding.toLocaleString()}`, change: '-3.1%', icon: TrendingUp, color: '#F59E0B' },
        { label: 'Patients Billed', value: stats.patientsBilled, change: '+8.5%', icon: Users, color: '#6366F1' },
        { label: 'Invoices Sent', value: stats.totalInvoices, change: '+12.1%', icon: FileText, color: '#3B82F6' },
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Billing & Payments</h1>
                <p className="text-sm mt-1" style={{ color: 'var(--text-faint)' }}>Manage invoices and revenue</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {revenueStats.map((stat, i) => {
                    const Icon = stat.icon;
                    return (
                        <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                            className="p-5 rounded-2xl theme-card">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: `${stat.color}20` }}>
                                <Icon className="w-5 h-5" style={{ color: stat.color }} />
                            </div>
                            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
                            <p className="text-xs mt-1" style={{ color: 'var(--text-faint)' }}>{stat.label}</p>
                            <span className="text-xs font-semibold mt-2 inline-block" style={{ color: '#10B981' }}>{stat.change}</span>
                        </motion.div>
                    );
                })}
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-faint)' }} />
                <input type="text" placeholder="Search invoices..." value={search} onChange={e => setSearch(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 rounded-xl text-sm outline-none theme-input" />
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                className="rounded-2xl overflow-hidden theme-card">
                <div className="overflow-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--card-border)' }}>
                                {['Invoice', 'Patient', 'Amount', 'Date', 'Method', 'Status'].map(h => (
                                    <th key={h} className="text-left font-medium px-5 py-4" style={{ color: 'var(--text-muted)' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((inv, i) => (
                                <motion.tr key={inv.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 + i * 0.03 }}
                                    className="transition-colors" style={{ borderBottom: '1px solid var(--table-row-border)' }}>
                                    <td className="px-5 py-4 font-mono text-xs" style={{ color: 'var(--accent-indigo)' }}>INV-{inv.id}</td>
                                    <td className="px-5 py-4 font-medium" style={{ color: 'var(--text-secondary)' }}>{inv.patient}</td>
                                    <td className="px-5 py-4 font-semibold" style={{ color: 'var(--text-primary)' }}>{inv.amount}</td>
                                    <td className="px-5 py-4" style={{ color: 'var(--text-muted)' }}>{inv.date}</td>
                                    <td className="px-5 py-4" style={{ color: 'var(--text-muted)' }}>{inv.method}</td>
                                    <td className="px-5 py-4">
                                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                                            style={{ color: statusColor[inv.status] || '#10B981', background: `${statusColor[inv.status] || '#10B981'}15` }}>
                                            {inv.status}
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

export default AdminBilling;
