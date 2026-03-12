import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, X, Send, Bot, User, Sparkles, Mic, MicOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import surgeryService from '../services/surgeryService';
import theatreService from '../services/theatreService';
import dashboardService from '../services/dashboardService';
import './DashboardChatBot.css';

// ─── Intent detection ─────────────────────────────────────

const INTENTS = [
    { id: 'theatre_status', keywords: ['theatre', 'theater', 'room', 'status', 'free', 'available', 'in use', 'occupied', 'live'] },
    { id: 'surgery_list', keywords: ['surgery', 'surgeries', 'today', 'scheduled', 'upcoming', 'procedure', 'list'] },
    { id: 'stats', keywords: ['stats', 'statistics', 'dashboard', 'summary', 'overview', 'numbers', 'how many'] },
    { id: 'surgeon_avail', keywords: ['surgeon', 'doctor', 'available', 'who', 'surgeon available'] },
    { id: 'navigate', keywords: ['go to', 'open', 'show me', 'navigate', 'take me', 'page'] },
    { id: 'schedule', keywords: ['schedule', 'book', 'create surgery', 'new surgery', 'emergency'] },
    { id: 'help', keywords: ['help', 'what can you', 'commands', 'how to', 'guide'] },
    { id: 'greet', keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'] },
    { id: 'thanks', keywords: ['thank', 'thanks', 'bye', 'goodbye', 'cheers'] },
];

const NAV_ROUTES = {
    'dashboard': '/dashboard',
    'surgeries': '/surgeries',
    'theatres': '/theatres',
    'theatre': '/theatres',
    'calendar': '/calendar',
    'live status': '/live-status',
    'live': '/live-status',
    'analytics': '/analytics',
    'patients': '/patients',
    'surgeons': '/staff/surgeons',
    'nurses': '/staff/nurses',
    'notifications': '/notifications',
    'profile': '/profile',
    'coordinator': '/coordinator',
    'emergency': '/emergency',
    'schedule': '/surgeries/new',
    'new surgery': '/surgeries/new',
};

function detectIntent(input) {
    const lower = input.toLowerCase().trim();
    let best = null;
    let bestScore = 0;
    for (const intent of INTENTS) {
        let score = 0;
        for (const kw of intent.keywords) {
            if (lower.includes(kw)) score += kw.split(' ').length;
        }
        if (score > bestScore) {
            bestScore = score;
            best = intent.id;
        }
    }
    return best || 'unknown';
}

function detectNavTarget(input) {
    const lower = input.toLowerCase();
    for (const [key, route] of Object.entries(NAV_ROUTES)) {
        if (lower.includes(key)) return { name: key, route };
    }
    return null;
}

// ─── Quick actions ────────────────────────────────────────

const QUICK_ACTIONS = [
    { label: 'Theatre status', msg: 'What is the current theatre status?' },
    { label: "Today's surgeries", msg: "Show today's surgeries" },
    { label: 'Dashboard stats', msg: 'Show dashboard stats' },
    { label: 'Help', msg: 'What can you do?' },
];

// ─── Component ────────────────────────────────────────────

export default function DashboardChatBot() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [voiceSupported] = useState(
        () => !!(window.SpeechRecognition || window.webkitSpeechRecognition)
    );
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const recognitionRef = useRef(null);
    const sendMessageRef = useRef(null);

    // Initial greeting
    useEffect(() => {
        const name = user?.firstName || 'there';
        setMessages([
            { from: 'bot', text: `Hi ${name}! 👋 I'm your TheatreX assistant. I can check theatre status, look up surgeries, show stats, and help you navigate.${voiceSupported ? ' You can also tap the 🎤 mic to use voice commands!' : ''} What do you need?` }
        ]);
    }, [user?.firstName, voiceSupported]);

    // ─── Voice recognition setup ──────────────────────────

    const toggleVoice = useCallback(() => {
        if (!voiceSupported) return;

        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.continuous = false;

        recognition.onstart = () => setIsListening(true);

        recognition.onresult = (event) => {
            const result = event.results?.[0]?.[0];
            const transcript = result?.transcript || '';
            if (transcript.trim()) {
                setInput(transcript);
                // Small delay so user sees what was transcribed
                setTimeout(() => {
                    setInput('');
                    sendMessageRef.current?.(transcript);
                }, 300);
            }
        };

        recognition.onerror = (event) => {
            setIsListening(false);
            if (event.error === 'no-speech') {
                setMessages(prev => [...prev, { from: 'bot', text: "I didn't catch that. Tap the mic and try again." }]);
            } else if (event.error !== 'aborted') {
                setMessages(prev => [...prev, { from: 'bot', text: `Voice error: ${event.error}. Try typing instead.` }]);
            }
        };

        recognition.onend = () => setIsListening(false);

        recognitionRef.current = recognition;
        recognition.start();
    }, [voiceSupported, isListening]);

    // Cleanup on unmount
    useEffect(() => {
        return () => recognitionRef.current?.stop();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    useEffect(() => {
        if (isOpen) inputRef.current?.focus();
    }, [isOpen]);

    // ─── Handlers per intent ──────────────────────────────

    const handleTheatreStatus = useCallback(async () => {
        try {
            const data = await theatreService.getLiveStatus();
            const theatres = Array.isArray(data) ? data : data?.theatres || [];
            if (!theatres.length) return 'No theatre data available right now.';

            const lines = theatres.map(t => {
                const status = (t.status || 'unknown').replace(/[-_]/g, ' ');
                const icon = status.includes('in use') ? '🔴'
                    : status.includes('available') ? '🟢'
                    : status.includes('cleaning') ? '🟡'
                    : status.includes('maintenance') ? '🟠'
                    : '⚪';
                let extra = '';
                if (t.currentSurgery?.procedure) extra = ` — ${t.currentSurgery.procedure}`;
                else if (t.procedure) extra = ` — ${t.procedure}`;
                return `${icon} **${t.name || `Theatre ${t.id}`}**: ${status}${extra}`;
            });
            return `**Live Theatre Status:**\n${lines.join('\n')}`;
        } catch {
            return "I couldn't fetch theatre status right now. Try the [Live Status](/live-status) page directly.";
        }
    }, []);

    const handleSurgeryList = useCallback(async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const data = await surgeryService.getAllSurgeries({
                startDate: today,
                endDate: today,
            });
            const surgeries = Array.isArray(data) ? data : data?.surgeries || [];
            if (!surgeries.length) return "No surgeries scheduled for today.";

            const lines = surgeries.slice(0, 8).map(s => {
                const time = s.scheduled_time ? s.scheduled_time.slice(0, 5) : 'TBD';
                const statusIcon = s.status === 'completed' ? '✅' : s.status === 'in_progress' ? '🔵' : '⏳';
                return `${statusIcon} ${time} — ${s.procedure || s.type || 'Surgery'} (${s.status || 'scheduled'})`;
            });
            const more = surgeries.length > 8 ? `\n...and ${surgeries.length - 8} more` : '';
            return `**Today's Surgeries (${surgeries.length}):**\n${lines.join('\n')}${more}`;
        } catch {
            return "Couldn't load today's surgeries. Check the [Surgeries](/surgeries) page.";
        }
    }, []);

    const handleStats = useCallback(async () => {
        try {
            const data = await dashboardService.getDashboardStats();
            const stats = data?.stats || data || {};
            const lines = [];
            if (stats.totalSurgeries != null) lines.push(`📋 Total surgeries: **${stats.totalSurgeries}**`);
            if (stats.todaySurgeries != null) lines.push(`📅 Today: **${stats.todaySurgeries}**`);
            if (stats.completedToday != null) lines.push(`✅ Completed today: **${stats.completedToday}**`);
            if (stats.inProgress != null) lines.push(`🔵 In progress: **${stats.inProgress}**`);
            if (stats.totalTheatres != null) lines.push(`🏥 Theatres: **${stats.totalTheatres}**`);
            if (stats.availableTheatres != null) lines.push(`🟢 Available theatres: **${stats.availableTheatres}**`);
            if (stats.staffOnDuty != null) lines.push(`👥 Staff on duty: **${stats.staffOnDuty}**`);
            if (!lines.length) return "Stats loaded but no data was returned. Check the [Dashboard](/dashboard).";
            return `**Dashboard Stats:**\n${lines.join('\n')}`;
        } catch {
            return "Couldn't fetch dashboard stats. Head to the [Dashboard](/dashboard) for details.";
        }
    }, []);

    const handleSurgeonAvail = useCallback(async () => {
        try {
            const data = await surgeryService.getSurgeons();
            const surgeons = Array.isArray(data) ? data : data?.surgeons || [];
            if (!surgeons.length) return "No surgeon data available.";
            const avail = surgeons.filter(s => s.isAvailable !== false);
            return `**Surgeons:** ${surgeons.length} total, **${avail.length}** currently available.\nCheck [Surgeons page](/staff/surgeons) for full details.`;
        } catch {
            return "Couldn't fetch surgeon data right now.";
        }
    }, []);

    // ─── Process message ─────────────────────────────────

    const processMessage = useCallback(async (text) => {
        const intent = detectIntent(text);

        switch (intent) {
            case 'theatre_status':
                return await handleTheatreStatus();

            case 'surgery_list':
                return await handleSurgeryList();

            case 'stats':
                return await handleStats();

            case 'surgeon_avail':
                return await handleSurgeonAvail();

            case 'navigate': {
                const target = detectNavTarget(text);
                if (target) {
                    setTimeout(() => navigate(target.route), 800);
                    return `Navigating to **${target.name}**... 🚀`;
                }
                return "Which page would you like? Try: dashboard, surgeries, theatres, calendar, analytics, live status, patients, surgeons, nurses, notifications, profile, or coordinator.";
            }

            case 'schedule':
                setTimeout(() => navigate('/surgeries/new'), 800);
                return "Opening the **new surgery** form for you... 🚀";

            case 'help':
                return `Here's what I can do:\n\n🏥 **"Theatre status"** — Live status of all theatres\n📋 **"Today's surgeries"** — List of today's procedures\n📊 **"Dashboard stats"** — Key numbers at a glance\n👨‍⚕️ **"Surgeon availability"** — Who's available\n🧭 **"Go to [page]"** — Navigate anywhere (e.g. "go to calendar")\n📝 **"Schedule surgery"** — Open booking form\n🎤 **Voice commands** — Tap the mic and speak any command\n\nType or speak naturally — I'll figure out what you need!`;

            case 'greet': {
                const name = user?.firstName || 'there';
                return `Hello ${name}! 👋 How can I help you today? Type **help** to see what I can do.`;
            }

            case 'thanks':
                return "You're welcome! Let me know if you need anything else. 😊";

            default:
                return "I'm not sure what you mean. Try asking about **theatre status**, **today's surgeries**, **stats**, or type **help** to see all commands.";
        }
    }, [handleTheatreStatus, handleSurgeryList, handleStats, handleSurgeonAvail, navigate, user?.firstName]);

    // ─── Send ─────────────────────────────────────────────

    const sendMessage = useCallback(async (text) => {
        if (!text.trim()) return;
        setMessages(prev => [...prev, { from: 'user', text: text.trim() }]);
        setInput('');
        setIsTyping(true);

        const reply = await processMessage(text);
        setMessages(prev => [...prev, { from: 'bot', text: reply }]);
        setIsTyping(false);
    }, [processMessage]);

    // Keep ref in sync so voice callback always has latest
    useEffect(() => {
        sendMessageRef.current = sendMessage;
    }, [sendMessage]);

    const handleSubmit = (e) => {
        e.preventDefault();
        sendMessage(input);
    };

    // ─── Render markdown-light (bold + links) ─────────────

    function renderText(text) {
        return text.split('\n').map((line, li) => (
            <span key={li}>
                {line.split(/(\*\*.*?\*\*|\[.*?\]\(.*?\))/).map((part, pi) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={pi}>{part.slice(2, -2)}</strong>;
                    }
                    const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
                    if (linkMatch) {
                        return (
                            <a
                                key={pi}
                                href={linkMatch[2]}
                                onClick={(e) => { e.preventDefault(); navigate(linkMatch[2]); }}
                                className="dcb-link"
                            >
                                {linkMatch[1]}
                            </a>
                        );
                    }
                    return part;
                })}
                {li < text.split('\n').length - 1 && <br />}
            </span>
        ));
    }

    // ─── JSX ──────────────────────────────────────────────

    return (
        <>
            {/* Toggle button */}
            <button
                className={`dcb-toggle ${isOpen ? 'dcb-toggle-open' : ''}`}
                onClick={() => { if (isOpen) { recognitionRef.current?.stop(); setIsListening(false); } setIsOpen(!isOpen); }}
                aria-label={isOpen ? 'Close assistant' : 'Open assistant'}
            >
                <span className="dcb-toggle-icon">
                    {isOpen ? <X size={22} /> : <Sparkles size={22} />}
                </span>
                {!isOpen && <span className="dcb-pulse" />}
            </button>

            {/* Panel */}
            <div className={`dcb-panel ${isOpen ? 'dcb-panel-open' : ''}`}>
                {/* Header */}
                <div className="dcb-header">
                    <div className="dcb-header-left">
                        <div className="dcb-avatar">
                            <Bot size={18} />
                        </div>
                        <div>
                            <div className="dcb-header-name">TheatreX Assistant</div>
                            <div className="dcb-header-status">
                                <span className="dcb-status-dot" />
                                Online — live data
                            </div>
                        </div>
                    </div>
                    <button className="dcb-close" onClick={() => { recognitionRef.current?.stop(); setIsListening(false); setIsOpen(false); }} aria-label="Close">
                        <X size={16} />
                    </button>
                </div>

                {/* Messages */}
                <div className="dcb-messages">
                    {messages.map((msg, i) => (
                        <div key={i} className={`dcb-msg dcb-msg-${msg.from}`}>
                            {msg.from === 'bot' && (
                                <div className="dcb-msg-avatar"><Bot size={13} /></div>
                            )}
                            <div className={`dcb-bubble dcb-bubble-${msg.from}`}>
                                {renderText(msg.text)}
                            </div>
                            {msg.from === 'user' && (
                                <div className="dcb-msg-avatar dcb-msg-avatar-user"><User size={13} /></div>
                            )}
                        </div>
                    ))}
                    {isTyping && (
                        <div className="dcb-msg dcb-msg-bot">
                            <div className="dcb-msg-avatar"><Bot size={13} /></div>
                            <div className="dcb-bubble dcb-bubble-bot dcb-typing">
                                <span /><span /><span />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Quick actions — show only at start */}
                {messages.length <= 1 && (
                    <div className="dcb-quick">
                        {QUICK_ACTIONS.map((a, i) => (
                            <button key={i} className="dcb-quick-btn" onClick={() => sendMessage(a.msg)}>
                                {a.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Input */}
                <form className="dcb-input-area" onSubmit={handleSubmit}>
                    {voiceSupported && (
                        <button
                            type="button"
                            className={`dcb-mic ${isListening ? 'dcb-mic-active' : ''}`}
                            onClick={toggleVoice}
                            aria-label={isListening ? 'Stop listening' : 'Voice command'}
                        >
                            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                            {isListening && <span className="dcb-mic-ring" />}
                        </button>
                    )}
                    <input
                        ref={inputRef}
                        type="text"
                        className="dcb-input"
                        placeholder={isListening ? 'Listening...' : 'Ask about theatres, surgeries, stats...'}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        maxLength={300}
                        disabled={isListening}
                    />
                    <button type="submit" className="dcb-send" disabled={!input.trim() || isListening} aria-label="Send">
                        <Send size={16} />
                    </button>
                </form>
            </div>
        </>
    );
}
