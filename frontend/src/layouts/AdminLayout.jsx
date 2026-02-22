import React from 'react';
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
    UserPlus
} from 'lucide-react';

const AdminLayout = () => {
    const navigate = useNavigate();

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

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-full shadow-sm">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                            <GraduationCap size={22} className="text-white" />
                        </div>
                        <div>
                            <span className="text-lg font-black text-gray-900 leading-none block">BCET</span>
                            <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Admin Panel</span>
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
                                    ? 'bg-primary-50 text-primary-700 shadow-sm border border-primary-100'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                }
                            `}
                        >
                            <item.icon size={18} />
                            <span>{item.name}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 px-4 py-3 w-full text-gray-500 hover:bg-red-50 hover:text-red-500 rounded-xl transition-colors text-sm font-semibold"
                    >
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-grow flex flex-col min-w-0 overflow-hidden">
                {/* Top Header */}
                <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-8 shrink-0">
                    <h2 className="text-lg font-bold text-gray-700">Dashboard</h2>
                    <div className="flex items-center space-x-4">
                        <button className="p-2 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-xl">
                            <Bell size={20} />
                        </button>
                        <div className="flex items-center space-x-3 pl-4 border-l border-gray-100">
                            <div className="text-right">
                                <p className="text-sm font-bold text-gray-900 leading-none">{adminName}</p>
                                <p className="text-xs text-gray-400">{adminEmail || 'College Admin'}</p>
                            </div>
                            <div className="w-10 h-10 bg-gradient-to-tr from-primary-400 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                {adminName.charAt(0).toUpperCase()}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-grow overflow-y-auto p-8 bg-gray-50/80">
                    <div className="max-w-6xl mx-auto">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
