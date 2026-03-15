import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Send, Bot, User, Sparkles, Mic, MicOff, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import chatbotService from '../services/chatbotService';
import './DashboardChatBot.css';

// ─── Navigation detection (kept client-side for instant nav) ──

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

function detectNavTarget(input) {
    const lower = input.toLowerCase();
    const navKeywords = ['go to', 'open', 'navigate', 'take me'];
    if (!navKeywords.some(kw => lower.includes(kw))) return null;
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
    { label: 'Help', msg: 'What can you help me with?' },
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
    const [historyLoaded, setHistoryLoaded] = useState(false);
    const [voiceSupported] = useState(
        () => !!(window.SpeechRecognition || window.webkitSpeechRecognition)
    );
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const recognitionRef = useRef(null);
    const sendMessageRef = useRef(null);

    // Load conversation history on first open
    useEffect(() => {
        if (!isOpen || historyLoaded) return;
        (async () => {
            try {
                const data = await chatbotService.getHistory(30);
                if (data.success && data.messages?.length) {
                    setMessages(data.messages);
                } else {
                    const name = user?.firstName || 'there';
                    setMessages([
                        { from: 'bot', text: `Hi ${name}! 👋 I'm your **TheatreX AI assistant** powered by Gemini. I can answer questions about theatres, surgeries, scheduling, analytics, and more. Ask me anything!${voiceSupported ? ' You can also tap the 🎤 mic to use voice.' : ''}` }
                    ]);
                }
            } catch {
                const name = user?.firstName || 'there';
                setMessages([
                    { from: 'bot', text: `Hi ${name}! 👋 I'm your TheatreX AI assistant. Ask me anything about theatres, surgeries, or scheduling!` }
                ]);
            }
            setHistoryLoaded(true);
        })();
    }, [isOpen, historyLoaded, user?.firstName, voiceSupported]);

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

    // Navigation is still handled client-side for instant response
    const handleNavigation = useCallback((text) => {
        const target = detectNavTarget(text);
        if (target) {
            setTimeout(() => navigate(target.route), 800);
            return `Navigating to **${target.name}**... 🚀`;
        }
        return null;
    }, [navigate]);

    // ─── Process message (AI-powered) ─────────────────────

    const processMessage = useCallback(async (text) => {
        // Check for client-side navigation first (instant, no API call)
        const navResult = handleNavigation(text);
        if (navResult) return navResult;

        // Send to Gemini via backend
        try {
            const data = await chatbotService.sendMessage(text);
            if (data.success) {
                return data.reply;
            }
            return data.message || "Sorry, I couldn't process that. Please try again.";
        } catch (err) {
            const msg = err.response?.data?.message;
            if (msg?.includes('API_KEY') || msg?.includes('not configured')) {
                return "⚠️ AI service is not configured yet. Please ask your admin to set the **GEMINI_API_KEY** environment variable.";
            }
            return "I'm having trouble connecting right now. Please try again in a moment.";
        }
    }, [handleNavigation]);

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
                            <div className="dcb-header-name">TheatreX AI Assistant</div>
                            <div className="dcb-header-status">
                                <span className="dcb-status-dot" />
                                Gemini Flash — AI powered
                            </div>
                        </div>
                    </div>
                    <div className="dcb-header-actions">
                        <button
                            className="dcb-clear"
                            onClick={async () => {
                                try { await chatbotService.clearHistory(); } catch (err) { console.error('Failed to clear history:', err); }
                                const name = user?.firstName || 'there';
                                setMessages([{ from: 'bot', text: `Chat cleared! How can I help you, ${name}?` }]);
                            }}
                            aria-label="Clear chat"
                            title="Clear conversation"
                        >
                            <Trash2 size={14} />
                        </button>
                        <button className="dcb-close" onClick={() => { recognitionRef.current?.stop(); setIsListening(false); setIsOpen(false); }} aria-label="Close">
                            <X size={16} />
                        </button>
                    </div>
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
