import React from 'react';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface CategoryItem {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  image: string;
  searchTerm: string;
}

const CATEGORIES: CategoryItem[] = [
  {
    id: 'interiores',
    title: 'Interiores',
    subtitle: 'Muros y techos lavables sin olor',
    tag: 'Tendencia',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80',
    searchTerm: 'Interior',
  },
  {
    id: 'exteriores',
    title: 'Exteriores',
    subtitle: 'Protección solar y lluvia extrema',
    tag: 'Resistente UV',
    image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    searchTerm: 'Exterior',
  },
  {
    id: 'madera-metal',
    title: 'Madera y Metal',
    subtitle: 'Esmaltes y anticorrosivos de alta duración',
    tag: 'Anticorrosivo',
    image: 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=800&q=80',
    searchTerm: 'Metales',
  },
  {
    id: 'impermeabilizantes',
    title: 'Impermeabilizantes',
    subtitle: 'Cero filtraciones en losas y terrazas',
    tag: '10 Años Garantía',
    image: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=800&q=80',
    searchTerm: 'Impermeabilización',
  },
  {
    id: 'pisos-alto-trafico',
    title: 'Pisos & Tráfico',
    subtitle: 'Epóxicos y demarcación industrial',
    tag: 'Tráfico Pesado',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80',
    searchTerm: 'Industrial',
  },
];

export const VisualCategories: React.FC = () => {
  const { setActiveView, setSearchQuery } = useApp();

  const handleSelectCategory = (cat: CategoryItem) => {
    setSearchQuery(cat.searchTerm);
    const el = document.getElementById('productos-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      setActiveView('products');
    }
  };

  return (
    <section className="py-12 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header - KOAJ Retail Minimalist */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3 text-left">
          <div>
            <span className="text-[11px] font-extrabold tracking-widest text-[#2FAE6D] uppercase flex items-center gap-1 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              Líneas Principales
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Categorías Visuales
            </h2>
          </div>
          <button
            onClick={() => {
              setSearchQuery('');
              const el = document.getElementById('productos-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
              else setActiveView('products');
            }}
            className="text-xs font-bold text-slate-600 hover:text-[#1B2A6B] flex items-center gap-1 cursor-pointer transition-colors group"
          >
            <span>Ver todo el catálogo</span>
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>

        {/* 5 Visual Cards (Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {CATEGORIES.map((cat, index) => (
            <div
              key={cat.id}
              onClick={() => handleSelectCategory(cat)}
              className={`group relative overflow-hidden rounded-2xl cursor-pointer bg-slate-950 transition-all duration-300 hover:shadow-xl ${
                index === 0 ? 'sm:col-span-2 lg:col-span-2 h-72 sm:h-80' : 'h-72 sm:h-80'
              }`}
            >
              <img
                src={cat.image}
                alt={cat.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-85 group-hover:opacity-95"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-black/10 group-hover:from-slate-950/95 transition-colors" />

              <div className="absolute top-4 left-4 z-10">
                <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-white border border-white/20">
                  {cat.tag}
                </span>
              </div>

              <div className="absolute bottom-0 inset-x-0 p-5 z-10 text-left flex flex-col justify-end">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xl font-extrabold text-white group-hover:text-emerald-300 transition-colors">
                    {cat.title}
                  </h3>
                  <div className="w-8 h-8 rounded-full bg-white/20 group-hover:bg-[#2FAE6D] backdrop-blur-md flex items-center justify-center text-white transition-all transform group-hover:rotate-45">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-xs text-slate-300 mt-1 line-clamp-1 font-medium">
                  {cat.subtitle}
                </p>
                <span className="text-[11px] font-bold text-emerald-400 mt-2 inline-flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Ver opciones ➔
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
