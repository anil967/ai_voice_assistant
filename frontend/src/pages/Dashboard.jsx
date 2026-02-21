import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    GraduationCap,
    Building2,
    Phone,
    Mail,
    MapPin,
    ArrowRight,
    Zap,
    FileText,
    Calendar,
    ExternalLink,
} from 'lucide-react';
import { getCollegeInfo } from '../api';

const Dashboard = ({ onTalkToAI }) => {
    const [college, setCollege] = useState(null);
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        getCollegeInfo()
            .then(({ data }) => setCollege(data))
            .catch(() => setCollege(null));
    }, []);

    const c = college || {};

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header - BCET style */}
            <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link to="/dashboard" className="flex items-center space-x-2">
                            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                                <GraduationCap size={24} className="text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900">BCET Odisha</span>
                        </Link>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={onTalkToAI}
                                className="btn btn-primary px-4 py-2 text-sm font-bold flex items-center gap-2"
                            >
                                <Phone size={18} />
                                Talk to AI
                            </button>
                            <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
                                <span className="text-sm text-gray-600">{user.name || 'User'}</span>
                                <Link
                                    to="/"
                                    onClick={() => {
                                        localStorage.removeItem('token');
                                        localStorage.removeItem('user');
                                    }}
                                    className="text-sm text-red-600 hover:underline"
                                >
                                    Logout
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
                <nav className="bg-primary-50 border-t border-primary-100">
                    <div className="max-w-7xl mx-auto px-4 flex gap-6 py-2">
                        <a href="#about" className="text-sm font-semibold text-primary-700 hover:text-primary-900">About</a>
                        <a href="#courses" className="text-sm font-semibold text-primary-700 hover:text-primary-900">Courses</a>
                        <a href="#facilities" className="text-sm font-semibold text-primary-700 hover:text-primary-900">Facilities</a>
                        <a href="#admissions" className="text-sm font-semibold text-primary-700 hover:text-primary-900">Admissions</a>
                        <a href="#contact" className="text-sm font-semibold text-primary-700 hover:text-primary-900">Contact</a>
                    </div>
                </nav>
            </header>

            <main className="animate-fade-in">
                {/* Hero - Silver Jubilee style (bcetodisha.ac.in) */}
                <section className="relative py-20 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl" />
                        <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent-400 rounded-full blur-3xl" />
                    </div>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                        <div className="text-center">
                            <p className="text-primary-200 font-bold text-sm uppercase tracking-widest mb-4">
                                Celebrating 25 Years of Excellence, Growth & Legacy
                            </p>
                            <h1 className="text-4xl md:text-6xl font-black mb-4">
                                SILVER JUBILEE
                            </h1>
                            <p className="text-xl text-primary-100 mb-2">
                                25 Glorious Years (2001 – 2025)
                            </p>
                            <p className="text-primary-200 max-w-2xl mx-auto mb-8">
                                {c.tagline || 'Balasore College of Engineering & Technology'}
                            </p>
                            <p className="text-sm text-primary-200">
                                For any inquiry: {c.contact?.phone || '(06782) 236045'} · {c.contact?.email || 'principal@bcetodisha.ac.in'}
                            </p>
                        </div>
                    </div>
                </section>

                {/* About Us */}
                <section id="about" className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8">About Us</h2>
                        <p className="text-gray-600 leading-relaxed max-w-4xl">
                            {c.about || 'Balasore College of Engineering & Technology saw light in the year 2001 at Balasore of Odisha. The institute aspires to play a pivotal role in imparting technical education while inculcating in the young minds a spirit of benevolence and tolerance with a view to generate sustainable human resource at par with international standard.'}
                        </p>
                        <div className="mt-12 grid md:grid-cols-2 gap-8">
                            <div className="p-6 bg-primary-50 rounded-2xl border border-primary-100">
                                <h3 className="font-bold text-gray-900 text-lg mb-3">Our Vision</h3>
                                <p className="text-gray-600 text-sm">To become an institute of excellence in technical and management education and to produce industry-ready professionals for the nation.</p>
                            </div>
                            <div className="p-6 bg-primary-50 rounded-2xl border border-primary-100">
                                <h3 className="font-bold text-gray-900 text-lg mb-3">Our Mission</h3>
                                <p className="text-gray-600 text-sm">To provide inclusive, student-centric engineering and management education that emphasizes academic excellence, creativity, and community service.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Notice Board */}
                <section className="py-16 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                            <FileText size={28} className="text-primary-600" />
                            Notice Board
                        </h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            {[
                                { date: '19 Jan 2026', title: 'Notice for Silver Jubilee Annual Cultural Program' },
                                { date: '13 Jan 2026', title: 'Holiday on account of Makar Sankranti' },
                                { date: '16 Dec 2025', title: 'BCET Annual Sports Meet & Charisma 2026' },
                            ].map((n) => (
                                <div key={n.title} className="flex gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-primary-200 transition-colors">
                                    <div className="w-16 h-16 bg-primary-100 rounded-xl flex flex-col items-center justify-center text-primary-700 flex-shrink-0">
                                        <span className="text-xs font-bold">{n.date.split(' ')[0]}</span>
                                        <span className="text-lg font-black leading-tight">{n.date.split(' ')[1]}</span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{n.title}</p>
                                        <a href="https://bcetodisha.ac.in/" target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:underline flex items-center gap-1 mt-1">
                                            View all <ExternalLink size={14} />
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Courses */}
                <section id="courses" className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8">Academic Programs</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {(c.courses || []).map((course) => (
                                <div key={course.name} className="p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:border-primary-200 transition-all">
                                    <GraduationCap size={28} className="text-primary-600 mb-3" />
                                    <h3 className="font-bold text-gray-900 mb-2">{course.name}</h3>
                                    <p className="text-sm text-gray-500">{course.duration} · {course.fees}</p>
                                    <p className="text-xs text-gray-400 mt-2">Eligibility: {course.eligibility}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Facilities */}
                <section id="facilities" className="py-20 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8">Campus Facilities</h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {(c.facilities || []).map((f) => (
                                <div key={f.name} className="p-6 bg-white rounded-2xl border border-gray-100">
                                    <Building2 size={24} className="text-primary-600 mb-3" />
                                    <h3 className="font-bold text-gray-900">{f.name}</h3>
                                    <p className="text-sm text-gray-600 mt-1">{f.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Admissions */}
                <section id="admissions" className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">Admissions & Fee</h2>
                        <p className="text-gray-600 max-w-2xl mb-8">
                            {c.admissionProcess || 'Admissions through JEE/OUAT for B.Tech. Visit bcetodisha.ac.in or call admission helpline.'}
                        </p>
                        <Link
                            to="/admissions"
                            className="btn btn-primary inline-flex items-center gap-2"
                        >
                            View Prospectus <ArrowRight size={18} />
                        </Link>
                    </div>
                </section>

                {/* Contact */}
                <section id="contact" className="py-20 bg-primary-600 text-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-bold mb-8">Contact Us</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="flex items-start gap-4">
                                <MapPin size={24} className="flex-shrink-0 text-primary-200" />
                                <div>
                                    <p className="font-bold mb-1">Address</p>
                                    <p className="text-primary-100 text-sm">{c.contact?.address || 'NH-16, Sergarh, Balasore (756060), Odisha'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <Phone size={24} className="flex-shrink-0 text-primary-200" />
                                <div>
                                    <p className="font-bold mb-1">Phone</p>
                                    <p className="text-primary-100 text-sm">{c.contact?.phone || '(06782) 236045, 9777938474, 9437961413'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <Mail size={24} className="flex-shrink-0 text-primary-200" />
                                <div>
                                    <p className="font-bold mb-1">Email</p>
                                    <p className="text-primary-100 text-sm">{c.contact?.email || 'principal@bcetodisha.ac.in'}</p>
                                </div>
                            </div>
                        </div>
                        <p className="mt-8 text-primary-200 text-sm">
                            © Copyright 2026 BCET Group Of Institutes
                        </p>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Dashboard;
