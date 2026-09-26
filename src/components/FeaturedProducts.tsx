import React, { useState } from 'react';
import {
  Calculator,
  ShieldCheck,
  Droplets,
  Layers,
  ChevronRight,
  Info,
  X,
  Brush,
  Search,
  Check,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PaintProduct } from '../types';

export const FeaturedProducts: React.FC = () => {
  const { products, searchQuery, setSearchQuery, setIsRequestModalOpen } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [selectedSurfaceFilter, setSelectedSurfaceFilter] = useState<string>('all');
  
  // Track image toggle per card: 'product' (can) or 'surface' (finish)
  const [cardImageMode, setCardImageMode] = useState<Record<string, 'product' | 'surface'>>({});
  
  // Technical detail modal
  const [activeProductModal, setActiveProductModal] = useState<PaintProduct | null>(null);

  // Key benefit in 3 words mapping for KOAJ retail simplicity
  const keyBenefits: Record<string, { phrase: string; badges: string[] }> = {
    'prod-viniltex': {
      phrase: 'Máxima Lavabilidad Antibacterial',
      badges: ['Lavable', 'Bajo Olor', 'Anti-hongos'],
    },
    'prod-koraza': {
      phrase: 'Impermeabilidad Total Intemperie',
      badges: ['Anti-hongos', 'Resistente UV', 'Cero Fisuras'],
    },
    'prod-pintulux': {
      phrase: 'Anticorrosivo Brillo Duradero',
      badges: ['Anticorrosivo', 'Secado Rápido', 'Alto Brillo'],
    },
    'prod-epoxico': {
      phrase: 'Resistencia Industrial Extrema',
      badges: ['Alto Tráfico', 'Sin Juntas', '100% Sólidos'],
    },
    'prod-aquatec': {
      phrase: 'Cero Filtraciones Losas',
      badges: ['Elastómero', 'Fibratado', '10 Años'],
    },
    'prod-trafico': {
      phrase: 'Secado Ultra Rápido',
      badges: ['Alta Fricción', 'Tráfico Pesado', 'Secado 30min'],
    },
  };

  const surfaceFilters = [
    { id: 'all', label: 'Todas', icon: '🎨' },
    { id: 'mamposteria', label: 'Muros & Drywall', icon: '🧱' },
    { id: 'fachada_exterior', label: 'Fachadas', icon: '🏢' },
    { id: 'metal_acero', label: 'Metales & Rejas', icon: '⚙️' },
    { id: 'pisos_trafico', label: 'Pisos & Concreto', icon: '🏭' },
    { id: 'zona_humeda', label: 'Terrazas & Cubiertas', icon: '☀️' },
    { id: 'madera', label: 'Madera', icon: '🪵' },
  ];

  const categories = [
    'Todos',
    'Arquitectónica Interior',
    'Arquitectónica Exterior',
    'Esmaltes & Metales',
    'Impermeabilización',
    'Industrial de Alto Rendimiento',
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
    <section id="catalogo-section" className="py-14 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Visual Search & Surface Selector (KOAJ Quick Finder) */}
        <div id="quick-surface-finder" className="mb-10 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#2FAE6D] block mb-0.5">
                Buscador Rápido
              </span>
              <h3 className="text-xl font-black text-slate-900">
                Encuentra tu pintura según la superficie
              </h3>
            </div>

            {/* Clean Search Input */}
            <div className="relative w-full md:w-72">
              <input
                type="text"
                placeholder="Buscar pintura o código..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-100 rounded-full text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-[#1B2A6B] outline-none transition-all"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Surface Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {surfaceFilters.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedSurfaceFilter(s.id)}
                className={`px-3.5 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                  selectedSurfaceFilter === s.id
                    ? 'bg-[#1B2A6B] text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>{s.icon}</span>
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Section Header: Tendencias & Recomendados */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 text-left">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#1B2A6B] block mb-1">
              Colección Destacada
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Tendencias & Recomendados
            </h2>
          </div>

          {/* Clean Segmented Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#2FAE6D] text-white shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid - Clean Modern Retail Cards */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 text-slate-500">
            <p className="text-base font-bold text-slate-800">No encontramos productos con estos filtros</p>
            <p className="text-xs text-slate-500 mt-1">Prueba seleccionando otra superficie o borrando el término de búsqueda.</p>
            <button
              onClick={() => { setSelectedCategory('Todos'); setSelectedSurfaceFilter('all'); setSearchQuery(''); }}
              className="mt-4 px-4 py-2 bg-[#1B2A6B] text-white rounded-full text-xs font-bold cursor-pointer"
            >
              Restablecer filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const currentMode = cardImageMode[product.id] || 'product';
              const displayImage = currentMode === 'surface' && product.surfaceImage ? product.surfaceImage : product.image;
              const benefit = keyBenefits[product.id] || {
                phrase: 'Protección y Alto Rendimiento',
                badges: ['Lavable', 'Garantizado'],
              };

              return (
                <div
                  key={product.id}
                  id={`product-card-${product.id}`}
                  className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group text-left"
                >
                  {/* High Quality Photography Frame */}
                  <div className="relative h-60 overflow-hidden bg-slate-900">
                    <img
                      src={displayImage}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />

                    {/* Gradient shade */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                    {/* Top Kicker & Badge */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/90 text-slate-900 shadow-sm backdrop-blur-xs">
                        {product.badge || 'Pintuco®'}
                      </span>

                      {/* Quick Image Toggle: Envase vs Muro */}
                      <div className="bg-black/60 backdrop-blur-sm rounded-full p-0.5 flex items-center text-[9px] font-bold text-white border border-white/20">
                        <button
                          type="button"
                          onClick={() => toggleImageMode(product.id, 'product')}
                          className={`px-2 py-0.5 rounded-full transition-colors cursor-pointer ${
                            currentMode === 'product' ? 'bg-[#1B2A6B] text-white' : 'text-slate-300 hover:text-white'
                          }`}
                        >
                          Envase
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleImageMode(product.id, 'surface')}
                          className={`px-2 py-0.5 rounded-full transition-colors cursor-pointer ${
                            currentMode === 'surface' ? 'bg-[#2FAE6D] text-white' : 'text-slate-300 hover:text-white'
                          }`}
                        >
                          Muro Real
                        </button>
                      </div>
                    </div>

                    {/* 3-Word Key Benefit overlaid on photo bottom */}
                    <div className="absolute bottom-3 left-3 right-3 z-10">
                      <span className="text-xs font-black text-white drop-shadow-sm line-clamp-1">
                        ✨ {benefit.phrase}
                      </span>
                    </div>
                  </div>

                  {/* Card Content - Clean & Minimal (KOAJ Style) */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                        {product.category}
                      </div>
                      <h3 className="font-extrabold text-sm text-slate-900 leading-snug line-clamp-1 mt-0.5 group-hover:text-[#1B2A6B] transition-colors">
                        {product.name}
                      </h3>
                      
                      {/* Short Description: under 12 words */}
                      <p className="text-xs text-slate-500 line-clamp-1 mt-1 font-normal">
                        Fórmula técnica para alta durabilidad y cobertura uniforme.
                      </p>
                    </div>

                    {/* Minimalist Feature Badges (KOAJ tag style) */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {benefit.badges.map((b, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200"
                        >
                          {b}
                        </span>
                      ))}
                    </div>

                    {/* Performance metrics micro strip */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
                      <span className="flex items-center gap-1 font-medium">
                        <Droplets className="w-3.5 h-3.5 text-[#1B2A6B]" />
                        {product.coveragePerGallonSqM} m²/gal
                      </span>
                      <span className="flex items-center gap-1 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5 text-[#2FAE6D]" />
                        {product.warrantyYears} años garantía
                      </span>
                    </div>

                    {/* Price & Action Row */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">Precio Galón</span>
                        <p className="text-base font-black text-slate-900">
                          ${product.pricePerGallonCOP.toLocaleString('es-CO')}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setActiveProductModal(product)}
                          className="px-2.5 py-2 text-xs font-bold text-slate-600 hover:text-[#1B2A6B] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Ver Ficha Técnica"
                        >
                          Ficha
                        </button>
                        <button
                          id={`calc-prod-btn-${product.id}`}
                          onClick={() => handleCalculateWithProduct(product)}
                          className="px-3.5 py-2 bg-[#2FAE6D] hover:bg-[#27995f] text-white rounded-lg font-bold text-xs flex items-center gap-1 shadow-xs transition-all cursor-pointer active:scale-95"
                        >
                          <Calculator className="w-3.5 h-3.5" />
                          <span>Cotizar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Clean Technical & Surface Guide Modal */}
      {activeProductModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] text-left animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-5 sm:px-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] font-bold uppercase text-emerald-400 tracking-widest">
                  {activeProductModal.category} • {activeProductModal.code}
                </span>
                <h3 className="text-lg font-black text-white">
                  {activeProductModal.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveProductModal(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Compact & Minimalist */}
            <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1 text-slate-800">
              {/* Dual Image Comparison */}
              <div className="grid grid-cols-2 gap-3">
                <div className="relative rounded-xl overflow-hidden h-40 bg-slate-900">
                  <img
                    src={activeProductModal.image}
                    alt={activeProductModal.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-bold">
                    Presentación Galón
                  </div>
                </div>
                <div className="relative rounded-xl overflow-hidden h-40 bg-slate-900">
                  <img
                    src={activeProductModal.surfaceImage || activeProductModal.image}
                    alt={`Superficie ${activeProductModal.name}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/70 text-white text-[10px] font-bold">
                    Acabado Aplicado
                  </div>
                </div>
              </div>

              {/* 10-12 Words Description */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Especificación de Fábrica
                </span>
                <p className="text-xs font-medium text-slate-700">
                  {activeProductModal.paintType || activeProductModal.category} con certificación técnica de durabilidad.
                </p>
              </div>

              {/* Technical Badges Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-bold">Rendimiento</span>
                  <span className="font-extrabold text-slate-900">{activeProductModal.coveragePerGallonSqM} m²/gal</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-bold">Manos</span>
                  <span className="font-extrabold text-slate-900">{activeProductModal.recommendedCoats} manos</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-bold">Secado</span>
                  <span className="font-extrabold text-slate-900">{activeProductModal.dryingTimeHours} horas</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-bold">Garantía</span>
                  <span className="font-extrabold text-[#2FAE6D]">{activeProductModal.warrantyYears} años</span>
                </div>
              </div>

              {/* Surfaces List */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Superficies Certificadas
                </span>
                <div className="flex flex-wrap gap-2">
                  {activeProductModal.surfaceLabels && activeProductModal.surfaceLabels.length > 0 ? (
                    activeProductModal.surfaceLabels.map((s, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold"
                      >
                        <span>{s.icon}</span>
                        <span>{s.name}</span>
                      </span>
                    ))
                  ) : (
                    activeProductModal.suitableSurfaces.map((s) => (
                      <span
                        key={s}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold capitalize"
                      >
                        {s.replace('_', ' ')}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:px-6 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">Precio Galón Ref.</span>
                <p className="text-base font-black text-slate-900">
                  ${activeProductModal.pricePerGallonCOP.toLocaleString('es-CO')} COP
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveProductModal(null)}
                  className="px-4 py-2 bg-white text-slate-700 rounded-xl border border-slate-300 font-bold text-xs cursor-pointer hover:bg-slate-100"
                >
                  Cerrar
                </button>
                <button
                  type="button"
                  onClick={() => handleCalculateWithProduct(activeProductModal)}
                  className="px-5 py-2 bg-[#2FAE6D] hover:bg-[#27995f] text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Cotizar mi Área</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
