import React from 'react';
import { ClipboardCheck, FileText, CreditCard, UserCheck, Calendar, ArrowRight } from 'lucide-react';

const Step = ({ number, icon: Icon, title, description, isLast }) => (
    <div className="relative flex items-start group">
        {!isLast && (
            <div className="absolute left-10 top-20 bottom-0 w-0.5 bg-gray-100 group-hover:bg-primary-100 transition-colors"></div>
        )}
        <div className="w-20 h-20 bg-white border-2 border-gray-100 rounded-3xl flex items-center justify-center text-primary-600 shadow-sm group-hover:border-primary-500 transition-all z-10 shrink-0">
            <Icon size={32} />
        </div>
        <div className="ml-10 pb-16">
            <div className="flex items-center space-x-3 mb-3">
                <span className="text-sm font-black text-primary-600 uppercase tracking-widest bg-primary-50 px-3 py-1 rounded-full">Step {number}</span>
                <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
            </div>
            <p className="text-gray-500 lg:max-w-xl text-lg leading-relaxed">
                {description}
            </p>
        </div>
    </div>
);

const Admissions = () => {
    return (
        <div className="animate-fade-in pb-24">
            <section className="py-24 px-4 bg-gray-50">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-8 tracking-tight">Admission Process 2026</h1>
                    <p className="text-xl text-gray-500 max-w-3xl mx-auto">A seamless, step-by-step guide to becoming a student at BCET - Balasore College of Engineering & Technology.</p>
                </div>
            </section>

            <section className="py-24 px-4">
                <div className="max-w-4xl mx-auto">
                    <Step
                        number="01"
                        icon={ClipboardCheck}
                        title="Online Registration"
                        description="Fill out the initial application form on our portal with your basic details and course preference."
                    />
                    <Step
                        number="02"
                        icon={FileText}
                        title="Document Upload"
                        description="Upload your academic transcripts, ID proof, and entrance exam scorecards for verification."
                    />
                    <Step
                        number="03"
                        icon={UserCheck}
                        title="Counseling & Interview"
                        description="Attend a brief interaction with our department heads to discuss your academic goals."
                    />
                    <Step
                        number="04"
                        icon={CreditCard}
                        title="Fee Payment"
                        description="Confirm your seat by paying the initial semester fee through our secure payment gateway."
                        isLast={true}
                    />
                </div>
            </section>

            {/* Important Dates */}
            <section className="py-24 px-4 bg-gray-900 text-white rounded-t-[5rem]">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 space-y-8 md:space-y-0 text-center md:text-left">
                        <div>
                            <h2 className="text-3xl md:text-5xl font-bold mb-4">Admissions Calendar</h2>
                            <p className="text-gray-400">Keep track of important deadlines to ensure your seat.</p>
                        </div>
                        <button className="btn btn-primary bg-primary-500 hover:bg-primary-600 px-10">
                            Download Prospectus
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { event: 'Applications Start', date: 'March 15, 2026', icon: Calendar },
                            { event: 'Entrance Exam', date: 'May 20, 2026', icon: BookOpen }, // Assuming BookOpen is imported or use Clock
                            { event: 'Term Commencement', date: 'August 01, 2026', icon: UserCheck },
                        ].map((item, idx) => (
                            <div key={idx} className="bg-white/5 border border-white/10 p-8 rounded-[2rem] hover:bg-white/10 transition-colors">
                                <item.icon className="text-primary-400 mb-6" size={32} />
                                <h4 className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-2">{item.event}</h4>
                                <div className="text-2xl font-bold">{item.date}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

// Local import for missing icon in case
const BookOpen = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
);

export default Admissions;
