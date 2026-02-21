import React, { useState, useEffect } from 'react';
import { Mail, MessageSquare, Plus, Save, BellRing, Settings2, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getTemplates, updateTemplate, createTemplate, toggleTemplate } from '../../api';

const Automation = () => {
    const [templates, setTemplates] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [editSubject, setEditSubject] = useState('');
    const [editBody, setEditBody] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                const { data } = await getTemplates(token);
                setTemplates(data || []);
                if ((data || []).length > 0 && !selectedTemplate) {
                    setSelectedTemplate(data[0]);
                    setEditSubject(data[0].subject || '');
                    setEditBody(data[0].body || '');
                }
            } catch (err) {
                toast.error('Failed to load templates');
                setTemplates([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedTemplate) {
            setEditSubject(selectedTemplate.subject || '');
            setEditBody(selectedTemplate.body || '');
        }
    }, [selectedTemplate]);

    const handleSave = async () => {
        if (!selectedTemplate) return;
        try {
            const token = localStorage.getItem('token');
            await updateTemplate(selectedTemplate._id, { subject: editSubject, body: editBody }, token);
            setTemplates(prev => prev.map(t => t._id === selectedTemplate._id ? { ...t, subject: editSubject, body: editBody } : t));
            setSelectedTemplate({ ...selectedTemplate, subject: editSubject, body: editBody });
            toast.success('Template saved!');
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to save');
        }
    };

    const handleToggle = async (tpl) => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await toggleTemplate(tpl._id, token);
            setTemplates(prev => prev.map(t => t._id === tpl._id ? data : t));
            if (selectedTemplate?._id === tpl._id) setSelectedTemplate(data);
            toast.success(data.enabled ? 'Template enabled' : 'Template disabled');
        } catch (err) {
            toast.error('Failed to toggle');
        }
    };

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">Post-Call Automation</h1>
                    <p className="text-gray-500">Set up automatic follow-up messages after every AI call.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={!selectedTemplate}
                    className="btn btn-primary space-x-2 px-8 disabled:opacity-50"
                >
                    <Save size={20} />
                    <span>Save Template</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold text-gray-900">Configured Workflows</h3>
                    </div>

                    {isLoading ? (
                        <div className="text-gray-400 py-8">Loading templates...</div>
                    ) : templates.length === 0 ? (
                        <div className="card p-8 text-center text-gray-500">No templates yet. Run <code className="bg-gray-100 px-2 py-1 rounded">node backend/seed.js</code> to create default templates.</div>
                    ) : (
                        templates.map(tpl => (
                            <div key={tpl._id} className={`card p-6 flex flex-col md:flex-row md:items-center justify-between group hover:border-primary-200 transition-all cursor-pointer ${selectedTemplate?._id === tpl._id ? 'border-primary-300 bg-primary-50/30' : ''}`} onClick={() => setSelectedTemplate(tpl)}>
                                <div className="flex items-center space-x-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tpl.channel === 'email' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                        {tpl.channel === 'email' ? <Mail size={24} /> : <MessageSquare size={24} />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{tpl.name}</h4>
                                        <p className="text-sm text-gray-400">{tpl.channel} • {tpl.enabled ? 'Active' : 'Disabled'}</p>
                                    </div>
                                </div>
                                <div className="mt-4 md:mt-0 flex items-center space-x-6">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${tpl.enabled ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                        {tpl.enabled ? 'Active' : 'Disabled'}
                                    </span>
                                    <button type="button" onClick={(e) => { e.stopPropagation(); handleToggle(tpl); }} className="text-gray-400 hover:text-primary-600 font-bold text-sm">
                                        {tpl.enabled ? 'Disable' : 'Enable'}
                                    </button>
                                </div>
                            </div>
                        ))
                    )}

                    <div className="card p-8 space-y-6 mt-8">
                        <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                            <Settings2 className="text-primary-600" />
                            <span>Template Editor</span>
                        </h3>
                        <div className="space-y-4">
                            {selectedTemplate ? (
                                <>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Subject Line</label>
                                        <input
                                            type="text"
                                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500"
                                            value={editSubject}
                                            onChange={(e) => setEditSubject(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-2">Message Body</label>
                                        <textarea
                                            rows="6"
                                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary-500"
                                            value={editBody}
                                            onChange={(e) => setEditBody(e.target.value)}
                                        />
                                        <p className="mt-2 text-xs text-gray-400 px-1">
                                            Use <span className="text-primary-600 font-bold">{'{{ name }}'}</span>, <span className="text-primary-600 font-bold">{'{{ course }}'}</span> for dynamic values.
                                        </p>
                                    </div>
                                    <button type="button" onClick={handleSave} className="btn btn-primary">
                                        Save Changes
                                    </button>
                                </>
                            ) : (
                                <p className="text-gray-500">Select a template to edit.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="card p-8 bg-primary-900 text-white">
                        <BellRing size={40} className="mb-4 text-accent-400" />
                        <h4 className="font-bold text-lg mb-2">Automated Triggers</h4>
                        <p className="text-sm text-gray-400 leading-relaxed mb-6">
                            Follow-ups are sent as soon as the AI call status changes to <span className="text-white font-bold">Ended</span>.
                        </p>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl border border-white/10">
                                <CheckCircle className="text-green-400" size={18} />
                                <span className="text-sm">Email Delivery Integration</span>
                            </div>
                            <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-xl border border-white/10 opacity-50">
                                <XCircle className="text-red-400" size={18} />
                                <span className="text-sm">WhatsApp API (Disconnected)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Automation;
