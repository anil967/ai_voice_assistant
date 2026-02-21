import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

import authRoutes from './routes/auth.js';
import collegeRoutes from './routes/college.js';
import agentRoutes from './routes/agent.js';
import callRoutes from './routes/calls.js';
import webhookRoutes from './routes/webhook.js';
import aiRoutes from './routes/ai.js';
import vapiRoutes from './routes/vapi.js';
import templateRoutes from './routes/templates.js';
import knowledgeRoutes from './routes/knowledge.js';
import logger from './utils/logger.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Security & Performance Middleware ───────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json({ limit: '2mb' }));

// ─── Logging ─────────────────────────────────────────────────────────────────
app.use(morgan('combined', {
    stream: { write: (msg) => logger.info(msg.trim()) }
}));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    message: { error: 'Too many requests, please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10, // Extra strict for login
    message: { error: 'Too many login attempts. Please wait 15 minutes.' }
});

app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        db: dbStatus,
        uptime: Math.floor(process.uptime()) + 's'
    });
});

// ─── Root ─────────────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
    res.json({ message: 'College AI Voice Agent API v1.0' });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/college', collegeRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/calls', callRoutes);
app.use('/api/webhook', webhookRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/vapi', vapiRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/knowledge', knowledgeRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production' ? 'Something went wrong!' : err.message
    });
});

// ─── Database & Start ────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/college-voice-agent')
    .then(() => {
        logger.info('✅ Connected to MongoDB');
        app.listen(PORT, () => {
            logger.info(`🚀 Server running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        logger.error(`❌ MongoDB connection error: ${err.message}`);
        process.exit(1);
    });
