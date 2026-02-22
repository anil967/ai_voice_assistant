import express from 'express';
import { AdmissionLead } from '../models/AdmissionLead.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, adminOnly, async (req, res) => {
    try {
        const { from, to, search, sort = '-createdAt', limit = 100 } = req.query;
        const filter = {};
        if (from || to) {
            filter.createdAt = {};
            if (from) filter.createdAt.$gte = new Date(from);
            if (to) filter.createdAt.$lte = new Date(to);
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

export default router;
