import React, { useState } from 'react';
import {
  Sparkles,
  Calculator,
  ShieldCheck,
  Droplets,
  Layers,
  ChevronRight,
  Info,
  X,
  Eye,
  CheckCircle2,
  Brush,
  Clock,
  Hammer,
  Maximize2,
  Building,
  Image as ImageIcon,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PaintProduct } from '../types';

export const FeaturedProducts: React.FC = () => {
  const { products, searchQuery, setIsRequestModalOpen } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [selectedSurfaceFilter, setSelectedSurfaceFilter] = useState<string>('all');
  
  // Track image toggle per card: 'product' (can) or 'surface' (applied surface)
  const [cardImageMode, setCardImageMode] = useState<Record<string, 'product' | 'surface'>>({});
  
  // Modal for full technical & surface guide
  const [activeProductModal, setActiveProductModal] = useState<PaintProduct | null>(null);

  const surfaceFilters = [
    { id: 'all', label: 'Todas las Superficies', icon: '🎨' },
    { id: 'mamposteria', label: 'Mampostería / Muros', icon: '🧱' },
    { id: 'drywall', label: 'Drywall / Yeso', icon: '🏠' },
    { id: 'fachada_exterior', label: 'Fachadas / Intemperie', icon: '🏢' },
    { id: 'metal_acero', label: 'Metales & Rejas', icon: '⚙️' },
    { id: 'pisos_trafico', label: 'Pisos Industriales & Concreto', icon: '🏭' },
    { id: 'zona_humeda', label: 'Terrazas & Cubiertas', icon: '☀️' },
    { id: 'madera', label: 'Madera & Decks', icon: '🪵' },
  ];

  const filteredProducts = products.filter((prod) => {
    const matchesCategory =
      selectedCategory === 'Todos' || prod.category.toLowerCase().includes(selectedCategory.toLowerCase());
    
    const matchesSurface =
      selectedSurfaceFilter === 'all' ||
      prod.suitableSurfaces.includes(selectedSurfaceFilter as any);

    const matchesSearch =
      !searchQuery ||
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prod.paintType && prod.paintType.toLowerCase().includes(searchQuery.toLowerCase())) ||
      prod.code.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSurface && matchesSearch;
  });

  const handleCalculateWithProduct = (product: PaintProduct) => {
    setActiveProductModal(null);
    setIsRequestModalOpen(true);
  };

  const toggleImageMode = (productId: string, mode: 'product' | 'surface') => {
    setCardImageMode((prev) => ({ ...prev, [productId]: mode }));
  };

  return (
    <section id="productos-section" className="py-14 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 text-left">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1B2A6B] uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#2FAE6D]" />
              <span>Guía de Pinturas & Superficies de Aplicación</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Tipos de Pintura y Superficies de Uso
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Explora las formulaciones técnicas de Pintuco con imágenes reales del envase y su acabado en muros, fachadas, metales, pisos epóxicos y losas.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 hidden sm:inline">Filtrar por:</span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              {['Todos', 'Arquitectónica Interior', 'Arquitectónica Exterior', 'Industrial de Alto Rendimiento', 'Esmaltes & Metales'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#1B2A6B] text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-200/80 border border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Surface Quick Filter Ribbon */}
        <div className="mb-8 p-3 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between gap-2 mb-2 px-2 text-left">
            <span className="text-xs font-extrabold text-[#1B2A6B] flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#2FAE6D]" />
              Selecciona el tipo de superficie que deseas pintar:
            </span>
            <span className="text-[11px] text-slate-400 font-semibold">
              {filteredProducts.length} producto(s) encontrado(s)
            </span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {surfaceFilters.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedSurfaceFilter(s.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                  selectedSurfaceFilter === s.id
                    ? 'bg-[#2FAE6D] text-white shadow-sm ring-2 ring-emerald-200'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>{s.icon}</span>
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const currentMode = cardImageMode[product.id] || 'product';
            const displayImage = currentMode === 'surface' && product.surfaceImage ? product.surfaceImage : product.image;

            return (
              <div
                key={product.id}
                id={`product-card-${product.id}`}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group text-left relative"
              >
                {/* Image Showcase with Interactive Toggle */}
                <div className="relative h-52 overflow-hidden bg-slate-900">
                  <img
                    src={displayImage}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/30 pointer-events-none" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
                    {product.badge ? (
                      <span className="bg-[#2FAE6D] text-white text-[10px] font-extrabold px-2.5 py-1 rounded-lg shadow-sm">
                        {product.badge}
                      </span>
                    ) : (
                      <span className="bg-[#1B2A6B] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-lg shadow-sm">
                        Pintuco®
                      </span>
                    )}

                    <span className="bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-1 rounded-md border border-white/20">
                      {product.code}
                    </span>
                  </div>

                  {/* Image View Mode Switcher (Envase vs. Superficie) */}
                  <div className="absolute top-12 left-3 right-3 flex items-center justify-center gap-1 z-10">
                    <div className="bg-black/70 backdrop-blur-md p-1 rounded-xl border border-white/20 flex items-center gap-1 shadow-lg">
                      <button
                        type="button"
                        onClick={() => toggleImageMode(product.id, 'product')}
                        className={`px-2 py-1 rounded-lg text-[10px] font-extrabold flex items-center gap-1 transition-all cursor-pointer ${
                          currentMode === 'product'
                            ? 'bg-[#1B2A6B] text-white shadow-xs'
                            : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        <ImageIcon className="w-3 h-3 text-emerald-400" />
                        <span>Envase</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleImageMode(product.id, 'surface')}
                        className={`px-2 py-1 rounded-lg text-[10px] font-extrabold flex items-center gap-1 transition-all cursor-pointer ${
                          currentMode === 'surface'
                            ? 'bg-[#2FAE6D] text-white shadow-xs'
                            : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        <Layers className="w-3 h-3 text-white" />
                        <span>Superficie Real</span>
                      </button>
                    </div>
                  </div>

                  {/* Bottom Text Over Image */}
                  <div className="absolute bottom-2.5 left-3 right-3 text-white z-10">
                    <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block">
                      {product.category}
                    </span>
                    <h3 className="font-extrabold text-sm sm:text-base leading-tight drop-shadow-sm line-clamp-1 text-white">
                      {product.name}
                    </h3>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3.5">
                  {/* Tipo de Pintura / Química Callout */}
                  <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-2.5 text-left">
                    <span className="text-[10px] font-black uppercase text-[#1B2A6B] tracking-wider block mb-0.5">
                      🔬 Tipo de Pintura & Fórmula:
                    </span>
                    <p className="text-xs font-bold text-slate-800 leading-snug">
                      {product.paintType || product.category}
                    </p>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {product.description}
                  </p>

                  {/* Superficies Aptas Chips */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
                      🧱 ¿En qué superficies se puede usar?
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {product.surfaceLabels && product.surfaceLabels.length > 0 ? (
                        product.surfaceLabels.map((s, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-1 rounded-lg border border-slate-200"
                            title={s.description}
                          >
                            <span>{s.icon}</span>
                            <span>{s.name}</span>
                          </span>
                        ))
                      ) : (
                        product.suitableSurfaces.map((s) => (
                          <span
                            key={s}
                            className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 text-[10px] font-bold px-2 py-1 rounded-lg border border-slate-200 capitalize"
                          >
                            <span>🧱</span>
                            <span>{s.replace('_', ' ')}</span>
                          </span>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Performance & Warranty Stats */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-center gap-1.5">
                      <Droplets className="w-3.5 h-3.5 text-[#1B2A6B] shrink-0" />
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Rendimiento</span>
                        <span className="font-bold text-slate-800">{product.coveragePerGallonSqM} m²/gal</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#2FAE6D] shrink-0" />
                      <div>
                        <span className="text-slate-400 block text-[9px] uppercase font-bold">Garantía</span>
                        <span className="font-bold text-slate-800">{product.warrantyYears} Años</span>
                      </div>
                    </div>
                  </div>

                  {/* Price & Action Buttons */}
                  <div className="pt-2 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Precio Galón Ref.</span>
                        <p className="text-base font-extrabold text-[#1B2A6B]">
                          ${product.pricePerGallonCOP.toLocaleString('es-CO')}{' '}
                          <span className="text-[10px] font-normal text-slate-500">COP</span>
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveProductModal(product)}
                        className="text-xs font-extrabold text-[#1B2A6B] hover:text-[#2FAE6D] flex items-center gap-1 cursor-pointer underline"
                      >
                        <Info className="w-3.5 h-3.5" />
                        <span>Ver Ficha</span>
                      </button>
                    </div>

                    {/* Action Button: Calculate */}
                    <button
                      id={`calc-prod-btn-${product.id}`}
                      onClick={() => handleCalculateWithProduct(product)}
                      className="w-full bg-[#2FAE6D] hover:bg-[#26975d] text-white py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-98"
                    >
                      <Calculator className="w-3.5 h-3.5" />
                      <span>Calcular m² para mi proyecto</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Full Technical Details & Surface Application Guide Modal */}
      {activeProductModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 text-left">
            {/* Modal Header */}
            <div className="bg-[#142154] text-white p-5 sm:px-7 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#2FAE6D] text-white flex items-center justify-center shadow-md">
                  <Brush className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase text-emerald-300 tracking-wider">
                    {activeProductModal.category} • Código {activeProductModal.code}
                  </span>
                  <h3 className="text-lg sm:text-xl font-extrabold text-white leading-tight">
                    {activeProductModal.name}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveProductModal(null)}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1">
              {/* Dual Image Comparison Banner (Envase + Superficie Terminada) */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  📸 Galería Visual: Envase Técnico vs. Aplicación en Superficie Real
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Container Image */}
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm h-48 sm:h-56 bg-slate-900 group">
                    <img
                      src={activeProductModal.image}
                      alt={activeProductModal.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <span className="bg-[#1B2A6B] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md mb-1 inline-block">
                        🧴 Envase y Presentación
                      </span>
                      <p className="text-xs font-bold text-white">Presentación Oficial de Fábrica</p>
                    </div>
                  </div>

                  {/* Surface Image */}
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm h-48 sm:h-56 bg-slate-900 group">
                    <img
                      src={activeProductModal.surfaceImage || activeProductModal.image}
                      alt={`Superficie ${activeProductModal.name}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <span className="bg-[#2FAE6D] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md mb-1 inline-block">
                        🧱 Superficie Real Aplicada
                      </span>
                      <p className="text-xs font-bold text-white">Acabado y Textura en Obra</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chemical formula & description */}
              <div className="bg-blue-50/80 rounded-2xl p-4 border border-blue-200 space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#1B2A6B]" />
                  <span className="text-xs font-extrabold text-[#1B2A6B] uppercase tracking-wider">
                    Formulación y Tipo Químico:
                  </span>
                </div>
                <p className="text-sm font-extrabold text-slate-900">
                  {activeProductModal.paintType || activeProductModal.category}
                </p>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {activeProductModal.description}
                </p>
              </div>

              {/* Compatible Surfaces Detailed Grid */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#1B2A6B]" />
                  ¿En qué superficies está certificado su uso?
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {activeProductModal.surfaceLabels && activeProductModal.surfaceLabels.length > 0 ? (
                    activeProductModal.surfaceLabels.map((s, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-left space-y-1 hover:bg-emerald-50/50 hover:border-emerald-200 transition-colors"
                      >
                        <div className="text-xl mb-1">{s.icon}</div>
                        <h5 className="text-xs font-extrabold text-slate-900">{s.name}</h5>
                        <p className="text-[11px] text-slate-600 leading-tight">{s.description}</p>
                      </div>
                    ))
                  ) : (
                    activeProductModal.suitableSurfaces.map((s) => (
                      <div
                        key={s}
                        className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-left space-y-1"
                      >
                        <div className="text-xl mb-1">🧱</div>
                        <h5 className="text-xs font-extrabold text-slate-900 capitalize">{s.replace('_', ' ')}</h5>
                        <p className="text-[11px] text-slate-600">Apto para aplicación según norma técnica.</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Technical Specifications Matrix */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Especificaciones de Rendimiento y Secado
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Rendimiento Teórico</span>
                    <span className="text-sm font-extrabold text-slate-800">{activeProductModal.coveragePerGallonSqM} m²/gal</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Manos Sugeridas</span>
                    <span className="text-sm font-extrabold text-slate-800">{activeProductModal.recommendedCoats} Manos</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Tiempo de Secado</span>
                    <span className="text-sm font-extrabold text-slate-800">{activeProductModal.dryingTimeHours} Horas</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Garantía Pintuco</span>
                    <span className="text-sm font-extrabold text-[#2FAE6D]">{activeProductModal.warrantyYears} Años</span>
                  </div>
                </div>

                {activeProductModal.applicationTip && (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#2FAE6D] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Recomendación técnica del fabricante:</span>{' '}
                      <span>{activeProductModal.applicationTip}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:px-7 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Precio Galón Ref.</span>
                <p className="text-lg font-black text-[#1B2A6B]">
                  ${activeProductModal.pricePerGallonCOP.toLocaleString('es-CO')} COP
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setActiveProductModal(null)}
                  className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-300 font-bold text-xs cursor-pointer w-full sm:w-auto"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={() => handleCalculateWithProduct(activeProductModal)}
                  className="px-5 py-2.5 bg-[#2FAE6D] hover:bg-[#26975d] text-white rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer w-full sm:w-auto"
                >
                  <Calculator className="w-4 h-4" />
                  <span>Calcular Galones para mi Obra</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
