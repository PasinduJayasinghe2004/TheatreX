// ============================================================================
// Chatbot Controller — Gemini Flash + Conversation Memory
// ============================================================================
// Uses Google Gemini 2.0 Flash (free tier) for AI-powered responses
// Stores conversation history in PostgreSQL for multi-turn context
// ============================================================================

import { GoogleGenerativeAI } from '@google/generative-ai';
import { pool } from '../config/database.js';

// ─── Initialise Gemini ────────────────────────────────────

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const SYSTEM_PROMPT = `You are TheatreX Assistant — a helpful, concise AI for a hospital operating-theatre management system called TheatreX.

WHAT THEATREX DOES:
• Real-time operating theatre scheduling & status tracking
• Surgery management (scheduling, status updates, completion tracking)
• Staff management (surgeons, nurses, anaesthetists, technicians)
• Patient records & pre-op/post-op workflows
• Dashboard analytics & utilisation reports
• Emergency surgery booking with conflict detection
• Notification system for reminders & alerts

YOUR ROLE:
- Answer questions about how to use TheatreX features
- Help users understand surgery statuses, theatre availability, and scheduling
- Provide guidance on navigation (mention page names they can visit)
- Give brief, accurate, friendly answers
- Use markdown bold (**text**) for emphasis and bullet points for lists
- When referring to pages, format as links: [Page Name](/route)
- Keep answers under 150 words unless the user asks for detail
- If you don't know something specific to their hospital data, say so honestly
- Never make up patient names, surgery details, or statistics
- You are NOT a medical advisor — do not give clinical/medical advice

AVAILABLE PAGES (use these in navigation suggestions):
- [Dashboard](/dashboard) — Overview & stats
- [Surgeries](/surgeries) — All surgeries list
- [New Surgery](/surgeries/new) — Schedule a surgery
- [Theatres](/theatres) — Theatre management
- [Live Status](/live-status) — Real-time theatre status
- [Calendar](/calendar) — Surgery calendar view
- [Analytics](/analytics) — Reports & charts
- [Patients](/patients) — Patient records
- [Surgeons](/staff/surgeons) — Surgeon directory
- [Nurses](/staff/nurses) — Nursing staff
- [Notifications](/notifications) — Alerts & reminders
- [Profile](/profile) — User profile settings

USER CONTEXT:
- User name: {{userName}}
- User role: {{userRole}}

Tailor responses to the user's role when relevant (e.g. surgeons care about their schedule, nurses about assignments, admins about utilisation).`;

// ─── Ensure chat_messages table exists ────────────────────

const ensureTable = async () => {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS chat_messages (
            id          SERIAL PRIMARY KEY,
            user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            role        VARCHAR(10) NOT NULL CHECK (role IN ('user','model')),
            content     TEXT NOT NULL,
            created_at  TIMESTAMPTZ DEFAULT NOW()
        )
    `);
    await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_chat_messages_user
        ON chat_messages(user_id, created_at DESC)
    `);
};

let tableReady = false;

async function initTable() {
    if (tableReady) return;
    try {
        await ensureTable();
        tableReady = true;
    } catch (err) {
        console.error('Chat table init error:', err.message);
    }
}

// ─── Helpers ──────────────────────────────────────────────

async function getRecentHistory(userId, limit = 20) {
    const { rows } = await pool.query(
        `SELECT role, content FROM chat_messages
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT $2`,
        [userId, limit]
    );
    // Rows come newest-first, reverse to chronological
    return rows.reverse();
}

async function saveMessage(userId, role, content) {
    await pool.query(
        `INSERT INTO chat_messages (user_id, role, content)
         VALUES ($1, $2, $3)`,
        [userId, role, content]
    );
}

// ─── Controller: Send Message ─────────────────────────────

export const sendChatMessage = async (req, res) => {
    try {
        await initTable();

        const userId = req.user.id;
        const userName = req.user.name || 'User';
        const userRole = req.user.role || 'staff';
        const { message } = req.body;

        if (!message || typeof message !== 'string' || !message.trim()) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        const trimmed = message.trim().slice(0, 1000); // cap length

        // Save user message
        await saveMessage(userId, 'user', trimmed);

        // Build conversation history for Gemini
        const history = await getRecentHistory(userId);

        // Build personalised system prompt
        const systemPrompt = SYSTEM_PROMPT
            .replace('{{userName}}', userName)
            .replace('{{userRole}}', userRole);

        // Call Gemini
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            systemInstruction: systemPrompt,
        });

        // Convert DB history to Gemini format (exclude the message we just saved — it's the last 'user' entry)
        const geminiHistory = history.slice(0, -1).map(msg => ({
            role: msg.role,
            parts: [{ text: msg.content }],
        }));

        const chat = model.startChat({ history: geminiHistory });
        const result = await chat.sendMessage(trimmed);
        const reply = result.response.text();

        // Save bot reply
        await saveMessage(userId, 'model', reply);

        return res.json({ success: true, reply });
    } catch (err) {
        console.error('Chatbot error:', err.message);

        // Graceful fallback if Gemini key missing or quota hit
        if (err.message?.includes('API_KEY') || err.message?.includes('API key')) {
            return res.status(503).json({
                success: false,
                message: 'AI service not configured. Please set GEMINI_API_KEY.',
            });
        }
        return res.status(500).json({
            success: false,
            message: 'Something went wrong with the AI assistant.',
        });
    }
};

// ─── Controller: Get Chat History ─────────────────────────

export const getChatHistory = async (req, res) => {
    try {
        await initTable();

        const userId = req.user.id;
        const limit = Math.min(parseInt(req.query.limit) || 50, 100);

        const history = await getRecentHistory(userId, limit);

        // Map 'model' role to 'bot' for frontend consistency
        const messages = history.map(msg => ({
            from: msg.role === 'user' ? 'user' : 'bot',
            text: msg.content,
        }));

        return res.json({ success: true, messages });
    } catch (err) {
        console.error('Chat history error:', err.message);
        return res.status(500).json({ success: false, message: 'Failed to fetch history.' });
    }
};

// ─── Controller: Clear Chat History ───────────────────────

export const clearChatHistory = async (req, res) => {
    try {
        await initTable();

        const userId = req.user.id;
        await pool.query('DELETE FROM chat_messages WHERE user_id = $1', [userId]);

        return res.json({ success: true, message: 'Chat history cleared.' });
    } catch (err) {
        console.error('Clear chat error:', err.message);
        return res.status(500).json({ success: false, message: 'Failed to clear history.' });
    }
};
