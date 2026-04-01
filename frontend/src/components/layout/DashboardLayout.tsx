import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useThemeStore } from '@/store/themeStore';
import { useEffect } from 'react';

const DashboardLayout = () => {
    const { theme } = useThemeStore();

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    return (
        <div className="flex h-screen overflow-hidden" style={{ background: 'var(--page-bg)' }}>
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Navbar />
                <main
                    className="flex-1 overflow-auto p-6"
                    style={{ background: 'var(--page-bg-gradient)' }}
                >
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
