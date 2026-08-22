import React, { useState } from 'react';
import {
  X,
  FileText,
  Sliders,
  Package,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Download,
  Building2,
  Calendar,
  Layers,
  Sparkles,
  ShieldCheck,
  UserCheck,
  Award,
  Star,
  Printer,
  Clock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { WORKFLOW_STAGES } from '../data/initialData';
import { RequestStatus } from '../types';

export const RequestDetailModal: React.FC = () => {
  const {
    selectedRequestForDetail,
    setSelectedRequestForDetail,
    currentUser,
    approveTechnicalEvaluation,
    allocateInventoryToRequest,
    submitQualityInspection,
    updateServicePostSale,
    inventory,
  } = useApp();

  const [techNotes, setTechNotes] = useState('Especificación técnica validada conforme a norma NTC 1335. Se recomienda dos manos de aplicación.');
  const [discountPercent, setDiscountPercent] = useState<number>(8);

  const [selectedBatch, setSelectedBatch] = useState('LOT-2026-VIN-8821');
  const [warehouseZone, setWarehouseZone] = useState('Bodega Central - Pasillo A-04');

  // Quality inspection state
  const [viscosityKU, setViscosityKU] = useState<number>(101);
  const [opacityPercent, setOpacityPercent] = useState<number>(99.2);
  const [qualityObs, setQualityObs] = useState('Lote conforme a especificación técnica. Excelente nivelación.');

  // Service post sale
  const [satisfactionRating, setSatisfactionRating] = useState<number>(5);
  const [clientFeedback, setClientFeedback] = useState('Excelente adherencia y cubrimiento en la obra.');

  if (!selectedRequestForDetail) return null;

  const req = selectedRequestForDetail;

  const stageOrder: RequestStatus[] = [
    'necesidad',
    'solucion_tecnica',
    'abastecimiento',
    'calidad',
    'servicio',
    'completado',
  ];

  const currentStageIndex = stageOrder.indexOf(req.status);

  // Commercial total computation
  const calculatedSubtotal = req.estimatedPriceCOP;
  const discountAmount = Math.round(calculatedSubtotal * (discountPercent / 100));
  const finalQuotedTotal = calculatedSubtotal - discountAmount;

  // Handle Commercial Approval
  const handleApproveTech = () => {
    approveTechnicalEvaluation(req.id, {
      notes: techNotes,
      discountPercent: Number(discountPercent) || 0,
      quotedTotal: finalQuotedTotal,
    });
  };

  // Handle Warehouse Allocation
  const handleAllocateStock = () => {
    allocateInventoryToRequest(req.id, selectedBatch, warehouseZone);
  };

  // Handle Quality Inspection
  const handleQualitySubmit = () => {
    submitQualityInspection(req.id, {
      inspectorName: currentUser.name,
      inspectionDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
      viscosityPassed: true,
      viscosityValueKU: viscosityKU,
      opacityPassed: true,
      opacityPercent,
      dryingTimePassed: true,
      colorMatchPassed: true,
      packagingSealPassed: true,
      approvedForDispatch: true,
      certificateNumber: `CERT-CAL-2026-${Math.floor(Math.random() * 900 + 100)}`,
      observations: qualityObs,
    });
  };

  // Handle Complete Service & Guarantee
  const handleFinishService = () => {
    updateServicePostSale(req.id, {
      clientSatisfactionRating: satisfactionRating,
      feedbackNotes: clientFeedback,
      deliveredDate: new Date().toISOString().replace('T', ' ').slice(0, 16),
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95">
        {/* Modal Top Header */}
        <div className="bg-[#142154] text-white p-5 sm:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1B2A6B] border border-white/20 text-[#2FAE6D] flex items-center justify-center font-extrabold text-sm shadow-md">
              {req.requestNumber}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-xl font-bold text-white leading-tight">
                  {req.projectName}
                </h2>
                <span className="text-[10px] bg-[#2FAE6D] text-white font-bold px-2 py-0.5 rounded-full capitalize">
                  {req.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {req.clientName} ({req.clientCompany}) • Canal: <span className="uppercase font-semibold">{req.channel}</span> • Creada: {req.createdAt}
              </p>
            </div>
          </div>
          <button
            id="close-detail-modal-btn"
            onClick={() => setSelectedRequestForDetail(null)}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 5 Stages Visual Timeline Progress Tracker */}
        <div className="bg-slate-100 p-4 border-b border-slate-200">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
            {WORKFLOW_STAGES.map((stg, idx) => {
              const isPassed = currentStageIndex > idx;
              const isCurrent = currentStageIndex === idx || (stg.id === 'calidad' && req.status === 'completado');

              return (
                <div
                  key={stg.id}
                  className={`p-2 rounded-xl border flex flex-col items-center justify-center transition-all ${
                    isCurrent
                      ? 'bg-[#1B2A6B] text-white border-[#1B2A6B] shadow-sm font-bold'
                      : isPassed
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-200 font-semibold'
                      : 'bg-white text-slate-400 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-0.5">
                    {isPassed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#2FAE6D]" />
                    ) : (
                      <span className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center ${isCurrent ? 'bg-[#2FAE6D] text-white font-bold' : 'bg-slate-200 text-slate-600'}`}>
                        {stg.number}
                      </span>
                    )}
                    <span className="text-[11px] truncate">{stg.title.split(' ')[0]}</span>
                  </div>
                  <span className="text-[9px] opacity-80 truncate">{stg.subtitle}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-5 sm:p-8 flex-1 space-y-6 text-left">
          {/* Main Grid: Request Summary & Technical Specs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Technical requirement summary */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-[#1B2A6B]" />
                Especificación Técnica
              </h4>
              <p className="text-sm font-bold text-slate-900">{req.recommendedProductName}</p>
              <div className="text-xs text-slate-600 space-y-1">
                <p>• <strong>Superficie:</strong> <span className="capitalize">{req.surfaceType.replace('_', ' ')}</span> ({req.areaSqMeters} m²)</p>
                <p>• <strong>Ambiente:</strong> <span className="capitalize">{req.environment.replace('_', ' ')}</span></p>
                <p>• <strong>Acabado:</strong> <span className="capitalize">{req.finish.replace('_', ' ')}</span></p>
                <p className="flex items-center gap-1.5">
                  • <strong>Color:</strong>
                  <span className="w-3 h-3 rounded-full border border-slate-300 inline-block" style={{ backgroundColor: req.selectedColorHex }} />
                  <span>{req.selectedColorName}</span>
                </p>
              </div>
            </div>

            {/* Calculated Materials */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Package className="w-3.5 h-3.5 text-[#2FAE6D]" />
                Cálculo de Materiales
              </h4>
              <div className="text-xs space-y-1.5">
                <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-200">
                  <span className="text-slate-600">Total Galones:</span>
                  <span className="font-extrabold text-[#1B2A6B] text-sm">{req.gallonsNeeded} Gal</span>
                </div>
                <p className="text-slate-600">
                  • <strong>Presentación:</strong> {req.suggestedBuckets > 0 ? `${req.suggestedBuckets} Cuñete(s) (5 Gal)` : ''} {req.suggestedIndividualGallons > 0 ? `+ ${req.suggestedIndividualGallons} Gal` : ''}
                </p>
                <p className="text-slate-600">
                  • <strong>Imprimante/Sellador:</strong> {req.primerRequiredGallons > 0 ? `${req.primerRequiredGallons} Gal Sellomax` : 'No requerido'}
                </p>
                <p className="text-slate-600">• <strong>Manos:</strong> {req.recommendedCoats} recomendadas</p>
              </div>
            </div>

            {/* Commercial & Financial status */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-indigo-600" />
                Valor y Cotización
              </h4>
              <p className="text-xl font-extrabold text-[#1B2A6B]">
                ${(req.technicalEvaluation?.quotedTotalCOP || req.estimatedPriceCOP).toLocaleString('es-CO')}{' '}
                <span className="text-xs font-normal text-slate-500">COP</span>
              </p>
              <div className="text-xs text-slate-600 space-y-1">
                {req.technicalEvaluation ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-100 font-bold px-2 py-0.5 rounded-md text-[11px]">
                    <CheckCircle2 className="w-3 h-3" /> Cotización Aprobada ({req.technicalEvaluation.discountPercent}% Dcto)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-100 font-bold px-2 py-0.5 rounded-md text-[11px]">
                    <AlertTriangle className="w-3 h-3" /> Pendiente de Aprobación Técnica
                  </span>
                )}
                <p className="text-[11px] text-slate-500 mt-1">Plazo de entrega: {req.urgencyDays} días hábiles</p>
              </div>
            </div>
          </div>

          {/* CLIENT-CENTRIC 5-PHASE TRACEABILITY */}
          <div className="border-t border-slate-200 pt-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#2FAE6D]" />
                  Trazabilidad de Calidad & Despacho del Pedido
                </h3>
                <p className="text-xs text-slate-500">Transparencia total en formulación, laboratorio y garantía de fábrica.</p>
              </div>
            </div>

            {/* 1. COMMERCIAL & TECHNICAL VALIDATION */}
            <div className="bg-sky-50/70 p-5 rounded-2xl border border-sky-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-sm">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-sky-950">1. Evaluación Técnica y Cotización Oficial</h4>
                    <p className="text-xs text-sky-700">Validación de rendimiento por m², color y formulación por asesor técnico Pintuco.</p>
                  </div>
                </div>
                {req.technicalEvaluation?.isApproved ? (
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Cotización Formal Aprobada
                  </span>
                ) : (
                  <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> En Validación Técnica
                  </span>
                )}
              </div>

              {req.technicalEvaluation?.isApproved ? (
                <div className="bg-white p-4 rounded-xl border border-sky-100 text-xs space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                    <p><strong>Asesor Técnico Asignado:</strong> {req.technicalEvaluation.evaluatedBy}</p>
                    <p><strong>Fecha de Emisión:</strong> {req.technicalEvaluation.evaluationDate}</p>
                  </div>
                  <p><strong>Especificación Aprobada:</strong> {req.technicalEvaluation.technicalNotes}</p>
                  <p><strong>Descuento Especial Aplicado:</strong> {req.technicalEvaluation.discountPercent}% en obra</p>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-slate-500 text-[11px] block">Total a Pagar Cotizado:</span>
                      <span className="text-base font-black text-[#1B2A6B]">
                        ${req.technicalEvaluation.quotedTotalCOP.toLocaleString('es-CO')} COP
                      </span>
                    </div>
                    <button
                      onClick={() => window.print()}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#1B2A6B] hover:bg-[#142154] px-4 py-2 rounded-xl cursor-pointer shadow-2xs"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Imprimir Cotización PDF</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-4 rounded-xl border border-sky-100 text-xs space-y-3">
                  <p className="text-slate-600">
                    Tu proyecto está siendo evaluado por el equipo técnico de Pintuco para garantizar el mejor rendimiento.
                  </p>
                  <button
                    id="approve-tech-btn"
                    type="button"
                    onClick={handleApproveTech}
                    className="bg-[#1B2A6B] hover:bg-[#152254] text-white px-5 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#2FAE6D]" />
                    <span>Aprobar y Confirmar Cotización Formal</span>
                  </button>
                </div>
              )}
            </div>

            {/* 2. INVENTORY ALLOCATION & WAREHOUSE */}
            <div className="bg-amber-50/70 p-5 rounded-2xl border border-amber-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-sm">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-amber-950">2. Reserva en Bodega & Centro de Distribución</h4>
                    <p className="text-xs text-amber-700">Asignación de lote directo de planta de producción.</p>
                  </div>
                </div>
                {req.inventoryAllocation ? (
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Lote Reservado: {req.inventoryAllocation.batchNumber}
                  </span>
                ) : (
                  <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Pendiente de Lote
                  </span>
                )}
              </div>

              {req.inventoryAllocation ? (
                <div className="bg-white p-4 rounded-xl border border-amber-200 text-xs space-y-2">
                  <p><strong>Lote Asignado:</strong> <span className="font-mono font-bold text-slate-800">{req.inventoryAllocation.batchNumber}</span></p>
                  <p><strong>Centro de Distribución:</strong> {req.inventoryAllocation.warehouseZone}</p>
                  <p><strong>Fecha de Asignación:</strong> {req.inventoryAllocation.allocatedAt}</p>
                </div>
              ) : (
                <div className="bg-white p-4 rounded-xl border border-amber-100 text-xs space-y-3">
                  <p className="text-slate-600">
                    Se reservará el lote de producción más fresco para asegurar el cubrimiento y adherencia óptimos.
                  </p>
                  <button
                    id="allocate-stock-btn"
                    type="button"
                    onClick={handleAllocateStock}
                    className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Package className="w-4 h-4" />
                    <span>Confirmar Reserva de Lote en Bodega</span>
                  </button>
                </div>
              )}
            </div>

            {/* 3. QUALITY CONTROL INSPECTION */}
            <div className="bg-emerald-50/70 p-5 rounded-2xl border border-emerald-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#2FAE6D] text-white flex items-center justify-center font-bold text-sm">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-950">3. Certificado de Control de Calidad ISO 9001</h4>
                    <p className="text-xs text-emerald-700">Verificación físico-química de viscosidad, secado y poder cubriente.</p>
                  </div>
                </div>
                {req.qualityChecklist ? (
                  <span className="text-xs bg-emerald-200 text-emerald-900 font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-emerald-700" /> {req.qualityChecklist.certificateNumber}
                  </span>
                ) : (
                  <span className="text-xs bg-slate-200 text-slate-700 font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> En Cola de Laboratorio
                  </span>
                )}
              </div>

              {req.qualityChecklist ? (
                <div className="bg-white p-4 rounded-xl border border-emerald-200 text-xs space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div>
                      <p className="font-bold text-emerald-900">Certificado Oficial de Calidad de Fábrica Pintuco</p>
                      <p className="text-slate-500">Inspector Responsable: {req.qualityChecklist.inspectorName}</p>
                    </div>
                    <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-md font-bold">
                      Aprobado para Obra
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-slate-700">
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Viscosidad</span>
                      <span className="font-extrabold text-slate-800">{req.qualityChecklist.viscosityValueKU} KU (NTC 1335)</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Poder Cubriente</span>
                      <span className="font-extrabold text-slate-800">{req.qualityChecklist.opacityPercent}% Cubrimiento</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Tono & Delta E</span>
                      <span className="font-extrabold text-emerald-700">Conforme &lt;0.35 ΔE</span>
                    </div>
                  </div>
                  <p className="text-slate-600 pt-1"><strong>Dictamen Técnico:</strong> {req.qualityChecklist.observations}</p>
                </div>
              ) : (
                <div className="bg-white p-4 rounded-xl border border-emerald-100 text-xs space-y-3">
                  <p className="text-slate-600">
                    Cada lote de pintura es sometido a 5 pruebas de laboratorio antes de salir hacia tu obra.
                  </p>
                  <button
                    id="submit-quality-btn"
                    type="button"
                    onClick={handleQualitySubmit}
                    className="bg-[#2FAE6D] hover:bg-[#258d58] text-white px-5 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Award className="w-4 h-4" />
                    <span>Emitir Certificado Oficial de Calidad</span>
                  </button>
                </div>
              )}
            </div>

            {/* 4. POST-SALE SERVICE & WARRANTY */}
            <div className="bg-purple-50/70 p-5 rounded-2xl border border-purple-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-sm">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-purple-950">4. Despacho a Obra & Póliza de Garantía</h4>
                    <p className="text-xs text-purple-700">Entrega en sitio, asesoría en aplicación y emisión de certificado de garantía.</p>
                  </div>
                </div>
                {req.status === 'completado' ? (
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Garantía Activa
                  </span>
                ) : (
                  <span className="text-xs bg-purple-100 text-purple-800 font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> En Logística
                  </span>
                )}
              </div>

              {req.status === 'completado' ? (
                <div className="bg-white p-4 rounded-xl border border-purple-200 text-xs space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div>
                      <p className="font-bold text-purple-950">Póliza de Garantía de Fábrica Pintuco</p>
                      <p className="text-slate-500">Certificado No: {req.servicePostSale?.warrantyCertificateId || 'GAR-2026-9901'}</p>
                    </div>
                    <span className="text-[11px] bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-md font-bold">
                      {req.servicePostSale?.warrantyYears || 5} Años de Vigencia
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <p className="flex items-center gap-1.5">
                      <strong>Tu Calificación:</strong>
                      <span className="text-amber-500 font-bold text-sm">
                        {'★'.repeat(req.servicePostSale?.clientSatisfactionRating || 5)}
                      </span>
                    </p>
                    <button
                      onClick={() => window.print()}
                      className="text-xs font-bold text-purple-700 hover:text-purple-900 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-200 cursor-pointer"
                    >
                      Descargar Póliza
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white p-4 rounded-xl border border-purple-100 text-xs space-y-3">
                  <p className="text-slate-600">
                    Una vez entregado y aplicado el producto en obra, emitiremos la póliza de garantía directa de Pintuco.
                  </p>
                  <button
                    id="finish-service-btn"
                    type="button"
                    onClick={handleFinishService}
                    className="bg-purple-700 hover:bg-purple-800 text-white px-5 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Award className="w-4 h-4 text-emerald-300" />
                    <span>Confirmar Entrega y Activar Garantía</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Trazabilidad segura registrada en ColorLink Pintuco.
          </div>
          <button
            onClick={() => setSelectedRequestForDetail(null)}
            className="px-5 py-2 bg-[#142154] hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer"
          >
            Cerrar Ficha
          </button>
        </div>
      </div>
    </div>
  );
};
