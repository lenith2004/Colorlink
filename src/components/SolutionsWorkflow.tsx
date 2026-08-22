import React, { useState } from 'react';
import {
  FileText,
  Sliders,
  Package,
  Truck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Layers,
  ChevronRight,
  Info,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { WORKFLOW_STAGES } from '../data/initialData';
import { RequestStatus } from '../types';

export const SolutionsWorkflow: React.FC = () => {
  const { requests, setActiveView, setSelectedRequestForDetail } = useApp();
  const [activeStageId, setActiveStageId] = useState<string>('necesidad');

  const iconMap: Record<string, any> = {
    FileText,
    Sliders,
    Package,
    Truck,
    CheckCircle2,
  };

  const stageRequestCounts: Record<string, number> = {
    necesidad: requests.filter((r) => r.status === 'necesidad').length,
    solucion_tecnica: requests.filter((r) => r.status === 'solucion_tecnica').length,
    abastecimiento: requests.filter((r) => r.status === 'abastecimiento').length,
    servicio: requests.filter((r) => r.status === 'servicio').length,
    calidad: requests.filter((r) => r.status === 'calidad' || r.status === 'completado').length,
  };

  const currentStageData = WORKFLOW_STAGES.find((s) => s.id === activeStageId) || WORKFLOW_STAGES[0];
  const stageRequests = requests.filter((r) => {
    if (activeStageId === 'calidad') {
      return r.status === 'calidad' || r.status === 'completado';
    }
    return r.status === activeStageId;
  });

  return (
    <section className="py-12 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1B2A6B] uppercase tracking-wider mb-1">
              <Layers className="w-3.5 h-3.5 text-[#2FAE6D]" />
              <span>Nuestras Soluciones Integradas</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Ecosistema Digital en 5 Fases Automatizadas
            </h2>
            <p className="text-sm text-slate-600 max-w-2xl mt-1">
              Conexión directa y trazable desde la captura de la necesidad hasta la garantía postventa.
            </p>
          </div>

          <button
            id="view-all-pipeline-btn"
            onClick={() => setActiveView('dashboard')}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#1B2A6B] hover:text-[#2FAE6D] transition-colors cursor-pointer group"
          >
            <span>Ver solicitudes en el tablero</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* 5 Horizontal Cards Layout as requested */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {WORKFLOW_STAGES.map((stage) => {
            const Icon = iconMap[stage.icon] || FileText;
            const isSelected = activeStageId === stage.id;
            const count = stageRequestCounts[stage.id] || 0;

            return (
              <button
                key={stage.id}
                id={`workflow-stage-card-${stage.id}`}
                onClick={() => setActiveStageId(stage.id)}
                className={`relative flex flex-col justify-between p-4 rounded-2xl border text-left transition-all cursor-pointer group ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-lg scale-[1.02]'
                    : 'bg-slate-50 hover:bg-slate-100/90 text-slate-800 border-slate-200/80 shadow-2xs hover:shadow-xs'
                }`}
              >
                {/* Top header row with number badge & count */}
                <div className="flex items-center justify-between w-full mb-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shadow-xs ${
                      isSelected
                        ? 'bg-[#2FAE6D] text-white'
                        : 'bg-white text-[#1B2A6B] border border-slate-200'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        isSelected
                          ? 'bg-white/20 text-emerald-300'
                          : 'bg-slate-200/80 text-slate-700'
                      }`}
                    >
                      {count} activas
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="space-y-1 my-2">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#2FAE6D]">
                      Fase {stage.number}
                    </span>
                  </div>
                  <h3
                    className={`font-bold text-sm leading-snug line-clamp-1 ${
                      isSelected ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {stage.title}
                  </h3>
                  <p
                    className={`text-xs line-clamp-2 leading-relaxed ${
                      isSelected ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    {stage.subtitle}
                  </p>
                </div>

                {/* Bottom row: Arrow */}
                <div className="pt-2 mt-2 border-t border-current/10 flex items-center justify-between text-xs font-semibold">
                  <span className="text-[11px] opacity-80">Explorar fase</span>
                  <ChevronRight
                    className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${
                      isSelected ? 'text-[#2FAE6D]' : 'text-slate-400'
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Interactive Detailed Stage Inspector Drawer / Container */}
        <div className="mt-6 bg-slate-50 border border-slate-200 rounded-2xl p-5 sm:p-6 text-left">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left side: Stage explanation & automation specs */}
            <div className="lg:col-span-5 space-y-3">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-blue-100 text-[#1B2A6B] text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-[#2FAE6D]" />
                <span>Detalle Operativo • Fase {currentStageData.number}</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                {currentStageData.title} ({currentStageData.subtitle})
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {currentStageData.description}
              </p>

              <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-800">
                  <Info className="w-4 h-4 text-[#1B2A6B]" />
                  <span>Automatizaciones Activas en esta Fase:</span>
                </div>
                <ul className="space-y-1.5 text-slate-600 pl-6 list-disc">
                  {currentStageData.id === 'necesidad' && (
                    <>
                      <li>Cálculo algorítmico de galones según m² y porosidad de superficie.</li>
                      <li>Recomendación del portafolio óptimo (Viniltex, Koraza, Epóxico).</li>
                      <li>Ingreso unificado desde Web, WhatsApp bot y tiendas físicas.</li>
                    </>
                  )}
                  {currentStageData.id === 'solucion_tecnica' && (
                    <>
                      <li>Generación automática de PDF con cotización formal Pintuco.</li>
                      <li>Aprobación técnica de manos recomendadas y selladores.</li>
                      <li>Aplicación de descuentos comerciales por volumen.</li>
                    </>
                  )}
                  {currentStageData.id === 'abastecimiento' && (
                    <>
                      <li>Reserva inmediata de stock en el Centro de Distribución.</li>
                      <li>Alerta de inventario crítico si los m² superan el stock actual.</li>
                      <li>Asignación de número de lote para trazabilidad química.</li>
                    </>
                  )}
                  {currentStageData.id === 'servicio' && (
                    <>
                      <li>Asignación de técnico aplicador certificado Pintuco.</li>
                      <li>Checklist de preparación de superficie y humedad de muro.</li>
                      <li>Seguimiento de despacho y georreferenciación de entrega.</li>
                    </>
                  )}
                  {currentStageData.id === 'calidad' && (
                    <>
                      <li>Control de laboratorio: Viscosidad KU, Opacidad %, Delta E de color.</li>
                      <li>Emisión digital de Certificado de Calidad de Fábrica ISO 9001.</li>
                      <li>Registro de garantía por escrito (hasta 10 años).</li>
                    </>
                  )}
                </ul>
              </div>
            </div>

            {/* Right side: Live requests currently in this stage */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Solicitudes en esta fase ({stageRequests.length})
                </p>
                <span className="text-xs text-slate-500">Haz clic para ver trazabilidad</span>
              </div>

              {stageRequests.length === 0 ? (
                <div className="bg-white rounded-xl p-8 border border-dashed border-slate-300 text-center text-slate-500">
                  <p className="text-sm font-semibold">No hay órdenes pendientes en este paso</p>
                  <p className="text-xs mt-1">Todas las solicitudes han avanzado al siguiente módulo.</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {stageRequests.map((req) => (
                    <div
                      key={req.id}
                      onClick={() => setSelectedRequestForDetail(req)}
                      className="bg-white hover:bg-slate-50 p-3.5 rounded-xl border border-slate-200 shadow-2xs hover:border-[#1B2A6B] transition-all cursor-pointer flex items-center justify-between gap-3 group"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-xs text-[#1B2A6B] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                            {req.requestNumber}
                          </span>
                          <span className="text-xs font-bold text-slate-900 line-clamp-1">
                            {req.projectName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            • {req.city}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">
                          {req.clientName} ({req.clientCompany}) •{' '}
                          <span className="font-semibold text-slate-800">
                            {req.recommendedProductName} ({req.gallonsNeeded} Gal)
                          </span>
                        </p>
                      </div>

                      <div className="text-right shrink-0 flex items-center gap-2">
                        <div className="hidden sm:block">
                          <p className="text-xs font-bold text-slate-900">
                            ${(req.technicalEvaluation?.quotedTotalCOP || req.estimatedPriceCOP).toLocaleString('es-CO')}
                          </p>
                          <p className="text-[10px] text-slate-400 capitalize">{req.channel}</p>
                        </div>
                        <button className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-[#2FAE6D] group-hover:text-white flex items-center justify-center text-slate-500 transition-colors">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
