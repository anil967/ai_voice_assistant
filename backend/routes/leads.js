import express from 'express';
import axios from 'axios';
import { AdmissionLead } from '../models/AdmissionLead.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { extractLeadFromTranscript, getTranscriptFromVapiCall } from '../utils/leadExtractor.js';
import logger from '../utils/logger.js';

const router = express.Router();
const VAPI_API = 'https://api.vapi.ai';

router.get('/', protect, adminOnly, async (req, res) => {
    try {
        const { from, to, search, sort = '-createdAt', limit = 100 } = req.query;
        const filter = {};
        if (from || to) {
            filter.createdAt = {};
            if (from) filter.createdAt.$gte = new Date(from + (from.includes('T') ? '' : 'T00:00:00.000Z'));
            if (to) {
                const toDate = new Date(to);
                const toEnd = new Date(toDate);
                toEnd.setUTCHours(23, 59, 59, 999);
                filter.createdAt.$lte = toEnd;
            }
        }
        if (search && search.trim()) {
            const s = search.trim().toLowerCase();
            filter.$or = [
                { fullName: new RegExp(s, 'i') },
                { course: new RegExp(s, 'i') },
                { city: new RegExp(s, 'i') },
                { phone: new RegExp(s, 'i') },
            ];
        }
        const leads = await AdmissionLead.find(filter)
            .sort(sort)
            .limit(Math.min(Number(limit) || 100, 500))
            .lean();
        const total = await AdmissionLead.countDocuments(filter);
        res.json({ leads, total });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Sync admission leads from Vapi call transcripts (call log section)
router.post('/sync-from-vapi', protect, adminOnly, async (req, res) => {
    const key = process.env.VAPI_PRIVATE_KEY;
    if (!key) {
        return res.status(400).json({ error: 'VAPI_PRIVATE_KEY not set' });
    }
    try {
        const { data: calls } = await axios.get(`${VAPI_API}/call`, {
            params: { limit: 50 },
            headers: { Authorization: `Bearer ${key}` },
            timeout: 15000,
        });
        const list = Array.isArray(calls) ? calls : (calls?.calls ?? calls?.data ?? []);
        let created = 0;
        let skipped = 0;
        for (const call of list) {
            const callId = call?.id;
            if (!callId) continue;
            const existing = await AdmissionLead.findOne({ callId });
            if (existing) {
                skipped++;
                continue;
            }
            try {
                const { data: fullCall } = await axios.get(`${VAPI_API}/call/${callId}`, {
                    headers: { Authorization: `Bearer ${key}` },
                    timeout: 10000,
                });
                const { transcriptText, messages } = getTranscriptFromVapiCall(fullCall);
                const isAdmission = /admission|admit|apply|enrol|inquir|name|age|course|percentage|city|area|full name|may i have/i.test(transcriptText) || transcriptText.length > 60;
                if (!isAdmission) {
                    skipped++;
                    continue;
                }
                const phone = fullCall?.customer?.number || fullCall?.from?.phoneNumber || call?.customer?.number || '';
                const extracted = extractLeadFromTranscript(transcriptText, messages, phone);
                const lead = new AdmissionLead({
                    fullName: extracted.fullName || 'From Vapi call',
                    age: extracted.age,
                    twelfthPercentage: extracted.twelfthPercentage,
                    course: extracted.course,
                    city: extracted.city,
                    phone: extracted.phone || phone,
                    callId,
                    source: 'vapi_sync',
                });
                await lead.save();
                created++;
                logger.info(`Lead synced from Vapi call ${callId}: ${lead.fullName}`);
            } catch (e) {
                logger.warn(`Vapi call ${callId} fetch/save failed: ${e.message}`);
            }
        }
        res.json({ success: true, created, skipped, total: list.length });
    } catch (err) {
        logger.error('Sync from Vapi failed:', err.message);
        res.status(500).json({ error: err.response?.data?.message || err.message });
    }
});

export default router;
