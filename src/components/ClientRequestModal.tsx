import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  User,
  Building2,
  Mail,
  Phone,
  CreditCard,
  MapPin,
  Calendar,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Database,
  RefreshCw,
  Sparkles,
  FileCheck2,
  Check,
  Plus,
  Trash2,
  Palette,
  Calculator,
  ShoppingCart,
  DollarSign,
  Package,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  supabase,
  procesarClienteEnSupabase,
  crearProyectoEnSupabase,
  guardarEspecificacionTecnicaYAreasEnSupabase,
  guardarCotizacionDetalleEnSupabase,
  SolicitudClienteResult,
  SolicitudProyectoResult,
  SolicitudEspecificacionResult,
  SolicitudCotizacionResult,
  SUPABASE_URL,
} from '../lib/supabase';

interface AreaRowState {
  id: string;
  Descripcion: string;
  Medida_m2: number | string;
}

interface CotizacionRowState {
  id: string;
  ID_de_producto: number;
  Cantidad_requerida: number | string;
}

interface SupabaseProductItem {
  ID_DE_PRODUCTO: number;
  Nombre_producto?: string;
  NOMBRE_PRODUCTO?: string;
  nombre_producto?: string;
  Precio_unitario?: number;
  PRECIO_UNITARIO?: number;
  precio_unitario?: number;
  Tipo_producto?: string;
  TIPO_PRODUCTO?: string;
  tipo_producto?: string;
  Unidad_medida?: string;
  UNIDAD_MEDIDA?: string;
  SKU?: string;
}

