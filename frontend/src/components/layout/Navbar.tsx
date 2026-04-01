import { useAuthStore } from '@/store/authStore';
import { useThemeStore } from '@/store/themeStore';
import { Bell, Search, Sun, Moon } from 'lucide-react';
import { hapticMedium, hapticLight } from '@/utils/haptics';

const Navbar = () => {
    const { user } = useAuthStore();
    const { theme, toggleTheme } = useThemeStore();

    return (
        <header
            className="h-16 flex items-center justify-between px-6 shrink-0 transition-all duration-300"
            style={{
                background: 'var(--navbar-bg)',
                backdropFilter: 'blur(12px)',
                borderBottom: '1px solid var(--navbar-border)',
            }}
        >
            {/* Search */}
            <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--navbar-search-placeholder)' }} />
                <input
                    type="search"
                    placeholder="Search patients, appointments..."
                    className="w-full h-10 pl-10 pr-4 rounded-xl text-sm outline-none transition-all theme-input"
                />
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
                {/* Theme Toggle */}
                <button
                    onClick={() => { hapticMedium(); toggleTheme(); }}
                    className="p-2.5 rounded-xl transition-all hover:scale-105"
                    style={{ background: 'var(--navbar-bell-bg)' }}
                    title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                >
                    {theme === 'dark' ? (
                        <Sun className="w-[18px] h-[18px]" style={{ color: '#F59E0B' }} />
                    ) : (
                        <Moon className="w-[18px] h-[18px]" style={{ color: '#6366F1' }} />
                    )}
                </button>

                <button
                    onClick={() => hapticLight()}
                    className="relative p-2.5 rounded-xl transition-all"
                    style={{ background: 'var(--navbar-bell-bg)' }}
                >
                    <Bell className="w-[18px] h-[18px]" style={{ color: 'var(--navbar-bell-icon)' }} />
                    <span
                        className="absolute top-2 right-2 w-2 h-2 rounded-full animate-pulse"
                        style={{ background: '#F87171' }}
                    />
                </button>

                <div className="flex items-center gap-3 pl-3" style={{ borderLeft: '1px solid var(--navbar-divider)' }}>
                    <div>
                        <p className="text-sm font-medium text-right" style={{ color: 'var(--navbar-name)' }}>{user?.name}</p>
                        <p className="text-xs text-right" style={{ color: 'var(--navbar-role)' }}>{user?.role}</p>
                    </div>
                    <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
                        style={{ background: 'linear-gradient(135deg, #6366F1, #3B82F6)' }}
                    >
                        {user?.name?.[0] || 'U'}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
