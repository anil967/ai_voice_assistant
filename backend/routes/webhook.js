import express from 'express';
import { CollegeInfo } from '../models/CollegeInfo.js';
import { AgentConfig } from '../models/AgentConfig.js';
import { CallLog } from '../models/CallLog.js';
import { AdmissionLead } from '../models/AdmissionLead.js';
import { MessageTemplate } from '../models/MessageTemplate.js';
import { sendSMS } from '../utils/sms.js';
import { getEnrichedContext } from '../utils/promptEnricher.js';
import logger from '../utils/logger.js';

function extractLeadFromTranscript(text, messages, phone) {
    const t = (text || '').toLowerCase();
    const userMsgs = Array.isArray(messages)
        ? messages.filter((m) => /user|caller/.test((m.role || '').toLowerCase())).map((m) => (m.message || m.content || '').trim()).filter(Boolean)
        : [];
    const fullName = userMsgs[0] || (t.match(/(?:name is|i(?:'m| am) )([^.?!,]+)/i)?.[1]?.trim()) || '';
    const age = userMsgs[1] || (t.match(/(?:age|i(?:'m| am) )(\d+)/i)?.[1]) || '';
    const pct = userMsgs[2] || (/(\d{2,3})\s*%/.exec(t)?.[1] || /\b(\d{2,3})\s*(?:percent)/i.exec(t)?.[1]) || '';
    const course = userMsgs[3] || '';
    const city = userMsgs[4] || '';
    return {
        fullName: String(fullName || '').slice(0, 200),
        age: String(age || '').slice(0, 50),
        twelfthPercentage: String(pct || '').slice(0, 20),
        course: String(course || '').slice(0, 200),
        city: String(city || '').slice(0, 200),
        phone: phone || '',
    };
}

const router = express.Router();

// ─── Vapi Webhook Handler ─────────────────────────────────────────────────────
router.post('/vapi', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || !message.type) {
            return res.status(400).json({ error: 'Invalid webhook payload' });
        }

        logger.info(`[Vapi Webhook] Event: ${message.type}`);

        // ── Tool calls (e.g. admission flow) ─────────────────────────────────
        if (message.type === 'tool-calls') {
            const toolCallList = message.toolCallList || message.toolWithToolCallList?.map(t => ({ id: t.toolCall?.id, name: t.name, parameters: t.toolCall?.parameters || {} })) || [];
            logger.info(`[Vapi Webhook] tool-calls received: ${toolCallList.map(t => t.name).join(', ')}`);
            const results = [];
            for (const tc of toolCallList) {
                const id = tc.id || tc.toolCallId;
                const name = tc.name;
                const params = tc.parameters || {};
                if (name === 'getAdmissionQuestion') {
                    const step = Math.min(5, Math.max(1, Number(params.step) || 1));
                    const phrases = [
                        "Great! I'll take a few details for our admissions team. May I know your full name?",
                        "Thank you. May I know your age?",
                        "What is your 12th grade percentage?",
                        "Which course are you interested in?",
                        "Which city or area are you from?"
                    ];
                    const toSay = phrases[step - 1] || phrases[4];
                    results.push({ name: 'getAdmissionQuestion', toolCallId: id, result: JSON.stringify({ messageToSay: toSay, step, nextStep: step < 5 ? step + 1 : null }) });
                } else if (name === 'submitAdmissionLead') {
                    logger.info(`[Vapi Webhook] submitAdmissionLead called with params:`, JSON.stringify(params));
                    try {
                        const callId = req.body?.message?.call?.id || null;
                        const customerNumber = req.body?.message?.call?.customer?.number || null;
                        const lead = new AdmissionLead({
                            fullName: params.fullName || params.full_name || '',
                            age: params.age != null ? String(params.age) : '',
                            twelfthPercentage: params.twelfthPercentage != null ? String(params.twelfthPercentage) : (params.twelfth_percentage != null ? String(params.twelfth_percentage) : ''),
                            course: params.course || '',
                            city: params.city || '',
                            phone: customerNumber || params.phone || '',
                            callId: callId || params.callId || '',
                            source: 'voice',
                        });
                        await lead.save();
                        logger.info(`Admission lead saved: ${lead.fullName} (${lead._id})`);
                        results.push({ name: 'submitAdmissionLead', toolCallId: id, result: JSON.stringify({ success: true, message: 'Lead saved. Say: Thank you. Your details have been recorded and our admission team will contact you soon.' }) });
                    } catch (err) {
                        logger.error('Admission lead save error:', err.message);
                        results.push({ name: 'submitAdmissionLead', toolCallId: id, result: JSON.stringify({ success: false, message: 'Thank you. Your details have been noted. Our team will contact you soon.' }) });
                    }
                } else {
                    results.push({ name: name || 'unknown', toolCallId: id, result: JSON.stringify({ error: 'Unknown tool' }) });
                }
            }
            return res.status(200).json({ results });
        }

        switch (message.type) {
            // ── Dynamic Prompt Injection ─────────────────────────────────────
            case 'assistant-request': {
                const college = await CollegeInfo.findOne();
                const config = await AgentConfig.findOne();

                if (!college || !config) {
                    return res.status(500).json({ error: 'College config not found' });
                }

                // Build a rich, dynamic system prompt using college DB data
                const courseList = college.courses
                    .map(c => `- ${c.name}: ${c.fees}, Duration: ${c.duration}, Eligibility: ${c.eligibility}`)
                    .join('\n');

                const leadership = [college.founder, college.chairman, college.director].filter(Boolean).join('. ');
                const shortName = (college.name.includes('Balasore') || college.name === 'BCET') ? 'BCET' : college.name;
                const collegeEmail = college.contact?.email || 'admissions@bcet.edu';
                const systemPromptText = (config.systemPrompt || '')
                    .replace(/\bSkyline Institute of Technology\b/gi, college.name)
                    .replace(/\bSkyline\b/gi, college.name)
                    .replace(/\bskyline\.edu\b/gi, collegeEmail);
                const founderBlock = leadership ? `
### IMPORTANT - Founder & Leadership (you MUST use this when asked):
"BCT" and "BCET" both refer to this college (callers often say BCT). When the caller asks "who is the founder", "founder of BCT", "founder of BCET", "who started ${shortName}", "founder of the college", "chairman", "director", or similar, you MUST answer from the data below. Do NOT say "I couldn't find information" or "Let me connect you to admissions". Reply with: "Based on our college information, the founder is ${college.founder || 'not listed'}. ${college.chairman ? 'Chairman: ' + college.chairman + '.' : ''} ${college.director ? 'Director: ' + college.director + '.' : ''}"
Founder/Leadership data: ${leadership}
` : '';

                const extraContext = await getEnrichedContext(config);
                const admissionBlock = `
### ADMISSION FLOW (OVERRIDES EVERYTHING BELOW — use the tools):
When the caller says "admission", "all admission", "I want admission", "assist me on admission", "admission enquiry", "take admission", "how to apply" — do NOT give OJEE/website/phone. Use getAdmissionQuestion: step 1=name, 2=age, 3=12th grade percentage, 4=course, 5=city. Say exactly the "messageToSay" from each result. After you have all 5 answers, call submitAdmissionLead with fullName, age, twelfthPercentage, course, city (the values the caller gave). Then say: "Thank you. Your details have been recorded and our admission team will contact you soon."
`;
                const dynamicPrompt = `
${admissionBlock}
### RULE (with admission exception):
For general questions: answer ONLY from this system prompt. No external knowledge.
When they say admission: call getAdmissionQuestion(step: 1) and say the returned messageToSay. Do NOT reply with OJEE/website/phone. If unsure about other topics, offer to connect to admissions.
---
${systemPromptText}

### Current College Information:
College Name: ${college.name}
About: ${(college.about && !college.about.includes('### RULE') && !college.about.includes('Answer ONLY'))
                    ? college.about
                    : 'BCET is a premier engineering college in Balasore, Odisha, affiliated to BPUT and approved by AICTE.'}
${founderBlock}

### Courses and Fees:
${courseList}

### Contact:
Phone: ${(college.contact?.phone && !college.contact.phone.includes('99999')) ? college.contact.phone : '9777938474, 9437961413, (06782) 236045'}
Email: ${(college.contact?.email && !college.contact.email.includes('skyline')) ? college.contact.email : 'principal@bcetodisha.ac.in'}
Address: ${college.contact?.address || 'NH-16, Sergarh, Balasore (756060), Odisha'}
${extraContext.liveNoticesText || ''}
${extraContext.ragChunksText || ''}

${config.fallbackMessage ? `### If unsure: ${config.fallbackMessage}` : ''}
                `.trim();

                const firstMsg = config.firstMessage || `Hello! Welcome to ${college.name}. I am your AI admissions assistant. How can I help you today?`;
                const endMsg = config.endCallMessage || `Thank you for contacting ${college.name}. If you have any questions, feel free to call us anytime. Have a great day!`;
                const admissionTool = {
                    type: 'function',
                    function: {
                        name: 'getAdmissionQuestion',
                        description: 'Get the exact phrase to say for admission flow. Step 1=name, 2=age, 3=12th%, 4=course, 5=city. After step 5, call submitAdmissionLead with all 5 answers, then say thank you.',
                        parameters: {
                            type: 'object',
                            properties: { step: { type: 'number', description: '1=name, 2=age, 3=12th%, 4=course, 5=city' } },
                            required: ['step'],
                        },
                    },
                };
                const submitLeadTool = {
                    type: 'function',
                    function: {
                        name: 'submitAdmissionLead',
                        description: 'Call this AFTER you have collected all 5 details: full name, age, 12th grade percentage, course, city. Saves the lead. Call once with all parameters.',
                        parameters: {
                            type: 'object',
                            properties: {
                                fullName: { type: 'string', description: 'Caller full name' },
                                age: { type: 'string', description: 'Age or class' },
                                twelfthPercentage: { type: 'string', description: '12th grade percentage' },
                                course: { type: 'string', description: 'Course interested in' },
                                city: { type: 'string', description: 'City or area' },
                            },
                            required: ['fullName', 'age', 'twelfthPercentage', 'course', 'city'],
                        },
                    },
                };
                return res.status(200).json({
                    assistant: {
                        name: `${college.name} AI Assistant`,
                        firstMessage: firstMsg,
                        endCallMessage: endMsg,
                        model: {
                            provider: 'openai',
                            model: 'gpt-3.5-turbo',
                            messages: [{ role: 'system', content: dynamicPrompt }],
                            temperature: 0.7,
                            tools: [admissionTool, submitLeadTool],
                        },
                        voice: {
                            provider: 'cartesia',
                            voiceId: 'f786b574-daa5-4673-aa0c-cbe3e8534c02',
                        },
                        recordingEnabled: false,
                        endCallFunctionEnabled: true,
                    },
                });
            }

            // ── Post-Call Report: Log & Automate ────────────────────────────
            case 'end-of-call-report': {
                const { call, artifact, analysis } = message;

                const startedAt = new Date(call?.startedAt || Date.now());
                const endedAt = new Date(call?.endedAt || Date.now());
                const duration = Math.round((endedAt - startedAt) / 1000);
                const custNum = call?.customer?.number || '';
                const isPhone = custNum && /^\+?[\d\s()-]{10,}$/.test(custNum.replace(/\s/g, ''));
                const callType = isPhone ? 'Inbound' : 'Web';
                const rawReason = message.endedReason || call?.endedReason || '';
                const endedReason = rawReason ? rawReason.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Customer Ended Call';

                const callLog = new CallLog({
                    callId: call?.id || `sim-${Date.now()}`,
                    callerNumber: custNum || (callType === 'Web' ? 'Web' : 'Unknown'),
                    callType,
                    endedReason,
                    startTime: startedAt,
                    endTime: endedAt,
                    duration,
                    transcript: (artifact?.transcript || []).map(t => ({
                        role: t.role,
                        content: t.message,
                        timestamp: new Date()
                    })),
                    summary: analysis?.summary || '',
                    enquiryType: analysis?.structuredData?.enquiryType || 'general',
                    outcome: 'answered',
                });

                await callLog.save();
                logger.info(`✅ Call logged: ${callLog.callId} (${duration}s)`);

                // ── Fallback: save admission lead from transcript if tool wasn't called ─
                const transcript = artifact?.transcript || artifact?.messages || [];
                const transcriptText = Array.isArray(transcript)
                    ? transcript.map((t) => (typeof t === 'string' ? t : t.message || t.content || '')).join(' ')
                    : String(transcript);
                const summary = (analysis?.summary || '').toLowerCase();
                const isAdmissionCall = /admission|admit|apply|course|enrol/.test(summary + transcriptText);
                if (isAdmissionCall) {
                    try {
                        const custNum = call?.customer?.number || '';
                        const existing = await AdmissionLead.findOne({ callId: call?.id });
                        if (!existing) {
                            const extracted = extractLeadFromTranscript(transcriptText, transcript, custNum);
                            if (extracted.fullName && extracted.fullName.length > 1) {
                                const fallbackLead = new AdmissionLead({
                                    ...extracted,
                                    callId: call?.id || null,
                                    source: 'voice_fallback',
                                });
                                await fallbackLead.save();
                                logger.info(`Admission lead saved from transcript: ${fallbackLead.fullName || fallbackLead.phone} (${fallbackLead._id})`);
                            }
                        }
                    } catch (e) {
                        logger.warn('Fallback lead extract failed:', e.message);
                    }
                }

                // ── Post-Call SMS (no email) ──────────────────────────────────
                const phone = custNum || call?.customer?.number || '';
                const hasPhone = phone && /^\+?[\d\s()-]{10,}$/.test(phone.replace(/\s/g, ''));
                if (hasPhone) {
                    const college = await CollegeInfo.findOne();
                    const collegeName = college?.name || 'BCET';
                    const website = college?.website || process.env.WEBSITE_URL || 'bcetodisha.ac.in';
                    const summary = (analysis?.summary || 'You enquired about our programs.').slice(0, 80);
                    const body = `Thanks for calling ${collegeName}! ${summary} Visit ${website} for more info.`;
                    const sent = await sendSMS(phone, body);
                    if (sent) {
                        callLog.automationSent.sms = true;
                        await callLog.save();
                    }
                }

                return res.status(200).json({ status: 'logged' });
            }

            default:
                return res.status(200).json({ status: 'ignored' });
        }
    } catch (error) {
        logger.error(`Webhook Error: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
});

export default router;
