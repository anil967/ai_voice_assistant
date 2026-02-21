import React, { useState } from 'react';
import { Settings, Shield, Globe, User, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { updateProfile, updatePassword } from '../../api';

const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [name, setName] = useState(() => {
        try { return JSON.parse(localStorage.getItem('user') || '{}').name || ''; } catch { return ''; }
    });
    const [email, setEmail] = useState(() => {
        try { return JSON.parse(localStorage.getItem('user') || '{}').email || ''; } catch { return ''; }
    });
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const apiBase = import.meta.env.VITE_API_URL || (window.location.port === '5173' ? 'http://localhost:5000' : window.location.origin);
    const webhookUrl = `${apiBase.replace(/\/$/, '')}/api/webhook/vapi`;

    const handleProfileSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const token = localStorage.getItem('token');
            await updateProfile({ name, email }, token);
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            localStorage.setItem('user', JSON.stringify({ ...user, name, email }));
            toast.success('Profile updated!');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordSave = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }
        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        setIsSaving(true);
        try {
            const token = localStorage.getItem('token');
            await updatePassword({ currentPassword, newPassword }, token);
            toast.success('Password updated!');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to update password');
        } finally {
            setIsSaving(false);
        }
    };

    const copyWebhook = () => {
        navigator.clipboard.writeText(webhookUrl);
        toast.success('Webhook URL copied!');
    };

    const tabs = [
        { id: 'profile', name: 'Profile', icon: User },
        { id: 'security', name: 'Password', icon: Lock },
        { id: 'api', name: 'API Config', icon: Globe },
    ];

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900">Settings</h1>
                <p className="text-gray-500">Manage your admin profile and security.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1">
                    <div className="card overflow-hidden">
                        {tabs.map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center space-x-3 px-6 py-4 text-sm font-bold border-b border-gray-50 last:border-0 transition-colors ${activeTab === item.id ? 'bg-primary-50 text-primary-600' : 'text-gray-500 hover:bg-gray-50'}`}
                            >
                                <item.icon size={18} />
                                <span>{item.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-3 space-y-8">
                    {activeTab === 'profile' && (
                        <div className="card p-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <User size={22} className="text-primary-600" />
                                Admin Profile
                            </h3>
                            <form onSubmit={handleProfileSave} className="space-y-6 max-w-md">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Name</label>
                                    <input
                                        type="text"
                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
                                    <input
                                        type="email"
                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                                <button type="submit" disabled={isSaving} className="btn btn-primary">
                                    {isSaving ? 'Saving...' : 'Save Profile'}
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="card p-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Lock size={22} className="text-primary-600" />
                                Change Password
                            </h3>
                            <form onSubmit={handlePasswordSave} className="space-y-6 max-w-md">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Current Password</label>
                                    <input
                                        type="password"
                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">New Password</label>
                                    <input
                                        type="password"
                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        minLength={6}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Confirm New Password</label>
                                    <input
                                        type="password"
                                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        minLength={6}
                                        required
                                    />
                                </div>
                                <button type="submit" disabled={isSaving} className="btn btn-primary">
                                    {isSaving ? 'Updating...' : 'Update Password'}
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'api' && (
                        <div className="card p-8">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Globe size={22} className="text-primary-600" />
                                Webhook Configuration
                            </h3>
                            <p className="text-gray-500 text-sm mb-4">Set this URL in your Vapi Dashboard → Assistant → Server URL for dynamic prompt injection and call logging.</p>
                            <div className="flex">
                                <input
                                    type="text"
                                    className="flex-grow p-4 bg-gray-50 border border-gray-200 rounded-l-2xl outline-none focus:ring-2 focus:ring-primary-500"
                                    value={webhookUrl}
                                    readOnly
                                />
                                <button type="button" onClick={copyWebhook} className="px-6 bg-primary-600 text-white rounded-r-2xl text-xs font-bold uppercase hover:bg-primary-700">
                                    Copy
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
