import React, { useState, useEffect } from 'react';
import { Bot, RefreshCw, CheckCircle, Phone, Zap, AlertCircle, ExternalLink, Copy, FileText, Globe, Database } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { getAgentConfig, updateAgentConfig } from '../../api';

const apiBase = import.meta.env.VITE_API_URL || '';
const api = axios.create({ baseURL: apiBase ? `${apiBase.replace(/\/$/, '')}/api` : '/api' });
const authHeader = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

const AgentControl = () => {
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSync, setLastSync] = useState(null);
    const [assistant, setAssistant] = useState(null);
    const [phoneNumbers, setPhoneNumbers] = useState([]);
    const [loadingInfo, setLoadingInfo] = useState(true);
    const [firstMessage, setFirstMessage] = useState('');
    const [endCallMessage, setEndCallMessage] = useState('');
    const [systemPrompt, setSystemPrompt] = useState('');
    const [liveDataUrl, setLiveDataUrl] = useState('');
    const [ragEnabled, setRagEnabled] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [configLoaded, setConfigLoaded] = useState(false);

    const assistantId = import.meta.env.VITE_VAPI_ASSISTANT_ID;

    useEffect(() => {
        fetchVapiInfo();
        fetchAgentConfig();
    }, []);

    const fetchAgentConfig = async () => {
        try {
            const token = localStorage.getItem('token');
            const { data } = await getAgentConfig(token);
            setFirstMessage(data.firstMessage || "Hello! Welcome to BCET. I'm your AI admissions assistant. How can I help you today?");
            setEndCallMessage(data.endCallMessage || '');
            setSystemPrompt(data.systemPrompt || '');
            setLiveDataUrl(data.liveDataUrl || '');
            setRagEnabled(!!data.ragEnabled);
            setConfigLoaded(true);
        } catch (err) {
            toast.error('Failed to load agent config');
        }
    };

    const handleSaveConfig = async () => {
        setIsSaving(true);
        try {
            const token = localStorage.getItem('token');
            await updateAgentConfig({ firstMessage, endCallMessage: endCallMessage || undefined, systemPrompt, liveDataUrl: liveDataUrl || undefined, ragEnabled }, token);
            toast.success('First message & system prompt saved. Click Sync Now to push to Vapi.');
            await fetchAgentConfig();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to save');
        } finally {
            setIsSaving(false);
        }
    };

    const fetchVapiInfo = async () => {
        setLoadingInfo(true);
        try {
            const [aRes, pRes] = await Promise.all([
                api.get('/vapi/assistant', authHeader()),
                api.get('/vapi/phone-numbers', authHeader()),
            ]);
            setAssistant(aRes.data);
            setPhoneNumbers(pRes.data || []);
        } catch (err) {
            console.error('Failed to load Vapi info:', err.message);
        } finally {
            setLoadingInfo(false);
        }
    };

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            const { data } = await api.post('/vapi/sync', {}, authHeader());
            toast.success(`✅ ${data.message}`);
            setLastSync(new Date().toLocaleTimeString());
            await fetchVapiInfo();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Sync failed');
        } finally {
            setIsSyncing(false);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied!');
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900">AI Agent Control</h1>
                <p className="text-gray-500 mt-1">Configure first speak & system prompt (Vapi-style). Voice calls use your real college data.</p>
            </div>

            {/* ── Model: First Message & System Prompt (Vapi-style) ───────── */}
            <div className="card p-8">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
                    <FileText size={22} className="text-primary-600" />
                    Model · First Speak & System Prompt
                </h2>
                <div className="space-y-6">
                    {systemPrompt.toLowerCase().includes('skyline') && (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
                            <strong>Tip:</strong> Your system prompt still mentions &quot;Skyline&quot;. Update it to your college name (e.g. BCET / Balasore College of Engineering and Technology) and click Save, then Sync Now so the AI and Vapi match.
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">First Message (What AI says first)</label>
                        <input
                            type="text"
                            value={firstMessage}
                            onChange={(e) => setFirstMessage(e.target.value)}
                            placeholder="Hello! Welcome to BCET. I'm your AI admissions assistant..."
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">The greeting when a voice call starts. Used in Vapi and webhook.</p>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">End Call Message (what AI says when ending the call)</label>
                        <textarea
                            value={endCallMessage}
                            onChange={(e) => setEndCallMessage(e.target.value)}
                            placeholder="Thank you for contacting BCET. If you have any questions, feel free to call us anytime. Have a great day!"
                            rows={2}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                        />
                        <p className="text-xs text-gray-500 mt-1">Spoken at the end of every call before hanging up.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                <Globe size={16} /> Live Data URL (notices/events)
                            </label>
                            <input
                                type="url"
                                value={liveDataUrl}
                                onChange={(e) => setLiveDataUrl(e.target.value)}
                                placeholder="https://bcetodisha.ac.in/notice.php"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                            />
                            <p className="text-xs text-gray-500 mt-1">Fetches recent notices from your college website and injects into the AI prompt.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                <Database size={16} /> RAG (document knowledge)
                            </label>
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={ragEnabled}
                                    onChange={(e) => setRagEnabled(e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                />
                                <span className="text-sm font-medium">Enable RAG — use documents from Knowledge page in AI responses</span>
                            </label>
                            <p className="text-xs text-gray-500 mt-1">Add documents in Admin → Knowledge. Requires OPENAI_API_KEY for embeddings.</p>
                        </div>
                    </div>
                    <button
                        onClick={handleSaveConfig}
                        disabled={isSaving || !configLoaded}
                        className="btn btn-primary px-6 py-3 font-bold disabled:opacity-60"
                    >
                        {isSaving ? 'Saving...' : 'Save & Use in Voice Calls'}
                    </button>
                </div>
            </div>

            {/* ── Sync Panel ─────────────────────────────────────────────── */}
            <div className="card p-8 border-2 border-primary-100 bg-primary-50/30">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start space-x-4">
                        <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center text-white flex-shrink-0">
                            <Zap size={28} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Sync Database → Vapi</h2>
                            <p className="text-gray-500 text-sm mt-1 max-w-md">
                                Push the latest college info (courses, fees, facilities) from your database into the Vapi AI assistant's system prompt. The AI phone call will immediately know and answer based on your real data.
                            </p>
                            {lastSync && (
                                <p className="text-xs text-green-600 font-bold mt-2 flex items-center gap-1">
                                    <CheckCircle size={12} /> Last synced at {lastSync}
                                </p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={handleSync}
                        disabled={isSyncing}
                        className="btn btn-primary px-8 py-4 text-base font-bold flex items-center gap-3 flex-shrink-0 disabled:opacity-60"
                    >
                        <RefreshCw size={20} className={isSyncing ? 'animate-spin' : ''} />
                        {isSyncing ? 'Syncing...' : 'Sync Now'}
                    </button>
                </div>
            </div>

            {/* ── Assistant Info ──────────────────────────────────────────── */}
            <div className="card p-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Bot size={22} className="text-primary-600" />
                        Vapi Assistant
                    </h2>
                    <a
                        href={`https://dashboard.vapi.ai/assistants/${assistantId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary-600 font-bold flex items-center gap-1 hover:underline"
                    >
                        Open in Vapi <ExternalLink size={14} />
                    </a>
                </div>

                {loadingInfo ? (
                    <div className="animate-pulse space-y-3">
                        {[1, 2, 3].map(i => <div key={i} className="h-5 bg-gray-100 rounded-xl" />)}
                    </div>
                ) : assistant ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            { label: 'Assistant Name', value: assistant.name },
                            { label: 'AI Model', value: assistant.model || 'gpt-3.5-turbo' },
                            { label: 'Voice', value: assistant.voice || 'jennifer (PlayHT)' },
                            { label: 'Last Updated', value: new Date(assistant.updatedAt).toLocaleString() },
                        ].map(item => (
                            <div key={item.label} className="bg-gray-50 rounded-2xl p-4">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{item.label}</p>
                                <p className="font-semibold text-gray-900">{item.value}</p>
                            </div>
                        ))}
                        <div className="md:col-span-2 bg-gray-50 rounded-2xl p-4">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">First Message Preview</p>
                            <p className="text-gray-700 italic">"{assistant.firstMessage}"</p>
                        </div>
                        <div className="md:col-span-2 bg-primary-50 rounded-2xl p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Assistant ID</p>
                                <code className="text-sm font-mono text-primary-700">{assistantId}</code>
                            </div>
                            <button onClick={() => copyToClipboard(assistantId)} className="p-2 hover:bg-primary-100 rounded-xl">
                                <Copy size={16} className="text-primary-600" />
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-3 text-orange-600 bg-orange-50 p-4 rounded-2xl">
                        <AlertCircle size={20} />
                        <p className="text-sm font-medium">Could not load assistant info. Check your VAPI_PRIVATE_KEY in backend .env</p>
                    </div>
                )}
            </div>

            {/* ── Phone Numbers ───────────────────────────────────────────── */}
            <div className="card p-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Phone size={22} className="text-primary-600" />
                        Phone Numbers
                    </h2>
                    <a
                        href="https://dashboard.vapi.ai/phone-numbers"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline px-4 py-2 text-sm font-bold flex items-center gap-2"
                    >
                        Buy Number <ExternalLink size={14} />
                    </a>
                </div>

                {phoneNumbers.length === 0 ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 space-y-4">
                        <div className="flex gap-3">
                            <AlertCircle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="font-bold text-amber-800">No phone number linked yet</p>
                                <p className="text-sm text-amber-700 mt-1">Follow these steps to set up real phone calls:</p>
                            </div>
                        </div>
                        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 ml-8">
                            <li>Go to <a href="https://dashboard.vapi.ai/phone-numbers" target="_blank" rel="noopener noreferrer" className="text-primary-600 font-bold underline">vapi.ai → Phone Numbers</a></li>
                            <li>Click <strong>Buy Phone Number</strong> (≈ $2–3/month)</li>
                            <li>Select your country and a number</li>
                            <li>Under <strong>Assistant</strong>, select your assistant: <code className="bg-gray-100 px-1 rounded text-xs">{assistantId?.slice(0, 16)}...</code></li>
                            <li>Click <strong>Save</strong> — your phone is now connected!</li>
                        </ol>
                        <div className="bg-white rounded-xl p-4 border border-amber-200">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Then click Sync Now above</p>
                            <p className="text-sm text-gray-600">After buying the number, press <strong>Sync Now</strong> to push your college data into the AI. Every call to that number will answer using your real database. 🎯</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {phoneNumbers.map(num => (
                            <div key={num.id} className="flex items-center justify-between bg-green-50 border border-green-200 rounded-2xl p-5">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                                        <Phone size={18} className="text-white" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 text-lg">{num.number}</p>
                                        <p className="text-sm text-gray-500">{num.name || 'Vapi Phone Number'} · {num.provider}</p>
                                    </div>
                                </div>
                                <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full uppercase tracking-widest">Active</span>
                            </div>
                        ))}
                        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex gap-3">
                            <CheckCircle size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-blue-700">
                                <strong>You're all set!</strong> Calls to the above number are handled by your Vapi AI assistant.
                                Press <strong>Sync Now</strong> after updating college info to keep the AI current.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AgentControl;
