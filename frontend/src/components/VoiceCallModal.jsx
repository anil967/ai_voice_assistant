import React, { useState, useEffect, useRef } from 'react';
import Vapi from '@vapi-ai/web';
import { X, Mic, MicOff, PhoneOff, MessageSquare, PhoneIncoming, Volume2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getLocalAIResponse, logCall } from '../api';

const PUBLIC_KEY = import.meta.env.VITE_VAPI_PUBLIC_KEY;
const ASSISTANT_ID = import.meta.env.VITE_VAPI_ASSISTANT_ID;

const VoiceCallModal = ({ isOpen, onClose }) => {
    const [status, setStatus] = useState('idle');       // idle | connecting | active | ended
    const [isMuted, setIsMuted] = useState(false);
    const [transcript, setTranscript] = useState([]);
    const [isAiSpeaking, setIsAiSpeaking] = useState(false);

    // Decide mode once Modal opens
    const useRealVapi = !!(PUBLIC_KEY && PUBLIC_KEY !== 'your_public_key' && ASSISTANT_ID);

    const vapiRef = useRef(null);
    const recognitionRef = useRef(null);
    const synthRef = useRef(window.speechSynthesis);
    const callStartTimeRef = useRef(null);
    const transcriptRef = useRef([]);

    useEffect(() => { transcriptRef.current = transcript; }, [transcript]);

    // Boot Vapi instance once
    useEffect(() => {
        if (!useRealVapi) return;
        try {
            vapiRef.current = new Vapi(PUBLIC_KEY);
            vapiRef.current.on('call-start', () => {
                callStartTimeRef.current = Date.now();
                setStatus('active');
            });
            vapiRef.current.on('call-end', () => {
                const duration = callStartTimeRef.current ? Math.round((Date.now() - callStartTimeRef.current) / 1000) : 0;
                const t = transcriptRef.current || [];
                logCall({
                    callerNumber: 'Web',
                    duration,
                    transcript: t.map(x => ({ role: x.role, text: x.text })),
                    summary: t.length ? t.map(x => x.text).join(' ') : 'Web Vapi call',
                }).catch((err) => console.warn('Call log failed:', err));
                setStatus('ended');
                setTimeout(onClose, 2000);
            });
            vapiRef.current.on('speech-start', () => setIsAiSpeaking(true));
            vapiRef.current.on('speech-end', () => setIsAiSpeaking(false));
            vapiRef.current.on('error', (e) => {
                console.error('Vapi error:', e);
                toast.error('Voice call error. Try again.');
                setStatus('idle');
            });
            vapiRef.current.on('message', (msg) => {
                if (msg.type === 'transcript' && msg.transcriptType === 'final') {
                    setTranscript(prev => [...prev.slice(-6), { role: msg.role, text: msg.transcript }]);
                }
            });
        } catch (e) {
            console.error('Vapi init error:', e);
        }

        return () => {
            if (vapiRef.current) {
                try { vapiRef.current.stop(); } catch { }
                vapiRef.current.removeAllListeners?.();
            }
        };
    }, [useRealVapi]);

    // Reset on close
    useEffect(() => {
        if (!isOpen) {
            setStatus('idle');
            setTranscript([]);
            setIsMuted(false);
            setIsAiSpeaking(false);
            stopSimulation();
            if (vapiRef.current) {
                try { vapiRef.current.stop(); } catch { }
            }
        }
    }, [isOpen]);

    // ── Simulation helpers ─────────────────────────────────────────────────
    const setupSimulation = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            toast.error('Speech Recognition not supported in this browser');
            return;
        }
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = false;
        rec.lang = 'en-US';
        rec.onresult = async (event) => {
            const text = event.results[event.results.length - 1][0].transcript;
            setTranscript(prev => [...prev.slice(-6), { role: 'user', text }]);
            try {
                const { data } = await getLocalAIResponse(text);
                speak(data.response || 'Let me look into that for you.');
            } catch {
                speak("I'm having trouble connecting. Please try again shortly.");
            }
        };
        rec.onerror = (err) => {
            if (err.error === 'not-allowed') toast.error('Microphone access denied. Please allow it in browser settings.');
        };
        recognitionRef.current = rec;
        rec.start();
    };

    const speak = (text) => {
        setTranscript(prev => [...prev.slice(-6), { role: 'assistant', text }]);
        setIsAiSpeaking(true);
        synthRef.current.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.onend = () => setIsAiSpeaking(false);
        synthRef.current.speak(u);
    };

    const stopSimulation = () => {
        try { recognitionRef.current?.stop(); } catch { }
        synthRef.current?.cancel();
    };

    // ── Start ──────────────────────────────────────────────────────────────
    const startCall = async () => {
        setStatus('connecting');

        if (useRealVapi) {
            try {
                await vapiRef.current.start(ASSISTANT_ID);
            } catch (err) {
                console.error('Vapi start error:', err);
                toast.error('Could not start AI call. Check Vapi credentials.');
                setStatus('idle');
            }
        } else {
            // Simulation mode — browser STT + TTS
            callStartTimeRef.current = Date.now();
            setTimeout(() => {
                setStatus('active');
                speak("Hello! Welcome to BCET - Balasore College of Engineering and Technology. I'm your AI admissions assistant. How can I help you today?");
                setTimeout(setupSimulation, 2500); // wait for greeting to finish
            }, 1000);
        }
    };

    // ── End ───────────────────────────────────────────────────────────────
    const endCall = async () => {
        if (useRealVapi) {
            try { vapiRef.current?.stop(); } catch { }
        } else {
            stopSimulation();
            const duration = callStartTimeRef.current ? Math.round((Date.now() - callStartTimeRef.current) / 1000) : 0;
            try {
                await logCall({
                    callerNumber: 'Web',
                    duration,
                    transcript: transcript.map(t => ({ role: t.role, text: t.text })),
                    summary: transcript.length ? transcript.map(t => t.text).join(' ') : 'Local AI session',
                });
            } catch (err) {
                console.warn('Call log failed:', err);
                toast.error('Call could not be saved to history.');
            }
            setStatus('ended');
            setTimeout(onClose, 1500);
        }
    };

    const toggleMute = () => {
        setIsMuted(m => {
            if (useRealVapi) {
                vapiRef.current?.setMuted(!m);
            }
            return !m;
        });
    };

    const handleBackdropClose = () => {
        if (status === 'active' && !useRealVapi) endCall();
        else onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-end justify-center px-4 pb-6 animate-fade-in">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleBackdropClose} />

            {/* Modal */}
            <div className="relative w-full max-w-xl bg-white rounded-[2rem] shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="px-8 pt-8 pb-0 flex justify-between items-start">
                    <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${status === 'active' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                            <Mic size={22} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">
                                {useRealVapi ? '🎙️ BCET AI Assistant' : '🤖 Local AI Assistant'}
                            </h3>
                            <p className="text-xs font-bold text-primary-500 uppercase tracking-widest flex items-center gap-2">
                                {status === 'idle' && 'Ready to talk'}
                                {status === 'connecting' && 'Connecting...'}
                                {status === 'active' && (
                                    <span className="flex items-center gap-1">
                                        Live
                                        <span className="flex gap-0.5">
                                            {[0, 1, 2].map(i => (
                                                <span key={i} className="w-1 h-1 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                                            ))}
                                        </span>
                                    </span>
                                )}
                                {status === 'ended' && '✅ Call Ended'}
                            </p>
                        </div>
                    </div>
                    <button onClick={handleBackdropClose} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    {/* Transcript */}
                    <div className="h-44 overflow-y-auto space-y-3 flex flex-col">
                        {transcript.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center opacity-20 text-center space-y-2">
                                <MessageSquare size={36} />
                                <p className="text-sm font-medium">Conversation will appear here</p>
                            </div>
                        ) : (
                            transcript.map((msg, i) => (
                                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm font-medium leading-relaxed
                                        ${msg.role === 'user' ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))
                        )}
                        {isAiSpeaking && (
                            <div className="flex items-center gap-2 text-primary-500 text-xs font-bold animate-pulse pl-1">
                                <Volume2 size={12} />
                                <span>AI is speaking…</span>
                            </div>
                        )}
                    </div>

                    {/* Waveform */}
                    {status === 'active' && (
                        <div className="flex items-center justify-center space-x-1 h-10">
                            {[...Array(18)].map((_, i) => (
                                <div
                                    key={i}
                                    className="w-1 bg-primary-500 rounded-full animate-waveform opacity-70"
                                    style={{ animationDelay: `${i * 0.08}s`, minHeight: '4px' }}
                                />
                            ))}
                        </div>
                    )}

                    {/* Controls */}
                    <div className="flex items-center justify-center gap-4">
                        {/* Mute */}
                        <button
                            onClick={toggleMute}
                            disabled={status !== 'active'}
                            className={`w-13 h-13 w-14 h-14 rounded-2xl flex items-center justify-center transition-all
                                ${status !== 'active' ? 'opacity-30 cursor-not-allowed bg-gray-100 text-gray-400'
                                    : isMuted ? 'bg-red-50 text-red-500 border border-red-100' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                        >
                            {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
                        </button>

                        {/* Main CTA */}
                        {status === 'idle' && (
                            <button
                                onClick={startCall}
                                className="flex-1 py-4 bg-primary-600 hover:bg-primary-700 active:scale-95 text-white rounded-2xl font-bold text-base shadow-lg shadow-primary-500/30 transition-all flex items-center justify-center gap-3"
                            >
                                <PhoneIncoming size={22} />
                                <span>{useRealVapi ? 'Start AI Voice Call' : 'Start AI Chat (Local)'}</span>
                            </button>
                        )}
                        {status === 'connecting' && (
                            <button disabled className="flex-1 py-4 bg-gray-100 text-gray-400 rounded-2xl font-bold text-base flex items-center justify-center gap-3 cursor-not-allowed">
                                <span className="animate-spin text-primary-500">⟳</span>
                                <span>Connecting…</span>
                            </button>
                        )}
                        {status === 'active' && (
                            <button
                                onClick={endCall}
                                className="flex-1 py-4 bg-red-500 hover:bg-red-600 active:scale-95 text-white rounded-2xl font-bold text-base shadow-lg shadow-red-500/30 transition-all flex items-center justify-center gap-3"
                            >
                                <PhoneOff size={22} />
                                <span>End Call</span>
                            </button>
                        )}
                        {status === 'ended' && (
                            <div className="flex-1 py-4 bg-green-50 text-green-600 rounded-2xl font-bold text-base flex items-center justify-center gap-3">
                                ✅ Thank you for calling!
                            </div>
                        )}

                        {/* Volume placeholder */}
                        <button
                            className="w-14 h-14 rounded-2xl bg-gray-100 text-gray-400 flex items-center justify-center"
                            disabled
                        >
                            <Volume2 size={22} />
                        </button>
                    </div>
                </div>

                <div className="pb-6 text-center">
                    <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">
                        {useRealVapi ? 'Powered by Vapi AI · Real-time voice' : 'Running in browser simulation mode'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VoiceCallModal;
