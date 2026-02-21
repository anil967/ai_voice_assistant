import express from 'express';
import { KnowledgeDocument } from '../models/KnowledgeDocument.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { indexDocument, retrieveChunks } from '../utils/rag.js';

const router = express.Router();

router.get('/', protect, adminOnly, async (req, res) => {
    try {
        const docs = await KnowledgeDocument.find().sort({ updatedAt: -1 });
        res.json(docs);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/', protect, adminOnly, async (req, res) => {
    try {
        const { title, content } = req.body;
        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content required' });
        }
        const doc = await KnowledgeDocument.create({ title, content });
        const result = await indexDocument(doc);
        if (!result.success) {
            return res.status(400).json({ error: result.message || 'Indexing failed' });
        }
        const updated = await KnowledgeDocument.findById(doc._id);
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', protect, adminOnly, async (req, res) => {
    try {
        const doc = await KnowledgeDocument.findByIdAndUpdate(
            req.params.id,
            { $set: { ...req.body, updatedAt: new Date() } },
            { new: true }
        );
        if (!doc) return res.status(404).json({ error: 'Document not found' });
        const result = await indexDocument(doc);
        if (!result.success) {
            return res.status(400).json({ error: result.message || 'Indexing failed' });
        }
        const updated = await KnowledgeDocument.findById(doc._id);
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        await KnowledgeDocument.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/:id/reindex', protect, adminOnly, async (req, res) => {
    try {
        const result = await indexDocument(req.params.id);
        if (!result.success) {
            return res.status(400).json({ error: result.message || 'Re-index failed' });
        }
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/preview', protect, adminOnly, async (req, res) => {
    try {
        const chunks = await retrieveChunks();
        res.json({ chunks, count: chunks.length });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
