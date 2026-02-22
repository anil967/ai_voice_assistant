import mongoose from 'mongoose';

const collegeInfoSchema = new mongoose.Schema({
    name: { type: String, required: true },
    tagline: { type: String },
    logo: { type: String }, // Base64 or URL
    about: { type: String },
    courses: [{
        name: { type: String, required: true },
        duration: { type: String },
        fees: { type: String },
        eligibility: { type: String },
        description: { type: String }
    }],
    facilities: [{
        name: { type: String },
        description: { type: String }
    }],
    hostelDetails: {
        description: { type: String },
        fees: { type: String }
    },
    admissionProcess: { type: String },
    founder: { type: String },
    chairman: { type: String },
    director: { type: String },
    website: { type: String },
    contact: {
        email: { type: String },
        phone: { type: String },
        address: { type: String }
    },
    lastUpdated: { type: Date, default: Date.now }
});

export const CollegeInfo = mongoose.model('CollegeInfo', collegeInfoSchema);
