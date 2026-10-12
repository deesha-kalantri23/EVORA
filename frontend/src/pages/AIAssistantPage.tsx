import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bot,
  Send,
  User,
  Zap,
  BatteryCharging,
  Compass,
  Calculator,
  Navigation,
  Activity,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  Info
} from 'lucide-react';
import { Badge } from '../components/Badge';
import { aiService, AIMessage } from '../services/aiService';

const INITIAL_CONVERSATION: AIMessage[] = [
  {
    id: 'm-welcome',
    sender: 'assistant',
    text: "Namaste! I am EVORA Copilot. Your Tata Nexon EV is at 78% SoC (284 km range) and 96.2% SoH. Ask me anything about range, charging, or battery diagnostics.",
    time: '20:10',
    dataLabel: 'Vehicle Copilot',
    action: {
      label: 'View Battery Health',
      route: '/battery-health',
      description: 'Check pack SoH & cell diagnostics'
    }
  }
];

const QUICK_ACTIONS = [
  { id: 'health', label: 'Battery Health', icon: Activity, query: 'How healthy is my battery?', route: '/battery-health' },
  { id: 'charger', label: 'Find Charger', icon: Compass, query: 'Where can I charge near Pune?', route: '/chargers' },
  { id: 'cost', label: 'Calculate Cost', icon: Calculator, query: 'How much will it cost to charge to 80%?', route: '/charging-cost' },
  { id: 'range', label: 'Predict Range', icon: Zap, query: 'Predict my real-world range with current battery', route: '/range-prediction' },
  { id: 'route', label: 'Plan Route', icon: Navigation, query: 'Can I reach Mumbai with my current battery?', route: '/route' }
];

const EXAMPLE_QUESTIONS = [
  "How healthy is my battery?",
  "Where can I charge near Pune?",
  "Can I reach Mumbai with my current battery?",
  "How much will it cost to charge to 80%?",
  "How can I improve battery life?",
  "Explain CCS2 charging."
];

export const AIAssistantPage: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<AIMessage[]>(INITIAL_CONVERSATION);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMessage: AIMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    try {
      const response = await aiService.sendMessage(query);
      const assistantMessage: AIMessage = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: response.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        action: response.action,
        dataLabel: response.dataLabel
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const fallbackMsg: AIMessage = {
        id: `a-${Date.now()}`,
        sender: 'assistant',
        text: "I analyzed your query. Your vehicle telemetry shows 78% SoC and 94% SoH. Please choose a quick action below to navigate to the specific module.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        dataLabel: 'Vehicle Copilot'
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleResetChat = () => {
    setMessages(INITIAL_CONVERSATION);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              EVORA Copilot
            </h1>
            <Badge variant="emerald" icon={Bot}>
              Vehicle Assistant
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time telemetry queries, route planning advice, and charging recommendations
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleResetChat}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Chat</span>
          </button>
          <Badge variant="slate" icon={Info}>
            Tata Nexon EV Linked
          </Badge>
        </div>
      </div>

      {/* Quick Action Navigation Bar */}
      <div className="bg-[#131B2B] border border-[#243046] rounded-2xl p-3 shadow-sm">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Quick Actions
          </span>
          <span className="text-[10px] text-emerald-400 font-semibold">1-Click Page Navigation</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => handleSendMessage(action.query)}
                className="p-2.5 rounded-xl bg-[#0F172A] hover:bg-[#162338] border border-slate-800 hover:border-emerald-500/50 transition-all text-left flex items-center gap-2 group"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-200 group-hover:text-white truncate">
                  {action.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Chat Interface Window */}
      <div className="bg-[#131B2B] border border-[#243046] rounded-3xl h-[560px] flex flex-col overflow-hidden shadow-2xl">
        {/* Chatbox Sub-Header */}
        <div className="h-14 px-6 border-b border-slate-800 flex items-center justify-between bg-[#0F172A]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-slate-950 font-black shadow-md shadow-emerald-500/20">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-xs text-white block">EVora Intelligent Agent</span>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>EVIoT Telemetry & Charging Service Layer Active</span>
              </span>
            </div>
          </div>

          <span className="text-[11px] font-mono text-slate-400 font-semibold">
            MH-12-TE-4590 (Pune)
          </span>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((m) => {
            const isUser = m.sender === 'user';
            return (
              <div
                key={m.id}
                className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                    isUser
                      ? 'bg-slate-700 text-white'
                      : 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div className={`max-w-[85%] sm:max-w-[75%] space-y-2`}>
                  <div
                    className={`p-4 rounded-3xl text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-emerald-600 text-white rounded-tr-none shadow-md'
                        : 'bg-[#0F172A] text-slate-200 border border-slate-800 rounded-tl-none shadow-sm'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.text}</p>
                  </div>

                  {/* Assistant Interactive Navigation Action Card */}
                  {!isUser && m.action && (
                    <div
                      onClick={() => navigate(m.action!.route)}
                      className="p-3.5 rounded-2xl bg-gradient-to-r from-[#162338] to-[#131B2B] border border-emerald-500/50 hover:border-emerald-400 cursor-pointer flex items-center justify-between gap-3 text-xs transition-all shadow-md hover:shadow-emerald-500/10 group"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                          <Navigation className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div>
                          <span className="font-extrabold text-white text-xs block group-hover:text-emerald-300 transition-colors">
                            {m.action.label}
                          </span>
                          {m.action.description && (
                            <span className="text-[11px] text-slate-400 block mt-0.5">
                              {m.action.description}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(m.action!.route);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 flex-shrink-0"
                      >
                        <span>Open Page</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  )}

                  {/* Metadata timestamp & data label */}
                  <div className={`flex items-center gap-2 text-[10px] text-slate-500 ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <span>{m.time}</span>
                    {m.dataLabel && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-400 font-semibold">{m.dataLabel}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center text-xs font-bold shadow-md shadow-emerald-500/20">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-[#0F172A] border border-slate-800 text-slate-400 text-xs flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-bounce" />
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]" />
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] text-slate-400 font-medium">EVora is analyzing vehicle telemetry...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Example Questions Carousel / Suggestion Pills */}
        <div className="px-4 py-2 border-t border-slate-800/80 bg-[#0F172A] flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex-shrink-0">
            Suggested:
          </span>
          {EXAMPLE_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => handleSendMessage(q)}
              className="px-3 py-1.5 rounded-xl bg-[#131B2B] hover:bg-slate-800 text-[11px] font-medium text-slate-300 hover:text-white border border-slate-800 hover:border-emerald-500/40 transition-colors whitespace-nowrap flex-shrink-0"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-[#0D131F]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask EVora anything about battery health, chargers in Pune, route planning..."
              className="flex-1 bg-[#131B2B] text-slate-200 rounded-2xl px-4 py-3 text-xs sm:text-sm border border-[#243046] focus:outline-none focus:border-emerald-500 placeholder:text-slate-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="px-5 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all flex-shrink-0"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
