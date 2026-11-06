import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Calculator,
  ShieldCheck,
  Search,
  ArrowRight,
  ShoppingBag,
  Palette,
  CheckCircle2,
  Maximize2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PaintProduct } from '../types';

export const ColorLinkChatBot: React.FC = () => {
  const {
    chatMessages,
    sendChatMessage,
    isChatOpen,
    setIsChatOpen,
    setIsRequestModalOpen,
    setSelectedRequestForDetail,
    setActiveView,
    setSimulatorScenario,
    addToCart,
    setIsCartOpen,
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
    if (action.actionType === 'calc_sample_4x26') {
      sendChatMessage('Calcula cuánta pintura necesito para una pared de 4m de ancho por 2.6m de alto con 1 puerta');
    } else if (action.actionType === 'calc_sample_25m2') {
      sendChatMessage('¿Cuánta pintura necesito para un área de 25 metros cuadrados a 2 manos?');
    } else if (action.actionType === 'calc_prompt') {
      sendChatMessage('¿Cómo calculo la cantidad de pintura por m²?');
    } else if (action.actionType === 'moisture_prompt') {
      sendChatMessage('Tengo un problema de humedad en la pared del baño con moho');
    } else if (action.actionType === 'search_white_washable') {
      sendChatMessage('Busco pintura lavable blanca para sala');
    } else if (action.actionType === 'buy_viniltex_sample') {
      sendChatMessage('Agrégame 2 galones de Viniltex blanco al carrito');
    } else if (action.actionType === 'sim_sala_verde_menta') {
      sendChatMessage('Quiero ver la Sala de Estar de color Verde Menta');
    } else if (action.actionType === 'sim_habitacion_azul') {
      sendChatMessage('Quiero ver la Habitación con Azul Marino');
    } else if (action.actionType === 'sim_exterior_terracota') {
      sendChatMessage('Quiero ver el Exterior de Casa en Terracota Colonial');
    } else if (action.actionType === 'sim_oficina_acento') {
      sendChatMessage('Quiero pintar la pared de acento de la Oficina');
    } else if (action.actionType === 'navigate_simulator') {
      setActiveView('simulator');
      setIsChatOpen(false);
    } else if (action.actionType === 'navigate_simulator_exterior') {
      setSimulatorScenario('exterior_casa');
      setActiveView('simulator');
      setIsChatOpen(false);
    } else if (action.actionType === 'navigate_simulator_sala') {
      setSimulatorScenario('sala_de_estar');
      setActiveView('simulator');
      setIsChatOpen(false);
    } else if (action.actionType === 'navigate_cart') {
      setIsCartOpen(true);
    } else if (action.actionType === 'navigate_catalog') {
      setActiveView('products');
      setIsChatOpen(false);
    } else if (action.actionType === 'navigate_catalog_wood') {
      setActiveView('products');
      setIsChatOpen(false);
    } else if (action.actionType === 'add_rec_to_cart' && action.payload) {
      addToCart({ sku: action.payload, quantity: 1 });
      setIsCartOpen(true);
    } else if (action.actionType === 'open_request_modal') {
      setIsRequestModalOpen(true);
      setIsChatOpen(false);
    } else if (action.actionType === 'open_request' && action.payload) {
      setSelectedRequestForDetail(action.payload);
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
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-[#142154] to-[#1B2A6B] hover:from-[#0d163a] hover:to-[#142154] text-white p-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-2xl hover:shadow-emerald-500/25 border-2 border-white flex items-center gap-2.5 transition-all transform hover:scale-105 active:scale-95 cursor-pointer group"
          title="Hablar con PintuBot"
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-[#2FAE6D] text-white flex items-center justify-center font-bold text-sm shadow-md">
              <Bot className="w-4 h-4" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white animate-ping" />
          </div>
          <div className="hidden sm:block text-left pr-1">
            <p className="text-xs font-black text-white leading-tight flex items-center gap-1">
              <span>PintuBot</span>
              <Sparkles className="w-3 h-3 text-amber-300" />
            </p>
            <p className="text-[10px] text-emerald-300 font-medium">Asesor Técnico & Visual</p>
          </div>
        </button>
      )}

      {/* Expandable Chat Drawer Window */}
      {isChatOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-full max-w-sm sm:max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[620px] max-h-[90vh] animate-in fade-in slide-in-from-bottom-6">
          
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-[#142154] via-[#1B2A6B] to-[#142154] text-white p-4 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#2FAE6D] flex items-center justify-center text-white shadow-xs">
                <Bot className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-extrabold text-sm text-white">PintuBot</h3>
                  <span className="text-[10px] bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-400/30">
                    Asesor Oficial
                  </span>
                </div>
                <p className="text-[10px] text-slate-300">Diagnóstico técnico, m², simulador & compras</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsCartOpen(true)}
                className="text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                title="Abrir Carrito"
              >
                <ShoppingBag className="w-4 h-4" />
              </button>
              <button
                id="close-chat-btn"
                onClick={() => setIsChatOpen(false)}
                className="text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-left bg-slate-50">
            {chatMessages.map((msg) => {
              const isAssistant = msg.sender === 'assistant';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isAssistant ? 'items-start' : 'items-end'}`}
                >
                  <div
                    className={`max-w-[90%] p-3.5 rounded-2xl text-xs leading-relaxed shadow-2xs whitespace-pre-line ${
                      isAssistant
                        ? 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs'
                        : 'bg-[#1B2A6B] text-white rounded-tr-xs font-medium'
                    }`}
                  >
                    {msg.text}

                    {/* Visual Simulation Image Preview in Chat Bubble */}
                    {msg.simulationImageUrl && (
                      <div className="mt-3 rounded-xl overflow-hidden border border-slate-200 bg-slate-950 shadow-md">
                        <div className="relative aspect-video">
                          <img
                            src={msg.simulationImageUrl}
                            alt={`Simulación ${msg.simulationSpace || 'Espacio'} en ${msg.simulationColor || 'Color'}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                            <span className="bg-slate-900/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs border border-white/20">
                              {msg.simulationSpace} • {msg.simulationColor}
                            </span>
                            <span className="bg-[#2FAE6D] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-xs">
                              Muebles intactos
                            </span>
                          </div>
                        </div>

                        <div className="p-2.5 bg-slate-900 text-white flex items-center justify-between gap-2">
                          <span className="text-[10px] text-slate-300">
                            Renderizado con iluminación natural y sombras
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveView('simulator');
                              setIsChatOpen(false);
                            }}
                            className="px-2.5 py-1 bg-[#2FAE6D] hover:bg-[#27995f] text-white font-bold rounded-lg text-[10px] flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                          >
                            <Maximize2 className="w-3 h-3" />
                            <span>Abrir Simulador 3D</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Interactive Product Cards in Chat Bubble */}
                    {msg.productCards && msg.productCards.length > 0 && (
                      <div className="mt-3 space-y-2 pt-2 border-t border-slate-100">
                        <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                          Productos Recomendados:
                        </p>
                        {msg.productCards.map((product: PaintProduct) => (
                          <div
                            key={product.id}
                            className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2.5"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-10 h-10 rounded-lg overflow-hidden bg-white border border-slate-200 shrink-0">
                                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="min-w-0">
                                <h5 className="font-bold text-[11px] text-slate-900 truncate">{product.name}</h5>
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                                  <span>SKU: {product.code}</span>
                                  <span>•</span>
                                  <span className="font-bold text-emerald-700">
                                    ${product.pricePerGallonCOP.toLocaleString('es-CO')}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                addToCart({ sku: product.code, quantity: 1 });
                                setIsCartOpen(true);
                              }}
                              className="px-2.5 py-1.5 bg-[#2FAE6D] hover:bg-[#27995f] text-white text-[10px] font-bold rounded-lg flex items-center gap-1 shrink-0 shadow-2xs cursor-pointer transition-colors"
                            >
                              <ShoppingBag className="w-3 h-3" />
                              <span>Agregar</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <span className="text-[9px] text-slate-400 mt-1 px-1">{msg.timestamp}</span>

                  {/* Suggested Action Chips */}
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
              placeholder="Pregúntale a PintuBot (ej: pintar sala verde menta, m² o carrito)..."
              className="flex-1 px-3.5 py-2.5 bg-slate-100 focus:bg-white border border-transparent focus:border-[#1B2A6B] rounded-full text-xs text-slate-800 outline-hidden transition-all"
            />
            <button
              type="submit"
              id="send-chat-msg-btn"
              className="w-9 h-9 rounded-full bg-[#2FAE6D] hover:bg-[#26975d] text-white flex items-center justify-center shadow-md transition-all cursor-pointer shrink-0 disabled:opacity-50"
              disabled={!inputVal.trim()}
              title="Enviar consulta a PintuBot"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
