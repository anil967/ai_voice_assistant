import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, GraduationCap, Building2, MapPin, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import { getCollegeInfo, updateCollegeInfo } from '../../api';

const CollegeInfoAdmin = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [info, setInfo] = useState({
        name: '',
        tagline: '',
        about: '',
        founder: '',
        chairman: '',
        director: '',
        courses: [],
        contact: { email: '', phone: '', address: '' }
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await getCollegeInfo();
                if (data) setInfo(data);
                setIsLoading(false);
            } catch (err) {
                toast.error('Failed to load college info');
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSave = async () => {
        try {
            await updateCollegeInfo(info, localStorage.getItem('token'));
            toast.success('College Information Updated!');
        } catch (err) {
            toast.error('Failed to update information');
        }
    };

    const addCourse = () => {
        setInfo({
            ...info,
            courses: [...info.courses, { name: '', duration: '', fees: '', eligibility: '' }]
        });
    };

    const removeCourse = (index) => {
        const newCourses = info.courses.filter((_, i) => i !== index);
        setInfo({ ...info, courses: newCourses });
    };

    const updateCourse = (index, field, value) => {
        const newCourses = [...info.courses];
        newCourses[index][field] = value;
        setInfo({ ...info, courses: newCourses });
    };

    if (isLoading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading Configuration...</div>;

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">College Management</h1>
                    <p className="text-gray-500">Update details that the AI agent uses for enquiries.</p>
                </div>
                <button
                    onClick={handleSave}
                    className="btn btn-primary space-x-2 px-8"
                >
                    <Save size={20} />
                    <span>Save Changes</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Basic Info */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="card p-8 space-y-6">
                        <div className="flex items-center space-x-3 text-primary-600 mb-2">
                            <Building2 size={24} />
                            <h3 className="text-xl font-bold">General Information</h3>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">College Name</label>
                                <input
                                    type="text"
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none"
                                    value={info.name}
                                    onChange={(e) => setInfo({ ...info, name: e.target.value })}
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Tagline</label>
                                <input
                                    type="text"
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none"
                                    value={info.tagline}
                                    onChange={(e) => setInfo({ ...info, tagline: e.target.value })}
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">About College</label>
                                <textarea
                                    rows="4"
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none"
                                    value={info.about}
                                    onChange={(e) => setInfo({ ...info, about: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Founder</label>
                                <input
                                    type="text"
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none"
                                    placeholder="e.g. Dr. Manmath Kumar Biswal"
                                    value={info.founder || ''}
                                    onChange={(e) => setInfo({ ...info, founder: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Chairman</label>
                                <input
                                    type="text"
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none"
                                    placeholder="e.g. Dr. Manmath Kumar Biswal (Founder-Chairman)"
                                    value={info.chairman || ''}
                                    onChange={(e) => setInfo({ ...info, chairman: e.target.value })}
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Director</label>
                                <input
                                    type="text"
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none"
                                    placeholder="e.g. Prof. (Dr.) Ratikanta Sahoo"
                                    value={info.director || ''}
                                    onChange={(e) => setInfo({ ...info, director: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="card p-8">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center space-x-3 text-primary-600">
                                <GraduationCap size={24} />
                                <h3 className="text-xl font-bold">Courses & Fees</h3>
                            </div>
                            <button
                                onClick={addCourse}
                                className="flex items-center space-x-1 text-primary-600 font-bold hover:underline"
                            >
                                <Plus size={18} />
                                <span>Add Course</span>
                            </button>
                        </div>

                        <div className="space-y-4">
                            {info.courses.map((course, idx) => (
                                <div key={idx} className="p-6 bg-gray-50 rounded-2xl border border-gray-100 relative group transition-all hover:border-primary-200">
                                    <button
                                        onClick={() => removeCourse(idx)}
                                        className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="col-span-2 md:col-span-1">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Course Name</label>
                                            <input
                                                type="text"
                                                className="w-full mt-1 p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
                                                value={course.name}
                                                onChange={(e) => updateCourse(idx, 'name', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Duration</label>
                                            <input
                                                type="text"
                                                className="w-full mt-1 p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
                                                value={course.duration}
                                                onChange={(e) => updateCourse(idx, 'duration', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Fees</label>
                                            <input
                                                type="text"
                                                className="w-full mt-1 p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
                                                value={course.fees}
                                                onChange={(e) => updateCourse(idx, 'fees', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-span-2 md:col-span-1">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Eligibility</label>
                                            <input
                                                type="text"
                                                className="w-full mt-1 p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
                                                value={course.eligibility}
                                                onChange={(e) => updateCourse(idx, 'eligibility', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Contact Sidebar */}
                <div className="space-y-8">
                    <div className="card p-8 space-y-6">
                        <div className="flex items-center space-x-3 text-primary-600 mb-2">
                            <MapPin size={24} />
                            <h3 className="text-xl font-bold">Contact Details</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Website (used in post-call SMS)</label>
                                <input
                                    type="text"
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500"
                                    placeholder="bcetodisha.ac.in"
                                    value={info.website || ''}
                                    onChange={(e) => setInfo({ ...info, website: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500"
                                    value={info.contact.email}
                                    onChange={(e) => setInfo({ ...info, contact: { ...info.contact, email: e.target.value } })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Phone</label>
                                <input
                                    type="text"
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500"
                                    value={info.contact.phone}
                                    onChange={(e) => setInfo({ ...info, contact: { ...info.contact, phone: e.target.value } })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Address</label>
                                <textarea
                                    rows="3"
                                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500"
                                    value={info.contact.address}
                                    onChange={(e) => setInfo({ ...info, contact: { ...info.contact, address: e.target.value } })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="card p-8 bg-primary-600 text-white">
                        <Globe size={40} className="mb-4 text-primary-200" />
                        <h4 className="font-bold text-lg mb-2">AI Knowledge Sync</h4>
                        <p className="text-sm text-primary-100 leading-relaxed">
                            Changes saved here are instantly injected into the AI agent's knowledge base during calls.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CollegeInfoAdmin;
