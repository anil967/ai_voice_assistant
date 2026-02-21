import React from 'react';
import { ArrowRight, Zap, GraduationCap, Building2, Headphones, Users } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description }) => (
    <div className="card p-8 flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600 mb-6">
            <Icon size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
);

const Hero = ({ onTalkToAI }) => (
    <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-0 -left-20 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute top-20 -right-20 w-80 h-80 bg-accent-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-700"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="text-center">
                <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-primary-50 border border-primary-100 text-primary-600 font-semibold text-sm mb-8 animate-fade-in">
                    <Zap size={16} fill="currentColor" />
                    <span>Next-Gen Admission Experience</span>
                </div>

                <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-tight mb-8">
                    Smart Admissions Powered by <br />
                    <span className="bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 bg-clip-text text-transparent">
                        AI Voice Agents
                    </span>
                </h1>

                <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
                    Skip the waiting time. Talk directly to our AI assistant to get instant information about courses, fees, and hostel facilities. Fast, accurate, and available 24/7.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                    <button
                        onClick={onTalkToAI}
                        className="btn btn-primary text-lg px-10 py-5 group"
                    >
                        <span>Start Voice Enquiry</span>
                        <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <a href="#features" className="btn btn-outline text-lg px-10 py-5">
                        Know More
                    </a>
                </div>

                <div className="mt-20 pt-10 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-8">
                    {[
                        { label: 'Courses', value: '15+' },
                        { label: 'Students', value: '5000+' },
                        { label: 'Placement', value: '100%' },
                        { label: 'Experience', value: '25 Yrs' },
                    ].map((stat) => (
                        <div key={stat.label}>
                            <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                            <div className="text-gray-500 font-medium">{stat.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </section>
);

const Home = ({ onTalkToAI }) => {
    return (
        <div className="animate-fade-in">
            <Hero onTalkToAI={onTalkToAI} />

            <section id="features" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-16">
                        Why Choose BCET?
                    </h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={GraduationCap}
                            title="Advanced Curriculum"
                            description="Industry-aligned courses designed to make you future-ready with hands-on projects."
                        />
                        <FeatureCard
                            icon={Building2}
                            title="Modern Campus"
                            description="World-class infrastructure including hi-tech labs, sports complex, and lush green campus."
                        />
                        <FeatureCard
                            icon={Headphones}
                            title="AI-First Support"
                            description="Get all your queries resolved instantly with our specialized AI Voice Admission Agents."
                        />
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
