import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Sparkles,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Check,
  Calculator,
  Download,
  Info,
  ChevronRight,
  Eye,
  Sliders,
  Layers,
  ArrowRight,
  Sun,
  ShieldCheck,
  Droplets,
  Share2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { COLOR_PALETTES } from '../data/initialData';
import { ColorPaletteItem } from '../types';

export interface RoomScenario {
  id: 'sala_de_estar' | 'cocina' | 'habitacion' | 'exterior_casa' | 'oficina';
  name: string;
  category: 'Interior' | 'Exterior';
  description: string;
  surfaceType: string;
  recommendedProduct: string;
  imageSrc: string;
  maskSrc: string;
  aspectRatio: string;
  accentTip: string;
}

export const ROOM_SCENARIOS: RoomScenario[] = [
  {
    id: 'sala_de_estar',
    name: 'Sala de Estar',
    category: 'Interior',
    description: 'Muros principales de mampostería y columna divisoria con iluminación natural.',
    surfaceType: 'Mampostería / Muros interiores',
    recommendedProduct: 'Viniltex Avanzado® Antibacterial (Lavable)',
    imageSrc: '/assets/simulator/sala_de_estar.jpg',
    maskSrc: '/assets/simulator/sala_de_estar_mask.png',
    aspectRatio: '702 / 382',
    accentTip: 'Pintar el muro de fondo genera amplitud y contrasta con sofás grises y maderas claras.',
  },
  {
    id: 'cocina',
    name: 'Cocina',
    category: 'Interior',
    description: 'Muros superiores y perímetro de ventana sobre salpicadero de baldosas blancas.',
    surfaceType: 'Zona Húmeda / Mampostería',
    recommendedProduct: 'Viniltex Baños & Cocina® Antihongos con Teflón®',
    imageSrc: '/assets/simulator/cocina.jpg',
    maskSrc: '/assets/simulator/cocina_mask.png',
    aspectRatio: '702 / 382',
    accentTip: 'Resiste grasa y vapor; combina a la perfección con muebles blancos y cuarzo.',
  },
  {
    id: 'habitacion',
    name: 'Habitación',
    category: 'Interior',
    description: 'Pared principal de cabecero con lámparas de noche cálidas y textiles neutros.',
    surfaceType: 'Mampostería / Drywall',
    recommendedProduct: 'Viniltex Avanzado® Mate (Bajo Olor y Cero Brillo)',
    imageSrc: '/assets/simulator/habitacion.jpg',
    maskSrc: '/assets/simulator/habitacion_mask.png',
    aspectRatio: '468 / 382',
    accentTip: 'Los tonos serenos, tierras y salvia inducen el descanso profundo y confort acústico.',
  },
  {
    id: 'exterior_casa',
    name: 'Exterior de Casa',
    category: 'Exterior',
    description: 'Fachada frontal bicapa con volúmenes arquitectónicos y vanos de ventanería.',
    surfaceType: 'Fachada Exterior / Concreto y Pañete',
    recommendedProduct: 'Koraza 5® Máxima Protección Exterior',
    imageSrc: '/assets/simulator/exterior_casa.jpg',
    maskSrc: '/assets/simulator/exterior_casa_mask.png',
    aspectRatio: '464 / 382',
    accentTip: 'Excelente repelencia al agua de lluvia, rayos UV y polución urbana.',
  },
  {
    id: 'oficina',
    name: 'Oficina',
    category: 'Interior',
    description: 'Muro posterior de trabajo y pared de acento junto a biblioteca y escritorio.',
    surfaceType: 'Muros / Yeso / Drywall',
    recommendedProduct: 'Viniltex Satinado® o Mate Profesional',
    imageSrc: '/assets/simulator/oficina.jpg',
    maskSrc: '/assets/simulator/oficina_mask.png',
    aspectRatio: '466 / 382',
    accentTip: 'Ideal para fondos de videollamada profesionales con alta fidelidad cromática.',
  },
];

