import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Phone,
  Sparkles,
  ExternalLink,
  BrainCircuit,
  Bot,
  User,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { Logo } from './Logo.tsx';
import { SystemSettings } from '../types/index.ts';

interface OasisChatWidgetProps {
  settings: SystemSettings;
  onAskChatbot: (
    sessionId: string,
    message: string,
    useThinking?: boolean
  ) => Promise<{ reply: string; answered_from_faq: boolean }>;
  standaloneMode?: boolean;
}

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  answeredFromFaq?: boolean;
}

export const OasisChatWidget: React.FC<OasisChatWidgetProps> = ({
  settings,
  onAskChatbot,
  standaloneMode = false,
}) => {
  const [isOpen, setIsOpen] = useState(standaloneMode);
  const [sessionId] = useState(() => `ses-oasis-${Math.floor(Math.random() * 89999 + 10000)}`);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [useThinking, setUseThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quick suggestion questions in English (BOT-01)
  const quickQuestions = [
    'What educational programs are offered?',
    'What are the tuition and enrollment fees?',
    'How do I register for the 2027 intake?',
    'Where is the main campus located?',
    'Are online classes available?',
    'How do I contact customer support?',
  ];

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'bot',
      text: "Assalamu'alaikum & Warm Greetings! I am Oasis, the virtual assistant for Al Amin Edu Oasis. How can I assist you today with our academic programs, school fees, or admissions?",
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  useEffect(() => {
    if (standaloneMode) setIsOpen(true);
  }, [standaloneMode]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (msgToSend?: string) => {
    const text = (msgToSend || inputText).trim();
    if (!text || loading) return;

    // BOT-05: Input length limit 500 chars
    if (text.length > 500) {
      alert('Message exceeds the 500 character limit.');
      return;
    }

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const response = await onAskChatbot(sessionId, text, useThinking);
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        answeredFromFaq: response.answered_from_faq,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          sender: 'bot',
          text: `Our assistance line is temporarily busy. Please contact our counselors directly via WhatsApp at ${settings.official_whatsapp_number}.`,
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          answeredFromFaq: false,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'msg-welcome-2',
        sender: 'bot',
        text: "Assalamu'alaikum! The conversation has been restarted. Please choose a suggestion below or type your inquiry.",
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // If in standalone full view (Public Participant Mode)
  if (standaloneMode) {
    return (
      <div className="max-w-2xl mx-auto glass-card rounded-3xl overflow-hidden border border-white/80 shadow-2xl flex flex-col h-[750px] animate-in fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0E9F9A] to-[#0A726F] p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-sm">Oasis — Al Amin AI Assistant</h3>
              <p className="text-[11px] text-emerald-100 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                <span>Ready to answer questions about programs & admissions</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={settings.official_whatsapp}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
              title="Contact Team WhatsApp (BOT-08)"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Official WhatsApp</span>
            </a>

            <button
              onClick={handleResetChat}
              className="p-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-white transition cursor-pointer"
              title="Restart conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Thinking Mode Option Bar */}
        <div className="px-4 py-2 bg-[#E3F6F5]/80 border-b border-[#0E9F9A]/20 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-[#0A726F] font-medium">
            <BrainCircuit className="w-3.5 h-3.5 text-[#0E9F9A]" />
            <span>Deep Thinking Mode (gemini-4-argon)</span>
          </div>
          <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-[#0A726F] font-semibold">
            <input
              type="checkbox"
              checked={useThinking}
              onChange={(e) => setUseThinking(e.target.checked)}
              className="w-3.5 h-3.5 accent-[#0E9F9A]"
            />
            <span>Enable High Thinking</span>
          </label>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
          {messages.map((m) => {
            const isBot = m.sender === 'bot';
            return (
              <div
                key={m.id}
                className={`flex items-start gap-2.5 ${isBot ? 'justify-start' : 'justify-end'}`}
              >
                {isBot && (
                  <div className="w-7 h-7 rounded-full bg-[#0E9F9A] text-white flex items-center justify-center flex-shrink-0 text-xs shadow-sm">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[80%] space-y-1`}>
                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                      isBot
                        ? 'bg-white text-gray-800 shadow-sm border border-gray-100'
                        : 'bg-[#0E9F9A] text-white shadow-md'
                    }`}
                  >
                    <p className="whitespace-pre-line">{m.text}</p>
                  </div>

                  <div
                    className={`flex items-center gap-2 px-1 text-[10px] text-gray-400 ${
                      isBot ? 'justify-start' : 'justify-end'
                    }`}
                  >
                    <span>{m.timestamp}</span>
                    {isBot && m.answeredFromFaq !== undefined && (
                      <span
                        className={`px-1.5 py-0.2 rounded font-semibold ${
                          m.answeredFromFaq
                            ? 'text-emerald-700 bg-emerald-50'
                            : 'text-amber-700 bg-amber-50'
                        }`}
                      >
                        {m.answeredFromFaq ? 'Verified FAQ' : 'Official WhatsApp Link Provided'}
                      </span>
                    )}
                  </div>
                </div>

                {!isBot && (
                  <div className="w-7 h-7 rounded-full bg-slate-700 text-white flex items-center justify-center flex-shrink-0 text-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#0E9F9A] text-white flex items-center justify-center text-xs animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2 text-xs text-gray-500">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0E9F9A] animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0E9F9A] animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0E9F9A] animate-bounce [animation-delay:0.4s]" />
                </div>
                <span>Oasis is consulting the verified knowledge base...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Pills (BOT-01) */}
        <div className="p-3 bg-white border-t border-gray-100">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Suggested Quick Inquiries:
          </p>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
            {quickQuestions.map((q) => (
              <button
                key={q}
                onClick={() => handleSendMessage(q)}
                className="px-2.5 py-1 bg-gray-50 hover:bg-[#E3F6F5] text-[#0A726F] hover:text-[#0E9F9A] border border-gray-200/80 hover:border-[#0E9F9A]/40 rounded-xl text-[11px] font-medium transition cursor-pointer text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Input Bar */}
        <div className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            maxLength={500}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            placeholder="Type your question regarding programs, fees, or admissions..."
            className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs outline-none focus:ring-2 focus:ring-[#0E9F9A]/30 focus:bg-white"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() || loading}
            className="p-2.5 bg-[#0E9F9A] hover:bg-[#0A726F] text-white rounded-2xl disabled:opacity-40 transition shadow-md shadow-[#0E9F9A]/20 cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Floating Widget Mode (For CMS layout)
  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative group p-3.5 bg-gradient-to-r from-[#0E9F9A] to-[#0A726F] text-white rounded-full shadow-2xl hover:scale-105 transition-all flex items-center gap-2 cursor-pointer border-2 border-white/60"
          title="Open Oasis Participant Chatbot"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 text-xs font-semibold pr-1">
            Ask Oasis AI
          </span>
          <span className="w-3 h-3 rounded-full bg-emerald-400 absolute -top-0.5 -right-0.5 ring-2 ring-white animate-pulse" />
        </button>
      )}

      {isOpen && (
        <div className="w-80 sm:w-96 glass-modal rounded-3xl overflow-hidden shadow-2xl border border-white/80 flex flex-col h-[560px] animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="bg-[#0E9F9A] p-3 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h4 className="text-xs font-bold leading-tight">Oasis Virtual Assistant</h4>
                <span className="text-[10px] text-emerald-100">Al Amin Edu Oasis</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <a
                href={settings.official_whatsapp}
                target="_blank"
                rel="noreferrer"
                className="p-1 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white text-[10px] flex items-center gap-1 font-semibold transition"
                title="Direct WhatsApp"
              >
                <Phone className="w-3 h-3" />
                <span className="hidden sm:inline">WhatsApp</span>
              </a>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-white/80 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Thinking Mode Option Bar */}
          <div className="px-3 py-1.5 bg-[#E3F6F5]/90 border-b border-[#0E9F9A]/20 flex items-center justify-between text-[11px] text-[#0A726F]">
            <span className="flex items-center gap-1 font-semibold">
              <BrainCircuit className="w-3.5 h-3.5 text-[#0E9F9A]" />
              <span>Thinking Mode</span>
            </span>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={useThinking}
                onChange={(e) => setUseThinking(e.target.checked)}
                className="w-3 h-3 accent-[#0E9F9A]"
              />
              <span className="text-[10px]">gemini-4-argon</span>
            </label>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-gray-50/60">
            {messages.map((m) => {
              const isBot = m.sender === 'bot';
              return (
                <div
                  key={m.id}
                  className={`flex items-start gap-2 ${isBot ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`p-2.5 rounded-2xl text-xs leading-relaxed max-w-[85%] ${
                      isBot
                        ? 'bg-white text-gray-800 shadow-xs border border-gray-100'
                        : 'bg-[#0E9F9A] text-white shadow-xs'
                    }`}
                  >
                    <p className="whitespace-pre-line">{m.text}</p>
                    <span
                      className={`block text-[9px] mt-1 ${
                        isBot ? 'text-gray-400' : 'text-emerald-100'
                      }`}
                    >
                      {m.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="p-2.5 bg-white rounded-2xl border text-xs text-gray-500 max-w-[80%] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0E9F9A] animate-ping" />
                <span>Oasis is typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          <div className="p-2 bg-white border-t border-gray-100">
            <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar">
              {quickQuestions.slice(0, 4).map((q) => (
                <button
                  key={q}
                  onClick={() => handleSendMessage(q)}
                  className="px-2 py-1 bg-gray-50 hover:bg-[#E3F6F5] text-[#0A726F] border rounded-lg text-[10px] whitespace-nowrap transition cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-2.5 bg-white border-t border-gray-100 flex items-center gap-1.5">
            <input
              type="text"
              value={inputText}
              maxLength={500}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
              placeholder="Type your question..."
              className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:bg-white"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || loading}
              className="p-2 bg-[#0E9F9A] hover:bg-[#0A726F] text-white rounded-xl disabled:opacity-40 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
