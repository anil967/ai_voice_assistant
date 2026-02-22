import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, RefreshCw, Phone, Globe, PhoneIncoming, MessageSquare, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { getCallHistory, getCollegeInfo, getCallDetail } from '../../api';

const formatDateTime = (dateStr) =>
    new Date(dateStr).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

const formatDuration = (seconds) => {
    if (seconds == null) return '-';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
};

const formatCost = (cost) => {
    if (cost == null || cost === '') return '—';
    const n = parseFloat(cost);
    if (isNaN(n)) return '—';
    return `$${n.toFixed(2)}`;
};

const CallHistory = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [calls, setCalls] = useState([]);
    const [stats, setStats] = useState({ all: 0, transferred: 0, successful: 0, failed: 0 });
    const [assistantPhone, setAssistantPhone] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [callTypeFilter, setCallTypeFilter] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [assistantName, setAssistantName] = useState('BCET AI Assistant');
    const [selectedCall, setSelectedCall] = useState(null);
    const [callDetail, setCallDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();
            if (callTypeFilter) params.set('callType', callTypeFilter);
            if (dateFrom) params.set('from', new Date(dateFrom).toISOString());
            const { data } = await getCallHistory(token, params.toString());
            const h = data.history ?? data;
            const arr = Array.isArray(h) ? h : [];
            setCalls(arr);
            setStats(
                data.stats ?? {
                    all: arr.length,
                    transferred: arr.filter((c) => c.outcome === 'escalated').length,
                    successful: arr.filter((c) => c.outcome === 'answered').length,
                    failed: arr.filter((c) => c.outcome === 'abandoned').length,
                }
            );
            setAssistantPhone(data.assistantPhone || '');
            const collegeRes = await getCollegeInfo();
            if (collegeRes?.data?.name) setAssistantName(`${collegeRes.data.name} AI Assistant`);
        } catch (err) {
            toast.error('Failed to load call history');
            setCalls([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [callTypeFilter, dateFrom]);

    const filteredCalls = calls.filter(
        (call) =>
            !searchTerm ||
            call.callerNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            call.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            call.callId?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getCallType = (call) => {
        if (call.callType) return call.callType;
        const num = call.callerNumber || '';
        return num && /^\+?[\d\s()-]{10,}$/.test(num.replace(/\s/g, '')) ? 'Inbound' : 'Web';
    };

    const openDetail = async (call) => {
        setSelectedCall(call);
        setDetailLoading(true);
        setCallDetail(null);
        try {
            const token = localStorage.getItem('token');
            const { data } = await getCallDetail(token, call.callId);
            setCallDetail(data);
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to load call transcript');
        } finally {
            setDetailLoading(false);
        }
    };

    const closeDetail = () => {
        setSelectedCall(null);
        setCallDetail(null);
        setDetailLoading(false);
    };

    if (isLoading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading History...</div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Call Logs</h1>
                    <p className="text-sm text-gray-500">View and analyze past interactions with the AI agent.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => fetchData()}
                        className="btn btn-outline flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50"
                    >
                        <RefreshCw size={18} />
                        Refresh
                    </button>
                    <button className="btn btn-outline flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-50">
                        <Download size={18} />
                        Export
                    </button>
                </div>
            </div>

            {/* Summary stats - like Vapi */}
            <div className="flex flex-wrap gap-4">
                <div className="px-5 py-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <span className="text-sm text-gray-500">All Calls</span>
                    <p className="text-xl font-bold text-gray-900">{stats.all}</p>
                </div>
                <div className="px-5 py-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <span className="text-sm text-gray-500">Transferred</span>
                    <p className="text-xl font-bold text-gray-900">{stats.transferred}</p>
                </div>
                <div className="px-5 py-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <span className="text-sm text-gray-500">Successful</span>
                    <p className="text-xl font-bold text-green-600">{stats.successful}</p>
                </div>
                <div className="px-5 py-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <span className="text-sm text-gray-500">Failed</span>
                    <p className="text-xl font-bold text-red-600">{stats.failed}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="card px-4 py-3 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
                <div className="relative flex-grow min-w-[200px] max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search by number, ID, or summary..."
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:bg-white focus:border-primary-500 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
                    />
                    <select
                        value={callTypeFilter}
                        onChange={(e) => setCallTypeFilter(e.target.value)}
                        className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white"
                    >
                        <option value="">Call Type</option>
                        <option value="Inbound">Inbound</option>
                        <option value="Web">Web</option>
                    </select>
                    <button className="flex items-center gap-2 px-4 py-2.5 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-medium">
                        <Filter size={16} />
                        Filter
                    </button>
                </div>
            </div>

            {/* Table - Vapi style */}
            <div className="card overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                                <th className="px-6 py-4">Assistant</th>
                                <th className="px-6 py-4">Assistant Phone</th>
                                <th className="px-6 py-4">Customer Phone</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Ended Reason</th>
                                <th className="px-6 py-4">Success</th>
                                <th className="px-6 py-4">Start Time</th>
                                <th className="px-6 py-4">Duration</th>
                                <th className="px-6 py-4">Cost</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredCalls.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="px-6 py-16 text-center">
                                        <div className="space-y-2">
                                            <p className="text-gray-500 font-medium">No call records yet</p>
                                            <p className="text-sm text-gray-400 max-w-md mx-auto">
                                                Use &quot;Talk to AI&quot; on the homepage or make a Vapi phone call to generate call records.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredCalls.map((call) => {
                                    const type = getCallType(call);
                                    const showPhone = type === 'Inbound';
                                    const isSelected = selectedCall && selectedCall.callId === call.callId;
                                    return (
                                        <tr
                                            key={call._id}
                                            className={`hover:bg-gray-50/70 transition-colors cursor-pointer ${isSelected ? 'bg-primary-50/60' : ''}`}
                                            onClick={() => openDetail(call)}
                                        >
                                            <td className="px-6 py-4">
                                                <span className="font-medium text-gray-900 truncate block max-w-[180px]" title={assistantName}>
                                                    {assistantName}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">
                                                {showPhone && assistantPhone ? assistantPhone : '—'}
                                            </td>
                                            <td className="px-6 py-4 text-gray-700">
                                                {showPhone ? (call.callerNumber || '—') : '—'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                                                        type === 'Inbound' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-600'
                                                    }`}
                                                >
                                                    {type === 'Inbound' ? <PhoneIncoming size={12} /> : <Globe size={12} />}
                                                    {type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-600">
                                                {call.endedReason || 'Customer Ended Call'}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">N/A</td>
                                            <td className="px-6 py-4 text-gray-700 whitespace-nowrap">
                                                {formatDateTime(call.startTime)}
                                            </td>
                                            <td className="px-6 py-4 text-gray-700 font-medium">
                                                {formatDuration(call.duration)}
                                            </td>
                                            <td className="px-6 py-4 text-gray-700 font-medium">
                                                {formatCost(call.cost)}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail panel for selected call with transcript */}
            {selectedCall && (
                <div className="mt-6 card border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <MessageSquare size={18} className="text-primary-600" />
                                Call Transcript
                            </h2>
                            <p className="text-xs text-gray-500">
                                Call ID: <span className="font-mono">{selectedCall.callId}</span>
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={closeDetail}
                            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700"
                        >
                            <X size={16} />
                        </button>
                    </div>
                    <div className="p-6">
                        {detailLoading && (
                            <div className="text-gray-400 text-sm">Loading transcript...</div>
                        )}
                        {!detailLoading && !callDetail && (
                            <div className="text-gray-400 text-sm">No transcript available for this call.</div>
                        )}
                        {!detailLoading && callDetail && (
                            <div className="space-y-4 max-h-[420px] overflow-y-auto">
                                {Array.isArray(callDetail.messages) && callDetail.messages.length > 0 ? (
                                    callDetail.messages.map((m, idx) => {
                                        const role = (m.role || '').toLowerCase();
                                        const isAssistant = role.includes('assistant');
                                        const isUser = role.includes('user') || role.includes('caller') || role.includes('customer');
                                        const label = isAssistant ? 'Assistant' : isUser ? 'User' : role || 'Message';
                                        const text = m.text || '';
                                        if (!text) return null;
                                        return (
                                            <div
                                                key={idx}
                                                className={`flex ${isAssistant ? 'justify-start' : 'justify-end'}`}
                                            >
                                                <div
                                                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm ${
                                                        isAssistant
                                                            ? 'bg-blue-50 text-gray-900 border border-blue-100'
                                                            : 'bg-emerald-50 text-gray-900 border border-emerald-100'
                                                    }`}
                                                >
                                                    <p className="text-[11px] font-semibold text-gray-500 uppercase mb-1">
                                                        {label}
                                                    </p>
                                                    <p className="text-gray-900 whitespace-pre-wrap">{text}</p>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-gray-400 text-sm">No transcript messages found.</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CallHistory;
