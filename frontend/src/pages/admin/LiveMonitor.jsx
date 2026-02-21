import React, { useState, useEffect } from 'react';
import { Headphones, Activity, MessageSquare, AlertTriangle, ShieldCheck, Phone } from 'lucide-react';

const LiveMonitor = () => {
    const [activeCalls, setActiveCalls] = useState([]);

    // Simulate live calls for demo
    useEffect(() => {
        const timer = setTimeout(() => {
            setActiveCalls([
                {
                    id: 'call-1',
                    number: '+91 98765 43210',
                    duration: '01:45',
                    status: 'Speaking',
                    transcript: 'Can you tell me more about the B.Tech Computer Science course and the fees for this year?'
                }
            ]);
        }, 2000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">Live Call Monitoring</h1>
                    <p className="text-gray-500">Monitor active AI conversations in real-time.</p>
                </div>
                <div className="flex space-x-3">
                    <div className="flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-600 rounded-xl border border-green-100">
                        <Activity size={18} className="animate-pulse" />
                        <span className="font-bold text-sm">System Online</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="card p-6 border-l-4 border-l-primary-500">
                    <p className="text-gray-500 text-sm font-medium mb-1">Active Calls</p>
                    <h3 className="text-3xl font-bold text-gray-900">{activeCalls.length}</h3>
                </div>
                <div className="card p-6">
                    <p className="text-gray-500 text-sm font-medium mb-1">Queue Size</p>
                    <h3 className="text-3xl font-bold text-gray-900">0</h3>
                </div>
                <div className="card p-6">
                    <p className="text-gray-500 text-sm font-medium mb-1">Human Agents</p>
                    <h3 className="text-3xl font-bold text-gray-900">4</h3>
                </div>
                <div className="card p-6 bg-primary-600 text-white">
                    <p className="text-primary-100 text-sm font-medium mb-1">Peak Concurrency</p>
                    <h3 className="text-3xl font-bold">12</h3>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center space-x-2">
                        <Headphones className="text-primary-600" />
                        <span>Ongoing Conversations</span>
                    </h3>

                    {activeCalls.length === 0 ? (
                        <div className="card p-20 text-center space-y-4">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto">
                                <Activity size={40} className="text-gray-200" />
                            </div>
                            <h4 className="text-xl font-bold text-gray-700">No Active Calls Right Now</h4>
                            <p className="text-gray-400 max-w-sm mx-auto">Whenever a student calls the AI assistant, it will appear here in real-time with live transcripts.</p>
                        </div>
                    ) : (
                        activeCalls.map(call => (
                            <div key={call.id} className="card p-8 border-2 border-primary-100 bg-white">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-14 h-14 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center">
                                            <Phone size={28} />
                                        </div>
                                        <div>
                                            <h4 className="text-xl font-bold text-gray-900">{call.number}</h4>
                                            <div className="flex items-center space-x-3">
                                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{call.id}</span>
                                                <span className="flex items-center space-x-1 text-green-500 text-xs font-bold">
                                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                                    <span>{call.status}</span>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-mono font-bold text-gray-900">{call.duration}</div>
                                        <div className="text-xs font-bold text-gray-400">DURATION</div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
                                    <div className="flex items-center space-x-2 text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">
                                        <MessageSquare size={14} />
                                        <span>Live Transcript</span>
                                    </div>
                                    <p className="text-lg text-gray-700 italic leading-relaxed">
                                        "{call.transcript}"
                                    </p>
                                </div>

                                <div className="flex space-x-4">
                                    <button className="btn btn-primary bg-accent-500 hover:bg-accent-600 flex-grow shadow-accent-500/20">
                                        Escalate to Human
                                    </button>
                                    <button className="btn bg-gray-900 text-white px-8">
                                        End Call
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="space-y-8">
                    <div className="card p-8 bg-white">
                        <h4 className="font-bold text-gray-900 mb-6 flex items-center space-x-2">
                            <AlertTriangle size={20} className="text-orange-500" />
                            <span>System Health</span>
                        </h4>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Vapi Connectivity</span>
                                    <span className="text-green-600 font-bold">100%</span>
                                </div>
                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 w-[100%]"></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">DB Latency</span>
                                    <span className="text-green-600 font-bold">12ms</span>
                                </div>
                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 w-[90%]"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card p-8 bg-gray-50 border-dashed border-2 border-gray-200 text-center">
                        <ShieldCheck size={32} className="mx-auto text-gray-400 mb-4" />
                        <h4 className="font-bold text-gray-900 mb-2">Security Monitor</h4>
                        <p className="text-sm text-gray-500">
                            Automatic detection for hallucinations and policy violations is currently active.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveMonitor;
