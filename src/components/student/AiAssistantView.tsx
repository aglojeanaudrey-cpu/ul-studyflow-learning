import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../lib/api";
import { UE } from "@/src/types";
import {
  Send,
  Sparkles,
  X,
  MoreVertical,
  RotateCcw,
  Trash2,
  Info,
  Bot,
  BookOpen,
  ChevronDown,
  GraduationCap,
  Lock,
} from "lucide-react";

interface Message {
  role: "user" | "model";
  text: string;
  time: string;
}

interface AiAssistantViewProps {
  initialSessionContextId?: string;
  onClose?: () => void; // ⭐ Fonction appelée quand on ferme
}

export const AiAssistantView: React.FC<AiAssistantViewProps> = ({
  initialSessionContextId,
  onClose,
}) => {
  const { user } = useAuth();
  // ⭐ État du sélecteur d'UE
  const [availableUes, setAvailableUes] = useState<
    Array<{
      id: string;
      code: string;
      title: string;
      level: string;
      semester: string;
      department: string | null;
      sessionsCount: number;
    }>
  >([]);
  const [selectedUeId, setSelectedUeId] = useState<string | null>(null);
  const [uePickerOpen, setUePickerOpen] = useState(false);
  const [loadingUes, setLoadingUes] = useState(false);

  // ⭐ Charger les UE accessibles au montage
  useEffect(() => {
    let cancelled = false;
    setLoadingUes(true);
    api
      .getAvailableUesForAi()
      .then((res) => {
        if (cancelled) return;
        setAvailableUes(res.ues || []);
      })
      .catch((err) => {
        console.error("Erreur chargement UE IA:", err);
      })
      .finally(() => {
        if (!cancelled) setLoadingUes(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Fonction pour générer le message d'accueil (utilisée pour reset)
  const getInitialMessage = (): Message => {
    const ueCount = availableUes.length;
    const hasUe = ueCount > 0;
    let text = `Bonjour ${user?.firstName || "étudiant"} ! Je suis ton assistant pédagogique UL Study Flow.`;

    if (hasUe) {
      text += `\n\nTu as ${ueCount} UE${ueCount > 1 ? "s" : ""} débloquée${ueCount > 1 ? "s" : ""}. Sélectionne celle sur laquelle tu veux travailler en haut, puis pose-moi ta question.`;
    } else {
      text += `\n\nTu n'as pas encore d'UE débloquée. Tu peux quand même me poser des questions générales, mais pour une aide sur tes cours, fais une demande de déblocage depuis "Mes UE".`;
    }

    return {
      role: "model",
      text,
      time: new Date().toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
  };

  const [messages, setMessages] = useState<Message[]>([getInitialMessage()]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const optionsRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // ⭐ Fermer le dropdown si on clique ailleurs
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        optionsRef.current &&
        !optionsRef.current.contains(event.target as Node)
      ) {
        setOptionsOpen(false);
      }
    }
    if (optionsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [optionsOpen]);

  // ⭐ Fermer avec ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (optionsOpen) setOptionsOpen(false);
        else if (confirmClear) setConfirmClear(false);
        else if (aboutOpen) setAboutOpen(false);
        else if (onClose) onClose();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [optionsOpen, confirmClear, aboutOpen, onClose]);

  // ⭐ Empêcher le scroll du body derrière
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMsg: Message = {
      role: "user",
      text,
      time: new Date().toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.role,
        text: m.text,
      }));
      const res = await api.askAi(
        text,
        historyPayload,
        initialSessionContextId,
        selectedUeId || undefined,
      );

      const modelMsg: Message = {
        role: "model",
        text: res.reply,
        time: new Date().toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, modelMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: "Désolé, une erreur est survenue lors de la communication avec l'assistant. Veuillez réessayer.",
          time: new Date().toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Actions du menu
  const handleNewConversation = () => {
    setMessages([getInitialMessage()]);
    setOptionsOpen(false);
  };

  const handleClearHistory = () => {
    setMessages([getInitialMessage()]);
    setConfirmClear(false);
    setOptionsOpen(false);
  };

  const handleAbout = () => {
    setAboutOpen(true);
    setOptionsOpen(false);
  };

  return (
    // ⭐ Popup plein écran : fixed inset-0 + h-screen w-screen + z-50
    <div className="fixed inset-0 z-50 h-screen w-screen bg-white dark:bg-[#0B141A] flex flex-col overflow-hidden animate-in fade-in duration-150">
      {/* ============ HEADER ============ */}
      <header className="bg-[#075E54] dark:bg-[#111B21] text-white px-3 sm:px-5 py-3 flex items-center justify-between shadow-md shrink-0 border-b border-[#128C7E] dark:border-[#222E35]">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-full bg-[#25D366] text-[#075E54] flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-[#075E54]" />
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-sm sm:text-base leading-tight truncate">
              Assistant UL Study Flow
            </h2>
            <p className="text-[11px] text-emerald-200 flex items-center gap-1.5 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-pulse shrink-0"></span>
              Gemini · {user?.department || "ton cursus"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Menu options */}
          <div className="relative" ref={optionsRef}>
            <button
              onClick={() => setOptionsOpen(!optionsOpen)}
              className={`p-2 rounded-xl transition-colors ${
                optionsOpen
                  ? "bg-white/20"
                  : "hover:bg-white/10 active:bg-white/20"
              }`}
              title="Options"
              aria-haspopup="true"
              aria-expanded={optionsOpen}
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {/* Dropdown */}
            {optionsOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#1F2C34] rounded-2xl shadow-2xl border border-[#E9EDEF] dark:border-[#222E35] overflow-hidden z-10 animate-in fade-in slide-in-from-top-2 duration-150">
                <button
                  onClick={handleNewConversation}
                  className="w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold text-[#111B21] dark:text-white hover:bg-[#F0F2F5] dark:hover:bg-[#2A3942] transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-[#25D366]/15 text-[#075E54] dark:text-[#25D366] flex items-center justify-center shrink-0">
                    <RotateCcw className="w-4 h-4" />
                  </div>
                  Nouvelle conversation
                </button>

                <button
                  onClick={() => {
                    setConfirmClear(true);
                    setOptionsOpen(false);
                  }}
                  disabled={messages.length <= 1}
                  className="w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors text-left disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <div className="w-8 h-8 rounded-lg bg-rose-500/15 flex items-center justify-center shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </div>
                  Effacer l'historique
                </button>

                <div className="border-t border-[#E9EDEF] dark:border-[#222E35]"></div>

                <button
                  onClick={handleAbout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold text-[#111B21] dark:text-white hover:bg-[#F0F2F5] dark:hover:bg-[#2A3942] transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                    <Info className="w-4 h-4" />
                  </div>
                  À propos de l'assistant
                </button>
              </div>
            )}
          </div>

          {/* Bouton fermer */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/10 active:bg-white/20 transition-colors"
              title="Fermer (ESC)"
              aria-label="Fermer l'assistant"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </header>

      {/* ⭐ BANDEAU SÉLECTEUR UE */}
      <div className="bg-[#F0F2F5] dark:bg-[#1F2C34] px-3 sm:px-5 py-2 border-b border-[#E9EDEF] dark:border-[#222E35] shrink-0">
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <button
              onClick={() => setUePickerOpen(!uePickerOpen)}
              className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-white dark:bg-[#111B21] border border-[#E9EDEF] dark:border-[#222E35] hover:border-[#25D366] transition-colors text-left"
            >
              <div className="flex items-center gap-2 min-w-0">
                {initialSessionContextId ? (
                  <BookOpen className="w-4 h-4 text-[#25D366] shrink-0" />
                ) : selectedUeId ? (
                  <GraduationCap className="w-4 h-4 text-[#25D366] shrink-0" />
                ) : (
                  <Sparkles className="w-4 h-4 text-[#667781] shrink-0" />
                )}
                <span className="text-xs font-semibold text-[#111B21] dark:text-white truncate">
                  {initialSessionContextId
                    ? "Contexte : Séance en cours"
                    : selectedUeId
                      ? `Contexte : ${
                          availableUes.find((u) => u.id === selectedUeId)?.code
                        } — ${
                          availableUes.find((u) => u.id === selectedUeId)?.title
                        }`
                      : "Aucune UE sélectionnée (mode général)"}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-[#667781] shrink-0 transition-transform ${
                  uePickerOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown UE */}
            {uePickerOpen && (
              <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-[#111B21] rounded-xl shadow-2xl border border-[#E9EDEF] dark:border-[#222E35] max-h-80 overflow-y-auto z-20">
                {/* Option "mode général" */}
                <button
                  onClick={() => {
                    setSelectedUeId(null);
                    setUePickerOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-[#F0F2F5] dark:hover:bg-[#2A3942] transition-colors border-b border-[#E9EDEF] dark:border-[#222E35] ${
                    !selectedUeId ? "bg-[#25D366]/10" : ""
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-[#667781]" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#111B21] dark:text-white">
                      Mode général
                    </p>
                    <p className="text-[10px] text-[#667781] dark:text-[#8696A0]">
                      Réponses hors contexte de cours
                    </p>
                  </div>
                </button>

                {/* Liste des UE */}
                {loadingUes ? (
                  <div className="p-4 text-center text-xs text-[#667781]">
                    Chargement des UE...
                  </div>
                ) : availableUes.length === 0 ? (
                  <div className="p-4 text-center space-y-1">
                    <Lock className="w-5 h-5 mx-auto text-[#667781]" />
                    <p className="text-xs font-bold text-[#111B21] dark:text-white">
                      Aucune UE débloquée
                    </p>
                    <p className="text-[10px] text-[#667781] dark:text-[#8696A0]">
                      Fais une demande de déblocage depuis "Mes UE".
                    </p>
                  </div>
                ) : (
                  availableUes.map((ue) => (
                    <button
                      key={ue.id}
                      onClick={() => {
                        setSelectedUeId(ue.id);
                        setUePickerOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-[#F0F2F5] dark:hover:bg-[#2A3942] transition-colors border-b border-[#E9EDEF] dark:border-[#222E35] last:border-b-0 ${
                        selectedUeId === ue.id ? "bg-[#25D366]/10" : ""
                      }`}
                    >
                      <GraduationCap className="w-4 h-4 text-[#25D366] shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-[#111B21] dark:text-white truncate">
                          {ue.code} — {ue.title}
                        </p>
                        <p className="text-[10px] text-[#667781] dark:text-[#8696A0]">
                          {ue.level} · {ue.semester} · {ue.sessionsCount} séance
                          {ue.sessionsCount > 1 ? "s" : ""}
                        </p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ============ CHAT AREA (seule zone qui scrolle) ============ */}
      <div className="flex-1 min-h-0 bg-[#EFEAE2] dark:bg-[#0B141A] px-3 sm:px-5 py-4 overflow-y-auto space-y-3">
        <div className="max-w-3xl mx-auto space-y-3">
          {messages.map((msg, idx) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={idx}
                className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[88%] sm:max-w-[75%] px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                    isUser
                      ? "bg-[#E7FFDB] dark:bg-[#005C4B] text-[#111B21] dark:text-white rounded-tr-none"
                      : "bg-white dark:bg-[#1F2C34] text-[#111B21] dark:text-white rounded-tl-none border border-[#E9EDEF] dark:border-[#222E35]"
                  }`}
                >
                  {!isUser && (
                    <p className="text-[10px] font-bold text-[#075E54] dark:text-[#25D366] mb-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#25D366]" />
                      Tuteur IA
                    </p>
                  )}
                  <div className="whitespace-pre-wrap wrap-break">
                    {msg.text}
                  </div>
                  <div
                    className={`text-[10px] text-right mt-1 ${
                      isUser
                        ? "text-[#667781]"
                        : "text-slate-400 dark:text-[#8696A0]"
                    }`}
                  >
                    {msg.time} {isUser && "✓✓"}
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-start">
              <div className="bg-white dark:bg-[#1F2C34] px-3.5 py-2.5 rounded-2xl rounded-tl-none border border-[#E9EDEF] dark:border-[#222E35] shadow-xs flex items-center gap-2">
                <span className="text-xs text-[#075E54] dark:text-[#25D366] font-medium">
                  L'assistant réfléchit
                </span>
                <div className="flex items-center gap-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-bounce delay-100"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#25D366] animate-bounce delay-200"></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ============ INPUT ============ */}
      <footer className="bg-[#F0F2F5] dark:bg-[#1F2C34] px-3 sm:px-5 py-3 border-t border-[#E9EDEF] dark:border-[#222E35] shrink-0">
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          <input
            type="text"
            placeholder="Pose ta question sur tes cours..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={loading}
            className="flex-1 text-xs sm:text-sm px-4 py-3 rounded-xl border border-[#E9EDEF] dark:border-[#222E35] bg-white dark:bg-[#111B21] text-[#111B21] dark:text-white focus:outline-none focus:border-[#25D366] disabled:opacity-50"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="w-11 h-11 rounded-xl bg-[#25D366] text-[#075E54] flex items-center justify-center hover:bg-[#1faa54] transition-all disabled:opacity-50 shrink-0 shadow-xs active:scale-95"
          >
            <Send className="w-4 h-4 fill-[#075E54]" />
          </button>
        </div>
      </footer>

      {/* ============ MODAL À PROPOS ============ */}
      {aboutOpen && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => setAboutOpen(false)}
        >
          <div
            className="bg-white dark:bg-[#111B21] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#E9EDEF] dark:border-[#222E35] space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#25D366]/15 flex items-center justify-center">
                <Bot className="w-6 h-6 text-[#25D366]" />
              </div>
              <div>
                <h3 className="font-bold text-base text-[#111B21] dark:text-white">
                  À propos de l'assistant
                </h3>
                <p className="text-[11px] text-[#667781] dark:text-[#8696A0]">
                  Assistant pédagogique IA
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-[#111B21] dark:text-[#E9EDEF] leading-relaxed">
              <p>
                Cet assistant est propulsé par <strong>Google Gemini</strong> et
                entraîné pour t'accompagner dans tes études sur UL Study Flow.
              </p>
              <p>Tu peux lui poser des questions sur :</p>
              <ul className="list-disc list-inside space-y-1 pl-2 text-[#667781] dark:text-[#8696A0]">
                <li>Tes cours et UE</li>
                <li>Les notions complexes</li>
                <li>Des exercices d'entraînement</li>
                <li>Des résumés de chapitres</li>
              </ul>
              <p className="text-[#667781] dark:text-[#8696A0] italic">
                ⚠️ L'assistant peut faire des erreurs. Vérifie toujours les
                informations importantes auprès de tes enseignants.
              </p>
            </div>

            <div className="pt-3 border-t border-[#E9EDEF] dark:border-[#222E35] flex justify-end">
              <button
                onClick={() => setAboutOpen(false)}
                className="px-5 py-2 text-xs font-bold text-[#075E54] bg-[#25D366] rounded-xl hover:bg-[#1faa54]"
              >
                Compris
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============ MODAL CONFIRMATION EFFACER ============ */}
      {confirmClear && (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
          onClick={() => setConfirmClear(false)}
        >
          <div
            className="bg-white dark:bg-[#111B21] rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-[#E9EDEF] dark:border-[#222E35] space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-50 dark:bg-rose-950 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-base text-[#111B21] dark:text-white">
                  Effacer l'historique ?
                </h3>
                <p className="text-xs text-[#667781] dark:text-[#8696A0] mt-1">
                  Toute la conversation actuelle sera définitivement supprimée.
                  Cette action est irréversible.
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E9EDEF] dark:border-[#222E35] flex justify-end gap-2">
              <button
                onClick={() => setConfirmClear(false)}
                className="px-4 py-2 text-xs font-semibold text-[#667781] hover:text-[#111B21] dark:hover:text-white"
              >
                Annuler
              </button>
              <button
                onClick={handleClearHistory}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl"
              >
                Effacer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
