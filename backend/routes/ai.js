import express from 'express';
import { CollegeInfo } from '../models/CollegeInfo.js';

const router = express.Router();

// Fallback response for missing knowledge
const fallbackResponse = "I'm not sure about that. Please contact our admissions desk at +91 0123456789 or visit our campus for more details.";

/**
 * Simple Keyword Matcher for Local AI Mode
 * Matches user query against CollegeInfo database fields
 */
router.post('/query', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: 'Missing text query' });

        const query = text.toLowerCase();
        const info = await CollegeInfo.findOne();

        if (!info) {
            return res.json({ response: "I don't have enough information about the college yet." });
        }

        // 1. Check for Courses
        if (query.includes('course') || query.includes('program') || query.includes('degree') || query.includes('study')) {
            const courseList = info.courses.map(c => `${c.name} (${c.duration})`).join(', ');
            return res.json({ response: `We offer several programs including: ${courseList}. Which one would you like to know more about?` });
        }

        // 2. Check for Fees
        if (query.includes('fee') || query.includes('cost') || query.includes('price') || query.includes('payment')) {
            const feeDetails = info.courses.map(c => `${c.name}: ${c.fees}`).join('. ');
            return res.json({ response: `Our current fee structure is: ${feeDetails}. Financial aid is also available for meritorious students.` });
        }

        // 3. Check for Hostel/Facilities
        if (query.includes('hostel') || query.includes('room') || query.includes('facility') || query.includes('campus') || query.includes('lab') || query.includes('library')) {
            const facilityList = (info.facilities || []).map(f => f.name || f.description || '').filter(Boolean).join(', ');
            const hostelInfo = info.hostelDetails ? `${info.hostelDetails.description || ''}${info.hostelDetails.fees ? ` Fees: ${info.hostelDetails.fees}.` : ''}`.trim() : '';
            const facilitiesText = facilityList || 'Digital labs, library, sports complex';
            return res.json({ response: `Our campus features: ${facilitiesText}.${hostelInfo ? ` Hostel: ${hostelInfo}` : ''} We provide secure hostels for both boys and girls with 24/7 security.` });
        }

        // 4. Check for Admission/Contact
        if (query.includes('admission') || query.includes('apply') || query.includes('join') || query.includes('process') || query.includes('contact')) {
            const contact = info.contact || {};
            return res.json({ response: `The admission process for 2026 is currently open! You can reach us at ${contact.email || 'admissions@college.edu'} or call ${contact.phone || '+91 0123456789'}. Our address is: ${contact.address || 'Visit our campus'}.` });
        }

        // 5. General About
        if (query.includes('tell me about') || query.includes('who are you') || query.includes('bcet') || query.includes('balasore') || query.includes('college')) {
            return res.json({ response: `${info.about} ${info.tagline}` });
        }

        // Default greeting/fallback
        if (query.includes('hi') || query.includes('hello') || query.includes('hey')) {
            return res.json({ response: `Hello! I am your AI assistant for ${info.name}. How can I help you today with information about courses, fees, or admissions?` });
        }

        res.json({ response: fallbackResponse });

    } catch (err) {
        console.error('Mock AI Error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
