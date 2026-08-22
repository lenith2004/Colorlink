import React, { useState } from 'react';
import {
  FileText,
  Sliders,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  MessageSquare,
  Globe,
  Store,
  PhoneCall,
  Sparkles,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ChannelSource, RequestStatus, PaintRequest } from '../../types';

export const CommercialDashboard: React.FC = () => {
  const { requests, setSelectedRequestForDetail, currentUser } = useApp();
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [filterQuery, setFilterQuery] = useState<string>('');

  const channelIcons: Record<ChannelSource, any> = {
    web: Globe,
    whatsapp: MessageSquare,
    tienda: Store,
    call_center: PhoneCall,
  };

  const channelColors: Record<ChannelSource, string> = {
    web: 'bg-blue-100 text-blue-800 border-blue-200',
    whatsapp: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    tienda: 'bg-amber-100 text-amber-800 border-amber-200',
    call_center: 'bg-purple-100 text-purple-800 border-purple-200',
  };

  const filteredRequests = requests.filter((r) => {
    const matchesChannel = selectedChannel === 'all' || r.channel === selectedChannel;
    const matchesStatus = selectedStatus === 'all' || r.status === selectedStatus;
    const matchesSearch =
      !filterQuery ||
      r.requestNumber.toLowerCase().includes(filterQuery.toLowerCase()) ||
      r.projectName.toLowerCase().includes(filterQuery.toLowerCase()) ||
      r.clientName.toLowerCase().includes(filterQuery.toLowerCase()) ||
      r.recommendedProductName.toLowerCase().includes(filterQuery.toLowerCase()) ||
      r.city.toLowerCase().includes(filterQuery.toLowerCase());

    return matchesChannel && matchesStatus && matchesSearch;
  });

  const pendingTechnical = requests.filter((r) => !r.technicalEvaluation?.isApproved).length;
  const approvedQuotes = requests.filter((r) => r.technicalEvaluation?.isApproved).length;
  const totalVolumeGallons = requests.reduce((acc, curr) => acc + curr.gallonsNeeded, 0);

  return (
    <div className="space-y-6 text-left">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#142154] via-[#1B2A6B] to-[#1E3A8A] text-white p-6 sm:p-8 rounded-3xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#2FAE6D] uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5" />
            Módulo Técnico & Comercial • {currentUser.name}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Bandeja Unificada de Solicitudes Omnicanal
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-2xl">
            Valida especificaciones técnicas de producto, m² y rendimiento, aplica márgenes y emite cotizaciones formales instantáneas.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/20 text-center shrink-0">
          <span className="text-xs text-slate-300 block">Tiempo Promedio de Respuesta</span>
          <span className="text-2xl font-black text-[#2FAE6D]">28 min</span>
          <span className="text-[10px] text-emerald-300 block">⚡ -65% vs proceso manual</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-bold text-slate-400 uppercase">Solicitudes Omnicanal</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{requests.length}</p>
          <p className="text-[11px] text-slate-500 mt-1">Web, WhatsApp y Tiendas</p>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-bold text-slate-400 uppercase">Pendientes Evaluación</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{pendingTechnical}</p>
          <p className="text-[11px] text-amber-700 font-medium mt-1">Requieren aprobación técnica</p>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-bold text-slate-400 uppercase">Cotizaciones Aprobadas</p>
          <p className="text-2xl font-black text-[#2FAE6D] mt-1">{approvedQuotes}</p>
          <p className="text-[11px] text-emerald-700 font-medium mt-1">Con PDF generado</p>
        </div>

        <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-bold text-slate-400 uppercase">Volumen en Galones</p>
          <p className="text-2xl font-black text-[#1B2A6B] mt-1">{totalVolumeGallons} Gal</p>
          <p className="text-[11px] text-slate-500 mt-1">Demanda en proceso</p>
        </div>
      </div>

      {/* Filters bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[280px]">
          {/* Channel selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-700">
            {[
              { id: 'all', label: 'Todos los Canales' },
              { id: 'web', label: '🌐 Web' },
              { id: 'whatsapp', label: '📱 WhatsApp' },
              { id: 'tienda', label: '🏬 Tienda' },
            ].map((ch) => (
              <button
                key={ch.id}
                onClick={() => setSelectedChannel(ch.id)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  selectedChannel === ch.id ? 'bg-white text-[#1B2A6B] shadow-xs' : 'hover:text-slate-900'
                }`}
              >
                {ch.label}
              </button>
            ))}
          </div>

          {/* Status selector */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
          >
            <option value="all">Todos los Estados</option>
            <option value="necesidad">1. Necesidad Pendiente</option>
            <option value="solucion_tecnica">2. Solución Técnica</option>
            <option value="abastecimiento">3. En Abastecimiento</option>
            <option value="calidad">4. En Calidad</option>
            <option value="servicio">5. En Servicio / Despacho</option>
            <option value="completado">Completados</option>
          </select>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Filtrar por proyecto, cliente, ciudad..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 outline-hidden"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Requests Table / Grid */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-base text-slate-900">
            Solicitudes en Bandeja ({filteredRequests.length})
          </h3>
          <span className="text-xs text-slate-400">Haz clic en cualquier fila para abrir la ficha técnica y aprobar cotización</span>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredRequests.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No hay solicitudes que coincidan con los filtros seleccionados.
            </div>
          ) : (
            filteredRequests.map((req) => {
              const ChannelIcon = channelIcons[req.channel] || Globe;
              const isApproved = req.technicalEvaluation?.isApproved;

              return (
                <div
                  key={req.id}
                  onClick={() => setSelectedRequestForDetail(req)}
                  className="p-4 sm:p-5 hover:bg-slate-50/80 transition-all cursor-pointer flex flex-col lg:flex-row lg:items-center justify-between gap-4 group"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <span className="font-extrabold text-xs text-[#1B2A6B] bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-100 shrink-0">
                      {req.requestNumber}
                    </span>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-[#1B2A6B] transition-colors">
                          {req.projectName}
                        </h4>
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border flex items-center gap-1 ${channelColors[req.channel]}`}>
                          <ChannelIcon className="w-3 h-3" />
                          {req.channel}
                        </span>
                        {isApproved ? (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Cotización Aprobada
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Pendiente Revisión Técnica
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 text-xs text-slate-600">
                        <span><strong>Cliente:</strong> {req.clientName} ({req.clientCompany})</span>
                        <span>• <strong>Fórmula:</strong> {req.recommendedProductName}</span>
                        <span>• <strong>Volumen:</strong> {req.gallonsNeeded} Galones ({req.areaSqMeters} m²)</span>
                        <span>• <strong>Ciudad:</strong> {req.city}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between lg:justify-end gap-5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <div className="text-left lg:text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Valor Cotizado</span>
                      <p className="text-base font-extrabold text-[#1B2A6B]">
                        ${(req.technicalEvaluation?.quotedTotalCOP || req.estimatedPriceCOP).toLocaleString('es-CO')}
                      </p>
                    </div>

                    <button
                      id={`commercial-action-btn-${req.requestNumber}`}
                      className="px-4 py-2 bg-[#1B2A6B] hover:bg-[#152254] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      <span>{isApproved ? 'Ver Cotización' : 'Evaluar & Cotizar'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