export const RealisticColorSimulator: React.FC = () => {
  const { setActiveView, setIsRequestModalOpen, simulatorScenario, setSimulatorScenario } = useApp();

  // Selected scenario synced with context
  const selectedScenario = ROOM_SCENARIOS.find((s) => s.id === simulatorScenario) || ROOM_SCENARIOS[0];
  const handleSelectScenario = (scenario: RoomScenario) => {
    setSimulatorScenario(scenario.id);
  };

  // Selected color
  const [selectedColor, setSelectedColor] = useState<ColorPaletteItem>(
    COLOR_PALETTES.find((c) => c.name === 'Azul Pintuco') || COLOR_PALETTES[5]
  );

  // Paint finish & simulation adjustments
  const [opacity, setOpacity] = useState<number>(0.85);
  const [blendMode, setBlendMode] = useState<'multiply' | 'color' | 'overlay' | 'soft-light'>('multiply');
  const [finishEffect, setFinishEffect] = useState<'mate' | 'satinado' | 'brillante'>('mate');

  // Compare mode (toggle original photo vs painted)
  const [showOriginal, setShowOriginal] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Canvas ref for real-time rendering & export
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Filter palette categories
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const colorCategories = ['all', 'Blancos & Neutros', 'Corporativo & Acentos', 'Vivos & Tendencia', 'Cálidos & Tierras'];

  const filteredColors = COLOR_PALETTES.filter((c) => {
    if (activeCategory === 'all') return true;
    return c.category === activeCategory;
  });

  // Render simulation on canvas preserving natural lighting, texture, and shadows
  const renderSimulation = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const baseImg = new Image();
    const maskImg = new Image();

    baseImg.crossOrigin = 'anonymous';
    maskImg.crossOrigin = 'anonymous';

    baseImg.src = selectedScenario.imageSrc;
    maskImg.src = selectedScenario.maskSrc;

    let loadedCount = 0;
    const onLoad = () => {
      loadedCount++;
      if (loadedCount < 2) return;

      canvas.width = baseImg.naturalWidth || 702;
      canvas.height = baseImg.naturalHeight || 382;

      // Draw original photo first
      ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);

      if (showOriginal) {
        setIsProcessing(false);
        return;
      }

      // Offscreen buffer for tinted mask
      const offscreen = document.createElement('canvas');
      offscreen.width = canvas.width;
      offscreen.height = canvas.height;
      const offCtx = offscreen.getContext('2d');
      if (!offCtx) return;

      // Draw mask
      offCtx.drawImage(maskImg, 0, 0, canvas.width, canvas.height);

      // Colorize mask with selected color using source-in
      offCtx.globalCompositeOperation = 'source-in';
      offCtx.fillStyle = selectedColor.hex;
      offCtx.fillRect(0, 0, canvas.width, canvas.height);

      // Apply finish highlight if satinado or brillante
      if (finishEffect === 'satinado') {
        offCtx.globalAlpha = 0.15;
        offCtx.fillStyle = '#ffffff';
        offCtx.fillRect(0, 0, canvas.width, canvas.height);
      } else if (finishEffect === 'brillante') {
        offCtx.globalAlpha = 0.28;
        offCtx.fillStyle = '#ffffff';
        offCtx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Blend colored wall onto base photo
      ctx.save();
      ctx.globalAlpha = opacity;
      ctx.globalCompositeOperation = blendMode;
      ctx.drawImage(offscreen, 0, 0);

      // Secondary soft pass for deep colors to enrich saturation
      if (blendMode === 'multiply') {
        ctx.globalAlpha = opacity * 0.35;
        ctx.globalCompositeOperation = 'color';
        ctx.drawImage(offscreen, 0, 0);
      }

      ctx.restore();
      setIsProcessing(false);
    };

    setIsProcessing(true);
    baseImg.onload = onLoad;
    maskImg.onload = onLoad;
  }, [selectedScenario, selectedColor, opacity, blendMode, finishEffect, showOriginal]);

  useEffect(() => {
    renderSimulation();
  }, [renderSimulation]);

  // Download high-res simulated photo
  const handleDownloadSimulation = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `pintuco_simulacion_${selectedScenario.id}_${selectedColor.name.toLowerCase().replace(/\s+/g, '_')}.jpg`;
    link.href = canvas.toDataURL('image/jpeg', 0.95);
    link.click();
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Navigation Breadcrumb & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <button
                onClick={() => setActiveView('home')}
                className="hover:text-[#1B2A6B] font-semibold cursor-pointer text-slate-600"
              >
                Inicio
              </button>
              <span>/</span>
              <span className="text-[#2FAE6D] font-bold">Simulador de Color</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-2xl bg-[#2FAE6D] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Sparkles className="w-5 h-5" />
              </span>
              <span>Simulador Arquitectónico Pintuco® ColorLink</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Aislamiento fotográfico de precisión: muebles, pisos, ventanas, electrodomésticos y techos permanecen intactos con sus texturas y sombras originales. Solo cambian los muros.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsRequestModalOpen(true)}
              className="px-4 py-2.5 bg-[#2FAE6D] hover:bg-[#27995f] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs cursor-pointer transition-all active:scale-95"
            >
              <Calculator className="w-4 h-4" />
              <span>Cotizar este Color en m²</span>
            </button>
            <button
              onClick={handleDownloadSimulation}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer transition-all"
              title="Descargar foto simulada"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">Exportar Foto</span>
            </button>
          </div>
        </div>

        {/* 1. SELECTOR DE ESCENARIOS (Los 5 espacios recortados e independientes) */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#1B2A6B]" />
                <span>1. Elige el Escenario a Simular (5 Espacios Independientes)</span>
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Cada escenario fue recortado y aislado de forma autónoma con su propia máscara de pared.
              </p>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              {selectedScenario.name} activo
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {ROOM_SCENARIOS.map((scenario) => {
              const isSelected = selectedScenario.id === scenario.id;
              return (
                <button
                  key={scenario.id}
                  onClick={() => handleSelectScenario(scenario)}
                  className={`group relative rounded-2xl overflow-hidden text-left transition-all cursor-pointer border-2 ${
                    isSelected
                      ? 'border-[#2FAE6D] ring-2 ring-emerald-300 shadow-md'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="aspect-video w-full overflow-hidden bg-slate-100 relative">
                    <img
                      src={scenario.imageSrc}
                      alt={scenario.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#2FAE6D] text-white flex items-center justify-center shadow-xs">
                        <Check className="w-3.5 h-3.5 stroke-3" />
                      </div>
                    )}
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/80 text-white backdrop-blur-xs">
                      {scenario.category}
                    </span>
                  </div>
                  <div className="p-2.5">
                    <h3 className="font-bold text-xs text-slate-900 group-hover:text-[#1B2A6B] transition-colors">
                      {scenario.name}
                    </h3>
                    <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                      {scenario.surfaceType}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. CANVAS DE SIMULACIÓN Y PANEL DE CONTROL */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Main Visualizer (7 Columns on large screens) */}
          <div className="lg:col-span-8 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            
            {/* Visualizer Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedColor.hex }} />
                <span className="text-xs font-bold text-slate-900">
                  {selectedColor.name} ({selectedColor.code})
                </span>
                <span className="text-slate-400 text-xs">•</span>
                <span className="text-xs text-slate-500 font-mono">{selectedColor.hex}</span>
              </div>

              {/* Compare toggle button */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onMouseDown={() => setShowOriginal(true)}
                  onMouseUp={() => setShowOriginal(false)}
                  onTouchStart={() => setShowOriginal(true)}
                  onTouchEnd={() => setShowOriginal(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer select-none transition-colors"
                  title="Mantén presionado para ver la foto original"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>Mantén para ver Original</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOpacity(0.85);
                    setBlendMode('multiply');
                    setFinishEffect('mate');
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                  title="Restablecer ajustes de luz"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Interactive Stage Canvas Container */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 shadow-inner flex items-center justify-center border border-slate-200">
              <canvas
                ref={canvasRef}
                className="w-full h-auto max-h-[540px] object-contain transition-all duration-200"
              />

              {isProcessing && (
                <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-2xs flex items-center justify-center">
                  <div className="px-3.5 py-1.5 rounded-full bg-white/90 text-slate-800 text-xs font-bold shadow-md flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#2FAE6D] animate-ping" />
                    <span>Renderizando luz natural...</span>
                  </div>
                </div>
              )}

              {/* Floating Color Badge */}
              <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-md border border-white/40 flex items-center gap-2.5">
                <div
                  className="w-6 h-6 rounded-lg shadow-2xs border border-black/10 shrink-0"
                  style={{ backgroundColor: selectedColor.hex }}
                />
                <div className="text-[11px] leading-tight">
                  <strong className="text-slate-900 block font-bold">{selectedColor.name}</strong>
                  <span className="text-slate-500 font-mono">{selectedScenario.name}</span>
                </div>
              </div>
            </div>

            {/* Recommendation Strip */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#2FAE6D] shrink-0 mt-0.5" />
              <div className="flex-1">
                <strong className="text-emerald-900 font-bold block">
                  Recomendación Oficial Pintuco para {selectedScenario.name}:
                </strong>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  {selectedScenario.recommendedProduct}. {selectedScenario.accentTip}
                </p>
              </div>
            </div>
          </div>

          {/* Color Palette & Customizer (5 Columns on large screens) */}
          <div className="lg:col-span-4 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-5">
            
            {/* Color Palette Header */}
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-[#2FAE6D]" />
                <span>2. Carta de Colores Oficiales Pintuco</span>
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Haz clic en cualquier tono para aplicarlo instantáneamente al muro.
              </p>
            </div>

            {/* Category filter pills */}
            <div className="flex flex-wrap gap-1">
              {colorCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                    activeCategory === cat
                      ? 'bg-[#142154] text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'all' ? 'Todos' : cat}
                </button>
              ))}
            </div>

            {/* Swatches Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-72 overflow-y-auto pr-1">
              {filteredColors.map((col) => {
                const isSelected = selectedColor.name === col.name;
                return (
                  <button
                    key={col.name}
                    onClick={() => setSelectedColor(col)}
                    className={`group p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                      isSelected
                        ? 'border-[#2FAE6D] ring-2 ring-emerald-300 bg-emerald-50/40 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                    }`}
                    title={`${col.name} (${col.code})`}
                  >
                    <div
                      className="w-full aspect-square rounded-lg border border-black/10 shadow-2xs relative"
                      style={{ backgroundColor: col.hex }}
                    >
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-4 h-4 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-xs">
                            <Check className="w-2.5 h-2.5 stroke-3" />
                          </div>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-slate-800 text-center line-clamp-1 w-full">
                      {col.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Customizer: Acabado y Transmitancia de Luz */}
            <div className="pt-4 border-t border-slate-100 space-y-3 text-xs">
              <span className="font-black text-slate-900 block uppercase tracking-wider text-[11px]">
                3. Acabado & Comportamiento de Luz
              </span>

              {/* Acabado buttons */}
              <div>
                <label className="block text-slate-500 font-bold mb-1.5 text-[11px]">Tipo de Acabado:</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['mate', 'satinado', 'brillante'] as const).map((fin) => (
                    <button
                      key={fin}
                      type="button"
                      onClick={() => setFinishEffect(fin)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold capitalize transition-colors cursor-pointer border ${
                        finishEffect === fin
                          ? 'bg-[#142154] text-white border-[#142154] shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {fin}
                    </button>
                  ))}
                </div>
              </div>

              {/* Opacity slider */}
              <div>
                <div className="flex justify-between items-center mb-1 text-[11px]">
                  <span className="text-slate-500 font-bold">Intensidad del Pigmento:</span>
                  <span className="font-mono font-bold text-slate-800">{Math.round(opacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.0"
                  step="0.05"
                  value={opacity}
                  onChange={(e) => setOpacity(parseFloat(e.target.value))}
                  className="w-full accent-[#2FAE6D] cursor-pointer"
                />
              </div>
            </div>

            {/* Cotizar CTA Button */}
            <div className="pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsRequestModalOpen(true)}
                className="w-full py-3 bg-[#2FAE6D] hover:bg-[#27995f] text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-95"
              >
                <Calculator className="w-4 h-4" />
                <span>Calcular m² para {selectedScenario.name}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
