import React from 'react';
import { Building2, Laptop, Library, Coffee, ShieldCheck, Wifi } from 'lucide-react';

const Facilities = () => {
    const facilities = [
        { name: 'Digital Classrooms', icon: Building2, desc: 'Digital classes in all classrooms with modern teaching aids and interactive learning.' },
        { name: 'State-of-the-art Labs', icon: Laptop, desc: 'Hi-tech laboratories among the best in the region for engineering practice.' },
        { name: 'Central Library', icon: Library, desc: 'Extensive collection of books and digital resources for students and faculty.' },
        { name: 'Dr. APJ Abdul Kalam Hostel', icon: ShieldCheck, desc: 'Wi-Fi enabled hostel with mess, 24/7 security. Separate accommodation for boys and girls.' },
        { name: 'Sports & Cultural Fest', icon: Coffee, desc: 'Annual Sports Meet and Charisma cultural program. Silver Jubilee celebrations.' },
        { name: 'Campus Connectivity', icon: Wifi, desc: 'NH-16, Sergarh, Balasore. Well connected. ISO 9001:2008 certified institution.' },
    ];

    return (
        <div className="animate-fade-in pb-24">
            <section className="py-24 px-4 text-center">
                <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-8 tracking-tight">BCET Campus Facilities</h1>
                <p className="text-xl text-gray-500 max-w-3xl mx-auto">State-of-the-art infrastructure at NH-16, Sergarh, Balasore. AICTE approved, BPUT affiliated.</p>
            </section>

            <section className="px-4">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {facilities.map(f => (
                        <div key={f.name} className="card p-10 group hover:-translate-y-2 transition-all">
                            <div className="w-16 h-16 bg-gray-50 text-primary-600 rounded-2xl flex items-center justify-center mb-8 border border-gray-100 group-hover:bg-primary-600 group-hover:text-white group-hover:border-primary-600 transition-all">
                                <f.icon size={32} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">{f.name}</h3>
                            <p className="text-gray-500 leading-relaxed font-medium">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Hostel Highlight */}
            <section className="py-24 px-4">
                <div className="max-w-7xl mx-auto grid md:grid-cols-5 gap-12 bg-gray-900 rounded-[3rem] overflow-hidden">
                    <div className="md:col-span-2 relative min-h-[400px]">
                        <div className="absolute inset-0 bg-primary-600 opacity-20"></div>
                        <div className="w-full h-full flex items-center justify-center text-white text-3xl font-black">
                            HOSTEL PHOTO
                        </div>
                    </div>
                    <div className="md:col-span-3 p-12 md:p-20 flex flex-col justify-center text-white">
                        <div className="uppercase tracking-widest text-primary-400 font-black text-sm mb-4">Residential Life</div>
                        <h2 className="text-3xl md:text-5xl font-bold mb-8">A Second Home</h2>
                        <p className="text-gray-400 text-lg leading-relaxed mb-10">
                            Dr. APJ Abdul Kalam Hall of Residence offers secure accommodation with Wi-Fi, mess facilities, and 24/7 assistance. Contact (06782) 236045 for hostel fees.
                        </p>
                        <div className="grid grid-cols-2 gap-8 border-t border-gray-800 pt-10">
                            <div>
                                <div className="text-2xl font-bold">1200+</div>
                                <div className="text-sm text-gray-500 font-bold uppercase tracking-wider">Rooms</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold">24/7</div>
                                <div className="text-sm text-gray-500 font-bold uppercase tracking-wider">Assistance</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Facilities;
