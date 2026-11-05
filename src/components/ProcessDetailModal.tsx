import React, { useState } from 'react';
import {
  X,
  Calculator,
  Sparkles,
  Package,
  Truck,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Search,
  Building,
  AlertCircle,
  FileText,
  Clock,
  ExternalLink,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { WORKFLOW_STAGES } from '../data/initialData';

interface ProcessDetailModalProps {
  stageId: string | null;
  onClose: () => void;
}

export const ProcessDetailModal: React.FC<ProcessDetailModalProps> = ({
  stageId,
  onClose,
}) => {
  const {
    inventory,
    requests,
    setIsRequestModalOpen,
    setSelectedRequestForDetail,
    setActiveView,
    setIsChatOpen,
  } = useApp();

  const [activeTab, setActiveTab] = useState<string>(stageId || 'necesidad');
  const [stockSearch, setStockSearch] = useState('');

  if (!stageId) return null;

  const currentStage = WORKFLOW_STAGES.find((s) => s.id === activeTab) || WORKFLOW_STAGES[0];

  const filteredInventory = inventory.filter((item) =>
    item.productName.toLowerCase().includes(stockSearch.toLowerCase()) ||
    item.batchNumber.toLowerCase().includes(stockSearch.toLowerCase()) ||
    item.warehouseZone.toLowerCase().includes(stockSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200">
        
        {/* Header */}
        <div className="bg-[#142154] text-white p-5 sm:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#2FAE6D] text-white flex items-center justify-center font-extrabold text-lg shadow-md">
              {currentStage.number}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300 bg-white/10 px-2 py-0.5 rounded-full">
                  Proceso Operativo Independiente
                </span>
                <span className="text-xs text-slate-300">Fase {currentStage.number} de 5</span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white">
                {currentStage.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Process Selector Pills */}
        <div className="bg-slate-100 p-2 sm:px-8 border-b border-slate-200 flex items-center gap-2 overflow-x-auto">
          {WORKFLOW_STAGES.map((st) => (
            <button
              key={st.id}
              onClick={() => setActiveTab(st.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === st.id
                  ? 'bg-[#1B2A6B] text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <span>{st.number}.</span>
              <span>{st.title}</span>
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-6 text-left">
          
          {/* Quick Summary Banner */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-[#2FAE6D] uppercase tracking-wider">Objetivo de este proceso</p>
              <h3 className="text-base font-extrabold text-slate-900 mt-0.5">{currentStage.subtitle}</h3>
              <p className="text-xs text-slate-600 mt-1 max-w-xl">
                {currentStage.description}
              </p>
            </div>
            <div className="shrink-0 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[10px] text-slate-400 block font-bold uppercase">Responsable</span>
              <span className="text-xs font-extrabold text-[#1B2A6B]">
                {currentStage.id === 'necesidad' ? 'Cliente / Asesor Omnicanal' :
                 currentStage.id === 'solucion_tecnica' ? 'Ingeniero Técnico Pintuco' :
                 currentStage.id === 'abastecimiento' ? 'Jefe de Bodega & Inventarios' :
                 currentStage.id === 'servicio' ? 'Coordinador de Despacho & Cuadrillas' :
                 'Laboratorio de Calidad ISO'}
              </span>
            </div>
          </div>

          {/* PROCESS 1: COTIZACIÓN & NECESIDAD */}
          {activeTab === 'necesidad' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#1B2A6B] flex items-center justify-center font-bold">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Cálculo de Metros Cuadrados</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Ingresa las medidas de tu proyecto manualmente para calcular galones, manos recomendadas y presupuesto exacto.
                  </p>
                  <button
                    onClick={() => {
                      onClose();
                      setIsRequestModalOpen(true);
                    }}
                    className="w-full bg-[#1B2A6B] hover:bg-[#142154] text-white py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Calculator className="w-4 h-4 text-emerald-400" />
                    <span>Abrir Cotizador Libre de m²</span>
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-[#2FAE6D] flex items-center justify-center font-bold">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Registro Omnicanal</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Las solicitudes iniciadas desde web, WhatsApp o punto físico se consolidan con código único de proyecto.
                  </p>
                  <div className="text-xs text-slate-500 bg-white p-3 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-slate-700">Solicitudes activas:</span>
                      <span className="font-extrabold text-[#2FAE6D]">{requests.length} registradas</span>
                    </div>
                    <p className="text-[11px] text-slate-400">Sin duplicidades ni pérdidas de contacto.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PROCESS 2: SOLUCIÓN TÉCNICA */}
          {activeTab === 'solucion_tecnica' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-sm text-slate-900">Evaluación de Recubrimiento según Superficie</h4>
                  <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Algoritmo de Compatibilidad
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <p className="font-bold text-slate-800">Muros & Drywall</p>
                    <p className="text-slate-500 text-[11px] mt-1">Viniltex Baños & Cocina o Viniltex Avanzado antibacterial.</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <p className="font-bold text-slate-800">Fachadas Exteriores</p>
                    <p className="text-slate-500 text-[11px] mt-1">Koraza 5 o Koraza Elastomérica con protección contra lluvia ácida.</p>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <p className="font-bold text-slate-800">Estructuras Metálicas</p>
                    <p className="text-slate-500 text-[11px] mt-1">Pintulux anticorrosivo de secado rápido y alto brillo.</p>
                  </div>
                </div>
                <div className="pt-2 flex justify-between items-center">
                  <p className="text-xs text-slate-500">Consulta asesoría de formulación técnica y fichas oficiales:</p>
                  <button
                    onClick={() => {
                      onClose();
                      setIsChatOpen(true);
                    }}
                    className="bg-[#2FAE6D] hover:bg-[#27985f] text-white py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Consultar Asesor Técnico IA</span>
                  </button>
                </div>
              </div>

              {/* Guía Técnica y Especificación de Superficies */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-3">
                <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#1B2A6B]" />
                  <span>Especificación Técnica y Rendimiento Recomendado</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                    <span className="font-bold text-slate-900">Rendimiento Estándar:</span>
                    <p className="text-[11px]">35 a 40 m² por galón a dos manos según porosidad y rugosidad del sustrato.</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                    <span className="font-bold text-slate-900">Preparación de Superficie:</span>
                    <p className="text-[11px]">Limpieza profunda, remoción de partes sueltas, neutralización de sales y secado completo.</p>
                  </div>
                </div>
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      onClose();
                      setIsRequestModalOpen(true);
                    }}
                    className="bg-[#1B2A6B] hover:bg-[#142154] text-white py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Calculator className="w-4 h-4" />
                    <span>Iniciar Diagnóstico & Cotización</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* PROCESS 3: ABASTECIMIENTO & BODEGA */}
          {activeTab === 'abastecimiento' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={stockSearch}
                    onChange={(e) => setStockSearch(e.target.value)}
                    placeholder="Buscar producto, lote químico o centro de distribución..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-[#1B2A6B]"
                  />
                </div>
                <span className="text-xs font-bold text-slate-500 shrink-0 self-center">
                  {filteredInventory.length} referencias en stock
                </span>
              </div>

              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] uppercase">
                    <tr>
                      <th className="p-3 font-bold">Producto</th>
                      <th className="p-3 font-bold">Presentación</th>
                      <th className="p-3 font-bold">Lote Químico</th>
                      <th className="p-3 font-bold">Ubicación Bodega</th>
                      <th className="p-3 font-bold text-right">Stock Disponible</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredInventory.slice(0, 5).map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80">
                        <td className="p-3 font-bold text-slate-900">{item.productName}</td>
                        <td className="p-3 text-slate-600">{item.presentation}</td>
                        <td className="p-3">
                          <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-sm font-bold">
                            {item.batchNumber}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600 flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.warehouseZone}</span>
                        </td>
                        <td className="p-3 text-right font-extrabold text-[#2FAE6D]">
                          {item.stockUnits - item.reservedUnits} un.
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PROCESS 4: SERVICIO & APLICACIÓN */}
          {activeTab === 'servicio' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                    <Truck className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Logística y Despacho en Obra</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Vehículos certificados para transporte de recubrimientos químicos con control de temperatura y sellos de seguridad intactos.
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#1B2A6B] flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">Cuadrillas Técnicas Certificadas</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Pintores y contratistas avalados por la Escuela del Pintor Pintuco con verificación de perfiles y seguridad social vigente.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* PROCESS 5: CONTROL DE CALIDAD & GARANTÍA */}
          {activeTab === 'calidad' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3">
                <div className="flex items-center gap-2 text-emerald-800">
                  <ShieldCheck className="w-5 h-5 text-[#2FAE6D]" />
                  <h4 className="font-extrabold text-sm">Certificado Digital de Calidad ISO 9001 / 14001</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Cada entrega de pintura pasa por pruebas de laboratorio de adherencia en húmedo y espesor de película seca (mils).
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-xs">
                  <div className="bg-white p-2.5 rounded-xl border border-emerald-100 text-slate-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#2FAE6D]" />
                    <span>Viscosidad óptima</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-emerald-100 text-slate-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#2FAE6D]" />
                    <span>Cubrimiento al 100%</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-emerald-100 text-slate-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#2FAE6D]" />
                    <span>Póliza de 5 a 10 años</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Actions Footer */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => {
                onClose();
                setActiveView('dashboard');
              }}
              className="text-xs font-bold text-[#1B2A6B] hover:text-[#2FAE6D] flex items-center gap-1.5 cursor-pointer"
            >
              <span>Ver proyectos en el panel de control</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
            >
              Cerrar Vista
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
