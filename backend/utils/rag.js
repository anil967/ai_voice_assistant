import OpenAI from 'openai';
import { KnowledgeDocument } from '../models/KnowledgeDocument.js';
import logger from './logger.js';

const EMBEDDING_MODEL = 'text-embedding-3-small';
const CHUNK_SIZE = 600;
const CHUNK_OVERLAP = 80;
const TOP_K = 18; // chunks to retrieve
const SEED_QUERIES = [
    'courses fees eligibility duration',
    'admission process how to apply',
    'hostel accommodation fees',
    'founder chairman director leadership',
    'placement recruitment campus drive',
    'facilities library lab campus',
    'contact address phone email',
    'wifi password internet network guest campus',
    'exam schedule timetable dates',
    'events fest cultural sports',
];

/**
 * Splits text into overlapping chunks.
 */
function chunkText(text, size = CHUNK_SIZE, overlap = CHUNK_OVERLAP) {
    const chunks = [];
    if (!text || typeof text !== 'string') return chunks;
    const trimmed = text.trim();
    if (trimmed.length < 20) return chunks; // Too short to chunk meaningfully
    let start = 0;
    while (start < trimmed.length) {
        const end = Math.min(start + size, trimmed.length);
        let slice = trimmed.slice(start, end);
        if (end < trimmed.length) {
            const lastSpace = slice.lastIndexOf(' ');
            if (lastSpace > size / 2) slice = slice.slice(0, lastSpace + 1);
        }
        if (slice.trim()) chunks.push(slice.trim());
        start = end - overlap;
        if (start >= trimmed.length || end >= trimmed.length) break;
        if (start < 0) start = 0;
    }
    return chunks;
}

/**
 * Cosine similarity between two vectors.
 */
function cosineSimilarity(a, b) {
    if (a.length !== b.length) return 0;
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom ? dot / denom : 0;
}

/**
 * Get embeddings from OpenAI.
 */
async function getEmbedding(text) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey || !apiKey.startsWith('sk-')) {
        logger.warn('RAG: OPENAI_API_KEY not set or invalid, skipping embeddings');
        return null;
    }
    try {
        const openai = new OpenAI({ apiKey });
        const res = await openai.embeddings.create({
            model: EMBEDDING_MODEL,
            input: text.slice(0, 8000),
        });
        return res.data[0].embedding;
    } catch (err) {
        logger.warn(`RAG: Embedding API error: ${err.message}`);
        return null;
    }
}

/**
 * Chunk a document and store with embeddings.
 */
export async function indexDocument(docIdOrDoc) {
    const doc = typeof docIdOrDoc === 'string'
        ? await KnowledgeDocument.findById(docIdOrDoc)
        : docIdOrDoc;
    if (!doc) return { success: false, message: 'Document not found' };

    const textChunks = chunkText(doc.content || '');
    if (textChunks.length === 0) {
        const reason = !doc.content?.trim()
            ? 'Content is empty'
            : doc.content.trim().length < 20
                ? 'Content too short (need at least ~20 characters)'
                : 'Could not create chunks';
        return { success: false, message: reason, chunksCount: 0 };
    }

    const embeddings = [];
    for (let i = 0; i < textChunks.length; i++) {
        const emb = await getEmbedding(textChunks[i]);
        if (emb) embeddings.push({ text: textChunks[i], embedding: emb, index: i });
    }

    if (embeddings.length === 0) {
        return {
            success: false,
            message: 'OpenAI embeddings failed. Check OPENAI_API_KEY in .env and restart the server.',
            chunksCount: 0,
        };
    }

    doc.chunks = embeddings;
    doc.updatedAt = new Date();
    await doc.save();
    return { success: true, chunksCount: embeddings.length };
}

/**
 * Retrieve relevant chunks for a list of queries. Returns merged, deduped chunks.
 */
export async function retrieveChunks(queries = SEED_QUERIES, topK = TOP_K) {
    const docs = await KnowledgeDocument.find({ 'chunks.0': { $exists: true } });
    if (docs.length === 0) return [];

    const queryEmbeddings = [];
    for (const q of queries) {
        const emb = await getEmbedding(q);
        if (emb) queryEmbeddings.push(emb);
    }
    if (queryEmbeddings.length === 0) return [];

    const scored = [];
    for (const doc of docs) {
        for (const ch of doc.chunks || []) {
            if (!ch.embedding?.length) continue;
            let maxSim = 0;
            for (const qEmb of queryEmbeddings) {
                const sim = cosineSimilarity(ch.embedding, qEmb);
                if (sim > maxSim) maxSim = sim;
            }
            scored.push({ text: ch.text, score: maxSim });
        }
    }

    scored.sort((a, b) => b.score - a.score);
    const seen = new Set();
    const result = [];
    for (const item of scored) {
        const key = item.text.slice(0, 80);
        if (seen.has(key)) continue;
        seen.add(key);
        result.push(item.text);
        if (result.length >= topK) break;
    }
    return result;
}
