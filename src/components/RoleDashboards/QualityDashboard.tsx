import React, { useState } from 'react';
import {
  ShieldCheck,
  Award,
  CheckCircle2,
  AlertCircle,
  Truck,
  Star,
  FileCheck,
  Search,
  ChevronRight,
  ClipboardList,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PaintRequest } from '../../types';

export const QualityDashboard: React.FC = () => {
  const { requests, setSelectedRequestForDetail, currentUser } = useApp();
  const [activeTab, setActiveTab] = useState<'calidad' | 'postventa'>('calidad');

  const pendingQualityRequests = requests.filter(
    (r) => r.status === 'calidad' || (r.status === 'abastecimiento' && !r.qualityChecklist)
  );

  const certifiedRequests = requests.filter((r) => r.qualityChecklist !== undefined);

  return (
    <div className="space-y-6 text-left">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#142154] via-[#1B2A6B] to-[#1E3A8A] text-white p-6 sm:p-8 rounded-3xl shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Laboratorio de Calidad & Servicio Postventa • {currentUser.name}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Control de Calidad Pre-Despacho y Garantías
          </h2>
          <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-2xl">
            Inspección fisicoquímica obligatoria de lotes antes del envío y seguimiento de aplicación técnica en obra.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 p-3 rounded-2xl border border-white/20 text-center">
            <span className="text-[10px] text-slate-300 block">Certificados Emitidos</span>
            <span className="text-xl font-bold text-[#2FAE6D]">{certifiedRequests.length} ISO 9001</span>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('calidad')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'calidad'
              ? 'bg-[#1B2A6B] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>1. Inspección de Laboratorio Pre-Despacho ({pendingQualityRequests.length} pendientes)</span>
        </button>

        <button
          onClick={() => setActiveTab('postventa')}
          className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'postventa'
              ? 'bg-[#1B2A6B] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>2. Garantías & Servicio Postventa</span>
        </button>
      </div>

      {activeTab === 'calidad' && (
        <div className="space-y-6">
          {/* Pending Inspection List */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Lotes en Espera de Dictamen de Calidad ({pendingQualityRequests.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Verifica viscosidad, poder cubriente, tiempo de secado y sellado de seguridad antes de autorizar el despacho.
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {pendingQualityRequests.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">
                  ✓ Todos los lotes en cola han sido inspeccionados y certificados.
                </div>
              ) : (
                pendingQualityRequests.map((req) => (
                  <div
                    key={req.id}
                    onClick={() => setSelectedRequestForDetail(req)}
                    className="p-4 sm:p-5 hover:bg-slate-50 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-[#1B2A6B] bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                          {req.requestNumber}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900">{req.projectName}</h4>
                        <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full">
                          Lote: {req.inventoryAllocation?.batchNumber || 'Pendiente'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        {req.recommendedProductName} • <strong>{req.gallonsNeeded} Galones</strong> ({req.clientName})
                      </p>
                    </div>

                    <button
                      id={`quality-eval-btn-${req.requestNumber}`}
                      className="px-4 py-2 bg-[#2FAE6D] hover:bg-[#258d58] text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 shrink-0"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Ejecutar Checklist de Calidad</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recently Certified Log */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-5 space-y-4">
            <h3 className="font-bold text-base text-slate-900">
              Certificados de Calidad Emitidos Recientemente
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {certifiedRequests.map((req) => (
                <div
                  key={req.id}
                  onClick={() => setSelectedRequestForDetail(req)}
                  className="p-4 bg-emerald-50/40 rounded-2xl border border-emerald-200 hover:border-emerald-500 transition-all cursor-pointer flex items-start justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-emerald-600" />
                      <span className="font-extrabold text-xs text-emerald-900">
                        {req.qualityChecklist?.certificateNumber}
                      </span>
                      <span className="text-[10px] text-slate-400">({req.requestNumber})</span>
                    </div>
                    <p className="text-xs font-bold text-slate-900">{req.projectName}</p>
                    <p className="text-[11px] text-slate-600">
                      Inspector: {req.qualityChecklist?.inspectorName} • Viscosidad: {req.qualityChecklist?.viscosityValueKU} KU
                    </p>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full shrink-0">
                    Aprobado
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'postventa' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs p-6 space-y-6">
          <div>
            <h3 className="font-bold text-base text-slate-900">
              Seguimiento Postventa y Pólizas de Garantía
            </h3>
            <p className="text-xs text-slate-500">
              Garantías vigentes emitidas tras validación de aplicación en obra.
            </p>
          </div>

          <div className="space-y-3">
            {requests
              .filter((r) => r.servicePostSale || r.status === 'servicio' || r.status === 'completado')
              .map((req) => (
                <div
                  key={req.id}
                  onClick={() => setSelectedRequestForDetail(req)}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-white transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-md">
                        {req.requestNumber}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900">{req.projectName}</h4>
                      <span className="text-xs text-[#2FAE6D] font-bold">
                        Garantía: {req.servicePostSale?.warrantyYears || 5} Años
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Cliente: {req.clientName} • Póliza: <strong>{req.servicePostSale?.warrantyCertificateId || 'GAR-2026-VIGENTE'}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex text-amber-400">
                      {'★'.repeat(req.servicePostSale?.clientSatisfactionRating || 5)}
                    </div>
                    <button className="px-3 py-1.5 bg-[#1B2A6B] text-white text-xs font-bold rounded-xl">
                      Ver Póliza
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
