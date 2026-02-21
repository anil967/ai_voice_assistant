import mongoose from 'mongoose';

const agentConfigSchema = new mongoose.Schema({
    enabled: { type: Boolean, default: true },
    firstMessage: { type: String, default: "Hello! Welcome to BCET. I'm your AI admissions assistant. How can I help you today?" },
    endCallMessage: { type: String }, // Message spoken when ending the call (e.g. "Thank you for contacting BCET. Have a great day!")
    systemPrompt: { type: String, required: true },
    tone: { type: String, enum: ['formal', 'friendly'], default: 'formal' },
    language: { type: String, enum: ['English', 'Hindi', 'Both'], default: 'English' },
    fallbackMessage: { type: String, default: "I'm sorry, I couldn't find information on that. Let me connect you with our admissions team." },
    escalationRules: [{
        condition: { type: String }, // e.g. "complaint", "financial_aid"
        action: { type: String } // e.g. "transfer_to_human"
    }],
    vapiAssistantId: { type: String },
    liveDataUrl: { type: String }, // e.g. https://bcetodisha.ac.in/notice.php - fetches notices for prompt
    ragEnabled: { type: Boolean, default: false },
    lastModified: { type: Date, default: Date.now }
});

export const AgentConfig = mongoose.model('AgentConfig', agentConfigSchema);
