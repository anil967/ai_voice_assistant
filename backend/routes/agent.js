import express from 'express';
import { AgentConfig } from '../models/AgentConfig.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, adminOnly, async (req, res) => {
    try {
        const config = await AgentConfig.findOne();
        res.json(config);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/', protect, adminOnly, async (req, res) => {
    try {
        let config = await AgentConfig.findOne();
        if (!config) {
            config = new AgentConfig(req.body);
        } else {
            Object.assign(config, req.body);
            config.lastModified = Date.now();
        }
        await config.save();
        res.json(config);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
