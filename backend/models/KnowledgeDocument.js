import mongoose from 'mongoose';

const documentChunkSchema = new mongoose.Schema({
    text: { type: String, required: true },
    embedding: { type: [Number], required: true },
    index: { type: Number, default: 0 },
}, { _id: false });

const knowledgeDocumentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    chunks: [documentChunkSchema],
    source: { type: String, default: 'manual' }, // manual, upload, url
    updatedAt: { type: Date, default: Date.now },
});

export const KnowledgeDocument = mongoose.model('KnowledgeDocument', knowledgeDocumentSchema);
