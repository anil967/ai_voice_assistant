import express from 'express';
import { CollegeInfo } from '../models/CollegeInfo.js';
import { AgentConfig } from '../models/AgentConfig.js';
import { CallLog } from '../models/CallLog.js';
import { MessageTemplate } from '../models/MessageTemplate.js';
import { sendFollowUpEmail } from '../utils/email.js';
import { getEnrichedContext } from '../utils/promptEnricher.js';
import logger from '../utils/logger.js';

const router = express.Router();

// ─── Vapi Webhook Handler ─────────────────────────────────────────────────────
router.post('/vapi', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message || !message.type) {
            return res.status(400).json({ error: 'Invalid webhook payload' });
        }

        logger.info(`[Vapi Webhook] Event: ${message.type}`);

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
                const dynamicPrompt = `
### RULE: Answer ONLY from this system prompt
When the customer asks any question, answer ONLY using the information provided in this system prompt. Do not use external or general knowledge. If the answer is here, use it; if not, say you don't have that information and offer to connect them to the admissions team.

---
${systemPromptText}

### Current College Information:
College Name: ${college.name}
About: ${college.about}
${founderBlock}

### Courses and Fees:
${courseList}

### Contact:
Phone: ${college.contact?.phone || 'Not set'}
Email: ${college.contact?.email || 'Not set'}
Address: ${college.contact?.address || 'Not set'}
${extraContext.liveNoticesText || ''}
${extraContext.ragChunksText || ''}

${config.fallbackMessage ? `### If unsure: ${config.fallbackMessage}` : ''}
                `.trim();

                const firstMsg = config.firstMessage || `Hello! Welcome to ${college.name}. I am your AI admissions assistant. How can I help you today?`;
                const endMsg = config.endCallMessage || `Thank you for contacting ${college.name}. If you have any questions, feel free to call us anytime. Have a great day!`;
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

                // ── Post-Call Email Automation ──────────────────────────────
                const activeTemplate = await MessageTemplate.findOne({ enabled: true, channel: 'email' });
                if (activeTemplate && call?.customer?.email) {
                    const college = await CollegeInfo.findOne();
                    const sent = await sendFollowUpEmail(
                        call.customer.email,
                        college?.name || 'BCET',
                        analysis?.summary
                    );
                    if (sent) {
                        callLog.automationSent.email = true;
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
