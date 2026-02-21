import mongoose from 'mongoose';

const callLogSchema = new mongoose.Schema({
    callId: { type: String, required: true, unique: true },
    callerNumber: { type: String },
    callType: { type: String, enum: ['Inbound', 'Web'], default: 'Web' },
    endedReason: { type: String, default: 'Customer Ended Call' },
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
    duration: { type: Number }, // In seconds
    transcript: [{
        role: { type: String, enum: ['user', 'assistant', 'system'] },
        content: { type: String },
        timestamp: { type: Date, default: Date.now }
    }],
    summary: { type: String },
    enquiryType: { type: String }, // e.g. "admissions", "fees", "hostel"
    outcome: { type: String, enum: ['answered', 'escalated', 'abandoned'], default: 'answered' },
    aiResponseQuality: { type: Number, min: 1, max: 5 },
    automationSent: {
        email: { type: Boolean, default: false },
        sms: { type: Boolean, default: false }
    }
}, { timestamps: true });

export const CallLog = mongoose.model('CallLog', callLogSchema);
