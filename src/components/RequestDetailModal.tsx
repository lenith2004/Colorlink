import React, { useState, useEffect, useRef } from 'react';
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
  Camera,
  Upload,
  Image as ImageIcon,
  Eye,
  RefreshCw,
  User,
  Check,
  ExternalLink,
  Maximize2,
  Plus,
  Send,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { WORKFLOW_STAGES } from '../data/initialData';
import { RequestStatus } from '../types';
import {
  supabase,
  getContratistasFromSupabase,
  getServiciosDeProyecto,
  guardarServicioAplicacionEnSupabase,
  subirFotoEvidenciaStorage,
  guardarEvidenciaCalidadEnSupabase,
  getEvidenciasDeProyecto,
  updateEstadoProyectoEnSupabase,
  UsuarioRow,
} from '../lib/supabase';

export const RequestDetailModal: React.FC = () => {
  const {
    selectedRequestForDetail,
    setSelectedRequestForDetail,
    currentUser,
    refreshFromSupabase,
  } = useApp();

  if (!selectedRequestForDetail) return null;
  const req = selectedRequestForDetail;

  // Resolve numerical Proyecto_ID for Supabase queries
  const proyectoId: number =
    req.dbProjectId ||
    (typeof req.id === 'string' && req.id.startsWith('PROJ-')
      ? parseInt(req.id.replace('PROJ-', ''), 10)
      : null) ||
    (typeof req.requestNumber === 'string' && req.requestNumber.startsWith('PROY-')
      ? parseInt(req.requestNumber.replace('PROY-', ''), 10)
      : null) ||
    1;

  // Active Tab: 'servicio' | 'evidencias' | 'trazabilidad'
  const [activeTab, setActiveTab] = useState<'servicio' | 'evidencias' | 'trazabilidad'>('servicio');

  // Estado_proyecto en vivo de Supabase
  const [liveEstadoProyecto, setLiveEstadoProyecto] = useState<string>('En cotización');

  // --------------------------------------------------------------------------
  // 1. SERVICIO DE APLICACIÓN
  // --------------------------------------------------------------------------
  const [contratistas, setContratistas] = useState<UsuarioRow[]>([]);
  const [isLoadingContratistas, setIsLoadingContratistas] = useState<boolean>(false);
  const [serviciosList, setServiciosList] = useState<any[]>([]);
  const [isLoadingServicios, setIsLoadingServicios] = useState<boolean>(false);

  // Form states for SERVICIO_APLICACION
  const [selectedContratistaId, setSelectedContratistaId] = useState<number | string>('');
  const [fechaInicio, setFechaInicio] = useState<string>(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  });
  const [fechaFin, setFechaFin] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [estadoServicio, setEstadoServicio] = useState<'Programado' | 'En ejecución' | 'Finalizado'>('Programado');
  const [isSavingServicio, setIsSavingServicio] = useState<boolean>(false);
  const [servicioMsg, setServicioMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // --------------------------------------------------------------------------
  // 2. EVIDENCIAS DE CALIDAD & STORAGE
  // --------------------------------------------------------------------------
  const [evidenciasList, setEvidenciasList] = useState<any[]>([]);
  const [isLoadingEvidencias, setIsLoadingEvidencias] = useState<boolean>(false);
  const [filtroEtapa, setFiltroEtapa] = useState<string>('todas');

  // Form states for EVIDENCIA_CALIDAD
  const [etapaObra, setEtapaObra] = useState<'Preparación de superficie' | 'Aplicación' | 'Entrega final'>('Preparación de superficie');
  const [descripcionEvidencia, setDescripcionEvidencia] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isUploadingEvidencia, setIsUploadingEvidencia] = useState<boolean>(false);
  const [evidenciaMsg, setEvidenciaMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; etapa: string; desc: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // --------------------------------------------------------------------------
  // CARGA INICIAL DE DATOS DESDE SUPABASE
  // --------------------------------------------------------------------------
  const fetchSupabaseProjectData = async () => {
    // 1. Estado del Proyecto en PROYECTO
    try {
      const { data: pData } = await supabase
        .from('PROYECTO')
        .select('Estado_proyecto')
        .eq('Proyecto_ID', proyectoId)
        .maybeSingle();

      if (pData?.Estado_proyecto) {
        setLiveEstadoProyecto(pData.Estado_proyecto);
      }
    } catch (e) {}

    // 2. Contratistas de USUARIO con tipo_cliente = 'Contratista'
    setIsLoadingContratistas(true);
    try {
      const contrs = await getContratistasFromSupabase();
      setContratistas(contrs);
      if (contrs.length > 0 && !selectedContratistaId) {
        setSelectedContratistaId(contrs[0].USUARIO_ID ?? (contrs[0] as any).Usuario_ID);
      }
    } catch (e) {
      console.warn('[Error fetching contratistas]', e);
    } finally {
      setIsLoadingContratistas(false);
    }

    // 3. Servicios de Aplicación de SERVICIO_APLICACION
    setIsLoadingServicios(true);
    try {
      const servs = await getServiciosDeProyecto(proyectoId);
      setServiciosList(servs);
      if (servs.length > 0) {
        const lastServ = servs[0];
        if (lastServ.Estado_servicio) {
          setEstadoServicio(lastServ.Estado_servicio);
        }
        if (lastServ.Contratista_asignado) {
          setSelectedContratistaId(lastServ.Contratista_asignado);
        }
      }
    } catch (e) {
      console.warn('[Error fetching servicios]', e);
    } finally {
      setIsLoadingServicios(false);
    }

    // 4. Evidencias de Calidad de EVIDENCIA_CALIDAD
    setIsLoadingEvidencias(true);
    try {
      const evs = await getEvidenciasDeProyecto(proyectoId);
      setEvidenciasList(evs);
    } catch (e) {
      console.warn('[Error fetching evidencias]', e);
    } finally {
      setIsLoadingEvidencias(false);
    }
  };

  useEffect(() => {
    fetchSupabaseProjectData();
  }, [proyectoId]);

  // Manejar selección de foto para evidencia
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setFilePreview(objectUrl);
    }
  };

  // --------------------------------------------------------------------------
  // GUARDAR SERVICIO DE APLICACIÓN (Requerimiento 1 & 4)
  // --------------------------------------------------------------------------
  const handleSubmitServicio = async (e: React.FormEvent) => {
    e.preventDefault();
    setServicioMsg(null);

    if (!selectedContratistaId) {
      setServicioMsg({
        type: 'error',
        text: 'Debes seleccionar un contratista asignado de la tabla USUARIO.',
      });
      return;
    }

    if (!fechaInicio) {
      setServicioMsg({
        type: 'error',
        text: 'La fecha de inicio es requerida.',
      });
      return;
    }

    setIsSavingServicio(true);
    try {
      const res = await guardarServicioAplicacionEnSupabase({
        Proyecto_ID: proyectoId,
        Contratista_asignado: selectedContratistaId,
        Fecha_inicio: fechaInicio,
        Fecha_fin: fechaFin || null,
        Estado_servicio: estadoServicio,
      });

      if (!res.success) {
        throw new Error(res.error || 'No se pudo guardar el servicio.');
      }

      // Actualizar estado en vivo
      const newProjState = estadoServicio === 'Finalizado' ? 'Finalizado' : 'En ejecución';
      setLiveEstadoProyecto(newProjState);

      setServicioMsg({
        type: 'success',
        text: `¡Servicio guardado exitosamente en SERVICIO_APLICACION! El estado del proyecto ahora es: '${newProjState}'.`,
      });

      await fetchSupabaseProjectData();
      refreshFromSupabase();
    } catch (err: any) {
      setServicioMsg({
        type: 'error',
        text: err?.message || 'Error al guardar el servicio de aplicación en Supabase.',
      });
    } finally {
      setIsSavingServicio(false);
    }
  };

  // --------------------------------------------------------------------------
  // SUBIR FOTO AL BUCKET Y GUARDAR EVIDENCIA (Requerimiento 2)
  // --------------------------------------------------------------------------
  const handleSubmitEvidencia = async (e: React.FormEvent) => {
    e.preventDefault();
    setEvidenciaMsg(null);

    if (!selectedFile) {
      setEvidenciaMsg({
        type: 'error',
        text: 'Por favor selecciona una foto para subir al bucket de evidencias.',
      });
      return;
    }

    if (!descripcionEvidencia.trim()) {
      setEvidenciaMsg({
        type: 'error',
        text: 'La descripción de la evidencia es requerida.',
      });
      return;
    }

    setIsUploadingEvidencia(true);
    try {
      // 1. Subir al bucket 'evidencias' en Supabase Storage
      const publicUrl = await subirFotoEvidenciaStorage(
        selectedFile,
        `obra_p${proyectoId}_${selectedFile.name}`
      );

      // 2. Guardar registro en EVIDENCIA_CALIDAD
      const fechaActual = new Date().toISOString().split('T')[0];
      const res = await guardarEvidenciaCalidadEnSupabase({
        Proyecto_ID: proyectoId,
        Etapa_obra: etapaObra,
        Descripcion: descripcionEvidencia.trim(),
        Fotos_URL: publicUrl,
        Fecha_registro: fechaActual,
      });

      if (!res.success) {
        throw new Error(res.error || 'No se pudo registrar en EVIDENCIA_CALIDAD.');
      }

      setEvidenciaMsg({
        type: 'success',
        text: '¡Foto subida exitosamente al bucket evidencias y guardada en EVIDENCIA_CALIDAD!',
      });

      // Limpiar formulario de subida
      setSelectedFile(null);
      setFilePreview(null);
      setDescripcionEvidencia('');
      if (fileInputRef.current) fileInputRef.current.value = '';

      // Refrescar lista de evidencias
      await fetchSupabaseProjectData();
    } catch (err: any) {
      setEvidenciaMsg({
        type: 'error',
        text: err?.message || 'Error al subir foto o guardar evidencia de calidad.',
      });
    } finally {
      setIsUploadingEvidencia(false);
    }
  };

  // Filtrar fotos de la galería por etapa
  const filteredEvidencias = evidenciasList.filter((ev) => {
    if (filtroEtapa === 'todas') return true;
    return ev.Etapa_obra === filtroEtapa;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 text-left">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="bg-[#142154] text-white p-5 sm:px-7 flex items-center justify-between border-b border-[#1e3272] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#1B2A6B] border border-white/20 text-[#2FAE6D] flex items-center justify-center font-extrabold text-sm shadow-md shrink-0">
              #{proyectoId}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-xl font-bold text-white leading-tight">
                  {req.projectName || `Proyecto #${proyectoId} - ${req.city}`}
                </h2>
                {/* Live Estado_proyecto Badge (Req 4) */}
                <span
                  className={`text-[11px] font-black px-2.5 py-0.5 rounded-full border shadow-2xs ${
                    liveEstadoProyecto === 'Finalizado'
                      ? 'bg-emerald-500 text-white border-emerald-400'
                      : liveEstadoProyecto === 'En ejecución'
                      ? 'bg-amber-400 text-slate-950 border-amber-300'
                      : 'bg-blue-500 text-white border-blue-400'
                  }`}
                >
                  Estado: {liveEstadoProyecto}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Cliente: <strong className="text-white">{req.clientName}</strong> • Ciudad:{' '}
                <strong className="text-white">{req.city}</strong> • Área: <strong>{req.areaSqMeters} m²</strong>
              </p>
            </div>
          </div>

          <button
            id="close-detail-modal-btn"
            onClick={() => setSelectedRequestForDetail(null)}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-100 border-b border-slate-200 px-5 sm:px-7 flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('servicio')}
            className={`py-3 px-4 text-xs font-extrabold border-b-2 flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'servicio'
                ? 'border-[#142154] text-[#142154] bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4 text-[#2FAE6D]" />
            <span>1. Servicio de Aplicación</span>
            {serviciosList.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('evidencias')}
            className={`py-3 px-4 text-xs font-extrabold border-b-2 flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'evidencias'
                ? 'border-[#142154] text-[#142154] bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-4 h-4 text-indigo-600" />
            <span>2. Evidencias de Calidad ({evidenciasList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('trazabilidad')}
            className={`py-3 px-4 text-xs font-extrabold border-b-2 flex items-center gap-2 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'trazabilidad'
                ? 'border-[#142154] text-[#142154] bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-4 h-4 text-slate-500" />
            <span>3. Resumen Técnico & Fases</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-5 sm:p-7 flex-1 space-y-6">

          {/* =========================================================================
              TAB 1: SERVICIO DE APLICACIÓN (Tabla SERVICIO_APLICACION)
              ========================================================================= */}
          {activeTab === 'servicio' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Feedback messages */}
              {servicioMsg && (
                <div
                  className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2 ${
                    servicioMsg.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  {servicioMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{servicioMsg.text}</span>
                </div>
              )}

              {/* Form Card */}
              <div className="p-5 sm:p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-[#2FAE6D]" />
                      <span>Programación del Servicio de Aplicación</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Guarda en la tabla <strong className="text-slate-800">SERVICIO_APLICACION</strong> y actualiza automáticamente el{' '}
                      <strong className="text-slate-800">Estado_proyecto</strong>.
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    Proyecto_ID: #{proyectoId}
                  </span>
                </div>

                <form onSubmit={handleSubmitServicio} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    
                    {/* Contratista_asignado (de USUARIO filtrando tipo_cliente = 'Contratista') */}
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">
                        Contratista Asignado (Contratista_asignado) <span className="text-rose-500">*</span>
                      </label>
                      <select
                        required
                        value={selectedContratistaId}
                        onChange={(e) => setSelectedContratistaId(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-900 focus:outline-none focus:border-indigo-600 cursor-pointer"
                      >
                        {contratistas.length === 0 ? (
                          <option value="">No hay contratistas registrados (se creará uno)</option>
                        ) : (
                          contratistas.map((c) => {
                            const cId = c.USUARIO_ID ?? (c as any).Usuario_ID;
                            return (
                              <option key={cId} value={cId}>
                                {c.NOMBRE || (c as any).nombre} (ID #{cId}) - {c.TELEFONO || (c as any).telefono || 'Sin teléfono'}
                              </option>
                            );
                          })
                        )}
                      </select>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        Filtrado de tabla USUARIO con tipo_cliente = ‘Contratista’
                      </span>
                    </div>

                    {/* Estado_servicio (Programado, En ejecución, Finalizado) */}
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">
                        Estado del Servicio (Estado_servicio) <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={estadoServicio}
                        onChange={(e) => setEstadoServicio(e.target.value as any)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white font-bold text-slate-900 focus:outline-none focus:border-indigo-600 cursor-pointer"
                      >
                        <option value="Programado">Programado</option>
                        <option value="En ejecución">En ejecución</option>
                        <option value="Finalizado">Finalizado</option>
                      </select>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        Actualizará el Estado_proyecto a ‘{estadoServicio === 'Finalizado' ? 'Finalizado' : 'En ejecución'}’
                      </span>
                    </div>

                    {/* Fecha_inicio */}
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">
                        Fecha de Inicio (Fecha_inicio) <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="date"
                          required
                          value={fechaInicio}
                          onChange={(e) => setFechaInicio(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-white font-medium"
                        />
                      </div>
                    </div>

                    {/* Fecha_fin */}
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">
                        Fecha Estimada de Finalización (Fecha_fin)
                      </label>
                      <div className="relative">
                        <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="date"
                          value={fechaFin}
                          onChange={(e) => setFechaFin(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-white font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-200">
                    <span className="text-[11px] text-slate-500">
                      Regla: Al guardar con ‘Programado’ o ‘En ejecución’ → Estado_proyecto = <strong>En ejecución</strong>. Al guardar con ‘Finalizado’ → <strong>Finalizado</strong>.
                    </span>

                    <button
                      type="submit"
                      disabled={isSavingServicio}
                      className="px-5 py-2.5 bg-[#2FAE6D] hover:bg-[#27995f] text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-95 disabled:opacity-50"
                    >
                      {isSavingServicio ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-white" />
                          <span>Guardando Servicio...</span>
                        </>
                      ) : (
                        <>
                          <UserCheck className="w-4 h-4" />
                          <span>Guardar Servicio de Aplicación</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Historial de servicios de este proyecto */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Historial de Servicios Registrados en SERVICIO_APLICACION ({serviciosList.length})</span>
                </h4>

                {isLoadingServicios ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-600" />
                    <span>Cargando servicios de Supabase...</span>
                  </div>
                ) : serviciosList.length === 0 ? (
                  <div className="p-6 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-xs text-slate-500">
                    No se han registrado servicios de aplicación aún para este proyecto. Completa el formulario superior para asignar el contratista.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {serviciosList.map((s, idx) => {
                      const contrObj = s.USUARIO || contratistas.find((c) => (c.USUARIO_ID ?? (c as any).Usuario_ID) === s.Contratista_asignado);
                      const fInicio = s.Fecha_incio || s.Fecha_inicio || 'No indicada';
                      const fFin = s.Fecha_fin || 'En curso';
                      return (
                        <div key={s.Servicios_ID || idx} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-slate-900">
                              Servicio #{s.Servicios_ID || idx + 1}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                s.Estado_servicio === 'Finalizado'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : s.Estado_servicio === 'En ejecución'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {s.Estado_servicio}
                            </span>
                          </div>

                          <div className="text-slate-600 text-[11px] space-y-0.5">
                            <p>
                              <strong>Contratista:</strong> {contrObj?.NOMBRE || (contrObj as any)?.nombre || `ID #${s.Contratista_asignado}`}
                            </p>
                            <p>
                              <strong>Fecha Inicio:</strong> {fInicio} • <strong>Fin:</strong> {fFin}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 2: EVIDENCIAS DE CALIDAD & GALERÍA (EVIDENCIA_CALIDAD y Storage)
              ========================================================================= */}
          {activeTab === 'evidencias' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Feedback messages */}
              {evidenciaMsg && (
                <div
                  className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2 ${
                    evidenciaMsg.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}
                >
                  {evidenciaMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{evidenciaMsg.text}</span>
                </div>
              )}

              {/* Upload Form Card */}
              <div className="p-5 sm:p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-slate-900 flex items-center gap-2">
                      <Camera className="w-4 h-4 text-indigo-600" />
                      <span>Subir Nueva Evidencia Fotográfica de Calidad</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Sube las fotos al bucket <strong className="text-slate-800">‘evidencias’</strong> de Supabase Storage y registra en <strong className="text-slate-800">EVIDENCIA_CALIDAD</strong>.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full border border-indigo-200">
                    Bucket: evidencias
                  </span>
                </div>

                <form onSubmit={handleSubmitEvidencia} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    
                    {/* Etapa_obra (Preparación de superficie, Aplicación, Entrega final) */}
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">
                        Etapa de Obra (Etapa_obra) <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={etapaObra}
                        onChange={(e) => setEtapaObra(e.target.value as any)}
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white font-bold text-slate-900 focus:outline-none focus:border-indigo-600 cursor-pointer"
                      >
                        <option value="Preparación de superficie">Preparación de superficie</option>
                        <option value="Aplicación">Aplicación (Manos de pintura)</option>
                        <option value="Entrega final">Entrega final y recibo</option>
                      </select>
                    </div>

                    {/* Selector de Foto */}
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">
                        Archivo de Foto (.jpg, .png, .webp) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        required
                        onChange={handleFileChange}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Descripción */}
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Descripción de la Evidencia Técnica <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={descripcionEvidencia}
                      onChange={(e) => setDescripcionEvidencia(e.target.value)}
                      placeholder="Ej. Registro de lijado, limpieza de polvo y primera mano de imprimante en fachada principal."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-indigo-600"
                    />
                  </div>

                  {/* Previsualización de la foto seleccionada */}
                  {filePreview && (
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-200">
                      <img
                        src={filePreview}
                        alt="Previsualización"
                        className="w-16 h-16 object-cover rounded-xl border border-slate-200 shrink-0"
                      />
                      <div className="text-xs text-slate-600">
                        <span className="font-bold text-slate-900 block">{selectedFile?.name}</span>
                        <span className="text-[11px] text-slate-400">
                          {selectedFile ? (selectedFile.size / 1024).toFixed(1) : 0} KB • Listo para subir a Supabase Storage
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="pt-2 flex items-center justify-end border-t border-slate-200">
                    <button
                      type="submit"
                      disabled={isUploadingEvidencia}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-95 disabled:opacity-50"
                    >
                      {isUploadingEvidencia ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-white" />
                          <span>Subiendo al bucket evidencias...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          <span>Subir Foto & Guardar Evidencia</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Galería de Fotos por Proyecto */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                  <div>
                    <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-indigo-600" />
                      <span>Galería de Evidencias de este Proyecto ({evidenciasList.length})</span>
                    </h4>
                    <p className="text-xs text-slate-500">Fotografías oficiales de inspección y calidad almacenadas en Supabase Storage.</p>
                  </div>

                  {/* Filtro por etapa */}
                  <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                    {['todas', 'Preparación de superficie', 'Aplicación', 'Entrega final'].map((et) => (
                      <button
                        key={et}
                        onClick={() => setFiltroEtapa(et)}
                        className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                          filtroEtapa === et
                            ? 'bg-[#142154] text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {et === 'todas' ? 'Todas' : et}
                      </button>
                    ))}
                  </div>
                </div>

                {isLoadingEvidencias ? (
                  <div className="p-8 text-center text-xs text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
                    <span>Cargando galería de fotos...</span>
                  </div>
                ) : filteredEvidencias.length === 0 ? (
                  <div className="p-10 text-center rounded-3xl bg-slate-50 border border-dashed border-slate-200 text-xs text-slate-500 space-y-2">
                    <Camera className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="font-bold text-slate-700">No hay fotos de evidencias con el filtro seleccionado</p>
                    <p className="text-[11px] text-slate-400">Utiliza el formulario superior para subir fotos de la obra.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {filteredEvidencias.map((ev, idx) => {
                      const imgUrl = ev.Fotos_URL || ev.fotos_url;
                      return (
                        <div
                          key={ev.Evidencia_ID || idx}
                          className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-all group flex flex-col justify-between"
                        >
                          <div className="relative aspect-video bg-slate-100 overflow-hidden cursor-pointer" onClick={() => setLightboxImage({ url: imgUrl, etapa: ev.Etapa_obra, desc: ev.Descripcion })}>
                            <img
                              src={imgUrl}
                              alt={ev.Descripcion || 'Evidencia'}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                              <Maximize2 className="w-6 h-6 drop-shadow-md" />
                            </div>
                            <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#142154]/85 text-white backdrop-blur-xs">
                              {ev.Etapa_obra}
                            </span>
                          </div>

                          <div className="p-3 text-xs space-y-1">
                            <p className="font-bold text-slate-900 line-clamp-2">{ev.Descripcion}</p>
                            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                              <span>Fecha: {ev.Fecha_registro || 'Hoy'}</span>
                              <a
                                href={imgUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-0.5"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <span>Abrir</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* =========================================================================
              TAB 3: RESUMEN TÉCNICO & FASES
              ========================================================================= */}
          {activeTab === 'trazabilidad' && (
            <div className="space-y-6 text-xs text-left animate-in fade-in duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-400 uppercase text-[10px] block">Especificación de Obra</span>
                  <p className="font-bold text-slate-900 text-sm">{req.recommendedProductName || 'Viniltex Avanzado'}</p>
                  <p>• Superficie: {req.surfaceType}</p>
                  <p>• Área Total: {req.areaSqMeters} m²</p>
                  <p>• Color: {req.selectedColorName}</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-400 uppercase text-[10px] block">Estado en Supabase</span>
                  <p className="font-bold text-slate-900 text-sm">PROYECTO #{proyectoId}</p>
                  <p>• Estado_proyecto: <strong className="text-indigo-700">{liveEstadoProyecto}</strong></p>
                  <p>• Ciudad: {req.city}</p>
                  <p>• Cliente: {req.clientName}</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-400 uppercase text-[10px] block">Cotización y Galones</span>
                  <p className="font-bold text-emerald-700 text-base">
                    ${(req.estimatedPriceCOP || 0).toLocaleString('es-CO')} COP
                  </p>
                  <p>• Galones Estimados: {req.gallonsNeeded || 4} Gal</p>
                  <p>• Servicios: {serviciosList.length} registrados</p>
                  <p>• Evidencias: {evidenciasList.length} fotos subidas</p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Lightbox Modal */}
        {lightboxImage && (
          <div
            className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setLightboxImage(null)}
          >
            <div
              className="bg-white rounded-3xl overflow-hidden max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-400 block uppercase tracking-wider">{lightboxImage.etapa}</span>
                  <p className="text-sm font-semibold">{lightboxImage.desc}</p>
                </div>
                <button
                  onClick={() => setLightboxImage(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-2 bg-slate-950 flex-1 flex items-center justify-center overflow-hidden">
                <img
                  src={lightboxImage.url}
                  alt={lightboxImage.desc}
                  className="max-h-[70vh] object-contain rounded-xl"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
