import React, { useState } from 'react';
import {
  Search,
  MapPin,
  X,
  Sparkles,
  ClipboardList,
  PlusCircle,
  MessageSquare,
  ChevronDown,
  LogIn,
  LogOut,
  User,
  ShieldCheck,
  Database,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BrandLogo } from './BrandLogo';

export const Header: React.FC = () => {
  const {
    currentUser,
    isLoggedIn,
    logout,
    switchRole,
    allUsers,
    activeView,
    setActiveView,
    searchQuery,
    setSearchQuery,
    selectedCity,
    setSelectedCity,
    requests,
    setIsRequestModalOpen,
    setIsAuthModalOpen,
    setIsChatOpen,
    products,
    whatsAppCommercialNumber,
    supabaseStatus,
    refreshFromSupabase,
  } = useApp();

  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const cities = ['Bogotá D.C.', 'Medellín', 'Cali', 'Barranquilla', 'Bucaramanga', 'Cartagena'];

  const pendingRequestsCount = requests.filter((r) => r.status !== 'completado').length;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveView('products');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top micro banner for customer benefits & nationwide contact */}
      <div className="bg-[#142154] text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 bg-[#2FAE6D]/20 text-[#2FAE6D] px-2.5 py-0.5 rounded-full font-semibold text-[11px] border border-[#2FAE6D]/30">
              <Sparkles className="w-3 h-3" /> Portal de Clientes & Obras ColorLink
            </span>
            <span className="hidden md:inline text-slate-300 text-xs">
              Cálculo de m² • Reserva de Lote en Bodega • Garantía Oficial Pintuco
            </span>
          </div>

          {/* Quick contact / customer support info */}
          <div className="flex items-center gap-2.5 text-[11px] text-slate-300">
            {/* Supabase Status Pill & Quick Access */}
            <button
              onClick={() => {
                refreshFromSupabase();
                const el = document.getElementById('supabase-products-section') || document.getElementById('catalogo-section');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth' });
                } else {
                  setActiveView('home');
                  setTimeout(() => {
                    document.getElementById('supabase-products-section')?.scrollIntoView({ behavior: 'smooth' });
                  }, 60);
                }
              }}
              disabled={supabaseStatus.isSyncing}
              title={`Supabase: ${supabaseStatus.message}. Clic para consultar y ver tabla PRODUCTO.`}
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-semibold border transition-all cursor-pointer ${
                supabaseStatus.connected
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 hover:bg-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border-amber-400/40 hover:bg-amber-500/30'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  supabaseStatus.connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span>
                {supabaseStatus.isSyncing
                  ? 'Sincronizando...'
                  : supabaseStatus.connected
                  ? 'Supabase: Tabla PRODUCTO'
                  : 'Supabase Local'}
              </span>
            </button>

            <span className="hidden sm:inline">Línea Técnica: <strong className="text-white">01 8000 111 247</strong></span>
            <span className="text-[#2FAE6D] font-bold hidden md:inline">Envíos a Nivel Nacional</span>
            <a
              id="header-whatsapp-hotline"
              href={`https://wa.me/${whatsAppCommercialNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                'Hola, me comunico desde la plataforma Pintuco ColorLink para solicitar asesoría técnica y cotización comercial.'
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[#25D366] hover:text-emerald-300 font-extrabold bg-white/10 hover:bg-white/20 px-2.5 py-0.5 rounded-full border border-[#25D366]/40 transition-all cursor-pointer"
            >
              <MessageSquare className="w-3 h-3 text-[#25D366]" />
              <span>WhatsApp Comercial</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-3 md:gap-6">
          {/* Logo Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              id="brand-logo-btn"
              onClick={() => setActiveView('home')}
              className="text-left group cursor-pointer transition-transform duration-200 focus:outline-hidden"
              aria-label="Ir a inicio de Pintuco ColorLink"
            >
              <BrandLogo variant="full" theme="light" size="md" />
            </button>

            {/* Direct Quick Links (Simulador 3D & Catálogo) */}
            <div className="hidden lg:flex items-center gap-1.5 ml-2">
              <button
                id="header-simulator-btn"
                onClick={() => setActiveView('simulator')}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                  activeView === 'simulator'
                    ? 'bg-[#2FAE6D] text-white shadow-xs'
                    : 'text-slate-700 hover:text-[#1B2A6B] hover:bg-slate-100'
                }`}
              >
                <Sparkles className={`w-4 h-4 ${activeView === 'simulator' ? 'text-white' : 'text-[#2FAE6D]'}`} />
                <span>Simulador 3D</span>
              </button>

              <button
                id="header-catalog-btn"
                onClick={() => setActiveView('products')}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
                  activeView === 'products'
                    ? 'bg-[#1B2A6B] text-white shadow-xs'
                    : 'text-slate-700 hover:text-[#1B2A6B] hover:bg-slate-100'
                }`}
              >
                <span>Catálogo</span>
              </button>

              <button
                id="header-supabase-btn"
                onClick={() => {
                  setActiveView('home');
                  setTimeout(() => {
                    const el = document.getElementById('supabase-products-section') || document.getElementById('catalogo-section');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }, 60);
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 shadow-2xs"
                title="Ver lista de productos directamente de la tabla PRODUCTO en Supabase"
              >
                <Database className="w-4 h-4 text-indigo-600" />
                <span>Tabla PRODUCTO</span>
              </button>
            </div>

          </div>

          {/* Central Rounded Search Bar */}
          <div className="flex-1 max-w-lg mx-2">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                id="main-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="¿Qué buscas? (ej. Koraza, Epóxico, Muros, SOL-101)..."
                className="w-full pl-11 pr-10 py-2.5 bg-slate-100 hover:bg-slate-100/80 focus:bg-white text-sm text-slate-800 placeholder-slate-400 rounded-full border border-transparent focus:border-[#1B2A6B] focus:ring-2 focus:ring-[#1B2A6B]/15 outline-hidden transition-all shadow-2xs"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </form>
          </div>

          {/* Right Action Icons & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* City selector dropdown */}
            <div className="relative hidden md:block">
              <button
                id="city-selector-btn"
                onClick={() => setIsCityDropdownOpen(!isCityDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5 text-[#2FAE6D]" />
                <span className="max-w-[90px] truncate">{selectedCity}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isCityDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase">
                    Puntos de Entrega
                  </div>
                  {cities.map((city) => (
                    <button
                      key={city}
                      onClick={() => {
                        setSelectedCity(city);
                        setIsCityDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs transition-colors flex items-center justify-between ${
                        selectedCity === city
                          ? 'bg-emerald-50 text-[#2FAE6D] font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{city}</span>
                      {selectedCity === city && <span className="w-1.5 h-1.5 rounded-full bg-[#2FAE6D]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dashboard / Requests button with badge */}
            <button
              id="nav-dashboard-btn"
              onClick={() => setActiveView('dashboard')}
              className={`relative p-2.5 rounded-xl transition-all cursor-pointer ${
                activeView === 'dashboard'
                  ? 'bg-[#1B2A6B] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
              title="Panel de Solicitudes y Gestión"
            >
              <ClipboardList className="w-4 h-4" />
              {pendingRequestsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#2FAE6D] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                  {pendingRequestsCount}
                </span>
              )}
            </button>

            {/* New Paint Request CTA Button (Verde #2FAE6D) */}
            <button
              id="new-request-cta-btn"
              onClick={() => setIsRequestModalOpen(true)}
              className="flex items-center gap-2 bg-[#2FAE6D] hover:bg-[#26975d] text-white px-3.5 sm:px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Nueva Solicitud</span>
              <span className="sm:hidden">Cotizar</span>
            </button>

            {/* Conditional Auth Button or Personalized Greeting */}
            {isLoggedIn && currentUser ? (
              <div className="relative">
                <button
                  id="user-profile-menu-btn"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 sm:gap-2.5 pl-2 sm:pl-2.5 pr-2.5 sm:pr-3 py-1.5 bg-gradient-to-r from-emerald-50 via-blue-50 to-emerald-50/60 hover:from-emerald-100 hover:to-blue-100 border border-emerald-300/80 rounded-2xl shadow-2xs hover:shadow-xs transition-all cursor-pointer group text-left"
                >
                  {/* Monogram / Avatar with active indicator */}
                  <div className="relative">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#1B2A6B] to-[#2FAE6D] text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
                      {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'C'}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#2FAE6D] border-2 border-white rounded-full"></span>
                  </div>

                  {/* Eye-catching Greeting text */}
                  <div className="flex flex-col text-left">
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] font-black text-[#2FAE6D] flex items-center">
                        👋 ¡Hola,
                      </span>
                      <span className="text-xs font-black text-slate-900 group-hover:text-[#1B2A6B] max-w-[100px] sm:max-w-[130px] truncate">
                        {currentUser.name ? currentUser.name.split(' ')[0] : 'Cliente'}!
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-semibold truncate max-w-[120px] sm:max-w-[140px]">
                      {currentUser.docType || 'Doc'}: {currentUser.docNumber || 'Registrado'}
                    </span>
                  </div>

                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="p-3 bg-gradient-to-br from-[#142154] to-[#1B2A6B] text-white rounded-xl mb-2">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] px-2 py-0.5 bg-[#2FAE6D] text-white font-black rounded-md uppercase">
                          {currentUser.docType}: {currentUser.docNumber}
                        </span>
                      </div>
                      <p className="font-extrabold text-sm text-white truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-300 truncate">{currentUser.company || 'Cliente Registrado'}</p>
                    </div>

                    <div className="space-y-1">
                      <button
                        onClick={() => {
                          setActiveView('dashboard');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer text-left"
                      >
                        <ClipboardList className="w-4 h-4 text-[#1B2A6B]" />
                        <span>Mis Cotizaciones & Obras</span>
                      </button>

                      <button
                        onClick={() => {
                          setIsRequestModalOpen(true);
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer text-left"
                      >
                        <PlusCircle className="w-4 h-4 text-[#2FAE6D]" />
                        <span>Nueva Cotización m²</span>
                      </button>

                      <div className="border-t border-slate-100 my-1"></div>

                      <button
                        id="logout-btn"
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer text-left"
                      >
                        <LogOut className="w-4 h-4 text-red-500" />
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="header-login-btn"
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-2 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-bold text-[#1B2A6B] bg-blue-50 hover:bg-blue-100 rounded-xl border border-blue-200/80 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
                title="Iniciar Sesión"
              >
                <LogIn className="w-4 h-4 text-[#1B2A6B]" />
                <span>Iniciar Sesión</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Quick Nav Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-slate-100 bg-white py-2 px-3">
        <button
          onClick={() => setActiveView('home')}
          className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${activeView === 'home' ? 'text-[#1B2A6B] bg-blue-50 font-bold' : 'text-slate-600'}`}
        >
          Inicio
        </button>
        <button
          onClick={() => setActiveView('simulator')}
          className={`text-xs font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1 ${activeView === 'simulator' ? 'text-white bg-[#2FAE6D] font-bold shadow-xs' : 'text-emerald-700 bg-emerald-50/70'}`}
        >
          <Sparkles className="w-3 h-3" />
          <span>Simulador</span>
        </button>
        <button
          onClick={() => setActiveView('products')}
          className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${activeView === 'products' ? 'text-[#1B2A6B] bg-blue-50 font-bold' : 'text-slate-600'}`}
        >
          Catálogo
        </button>
        <button
          onClick={() => setActiveView('dashboard')}
          className={`text-xs font-semibold px-3 py-1 rounded-lg flex items-center gap-1 ${activeView === 'dashboard' ? 'text-[#1B2A6B] bg-blue-50' : 'text-slate-600'}`}
        >
          <span>Panel</span>
          {pendingRequestsCount > 0 && (
            <span className="w-4 h-4 rounded-full bg-[#2FAE6D] text-white text-[10px] font-bold flex items-center justify-center">
              {pendingRequestsCount}
            </span>
          )}
        </button>
        {isLoggedIn && currentUser ? (
          <button
            onClick={() => setActiveView('dashboard')}
            className="text-xs font-black px-3 py-1 rounded-lg text-emerald-800 bg-emerald-50 border border-emerald-200 flex items-center gap-1"
          >
            <span>👋 {currentUser.name ? currentUser.name.split(' ')[0] : 'Cliente'}</span>
          </button>
        ) : (
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className="text-xs font-semibold px-3 py-1 rounded-lg text-[#1B2A6B] bg-blue-50 flex items-center gap-1"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Ingresar</span>
          </button>
        )}
      </div>
    </header>
  );
};
