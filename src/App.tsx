import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { ProcessAccessSection } from './components/ProcessAccessSection';
import { VisualCategories } from './components/VisualCategories';
import { FeaturedProducts } from './components/FeaturedProducts';
import { ProcessDetailModal } from './components/ProcessDetailModal';
import { ClientRequestModal } from './components/ClientRequestModal';
import { RequestDetailModal } from './components/RequestDetailModal';
import { AuthModal } from './components/AuthModal';
import { ColorLinkChatBot } from './components/ColorLinkChatBot';
import { Footer } from './components/Footer';
import { SupabaseProductsList } from './components/SupabaseProductsList';
import { RealisticColorSimulator } from './components/RealisticColorSimulator';
import { SimulatorHomeSection } from './components/SimulatorHomeSection';

// Client Dashboard
import { ClientDashboard } from './components/RoleDashboards/ClientDashboard';

import {
  Package,
  ShieldCheck,
  Sparkles,
  PlusCircle,
  Truck,
  CheckCircle2,
  Calculator,
} from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeView, setActiveView, setIsRequestModalOpen } = useApp();
  const [selectedProcessId, setSelectedProcessId] = useState<string | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Header />

      {/* Main View Router */}
      <main className="flex-1">
        {activeView === 'home' && (
          <div>
            {/* 1. Minimalist KOAJ-Style Hero Banner */}
            <HeroBanner />

            {/* SECCIÓN DIRECTA: Call to Action Estratégico al Simulador de Color (5 Escenarios Independientes) */}
            <SimulatorHomeSection />

            {/* SECCIÓN DIRECTA: Lista de Productos desde la tabla PRODUCTO de Supabase */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
              <SupabaseProductsList />
            </div>

            {/* 2. Ingreso a Cada Proceso de Forma Separada */}
            <ProcessAccessSection onSelectProcess={(id) => setSelectedProcessId(id)} />

            {/* 3. Categorías Visuales Tipo Retail */}
            <VisualCategories />

            {/* 4. Catálogo Técnico y Productos Recomendados */}
            <FeaturedProducts />

            {/* 5. Minimalist Trust Strip (Concise, < 10 words per item) */}
            <section className="py-10 bg-white border-b border-slate-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#1B2A6B] flex items-center justify-center shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">Punto Único Digital</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Gestión unificada desde web, chat o mostrador.</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">Stock & Lotes en Vivo</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Disponibilidad en bodegas de toda Colombia.</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#2FAE6D] flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">Garantía Oficial Pintuco</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Inspección de cubrimiento y respaldo de fábrica.</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {activeView === 'products' && (
          <div className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-extrabold text-slate-900">Catálogo Técnico Completo</h1>
                <p className="text-xs text-slate-500">Recubrimientos arquitectónicos, industriales y de alto desempeño.</p>
              </div>
              <button
                onClick={() => setIsRequestModalOpen(true)}
                className="px-4 py-2 bg-[#2FAE6D] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Calcular m² para mi Proyecto</span>
              </button>
            </div>

            {/* SECCIÓN DIRECTA: Lista de Productos de Supabase en Catálogo */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
              <SupabaseProductsList />
            </div>

            <FeaturedProducts />
          </div>
        )}

        {activeView === 'solutions' && (
          <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="mb-4">
              <h1 className="text-2xl font-extrabold text-slate-900">Centro de Procesos Operativos</h1>
              <p className="text-xs text-slate-500">Acceso individual a los 5 módulos técnicos de ColorLink.</p>
            </div>
            <ProcessAccessSection onSelectProcess={(id) => setSelectedProcessId(id)} />
          </div>
        )}



        {activeView === 'simulator' && (
          <RealisticColorSimulator />
        )}

        {activeView === 'dashboard' && (
          <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <ClientDashboard />
          </div>
        )}
      </main>

      {/* Dedicated Process Detail Modal (Independent Entry) */}
      <ProcessDetailModal
        stageId={selectedProcessId}
        onClose={() => setSelectedProcessId(null)}
      />

      {/* Global Modals & Floating Assistant */}
      <ClientRequestModal />
      <RequestDetailModal />
      <AuthModal />
      <ColorLinkChatBot />

      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
