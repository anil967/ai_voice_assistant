import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, Linkedin, GraduationCap } from 'lucide-react';

const Footer = () => {
    const navLinks = [
        { label: 'Home', to: '/' },
        { label: 'About Us', to: '/about' },
        { label: 'Courses', to: '/courses' },
        { label: 'Facilities', to: '/facilities' },
        { label: 'Admissions', to: '/admissions' },
    ];

    return (
        <footer className="bg-gray-900 text-white pt-20 pb-8 mt-auto">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    {/* Brand */}
                    <div className="md:col-span-2 space-y-6">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center">
                                <GraduationCap size={26} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black">BCET</h3>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Balasore College of Engg. & Tech.</p>
                            </div>
                        </div>
                        <p className="text-gray-400 leading-relaxed max-w-sm">
                            25 years of excellence. AICTE approved, BPUT affiliated. NH-16, Sergarh, Balasore (756060).
                        </p>
                        <div className="flex space-x-4">
                            {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                                <a key={i} href="#" className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-gray-400 hover:bg-primary-600 hover:border-primary-600 hover:text-white transition-all">
                                    <Icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-6">
                        <h4 className="font-bold text-white uppercase tracking-widest text-xs">Quick Links</h4>
                        <ul className="space-y-3">
                            {navLinks.map(link => (
                                <li key={link.label}>
                                    <Link
                                        to={link.to}
                                        className="text-gray-400 hover:text-primary-400 transition-colors font-medium text-sm flex items-center space-x-2"
                                    >
                                        <span className="text-primary-600">›</span>
                                        <span>{link.label}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="space-y-6">
                        <h4 className="font-bold text-white uppercase tracking-widest text-xs">Contact Us</h4>
                        <ul className="space-y-4">
                            <li className="flex items-start space-x-3 text-sm text-gray-400">
                                <MapPin size={16} className="text-primary-400 mt-0.5 shrink-0" />
                                <span>NH-16, Sergarh, Balasore (756060), Odisha</span>
                            </li>
                            <li className="flex items-center space-x-3 text-sm text-gray-400">
                                <Phone size={16} className="text-primary-400 shrink-0" />
                                <span>(06782) 236045, 9777938474</span>
                            </li>
                            <li className="flex items-center space-x-3 text-sm text-gray-400">
                                <Mail size={16} className="text-primary-400 shrink-0" />
                                <span>principal@bcetodisha.ac.in</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                    <p className="text-gray-500 text-sm">© 2026 BCET - Balasore College of Engineering & Technology. All rights reserved.</p>
                    <div className="flex space-x-6 text-xs text-gray-500">
                        <a href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</a>
                        <a href="#" className="hover:text-gray-300 transition-colors">Terms of Service</a>
                        <Link to="/login" className="hover:text-gray-300 transition-colors">Login</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
