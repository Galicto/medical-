import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { LayoutDashboard, Users, Calendar, FileText, Settings, LogOut, Activity, Pill, Heart, DollarSign } from 'lucide-react';
import { hapticLight, hapticHeavy } from '@/utils/haptics';

const Sidebar = () => {
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();

    const roleConfig: Record<string, { links: { href: string; label: string; icon: any }[]; dashboardPath: string }> = {
        ADMIN: {
            dashboardPath: '/admin',
            links: [
                { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
                { href: '/admin/doctors', label: 'Doctors', icon: Users },
                { href: '/admin/patients', label: 'Patients', icon: Users },
                { href: '/admin/billing', label: 'Billing', icon: DollarSign },
                { href: '/admin/analytics', label: 'Analytics', icon: Activity },
                { href: '/admin/settings', label: 'Settings', icon: Settings },
            ],
        },
        DOCTOR: {
            dashboardPath: '/doctor',
            links: [
                { href: '/doctor', label: 'Dashboard', icon: LayoutDashboard },
                { href: '/doctor/appointments', label: 'Appointments', icon: Calendar },
                { href: '/doctor/patients', label: 'My Patients', icon: Users },
                { href: '/doctor/prescriptions', label: 'Prescriptions', icon: FileText },
                { href: '/doctor/settings', label: 'Settings', icon: Settings },
            ],
        },
        PATIENT: {
            dashboardPath: '/patient',
            links: [
                { href: '/patient', label: 'Dashboard', icon: LayoutDashboard },
                { href: '/patient/appointments', label: 'Book Appointment', icon: Calendar },
                { href: '/patient/prescriptions', label: 'Prescriptions', icon: Pill },
                { href: '/patient/reports', label: 'Reports', icon: FileText },
                { href: '/patient/billing', label: 'Billing', icon: DollarSign },
                { href: '/patient/settings', label: 'Settings', icon: Settings },
            ],
        },
        RECEPTIONIST: {
            dashboardPath: '/receptionist',
            links: [
                { href: '/receptionist', label: 'Dashboard', icon: LayoutDashboard },
                { href: '/receptionist/patients', label: 'Register Patient', icon: Users },
                { href: '/receptionist/appointments', label: 'Appointments', icon: Calendar },
                { href: '/receptionist/billing', label: 'Billing', icon: DollarSign },
                { href: '/receptionist/settings', label: 'Settings', icon: Settings },
            ],
        },
    };

    const config = user ? roleConfig[user.role] : null;
    const links = config?.links || [];

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <div
            className="flex flex-col w-64 h-screen shrink-0 transition-all duration-300"
            style={{
                background: 'var(--sidebar-bg)',
                borderRight: '1px solid var(--sidebar-border)',
            }}
        >
            {/* Logo */}
            <div className="p-6 flex items-center gap-3">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #6366F1, #3B82F6)' }}
                >
                    <Heart className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold" style={{ color: 'var(--sidebar-logo-text)' }}>MedLife</span>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 space-y-1 mt-2">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            to={link.href}
                            onClick={() => hapticLight()}
                            className="flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200"
                            style={{
                                background: isActive ? 'var(--sidebar-active-bg)' : 'transparent',
                                color: isActive ? 'var(--sidebar-active-text)' : 'var(--sidebar-text)',
                                borderLeft: isActive ? '3px solid var(--sidebar-active-border)' : '3px solid transparent',
                            }}
                        >
                            <Icon className="w-[18px] h-[18px] mr-3" style={{ color: isActive ? 'var(--sidebar-active-icon)' : 'var(--sidebar-icon)' }} />
                            {link.label}
                        </Link>
                    );
                })}
            </nav>

            {/* User + Logout */}
            <div className="p-4" style={{ borderTop: '1px solid var(--sidebar-border)' }}>
                <div className="flex items-center gap-3 mb-3 px-2">
                    <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
                        style={{ background: 'linear-gradient(135deg, #6366F1, #3B82F6)' }}
                    >
                        {user?.name?.[0] || 'U'}
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--sidebar-user-name)' }}>{user?.name}</p>
                        <p className="text-xs" style={{ color: 'var(--sidebar-user-role)' }}>{user?.role}</p>
                    </div>
                </div>
                <button
                    onClick={() => { hapticHeavy(); handleLogout(); }}
                    className="flex items-center w-full px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200"
                    style={{ color: '#F87171' }}
                >
                    <LogOut className="w-[18px] h-[18px] mr-3" />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
