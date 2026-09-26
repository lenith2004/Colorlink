import React, { useState } from 'react';
import {
  FileText,
  Sliders,
  Package,
  Truck,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { WORKFLOW_STAGES } from '../data/initialData';

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

  // Ultra-concise KOAJ-style copy (under 10-12 words per stage)
  const stageHighlights: Record<string, { shortBenefit: string; actionText: string }> = {
    necesidad: {
      shortBenefit: 'Cotización instantánea en m² desde cualquier canal digital.',
      actionText: 'Ingreso omnicanal',
    },
    solucion_tecnica: {
      shortBenefit: 'Especificación técnica exacta de manos y galones requeridos.',
      actionText: 'Asignación de fórmula',
    },
    abastecimiento: {
      shortBenefit: 'Reserva en tiempo real de lote químico en bodega.',
      actionText: 'Control de stock vivo',
    },
    servicio: {
      shortBenefit: 'Despacho directo a obra y asignación de aplicador certificado.',
      actionText: 'Logística asegurada',
    },
    calidad: {
      shortBenefit: 'Emisión digital de garantía oficial y prueba de laboratorio.',
      actionText: 'Certificado ISO',
    },
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#1B2A6B] block mb-1">
              Flujo Operativo
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Ecosistema en 5 Pasos
            </h2>
          </div>

          <button
            id="view-all-pipeline-btn"
            onClick={() => setActiveView('dashboard')}
            className="text-xs font-bold text-[#1B2A6B] hover:text-[#2FAE6D] flex items-center gap-1.5 transition-colors cursor-pointer group"
          >
            <span>Ver solicitudes en el tablero</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* 5 Sleek Horizontal Steps (KOAJ Process style) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {WORKFLOW_STAGES.map((stage) => {
            const Icon = iconMap[stage.icon] || FileText;
            const isSelected = activeStageId === stage.id;
            const highlight = stageHighlights[stage.id] || { shortBenefit: stage.subtitle, actionText: 'Paso activo' };

            return (
              <button
                key={stage.id}
                id={`workflow-stage-card-${stage.id}`}
                onClick={() => setActiveStageId(stage.id)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative group flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-[1.01]'
                    : 'bg-slate-50 hover:bg-slate-100/80 text-slate-800 border-slate-200/80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                        isSelected ? 'bg-[#2FAE6D] text-white' : 'bg-white text-[#1B2A6B] border border-slate-200'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isSelected ? 'bg-white/20 text-emerald-300' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      Paso {stage.number}
                    </span>
                  </div>

                  <h3 className={`font-extrabold text-sm line-clamp-1 ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                    {stage.title}
                  </h3>
                  <p className={`text-xs mt-1 leading-snug line-clamp-2 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                    {highlight.shortBenefit}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-current/10 flex items-center justify-between text-[11px] font-semibold">
                  <span className="text-[#2FAE6D] font-bold">{highlight.actionText}</span>
                  <ChevronRight className={`w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Compact Interactive Detail Strip */}
        <div className="mt-4 bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#1B2A6B] text-white flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">
                Paso {currentStageData.number}: {currentStageData.title}
              </p>
              <p className="text-xs text-slate-500 font-medium">
                {stageHighlights[currentStageData.id]?.shortBenefit}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <span className="text-xs font-bold text-slate-600 whitespace-nowrap">
              {stageRequests.length} solicitudes activas
            </span>
            <button
              onClick={() => setActiveView('dashboard')}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Abrir en Tablero
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
