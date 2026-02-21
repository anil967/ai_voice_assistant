import React, { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, RefreshCw, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const apiBase = import.meta.env.VITE_API_URL || '';
const api = axios.create({ baseURL: apiBase ? `${apiBase.replace(/\/$/, '')}/api` : '/api' });
const authHeader = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

const Knowledge = () => {
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [saving, setSaving] = useState(false);
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        fetchDocs();
    }, []);

    const fetchDocs = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/knowledge', authHeader());
            setDocs(data);
        } catch (err) {
            toast.error('Failed to load documents');
        } finally {
            setLoading(false);
        }
    };

    const openNew = () => {
        setEditing(null);
        setTitle('');
        setContent('');
        setModalOpen(true);
    };

    const openEdit = (doc) => {
        setEditing(doc);
        setTitle(doc.title);
        setContent(doc.content);
        setModalOpen(true);
    };

    const handleSave = async () => {
        if (!title.trim() || !content.trim()) {
            toast.error('Title and content required');
            return;
        }
        setSaving(true);
        try {
            if (editing) {
                await api.put(`/knowledge/${editing._id}`, { title, content }, authHeader());
                toast.success('Document updated & re-indexed');
            } else {
                await api.post('/knowledge', { title, content }, authHeader());
                toast.success('Document added & indexed');
            }
            setModalOpen(false);
            fetchDocs();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this document? It will be removed from AI knowledge.')) return;
        try {
            await api.delete(`/knowledge/${id}`, authHeader());
            toast.success('Document deleted');
            fetchDocs();
        } catch (err) {
            toast.error('Failed to delete');
        }
    };

    const handleReindex = async (id) => {
        try {
            await api.post(`/knowledge/${id}/reindex`, {}, authHeader());
            toast.success('Document re-indexed');
            fetchDocs();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Re-index failed');
        }
    };

    const fetchPreview = async () => {
        try {
            const { data } = await api.get('/knowledge/preview', authHeader());
            setPreview(data);
        } catch (err) {
            toast.error('Failed to load preview');
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900">Knowledge (RAG)</h1>
                <p className="text-gray-500 mt-1">Add documents that the AI will search and use when answering questions. Enable RAG in AI Agent settings.</p>
            </div>

            <div className="card p-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <BookOpen size={22} className="text-primary-600" />
                        Documents
                    </h2>
                    <div className="flex gap-3">
                        <button
                            onClick={fetchPreview}
                            className="btn btn-outline px-4 py-2 text-sm font-bold flex items-center gap-2"
                        >
                            Preview chunks
                        </button>
                        <button
                            onClick={openNew}
                            className="btn btn-primary px-4 py-2 text-sm font-bold flex items-center gap-2"
                        >
                            <Plus size={18} />
                            Add Document
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="animate-pulse space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-16 bg-gray-100 rounded-xl" />
                        ))}
                    </div>
                ) : docs.length === 0 ? (
                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-12 text-center">
                        <FileText size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="font-bold text-gray-600">No documents yet</p>
                        <p className="text-sm text-gray-500 mt-1">Add brochures, FAQs, or any text the AI should know. Paste content and it will be chunked & embedded.</p>
                        <button onClick={openNew} className="btn btn-primary mt-6 px-6 py-3">
                            Add Document
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {docs.map(doc => (
                            <div key={doc._id} className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl p-4 hover:border-primary-200">
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <div className="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <FileText size={20} className="text-primary-600" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-bold text-gray-900 truncate">{doc.title}</p>
                                        <p className="text-xs text-gray-500">
                                            {(doc.chunks?.length || 0)} chunks · Updated {new Date(doc.updatedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    <button
                                        onClick={() => handleReindex(doc._id)}
                                        className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                                        title="Re-index"
                                    >
                                        <RefreshCw size={16} />
                                    </button>
                                    <button
                                        onClick={() => openEdit(doc)}
                                        className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(doc._id)}
                                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {preview && (
                    <div className="mt-8 p-6 bg-primary-50 border border-primary-200 rounded-2xl">
                        <h3 className="font-bold text-primary-800 mb-2">Chunks that will be injected into AI prompt ({preview.count})</h3>
                        <ul className="space-y-2 text-sm text-gray-700 max-h-60 overflow-y-auto">
                            {preview.chunks?.slice(0, 10).map((c, i) => (
                                <li key={i} className="border-l-2 border-primary-300 pl-3 py-1">• {c.slice(0, 120)}...</li>
                            ))}
                        </ul>
                        {preview.count > 10 && (
                            <p className="text-xs text-gray-500 mt-2">... and {preview.count - 10} more</p>
                        )}
                    </div>
                )}
            </div>

            {/* Modal */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">
                                {editing ? 'Edit Document' : 'Add Document'}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">Content will be chunked and embedded for RAG. Requires OPENAI_API_KEY.</p>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Title</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. Admission Brochure 2025"
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Content (paste text from brochure, FAQ, etc.)</label>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Paste your document content here..."
                                    rows={12}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                                />
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                            <button
                                onClick={() => setModalOpen(false)}
                                className="btn btn-outline px-6 py-2"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving || !title.trim() || !content.trim()}
                                className="btn btn-primary px-6 py-2 font-bold disabled:opacity-60"
                            >
                                {saving ? 'Saving...' : editing ? 'Update' : 'Add & Index'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Knowledge;
