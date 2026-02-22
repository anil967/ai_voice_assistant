import axios from 'axios';
import { CollegeInfo } from '../models/CollegeInfo.js';
import { AgentConfig } from '../models/AgentConfig.js';
import logger from './logger.js';

const VAPI_API = 'https://api.vapi.ai';

/**
 * Builds a rich, dynamic system prompt from Admin config + MongoDB college database.
 * @param {Object} extraContext - Optional { liveNoticesText, ragChunksText } from getEnrichedContext
 */
const buildSystemPrompt = (college, config, extraContext = {}) => {
    const courseList = (college.courses || [])
        .map(c =>
            `• ${c.name}: Fees — ${c.fees || 'N/A'}, Duration — ${c.duration || 'N/A'}, Eligibility — ${c.eligibility || 'N/A'}${c.description ? `. ${c.description}` : ''}`
        )
        .join('\n');

    const facilityList = (college.facilities || [])
        .map(f => `• ${f.name}: ${f.description || ''}`)
        .join('\n');

    const leadership = [college.founder, college.chairman, college.director].filter(Boolean).join('. ');
    const shortName = (college.name.includes('Balasore') || college.name === 'BCET') ? 'BCET' : college.name;
    const collegeEmail = college.contact?.email || 'admissions@bcet.edu';
    let basePrompt = config?.systemPrompt || `You are an AI admissions assistant for ${college.name}. Be warm, concise, and professional.`;
    basePrompt = basePrompt
        .replace(/\bSkyline Institute of Technology\b/gi, college.name)
        .replace(/\bSkyline\b/gi, college.name)
        .replace(/\bskyline\.edu\b/gi, collegeEmail);
    const founderBlock = leadership ? `
### IMPORTANT - Founder & Leadership (you MUST use this when asked):
"BCT" and "BCET" both refer to this college (callers often say BCT). When the caller asks "who is the founder", "founder of BCT", "founder of BCET", "who started ${shortName}", "founder of the college", "chairman", "director", or similar, you MUST answer from the data below. Do NOT say "I couldn't find information" or "Let me connect you to admissions". Reply with: "Based on our college information, the founder is ${college.founder || 'not listed'}. ${college.chairman ? 'Chairman: ' + college.chairman + '.' : ''} ${college.director ? 'Director: ' + college.director + '.' : ''}"
Founder/Leadership data: ${leadership}
` : '';
    const admissionBlock = `
### ADMISSION FLOW (OVERRIDES EVERYTHING BELOW):
If the caller says "admission", "all admission", "I want admission", "admission enquiry", "take admission", "how to apply", "course details" — IGNORE any instruction that says "provide phone/website for admissions". Do NOT give OJEE/website/phone yet. Instead, say exactly: "Great! I'll take a few details for our admissions team. May I know your full name?" Then ask ONE BY ONE: age or class, then city/area, then which course. After all 4, repeat back and confirm. Only then you may give website/phone if they ask.
`;
    return `${admissionBlock}
### RULE (with admission exception):
For general questions: answer ONLY from this system prompt. No external knowledge.
When they say admission (or "all admission"): ASK name, age, area, course first — do NOT reply with OJEE/website/phone. If unsure about other topics, offer to connect to admissions.
---
${basePrompt}

### Current College Information:
College Name: ${college.name}
About: ${(college.about && !college.about.includes('### RULE') && !college.about.includes('Answer ONLY'))
        ? college.about
        : (college.name?.includes('BCET') ? 'BCET is a premier engineering college in Balasore, Odisha, affiliated to BPUT and approved by AICTE.' : 'A premier institution of higher learning.')}
Tagline: ${college.tagline || ''}
${founderBlock}

### Courses & Fees:
${courseList || 'Contact us for details.'}

### Campus Facilities:
${facilityList || 'World-class facilities available.'}

### Contact:
Phone: ${(college.contact?.phone && !college.contact.phone.includes('99999')) ? college.contact.phone : '9777938474, 9437961413, (06782) 236045'}
Email: ${(college.contact?.email && !college.contact.email.includes('skyline')) ? college.contact.email : 'principal@bcetodisha.ac.in'}
Address: ${college.contact?.address || 'NH-16, Sergarh, Balasore (756060), Odisha'}
${extraContext.liveNoticesText || ''}
${extraContext.ragChunksText || ''}

${config?.fallbackMessage ? `### If unsure: ${config.fallbackMessage}` : ''}
Today's date: ${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`.trim();
};

/**
 * Syncs the current MongoDB college data to the Vapi assistant.
 * Updates the assistant's system prompt with live data.
 */
export const syncVapiAssistant = async () => {
    const privateKey = process.env.VAPI_PRIVATE_KEY;
    const assistantId = process.env.VAPI_ASSISTANT_ID;

    if (!privateKey || !assistantId) {
        logger.warn('⚠️  Vapi sync skipped: VAPI_PRIVATE_KEY or VAPI_ASSISTANT_ID not set');
        return { success: false, message: 'Vapi credentials not configured' };
    }

    try {
        const college = await CollegeInfo.findOne();
        const config = await AgentConfig.findOne();

        if (!college) {
            return { success: false, message: 'No college info found in database' };
        }

        const { getEnrichedContext } = await import('./promptEnricher.js');
        const extraContext = await getEnrichedContext(config);
        const systemPrompt = buildSystemPrompt(college, config, extraContext);

        // Update the Vapi assistant via the Management API
        // Only update prompt/model - preserve existing voice from Vapi dashboard
        const endCallMsg = config?.endCallMessage || `Thank you for contacting ${college.name}. If you have any questions, feel free to call us anytime. Have a great day!`;
        await axios.patch(
            `${VAPI_API}/assistant/${assistantId}`,
            {
                model: {
                    provider: 'openai',
                    model: 'gpt-3.5-turbo',
                    messages: [{ role: 'system', content: systemPrompt }],
                    temperature: 0.7,
                    maxTokens: 500,
                },
                firstMessage: config?.firstMessage || `Hello! Welcome to ${college.name}. I'm your AI admissions assistant. How can I help you today?`,
                endCallMessage: endCallMsg,
                name: `${college.name} AI Assistant`,
                endCallFunctionEnabled: true,
                recordingEnabled: false,
            },
            {
                headers: {
                    Authorization: `Bearer ${privateKey}`,
                    'Content-Type': 'application/json',
                }
            }
        );

        logger.info(`✅ Vapi assistant synced with latest college data (${college.name})`);
        return { success: true, message: `Assistant updated with data from "${college.name}"` };

    } catch (err) {
        const msg = err.response?.data?.message || err.message;
        logger.error(`❌ Vapi sync error: ${msg}`);
        return { success: false, message: msg };
    }
};
