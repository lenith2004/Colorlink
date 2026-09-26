import React from 'react';
import {
  Calculator,
  Sliders,
  Package,
  Truck,
  ShieldCheck,
  ArrowRight,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface ProcessAccessSectionProps {
  onSelectProcess: (stageId: string) => void;
}

export const ProcessAccessSection: React.FC<ProcessAccessSectionProps> = ({
  onSelectProcess,
}) => {
  const { setIsRequestModalOpen } = useApp();

  const processes = [
    {
      id: 'necesidad',
      number: '01',
      title: 'Cotización & Cálculo m²',
      description: 'Calcula galones y presupuesto exacto para tu obra.',
      icon: Calculator,
      color: 'from-blue-600 to-indigo-600',
      badgeColor: 'bg-blue-100 text-[#1B2A6B]',
      btnText: 'Ingresar a Cotización',
      action: 'quote',
    },
    {
      id: 'solucion_tecnica',
      number: '02',
      title: 'Simulador & Solución Técnica',
      description: 'Simula colores en fotos reales de fachada, sala, cuarto y oficina.',
      icon: Sliders,
      color: 'from-emerald-600 to-teal-600',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      btnText: 'Abrir Simulador de Color',
      action: 'modal',
    },
    {
      id: 'abastecimiento',
      number: '03',
      title: 'Bodega & Lotes en Vivo',
      description: 'Reserva por lote químico y stock en tiempo real.',
      icon: Package,
      color: 'from-amber-600 to-orange-600',
      badgeColor: 'bg-amber-100 text-amber-800',
      btnText: 'Ingresar a Bodega',
      action: 'modal',
    },
    {
      id: 'servicio',
      number: '04',
      title: 'Despacho & Mano de Obra',
      description: 'Logística en obra y cuadrillas certificadas Pintuco.',
      icon: Truck,
      color: 'from-purple-600 to-indigo-700',
      badgeColor: 'bg-purple-100 text-purple-800',
      btnText: 'Ingresar a Despacho',
      action: 'modal',
    },
    {
      id: 'calidad',
      number: '05',
      title: 'Calidad & Póliza ISO',
      description: 'Inspección técnica y certificado de garantía oficial.',
      icon: ShieldCheck,
      color: 'from-emerald-600 to-teal-700',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      btnText: 'Ingresar a Calidad',
      action: 'modal',
    },
  ];

  const handleProcessClick = (proc: typeof processes[0]) => {
    if (proc.action === 'quote') {
      setIsRequestModalOpen(true);
    } else {
      onSelectProcess(proc.id);
    }
  };

  return (
    <section className="py-12 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
          <div>
            <span className="text-[11px] font-extrabold tracking-widest text-[#1B2A6B] uppercase flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#2FAE6D]" />
              Ecosistema Operativo
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Ingreso Independiente a Procesos
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md">
            Accede por separado a cada fase técnica y gestiona tu requerimiento sin sobrecarga de información.
          </p>
        </div>

        {/* 5 Distinct Process Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {processes.map((proc) => {
            const Icon = proc.icon;
            return (
              <div
                key={proc.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 relative"
              >
                {/* Top Number & Icon */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-black tracking-widest text-slate-400 group-hover:text-[#2FAE6D] transition-colors">
                      {proc.number}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-slate-50 group-hover:bg-[#1B2A6B] group-hover:text-white text-[#1B2A6B] border border-slate-200 group-hover:border-[#1B2A6B] flex items-center justify-center transition-all duration-300 shadow-2xs">
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>

                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-snug mb-1.5 group-hover:text-[#1B2A6B] transition-colors">
                    {proc.title}
                  </h3>

                  <p className="text-xs text-slate-500 leading-relaxed font-normal">
                    {proc.description}
                  </p>
                </div>

                {/* Direct Action Button */}
                <div className="pt-5 mt-4 border-t border-slate-100">
                  <button
                    onClick={() => handleProcessClick(proc)}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-[#1B2A6B] hover:text-white text-slate-700 text-xs font-bold flex items-center justify-between transition-all duration-200 cursor-pointer group-hover:bg-[#1B2A6B] group-hover:text-white"
                  >
                    <span>{proc.btnText}</span>
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
