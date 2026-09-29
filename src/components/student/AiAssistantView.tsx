import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import {
  Send,
  Sparkles,
  Bot,
  User,
  ShieldAlert,
  HelpCircle,
  BookOpen
} from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  text: string;
  time: string;
}

interface AiAssistantViewProps {
  initialSessionContextId?: string;
}

export const AiAssistantView: React.FC<AiAssistantViewProps> = ({ initialSessionContextId }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: `Bonjour ${user?.firstName || 'étudiant'} ! Je suis ton assistant pédagogique UL STUDY FLOW LEARNING. Comment puis-je t'aider aujourd'hui sur tes cours de ${user?.department || 'ta filière'} ou sur la plateforme ?`,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const quickPrompts = [
    "Explique-moi la notion de coût d'opportunité avec un exemple concret à Lomé.",
    "Comment est calculé le Taux Marginal de Substitution (TMS) ?",
    "Résume-moi les propriétés des courbes d'indifférence.",
    "Comment fonctionne la validation des questionnaires sur UL Study Flow ?",
    "Pose-moi 2 questions d'entraînement pour tester mes connaissances."
  ];

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMsg: Message = {
      role: 'user',
      text,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const historyPayload = messages.map(m => ({ role: m.role, text: m.text }));
      const res = await api.askAi(text, historyPayload, initialSessionContextId);
      
      const modelMsg: Message = {
        role: 'model',
        text: res.reply,
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, modelMsg]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          role: 'model',
          text: "Désolé, une erreur est survenue lors de la communication avec l'assistant. Veuillez réessayer.",
          time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-4 sm:py-6 h-[calc(100vh-5rem)] flex flex-col">
      {/* Header bar (WhatsApp-like) */}
      <div className="bg-[#075E54] text-white p-3.5 sm:p-4 rounded-t-2xl flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#25D366] text-[#075E54] flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5 text-[#075E54]" />
          </div>
          <div>
            <h2 className="font-bold text-sm sm:text-base leading-tight">
              Assistant UL Study Flow
            </h2>
            <p className="text-[11px] text-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse"></span>
              Propulsé par Gemini · Scôpé à {user?.department || 'tes cours'}
            </p>
          </div>
        </div>

        <span className="text-[11px] bg-[#128C7E] px-2.5 py-1 rounded-full text-white font-medium hidden sm:inline-block">
          Aide Pédagogique 24h/24
        </span>
      </div>

      {/* Chat Area (WhatsApp-like textured background) */}
      <div className="flex-1 bg-[#EFEAE2] p-4 overflow-y-auto space-y-3.5 border-x border-[#E9EDEF]">
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={idx}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                  isUser
                    ? 'bg-[#E7FFDB] text-[#111B21] rounded-tr-none'
                    : 'bg-white text-[#111B21] rounded-tl-none border border-[#E9EDEF]'
                }`}
              >
                {!isUser && (
                  <p className="text-[10px] font-bold text-[#075E54] mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#25D366]" />
                    Tuteur Pédagogique
                  </p>
                )}
                <div className="whitespace-pre-wrap">{msg.text}</div>
                <div
                  className={`text-[10px] text-right mt-1.5 ${
                    isUser ? 'text-[#667781]' : 'text-slate-400'
                  }`}
                >
                  {msg.time} {isUser && '✓✓'}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start">
            <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-[#E9EDEF] shadow-xs flex items-center gap-2">
              <span className="text-xs text-[#075E54] font-medium">L'assistant réfléchit...</span>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-bounce delay-100"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-bounce delay-200"></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested chips (horizontal scroll) */}
      <div className="bg-[#F0F2F5] px-3 py-2 border-x border-[#E9EDEF] flex items-center gap-2 overflow-x-auto">
        <span className="text-[11px] font-bold text-[#667781] shrink-0">Exemples :</span>
        {quickPrompts.slice(0, 3).map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className="text-[11px] text-[#075E54] bg-white border border-[#E9EDEF] px-2.5 py-1 rounded-full whitespace-nowrap hover:bg-emerald-50 transition-colors shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input area */}
      <div className="bg-[#F0F2F5] p-3 rounded-b-2xl border border-[#E9EDEF] flex items-center gap-2 shadow-sm">
        <input
          type="text"
          placeholder="Pose ta question sur tes cours ou la plateforme..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-1 text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-[#E9EDEF] bg-white focus:outline-none focus:border-[#25D366]"
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || loading}
          className="w-10 h-10 rounded-xl bg-[#25D366] text-[#075E54] flex items-center justify-center hover:bg-[#1faa54] transition-all disabled:opacity-50 shrink-0 shadow-xs active:scale-95"
        >
          <Send className="w-4 h-4 fill-[#075E54]" />
        </button>
      </div>
    </div>
  );
};
