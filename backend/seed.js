import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/User.js';
import { CollegeInfo } from './models/CollegeInfo.js';
import { AgentConfig } from './models/AgentConfig.js';
import { MessageTemplate } from './models/MessageTemplate.js';
import { CallLog } from './models/CallLog.js';
dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/college-voice-agent');

        // Clear existing (preserve real call logs; remove old demo records if any)
        await User.deleteMany({});
        await CollegeInfo.deleteMany({});
        await AgentConfig.deleteMany({});
        await MessageTemplate.deleteMany({});
        await CallLog.deleteMany({ callId: /^demo-/ });

        // Admin User
        await User.create({
            name: 'Super Admin',
            email: 'admin@college.com',
            password: 'admin123',
            role: 'admin'
        });

        // College Info - Real data from https://bcetodisha.ac.in/ (Feb 2026)
        await CollegeInfo.create({
            name: 'Balasore College of Engineering and Technology',
            tagline: '25 Glorious Years of Excellence (2001–2025)',
            about: 'BCET saw light in the year 2001 at Balasore, Odisha. The institute aspires to play a pivotal role in imparting technical education while inculcating in young minds a spirit of benevolence and tolerance. Managed by Fakir Mohan Educational and Charitable Trust, it is approved by AICTE, recognized by Govt. of Odisha, and affiliated to BPUT. ISO 9001:2008 certified.',
            courses: [
                { name: 'B.Tech Computer Science & Engineering', duration: '4 Years', fees: 'Contact for current fee structure', eligibility: '12th with PCM, JEE/OUAT' },
                { name: 'B.Tech Information Technology', duration: '4 Years', fees: 'Contact for current fee structure', eligibility: '12th with PCM, JEE/OUAT' },
                { name: 'B.Tech Electrical Engineering', duration: '4 Years', fees: 'Contact for current fee structure', eligibility: '12th with PCM, JEE/OUAT' },
                { name: 'B.Tech Electronics & Electrical Engg', duration: '4 Years', fees: 'Contact for current fee structure', eligibility: '12th with PCM, JEE/OUAT' },
                { name: 'B.Tech Electronics & Telecommunication', duration: '4 Years', fees: 'Contact for current fee structure', eligibility: '12th with PCM, JEE/OUAT' },
                { name: 'B.Tech Mechanical Engineering', duration: '4 Years', fees: 'Contact for current fee structure', eligibility: '12th with PCM, JEE/OUAT' },
                { name: 'B.Tech Civil Engineering', duration: '4 Years', fees: 'Contact for current fee structure', eligibility: '12th with PCM, JEE/OUAT' },
                { name: 'M.Tech', duration: '2 Years', fees: 'Contact for current fee structure', eligibility: 'B.Tech/BE in relevant branch' },
                { name: 'MBA', duration: '2 Years', fees: 'Contact for current fee structure', eligibility: 'Graduation in any stream' },
                { name: 'MCA', duration: '3 Years', fees: 'Contact for current fee structure', eligibility: 'Graduation with Mathematics' }
            ],
            facilities: [
                { name: 'Digital Classrooms', description: 'Digital classes in all classrooms with modern teaching aids' },
                { name: 'State-of-the-art Laboratories', description: 'Hi-tech labs among the best in the region' },
                { name: 'Central Library', description: 'Extensive collection of books and digital resources' },
                { name: 'Hostel', description: 'Dr. APJ Abdul Kalam Hall of Residence - Wi-Fi enabled, mess, 24/7 security' },
                { name: 'Sports Complex', description: 'Annual Sports Meet and Charisma cultural fest' }
            ],
            hostelDetails: {
                description: 'Dr. APJ Abdul Kalam Hall of Residence with Wi-Fi, mess, and secure accommodation',
                fees: 'Contact college for hostel fees'
            },
            admissionProcess: 'Admissions through JEE/OUAT for B.Tech. Visit bcetodisha.ac.in/admission.php or call admission helpline.',
            founder: 'Dr. Manmath Kumar Biswal',
            chairman: 'Dr. Manmath Kumar Biswal (Founder-Chairman)',
            director: 'Prof. (Dr.) Ratikanta Sahoo',
            website: 'bcetodisha.ac.in',
            contact: {
                email: 'principal@bcetodisha.ac.in',
                phone: '(06782) 236045, 9777938474, 9437961413',
                address: 'NH-16, Sergarh, Balasore (756060), Odisha'
            }
        });

        // Agent Config
        await AgentConfig.create({
            firstMessage: "Hello! Welcome to BCET - Balasore College of Engineering and Technology. I'm your AI admissions assistant. How can I help you today?",
            systemPrompt: 'You are an AI admissions assistant for Balasore College of Engineering and Technology (BCET), Odisha. When callers say "admission" or want to apply, you MUST ask their name, age, area, and desired course (one at a time). Otherwise answer questions about courses, fees, eligibility, hostel, and admission process. BCET is affiliated to BPUT, approved by AICTE. If a question is outside scope, say: "Please contact our admissions desk at (06782) 236045 or principal@bcetodisha.ac.in." Be warm, concise, and professional.',
            tone: 'friendly',
            language: 'English'
        });

        // Message Templates
        await MessageTemplate.create({
            name: 'Admission Enquiry Thank You',
            channel: 'email',
            subject: 'Thank you for contacting BCET - Balasore College of Engineering!',
            body: 'Hi, thank you for your enquiry regarding {{course}}. Our admissions team will get back to you shortly. Visit bcetodisha.ac.in for more info.'
        });

        console.log('🌱 Data seeded successfully!');
        process.exit();
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seedData();
