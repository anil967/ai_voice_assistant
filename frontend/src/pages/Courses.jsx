import React from 'react';
import { GraduationCap, Clock, CheckCircle, ArrowRight } from 'lucide-react';

const Courses = () => {
    const courses = [
        { name: 'B.Tech Computer Science & Engineering', duration: '4 Years', fees: 'Contact (06782) 236045', tag: 'Popular' },
        { name: 'B.Tech Information Technology', duration: '4 Years', fees: 'Contact for details', tag: 'BPUT' },
        { name: 'B.Tech Electrical / EEE / ET', duration: '4 Years', fees: 'Contact for details', tag: 'AICTE' },
        { name: 'B.Tech Mechanical / Civil', duration: '4 Years', fees: 'Contact for details', tag: 'BPUT' },
        { name: 'M.Tech', duration: '2 Years', fees: 'Contact for details', tag: 'PG' },
        { name: 'MBA', duration: '2 Years', fees: 'Contact for details', tag: 'Management' },
        { name: 'MCA', duration: '3 Years', fees: 'Contact for details', tag: 'Computing' },
    ];

    return (
        <div className="animate-fade-in pb-24">
            <section className="bg-gray-50 py-20 px-4">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6">BCET Academic Programs</h1>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto">B.Tech, M.Tech, MBA & MCA. AICTE approved, affiliated to BPUT, Odisha.</p>
                </div>
            </section>

            <section className="px-4 -mt-10">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {courses.map((course) => (
                            <div key={course.name} className="card p-8 group hover:border-primary-500 transition-all cursor-pointer">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="p-3 bg-primary-50 text-primary-600 rounded-2xl group-hover:bg-primary-600 group-hover:text-white transition-colors">
                                        <GraduationCap size={32} />
                                    </div>
                                    <span className="text-xs font-bold px-3 py-1 bg-accent-50 text-accent-600 rounded-full border border-accent-100 uppercase tracking-widest">
                                        {course.tag}
                                    </span>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">{course.name}</h3>
                                <div className="space-y-3 mb-8">
                                    <div className="flex items-center space-x-2 text-gray-500 font-medium">
                                        <Clock size={18} className="text-primary-400 transition-colors" />
                                        <span>{course.duration}</span>
                                    </div>
                                    <div className="flex items-center space-x-2 text-gray-900 font-bold">
                                        <span className="text-primary-600 text-lg">{course.fees}</span>
                                    </div>
                                </div>
                                <div className="pt-6 border-t border-gray-50 flex items-center justify-between group-hover:text-primary-600 transition-colors">
                                    <span className="font-bold text-sm uppercase tracking-widest">Enrollment Open</span>
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Why study here */}
            <section className="py-24 px-4">
                <div className="max-w-7xl mx-auto bg-primary-600 rounded-[3rem] p-12 md:p-20 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-white opacity-5 rounded-full -translate-y-40 translate-x-40"></div>
                    <div className="max-w-2xl relative">
                        <h2 className="text-3xl md:text-5xl font-extrabold mb-8 leading-tight">Ready to start your journey?</h2>
                        <ul className="space-y-4 mb-10">
                            <li className="flex items-center space-x-3">
                                <CheckCircle className="text-primary-200" size={24} />
                                <span className="text-lg font-medium">100% Placement Assistance</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <CheckCircle className="text-primary-200" size={24} />
                                <span className="text-lg font-medium">Industry Expert Faculties</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <CheckCircle className="text-primary-200" size={24} />
                                <span className="text-lg font-medium">State-of-the-Art Labs</span>
                            </li>
                        </ul>
                        <a href="https://bcetodisha.ac.in/admission.php" target="_blank" rel="noopener noreferrer" className="btn bg-white text-primary-600 px-10 py-5 text-lg font-bold shadow-xl inline-block">
                            Apply for Admission
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Courses;
