import express from 'express';
import axios from 'axios';
import { CallLog } from '../models/CallLog.js';
import { CollegeInfo } from '../models/CollegeInfo.js';
import { protect, adminOnly } from '../middleware/auth.js';
import logger from '../utils/logger.js';
import { getTranscriptFromVapiCall } from '../utils/leadExtractor.js';

const router = express.Router();
const VAPI_API = 'https://api.vapi.ai';

const fetchVapiCalls = async (limit = 100, fromDate) => {
    const key = process.env.VAPI_PRIVATE_KEY;
    if (!key) return [];
    try {
        const params = new URLSearchParams({ limit: String(limit) });
        if (fromDate) params.set('createdAtGe', new Date(fromDate).toISOString());
        const { data } = await axios.get(`${VAPI_API}/call?${params}`, {
            headers: { Authorization: `Bearer ${key}` },
            timeout: 10000
        });
        return Array.isArray(data) ? data : (data?.calls ?? data?.data ?? []);
    } catch (err) {
        logger.warn('Vapi calls fetch failed:', err.message);
        return [];
    }
};

const normalizeVapiCall = (v) => {
    const started = v.startedAt ? new Date(v.startedAt) : new Date(v.createdAt);
    const ended = v.endedAt ? new Date(v.endedAt) : new Date();
    const dur = v.endedAt && v.startedAt ? Math.round((new Date(v.endedAt) - new Date(v.startedAt)) / 1000) : (v.analysis?.durationSeconds ?? 0);
    const type = (v.type || '').toLowerCase();
    const isPhone = type.includes('phone') || type.includes('inbound') || type.includes('outbound');
    const callerNum = v.customer?.number || (isPhone ? v.phoneNumber?.number : null) || 'Web';
    return {
        _id: `vapi-${v.id}`,
        callId: v.id,
        source: 'vapi',
        callerNumber: callerNum || 'Web',
        callType: isPhone ? 'Inbound' : 'Web',
        endedReason: v.endedReason ? String(v.endedReason).replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Customer Ended Call',
        startTime: started,
        endTime: ended,
        duration: dur,
        cost: v.cost != null ? v.cost : null,
        summary: v.analysis?.summary || '',
        transcript: [],
        outcome: v.endedReason?.includes('error') || v.endedReason?.includes('failed') ? 'abandoned' : 'answered',
    };
};

// Log a call (from local browser AI or web Vapi SDK)
router.post('/log', async (req, res) => {
    try {
        const { callerNumber = 'Web', duration = 0, transcript = [], summary = '' } = req.body;
        const callId = `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        const endTime = new Date();
        const startTime = new Date(endTime.getTime() - (duration * 1000));
        const callLog = new CallLog({
            callId,
            callerNumber,
            callType: 'Web',
            endedReason: 'Customer Ended Call',
            startTime,
            endTime,
            duration,
            transcript: Array.isArray(transcript) ? transcript.map(t => ({ role: t.role || 'user', content: typeof t === 'string' ? t : t.text || t.content, timestamp: new Date() })) : [],
            summary: summary || (transcript?.length ? 'Local AI session' : ''),
            enquiryType: 'general',
            outcome: 'answered',
        });
        await callLog.save();
        logger.info(`Call logged (web): ${callLog.callId} ${duration}s`);
        res.status(201).json(callLog);
    } catch (error) {
        logger.error(`Call log failed: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
});

// Get call history with filters (merges DB + Vapi API)
router.get('/history', protect, adminOnly, async (req, res) => {
    try {
        const { callType, from, to, includeVapi = 'true' } = req.query;
        const filter = {};
        if (callType && ['Inbound', 'Web'].includes(callType)) filter.callType = callType;
        if (from || to) {
            filter.startTime = {};
            if (from) filter.startTime.$gte = new Date(from);
            if (to) filter.startTime.$lte = new Date(to);
        }
        const dbHistory = await CallLog.find(filter).sort({ startTime: -1 }).lean();
        const dbById = {};
        dbHistory.forEach(c => { dbById[c.callId] = { ...c, source: 'db' }; });

        let history = dbHistory.map(c => ({ ...c, source: 'db', cost: c.cost ?? null }));

        if (includeVapi !== 'false') {
            const vapiCalls = await fetchVapiCalls(100, from);
            vapiCalls.forEach(v => {
                if (dbById[v.id]) return;
                history.push(normalizeVapiCall(v));
            });
        }

        history.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
        history = history.slice(0, 200);

        const transferred = history.filter(c => c.outcome === 'escalated').length;
        const successful = history.filter(c => c.outcome === 'answered').length;
        const failed = history.filter(c => c.outcome === 'abandoned').length;
        const college = await CollegeInfo.findOne();
        res.json({
            history,
            stats: { all: history.length, transferred, successful, failed },
            assistantPhone: college?.contact?.phone || null,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get analytics
router.get('/analytics', protect, adminOnly, async (req, res) => {
    try {
        const stats = await CallLog.aggregate([
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$startTime" } },
                    count: { $sum: 1 },
                    avgDuration: { $avg: "$duration" }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get full call detail + transcript for a single call (for admin view)
router.get('/:id/detail', protect, adminOnly, async (req, res) => {
    const { id } = req.params;
    const key = process.env.VAPI_PRIVATE_KEY;
    try {
        let callMeta = null;
        let transcriptMessages = [];

        // 1) Try from our DB first
        const log = await CallLog.findOne({ callId: id }).lean();
        if (log) {
            callMeta = {
                callId: log.callId,
                callerNumber: log.callerNumber,
                callType: log.callType,
                endedReason: log.endedReason,
                startTime: log.startTime,
                endTime: log.endTime,
                duration: log.duration,
                summary: log.summary,
                source: 'db',
            };
            transcriptMessages = (log.transcript || []).map((t) => ({
                role: (t.role || '').toLowerCase(),
                text: t.content || '',
            }));
        }

        // 2) If no transcript in DB, fetch from Vapi
        if ((!transcriptMessages || transcriptMessages.length === 0) && key) {
            const { data: fullCall } = await axios.get(`${VAPI_API}/call/${id}`, {
                headers: { Authorization: `Bearer ${key}` },
                timeout: 10000,
            });
            const { transcriptText, messages } = getTranscriptFromVapiCall(fullCall);
            transcriptMessages = (messages || []).map((m) => ({
                role: (m.role || '').toLowerCase(),
                text: m.message || m.content || m.transcript || '',
            }));
            if (!callMeta) {
                callMeta = {
                    callId: fullCall.id,
                    callerNumber: fullCall?.customer?.number || 'Web',
                    callType: (fullCall.type || '').toLowerCase().includes('phone') ? 'Inbound' : 'Web',
                    endedReason: fullCall.endedReason || 'Customer Ended Call',
                    startTime: fullCall.startedAt || fullCall.createdAt,
                    endTime: fullCall.endedAt || null,
                    duration: fullCall.analysis?.durationSeconds ?? null,
                    summary: fullCall.analysis?.summary || transcriptText.slice(0, 180),
                    source: 'vapi',
                };
            }
        }

        if (!callMeta) {
            return res.status(404).json({ error: 'Call not found' });
        }

        res.json({
            ...callMeta,
            messages: transcriptMessages,
        });
    } catch (error) {
        logger.error(`Call detail fetch failed for ${req.params.id}: ${error.message}`);
        res.status(500).json({ error: error.response?.data?.message || error.message });
    }
});

export default router;
