import { fetchLiveNotices } from './liveDataFetcher.js';
import { retrieveChunks } from './rag.js';
import logger from './logger.js';

const TIMEOUT_MS = 6000;

function withTimeout(promise, ms) {
    return Promise.race([
        promise,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms)),
    ]);
}

/**
 * Fetches live notices and RAG chunks for prompt enrichment.
 * Returns { liveNoticesText: string, ragChunksText: string }
 */
export async function getEnrichedContext(config) {
    let liveNoticesText = '';
    let ragChunksText = '';

    const liveUrl = config?.liveDataUrl;
    if (liveUrl) {
        try {
            const notices = await withTimeout(fetchLiveNotices(liveUrl), 4000);
            if (notices?.length > 0) {
                const lines = notices.slice(0, 12).map(n =>
                    n.date ? `• ${n.date}: ${n.title}` : `• ${n.title}`
                );
                liveNoticesText = `
### Recent Notices & Events (from college website):
${lines.join('\n')}
`;
            }
        } catch (err) {
            logger.warn(`[PromptEnricher] Live data fetch failed: ${err.message}`);
        }
    }

    if (config?.ragEnabled) {
        try {
            const chunks = await withTimeout(retrieveChunks(), 5000);
            if (chunks?.length > 0) {
                ragChunksText = `
### Additional Knowledge (from documents - use this when caller asks about WiFi, password, exam dates, events, or any topic listed):
${chunks.map(c => `• ${c}`).join('\n')}
`;
            }
        } catch (err) {
            logger.warn(`[PromptEnricher] RAG retrieval failed: ${err.message}`);
        }
    }

    return { liveNoticesText, ragChunksText };
}
