import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PhoneCall, Menu, X, LogIn, UserPlus, LayoutDashboard, LogOut } from 'lucide-react';

const Navbar = ({ onTalkToAI }) => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const user = (() => {
        try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
    })();

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about' },
        { name: 'Courses', path: '/courses' },
        { name: 'Facilities', path: '/facilities' },
        { name: 'Admissions', path: '/admissions' },
    ];

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsOpen(false);
        navigate('/');
    };

    return (
        <nav className="sticky top-0 z-50 glass">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-20">
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                                <span className="text-white font-bold text-xl">S</span>
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-900 bg-clip-text text-transparent">
                                BCET Odisha
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-6">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                to={link.path}
                                className={`font-medium transition-colors ${location.pathname === link.path ? 'text-primary-600' : 'text-gray-600 hover:text-primary-600'}`}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <button
                            onClick={onTalkToAI}
                            className="btn btn-primary px-5 py-2.5 space-x-2"
                        >
                            <PhoneCall size={18} />
                            <span>Talk to AI</span>
                        </button>
                        {token ? (
                            <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
                                <span className="text-sm text-gray-600">{user.name}</span>
                                <Link
                                    to={user.role === 'admin' ? '/admin' : '/dashboard'}
                                    className="btn bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 space-x-2 text-sm"
                                >
                                    <LayoutDashboard size={16} />
                                    <span>Dashboard</span>
                                </Link>
                                <button onClick={handleLogout} className="text-gray-500 hover:text-red-600 flex items-center gap-1 text-sm">
                                    <LogOut size={16} />
                                    <span>Logout</span>
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-2 pl-4 border-l border-gray-200">
                                <Link to="/login" className="btn bg-white border border-gray-200 text-gray-700 hover:bg-primary-50 hover:border-primary-200 px-4 py-2 space-x-2 text-sm">
                                    <LogIn size={16} />
                                    <span>Login</span>
                                </Link>
                                <Link to="/signup" className="btn btn-primary px-4 py-2 space-x-2 text-sm">
                                    <UserPlus size={16} />
                                    <span>Sign Up</span>
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 hover:text-primary-600">
                            {isOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 p-4 space-y-4 shadow-xl">
                    {navLinks.map((link) => (
                        <Link key={link.name} to={link.path} onClick={() => setIsOpen(false)} className="block text-lg font-medium text-gray-600 hover:text-primary-600 px-4 py-2 rounded-lg">
                            {link.name}
                        </Link>
                    ))}
                    <button onClick={() => { setIsOpen(false); onTalkToAI?.(); }} className="w-full btn btn-primary space-x-2">
                        <PhoneCall size={18} />
                        <span>Talk to AI</span>
                    </button>
                    {token ? (
                        <div className="pt-4 border-t border-gray-100 space-y-2">
                            <p className="px-4 text-sm text-gray-500">{user.name}</p>
                            <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} onClick={() => setIsOpen(false)} className="block btn bg-gray-100 text-gray-700 w-full justify-start px-4">
                                <LayoutDashboard size={18} className="mr-2" />
                                Dashboard
                            </Link>
                            <button onClick={handleLogout} className="w-full btn bg-red-50 text-red-600 hover:bg-red-100 justify-start px-4">
                                <LogOut size={18} className="mr-2" />
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="pt-4 border-t border-gray-100 flex gap-2">
                            <Link to="/login" onClick={() => setIsOpen(false)} className="flex-1 btn bg-gray-100 text-gray-700 justify-center">
                                Login
                            </Link>
                            <Link to="/signup" onClick={() => setIsOpen(false)} className="flex-1 btn btn-primary justify-center">
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
