import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, GraduationCap } from 'lucide-react';

const Landing = () => {
    const token = localStorage.getItem('token');
    const user = (() => {
        try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
    })();
    const navigate = useNavigate();

    const goToDashboard = () => {
        if (token) {
            navigate(user.role === 'admin' ? '/admin' : '/dashboard');
        } else {
            navigate('/login');
        }
    };

    return (
        <div className="min-h-screen bg-[#fafafa] bg-[radial-gradient(#d4d4d4_1px,transparent_1px)] bg-[size:24px_24px] flex flex-col">
            {/* Top bar - InvoiceFlow style */}
            <header className="flex justify-between items-center px-6 py-4">
                <Link to="/" className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                    BCET
                </Link>
                <button
                    onClick={goToDashboard}
                    className="px-5 py-2.5 rounded-xl bg-primary-600 text-white font-semibold text-sm hover:bg-primary-700 transition-colors"
                >
                    Dashboard
                </button>
            </header>

            {/* Centered main content */}
            <main className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
                <div className="text-center max-w-xl mx-auto">
                    {/* Logo */}
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/30">
                            <GraduationCap size={40} className="text-white" />
                        </div>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary-600 via-primary-500 to-primary-700 bg-clip-text text-transparent mb-2">
                        BCET
                    </h1>
                    <p className="text-xl md:text-2xl font-bold text-gray-800 mb-4">
                        Balasore College of Engineering & Technology
                    </p>
                    <p className="text-gray-500 text-sm md:text-base leading-relaxed mb-10">
                        Experience 25 years of excellence. AI-powered admissions enquiry, courses, fees, hostel info, and seamless support—all in one place.
                    </p>
                    <button
                        onClick={goToDashboard}
                        className="inline-flex items-center justify-center gap-2 w-full max-w-sm px-8 py-4 rounded-2xl bg-gradient-to-r from-primary-600 to-primary-500 text-white font-bold text-lg shadow-lg shadow-primary-500/30 hover:from-primary-700 hover:to-primary-600 transition-all active:scale-[0.98]"
                    >
                        <span>Enter Dashboard</span>
                        <ArrowRight size={22} />
                    </button>
                </div>
            </main>

            {/* Footer */}
            <footer className="py-4 px-6">
                <p className="text-gray-400 text-xs">
                    Contact: (06782) 236045 · principal@bcetodisha.ac.in
                </p>
            </footer>
        </div>
    );
};

export default Landing;
