import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    PhoneCall,
    CheckCircle2,
    Clock,
    TrendingUp,
    BarChart2
} from 'lucide-react';
import { getCallHistory, getAnalytics } from '../../api';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Simple inline bar chart (no external dependency)
const MiniBarChart = ({ data }) => {
    const max = Math.max(...data.map(d => d.calls), 1);
    return (
        <div className="flex items-end space-x-2 h-32 w-full">
            {data.map((d, i) => (
                <div key={d.name} className="flex flex-col items-center flex-1 space-y-1">
                    <div
                        className="w-full rounded-t-lg transition-all"
                        style={{
                            height: `${(d.calls / max) * 100}%`,
                            background: i === 4 ? '#4f46e5' : '#e2e8f0'
                        }}
                    />
                    <span className="text-xs text-gray-400 font-medium">{d.name}</span>
                </div>
            ))}
        </div>
    );
};

// Simple inline sparkline (no external dependency)
const MiniLineChart = ({ data }) => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const divisor = data.length <= 1 ? 1 : data.length - 1;
    const w = 500, h = 120, pad = 10;
    const points = data.map((v, i) => {
        const x = pad + (i / divisor) * (w - 2 * pad);
        const y = h - pad - ((v - min) / range) * (h - 2 * pad);
        return `${x},${y}`;
    }).join(' ');
    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-32">
            <polyline
                points={points}
                fill="none"
                stroke="#4f46e5"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {data.map((v, i) => {
                const x = pad + (i / divisor) * (w - 2 * pad);
                const y = h - pad - ((v - min) / range) * (h - 2 * pad);
                return <circle key={i} cx={x} cy={y} r="6" fill="#4f46e5" stroke="white" strokeWidth="2" />;
            })}
        </svg>
    );
};

const StatCard = ({ title, value, change, icon: Icon, color }) => (
    <div className="card p-6">
        <div className="flex justify-between items-start">
            <div>
                <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
                <span className={`text-xs font-bold mt-2 inline-block px-2 py-0.5 rounded-full ${change.startsWith('+') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                    {change}
                </span>
            </div>
            <div className={`p-3 rounded-2xl bg-opacity-10 ${color}`}>
                <Icon size={24} className={color.replace('bg-', 'text-')} />
            </div>
        </div>
    </div>
);

const DashboardHome = () => {
    const [calls, setCalls] = useState([]);
    const [analytics, setAnalytics] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            try {
                const [historyRes, analyticsRes] = await Promise.all([
                    getCallHistory(token),
                    getAnalytics(token)
                ]);
                const d = historyRes.data;
                const historyArr = Array.isArray(d) ? d : (d?.history ?? []);
                setCalls(historyArr);
                setAnalytics(analyticsRes.data || []);
            } catch (err) {
                setCalls([]);
                setAnalytics([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const totalCalls = calls.length;
    const answeredCalls = calls.filter(c => c.outcome === 'answered').length;
    const avgDuration = totalCalls > 0
        ? Math.round(calls.reduce((sum, c) => sum + (c.duration || 0), 0) / totalCalls)
        : 0;
    const successRate = totalCalls > 0 ? ((answeredCalls / totalCalls) * 100).toFixed(1) : 0;

    const sortedAnalytics = [...analytics].sort((a, b) => (a._id || '').localeCompare(b._id || ''));
    const last7 = sortedAnalytics.slice(-7);
    const weekData = last7.length > 0
        ? last7.map(a => ({ name: a._id ? new Date(a._id).toLocaleDateString('en', { weekday: 'short' }) : '-', calls: a.count || 0 }))
        : WEEKDAYS.map(name => ({ name, calls: 0 }));
    const qualityData = last7.length >= 7
        ? last7.map(a => a.avgDuration ? Math.min(5, 1 + (a.avgDuration / 60) * 0.5) : 4.5)
        : [4.5, 4.8, 4.2, 4.6, 4.9, 4.5, 4.7];

    const formatDuration = (sec) => {
        if (!sec) return '0m 0s';
        return `${Math.floor(sec / 60)}m ${sec % 60}s`;
    };

    const recentCalls = calls.slice(0, 5).map(c => ({
        id: c._id,
        caller: c.callerNumber || 'Web',
        type: c.enquiryType || 'General',
        duration: formatDuration(c.duration),
        status: c.outcome === 'answered' ? 'Resolved' : c.outcome || 'Complete',
        quality: c.aiResponseQuality ? c.aiResponseQuality.toFixed(1) : '-'
    }));

    if (isLoading) {
        return <div className="flex items-center justify-center h-64 text-gray-400">Loading dashboard...</div>;
    }

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">Good Morning, Admin 👋</h1>
                    <p className="text-gray-500">Here's what's happening with your AI agent today.</p>
                </div>
                <Link to="/admin/calls" className="btn bg-white border border-gray-200 text-gray-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-50">
                    View Call History
                </Link>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Calls" value={totalCalls.toLocaleString()} change={totalCalls > 0 ? 'Live' : 'No data yet'} icon={PhoneCall} color="bg-blue-600" />
                <StatCard title="Successful" value={answeredCalls.toLocaleString()} change={totalCalls > 0 ? `${((answeredCalls / totalCalls) * 100).toFixed(0)}%` : '-'} icon={CheckCircle2} color="bg-green-600" />
                <StatCard title="Avg. Duration" value={formatDuration(avgDuration)} change="per call" icon={Clock} color="bg-purple-600" />
                <StatCard title="Success Rate" value={`${successRate}%`} change="answered" icon={TrendingUp} color="bg-indigo-600" />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="card p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-900">Weekly Call Volume</h3>
                        <BarChart2 className="text-gray-300" />
                    </div>
                    <MiniBarChart data={weekData} />
                </div>
                <div className="card p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-900">Call Trends</h3>
                        <TrendingUp className="text-gray-300" />
                    </div>
                    <div className="mb-2 flex justify-between text-xs text-gray-400 font-medium">
                        {WEEKDAYS.map(d => <span key={d}>{d}</span>)}
                    </div>
                    <MiniLineChart data={qualityData.length >= 7 ? qualityData : [4.5, 4.8, 4.2, 4.6, 4.9, 4.5, 4.7]} />
                    <p className="text-xs text-gray-400 mt-2 text-center">Activity by day</p>
                </div>
            </div>

            {/* Recent Enquiries Table */}
            <div className="card overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-900">Recent Enquiries</h3>
                    <Link to="/admin/calls" className="text-primary-600 text-sm font-bold hover:underline">View All</Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                                <th className="px-6 py-4">Caller</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Duration</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Quality</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {recentCalls.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-400">No calls yet. Call logs will appear here after AI voice interactions.</td>
                                </tr>
                            ) : (
                                recentCalls.map((row) => (
                                    <tr key={row.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{row.caller}</td>
                                        <td className="px-6 py-4 text-gray-600">{row.type}</td>
                                        <td className="px-6 py-4 text-gray-500">{row.duration}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${row.status === 'Resolved' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>
                                                {row.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-bold text-gray-700">{row.quality}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
