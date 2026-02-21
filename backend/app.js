/**
 * Express app - used by both server.js (local) and Vercel serverless
 */
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

// Connect to MongoDB (runs on module load)
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/college-voice-agent')
    .then(() => logger.info('✅ Connected to MongoDB'))
    .catch((err) => logger.error(`❌ MongoDB connection error: ${err.message}`));

const app = express();
const PORT = process.env.PORT || 5000;

// Trust the first proxy (Vercel edge / reverse proxy).
// This makes req.ip use X-Forwarded-For correctly and
// satisfies express-rate-limit's ERR_ERL_FORWARDED_HEADER check.
app.set('trust proxy', 1);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json({ limit: '2mb' }));

app.use(morgan('combined', {
    stream: { write: (msg) => logger.info(msg.trim()) }
}));

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { error: 'Too many requests, please try again after 15 minutes.' },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => req.ip,
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: 'Too many login attempts. Please wait 15 minutes.' },
    keyGenerator: (req) => req.ip,
});

app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);

app.get('/api/health', (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        db: dbStatus,
        uptime: Math.floor(process.uptime()) + 's'
    });
});

app.get('/', (req, res) => {
    res.json({ message: 'College AI Voice Agent API v1.0' });
});

app.use('/api/auth', authRoutes);
app.use('/api/college', collegeRoutes);
app.use('/api/agent', agentRoutes);
app.use('/api/calls', callRoutes);
app.use('/api/webhook', webhookRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/vapi', vapiRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/knowledge', knowledgeRoutes);

app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

app.use((err, req, res, next) => {
    logger.error(err.stack);
    res.status(err.status || 500).json({
        error: process.env.NODE_ENV === 'production' ? 'Something went wrong!' : err.message
    });
});

export default app;
export { PORT };
