import mongoose from 'mongoose';

const admissionLeadSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    age: { type: String },
    twelfthPercentage: { type: String },
    course: { type: String },
    city: { type: String },
    phone: { type: String },
    callId: { type: String },
    source: { type: String, default: 'voice' },
}, { timestamps: true });

export const AdmissionLead = mongoose.model('AdmissionLead', admissionLeadSchema);
