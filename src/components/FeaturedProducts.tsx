import React, { useState, useMemo } from 'react';
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
  LayoutGrid,
  Table as TableIcon,
  SlidersHorizontal,
  FileText,
  Clock,
  ArrowUpDown,
  CheckCircle2,
  Package,
  Eye,
  ShieldAlert,
  Wrench,
  Sparkle,
  Palette,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PaintProduct } from '../types';
import { COLOR_PALETTES } from '../data/initialData';

export interface PresentationPriceItem {
  label: string;
  size: string;
  priceCOP: number;
}

export const FeaturedProducts: React.FC = () => {
  const { products, searchQuery, setSearchQuery, setIsRequestModalOpen, setActiveView } = useApp();
  
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [selectedSurfaceFilter, setSelectedSurfaceFilter] = useState<string>('all');
  const [selectedFinishFilter, setSelectedFinishFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'destacados' | 'price_asc' | 'price_desc' | 'coverage_desc' | 'warranty_desc'>('destacados');
  const [viewMode, setViewMode] = useState<'grid' | 'matrix'>('grid');
  
  // Track image toggle per card: 'product' (can) or 'surface' (finish)
  const [cardImageMode, setCardImageMode] = useState<Record<string, 'product' | 'surface'>>({});
  
  // Technical detail modal (Product View with colors, care instructions, technical details)
  const [activeProductModal, setActiveProductModal] = useState<PaintProduct | null>(null);
  const [selectedModalColor, setSelectedModalColor] = useState<string | null>(null);

  // Surface description map: specifies exactly what surfaces can be painted with each product
  const productSurfacesDescription: Record<string, string> = {
    'prod-viniltex': 'Muros interiores de mampostería, drywall, estuco, yeso, pañete y cielorrasos en salas, alcobas y pasillos.',
    'prod-viniltex-banos': 'Paredes de baños, zonas de ducha, cocinas, lavanderías y áreas expuestas a vapor, grasa o condensación de humedad.',
    'prod-viniltex-satin': 'Muros y paredes interiores con acabado estucado fino, paneles de yeso, recepciones, comedores y áreas residenciales.',
    'prod-viniltex-vidacuidado': 'Habitaciones de bebés y niños, dormitorios, clínicas, jardines infantiles y muros interiores con personas alérgicas.',
    'prod-intervinil': 'Cielos rasos, primeras manos en pañetes secos, proyectos de vivienda de interés social y muros interiores secos.',
    'prod-estuco-acrilico': 'Revoques rústicos, pañetes en interior y exterior, placas de drywall y nivelación de muros antes de pintar.',
    'prod-koraza': 'Fachadas exteriores a la intemperie, muros de concreto, revoque exterior, culatas de edificios y ladrillo a la vista.',
    'prod-koraza-elastomerica': 'Fachadas de edificios con dilatación térmica, muros con microfisuras activas de hasta 1 mm y revoques exteriores.',
    'prod-koraza-doblevida': 'Grandes edificaciones institucionales, fachadas costeras con brisa salina, rascacielos y muros exteriores de alta exigencia.',
    'prod-sellomax': 'Muros nuevos de mampostería o pañete alcalino, revoques porosos y paredes con repintes antiguos entizados o con polvo.',
    'prod-pintulux': 'Rejas, portones, marcos de ventanas, barandas metálicas, tuberías, estructuras ferrosas y puertas de madera tratada.',
    'prod-acualux': 'Marcos de puertas interiores, cerrajería de alcobas, barandas infantiles, muebles y maderas sin olor a solvente.',
    'prod-pintulux-3en1': 'Metales ferrosos oxidados o nuevos, cerramientos, tejas de zinc, tuberías y estructuras sin necesidad de anticorrosivo previo.',
    'prod-corrotec': 'Vigas estructurales de acero, perfiles metálicos en obra negra, puentes, tanques y maquinaria industrial.',
    'prod-madetec-barniz': 'Pisos de madera, parquet, escaleras de madera, pasamanos, cubiertas de mesas y carpintería de alto tráfico peatonal.',
    'prod-madera': 'Decks exteriores, pérgolas, portones de madera a la intemperie, vigas vistas y mobiliario de jardín.',
    'prod-aquatec': 'Losas de concreto transitables, cubiertas planas, terrazas residenciales, balcones y muros de contención.',
    'prod-aquatec-techos': 'Cubiertas de concreto con pendientes leves propensas a empozamiento, terrazas transitables y techos de fibrocemento.',
    'prod-alumol': 'Tejas de zinc, cubiertas de fibrocemento, láminas metálicas y mantos asfálticos para aislamiento térmico.',
    'prod-epoxico': 'Pisos de concreto pulido en bodegas industriales, parqueaderos, quirófanos, laboratorios farmacéuticos y plantas de alimentos.',
    'prod-epoxi-poliamida': 'Muros asépticos de clínicas, tanques de almacenamiento, plantas de bebidas y estructuras expuestas a químicos y vapores.',
    'prod-trafico': 'Pavimentos de asfalto y concreto en vías públicas, parqueaderos, pasos peatonales, rampas vehiculares y canchas.',
    'prod-trafico-agua': 'Parqueaderos subterráneos, centros logísticos bajo techo, bodegas cerradas y ciclorrutas ecológicas.',
  };

  // Helper function to calculate presentation sizes and exact prices in COP
  const getProductPresentationsAndPrices = (product: PaintProduct): PresentationPriceItem[] => {
    const p = product.pricePerGallonCOP;
    const isIndustrial = product.category.includes('Industrial') || product.category.includes('Vial');
    const isEstuco = product.id === 'prod-estuco-acrilico';

    if (isEstuco) {
      return [
        { label: 'Galón (5 kg)', size: '1 Gal', priceCOP: 48900 },
        { label: 'Cuñete (27 kg)', size: '5 Gal', priceCOP: 189000 },
        { label: 'Tambor (300 kg)', size: '55 Gal', priceCOP: 1750000 },
      ];
    }

    if (isIndustrial) {
      return [
        { label: 'Galón (1 Gal / Kit)', size: '1 Gal', priceCOP: p },
        { label: 'Cuñete (5 Gal)', size: '5 Gal', priceCOP: Math.round((p * 4.7) / 1000) * 1000 },
        { label: 'Tambor (55 Gal)', size: '55 Gal', priceCOP: Math.round((p * 48) / 1000) * 1000 },
      ];
    }

    // Standard architectural paints
    return [
      { label: 'Cuarto (1/4 Gal)', size: '0.25 Gal', priceCOP: Math.round((p * 0.36) / 100) * 100 },
      { label: 'Galón (1 Gal)', size: '1 Gal', priceCOP: p },
      { label: 'Cuñete (5 Gal)', size: '5 Gal', priceCOP: Math.round((p * 4.65) / 1000) * 1000 },
    ];
  };

  // Surface filters
  const surfaceFilters = [
    { id: 'all', label: 'Todas las Superficies', icon: '🎨' },
    { id: 'mamposteria', label: 'Muros & Drywall', icon: '🧱' },
    { id: 'fachada_exterior', label: 'Fachadas Exteriores', icon: '🏢' },
    { id: 'metal_acero', label: 'Metales & Rejas', icon: '⚙️' },
    { id: 'madera', label: 'Maderas', icon: '🪵' },
    { id: 'pisos_trafico', label: 'Pisos & Concreto', icon: '🏭' },
    { id: 'zona_humeda', label: 'Terrazas & Cubiertas', icon: '☀️' },
  ];

  const categories = [
    'Todos',
    'Arquitectónica Interior',
    'Fachadas & Exteriores',
    'Esmaltes & Metales',
    'Maderas',
    'Impermeabilización',
    'Industrial & Pisos',
    'Vial & Señalización',
    'Preparación de Superficies',
  ];

  // Dynamic category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { Todos: products.length };
    categories.forEach((cat) => {
      if (cat !== 'Todos') {
        counts[cat] = products.filter((p) => p.category.toLowerCase().includes(cat.toLowerCase())).length;
      }
    });
    return counts;
  }, [products]);

  // Filter & sort pipeline
  const filteredProducts = useMemo(() => {
    let list = products.filter((prod) => {
      const matchesCategory =
        selectedCategory === 'Todos' || prod.category.toLowerCase().includes(selectedCategory.toLowerCase());
      
      const matchesSurface =
        selectedSurfaceFilter === 'all' ||
        prod.suitableSurfaces.includes(selectedSurfaceFilter as any);

      const matchesFinish =
        selectedFinishFilter === 'all' ||
        prod.availableFinishes.includes(selectedFinishFilter as any);

      const matchesSearch =
        !searchQuery ||
        prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (prod.paintType && prod.paintType.toLowerCase().includes(searchQuery.toLowerCase())) ||
        prod.code.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSurface && matchesFinish && matchesSearch;
    });

    if (sortBy === 'price_asc') {
      list.sort((a, b) => a.pricePerGallonCOP - b.pricePerGallonCOP);
    } else if (sortBy === 'price_desc') {
      list.sort((a, b) => b.pricePerGallonCOP - a.pricePerGallonCOP);
    } else if (sortBy === 'coverage_desc') {
      list.sort((a, b) => b.coveragePerGallonSqM - a.coveragePerGallonSqM);
    } else if (sortBy === 'warranty_desc') {
      list.sort((a, b) => b.warrantyYears - a.warrantyYears);
    }

    return list;
  }, [products, selectedCategory, selectedSurfaceFilter, selectedFinishFilter, searchQuery, sortBy]);

  const handleCalculateWithProduct = (product: PaintProduct) => {
    setActiveProductModal(null);
    setIsRequestModalOpen(true);
  };

  const toggleImageMode = (productId: string, mode: 'product' | 'surface') => {
    setCardImageMode((prev) => ({ ...prev, [productId]: mode }));
  };

  const openProductModal = (product: PaintProduct) => {
    setActiveProductModal(product);
    setSelectedModalColor(product.colors && product.colors.length > 0 ? product.colors[0] : null);
  };

  // Color hex resolver helper
  const getColorHex = (colorName: string): string => {
    const found = COLOR_PALETTES.find((c) => c.name.toLowerCase() === colorName.toLowerCase());
    if (found) return found.hex;
    const nameLower = colorName.toLowerCase();
    if (nameLower.includes('blanco')) return '#F9FAFB';
    if (nameLower.includes('marfil') || nameLower.includes('crema')) return '#FEF3C7';
    if (nameLower.includes('lino')) return '#E2E8F0';
    if (nameLower.includes('gris') || nameLower.includes('urbano')) return '#94A3B8';
    if (nameLower.includes('plomo') || nameLower.includes('grafito')) return '#475569';
    if (nameLower.includes('azul')) return '#1B2A6B';
    if (nameLower.includes('verde')) return '#2FAE6D';
    if (nameLower.includes('terracota') || nameLower.includes('arcilla')) return '#C2410C';
    if (nameLower.includes('ocre') || nameLower.includes('amarillo')) return '#D97706';
    if (nameLower.includes('negro') || nameLower.includes('ébano')) return '#18181B';
    if (nameLower.includes('rojo')) return '#DC2626';
    return '#CBD5E1';
  };

  return (
    <section id="catalogo-section" className="py-10 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Structure Header */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs mb-8 text-left">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#2FAE6D] bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                  Portafolio Certificado Pintuco®
                </span>
                <span className="text-xs text-slate-400 font-semibold">
                  {filteredProducts.length} de {products.length} productos
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Catálogo de Pinturas & Recubrimientos
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
                Consulta qué superficies se pueden pintar con cada producto, sus presentaciones disponibles y precios oficiales. Abre cada producto para ver su carta de colores, cuidados y fichas técnicas.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => setActiveView('simulator')}
                className="px-4 py-2.5 bg-gradient-to-r from-[#1B2A6B] to-[#142154] hover:from-[#142154] text-white rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs cursor-pointer transition-all"
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Simulador 3D en Fotos</span>
              </button>

              <button
                onClick={() => setIsRequestModalOpen(true)}
                className="px-4 py-2.5 bg-[#2FAE6D] hover:bg-[#27995f] text-white rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs cursor-pointer transition-all"
              >
                <Calculator className="w-4 h-4" />
                <span>Cotizar Proyecto m²</span>
              </button>
            </div>
          </div>

          {/* Categories Horizontal Rail with Product Counters */}
          <div className="pt-4">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2">
              Líneas de Pintura:
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {categories.map((cat) => {
                const count = categoryCounts[cat] || 0;
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#1B2A6B] text-white shadow-xs scale-102'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80'
                    }`}
                  >
                    <span>{cat}</span>
                    <span
                      className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-white text-slate-600'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subfilters Bar: Surface, Finish, Sorting & View Toggle */}
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar pintura o código..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-7 py-2 bg-slate-100 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-[#1B2A6B] outline-none transition-all"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Surface Selector */}
            <div>
              <select
                value={selectedSurfaceFilter}
                onChange={(e) => setSelectedSurfaceFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-[#1B2A6B] border border-transparent cursor-pointer"
              >
                {surfaceFilters.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.icon} {s.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Finish Selector */}
            <div>
              <select
                value={selectedFinishFilter}
                onChange={(e) => setSelectedFinishFilter(e.target.value)}
                className="w-full px-3 py-2 bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-[#1B2A6B] border border-transparent cursor-pointer"
              >
                <option value="all">✨ Todos los Acabados</option>
                <option value="mate">Acabado Mate</option>
                <option value="satinado">Acabado Satinado</option>
                <option value="semibrillante">Acabado Semibrillante</option>
                <option value="brillante">Acabado Brillante</option>
              </select>
            </div>

            {/* Sorting & Layout View Toggle */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="w-full pl-7 pr-3 py-2 bg-slate-100 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-[#1B2A6B] border border-transparent cursor-pointer"
                >
                  <option value="destacados">⭐ Más Destacados</option>
                  <option value="price_asc">💵 Menor Precio</option>
                  <option value="price_desc">💎 Mayor Precio</option>
                  <option value="coverage_desc">📐 Mayor Rendimiento m²</option>
                  <option value="warranty_desc">🛡️ Mayor Garantía</option>
                </select>
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* View Switcher: Grid vs Matrix */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl shrink-0 border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'grid' ? 'bg-white text-[#1B2A6B] shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Vista Cuadrícula de Tarjetas"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('matrix')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'matrix' ? 'bg-white text-[#1B2A6B] shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                  title="Vista Tabla Comparativa"
                >
                  <TableIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 text-slate-500 max-w-lg mx-auto">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-base font-bold text-slate-800">No hay pinturas con los filtros seleccionados</p>
            <p className="text-xs text-slate-500 mt-1">Prueba seleccionando otra línea o restablece los filtros.</p>
            <button
              onClick={() => {
                setSelectedCategory('Todos');
                setSelectedSurfaceFilter('all');
                setSelectedFinishFilter('all');
                setSearchQuery('');
              }}
              className="mt-4 px-5 py-2.5 bg-[#1B2A6B] text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-[#142154] transition-colors"
            >
              Restablecer Filtros
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* 1. PRODUCT CARDS: SUPERFICIES A PINTAR, PRESENTACIONES Y PRECIOS */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const currentMode = cardImageMode[product.id] || 'product';
              const displayImage = currentMode === 'surface' && product.surfaceImage ? product.surfaceImage : product.image;
              const surfacesText = productSurfacesDescription[product.id] || product.description;
              const presentations = getProductPresentationsAndPrices(product);

              return (
                <div
                  key={product.id}
                  id={`product-card-${product.id}`}
                  className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group text-left"
                >
                  {/* High Quality Photography Frame Showing Real Application Surface */}
                  <div className="relative h-56 overflow-hidden bg-slate-950">
                    <img
                      src={displayImage}
                      alt={product.name}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.dataset.hasFallback) {
                          target.dataset.hasFallback = 'true';
                          target.src = 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80';
                        }
                      }}
                      onClick={() => openProductModal(product)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out cursor-pointer"
                    />

                    {/* Gradient shade */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/15 to-black/25 pointer-events-none" />

                    {/* Top Kicker & Badge */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white text-slate-900 shadow-sm backdrop-blur-xs">
                        {product.badge || 'Pintuco® Oficial'}
                      </span>

                      {/* Surface Chip Tag on Image */}
                      <div className="bg-black/70 backdrop-blur-xs rounded-full px-2.5 py-0.5 flex items-center text-[10px] font-extrabold text-white border border-white/20 shadow-xs">
                        <span className="text-emerald-400 mr-1 text-xs">●</span>
                        <span className="max-w-[140px] truncate">
                          {product.surfaceLabels && product.surfaceLabels.length > 0
                            ? product.surfaceLabels[0].name
                            : 'Superficie Real'}
                        </span>
                      </div>
                    </div>

                    {/* Bottom overlay: Specific surface application description */}
                    <div className="absolute bottom-2.5 left-3 z-10 text-[10px] font-bold text-white/95 bg-black/65 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-white/15 flex items-center gap-1.5 shadow-sm max-w-[55%]">
                      <span>{product.surfaceLabels?.[0]?.icon || '🧱'}</span>
                      <span className="truncate">
                        {product.surfaceLabels?.[0]?.description || 'Superficie de aplicación'}
                      </span>
                    </div>

                    {/* Click hint */}
                    <div
                      onClick={() => openProductModal(product)}
                      className="absolute bottom-2.5 right-3 z-10 text-[10px] font-bold text-white/95 bg-[#1B2A6B]/85 hover:bg-[#1B2A6B] border border-white/20 px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer backdrop-blur-xs transition-colors shadow-sm"
                    >
                      <Eye className="w-3 h-3 text-emerald-400" />
                      <span>Ver Ficha & Cuidados</span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3.5">
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        <span>{product.category}</span>
                        <span className="text-[#1B2A6B] font-extrabold bg-blue-50 px-1.5 py-0.2 rounded-sm border border-blue-100">
                          {product.code}
                        </span>
                      </div>
                      <h3
                        onClick={() => openProductModal(product)}
                        className="font-extrabold text-base text-slate-900 leading-snug line-clamp-1 group-hover:text-[#1B2A6B] transition-colors cursor-pointer"
                      >
                        {product.name}
                      </h3>
                      
                      {/* SPECIFIC SURFACE DESCRIPTION AS REQUESTED BY USER */}
                      <div className="mt-2.5 p-3 rounded-2xl bg-blue-50/50 border border-blue-100/80">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#1B2A6B] block mb-1">
                          🧱 Superficies que se pueden pintar:
                        </span>
                        <p className="text-xs text-slate-700 leading-relaxed font-medium">
                          {surfacesText}
                        </p>
                      </div>
                    </div>

                    {/* PRESENTACIONES & PRECIOS DETALLADOS DIRECTAMENTE EN LA TARJETA */}
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1.5">
                        📦 Presentaciones & Precios Oficiales:
                      </span>
                      <div className="space-y-1.5">
                        {presentations.map((item) => (
                          <div
                            key={item.label}
                            className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs hover:bg-slate-100/70 transition-colors"
                          >
                            <span className="font-semibold text-slate-700">{item.label}</span>
                            <span className="font-black text-slate-900">
                              ${item.priceCOP.toLocaleString('es-CO')}{' '}
                              <span className="text-[9px] font-normal text-slate-400">COP</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* CARD FOOTER: ABRIR PRODUCTO, COTIZAR Y SIMULAR */}
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <button
                        type="button"
                        onClick={() => openProductModal(product)}
                        className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-200/80"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#1B2A6B]" />
                        <span>Abrir Producto (Colores & Cuidados)</span>
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveView('simulator')}
                          className="py-2 bg-emerald-50 hover:bg-emerald-100 text-[#2FAE6D] rounded-xl font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer border border-emerald-200"
                          title="Simular en Fotografías"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-[#2FAE6D]" />
                          <span>Simular 3D</span>
                        </button>

                        <button
                          id={`calc-prod-btn-${product.id}`}
                          onClick={() => handleCalculateWithProduct(product)}
                          className="py-2 bg-[#2FAE6D] hover:bg-[#27995f] text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1 shadow-2xs transition-all cursor-pointer active:scale-95"
                          title="Cotizar Proyecto por Metros Cuadrados"
                        >
                          <Calculator className="w-3.5 h-3.5" />
                          <span>Cotizar m²</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* 2. TABLE VIEW (COMPARATIVE MATRIX) */
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs text-left">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-700">
                <thead className="bg-[#142154] text-white text-[11px] uppercase font-bold tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Producto & Código</th>
                    <th className="py-3.5 px-3">Superficies que se pueden pintar</th>
                    <th className="py-3.5 px-3">Presentaciones Disponibles</th>
                    <th className="py-3.5 px-3">Precio Galón Ref.</th>
                    <th className="py-3.5 px-4 text-right">Abrir / Cotizar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredProducts.map((p) => {
                    const surfacesText = productSurfacesDescription[p.id] || p.description;
                    const presentations = getProductPresentationsAndPrices(p);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={p.image}
                              alt={p.name}
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                const target = e.currentTarget;
                                if (!target.dataset.hasFallback) {
                                  target.dataset.hasFallback = 'true';
                                  target.src = 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80';
                                }
                              }}
                              onClick={() => openProductModal(p)}
                              className="w-12 h-12 rounded-xl object-cover bg-slate-900 shrink-0 cursor-pointer hover:opacity-90 border border-slate-200"
                            />
                            <div>
                              <p
                                onClick={() => openProductModal(p)}
                                className="font-extrabold text-slate-900 text-xs cursor-pointer hover:text-[#1B2A6B]"
                              >
                                {p.name}
                              </p>
                              <span className="text-[10px] font-bold text-[#1B2A6B] bg-blue-50 px-1.5 py-0.5 rounded-sm">
                                {p.code} • {p.category}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 max-w-xs">
                          <p className="text-xs text-slate-700 font-medium line-clamp-2 leading-relaxed">
                            {surfacesText}
                          </p>
                        </td>
                        <td className="py-3.5 px-3">
                          <div className="space-y-1">
                            {presentations.map((item) => (
                              <div key={item.label} className="text-[11px] font-medium text-slate-600">
                                <span className="font-semibold text-slate-800">{item.label}:</span> ${item.priceCOP.toLocaleString('es-CO')}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="py-3.5 px-3 font-black text-slate-900 text-sm whitespace-nowrap">
                          ${p.pricePerGallonCOP.toLocaleString('es-CO')} COP
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openProductModal(p)}
                              className="px-2.5 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer border border-slate-200"
                              title="Abrir Producto (Colores y Cuidados)"
                            >
                              <Eye className="w-3.5 h-3.5 inline mr-1 text-[#1B2A6B]" />
                              <span>Abrir</span>
                            </button>
                            <button
                              onClick={() => setActiveView('simulator')}
                              className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer border border-emerald-200"
                              title="Simular en Fotos"
                            >
                              <Sparkles className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleCalculateWithProduct(p)}
                              className="px-3 py-1.5 bg-[#2FAE6D] hover:bg-[#27995f] text-white font-bold rounded-lg transition-all cursor-pointer shadow-2xs flex items-center gap-1 text-[11px]"
                              title="Cotizar Metros Cuadrados"
                            >
                              <Calculator className="w-3.5 h-3.5" />
                              <span>Cotizar</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* COMPREHENSIVE PRODUCT MODAL: APERTURA DEL PRODUCTO CON COLORES, CUIDADOS Y PREPARACIÓN */}
      {activeProductModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] text-left animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-5 sm:px-6 bg-[#142154] text-white flex items-center justify-between shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase text-emerald-400 tracking-widest bg-white/10 px-2.5 py-0.5 rounded-full">
                    {activeProductModal.category}
                  </span>
                  <span className="text-xs text-slate-300 font-mono font-bold">
                    Código Oficial: {activeProductModal.code}
                  </span>
                </div>
                <h3 className="text-xl font-black text-white mt-1">
                  {activeProductModal.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveProductModal(null)}
                className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Full product inspection */}
            <div className="p-5 sm:p-6 space-y-6 overflow-y-auto flex-1 text-slate-800">
              {/* Visible Real Application Surface & Texture Detail */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="relative rounded-2xl overflow-hidden h-52 bg-slate-900 border border-slate-200">
                  <img
                    src={activeProductModal.image}
                    alt={activeProductModal.name}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.dataset.hasFallback) {
                        target.dataset.hasFallback = 'true';
                        target.src = 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80';
                      }
                    }}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2.5 left-2.5 px-3 py-1 rounded-lg bg-black/75 text-white text-[11px] font-extrabold backdrop-blur-xs flex items-center gap-1.5 border border-white/20">
                    <span className="text-emerald-400">●</span>
                    <span>Superficie: {activeProductModal.surfaceLabels?.[0]?.name || 'Superficie de Aplicación'}</span>
                  </div>
                </div>
                <div className="relative rounded-2xl overflow-hidden h-52 bg-slate-900 border border-slate-200">
                  <img
                    src={activeProductModal.surfaceImage || activeProductModal.image}
                    alt={`Superficie ${activeProductModal.name}`}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (!target.dataset.hasFallback) {
                        target.dataset.hasFallback = 'true';
                        target.src = 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80';
                      }
                    }}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-2.5 left-2.5 px-3 py-1 rounded-lg bg-black/75 text-white text-[11px] font-extrabold backdrop-blur-xs flex items-center gap-1.5 border border-white/20">
                    <span className="text-blue-400">●</span>
                    <span>{activeProductModal.surfaceLabels?.[1]?.name || activeProductModal.surfaceLabels?.[0]?.description || 'Acabado y Textura Real'}</span>
                  </div>
                </div>
              </div>

              {/* 1. SECCIÓN DE COLORES DISPONIBLES (SOLICITADO ÚNICAMENTE AL ABRIR EL PRODUCTO) */}
              <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-[#1B2A6B]" />
                    <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                      Gama de Colores Disponibles
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-semibold">
                    {activeProductModal.colors.length} tonos oficiales
                  </span>
                </div>

                <div className="flex flex-wrap gap-2.5 pt-1">
                  {activeProductModal.colors.map((colorName) => {
                    const hex = getColorHex(colorName);
                    const isSelected = selectedModalColor === colorName;
                    return (
                      <button
                        key={colorName}
                        type="button"
                        onClick={() => setSelectedModalColor(colorName)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-white border-[#1B2A6B] text-[#1B2A6B] shadow-sm ring-2 ring-[#1B2A6B]/20'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs shrink-0"
                          style={{ backgroundColor: hex }}
                        />
                        <span>{colorName}</span>
                      </button>
                    );
                  })}
                </div>

                {selectedModalColor && (
                  <div className="mt-2 p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-5 h-5 rounded-md border border-slate-300 shadow-2xs"
                        style={{ backgroundColor: getColorHex(selectedModalColor) }}
                      />
                      <span className="font-bold text-slate-900">Tono Seleccionado: {selectedModalColor}</span>
                    </div>
                    <button
                      onClick={() => {
                        setActiveProductModal(null);
                        setActiveView('simulator');
                      }}
                      className="text-xs font-bold text-[#2FAE6D] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Probar en simulador 3D</span>
                    </button>
                  </div>
                )}
              </div>

              {/* 2. CUIDADOS, LIMPIEZA & RECOMENDACIONES (SOLICITADO ÚNICAMENTE AL ABRIR EL PRODUCTO) */}
              <div className="p-4 sm:p-5 bg-amber-50/50 rounded-2xl border border-amber-200/80 space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-700" />
                  <span className="text-xs font-black uppercase tracking-wider text-amber-950">
                    Cuidados, Mantenimiento & Precauciones
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
                  <div className="p-3 bg-white rounded-xl border border-amber-200/60 space-y-1">
                    <p className="font-bold text-slate-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#2FAE6D]" />
                      <span>Limpieza y Lavado:</span>
                    </p>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Lavar únicamente con esponja suave o paño humedecido en agua y jabón neutro. No frotar con estropajos abrasivos, cloro puro ni solventes.
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-amber-200/60 space-y-1">
                    <p className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Tiempo de Curado:</span>
                    </p>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Dejar secar 15 a 30 días antes de realizar el primer lavado o limpieza exigente, permitiendo que la resina polimerice y adquiera máxima lavabilidad.
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-amber-200/60 space-y-1">
                    <p className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-[#1B2A6B]" />
                      <span>Almacenamiento:</span>
                    </p>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Guardar en el envase original bien sellado, en lugar techado, fresco y seco, alejado de la radiación solar directa y fuentes de ignición.
                    </p>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-amber-200/60 space-y-1">
                    <p className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Wrench className="w-3.5 h-3.5 text-slate-700" />
                      <span>Ventilación y Seguridad:</span>
                    </p>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      Aplicar en espacios con ventilación adecuada. Evitar contacto prolongado con ojos y piel; mantener fuera del alcance de niños y mascotas.
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. SUPERFICIES HOMOLOGADAS & PREPARACIÓN */}
              <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-xs font-black uppercase tracking-wider text-slate-900 block">
                  Superficies Homologadas & Preparación Previa
                </span>
                
                <p className="text-xs text-slate-700 leading-relaxed">
                  <strong className="text-slate-900">Apta para pintar: </strong>
                  {productSurfacesDescription[activeProductModal.id] || activeProductModal.description}
                </p>

                {activeProductModal.applicationTip && (
                  <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
                    <Info className="w-4 h-4 text-[#1B2A6B] shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-slate-900">Preparación recomendada: </strong>
                      <span>{activeProductModal.applicationTip}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 4. ESPECIFICACIONES TÉCNICAS */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-bold">Rendimiento</span>
                  <span className="font-extrabold text-slate-900 text-sm">{activeProductModal.coveragePerGallonSqM} m²/gal</span>
                  <span className="text-[10px] text-slate-500 block">a 2 manos</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-bold">Manos Sugeridas</span>
                  <span className="font-extrabold text-slate-900 text-sm">{activeProductModal.recommendedCoats} manos</span>
                  <span className="text-[10px] text-slate-500 block">cubrimiento</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-bold">Tiempo de Secado</span>
                  <span className="font-extrabold text-slate-900 text-sm">{activeProductModal.dryingTimeHours} horas</span>
                  <span className="text-[10px] text-slate-500 block">al tacto</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-400 block font-bold">Garantía Pintuco</span>
                  <span className="font-extrabold text-[#2FAE6D] text-sm">{activeProductModal.warrantyYears} años</span>
                  <span className="text-[10px] text-slate-500 block">certificada</span>
                </div>
              </div>

              {/* 5. PRESENTACIONES Y PRECIOS DENTRO DEL MODAL */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-xs font-black uppercase tracking-wider text-slate-900 block mb-2">
                  Presentaciones & Precios Vigentes
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {getProductPresentationsAndPrices(activeProductModal).map((pres) => (
                    <div key={pres.label} className="p-2.5 bg-white rounded-xl border border-slate-200 text-xs text-center">
                      <span className="font-bold text-slate-700 block">{pres.label}</span>
                      <span className="font-black text-[#1B2A6B] text-sm mt-0.5 block">
                        ${pres.priceCOP.toLocaleString('es-CO')} COP
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:px-6 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div>
                <span className="text-[10px] text-slate-400 block font-bold">Precio Galón Ref.</span>
                <p className="text-lg font-black text-slate-900">
                  ${activeProductModal.pricePerGallonCOP.toLocaleString('es-CO')} <span className="text-xs font-normal text-slate-500">COP</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveProductModal(null);
                    setActiveView('simulator');
                  }}
                  className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-[#2FAE6D] rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 border border-emerald-200 cursor-pointer transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Simular en 3D</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleCalculateWithProduct(activeProductModal)}
                  className="px-5 py-2.5 bg-[#2FAE6D] hover:bg-[#27995f] text-white rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-xs cursor-pointer transition-all active:scale-95"
                >
                  <Calculator className="w-4 h-4" />
                  <span>Cotizar mi Obra en m²</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
