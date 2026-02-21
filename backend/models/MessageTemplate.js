import mongoose from 'mongoose';

const messageTemplateSchema = new mongoose.Schema({
    name: { type: String, required: true }, // e.g. "Thank You Email"
    channel: { type: String, enum: ['email', 'sms', 'whatsapp'], required: true },
    subject: { type: String },
    body: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    variables: [String] // List of allowed variables like {{name}}, {{course}}
}, { timestamps: true });

export const MessageTemplate = mongoose.model('MessageTemplate', messageTemplateSchema);
