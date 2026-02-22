import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    School,
    Bot,
    Headphones,
    History,
    MessageSquare,
    Settings,
    LogOut,
    Bell,
    GraduationCap,
    BookOpen,
    UserPlus,
    Moon,
    SunMedium
} from 'lucide-react';

const AdminLayout = () => {
    const navigate = useNavigate();
    const [theme, setTheme] = useState(() => {
        if (typeof window === 'undefined') return 'light';
        return localStorage.getItem('theme') === 'dark' ? 'dark' : 'light';
    });

    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Read user from localStorage set by Login.jsx
    let adminName = 'Admin';
    let adminEmail = '';
    try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        adminName = user.name || 'Admin';
        adminEmail = user.email || '';
    } catch { }

    const menuItems = [
        { name: 'Overview', icon: LayoutDashboard, path: '/admin' },
        { name: 'College Info', icon: School, path: '/admin/college-info' },
        { name: 'AI Agent', icon: Bot, path: '/admin/agent' },
        { name: 'Knowledge', icon: BookOpen, path: '/admin/knowledge' },
        { name: 'Live Monitoring', icon: Headphones, path: '/admin/live-monitor' },
        { name: 'Call History', icon: History, path: '/admin/calls' },
        { name: 'Admission Leads', icon: UserPlus, path: '/admin/leads' },
        { name: 'Automation', icon: MessageSquare, path: '/admin/automation' },
        { name: 'Settings', icon: Settings, path: '/admin/settings' },
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/admin/login');
    };

    const toggleTheme = () => {
        setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
    };

    return (
        <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden font-sans text-gray-900 dark:text-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-100/80 dark:border-gray-800 flex flex-col h-full shadow-sm">
                <div className="p-6 border-b border-gray-100/80 dark:border-gray-800">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                            <GraduationCap size={22} className="text-white" />
                        </div>
                        <div>
                            <span className="text-lg font-black text-gray-900 dark:text-gray-50 leading-none block">BCET</span>
                            <span className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest">Admin Panel</span>
                        </div>
                    </div>
                </div>

                <nav className="flex-grow p-4 space-y-1 overflow-y-auto">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            end={item.path === '/admin'}
                            className={({ isActive }) => `
                                flex items-center space-x-3 px-4 py-3 rounded-xl transition-all text-sm font-semibold
                                ${isActive
                                    ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-200 shadow-sm border border-primary-100/80 dark:border-primary-900'
                                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-50'
                                }
                            `}
                        >
                            <item.icon size={18} />
                            <span>{item.name}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-100/80 dark:border-gray-800">
                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-4 py-3 w-full text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-950/40 hover:text-red-500 rounded-xl transition-colors text-sm font-semibold"
                    >
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-grow flex flex-col min-w-0 overflow-hidden">
                {/* Top Header */}
                <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-100/80 dark:border-gray-800 flex items-center justify-between px-8 shrink-0">
                    <h2 className="text-lg font-bold text-gray-700 dark:text-gray-100">Dashboard</h2>
                    <div className="flex items-center space-x-4">
                        <button
                            className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-100 bg-gray-50 dark:bg-gray-800 rounded-xl"
                            onClick={toggleTheme}
                            type="button"
                            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                        >
                            {theme === 'dark' ? <SunMedium size={18} /> : <Moon size={18} />}
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-100 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            <Bell size={20} />
                        </button>
                        <div className="flex items-center space-x-3 pl-4 border-l border-gray-100/80 dark:border-gray-800">
                            <div className="text-right">
                                <p className="text-sm font-bold text-gray-900 dark:text-gray-50 leading-none">{adminName}</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500">{adminEmail || 'College Admin'}</p>
                            </div>
                            <div className="w-10 h-10 bg-gradient-to-tr from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {adminName.charAt(0).toUpperCase()}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-grow overflow-y-auto p-8 bg-gray-50/80 dark:bg-gray-950">
                    <div className="max-w-6xl mx-auto">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
