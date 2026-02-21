import React from 'react';
import { Award, BookOpen, Users, Compass, CheckCircle } from 'lucide-react';

const About = () => {
    return (
        <div className="animate-fade-in">
            {/* Mission Hero */}
            <section className="bg-primary-900 text-white py-24 px-4 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-1/3 h-full bg-primary-800 -skew-x-12 transform translate-x-20"></div>
                <div className="max-w-7xl mx-auto relative">
                    <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">Our Mission & Legacy</h1>
                    <p className="text-xl text-primary-200 max-w-2xl leading-relaxed">
                        Balasore College of Engineering & Technology (BCET) has been at the forefront of technical education in Odisha since 2001. AICTE approved, BPUT affiliated, fostering innovation and excellence.
                    </p>
                </div>
            </section>

            {/* Core Values */}
            <section className="py-24 px-4 bg-white">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8">Why We Do What We Do</h2>
                        <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-xl flex-shrink-0 flex items-center justify-center">
                                <Award size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 text-lg">Academic Excellence</h4>
                                <p className="text-gray-600 mt-1">Striving for the highest standards in every department and course we offer.</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-accent-100 text-accent-600 rounded-xl flex-shrink-0 flex items-center justify-center">
                                <Compass size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 text-lg">Global Vision</h4>
                                <p className="text-gray-600 mt-1">Preparing students to compete and excel on the international stage.</p>
                            </div>
                        </div>
                        <div className="flex items-start space-x-4">
                            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex-shrink-0 flex items-center justify-center">
                                <Users size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 text-lg">Community Impact</h4>
                                <p className="text-gray-600 mt-1">Solving real-world problems through engineering and social responsibility.</p>
                            </div>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="aspect-video bg-gray-100 rounded-3xl shadow-2xl overflow-hidden border-8 border-white">
                            <div className="w-full h-full bg-gradient-to-br from-primary-600 to-primary-900 flex items-center justify-center text-white text-5xl font-black opacity-20">
                                CAMPUS VIEW
                            </div>
                        </div>
                        <div className="absolute -bottom-8 -left-8 bg-white p-6 rounded-2xl shadow-xl flex items-center space-x-4 border border-gray-100 animate-slide-up">
                            <div className="text-4xl font-black text-primary-600">25+</div>
                            <div className="text-sm font-bold text-gray-400 leading-tight">YEARS OF<br />EXPERIENCE</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Leadership */}
            <section className="py-24 bg-gray-50 px-4">
                <div className="max-w-7xl mx-auto text-center mb-16">
                    <h2 className="text-3xl font-bold text-gray-900">Leadership Team</h2>
                    <p className="text-gray-500 mt-4">Managed by visionary educators and industry veterans.</p>
                </div>
                <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {[
                        { name: 'Dr. Robert Smith', role: 'Chancellor' },
                        { name: 'Dr. Sarah J.', role: 'Head of Research' },
                        { name: 'Prof. Alan Turing', role: 'CSE Department' },
                        { name: 'Emma Wilson', role: 'Student Relations' },
                    ].map(member => (
                        <div key={member.name} className="space-y-3">
                            <div className="w-24 h-24 bg-white rounded-full mx-auto shadow-md border-2 border-primary-100"></div>
                            <h4 className="font-bold text-gray-900">{member.name}</h4>
                            <p className="text-xs text-primary-600 font-bold uppercase tracking-widest">{member.role}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default About;
