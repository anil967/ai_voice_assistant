/**
 * Extract admission lead fields from conversation transcript.
 * In admission flow: 1st user msg = admission intent, 2nd = name, 3rd = age, 4th = 12th%, 5th = course, 6th = city.
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
    const isAdmissionIntent = (s) => /admission|inquir|apply|enrol|want to|interested/.test((s || '').toLowerCase()) || (s || '').includes('?');
    const nameFrom0 = userMsgs[0];
    const fullName = (userMsgs[1] || (!isAdmissionIntent(nameFrom0) && nameFrom0) || '').trim();
    const age = (userMsgs[2] || (t.match(/(?:age|i(?:'m| am) )(\d+)/i)?.[1]) || '').trim();
    const pct = userMsgs[3] || (/(\d{2,3})\s*%/.exec(t)?.[1] || /\b(\d{2,3})\s*(?:percent)/i.exec(t)?.[1]) || '';
    const course = (userMsgs[4] || (t.match(/(?:course|interested in|want)\s*(?:is|:)?\s*([^.?!,\n]+)/i)?.[1]?.trim()) || '').trim();
    const city = (userMsgs[5] || (t.match(/(?:from|city|area|i am from)\s*(?:is|:)?\s*([^.?!,\n]+)/i)?.[1]?.trim()) || '').trim();
    return {
        fullName: String(fullName || '').slice(0, 200),
        age: String(age || '').slice(0, 50),
        twelfthPercentage: String(pct || '').slice(0, 20),
        course: String(course || '').slice(0, 200),
        city: String(city || '').slice(0, 200),
        phone: phone || '',
    };
}

/** Format messages array as "Assistant: ...\nUser: ..." transcript string. */
export function formatTranscriptAsVapi(messages) {
    if (!Array.isArray(messages) || messages.length === 0) return '';
    return messages
        .map((m) => {
            const role = (m.role || '').toLowerCase();
            const label = /assistant|agent/.test(role) ? 'Assistant' : /user|caller|customer/.test(role) ? 'User' : role || 'User';
            const msg = (m.message || m.content || m.transcript || '').trim();
            return msg ? `${label}: ${msg}` : '';
        })
        .filter(Boolean)
        .join('\n\n');
}

/**
 * Build transcript text and messages array from Vapi call object (GET /call/:id response).
 * Returns transcriptText (for extraction), messages (array), and transcriptDisplay (Assistant: / User: format).
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
    const transcriptDisplay = formatTranscriptAsVapi(messages) || transcriptText;
    return { transcriptText: fullText, messages, transcriptDisplay };
}