export const ClientRequestModal: React.FC = () => {
  const {
    isRequestModalOpen,
    setIsRequestModalOpen,
    currentUser,
    isLoggedIn,
    selectedCity,
    refreshFromSupabase,
  } = useApp();

  // Active step:
  // 1: Formulario de Cliente (USUARIO)
  // 2: Formulario de Proyecto (PROYECTO)
  // 3: Diagnóstico Técnico y Áreas (ESPECIFICACION_TECNICA y AREA)
  // 4: Cotización de Productos (COTIZACION_DETALLE)
  // 5: Resumen y Éxito Total
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // --------------------------------------------------------------------------
  // PASO 1: CLIENTE (USUARIO)
  // --------------------------------------------------------------------------
  const [nombre, setNombre] = useState<string>('');
  const [identificacion, setIdentificacion] = useState<string>('');
  const [correo, setCorreo] = useState<string>('');
  const [telefono, setTelefono] = useState<string>('');
  const [tipoCliente, setTipoCliente] = useState<string>('Constructora');
  const [clientResult, setClientResult] = useState<SolicitudClienteResult | null>(null);
  const [isProcessingClient, setIsProcessingClient] = useState<boolean>(false);
  const [clientStepMessage, setClientStepMessage] = useState<string | null>(null);

  // --------------------------------------------------------------------------
  // PASO 2: PROYECTO (PROYECTO)
  // --------------------------------------------------------------------------
  const [ciudad, setCiudad] = useState<string>(selectedCity || 'Bogotá');
  const [tipoProyecto, setTipoProyecto] = useState<string>('Residencial');
  const [areaM2, setAreaM2] = useState<number | string>(140);
  const [fechaRequerida, setFechaRequerida] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split('T')[0];
  });
  const estadoProyecto = 'Nuevo';
  const [projectResult, setProjectResult] = useState<SolicitudProyectoResult | null>(null);
  const [isProcessingProject, setIsProcessingProject] = useState<boolean>(false);

  // --------------------------------------------------------------------------
  // PASO 3: DIAGNÓSTICO TÉCNICO & ÁREAS (ESPECIFICACION_TECNICA y AREA)
  // --------------------------------------------------------------------------
  const [tipoSuperficie, setTipoSuperficie] = useState<string>('Mampostería / Muros');
  const [ambiente, setAmbiente] = useState<string>('Interior');
  const [condicion, setCondicion] = useState<string>('Buena');
  const [color, setColor] = useState<string>('Blanco Almendra');
  const [areas, setAreas] = useState<AreaRowState[]>([
    { id: 'area-1', Descripcion: 'Muros Sala y Comedor', Medida_m2: 95 },
    { id: 'area-2', Descripcion: 'Habitaciones y Corredores', Medida_m2: 45 },
  ]);
  const [galonesEstimados, setGalonesEstimados] = useState<number | string>(4);
  const [isGalonesManuallyEdited, setIsGalonesManuallyEdited] = useState<boolean>(false);
  const [specResult, setSpecResult] = useState<SolicitudEspecificacionResult | null>(null);
  const [isProcessingSpec, setIsProcessingSpec] = useState<boolean>(false);

  // --------------------------------------------------------------------------
  // PASO 4: COTIZACIÓN (COTIZACION_DETALLE y PRODUCTO)
  // --------------------------------------------------------------------------
  const [availableProducts, setAvailableProducts] = useState<SupabaseProductItem[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(false);
  const [cotizacionLines, setCotizacionLines] = useState<CotizacionRowState[]>([]);
  const [cotizacionResult, setCotizacionResult] = useState<SolicitudCotizacionResult | null>(null);
  const [isProcessingCotizacion, setIsProcessingCotizacion] = useState<boolean>(false);

  // --------------------------------------------------------------------------
  // ERRORES EN PANTALLA
  // --------------------------------------------------------------------------
  const [screenError, setScreenError] = useState<{
    step: string;
    message: string;
    details?: string;
    code?: string;
  } | null>(null);

  // Sincronizar datos de usuario logueado al abrir
  useEffect(() => {
    if (isRequestModalOpen) {
      if (isLoggedIn && currentUser) {
        if (!nombre) setNombre(currentUser.name || '');
        if (!correo) setCorreo(currentUser.email || '');
        if (!telefono && currentUser.phone) setTelefono(currentUser.phone);
        if (!identificacion && currentUser.idNumber) setIdentificacion(currentUser.idNumber);
      }
      if (selectedCity) {
        setCiudad(selectedCity);
      }
    }
  }, [isRequestModalOpen, currentUser, isLoggedIn, selectedCity]);

  // Consultar productos de la tabla PRODUCTO en Supabase
  useEffect(() => {
    if (isRequestModalOpen) {
      const loadProducts = async () => {
        setIsLoadingProducts(true);
        try {
          const { data, error } = await supabase.from('PRODUCTO').select('*');
          if (!error && data) {
            setAvailableProducts(data);
          }
        } catch (e) {
          console.warn('[Error cargando productos]', e);
        } finally {
          setIsLoadingProducts(false);
        }
      };
      loadProducts();
    }
  }, [isRequestModalOpen]);

  // --------------------------------------------------------------------------
  // CÁLCULO DE GALONES ESTIMADOS (35 m² por galón a dos manos)
  // --------------------------------------------------------------------------
  const sumaMedidaM2Areas = useMemo(() => {
    return areas.reduce((sum, a) => {
      const val = Number(a.Medida_m2);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);
  }, [areas]);

  // Actualizar automáticamente galones_estimados si el usuario no ha forzado edición manual
  useEffect(() => {
    if (!isGalonesManuallyEdited) {
      if (sumaMedidaM2Areas > 0) {
        // 35 m² por galón a dos manos
        const calc = Math.round((sumaMedidaM2Areas / 35) * 10) / 10;
        setGalonesEstimados(calc || 1);
      } else {
        setGalonesEstimados(0);
      }
    }
    // Sincronizar también el área del proyecto si cambia
    setAreaM2(sumaMedidaM2Areas || 1);
  }, [sumaMedidaM2Areas, isGalonesManuallyEdited]);

  // Preparar líneas iniciales de cotización cuando se pasa al Paso 4
  useEffect(() => {
    if (currentStep === 4 && cotizacionLines.length === 0 && availableProducts.length > 0) {
      // Elegir por defecto el primer producto con la cantidad calculada en galones
      const defaultProductId = availableProducts[0].ID_DE_PRODUCTO;
      const cant = Math.ceil(Number(galonesEstimados) || 1);
      setCotizacionLines([
        {
          id: 'cot-line-1',
          ID_de_producto: defaultProductId,
          Cantidad_requerida: cant,
        },
      ]);
    }
  }, [currentStep, availableProducts, galonesEstimados, cotizacionLines.length]);

  if (!isRequestModalOpen) return null;

  // Helpers de productos
  const getProdNombre = (p: SupabaseProductItem): string => {
    return p.Nombre_producto || p.NOMBRE_PRODUCTO || p.nombre_producto || `Producto #${p.ID_DE_PRODUCTO}`;
  };

  const getProdPrecio = (p: SupabaseProductItem): number => {
    const val = p.Precio_unitario ?? p.PRECIO_UNITARIO ?? p.precio_unitario;
    return Number(val) || 0;
  };

  const getProdTipo = (p: SupabaseProductItem): string => {
    return p.Tipo_producto || p.TIPO_PRODUCTO || p.tipo_producto || 'Recubrimiento';
  };

  // Cálculo total de cotización en tiempo real
  const totalCotizacionCalculado = cotizacionLines.reduce((acc, line) => {
    const prod = availableProducts.find((p) => p.ID_DE_PRODUCTO === line.ID_de_producto);
    const precio = prod ? getProdPrecio(prod) : 0;
    const cant = Number(line.Cantidad_requerida) || 0;
    return acc + precio * cant;
  }, 0);

  // Reiniciar todo el formulario
  const handleResetAll = () => {
    setCurrentStep(1);
    setClientResult(null);
    setProjectResult(null);
    setSpecResult(null);
    setCotizacionResult(null);
    setScreenError(null);
    setClientStepMessage(null);
    setAreas([
      { id: 'area-1', Descripcion: 'Muros Sala y Comedor', Medida_m2: 95 },
      { id: 'area-2', Descripcion: 'Habitaciones y Corredores', Medida_m2: 45 },
    ]);
    setIsGalonesManuallyEdited(false);
    setCotizacionLines([]);
  };

  // --------------------------------------------------------------------------
  // SUBMIT PASO 1: CLIENTE (USUARIO)
  // --------------------------------------------------------------------------
  const handleSubmitClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setScreenError(null);

    if (!nombre.trim() || !identificacion.trim() || !correo.trim()) {
      setScreenError({
        step: 'USUARIO',
        message: 'Nombre, Identificación y Correo son obligatorios.',
      });
      return;
    }

    setIsProcessingClient(true);
    try {
      const res = await procesarClienteEnSupabase({
        nombre: nombre.trim(),
        identificacion: identificacion.trim(),
        correo: correo.trim(),
        telefono: telefono.trim(),
        tipo_cliente: tipoCliente.trim(),
      });

      setClientResult(res);
      setClientStepMessage(
        res.reutilizado
          ? `✓ Cliente existente reutilizado (Usuario_ID: ${res.usuarioId}).`
          : `✓ Nuevo cliente guardado en USUARIO (Usuario_ID: ${res.usuarioId}).`
      );
      setCurrentStep(2);
    } catch (err: any) {
      setScreenError({
        step: 'USUARIO',
        message: err?.message || 'Error al procesar cliente en USUARIO',
        code: err?.code,
      });
    } finally {
      setIsProcessingClient(false);
    }
  };

  // --------------------------------------------------------------------------
  // SUBMIT PASO 2: PROYECTO (PROYECTO)
  // --------------------------------------------------------------------------
  const handleSubmitProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setScreenError(null);

    if (!clientResult?.usuarioId) {
      setScreenError({
        step: 'PROYECTO',
        message: 'Falta el Usuario_ID del cliente. Regresa al Paso 1.',
      });
      return;
    }

    setIsProcessingProject(true);
    try {
      const res = await crearProyectoEnSupabase({
        Ciudad: ciudad.trim(),
        Tipo_proyecto: tipoProyecto.trim(),
        Area_m2: Number(areaM2) || 1,
        Fecha_requerida: fechaRequerida,
        Usuario_ID: clientResult.usuarioId,
        Estado_proyecto: 'Nuevo',
      });

      setProjectResult(res);
      // Avanzar al Paso 3: Diagnóstico Técnico
      setCurrentStep(3);
    } catch (err: any) {
      setScreenError({
        step: 'PROYECTO',
        message: err?.message || 'Error al guardar en tabla PROYECTO',
        code: err?.code,
      });
    } finally {
      setIsProcessingProject(false);
    }
  };

  // --------------------------------------------------------------------------
  // MANIPULACIÓN DE ÁREAS (PASO 3)
  // --------------------------------------------------------------------------
  const handleAddArea = () => {
    const newIdx = areas.length + 1;
    setAreas([
      ...areas,
      {
        id: `area-${Date.now()}-${newIdx}`,
        Descripcion: `Área adicional ${newIdx}`,
        Medida_m2: 25,
      },
    ]);
  };

  const handleRemoveArea = (id: string) => {
    if (areas.length <= 1) return;
    setAreas(areas.filter((a) => a.id !== id));
  };

  const handleUpdateArea = (id: string, field: 'Descripcion' | 'Medida_m2', value: any) => {
    setAreas(
      areas.map((a) => {
        if (a.id === id) {
          return { ...a, [field]: value };
        }
        return a;
      })
    );
  };

  // --------------------------------------------------------------------------
  // SUBMIT PASO 3: DIAGNÓSTICO TÉCNICO & ÁREAS (ESPECIFICACION_TECNICA y AREA)
  // --------------------------------------------------------------------------
  const handleSubmitSpecification = async (e: React.FormEvent) => {
    e.preventDefault();
    setScreenError(null);

    if (!projectResult?.proyectoId) {
      setScreenError({
        step: 'ESPECIFICACION_TECNICA',
        message: 'No hay un Proyecto_ID creado. Regresa al paso anterior.',
      });
      return;
    }

    if (areas.length === 0) {
      setScreenError({
        step: 'AREA',
        message: 'Debes registrar al menos una área a recubrir.',
      });
      return;
    }

    setIsProcessingSpec(true);
    try {
      const res = await guardarEspecificacionTecnicaYAreasEnSupabase({
        Proyecto_ID: projectResult.proyectoId,
        Tipo_superficie: tipoSuperficie.trim(),
        Ambiente: ambiente.trim(),
        Condicion: condicion.trim(),
        Color: color.trim(),
        Galones_estimados: Number(galonesEstimados) || 0,
        areas: areas.map((a) => ({
          Descripcion: a.Descripcion.trim(),
          Medida_m2: Number(a.Medida_m2) || 0,
        })),
      });

      setSpecResult(res);
      // Avanzar al Paso 4: Cotización
      setCurrentStep(4);
    } catch (err: any) {
      setScreenError({
        step: 'ESPECIFICACION_TECNICA',
        message: err?.message || 'Error al guardar el diagnóstico técnico en Supabase',
        code: err?.code,
      });
    } finally {
      setIsProcessingSpec(false);
    }
  };

  // --------------------------------------------------------------------------
  // MANIPULACIÓN DE LÍNEAS DE COTIZACIÓN (PASO 4)
  // --------------------------------------------------------------------------
  const handleAddCotizacionLine = () => {
    const firstProd = availableProducts[0];
    if (!firstProd) return;
    setCotizacionLines([
      ...cotizacionLines,
      {
        id: `cot-${Date.now()}-${cotizacionLines.length + 1}`,
        ID_de_producto: firstProd.ID_DE_PRODUCTO,
        Cantidad_requerida: 1,
      },
    ]);
  };

  const handleRemoveCotizacionLine = (id: string) => {
    if (cotizacionLines.length <= 1) return;
    setCotizacionLines(cotizacionLines.filter((l) => l.id !== id));
  };

  const handleUpdateCotizacionLine = (
    id: string,
    field: 'ID_de_producto' | 'Cantidad_requerida',
    value: any
  ) => {
    setCotizacionLines(
      cotizacionLines.map((l) => {
        if (l.id === id) {
          return { ...l, [field]: value };
        }
        return l;
      })
    );
  };

  // --------------------------------------------------------------------------
  // SUBMIT PASO 4: COTIZACIÓN (COTIZACION_DETALLE)
  // --------------------------------------------------------------------------
  const handleSubmitCotizacion = async (e: React.FormEvent) => {
    e.preventDefault();
    setScreenError(null);

    if (!projectResult?.proyectoId) {
      setScreenError({
        step: 'COTIZACION_DETALLE',
        message: 'No hay un Proyecto_ID creado. Regresa al paso anterior.',
      });
      return;
    }

    if (cotizacionLines.length === 0) {
      setScreenError({
        step: 'COTIZACION_DETALLE',
        message: 'Debes agregar al menos un producto a la cotización.',
      });
      return;
    }

    setIsProcessingCotizacion(true);
    try {
      const itemsPayload = cotizacionLines.map((line) => {
        const prod = availableProducts.find((p) => p.ID_DE_PRODUCTO === Number(line.ID_de_producto));
        const precioUnitario = prod ? getProdPrecio(prod) : 0;
        const cant = Number(line.Cantidad_requerida) || 1;
        const subtotal = cant * precioUnitario;
        return {
          ID_de_producto: Number(line.ID_de_producto),
          Cantidad_requerida: cant,
          Subtotal_de_costo: subtotal,
          Nombre_producto: prod ? getProdNombre(prod) : undefined,
          Precio_unitario: precioUnitario,
        };
      });

      const res = await guardarCotizacionDetalleEnSupabase({
        Proyecto_ID: projectResult.proyectoId,
        items: itemsPayload,
      });

      setCotizacionResult(res);
      // Avanzar al Paso 5: Resumen final
      setCurrentStep(5);
      refreshFromSupabase();
    } catch (err: any) {
      setScreenError({
        step: 'COTIZACION_DETALLE',
        message: err?.message || 'Error al guardar la cotización en Supabase',
        code: err?.code,
      });
    } finally {
      setIsProcessingCotizacion(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 text-left">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 relative">
        {/* Header */}
        <div className="bg-[#142154] text-white p-5 sm:px-6 flex items-center justify-between shrink-0 border-b border-[#1f3074]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#2FAE6D] text-white flex items-center justify-center shadow-md shrink-0">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-white">
                  Nueva Solicitud & Cotización Integral
                </h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-0.5 rounded-full border border-emerald-400/40">
                  Supabase Live
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Flujo completo en base de datos: USUARIO → PROYECTO → ESPECIFICACION_TECNICA → AREA → COTIZACION_DETALLE
              </p>
            </div>
          </div>
          <button
            id="close-request-modal-btn"
            onClick={() => setIsRequestModalOpen(false)}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Bar (5 Pasos) */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-2.5 flex items-center justify-between overflow-x-auto text-[11px]">
          {[
            { num: 1, label: 'Cliente', sub: 'USUARIO' },
            { num: 2, label: 'Proyecto', sub: 'PROYECTO' },
            { num: 3, label: 'Diagnóstico', sub: 'ESPECIFICACIÓN' },
            { num: 4, label: 'Cotización', sub: 'PRODUCTOS' },
            { num: 5, label: 'Resumen', sub: 'ÉXITO' },
          ].map((s, idx, arr) => {
            const isCompleted = currentStep > s.num;
            const isCurrent = currentStep === s.num;
            return (
              <React.Fragment key={s.num}>
                <div className="flex items-center gap-2 shrink-0">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                      isCompleted
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-[#142154] text-white ring-2 ring-indigo-300 font-bold'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {isCompleted ? <Check className="w-3.5 h-3.5" /> : s.num}
                  </div>
                  <div className="hidden sm:block">
                    <span className={`block leading-tight font-bold ${isCurrent ? 'text-indigo-950' : 'text-slate-700'}`}>
                      {s.label}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono block">{s.sub}</span>
                  </div>
                </div>
                {idx < arr.length - 1 && (
                  <div
                    className={`flex-1 min-w-3 h-0.5 mx-2 transition-colors ${
                      currentStep > s.num ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {/* Error Banner */}
          {screenError && (
            <div className="mb-5 p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-950 animate-in fade-in duration-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h3 className="font-bold text-sm text-rose-950">
                      Error en Supabase ({screenError.step})
                    </h3>
                    {screenError.code && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-200 text-rose-800">
                        {screenError.code}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-rose-900 mt-1 break-words">
                    {screenError.message}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* =========================================================================
              PASO 1: CLIENTE (USUARIO)
              ========================================================================= */}
          {currentStep === 1 && (
            <form onSubmit={handleSubmitClient} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-2.5">
                <User className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <div className="text-xs text-indigo-900">
                  <span className="font-bold block">Paso 1: Identificación y Registro del Cliente</span>
                  <span>
                    Buscamos en la tabla <strong className="font-semibold">USUARIO</strong> por{' '}
                    <strong className="font-semibold">identificacion</strong>. Si ya existe, se reutiliza su{' '}
                    <strong className="font-semibold">Usuario_ID</strong>. Si no, se crea automáticamente.
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Nombre Completo o Razón Social <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej. Juan Pérez o Constructora Bolívar SAS"
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Número de Identificación (Cédula o NIT) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <CreditCard className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={identificacion}
                    onChange={(e) => setIdentificacion(e.target.value)}
                    placeholder="Ej. 1000000001"
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white font-mono"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Columna: identificacion (Se reutilizará si ya existe en Supabase)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Correo Electrónico <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={correo}
                      onChange={(e) => setCorreo(e.target.value)}
                      placeholder="correo@empresa.com"
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">Teléfono / Celular</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      placeholder="3001234567"
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Tipo de Cliente (tipo_cliente)</label>
                <select
                  value={tipoCliente}
                  onChange={(e) => setTipoCliente(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white cursor-pointer"
                >
                  <option value="Constructora">Constructora</option>
                  <option value="Contratista">Contratista</option>
                  <option value="Pintor Profesional">Pintor Profesional</option>
                  <option value="Particular / Residencial">Particular / Residencial</option>
                  <option value="Comercial / Empresa">Comercial / Empresa</option>
                  <option value="Interventoría">Interventoría</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 text-xs font-semibold rounded-xl hover:bg-slate-100 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isProcessingClient}
                  className="px-5 py-2.5 bg-[#142154] hover:bg-[#1a2b6d] text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-95"
                >
                  {isProcessingClient ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                      <span>Validando en Supabase...</span>
                    </>
                  ) : (
                    <>
                      <span>Continuar al Proyecto</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* =========================================================================
              PASO 2: PROYECTO (PROYECTO)
              ========================================================================= */}
          {currentStep === 2 && clientResult && (
            <form onSubmit={handleSubmitProject} className="space-y-4">
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold">Cliente vinculado:</span> {nombre} (
                    <strong className="font-mono">Usuario_ID: {clientResult.usuarioId}</strong>)
                    <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200 text-emerald-900">
                      {clientResult.reutilizado ? 'Reutilizado' : 'Nuevo'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-emerald-700 hover:text-emerald-950 text-[11px] font-bold underline cursor-pointer"
                >
                  Cambiar
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Ciudad del Proyecto (Ciudad) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    value={ciudad}
                    onChange={(e) => setCiudad(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white cursor-pointer"
                  >
                    <option value="Bogotá">Bogotá D.C.</option>
                    <option value="Medellín">Medellín</option>
                    <option value="Cali">Cali</option>
                    <option value="Barranquilla">Barranquilla</option>
                    <option value="Cartagena">Cartagena</option>
                    <option value="Bucaramanga">Bucaramanga</option>
                    <option value="Pereira">Pereira</option>
                    <option value="Manizales">Manizales</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Tipo de Proyecto (Tipo_proyecto) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    value={tipoProyecto}
                    onChange={(e) => setTipoProyecto(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 bg-white cursor-pointer"
                  >
                    <option value="Residencial">Residencial (Apartamentos / Casas)</option>
                    <option value="Comercial">Comercial (Oficinas / Locales)</option>
                    <option value="Industrial">Industrial (Plantas / Bodegas)</option>
                    <option value="Fachadas">Fachadas y Alturas</option>
                    <option value="Institucional">Institucional (Hospitales / Colegios)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Área Estimada Inicial (Area_m2) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={1}
                      value={areaM2}
                      onChange={(e) => setAreaM2(e.target.value)}
                      className="w-full px-3 py-2.5 text-xs rounded-xl border border-slate-300 font-mono font-bold"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">m²</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Se detallará por áreas en el paso siguiente</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Fecha Requerida (Fecha_requerida) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="date"
                      required
                      value={fechaRequerida}
                      onChange={(e) => setFechaRequerida(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800 block">Estado del Proyecto (Estado_proyecto)</span>
                  <span className="text-[10px] text-slate-400">Se registrará automáticamente con valor fijo</span>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-100 text-[#142154] border border-blue-200">
                  ‘{estadoProyecto}’
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2.5 text-slate-600 hover:text-slate-800 text-xs font-semibold rounded-xl hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Volver al Cliente</span>
                </button>

                <button
                  type="submit"
                  disabled={isProcessingProject}
                  className="px-5 py-2.5 bg-[#142154] hover:bg-[#1a2b6d] text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-95"
                >
                  {isProcessingProject ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Guardando Proyecto en Supabase...</span>
                    </>
                  ) : (
                    <>
                      <span>Crear Proyecto & Diagnóstico</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* =========================================================================
              PASO 3: DIAGNÓSTICO TÉCNICO & ÁREAS (ESPECIFICACION_TECNICA y AREA)
              ========================================================================= */}
          {currentStep === 3 && projectResult && (
            <form onSubmit={handleSubmitSpecification} className="space-y-5">
              {/* Project banner */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200 text-xs text-indigo-950 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span className="font-extrabold text-indigo-950">
                      Paso 3: Diagnóstico Técnico para Proyecto #{projectResult.proyectoId}
                    </span>
                  </div>
                  <p className="text-[11px] text-indigo-800 mt-0.5 ml-6">
                    Ciudad: <strong>{ciudad}</strong> • Tipo: <strong>{tipoProyecto}</strong> • Cliente:{' '}
                    <strong>{nombre}</strong>
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-indigo-200 text-indigo-900">
                  PROYECTO_ID: {projectResult.proyectoId}
                </span>
              </div>

              {/* Technical Spec Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Tipo de Superficie (Tipo_superficie) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={tipoSuperficie}
                    onChange={(e) => setTipoSuperficie(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white cursor-pointer font-medium"
                  >
                    <option value="Mampostería / Muros">Mampostería / Muros</option>
                    <option value="Drywall / Yeso">Drywall / Yeso</option>
                    <option value="Fachada Exterior">Fachada Exterior</option>
                    <option value="Pisos / Alto Tráfico">Pisos / Alto Tráfico</option>
                    <option value="Concreto Visto">Concreto Visto</option>
                    <option value="Madera Natural">Madera Natural</option>
                    <option value="Metal / Estructura Acero">Metal / Estructura Acero</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Ambiente (Ambiente) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={ambiente}
                    onChange={(e) => setAmbiente(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white cursor-pointer font-medium"
                  >
                    <option value="Interior">Interior</option>
                    <option value="Exterior">Exterior</option>
                    <option value="Zona Húmeda / Baños">Zona Húmeda / Baños</option>
                    <option value="Tráfico Pesado / Comercial">Tráfico Pesado / Comercial</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Condición del Sustrato (Condicion) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={condicion}
                    onChange={(e) => setCondicion(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white cursor-pointer font-medium"
                  >
                    <option value="Nueva (Obra Gris / Pañete)">Nueva (Obra Gris / Pañete)</option>
                    <option value="Buena (Repinte Estándar)">Buena (Repinte Estándar)</option>
                    <option value="Con Humedad o Eflorescencia">Con Humedad o Eflorescencia</option>
                    <option value="Deteriorada / Con Fisuras">Deteriorada / Con Fisuras</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Color Deseado (Color) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Palette className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      placeholder="Ej. Blanco Almendra, Gris Niebla"
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* SECCIÓN DE ÁREAS (Tabla AREA) */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5 uppercase tracking-wide">
                      <Layers className="w-4 h-4 text-indigo-600" />
                      <span>Áreas a Recubrir (Tabla AREA)</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Ingresa una o varias áreas. Se guardarán vinculadas al ID_ESPECIFICADO.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddArea}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition-all shadow-xs active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar Área</span>
                  </button>
                </div>

                {/* Lista de áreas dinámicas */}
                <div className="space-y-2">
                  {areas.map((a, idx) => (
                    <div
                      key={a.id}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200 text-xs shadow-2xs"
                    >
                      <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-[11px]">
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <input
                          type="text"
                          required
                          value={a.Descripcion}
                          onChange={(e) => handleUpdateArea(a.id, 'Descripcion', e.target.value)}
                          placeholder="Descripción (ej. Sala, Fachada, Cuarto 1)"
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div className="w-32 relative">
                        <input
                          type="number"
                          required
                          min={1}
                          value={a.Medida_m2}
                          onChange={(e) => handleUpdateArea(a.id, 'Medida_m2', e.target.value)}
                          placeholder="m²"
                          className="w-full px-2.5 py-1.5 pr-8 rounded-lg border border-slate-200 text-xs font-mono font-bold text-slate-800"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                          m²
                        </span>
                      </div>
                      {areas.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveArea(a.id)}
                          className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Eliminar esta área"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Resumen de Área y Cálculo de Galones */}
                <div className="pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <span className="font-bold">Total Áreas Sumadas:</span>
                    <span className="px-2.5 py-0.5 rounded-lg bg-white border border-slate-200 font-mono font-extrabold text-indigo-950">
                      {sumaMedidaM2Areas} m²
                    </span>
                  </div>

                  {/* Campo Editable de Galones Estimados */}
                  <div className="flex items-center gap-2">
                    <label className="font-bold text-slate-800 whitespace-nowrap">
                      Galones Estimados (Galones_estimados):
                    </label>
                    <div className="relative w-28">
                      <input
                        type="number"
                        step="0.1"
                        min={0.1}
                        required
                        value={galonesEstimados}
                        onChange={(e) => {
                          setIsGalonesManuallyEdited(true);
                          setGalonesEstimados(e.target.value);
                        }}
                        className="w-full px-2.5 py-1.5 pr-8 rounded-xl border-2 border-indigo-300 font-mono font-black text-indigo-950 bg-indigo-50/50 text-right text-xs"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-bold text-indigo-500">
                        Gal
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-200 text-[11px] text-blue-900 flex items-center justify-between gap-2">
                  <span>
                    💡 <strong>Fórmula aplicada:</strong> Asume un rendimiento estándar de{' '}
                    <strong className="font-bold">35 m² por galón a dos manos</strong> ({sumaMedidaM2Areas} m² ÷ 35 ={' '}
                    {Math.round((sumaMedidaM2Areas / 35) * 10) / 10} Gal). El valor es{' '}
                    <strong className="underline">editable</strong> si requieres más o menos manos.
                  </span>
                  {isGalonesManuallyEdited && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsGalonesManuallyEdited(false);
                        const c = Math.round((sumaMedidaM2Areas / 35) * 10) / 10;
                        setGalonesEstimados(c || 1);
                      }}
                      className="text-indigo-700 hover:text-indigo-900 font-bold underline whitespace-nowrap cursor-pointer text-[10px]"
                    >
                      Recalcular a 35 m²/gal
                    </button>
                  )}
                </div>
              </div>

              {/* Botones Paso 3 */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-2.5 text-slate-600 hover:text-slate-800 text-xs font-semibold rounded-xl hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Volver al Proyecto</span>
                </button>

                <button
                  type="submit"
                  disabled={isProcessingSpec}
                  className="px-5 py-2.5 bg-[#142154] hover:bg-[#1a2b6d] text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-95"
                >
                  {isProcessingSpec ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Guardando Diagnóstico en Supabase...</span>
                    </>
                  ) : (
                    <>
                      <span>Continuar a la Cotización</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* =========================================================================
              PASO 4: COTIZACIÓN (COTIZACION_DETALLE y PRODUCTO)
              ========================================================================= */}
          {currentStep === 4 && projectResult && (
            <form onSubmit={handleSubmitCotizacion} className="space-y-5">
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-extrabold text-emerald-950">
                      Paso 4: Cotización de Productos (Tabla COTIZACION_DETALLE)
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800 mt-0.5 ml-6">
                    Proyecto #{projectResult.proyectoId} • Necesidad técnica estimada:{' '}
                    <strong>{galonesEstimados} Galones</strong> de pintura.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddCotizacionLine}
                  className="px-3 py-1.5 bg-[#2FAE6D] hover:bg-[#27995f] text-white rounded-xl text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition-all shadow-xs active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar Producto</span>
                </button>
              </div>

              {/* Tabla de Productos de la Cotización */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold">
                    <tr>
                      <th className="py-2.5 px-3">Producto (de tabla PRODUCTO)</th>
                      <th className="py-2.5 px-3 w-28">Precio Unit.</th>
                      <th className="py-2.5 px-3 w-28">Cantidad</th>
                      <th className="py-2.5 px-3 w-32 text-right">Subtotal</th>
                      <th className="py-2.5 px-2 w-10 text-center"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {cotizacionLines.map((line, idx) => {
                      const selectedProd = availableProducts.find(
                        (p) => p.ID_DE_PRODUCTO === Number(line.ID_de_producto)
                      );
                      const unitPrice = selectedProd ? getProdPrecio(selectedProd) : 0;
                      const cant = Number(line.Cantidad_requerida) || 0;
                      const subtotal = cant * unitPrice;

                      return (
                        <tr key={line.id} className="hover:bg-slate-50/50">
                          {/* Producto select */}
                          <td className="py-3 px-3">
                            <select
                              value={line.ID_de_producto}
                              onChange={(e) =>
                                handleUpdateCotizacionLine(line.id, 'ID_de_producto', Number(e.target.value))
                              }
                              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                            >
                              {availableProducts.map((p) => (
                                <option key={p.ID_DE_PRODUCTO} value={p.ID_DE_PRODUCTO}>
                                  {getProdNombre(p)} ({getProdTipo(p)}) - ${getProdPrecio(p).toLocaleString('es-CO')}
                                </option>
                              ))}
                            </select>
                            {selectedProd && (
                              <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-2">
                                <span>ID_de_producto: {selectedProd.ID_DE_PRODUCTO}</span>
                                <span>•</span>
                                <span>Tipo: {getProdTipo(selectedProd)}</span>
                                <span>•</span>
                                <span>Unidad: {selectedProd.Unidad_medida || 'Galón'}</span>
                              </div>
                            )}
                          </td>

                          {/* Precio unitario */}
                          <td className="py-3 px-3 font-mono font-semibold text-slate-700">
                            ${unitPrice.toLocaleString('es-CO')}
                          </td>

                          {/* Cantidad requerida */}
                          <td className="py-3 px-3">
                            <input
                              type="number"
                              min={1}
                              value={line.Cantidad_requerida}
                              onChange={(e) =>
                                handleUpdateCotizacionLine(line.id, 'Cantidad_requerida', e.target.value)
                              }
                              className="w-20 px-2.5 py-1.5 rounded-lg border border-slate-300 font-mono font-bold text-slate-900 text-xs text-center"
                            />
                          </td>

                          {/* Subtotal de costo */}
                          <td className="py-3 px-3 text-right font-mono font-black text-emerald-700">
                            ${subtotal.toLocaleString('es-CO')} COP
                          </td>

                          {/* Eliminar */}
                          <td className="py-3 px-2 text-center">
                            {cotizacionLines.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveCotizacionLine(line.id)}
                                className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 cursor-pointer"
                                title="Eliminar ítem"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Total de la Cotización */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-slate-50 to-emerald-50 border-2 border-emerald-300/80 flex items-center justify-between text-xs shadow-xs">
                <div>
                  <span className="font-black text-slate-900 text-sm block">Total General de la Cotización:</span>
                  <span className="text-[11px] text-slate-500">
                    Suma de cada fila: Subtotal_de_costo = Cantidad_requerida × Precio_unitario
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xl sm:text-2xl font-black text-emerald-700 font-mono block">
                    ${totalCotizacionCalculado.toLocaleString('es-CO')} COP
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {cotizacionLines.length} {cotizacionLines.length === 1 ? 'producto' : 'productos'} en la lista
                  </span>
                </div>
              </div>

              {/* Botones Paso 4 */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-4 py-2.5 text-slate-600 hover:text-slate-800 text-xs font-semibold rounded-xl hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Volver a Áreas</span>
                </button>

                <button
                  type="submit"
                  disabled={isProcessingCotizacion}
                  className="px-6 py-2.5 bg-[#2FAE6D] hover:bg-[#27995f] text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md hover:shadow-lg transition-all active:scale-95"
                >
                  {isProcessingCotizacion ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Guardando Cotización en Supabase...</span>
                    </>
                  ) : (
                    <>
                      <FileCheck2 className="w-4 h-4" />
                      <span>Guardar Cotización y Finalizar</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* =========================================================================
              PASO 5: RESUMEN Y ÉXITO TOTAL (SIN CUADRO AMARILLO DE IDs)
              ========================================================================= */}
          {currentStep === 5 && projectResult && clientResult && (
            <div className="space-y-5 animate-in fade-in zoom-in-95 duration-300">
              {/* Headline */}
              <div className="text-center py-2">
                <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner mb-3 border border-emerald-200">
                  <CheckCircle2 className="w-9 h-9 text-emerald-600" />
                </div>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>¡Solicitud y Cotización Registradas en Supabase!</span>
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  Cadena de Proyecto Creada con Éxito
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Se insertaron y vincularon los registros en USUARIO, PROYECTO, ESPECIFICACION_TECNICA, AREA y COTIZACION_DETALLE.
                </p>
              </div>

              {/* Big Highlight: Proyecto_ID y Total Cotizado */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#142154] to-[#1e347e] text-white shadow-lg">
                  <span className="text-[11px] font-mono text-emerald-300 font-bold uppercase tracking-wider block">
                    ID Generado en tabla PROYECTO
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xs text-slate-300">Proyecto_ID:</span>
                    <span className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono">
                      #{projectResult.proyectoId}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-slate-300 flex items-center justify-between border-t border-white/10 pt-2">
                    <span>Usuario_ID: <strong className="text-white font-mono">#{clientResult.usuarioId}</strong></span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-white">
                      Estado: Nuevo
                    </span>
                  </div>
                </div>

                <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-emerald-700 to-emerald-900 text-white shadow-lg flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-emerald-200 font-bold uppercase tracking-wider block">
                      Total Guardado en COTIZACION_DETALLE
                    </span>
                    <div className="text-2xl sm:text-3xl font-black text-white font-mono mt-1">
                      ${totalCotizacionCalculado.toLocaleString('es-CO')} COP
                    </div>
                  </div>
                  <div className="text-xs text-emerald-100 flex items-center justify-between border-t border-emerald-600/50 pt-2 mt-2">
                    <span>Ítems cotizados: <strong>{cotizacionLines.length}</strong></span>
                    <span>Pintura: <strong>{galonesEstimados} Gal</strong></span>
                  </div>
                </div>
              </div>

              {/* Resumen Detallado */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-3">
                <h4 className="font-bold text-slate-900 border-b border-slate-200 pb-2">
                  Detalle de la Solicitud Guardada
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Cliente / Solicitante:</span>
                    <span className="font-bold text-slate-900">{nombre}</span>
                    <span className="text-slate-500 text-[11px] block">Identificación: {identificacion} ({tipoCliente})</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Ubicación y Tipo:</span>
                    <span className="font-bold text-slate-900">{ciudad} • {tipoProyecto}</span>
                    <span className="text-slate-500 text-[11px] block">Fecha Requerida: {fechaRequerida}</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Especificación Técnica:</span>
                    <span className="font-bold text-slate-900">{tipoSuperficie} • {ambiente}</span>
                    <span className="text-slate-500 text-[11px] block">
                      Color: {color} | Condición: {condicion}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Áreas ({sumaMedidaM2Areas} m² en total):</span>
                    <div className="space-y-0.5 mt-0.5">
                      {areas.map((a, i) => (
                        <span key={a.id} className="inline-block mr-2 text-[11px] text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                          {a.Descripcion}: <strong>{a.Medida_m2} m²</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Resumen de Cotización */}
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-400 block text-[11px] mb-1">Productos Cotizados en COTIZACION_DETALLE:</span>
                  <div className="space-y-1">
                    {cotizacionLines.map((line) => {
                      const prod = availableProducts.find((p) => p.ID_DE_PRODUCTO === Number(line.ID_de_producto));
                      const unit = prod ? getProdPrecio(prod) : 0;
                      const sub = Number(line.Cantidad_requerida) * unit;
                      return (
                        <div key={line.id} className="flex justify-between items-center text-[11px] bg-white p-2 rounded-xl border border-slate-200/80">
                          <span className="font-medium text-slate-800">
                            {prod ? getProdNombre(prod) : `Producto #${line.ID_de_producto}`} × {line.Cantidad_requerida} {prod?.Unidad_medida || 'Gal'}
                          </span>
                          <span className="font-mono font-bold text-emerald-700">
                            ${sub.toLocaleString('es-CO')} COP
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Botones de Cierre */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleResetAll}
                  className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Crear Otra Solicitud
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRequestModalOpen(false);
                      const el = document.getElementById('supabase-products-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full sm:w-auto px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-indigo-200"
                  >
                    Ver Tabla PRODUCTO
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsRequestModalOpen(false)}
                    className="w-full sm:w-auto px-6 py-2.5 bg-[#142154] hover:bg-[#1a2b6d] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-md"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
