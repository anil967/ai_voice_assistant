import express from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import { syncVapiAssistant } from '../utils/vapiSync.js';
import axios from 'axios';
import logger from '../utils/logger.js';

const router = express.Router();
const VAPI_API = 'https://api.vapi.ai';

// ── POST /api/vapi/sync ───────────────────────────────────────────────────────
// Sync current MongoDB college data to the Vapi assistant system prompt
router.post('/sync', protect, adminOnly, async (req, res) => {
    const result = await syncVapiAssistant();
    if (result.success) {
        res.json({ message: result.message });
    } else {
        res.status(400).json({ error: result.message });
    }
});

// ── GET /api/vapi/assistant ───────────────────────────────────────────────────
// Get current Vapi assistant details
router.get('/assistant', protect, adminOnly, async (req, res) => {
    const { VAPI_PRIVATE_KEY, VAPI_ASSISTANT_ID } = process.env;
    if (!VAPI_PRIVATE_KEY || !VAPI_ASSISTANT_ID) {
        return res.status(400).json({ error: 'Vapi credentials not configured' });
    }
    try {
        const { data } = await axios.get(`${VAPI_API}/assistant/${VAPI_ASSISTANT_ID}`, {
            headers: { Authorization: `Bearer ${VAPI_PRIVATE_KEY}` }
        });
        res.json({
            id: data.id,
            name: data.name,
            firstMessage: data.firstMessage,
            model: data.model?.model,
            voice: data.voice?.voiceId,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
        });
    } catch (err) {
        logger.error('Vapi assistant fetch error:', err.message);
        res.status(500).json({ error: err.response?.data?.message || err.message });
    }
});

// ── GET /api/vapi/calls ──────────────────────────────────────────────────────
// Fetch call logs from Vapi API
router.get('/calls', protect, adminOnly, async (req, res) => {
    const { VAPI_PRIVATE_KEY } = process.env;
    if (!VAPI_PRIVATE_KEY) return res.status(400).json({ error: 'Vapi credentials not configured' });
    try {
        const { limit = 100, createdAtGe } = req.query;
        const params = new URLSearchParams();
        params.set('limit', Math.min(parseInt(limit, 10) || 100, 500));
        if (createdAtGe) params.set('createdAtGe', createdAtGe);
        const { data } = await axios.get(`${VAPI_API}/call?${params}`, {
            headers: { Authorization: `Bearer ${VAPI_PRIVATE_KEY}` }
        });
        const calls = Array.isArray(data) ? data : (data?.calls ?? data?.data ?? []);
        res.json(calls);
    } catch (err) {
        logger.error('Vapi calls fetch error:', err.response?.data || err.message);
        res.status(500).json({ error: err.response?.data?.message || err.message });
    }
});

// ── GET /api/vapi/phone-numbers ───────────────────────────────────────────────
// List phone numbers linked to Vapi account
router.get('/phone-numbers', protect, adminOnly, async (req, res) => {
    const { VAPI_PRIVATE_KEY } = process.env;
    if (!VAPI_PRIVATE_KEY) return res.status(400).json({ error: 'Vapi credentials not configured' });
    try {
        const { data } = await axios.get(`${VAPI_API}/phone-number`, {
            headers: { Authorization: `Bearer ${VAPI_PRIVATE_KEY}` }
        });
        // Handle both array and paginated { data: [...] } response formats
        const phoneNumbers = Array.isArray(data) ? data : (data?.data ?? data?.phoneNumbers ?? []);
        res.json(phoneNumbers);
    } catch (err) {
        res.status(500).json({ error: err.response?.data?.message || err.message });
    }
});

export default router;
