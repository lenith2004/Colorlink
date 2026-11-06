import React from 'react';
import {
  Sparkles,
  ArrowRight,
  Eye,
  CheckCircle2,
  Layers,
  Palette,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ROOM_SCENARIOS, RoomScenario } from './RealisticColorSimulator';

export const SimulatorHomeSection: React.FC = () => {
  const { setActiveView, setSimulatorScenario } = useApp();

  const handleLaunchScenario = (scenarioId: string) => {
    setSimulatorScenario(scenarioId);
    setActiveView('simulator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="py-12 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white relative overflow-hidden border-y border-slate-800">
      {/* Decorative ambient glows */}
      <div className="absolute top-0 right-1/3 w-80 h-80 bg-[#2FAE6D]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Header & Master CTA Row */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-slate-800">
          <div className="space-y-3 max-w-2xl text-left">
            <div className="inline-flex items-center gap-2 bg-[#2FAE6D]/20 border border-[#2FAE6D]/40 text-[#2FAE6D] px-3.5 py-1 rounded-full text-xs font-black tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Simulador Arquitectónico Pintuco®</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Pruébale color a tus muros en <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300">
                escenarios reales con 1 solo clic
              </span>
            </h2>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Muebles, pisos, ventanas, electrodomésticos y techos están 100% aislados: conservan sus texturas y sombras originales. Elige uno de los 5 espacios autónomos y simula en tiempo real.
            </p>
          </div>

          {/* Master 1-Click CTA Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              id="cta-home-simulator-main-btn"
              onClick={() => {
                setActiveView('simulator');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="bg-gradient-to-r from-[#2FAE6D] to-emerald-500 hover:from-[#27995f] hover:to-emerald-400 text-white font-extrabold px-7 py-4 rounded-2xl text-sm sm:text-base flex items-center justify-center gap-3 shadow-xl shadow-emerald-950/50 border border-emerald-400/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer ring-2 ring-emerald-400/40"
            >
              <Palette className="w-5 h-5 text-white" />
              <span>Abrir Simulador Completo</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>

        {/* 5 Independent Scenario Cards Grid */}
        <div className="pt-8">
          <div className="flex items-center justify-between mb-5 text-left">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-300">
                5 Espacios Listos para Simulación Individual:
              </h3>
            </div>
            <span className="text-xs text-slate-400 hidden sm:inline">
              Haz clic en cualquier habitación para probar color de inmediato
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {ROOM_SCENARIOS.map((room: RoomScenario) => (
              <div
                key={room.id}
                onClick={() => handleLaunchScenario(room.id)}
                className="group bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/60 rounded-2xl overflow-hidden flex flex-col text-left transition-all duration-300 cursor-pointer hover:shadow-xl hover:shadow-emerald-950/20 transform hover:-translate-y-1"
              >
                {/* Photo Thumbnail */}
                <div className="relative aspect-4/3 overflow-hidden bg-slate-900">
                  <img
                    src={
                      room.id === 'sala_de_estar'
                        ? '/assets/simulator/sala_variations/verde_menta_claro.jpg'
                        : room.id === 'cocina'
                        ? '/assets/simulator/cocina_variations/verde_menta_claro.jpg'
                        : room.id === 'habitacion'
                        ? '/assets/simulator/habitacion_variations/verde_menta_claro.jpg'
                        : room.imageSrc
                    }
                    alt={room.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  
                  {/* Category tag */}
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-900/90 text-white backdrop-blur-xs border border-white/10">
                    {room.category}
                  </span>

                  {/* Mask isolation pill indicator or 20 Tonos Reales */}
                  {room.id === 'sala_de_estar' || room.id === 'cocina' || room.id === 'habitacion' ? (
                    <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md text-[9px] font-bold bg-emerald-500 text-white backdrop-blur-xs flex items-center gap-1 shadow-xs">
                      <Sparkles className="w-2.5 h-2.5 text-amber-300" />
                      20 Tonos Reales
                    </span>
                  ) : (
                    <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md text-[9px] font-bold bg-emerald-500/90 text-white backdrop-blur-xs flex items-center gap-1">
                      <ShieldCheck className="w-2.5 h-2.5" />
                      Muebles Aislados
                    </span>
                  )}

                  {/* Room name on thumbnail bottom */}
                  <div className="absolute bottom-2 left-2.5 right-2.5">
                    <h4 className="text-white font-extrabold text-sm sm:text-base drop-shadow-xs">
                      {room.name}
                    </h4>
                  </div>
                </div>

                {/* Content & Direct Action */}
                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <p className="text-[11px] text-slate-300 font-medium line-clamp-2 leading-relaxed">
                      {room.description}
                    </p>
                    <p className="text-[10px] text-emerald-400 font-semibold mt-1 truncate">
                      {room.recommendedProduct}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLaunchScenario(room.id);
                    }}
                    className="w-full py-2 px-3 bg-white/10 hover:bg-[#2FAE6D] text-white hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all group-hover:bg-[#2FAE6D]"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Simular {room.name}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Pillars Strip */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300 text-left">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#2FAE6D] shrink-0" />
            <span>5 archivos autónomos independientes (sin collage).</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#2FAE6D] shrink-0" />
            <span>Máscaras de canal alfa con muebles y pisos intactos.</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#2FAE6D] shrink-0" />
            <span>Carta oficial de colores Pintuco + cálculo de galones m².</span>
          </div>
        </div>

      </div>
    </section>
  );
};
