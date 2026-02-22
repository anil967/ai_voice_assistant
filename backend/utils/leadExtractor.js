/**
 * Extract admission lead fields from conversation transcript text and/or message array.
 * Used by webhook (end-of-call-report) and by sync-from-vapi (Vapi API call detail).
 */
export function extractLeadFromTranscript(text, messages, phone) {
    const t = (text || '').toLowerCase();
    let userMsgs = [];
    if (Array.isArray(messages)) {
        userMsgs = messages
            .filter((m) => /user|caller|customer/.test((m.role || '').toLowerCase()))
            .map((m) => (m.message || m.content || m.transcript || '').trim())
            .filter(Boolean);
    }
    if (userMsgs.length === 0 && text) {
        const userBlocks = text.match(/(?:user|caller):\s*([^\n]+)/gi) || text.match(/Customer:\s*([^\n]+)/gi) || [];
        userMsgs = userBlocks.map((b) => b.replace(/^(user|caller|customer):\s*/i, '').trim()).filter(Boolean);
    }
    const fullName = userMsgs[0] || (t.match(/(?:my name is|i(?:'m| am) )([^.?!,\n]+)/i)?.[1]?.trim()) || '';
    const age = userMsgs[1] || (t.match(/(?:age|i(?:'m| am) )(\d+)/i)?.[1]) || '';
    const pct = userMsgs[2] || (/(\d{2,3})\s*%/.exec(t)?.[1] || /\b(\d{2,3})\s*(?:percent)/i.exec(t)?.[1]) || '';
    const course = userMsgs[3] || (t.match(/(?:course|interested in|want)\s*(?:is|:)?\s*([^.?!,\n]+)/i)?.[1]?.trim()) || '';
    const city = userMsgs[4] || (t.match(/(?:from|city|area|i am from)\s*(?:is|:)?\s*([^.?!,\n]+)/i)?.[1]?.trim()) || '';
    return {
        fullName: String(fullName || '').slice(0, 200),
        age: String(age || '').slice(0, 50),
        twelfthPercentage: String(pct || '').slice(0, 20),
        course: String(course || '').slice(0, 200),
        city: String(city || '').slice(0, 200),
        phone: phone || '',
    };
}

/**
 * Build transcript text and messages array from Vapi call object (GET /call/:id response).
 */
export function getTranscriptFromVapiCall(call) {
    const artifact = call?.artifact || call?.artifacts;
    const transcript = artifact?.transcript || artifact?.messages || call?.transcript;
    let transcriptText = '';
    let messages = [];
    if (typeof transcript === 'string') {
        transcriptText = transcript;
    } else if (Array.isArray(transcript)) {
        messages = transcript;
        transcriptText = transcript.map((t) => (typeof t === 'string' ? t : t.message || t.content || t.transcript || '')).join(' ');
    }
    const summary = (call?.analysis?.summary || '').toLowerCase();
    const fullText = summary + ' ' + transcriptText;
    return { transcriptText: fullText, messages };
}
