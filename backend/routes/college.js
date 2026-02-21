import express from 'express';
import { CollegeInfo } from '../models/CollegeInfo.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// Public: Get college info
router.get('/', async (req, res) => {
    try {
        const info = await CollegeInfo.findOne();
        res.json(info);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin: Update college info
router.put('/', protect, adminOnly, async (req, res) => {
    try {
        let info = await CollegeInfo.findOne();
        if (!info) {
            info = new CollegeInfo(req.body);
        } else {
            Object.assign(info, req.body);
            info.lastUpdated = Date.now();
        }
        await info.save();
        res.json(info);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
