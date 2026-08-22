import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  ChevronDown,
  Calculator,
  ShieldCheck,
  Search,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ColorLinkChatBot: React.FC = () => {
  const {
    chatMessages,
    sendChatMessage,
    isChatOpen,
    setIsChatOpen,
    setIsRequestModalOpen,
    setSelectedRequestForDetail,
    setActiveView,
    requests,
  } = useApp();

  const [inputVal, setInputVal] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isChatOpen) {
      scrollToBottom();
    }
  }, [chatMessages, isChatOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    sendChatMessage(inputVal.trim());
    setInputVal('');
  };

  const handleActionClick = (action: { label: string; actionType: string; payload?: any }) => {
    if (action.actionType === 'calc_sample') {
      sendChatMessage('¿Cuántos galones necesito para 50m² de muro interior?');
    } else if (action.actionType === 'recommend_moisture') {
      sendChatMessage('¿Qué pintura me recomiendan para una pared con humedad y exteriores?');
    } else if (action.actionType === 'track_sol_102') {
      sendChatMessage('¿Cómo va mi solicitud SOL-102?');
    } else if (action.actionType === 'view_catalog') {
      setActiveView('products');
      setIsChatOpen(false);
    } else if (action.actionType === 'open_request_modal') {
      setIsRequestModalOpen(true);
      setIsChatOpen(false);
    } else if (action.actionType === 'open_request' && action.payload) {
      setSelectedRequestForDetail(action.payload);
      setIsChatOpen(false);
    } else if (action.actionType === 'view_inventory') {
      setActiveView('dashboard');
      setIsChatOpen(false);
    }
  };

  return (
    <>
      {/* Floating launcher button in bottom-right corner */}
      {!isChatOpen && (
        <button
          id="floating-chat-toggle-btn"
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-[#1B2A6B] hover:bg-[#142154] text-white p-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-2xl hover:shadow-emerald-500/20 border-2 border-white flex items-center gap-2.5 transition-all transform hover:scale-105 active:scale-95 cursor-pointer group animate-bounce-short"
          title="Hablar con Asesor Virtual ColorLink"
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-[#2FAE6D] text-white flex items-center justify-center font-bold text-sm shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white animate-ping" />
          </div>
          <div className="hidden sm:block text-left pr-1">
            <p className="text-xs font-extrabold text-white leading-tight">Asesor ColorLink</p>
            <p className="text-[10px] text-emerald-300 font-medium">En línea • Asistencia IA</p>
          </div>
        </button>
      )}

      {/* Expandable Chat Drawer Window */}
      {isChatOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-full max-w-sm sm:max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[560px] max-h-[88vh] animate-in fade-in slide-in-from-bottom-6">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-[#142154] to-[#1B2A6B] text-white p-4 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#2FAE6D] flex items-center justify-center text-white shadow-xs">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-sm text-white">Asesor ColorLink IA</h3>
                  <span className="w-2 h-2 rounded-full bg-[#2FAE6D]" />
                </div>
                <p className="text-[10px] text-slate-300">Asistencia técnica & seguimiento en tiempo real</p>
              </div>
            </div>

            <button
              id="close-chat-btn"
              onClick={() => setIsChatOpen(false)}
              className="text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-left bg-slate-50">
            {chatMessages.map((msg) => {
              const isAssistant = msg.sender === 'assistant';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}
                >
                  <div
                    className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs whitespace-pre-line ${
                      isAssistant
                        ? 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
                        : 'bg-[#1B2A6B] text-white rounded-tr-xs font-medium'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>

                  {/* Suggested action chips if any */}
                  {msg.suggestedActions && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {msg.suggestedActions.map((action, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleActionClick(action)}
                          className="text-[11px] font-bold text-[#1B2A6B] bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-xl border border-blue-200 transition-all cursor-pointer shadow-2xs flex items-center gap-1"
                        >
                          <span>{action.label}</span>
                          <ArrowRight className="w-3 h-3 text-[#2FAE6D]" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Form */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Pregúntale sobre pinturas, m² o tu orden..."
              className="flex-1 px-3.5 py-2.5 bg-slate-100 focus:bg-white border border-transparent focus:border-[#1B2A6B] rounded-full text-xs text-slate-800 outline-hidden transition-all"
            />
            <button
              type="submit"
              id="send-chat-msg-btn"
              className="w-9 h-9 rounded-full bg-[#2FAE6D] hover:bg-[#26975d] text-white flex items-center justify-center shadow-md transition-all cursor-pointer shrink-0 disabled:opacity-50"
              disabled={!inputVal.trim()}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
