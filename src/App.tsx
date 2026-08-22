import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { SolutionsWorkflow } from './components/SolutionsWorkflow';
import { FeaturedProducts } from './components/FeaturedProducts';
import { ClientRequestModal } from './components/ClientRequestModal';
import { RequestDetailModal } from './components/RequestDetailModal';
import { AuthModal } from './components/AuthModal';
import { ColorLinkChatBot } from './components/ColorLinkChatBot';
import { Footer } from './components/Footer';

// Client Dashboard
import { ClientDashboard } from './components/RoleDashboards/ClientDashboard';

import {
  Package,
  ShieldCheck,
  Sparkles,
  PlusCircle,
} from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeView, setIsRequestModalOpen } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Header />

      {/* Main View Router */}
      <main className="flex-1">
        {activeView === 'home' && (
          <div>
            <HeroBanner />
            <SolutionsWorkflow />
            <FeaturedProducts />

            {/* Value Proposition Strip */}
            <section className="py-12 bg-white border-b border-slate-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-[#1B2A6B] flex items-center justify-center font-bold">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <h3 className="font-extrabold text-base text-slate-900">Un Punto Único de Entrada</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Capturamos solicitudes omnicanal desde Web, WhatsApp o Mostrador eliminando la fragmentación de datos y cotizaciones manuales en papel.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                      <Package className="w-5 h-5" />
                    </div>
                    <h3 className="font-extrabold text-base text-slate-900">Conexión en Tiempo Real con Bodega</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Verificación algorítmica de stock en m² y galones, alertas preventivas de desabastecimiento y asignación estricta de lote químico.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#2FAE6D] flex items-center justify-center font-bold">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <h3 className="font-extrabold text-base text-slate-900">Control de Calidad & Garantía ISO</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Inspección fisicoquímica obligatoria de viscosidad y cubrimiento antes del despacho, con emisión digital de póliza de garantía Pintuco.
                    </p>
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
            <FeaturedProducts />
          </div>
        )}

        {activeView === 'dashboard' && (
          <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <ClientDashboard />
          </div>
        )}
      </main>

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
