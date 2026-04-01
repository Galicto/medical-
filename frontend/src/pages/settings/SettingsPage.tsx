import { motion } from 'framer-motion';
import { User, Lock, Bell, Shield, Moon, Sun, Globe } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { useState } from 'react';

const SettingsPage = () => {
    const { user } = useAuthStore();
    const { theme, toggleTheme } = useThemeStore();
    const [notifications, setNotifications] = useState({ email: true, sms: false, push: true });

    return (
        <div className="space-y-6 max-w-3xl">
            <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Settings</h1>
                <p className="text-sm mt-1" style={{ color: 'var(--text-faint)' }}>Manage your account and preferences</p>
            </div>

            {/* Profile */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl theme-card">
                <div className="flex items-center gap-2 mb-5">
                    <User className="w-5 h-5" style={{ color: 'var(--accent-indigo)' }} />
                    <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Profile</h2>
                </div>
                <div className="flex items-center gap-4 mb-5">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white"
                        style={{ background: 'linear-gradient(135deg, #6366F1, #3B82F6)' }}>
                        {user?.name?.[0] || 'U'}
                    </div>
                    <div>
                        <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
                        <p className="text-sm" style={{ color: 'var(--text-faint)' }}>{user?.email}</p>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full mt-1 inline-block"
                            style={{ color: 'var(--accent-indigo)', background: 'rgba(99,102,241,0.15)' }}>{user?.role}</span>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                        { label: 'Full Name', value: user?.name || '' },
                        { label: 'Email', value: user?.email || '' },
                        { label: 'Phone', value: '+91 98765 00000' },
                        { label: 'Department', value: user?.role === 'DOCTOR' ? 'Cardiology' : user?.role === 'ADMIN' ? 'Administration' : 'General' },
                    ].map(field => (
                        <div key={field.label}>
                            <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{field.label}</label>
                            <input type="text" defaultValue={field.value}
                                className="w-full h-10 px-3 mt-1 rounded-lg text-sm outline-none theme-input" />
                        </div>
                    ))}
                </div>
                <button className="mt-4 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                    style={{ background: 'linear-gradient(135deg, #6366F1, #3B82F6)' }}>Save Changes</button>
            </motion.div>

            {/* Security */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                className="p-6 rounded-2xl theme-card">
                <div className="flex items-center gap-2 mb-5">
                    <Lock className="w-5 h-5" style={{ color: 'var(--accent-indigo)' }} />
                    <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Security</h2>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Current Password</label>
                        <input type="password" placeholder="••••••••"
                            className="w-full h-10 px-3 mt-1 rounded-lg text-sm outline-none theme-input" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>New Password</label>
                            <input type="password" placeholder="••••••••"
                                className="w-full h-10 px-3 mt-1 rounded-lg text-sm outline-none theme-input" />
                        </div>
                        <div>
                            <label className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Confirm Password</label>
                            <input type="password" placeholder="••••••••"
                                className="w-full h-10 px-3 mt-1 rounded-lg text-sm outline-none theme-input" />
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl theme-card-inner">
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4" style={{ color: '#10B981' }} />
                            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Two-Factor Authentication</span>
                        </div>
                        <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ color: '#F59E0B', background: 'rgba(245,158,11,0.1)' }}>Disabled</span>
                    </div>
                    <button className="px-4 py-2 rounded-xl text-sm font-semibold text-white"
                        style={{ background: 'linear-gradient(135deg, #6366F1, #3B82F6)' }}>Update Password</button>
                </div>
            </motion.div>

            {/* Notifications */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="p-6 rounded-2xl theme-card">
                <div className="flex items-center gap-2 mb-5">
                    <Bell className="w-5 h-5" style={{ color: 'var(--accent-indigo)' }} />
                    <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Notifications</h2>
                </div>
                <div className="space-y-3">
                    {([
                        { key: 'email' as const, label: 'Email Notifications', desc: 'Receive updates via email' },
                        { key: 'sms' as const, label: 'SMS Notifications', desc: 'Receive text messages' },
                        { key: 'push' as const, label: 'Push Notifications', desc: 'Browser push notifications' },
                    ]).map(n => (
                        <div key={n.key} className="flex items-center justify-between p-3 rounded-xl theme-card-inner">
                            <div>
                                <p className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{n.label}</p>
                                <p className="text-xs" style={{ color: 'var(--text-faint)' }}>{n.desc}</p>
                            </div>
                            <button onClick={() => setNotifications(prev => ({ ...prev, [n.key]: !prev[n.key] }))}
                                className="w-11 h-6 rounded-full relative transition-all"
                                style={{ background: notifications[n.key] ? '#6366F1' : 'var(--toggle-off-bg)' }}>
                                <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
                                    style={{ left: notifications[n.key] ? '22px' : '2px' }} />
                            </button>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Preferences */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                className="p-6 rounded-2xl theme-card">
                <div className="flex items-center gap-2 mb-5">
                    <Globe className="w-5 h-5" style={{ color: 'var(--accent-indigo)' }} />
                    <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Preferences</h2>
                </div>
                <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl theme-card-inner">
                        <div className="flex items-center gap-2">
                            {theme === 'dark' ? (
                                <Moon className="w-4 h-4" style={{ color: 'var(--accent-indigo)' }} />
                            ) : (
                                <Sun className="w-4 h-4" style={{ color: '#F59E0B' }} />
                            )}
                            <div>
                                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                    {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                                </span>
                                <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
                                    Switch to {theme === 'dark' ? 'light' : 'dark'} mode
                                </p>
                            </div>
                        </div>
                        <button onClick={toggleTheme}
                            className="w-11 h-6 rounded-full relative transition-all"
                            style={{ background: theme === 'dark' ? '#6366F1' : 'var(--toggle-off-bg)' }}>
                            <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all"
                                style={{ left: theme === 'dark' ? '22px' : '2px' }} />
                        </button>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl theme-card-inner">
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Language</span>
                        <select className="text-sm px-3 py-1 rounded-lg outline-none theme-input">
                            <option>English</option>
                            <option>Hindi</option>
                            <option>Spanish</option>
                        </select>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-xl theme-card-inner">
                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Timezone</span>
                        <select className="text-sm px-3 py-1 rounded-lg outline-none theme-input">
                            <option>IST (UTC+5:30)</option>
                            <option>EST (UTC-5)</option>
                            <option>PST (UTC-8)</option>
                        </select>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default SettingsPage;
