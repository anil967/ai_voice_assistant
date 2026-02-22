import React, { useState, useEffect } from 'react';
import { UserPlus, Search, RefreshCw, Download, Phone, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { getLeads } from '../../api';

const formatDate = (d) =>
    d ? new Date(d).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }) : '—';

const AdmissionLeads = () => {
    const [leads, setLeads] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const params = new URLSearchParams();
            if (search.trim()) params.set('search', search.trim());
            if (dateFrom) params.set('from', new Date(dateFrom).toISOString());
            if (dateTo) params.set('to', new Date(dateTo).toISOString());
            params.set('limit', '200');
            const { data } = await getLeads(token, params.toString());
            setLeads(data.leads || []);
            setTotal(data.total ?? (data.leads || []).length);
        } catch (err) {
            toast.error('Failed to load admission leads');
            setLeads([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    const handleExport = () => {
        if (leads.length === 0) {
            toast.error('No leads to export');
            return;
        }
        const headers = ['Name', 'Age', '12th %', 'Course', 'City', 'Phone', 'Date'];
        const rows = leads.map((l) => [
            l.fullName || '',
            l.age || '',
            l.twelfthPercentage || '',
            l.course || '',
            l.city || '',
            l.phone || '',
            formatDate(l.createdAt),
        ]);
        const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `admission-leads-${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(link.href);
        toast.success('CSV downloaded');
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <UserPlus className="text-primary-600" size={28} />
                        Admission Leads
                    </h1>
                    <p className="text-gray-500 mt-1">Leads collected from voice calls (admission flow)</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchLeads}
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                    <button
                        onClick={handleExport}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700"
                    >
                        <Download size={16} />
                        Export CSV
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search name, course, city, phone..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && fetchLeads()}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-xl text-sm"
                    />
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-xl text-sm"
                    />
                    <button
                        onClick={fetchLeads}
                        className="px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700"
                    >
                        Apply
                    </button>
                </div>

                {loading ? (
                    <div className="p-12 text-center text-gray-500">Loading leads...</div>
                ) : leads.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">No admission leads found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Name</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Age</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">12th %</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Course</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">City</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Phone</th>
                                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leads.map((lead) => (
                                    <tr key={lead._id} className="border-b border-gray-50 hover:bg-gray-50/50">
                                        <td className="px-4 py-3 font-medium text-gray-900">{lead.fullName || '—'}</td>
                                        <td className="px-4 py-3 text-gray-600">{lead.age || '—'}</td>
                                        <td className="px-4 py-3 text-gray-600">{lead.twelfthPercentage || '—'}</td>
                                        <td className="px-4 py-3 text-gray-600">{lead.course || '—'}</td>
                                        <td className="px-4 py-3 text-gray-600">{lead.city || '—'}</td>
                                        <td className="px-4 py-3 text-gray-600">{lead.phone || '—'}</td>
                                        <td className="px-4 py-3 text-gray-500 text-sm">{formatDate(lead.createdAt)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
            {!loading && total > 0 && (
                <p className="text-sm text-gray-500">Showing {leads.length} of {total} lead(s)</p>
            )}
        </div>
    );
};

export default AdmissionLeads;
