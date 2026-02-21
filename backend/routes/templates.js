import express from 'express';
import { MessageTemplate } from '../models/MessageTemplate.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// GET all message templates
router.get('/', protect, adminOnly, async (req, res) => {
    try {
        const templates = await MessageTemplate.find().sort({ createdAt: -1 });
        res.json(templates);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PUT update template
router.put('/:id', protect, adminOnly, async (req, res) => {
    try {
        const template = await MessageTemplate.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!template) return res.status(404).json({ error: 'Template not found' });
        res.json(template);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST create template
router.post('/', protect, adminOnly, async (req, res) => {
    try {
        const template = await MessageTemplate.create(req.body);
        res.status(201).json(template);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PATCH toggle enabled
router.patch('/:id/toggle', protect, adminOnly, async (req, res) => {
    try {
        const template = await MessageTemplate.findById(req.params.id);
        if (!template) return res.status(404).json({ error: 'Template not found' });
        template.enabled = !template.enabled;
        await template.save();
        res.json(template);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
