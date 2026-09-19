import React, { useState } from 'react';
import {
  Sparkles,
  Sun,
  Moon,
  Lamp,
  Layers,
  Check,
  Pipette,
  Eye,
  SlidersHorizontal,
  Info,
  Maximize2,
  RefreshCw,
  Palette
} from 'lucide-react';
import { SurfaceType, FinishType, EnvironmentType, ColorPaletteItem } from '../types';
import { COLOR_PALETTES } from '../data/initialData';

interface ColorSimulationStudioProps {
  selectedColorName: string;
  selectedColorHex: string;
  onSelectColor: (color: ColorPaletteItem) => void;
  surfaceType: SurfaceType;
  finish: FinishType;
  environment: EnvironmentType;
  productName?: string;
}

type SceneView = 'interior_room' | 'exterior_facade' | 'macro_texture';
type LightingMode = 'daylight' | 'warm' | 'cool';

export const ColorSimulationStudio: React.FC<ColorSimulationStudioProps> = ({
  selectedColorName,
  selectedColorHex,
  onSelectColor,
  surfaceType,
  finish,
  environment,
  productName = 'Viniltex Avanzado® Pintuco',
}) => {
  const [activeScene, setActiveScene] = useState<SceneView>(
    environment === 'exterior' ? 'exterior_facade' : 'interior_room'
  );
  const [lighting, setLighting] = useState<LightingMode>('daylight');
  const [splitComparison, setSplitComparison] = useState<boolean>(false);
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [customHex, setCustomHex] = useState<string>(selectedColorHex);
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);

  // Find currently active color details or fallback
  const currentColor: ColorPaletteItem = COLOR_PALETTES.find(
    (c) => c.name.toLowerCase() === selectedColorName.toLowerCase()
  ) || {
    name: selectedColorName || 'Color Personalizado',
    hex: selectedColorHex || '#1B2A6B',
    category: 'Personalizado',
    code: 'PIN-CUSTOM',
    lrv: 35,
    family: 'Tintometría Especial',
    description: 'Tono formulado a medida mediante el sistema de tintometría computarizado Pintuco.',
  };

  // Categories extracted from palettes
  const categories = ['Todos', 'Blancos & Neutros', 'Cálidos & Tierras', 'Vivos & Tendencia', 'Corporativo & Acentos', 'Industrial & Seguridad'];

  const filteredPalettes = activeCategory === 'Todos'
    ? COLOR_PALETTES
    : COLOR_PALETTES.filter((c) => c.category === activeCategory);

  // Calculate adjusted color for scene lighting simulation
  const getLightingFilter = () => {
    switch (lighting) {
      case 'warm':
        // Warm 3000K: golden amber tint
        return {
          ambientTint: 'rgba(251, 191, 36, 0.12)',
          highlight: 'rgba(254, 243, 199, 0.35)',
          shadow: 'rgba(69, 26, 3, 0.25)',
          name: 'Luz Cálida Interior (3000K)',
          badge: '🟡 Cálida 3000K',
        };
      case 'cool':
        // Cool 6500K: clean daylight blue tint
        return {
          ambientTint: 'rgba(125, 211, 252, 0.10)',
          highlight: 'rgba(224, 242, 254, 0.40)',
          shadow: 'rgba(15, 23, 42, 0.30)',
          name: 'Luz Fría / LED Oficina (6500K)',
          badge: '🔵 Fría 6500K',
        };
      case 'daylight':
      default:
        // Daylight 5500K: pure natural daylight
        return {
          ambientTint: 'rgba(255, 255, 255, 0.05)',
          highlight: 'rgba(255, 255, 255, 0.25)',
          shadow: 'rgba(0, 0, 0, 0.20)',
          name: 'Luz Día Natural (5500K)',
          badge: '☀️ Natural 5500K',
        };
    }
  };

  const lightingProps = getLightingFilter();

  // Acabado sheen descriptor
  const getFinishDetails = () => {
    switch (finish) {
      case 'mate':
        return {
          label: 'Mate Antirreflejo',
          specularGlow: 'opacity-0',
          textureNoise: '0.04',
          description: 'Sin reflejos molestos; disimula imperfecciones del muro.',
        };
      case 'satinado':
        return {
          label: 'Satinado Elegante',
          specularGlow: 'opacity-25',
          textureNoise: '0.02',
          description: 'Reflejo sedoso suave; alta lavabilidad y elegancia visual.',
        };
      case 'semibrillante':
        return {
          label: 'Semibrillante',
          specularGlow: 'opacity-40',
          textureNoise: '0.01',
          description: 'Reflejo definido de luz; máxima resistencia a la humedad.',
        };
      case 'brillante':
        return {
          label: 'Brillante Duradero',
          specularGlow: 'opacity-65',
          textureNoise: '0.0',
          description: 'Alto brillo especular; resalta el color con destello nítido.',
        };
      case 'epoxico_antideslizante':
        return {
          label: 'Epóxico Antideslizante',
          specularGlow: 'opacity-30',
          textureNoise: '0.08',
          description: 'Capa vitrificada de alta resistencia química con microtextura.',
        };
    }
  };

  const finishDetails = getFinishDetails();

  const handleCustomColorChange = (hex: string) => {
    setCustomHex(hex);
    setIsCustomMode(true);
    onSelectColor({
      name: `Tono a Medida (${hex.toUpperCase()})`,
      hex: hex,
      category: 'Personalizado',
      code: 'PIN-CUSTOM',
      lrv: 40,
      family: 'Tintometría Especial Pintuco',
      description: `Fórmula individualizada según carta o muestra física del cliente (${hex.toUpperCase()}).`,
    });
  };

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-xl space-y-4">
      {/* Simulator Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1B2A6B] to-[#2FAE6D] flex items-center justify-center text-white shadow-md">
            <Palette className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white tracking-wide">
                Simulador de Color en Vivo Pintuco®
              </h4>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-extrabold px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                <span>Tiempo Real</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Visualiza con precisión cómo lucirá el tono en obra antes de confirmar tu cotización.
            </p>
          </div>
        </div>

        {/* Scene View Mode Toggles */}
        <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveScene('interior_room')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              activeScene === 'interior_room'
                ? 'bg-[#1B2A6B] text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Muro Interior
          </button>
          <button
            type="button"
            onClick={() => setActiveScene('exterior_facade')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              activeScene === 'exterior_facade'
                ? 'bg-[#1B2A6B] text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Fachada Exterior
          </button>
          <button
            type="button"
            onClick={() => setActiveScene('macro_texture')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              activeScene === 'macro_texture'
                ? 'bg-[#1B2A6B] text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Zoom Acabado
          </button>
        </div>
      </div>

      {/* Main Simulation Stage & Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
        {/* Left / Center: Interactive Simulated Canvas Viewport */}
        <div className="lg:col-span-7 space-y-2">
          <div className="relative w-full h-56 sm:h-64 rounded-xl overflow-hidden border border-slate-700 bg-slate-950 shadow-inner group">
            {/* Split Comparison Indicator if active */}
            {splitComparison && (
              <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 bg-black/70 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/20 text-[10px] font-bold text-white flex items-center gap-2">
                <span>Base Muro Blanco (50%)</span>
                <span className="text-[#2FAE6D]">|</span>
                <span className="text-[#2FAE6D]">{currentColor.name}</span>
              </div>
            )}

            {/* SCENE 1: INTERIOR ROOM */}
            {activeScene === 'interior_room' && (
              <div className="relative w-full h-full select-none overflow-hidden">
                {/* Simulated Main Wall */}
                <div
                  className="absolute inset-0 transition-colors duration-500"
                  style={{
                    backgroundColor: splitComparison ? '#F9FAFB' : currentColor.hex,
                  }}
                >
                  {/* Right half of split wall when comparison is ON */}
                  {splitComparison && (
                    <div
                      className="absolute top-0 right-0 bottom-0 w-1/2 transition-colors duration-500 border-l-2 border-white shadow-2xl"
                      style={{ backgroundColor: currentColor.hex }}
                    />
                  )}

                  {/* Surface Texture Simulation Overlay */}
                  <div
                    className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-20"
                    style={{
                      backgroundImage: `radial-gradient(circle at 50% 30%, transparent 20%, rgba(0,0,0,0.4) 100%)`,
                    }}
                  />

                  {/* Lighting Temperature Tint */}
                  <div
                    className="absolute inset-0 pointer-events-none transition-colors duration-500"
                    style={{ backgroundColor: lightingProps.ambientTint }}
                  />

                  {/* Ceiling Glow / Lighting highlight based on finish */}
                  <div
                    className={`absolute -top-10 left-1/4 w-1/2 h-32 rounded-full blur-2xl pointer-events-none transition-opacity duration-300 ${finishDetails.specularGlow}`}
                    style={{ backgroundColor: lightingProps.highlight }}
                  />
                </div>

                {/* Architectural Decor & Foreground Elements (Gives Depth and Real Scale) */}
                {/* Ceiling cornice */}
                <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-slate-200 to-slate-300 border-b border-slate-400/40 shadow-xs z-10" />

                {/* Hardwood / Architectural Flooring */}
                <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-[#452714] via-[#5d351b] to-[#784725] border-t-4 border-white shadow-2xl z-10">
                  {/* Wooden Planks Pattern */}
                  <div className="w-full h-full opacity-30 flex divide-x divide-black/40">
                    <div className="flex-1" />
                    <div className="flex-1" />
                    <div className="flex-1" />
                    <div className="flex-1" />
                  </div>
                </div>

                {/* Wall Baseboard (Zócalo blanco tradicional) */}
                <div className="absolute bottom-14 left-0 right-0 h-3 bg-white border-t border-slate-300 shadow-md z-10" />

                {/* Modern Art Canvas on Wall */}
                <div className="absolute top-8 right-6 w-24 h-28 bg-white p-2 rounded-sm shadow-xl border border-slate-300 transform -rotate-1 z-10 hidden sm:block">
                  <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center border border-slate-200 p-1 text-center">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-rose-400 mb-1 opacity-80" />
                    <span className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">ColorLink</span>
                  </div>
                </div>

                {/* Modern Indoor Plant (Foreground Left) */}
                <div className="absolute bottom-12 left-4 z-20 flex flex-col items-center">
                  <div className="flex -space-x-2 -mb-2">
                    <div className="w-3 h-8 bg-emerald-700 rounded-full rotate-[-25deg] shadow-sm" />
                    <div className="w-3.5 h-10 bg-emerald-600 rounded-full rotate-[5deg] shadow-sm" />
                    <div className="w-3 h-7 bg-emerald-800 rounded-full rotate-[30deg] shadow-sm" />
                  </div>
                  {/* Plant Ceramic Pot */}
                  <div className="w-8 h-10 bg-gradient-to-r from-slate-200 to-slate-400 rounded-b-md shadow-lg border-t-2 border-slate-500" />
                </div>

                {/* Modern Minimalist Chair/Pedestal */}
                <div className="absolute bottom-12 right-28 z-20 hidden sm:flex flex-col items-center opacity-90">
                  <div className="w-14 h-2.5 bg-slate-800 rounded-full shadow-md" />
                  <div className="flex justify-between w-10 h-8">
                    <div className="w-1 h-full bg-slate-700 rotate-[-5deg]" />
                    <div className="w-1 h-full bg-slate-700 rotate-[5deg]" />
                  </div>
                </div>
              </div>
            )}

            {/* SCENE 2: EXTERIOR FACADE */}
            {activeScene === 'exterior_facade' && (
              <div className="relative w-full h-full select-none overflow-hidden">
                {/* Sky and Cloud backdrop */}
                <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-sky-400 via-sky-300 to-sky-100">
                  <div className="absolute top-2 right-10 w-16 h-6 bg-white/60 rounded-full blur-xs" />
                  <div className="absolute top-5 right-24 w-10 h-4 bg-white/50 rounded-full blur-xs" />
                </div>

                {/* Main Facade Wall */}
                <div
                  className="absolute top-10 left-6 right-0 bottom-0 shadow-2xl transition-colors duration-500 rounded-tl-xl border-l-2 border-t-2 border-white/20"
                  style={{
                    backgroundColor: splitComparison ? '#F9FAFB' : currentColor.hex,
                  }}
                >
                  {splitComparison && (
                    <div
                      className="absolute top-0 right-0 bottom-0 w-1/2 transition-colors duration-500 border-l-2 border-white shadow-2xl"
                      style={{ backgroundColor: currentColor.hex }}
                    />
                  )}

                  {/* Direct Sun Shadow / Modern Canopy Overhang */}
                  <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />

                  {/* Architecture Window */}
                  <div className="absolute top-6 left-8 w-24 h-28 bg-slate-900 border-2 border-slate-700 rounded-md shadow-2xl overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-tr from-sky-950 via-slate-800 to-sky-700/60 p-1 relative">
                      {/* Window crossbars */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-0.5 bg-slate-600/80" />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-full w-0.5 bg-slate-600/80" />
                      </div>
                      {/* Sun reflection */}
                      <div className="absolute -top-4 -right-4 w-12 h-12 bg-white/20 rounded-full blur-sm rotate-45" />
                    </div>
                  </div>

                  {/* Balcony / Accent concrete column */}
                  <div className="absolute top-0 right-0 bottom-0 w-10 bg-stone-300 border-l border-stone-400 shadow-xl flex flex-col justify-between py-2">
                    <div className="w-full h-1 bg-stone-400" />
                    <div className="w-full h-1 bg-stone-400" />
                  </div>

                  {/* Lighting filter */}
                  <div
                    className="absolute inset-0 pointer-events-none transition-colors duration-500"
                    style={{ backgroundColor: lightingProps.ambientTint }}
                  />
                </div>

                {/* Ground sidewalk */}
                <div className="absolute bottom-0 left-0 right-0 h-6 bg-stone-400 border-t border-stone-500 shadow-md z-10" />
              </div>
            )}

            {/* SCENE 3: MACRO TEXTURE ZOOM */}
            {activeScene === 'macro_texture' && (
              <div
                className="relative w-full h-full select-none transition-colors duration-500 flex items-center justify-center p-6"
                style={{
                  backgroundColor: splitComparison ? '#F9FAFB' : currentColor.hex,
                }}
              >
                {splitComparison && (
                  <div
                    className="absolute top-0 right-0 bottom-0 w-1/2 transition-colors duration-500 border-l-2 border-white shadow-2xl"
                    style={{ backgroundColor: currentColor.hex }}
                  />
                )}

                {/* Surface Grain Texture Generator based on selected surface */}
                <div
                  className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-50"
                  style={{
                    backgroundImage:
                      surfaceType === 'mamposteria' || surfaceType === 'concreto'
                        ? 'radial-gradient(#000 1px, transparent 1px)'
                        : 'linear-gradient(45deg, rgba(0,0,0,0.05) 25%, transparent 25%)',
                    backgroundSize: surfaceType === 'mamposteria' ? '4px 4px' : '8px 8px',
                  }}
                />

                {/* Finish Specular Flare */}
                <div
                  className={`absolute w-36 h-36 rounded-full blur-xl pointer-events-none transition-opacity duration-300 ${finishDetails.specularGlow}`}
                  style={{ backgroundColor: lightingProps.highlight }}
                />

                {/* Central Focus Ring */}
                <div className="relative z-10 bg-black/40 backdrop-blur-md px-4 py-3 rounded-xl border border-white/20 text-center max-w-xs shadow-2xl">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span
                      className="w-4 h-4 rounded-full border border-white shadow-xs"
                      style={{ backgroundColor: currentColor.hex }}
                    />
                    <span className="font-extrabold text-sm text-white">{currentColor.name}</span>
                  </div>
                  <p className="text-[10px] text-slate-300">
                    Textura simulada para sustrato <strong>{surfaceType.replace('_', ' ').toUpperCase()}</strong> con acabado <strong>{finishDetails.label}</strong>.
                  </p>
                </div>
              </div>
            )}

            {/* Floating Quick Action Overlay on Canvas */}
            <div className="absolute bottom-2 right-2 z-30 flex items-center gap-1.5">
              {/* Split compare button */}
              <button
                type="button"
                onClick={() => setSplitComparison(!splitComparison)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 backdrop-blur-md transition-all cursor-pointer ${
                  splitComparison
                    ? 'bg-[#2FAE6D] text-white shadow-md'
                    : 'bg-black/60 hover:bg-black/80 text-white border border-white/20'
                }`}
                title="Comparar color contra muro base blanco"
              >
                <SlidersHorizontal className="w-3 h-3" />
                <span>{splitComparison ? 'Ver Color Solo' : 'Comparar vs Blanco'}</span>
              </button>
            </div>
          </div>

          {/* Lighting Environment Controls */}
          <div className="flex items-center justify-between bg-slate-800/60 px-3 py-2 rounded-xl border border-slate-700/60 text-xs">
            <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
              <Lamp className="w-3.5 h-3.5 text-amber-400" />
              <span>Prueba de Luz:</span>
            </span>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setLighting('daylight')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  lighting === 'daylight'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sun className="w-3 h-3 text-amber-400" />
                <span>Día (5500K)</span>
              </button>

              <button
                type="button"
                onClick={() => setLighting('warm')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  lighting === 'warm'
                    ? 'bg-amber-600/30 text-amber-200 border border-amber-500/50'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Cálida (3000K)</span>
              </button>

              <button
                type="button"
                onClick={() => setLighting('cool')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  lighting === 'cool'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                <span>Fría (6500K)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Physical Swatch Spec Sheet (Ficha de Tintometría Oficial) */}
        <div className="lg:col-span-5 bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
          {/* Official Swatch Preview */}
          <div className="flex items-start gap-3">
            {/* Color Swatch Card Graphic */}
            <div className="relative w-16 h-20 rounded-xl overflow-hidden border-2 border-white/20 shadow-lg shrink-0 flex flex-col justify-end p-1.5"
                 style={{ backgroundColor: currentColor.hex }}>
              {/* Gloss highlight corner */}
              <div className="absolute top-0 right-0 w-8 h-8 bg-white/25 rounded-bl-full pointer-events-none" />
              <span className="text-[8px] font-black uppercase text-black/80 bg-white/90 px-1 py-0.5 rounded text-center truncate">
                {currentColor.code || 'PINTUCO'}
              </span>
            </div>

            {/* Color Technical ID */}
            <div className="flex-1 min-w-0">
              <span className="text-[9px] font-extrabold uppercase text-[#2FAE6D] tracking-wider block">
                Fórmula de Tintometría Confirmada
              </span>
              <h5 className="text-base font-black text-white leading-tight truncate">
                {currentColor.name}
              </h5>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400 flex-wrap">
                <span className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 font-mono font-bold text-slate-200">
                  {currentColor.code || 'PIN-1000'}
                </span>
                <span className="font-mono text-slate-300 font-semibold">
                  HEX: {currentColor.hex}
                </span>
              </div>
            </div>
          </div>

          {/* Technical Specs Breakdown for Project Engineers / Clients */}
          <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-800">
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800/80">
              <span className="text-slate-400 text-[9px] uppercase font-bold block">Reflectancia (LRV)</span>
              <span className="font-bold text-white flex items-center gap-1">
                <span>{currentColor.lrv ? `${currentColor.lrv}%` : '40%'}</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  ({(currentColor.lrv || 40) > 50 ? 'Luminoso' : 'Profundo'})
                </span>
              </span>
            </div>

            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800/80">
              <span className="text-slate-400 text-[9px] uppercase font-bold block">Acabado Activo</span>
              <span className="font-bold text-[#2FAE6D] truncate block">
                {finishDetails.label}
              </span>
            </div>
          </div>

          {/* Color description & tint note */}
          <p className="text-[11px] text-slate-400 leading-relaxed italic bg-slate-900/50 p-2 rounded-lg border border-slate-800">
            "{currentColor.description || 'Pigmento de alta solidez y resistencia UV formulado para recubrimientos Pintuco.'}"
          </p>

          {/* Product compatibility note */}
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
            <Check className="w-3 h-3 shrink-0" />
            <span className="truncate">Compatible con: <strong>{productName}</strong></span>
          </div>
        </div>
      </div>

      {/* Color Selection Palette & Category Filter */}
      <div className="pt-2 border-t border-slate-800 space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5 text-[#2FAE6D]" />
            <span>Selecciona o Explora el Abanico de Color Pintuco:</span>
          </label>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-[10px]">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setActiveCategory(cat);
                  setIsCustomMode(false);
                }}
                className={`px-2 py-0.5 rounded-md font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeCategory === cat && !isCustomMode
                    ? 'bg-[#1B2A6B] text-white shadow-xs'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                }`}
              >
                {cat}
              </button>
            ))}

            {/* Custom Color Button */}
            <button
              type="button"
              onClick={() => setIsCustomMode(!isCustomMode)}
              className={`px-2 py-0.5 rounded-md font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                isCustomMode
                  ? 'bg-[#2FAE6D] text-white shadow-xs'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
              }`}
            >
              <Pipette className="w-2.5 h-2.5" />
              <span>Personalizado</span>
            </button>
          </div>
        </div>

        {/* Custom Hex / Pipette Picker Row */}
        {isCustomMode && (
          <div className="p-3 bg-slate-950 rounded-xl border border-emerald-500/40 flex flex-col sm:flex-row items-center gap-3 text-xs">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label className="text-[11px] font-bold text-slate-300 whitespace-nowrap">
                Pipeta de Color / Manual de Marca:
              </label>
              <input
                type="color"
                value={customHex}
                onChange={(e) => handleCustomColorChange(e.target.value)}
                className="w-9 h-9 rounded-lg border-2 border-white/40 cursor-pointer bg-transparent"
                title="Elegir color personalizado"
              />
            </div>

            <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
              <span className="text-slate-400 font-mono text-xs">HEX:</span>
              <input
                type="text"
                value={customHex}
                onChange={(e) => handleCustomColorChange(e.target.value)}
                placeholder="#1B2A6B"
                className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-white w-28 focus:border-[#2FAE6D] outline-hidden"
              />
              <span className="text-[10px] text-slate-400 italic">
                El laboratorio Pintuco formulará la tintometría por espectrometría.
              </span>
            </div>
          </div>
        )}

        {/* Color Swatch Tiles Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2 max-h-48 overflow-y-auto pr-1">
          {filteredPalettes.map((color) => {
            const isSelected = currentColor.name === color.name && !isCustomMode;
            return (
              <button
                key={color.name}
                type="button"
                onClick={() => {
                  setIsCustomMode(false);
                  onSelectColor(color);
                }}
                className={`p-1.5 rounded-xl border transition-all text-left flex flex-col items-center gap-1.5 group cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800 border-[#2FAE6D] ring-2 ring-[#2FAE6D]/60 shadow-lg scale-102'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
                }`}
              >
                {/* Circle swatch with gloss and check if selected */}
                <div
                  className="w-9 h-9 rounded-full border-2 border-white/20 shadow-md relative flex items-center justify-center transition-transform group-hover:scale-105"
                  style={{ backgroundColor: color.hex }}
                >
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-black/60 flex items-center justify-center text-white">
                      <Check className="w-3 h-3 text-[#2FAE6D]" />
                    </div>
                  )}
                </div>

                {/* Color Name and Code */}
                <div className="w-full text-center">
                  <span className="text-[10px] font-bold text-slate-200 block truncate leading-tight">
                    {color.name}
                  </span>
                  <span className="text-[8px] font-mono text-slate-400 block truncate">
                    {color.code || color.hex}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
