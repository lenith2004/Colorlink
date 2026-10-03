import React, { useState } from 'react';
import {
  PlusCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Layers,
  Sparkles,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Building2,
  Search,
  Download,
  PhoneCall,
  Package,
  MessageSquare,
  Lock,
  LogIn,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { RequestStatus } from '../../types';

export const ClientDashboard: React.FC = () => {
  const {
    currentUser,
    isLoggedIn,
    requests,
    setIsRequestModalOpen,
    setSelectedRequestForDetail,
    setIsAuthModalOpen,
    setIsChatOpen,
    setActiveView,
    whatsAppCommercialNumber,
  } = useApp();

  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [clientSearch, setClientSearch] = useState<string>('');

  // Isolate requests strictly to the current logged-in client for data privacy
  const clientRequests = requests.filter((r) => {
    if (!currentUser) return false;
    const userDoc = (currentUser.docNumber || '').trim();
    const userEmail = (currentUser.email || '').toLowerCase().trim();
    const userCompany = (currentUser.company || '').toLowerCase().trim();
    const userName = (currentUser.name || '').toLowerCase().trim();

    const matchesDoc = Boolean(userDoc && (r.clientEmail?.includes(userDoc) || (r as any).clientDocNumber === userDoc));
    const matchesEmail = Boolean(userEmail && r.clientEmail?.toLowerCase() === userEmail);
    const matchesCompany = Boolean(userCompany && r.clientCompany && r.clientCompany.toLowerCase() === userCompany);
    const matchesName = Boolean(userName && r.clientName && r.clientName.toLowerCase() === userName);

    // Fallback: If user is default or created requests in session
    return matchesDoc || matchesEmail || matchesCompany || matchesName || r.clientName === currentUser.name;
  });

  // Filter client's requests
  const myRequests = clientRequests.filter((r) => {
    const matchesFilter =
      filterStatus === 'todos' ||
      (filterStatus === 'cotizacion' && (r.status === 'necesidad' || r.status === 'solucion_tecnica')) ||
      (filterStatus === 'bodega' && (r.status === 'abastecimiento' || r.status === 'calidad')) ||
      (filterStatus === 'garantia' && (r.status === 'servicio' || r.status === 'completado'));

    const matchesSearch =
      !clientSearch ||
      r.projectName.toLowerCase().includes(clientSearch.toLowerCase()) ||
      r.requestNumber.toLowerCase().includes(clientSearch.toLowerCase()) ||
      r.recommendedProductName.toLowerCase().includes(clientSearch.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const getStepProgressIndex = (status: RequestStatus): number => {
    switch (status) {
      case 'necesidad': return 1;
      case 'solucion_tecnica': return 2;
      case 'abastecimiento': return 3;
      case 'calidad': return 4;
      case 'servicio': return 5;
      case 'completado': return 5;
      default: return 1;
    }
  };

  const statusBadges: Record<RequestStatus, { label: string; bg: string; text: string; icon: any }> = {
    necesidad: { label: '1. Necesidad Recibida', bg: 'bg-blue-100', text: 'text-blue-800', icon: Clock },
    solucion_tecnica: { label: '2. En Evaluación Técnica', bg: 'bg-sky-100', text: 'text-sky-800', icon: Layers },
    abastecimiento: { label: '3. En Asignación de Stock', bg: 'bg-amber-100', text: 'text-amber-800', icon: AlertCircle },
    calidad: { label: '4. En Control Calidad', bg: 'bg-indigo-100', text: 'text-indigo-800', icon: ShieldCheck },
    servicio: { label: '5. En Despacho / Obra', bg: 'bg-purple-100', text: 'text-purple-800', icon: Sparkles },
    completado: { label: '✅ Finalizado con Garantía', bg: 'bg-emerald-100', text: 'text-emerald-800', icon: CheckCircle2 },
  };

  // If the user has not logged in yet, protect private client data and projects:
  if (!isLoggedIn || !currentUser) {
    return (
      <div className="max-w-4xl mx-auto py-8 sm:py-12 px-4 text-center space-y-8 animate-in fade-in duration-300">
        {/* Header Icon & Title */}
        <div className="space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#1B2A6B] to-[#2FAE6D] text-white flex items-center justify-center mx-auto shadow-xl">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Portal Privado de Clientes & Obras ColorLink
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            Para consultar tus cotizaciones, trazabilidad técnica de obra y certificados de garantía oficial Pintuco, por favor inicia sesión con tu cuenta registrada o cotiza un nuevo proyecto.
          </p>
        </div>

        {/* 2 Primary Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left">
          {/* Card 1: Ya estoy registrado */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-blue-200/80 shadow-md hover:shadow-xl transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1B2A6B] flex items-center justify-center font-bold">
                <LogIn className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-[#1B2A6B] transition-colors">
                Ingresar a Mi Cuenta
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Ingresa con tu NIT, Cédula o Correo para consultar tus solicitudes de material, aprobación de presupuestos y certificados de lote químico.
              </p>
            </div>
            <div className="pt-6">
              <button
                id="portal-login-btn"
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="w-full py-3 bg-[#1B2A6B] hover:bg-[#142154] text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
              >
                <LogIn className="w-4 h-4" />
                <span>Iniciar Sesión</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card 2: Cotizar Nueva Obra sin Registro */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-emerald-200/80 shadow-md hover:shadow-xl transition-all flex flex-col justify-between group">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#2FAE6D] flex items-center justify-center font-bold">
                <PlusCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-[#2FAE6D] transition-colors">
                Cotizar Nueva Obra
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Calcula los m² de superficie, simula el color en la pared con fotorrealismo y genera el desglose de galones y cuñetes para tu proyecto.
              </p>
            </div>
            <div className="pt-6">
              <button
                id="portal-new-quote-btn"
                type="button"
                onClick={() => setIsRequestModalOpen(true)}
                className="w-full py-3 bg-[#2FAE6D] hover:bg-[#26975d] text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Cotizar Proyecto Ahora</span>
              </button>
            </div>
          </div>
        </div>

        {/* Security & Warranty Trust banner */}
        <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex flex-wrap items-center justify-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-slate-700">
            <ShieldCheck className="w-4 h-4 text-[#2FAE6D]" />
            <span>Información Confidencial y Protegida</span>
          </div>
          <span>•</span>
          <div>Garantía Oficial de Fábrica Pintuco®</div>
          <span>•</span>
          <div>Línea Técnica Nacional: 01 8000 111 247</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left">
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-[#1B2A6B] via-[#162758] to-[#142154] text-white p-6 sm:p-8 rounded-3xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4 max-w-2xl">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-[#2FAE6D] to-[#1B2A6B] text-white font-black text-2xl flex items-center justify-center shadow-lg shrink-0 border-2 border-white/20">
            {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'P'}
          </div>
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black text-[#2FAE6D] uppercase tracking-wider bg-[#2FAE6D]/20 px-2.5 py-0.5 rounded-full border border-[#2FAE6D]/30 flex items-center gap-1">
                <span>👋</span> ¡Hola, qué bueno verte!
              </span>
              <span className="text-xs text-slate-300 font-semibold bg-white/10 px-2 py-0.5 rounded-md">
                {currentUser?.docType || 'NIT'}: {currentUser?.docNumber || 'Registrado'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              {currentUser?.name || 'Apreciado Cliente'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              {currentUser?.company || 'Proyectos & Obras'} • Monitorea en tiempo real tus cálculos de material en m², aprobación de cotizaciones, reserva de lotes químicos y certificados de garantía oficial.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            id="client-new-proj-btn"
            onClick={() => setIsRequestModalOpen(true)}
            className="bg-[#2FAE6D] hover:bg-[#26975d] text-white px-5 py-3 rounded-2xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Cotizar Nuevo Proyecto</span>
          </button>

          <button
            id="client-chat-support-btn"
            onClick={() => setIsChatOpen(true)}
            className="bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-white/20 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-emerald-300" />
            <span>Asesor IA Pintuco</span>
          </button>

          <a
            id="client-whatsapp-advisor-btn"
            href={`https://wa.me/${whatsAppCommercialNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
              `Hola, soy ${currentUser?.name || 'Cliente'} (${currentUser?.docType || 'Doc'} ${currentUser?.docNumber || ''}) de la empresa/obra ${currentUser?.company || 'Particular'}. Solicito asesoría técnica y cotización comercial para mi proyecto en ${currentUser?.city || 'Colombia'}.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#25D366] hover:bg-[#20ba59] text-white px-4 py-3 rounded-2xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
          >
            <MessageSquare className="w-4 h-4" />
            <span>WhatsApp Asesor</span>
          </a>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Mis Proyectos Registrados</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{clientRequests.length}</p>
            <p className="text-[11px] text-slate-500 mt-1">Con cálculo técnico en m²</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1B2A6B] flex items-center justify-center font-bold">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">En Proceso de Despacho</p>
            <p className="text-2xl font-black text-[#1B2A6B] mt-1">
              {clientRequests.filter((r) => r.status !== 'completado').length}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Con reserva de lote en bodega</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase">Garantías Certificadas</p>
            <p className="text-2xl font-black text-[#2FAE6D] mt-1">
              {clientRequests.filter((r) => r.status === 'completado' || r.status === 'servicio').length}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Pólizas oficiales de fábrica</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#2FAE6D] flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Active Projects List */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Mis Solicitudes, Cotizaciones y Obras</h3>
            <p className="text-xs text-slate-500">Selecciona cualquier proyecto para ver la trazabilidad de las 5 fases o descargar tu cotización.</p>
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setFilterStatus('todos')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterStatus === 'todos'
                  ? 'bg-[#1B2A6B] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Todos ({clientRequests.length})
            </button>
            <button
              onClick={() => setFilterStatus('cotizacion')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterStatus === 'cotizacion'
                  ? 'bg-[#1B2A6B] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              En Cotización
            </button>
            <button
              onClick={() => setFilterStatus('bodega')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterStatus === 'bodega'
                  ? 'bg-[#1B2A6B] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              En Bodega / Calidad
            </button>
            <button
              onClick={() => setFilterStatus('garantia')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                filterStatus === 'garantia'
                  ? 'bg-[#1B2A6B] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Con Garantía
            </button>
          </div>
        </div>

        {/* Search bar inside dashboard */}
        <div className="relative">
          <input
            type="text"
            value={clientSearch}
            onChange={(e) => setClientSearch(e.target.value)}
            placeholder="Filtrar por nombre de obra, número de solicitud (SOL-101) o producto..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-[#1B2A6B] outline-hidden transition-all"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        {myRequests.length === 0 ? (
          <div className="p-10 border border-dashed border-slate-200 rounded-2xl text-center space-y-3">
            <p className="text-sm font-semibold text-slate-600">No se encontraron solicitudes con el filtro seleccionado</p>
            <button
              onClick={() => setIsRequestModalOpen(true)}
              className="px-4 py-2 bg-[#2FAE6D] text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              Crear nueva solicitud de pintura
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {myRequests.map((req) => {
              const badge = statusBadges[req.status] || statusBadges.necesidad;
              const BadgeIcon = badge.icon;
              const stepIndex = getStepProgressIndex(req.status);

              return (
                <div
                  key={req.id}
                  id={`client-req-card-${req.requestNumber}`}
                  onClick={() => setSelectedRequestForDetail(req)}
                  className="p-5 rounded-2xl border border-slate-200 hover:border-[#1B2A6B] bg-slate-50/60 hover:bg-white transition-all shadow-2xs hover:shadow-md cursor-pointer space-y-4 group"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-extrabold text-xs text-[#1B2A6B] bg-blue-100 px-2.5 py-0.5 rounded-lg border border-blue-200">
                          {req.requestNumber}
                        </span>
                        <h4 className="text-base font-extrabold text-slate-900 group-hover:text-[#1B2A6B] transition-colors">
                          {req.projectName}
                        </h4>
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${badge.bg} ${badge.text}`}>
                          <BadgeIcon className="w-3 h-3" />
                          {badge.label}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                        <span><strong>Producto:</strong> {req.recommendedProductName}</span>
                        <span>• <strong>Área:</strong> {req.areaSqMeters} m² ({req.gallonsNeeded} Gal)</span>
                        <span>• <strong>Color:</strong> {req.selectedColorName}</span>
                        <span>• <strong>Ciudad:</strong> {req.city}</span>
                        <span>• <strong>Fecha:</strong> {req.createdAt}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-200">
                      <div className="text-left md:text-right">
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Valor Cotizado</span>
                        <p className="text-lg font-black text-[#1B2A6B]">
                          ${(req.technicalEvaluation?.quotedTotalCOP || req.estimatedPriceCOP).toLocaleString('es-CO')}
                        </p>
                      </div>

                      <button className="px-4 py-2 bg-slate-200 group-hover:bg-[#1B2A6B] group-hover:text-white rounded-xl text-xs font-bold text-slate-700 transition-colors flex items-center gap-1.5 shadow-2xs">
                        <span>Ver Detalle</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* 5-Step Customer Visual Progress Tracker */}
                  <div className="pt-2 border-t border-slate-200/80">
                    <div className="grid grid-cols-5 gap-1 text-center text-[10px] font-bold">
                      <div className={`p-1.5 rounded-lg ${stepIndex >= 1 ? 'bg-blue-100 text-[#1B2A6B]' : 'bg-slate-100 text-slate-400'}`}>
                        1. Necesidad
                      </div>
                      <div className={`p-1.5 rounded-lg ${stepIndex >= 2 ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-400'}`}>
                        2. Solución Técnica
                      </div>
                      <div className={`p-1.5 rounded-lg ${stepIndex >= 3 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-400'}`}>
                        3. Lote Bodega
                      </div>
                      <div className={`p-1.5 rounded-lg ${stepIndex >= 4 ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-400'}`}>
                        4. Calidad Lab
                      </div>
                      <div className={`p-1.5 rounded-lg ${stepIndex >= 5 ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'}`}>
                        5. Garantía Obra
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
