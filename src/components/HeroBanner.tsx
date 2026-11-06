import React from 'react';
import {
  Calculator,
  ArrowRight,
  ShieldCheck,
  Truck,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const HeroBanner: React.FC = () => {
  const { currentUser, isLoggedIn, setIsRequestModalOpen, setActiveView } = useApp();

  const handleExploreCatalog = () => {
    const el = document.getElementById('catalogo-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      setActiveView('products');
    }
  };

  return (
    <section className="relative overflow-hidden bg-slate-950 text-white py-16 md:py-24 px-4 sm:px-6 lg:px-8 border-b border-slate-900">
      {/* Background High-Impact Imagery with Subtle Overlay (KOAJ / Retail Style) */}
      <div className="absolute inset-0 pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=80"
          alt="Arquitectura moderna Pintuco"
          className="w-full h-full object-cover opacity-20 filter contrast-125"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/60" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#2FAE6D]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-[#1B2A6B]/30 rounded-full blur-3xl pointer-events-none" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10 text-center sm:text-left">
        
        {/* Welcome or Brand Badge */}
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/15 text-xs font-semibold text-emerald-300 mb-6">
          <Sparkles className="w-3.5 h-3.5 text-[#2FAE6D]" />
          <span>
            {isLoggedIn && currentUser ? `¡Hola, ${currentUser.name}!` : 'ColorLink • Nueva Experiencia Pintuco'}
          </span>
        </div>

        {/* Minimalist Punchy Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-[1.1] text-white max-w-4xl">
          El color perfecto para <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-emerald-300">
            cada espacio de tu vida.
          </span>
        </h1>

        {/* Direct Subtitle (Under 12 words) */}
        <p className="mt-4 text-base sm:text-lg text-slate-300 font-normal max-w-2xl leading-relaxed">
          Pinturas de alto desempeño con cálculo exacto de m² y garantía certificada.
        </p>

        {/* Action Buttons (Retail CTAs) */}
        <div className="mt-8 flex flex-wrap items-center justify-center sm:justify-start gap-3">
          <button
            id="hero-simulator-cta-btn"
            onClick={() => setActiveView('simulator')}
            className="bg-gradient-to-r from-blue-600 to-[#1B2A6B] hover:from-blue-500 hover:to-[#17245c] text-white px-7 py-3.5 rounded-2xl font-bold text-sm sm:text-base flex items-center gap-2.5 shadow-xl shadow-blue-950/40 border border-white/20 transition-all transform active:scale-98 cursor-pointer ring-2 ring-blue-400/40 hover:shadow-blue-500/25"
          >
            <Sparkles className="w-5 h-5 text-amber-300" />
            <span>Simulador de Color</span>
            <ArrowRight className="w-4 h-4 ml-0.5" />
          </button>

          <button
            id="hero-register-need-btn"
            onClick={() => setIsRequestModalOpen(true)}
            className="bg-[#2FAE6D] hover:bg-[#27985f] text-white px-6 py-3.5 rounded-2xl font-bold text-sm sm:text-base flex items-center gap-2 shadow-lg shadow-emerald-950/30 transition-all transform active:scale-98 cursor-pointer"
          >
            <Calculator className="w-4 h-4" />
            <span>Cotizar Proyecto m²</span>
          </button>

          <button
            id="hero-explore-solutions-btn"
            onClick={handleExploreCatalog}
            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-5 py-3.5 rounded-2xl font-semibold text-sm sm:text-base flex items-center gap-2 transition-all cursor-pointer backdrop-blur-xs"
          >
            <ShoppingBag className="w-4 h-4 text-slate-300" />
            <span>Catálogo</span>
          </button>
        </div>

        {/* Minimalist Value Trust Bar */}
        <div className="mt-12 pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <Truck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Despacho a nivel nacional</span>
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Garantía oficial Pintuco</span>
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Reserva de lote en tiempo real</span>
          </div>
        </div>

      </div>
    </section>
  );
};
