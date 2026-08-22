import React from 'react';
import {
  Sparkles,
  Calculator,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Zap,
  TrendingUp,
  Layers,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const HeroBanner: React.FC = () => {
  const { currentUser, isLoggedIn, setIsRequestModalOpen, setActiveView, requests } = useApp();

  const totalProjects = requests.length;
  const inProgressProjects = requests.filter((r) => r.status !== 'completado').length;

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#0e1738] via-[#1B2A6B] to-[#162758] text-white py-12 md:py-16 px-4 sm:px-6 lg:px-8 border-b border-[#1B2A6B]">
      {/* Decorative gradient glowing spheres */}
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#2FAE6D]/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Copy & Actions */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {isLoggedIn && currentUser ? (
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500/25 via-blue-500/20 to-emerald-500/15 backdrop-blur-md px-4 py-2 rounded-2xl border border-emerald-400/50 text-xs sm:text-sm text-white shadow-lg animate-in fade-in">
                <span className="text-xl">👋</span>
                <div>
                  <span className="font-extrabold text-emerald-300">¡Hola, {currentUser.name}! </span>
                  <span className="text-slate-200">Te damos la bienvenida a tu portal de proyectos Pintuco.</span>
                </div>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-xs font-semibold text-emerald-300">
                <Sparkles className="w-3.5 h-3.5 text-[#2FAE6D]" />
                <span>Ecosistema Digital Inteligente Pintuco</span>
              </div>
            )}

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight text-white">
              Conectamos tu necesidad de recubrimientos con una solución{' '}
              <span className="text-[#2FAE6D] underline decoration-[#2FAE6D]/40 decoration-4 underline-offset-4">
                técnica, comercial y de calidad
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-200 font-normal leading-relaxed max-w-2xl">
              Olvídate de la fragmentación entre cotizaciones, inventarios y despacho. 
              ColorLink automatiza el cálculo de material en m², valida stock por lote en tiempo real y certifica la calidad antes del despacho en obra.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                id="hero-register-need-btn"
                onClick={() => setIsRequestModalOpen(true)}
                className="bg-white text-[#1B2A6B] hover:bg-slate-100 hover:shadow-xl px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base flex items-center gap-2 transition-all transform active:scale-98 cursor-pointer shadow-lg group"
              >
                <Calculator className="w-4 h-4 text-[#2FAE6D] group-hover:scale-110 transition-transform" />
                <span>Registrar Necesidad / Cotizar m²</span>
                <ArrowRight className="w-4 h-4 text-[#1B2A6B]" />
              </button>

              <button
                id="hero-explore-solutions-btn"
                onClick={() => setActiveView('dashboard')}
                className="bg-white/10 hover:bg-white/20 border border-white/30 text-white px-5 py-3.5 rounded-xl font-semibold text-sm sm:text-base flex items-center gap-2 transition-all cursor-pointer backdrop-blur-xs"
              >
                <Layers className="w-4 h-4 text-slate-300" />
                <span>Ver Panel de Gestión</span>
              </button>
            </div>

            {/* Micro badges list */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-white/15 text-xs text-slate-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2FAE6D] shrink-0" />
                <span>Cálculo m² & manos con IA</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Inventario y lotes en vivo</span>
              </div>
              <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Certificado de Calidad ISO</span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Ecosystem Interactive Card */}
          <div className="lg:col-span-5">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-white/20 shadow-2xl text-left space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/15">
                <div>
                  <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Flujo Activo en Tiempo Real</p>
                  <p className="text-base font-bold text-white">Hub de Operaciones ColorLink</p>
                </div>
                <span className="flex items-center gap-1.5 bg-[#2FAE6D]/30 text-[#2FAE6D] text-xs font-bold px-2.5 py-1 rounded-full border border-[#2FAE6D]/50 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-[#2FAE6D]" /> En línea
                </span>
              </div>

              {/* Ecosystem Mini Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-black/20 p-3 rounded-xl border border-white/10">
                  <p className="text-[11px] text-slate-300">Solicitudes Gestionadas</p>
                  <p className="text-2xl font-extrabold text-white">{totalProjects}</p>
                  <p className="text-[10px] text-emerald-300 flex items-center gap-1 mt-0.5">
                    <TrendingUp className="w-3 h-3" /> Omnicanal activo
                  </p>
                </div>
                <div className="bg-black/20 p-3 rounded-xl border border-white/10">
                  <p className="text-[11px] text-slate-300">En Proceso Técnico / Calidad</p>
                  <p className="text-2xl font-extrabold text-[#2FAE6D]">{inProgressProjects}</p>
                  <p className="text-[10px] text-slate-300 mt-0.5">Sin cuellos de botella</p>
                </div>
              </div>

              {/* 5 Stages Interactive Preview */}
              <div className="space-y-2 pt-1">
                <p className="text-xs font-semibold text-slate-300">Ciclo Integrado de Atención:</p>
                <div className="grid grid-cols-5 gap-1.5 text-center">
                  {[
                    { step: '1', title: 'Necesidad', color: 'bg-blue-500' },
                    { step: '2', title: 'Técnica', color: 'bg-sky-500' },
                    { step: '3', title: 'Stock', color: 'bg-amber-500' },
                    { step: '4', title: 'Servicio', color: 'bg-purple-500' },
                    { step: '5', title: 'Calidad', color: 'bg-emerald-500' },
                  ].map((s) => (
                    <div key={s.step} className="bg-white/5 hover:bg-white/15 p-2 rounded-lg border border-white/10 transition-colors">
                      <div className={`w-5 h-5 mx-auto rounded-full ${s.color} text-[10px] font-bold flex items-center justify-center text-white mb-1`}>
                        {s.step}
                      </div>
                      <p className="text-[10px] font-medium text-slate-200 truncate">{s.title}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-gradient-to-r from-[#2FAE6D]/20 to-transparent rounded-xl border border-[#2FAE6D]/30 flex items-center justify-between text-xs">
                <span className="text-slate-200">¿Requieres asistencia especializada?</span>
                <button
                  id="hero-chat-prompt-btn"
                  onClick={() => {
                    const el = document.getElementById('floating-chat-toggle-btn');
                    if (el) el.click();
                  }}
                  className="font-bold text-[#2FAE6D] hover:text-white underline cursor-pointer"
                >
                  Hablar con Asesor IA ➔
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
