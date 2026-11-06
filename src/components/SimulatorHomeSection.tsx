import React from 'react';
import {
  Sparkles,
  ArrowRight,
  Palette,
  ShieldCheck,
  CheckCircle2,
  Layers,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SimulatorHomeSection: React.FC = () => {
  const { setActiveView } = useApp();

  const handleOpenSimulator = () => {
    setActiveView('simulator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="py-10 sm:py-14 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white relative overflow-hidden border-y border-slate-800">
      {/* Decorative ambient glows */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-[#2FAE6D]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="bg-gradient-to-br from-slate-800/90 via-slate-800/60 to-slate-900/90 border border-slate-700/80 rounded-3xl p-6 sm:p-10 lg:p-12 shadow-2xl relative overflow-hidden">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-4 text-left">
              <div className="inline-flex items-center gap-2 bg-[#2FAE6D]/20 border border-[#2FAE6D]/40 text-[#2FAE6D] px-3.5 py-1 rounded-full text-xs font-black tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Herramienta Interactiva Oficial</span>
              </div>

              {/* Title exactly as requested: 'Simulador de Color' */}
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                Simulador de Color
              </h2>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
                Prueba en tiempo real cómo lucen tus paredes y fachadas con más de 100 variaciones fotorrealistas. Los muebles, pisos, ventanas y techos se conservan 100% intactos con su luz y sombras originales.
              </p>

              {/* Feature Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2FAE6D] shrink-0" />
                  <span>5 espacios: Sala, Cocina, Habitación, Fachada y Oficina.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2FAE6D] shrink-0" />
                  <span>Mobiliario y pisos 100% aislados e intactos.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2FAE6D] shrink-0" />
                  <span>20 tonos reales coordinados por cada espacio.</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2FAE6D] shrink-0" />
                  <span>Cálculo directo de galones y compra en 1 clic.</span>
                </div>
              </div>

              {/* Direct Access Button */}
              <div className="pt-4">
                <button
                  id="cta-home-enter-simulator-btn"
                  onClick={handleOpenSimulator}
                  className="bg-gradient-to-r from-[#2FAE6D] to-emerald-500 hover:from-[#27995f] hover:to-emerald-400 text-white font-extrabold px-8 py-4 rounded-2xl text-base flex items-center justify-center sm:justify-start gap-3 shadow-xl shadow-emerald-950/60 border border-emerald-400/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer ring-2 ring-emerald-400/40 w-full sm:w-auto"
                >
                  <Palette className="w-5 h-5 text-white" />
                  <span>Ingresar al Simulador de Color</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Right Teaser Visual */}
            <div className="lg:col-span-5">
              <div
                onClick={handleOpenSimulator}
                className="group relative rounded-2xl overflow-hidden border border-slate-600/80 shadow-2xl bg-slate-950 cursor-pointer aspect-16/10 transform transition-all duration-300 hover:scale-[1.02] hover:border-emerald-400/60"
              >
                <img
                  src="/assets/simulator/sala_variations/verde_menta_claro.jpg"
                  alt="Simulador de Color Pintuco"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                
                {/* Floating Badges */}
                <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-black bg-slate-900/90 text-white backdrop-blur-xs border border-white/10 flex items-center gap-1.5 shadow-md">
                  <Layers className="w-3 h-3 text-emerald-400" />
                  <span>5 Espacios • 100 Tonos</span>
                </span>

                <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#2FAE6D] text-white flex items-center gap-1 shadow-md">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Fotorrealismo</span>
                </span>

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                  <div>
                    <span className="text-[11px] text-emerald-300 font-bold block">Clic para interactuar</span>
                    <strong className="text-sm font-black drop-shadow-xs">Explorar Simulador de Color</strong>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-white/20 group-hover:bg-[#2FAE6D] backdrop-blur-xs flex items-center justify-center transition-colors">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
