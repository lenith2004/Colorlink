import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Building2,
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
  Check,
  Plus,
  Trash2,
  Palette,
  Calculator,
  ShoppingCart,
  DollarSign,
  Package,
  ShieldCheck,
  Copy,
  FileText,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  supabase,
  procesarClienteEnSupabase,
  crearProyectoEnSupabase,
  guardarEspecificacionTecnicaYAreasEnSupabase,
  guardarCotizacionDetalleEnSupabase,
  updateEstadoProyectoEnSupabase,
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
    addToCart,
    setIsCartOpen,
    products: catalogProducts,
  } = useApp();

  // NUEVO FLUJO SIN BARRERA DE REGISTRO PREVIO:
  // Paso 1: Diagnóstico Técnico, Áreas y m² (Cálculo instantáneo de galones)
  // Paso 2: Selección de Productos & Costos en Vivo (Precios unitarios, subtotal e IVA)
  // Paso 3: Resumen de Cotización & Acciones (Añadir al Carrito, Proceder a Compra, Copiar, o Guardar en Supabase)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // --------------------------------------------------------------------------
  // DATOS DEL PROYECTO & ÁREAS (PASO 1)
  // --------------------------------------------------------------------------
  const [ciudad, setCiudad] = useState<string>(selectedCity || 'Bogotá D.C.');
  const [tipoProyecto, setTipoProyecto] = useState<string>('Residencial');
  const [tipoSuperficie, setTipoSuperficie] = useState<string>('Mampostería / Muros');
  const [ambiente, setAmbiente] = useState<string>('Interior');
  const [condicion, setCondicion] = useState<string>('Buena (Repinte Estándar)');
  const [color, setColor] = useState<string>('Blanco Almendra');
  const [fechaRequerida, setFechaRequerida] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 15);
    return d.toISOString().split('T')[0];
  });

  const [areas, setAreas] = useState<AreaRowState[]>([
    { id: 'area-1', Descripcion: 'Muros Sala y Comedor', Medida_m2: 85 },
    { id: 'area-2', Descripcion: 'Habitaciones y Pasillos', Medida_m2: 45 },
  ]);
  const [galonesEstimados, setGalonesEstimados] = useState<number | string>(4);
  const [isGalonesManuallyEdited, setIsGalonesManuallyEdited] = useState<boolean>(false);

  // --------------------------------------------------------------------------
  // PRODUCTOS Y COTIZACIÓN (PASO 2)
  // --------------------------------------------------------------------------
  const [availableProducts, setAvailableProducts] = useState<SupabaseProductItem[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(false);
  const [cotizacionLines, setCotizacionLines] = useState<CotizacionRowState[]>([]);

  // --------------------------------------------------------------------------
  // ACCIONES Y RESULTADOS (PASO 3)
  // --------------------------------------------------------------------------
  const [quotationCode, setQuotationCode] = useState<string>(() => `COT-${Math.floor(100000 + Math.random() * 900000)}`);
  const [copiedSuccess, setCopiedSuccess] = useState<boolean>(false);
  const [cartAddedSuccess, setCartAddedSuccess] = useState<boolean>(false);

  // Opcional: Registro formal en Supabase
  const [isSavingToSupabase, setIsSavingToSupabase] = useState<boolean>(false);
  const [supabaseSaveSuccess, setSupabaseSaveSuccess] = useState<string | null>(null);
  const [optionalClientName, setOptionalClientName] = useState<string>(currentUser?.name || '');
  const [optionalClientDoc, setOptionalClientDoc] = useState<string>(currentUser?.docNumber || '');
  const [optionalClientEmail, setOptionalClientEmail] = useState<string>(currentUser?.email || '');
  const [optionalClientPhone, setOptionalClientPhone] = useState<string>(currentUser?.phone || '');

  // Errores
  const [screenError, setScreenError] = useState<{
    step: string;
    message: string;
    details?: string;
  } | null>(null);

  // Sincronizar ciudad y datos si el usuario ya está logueado
  useEffect(() => {
    if (isRequestModalOpen) {
      if (selectedCity) setCiudad(selectedCity);
      if (isLoggedIn && currentUser) {
        if (!optionalClientName) setOptionalClientName(currentUser.name || '');
        if (!optionalClientDoc) setOptionalClientDoc(currentUser.docNumber || '');
        if (!optionalClientEmail) setOptionalClientEmail(currentUser.email || '');
        if (!optionalClientPhone && currentUser.phone) setOptionalClientPhone(currentUser.phone);
      }
    }
  }, [isRequestModalOpen, currentUser, isLoggedIn, selectedCity]);

  // Consultar productos de la tabla PRODUCTO en Supabase
  useEffect(() => {
    if (isRequestModalOpen) {
      const loadProducts = async () => {
        setIsLoadingProducts(true);
        try {
          const [prodRes, invRes] = await Promise.all([
            supabase.from('PRODUCTO').select('*'),
            supabase.from('INVENTARIO').select('*'),
          ]);

          let prods: SupabaseProductItem[] = [];
          if (!prodRes.error && prodRes.data && prodRes.data.length > 0) {
            prods = prodRes.data;
          } else {
            // Fallback con los productos de catálogo si la tabla estuviese vacía
            prods = catalogProducts.map((p, idx) => ({
              ID_DE_PRODUCTO: idx + 1,
              Nombre_producto: p.name,
              Precio_unitario: p.pricePerGallonCOP,
              Tipo_producto: p.category,
              Unidad_medida: 'Galón',
              SKU: p.code,
            }));
          }

          setAvailableProducts(prods);
          if (!invRes.error && invRes.data) {
            setInventoryItems(invRes.data);
          }
        } catch (e) {
          console.warn('[Error cargando productos]', e);
        } finally {
          setIsLoadingProducts(false);
        }
      };
      loadProducts();
    }
  }, [isRequestModalOpen, catalogProducts]);

  // Cálculo de m² totales (suma de áreas)
  const sumaMedidaM2Areas = useMemo(() => {
    return areas.reduce((sum, a) => {
      const val = Number(a.Medida_m2);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);
  }, [areas]);

  // Actualizar galones estimados automáticamente (35 m² por galón a 2 manos)
  useEffect(() => {
    if (!isGalonesManuallyEdited) {
      if (sumaMedidaM2Areas > 0) {
        const calc = Math.round((sumaMedidaM2Areas / 35) * 10) / 10;
        setGalonesEstimados(calc || 1);
      } else {
        setGalonesEstimados(0);
      }
    }
  }, [sumaMedidaM2Areas, isGalonesManuallyEdited]);

  // Inicializar líneas de cotización con la cantidad de galones estimados
  useEffect(() => {
    if (currentStep >= 2 && cotizacionLines.length === 0 && availableProducts.length > 0) {
      const defaultProdId = availableProducts[0].ID_DE_PRODUCTO;
      const cant = Math.ceil(Number(galonesEstimados) || 1);
      setCotizacionLines([
        {
          id: `cot-line-${Date.now()}`,
          ID_de_producto: defaultProdId,
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

  // Cálculo financiero en tiempo real
  const subtotalCOP = cotizacionLines.reduce((acc, line) => {
    const prod = availableProducts.find((p) => p.ID_DE_PRODUCTO === Number(line.ID_de_producto));
    const precio = prod ? getProdPrecio(prod) : 0;
    const cant = Number(line.Cantidad_requerida) || 0;
    return acc + precio * cant;
  }, 0);

  const ivaCOP = Math.round(subtotalCOP * 0.19);
  const totalCotizacionCOP = subtotalCOP + ivaCOP;

  // Acciones de áreas
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

  // Acciones de líneas de cotización
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

  // Añadir la cotización completa al carrito
  const handleAddQuoteToCart = (openCartDirectly: boolean = false) => {
    cotizacionLines.forEach((line) => {
      const prod = availableProducts.find((p) => p.ID_DE_PRODUCTO === Number(line.ID_de_producto));
      const cant = Number(line.Cantidad_requerida) || 1;
      const precio = prod ? getProdPrecio(prod) : 94900;
      const nombreProd = prod ? getProdNombre(prod) : 'Pintura Pintuco Oficial';

      addToCart({
        sku: prod?.SKU || `PIN-${line.ID_de_producto}`,
        name: nombreProd,
        category: prod ? getProdTipo(prod) : 'Arquitectónica',
        colorName: color,
        presentation: 'Galón',
        pricePerUnitCOP: precio,
        quantity: cant,
      });
    });

    setCartAddedSuccess(true);
    if (openCartDirectly) {
      setIsRequestModalOpen(false);
      setIsCartOpen(true);
    } else {
      setTimeout(() => setCartAddedSuccess(false), 4000);
    }
  };

  // Copiar resumen al portapapeles
  const handleCopySummary = () => {
    const linesSummary = cotizacionLines
      .map((l) => {
        const prod = availableProducts.find((p) => p.ID_DE_PRODUCTO === Number(l.ID_de_producto));
        const nombreProd = prod ? getProdNombre(prod) : `Producto #${l.ID_de_producto}`;
        const precio = prod ? getProdPrecio(prod) : 0;
        const cant = Number(l.Cantidad_requerida) || 1;
        return `• ${cant}x ${nombreProd} (Galón) - $${(precio * cant).toLocaleString('es-CO')} COP`;
      })
      .join('\n');

    const text =
      `📋 *COTIZACIÓN DE PROYECTO - PINTUCO COLORLINK*\n` +
      `Código: ${quotationCode}\n` +
      `Proyecto: ${tipoProyecto} en ${ciudad}\n` +
      `Área Total: ${sumaMedidaM2Areas} m² (${galonesEstimados} Gal estimados)\n` +
      `Superficie: ${tipoSuperficie} • Color: ${color}\n\n` +
      `*DETALLE DE PRODUCTOS:*\n${linesSummary}\n\n` +
      `*Subtotal:* $${subtotalCOP.toLocaleString('es-CO')} COP\n` +
      `*IVA (19%):* $${ivaCOP.toLocaleString('es-CO')} COP\n` +
      `*TOTAL COTIZADO:* $${totalCotizacionCOP.toLocaleString('es-CO')} COP\n\n` +
      `_Cotización generada de forma libre en el portal oficial Pintuco ColorLink._`;

    navigator.clipboard.writeText(text);
    setCopiedSuccess(true);
    setTimeout(() => setCopiedSuccess(false), 3000);
  };

  // Opcional: Guardar en Supabase para usuarios que quieran registrarlo
  const handleOptionalSaveSupabase = async () => {
    if (!optionalClientName.trim() || !optionalClientDoc.trim()) {
      setScreenError({
        step: 'REGISTRO_OPCIONAL',
        message: 'Para guardar en la base de datos, ingresa Nombre y Documento.',
      });
      return;
    }

    setIsSavingToSupabase(true);
    setScreenError(null);
    try {
      // 1. Guardar o verificar usuario
      const clientRes = await procesarClienteEnSupabase({
        nombre: optionalClientName.trim(),
        identificacion: optionalClientDoc.trim(),
        correo: optionalClientEmail.trim() || `cliente.${optionalClientDoc.trim()}@colorlink.pintuco.com`,
        telefono: optionalClientPhone.trim() || '+57 300 000 0000',
        tipo_cliente: 'Cliente Web',
      });

      // 2. Crear proyecto
      const projRes = await crearProyectoEnSupabase({
        Ciudad: ciudad.trim(),
        Tipo_proyecto: tipoProyecto.trim(),
        Area_m2: Number(sumaMedidaM2Areas) || 1,
        Fecha_requerida: fechaRequerida,
        Usuario_ID: clientRes.usuarioId,
        Estado_proyecto: 'En cotización',
      });

      // 3. Especificación técnica y áreas
      await guardarEspecificacionTecnicaYAreasEnSupabase({
        Proyecto_ID: projRes.proyectoId,
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

      // 4. Cotización detalle
      const itemsPayload = cotizacionLines.map((line) => {
        const prod = availableProducts.find((p) => p.ID_DE_PRODUCTO === Number(line.ID_de_producto));
        const precioUnitario = prod ? getProdPrecio(prod) : 0;
        const cant = Number(line.Cantidad_requerida) || 1;
        return {
          ID_de_producto: Number(line.ID_de_producto),
          Cantidad_requerida: cant,
          Subtotal_de_costo: cant * precioUnitario,
          Nombre_producto: prod ? getProdNombre(prod) : undefined,
          Precio_unitario: precioUnitario,
        };
      });

      await guardarCotizacionDetalleEnSupabase({
        Proyecto_ID: projRes.proyectoId,
        items: itemsPayload,
      });

      setSupabaseSaveSuccess(`✓ Proyecto registrado exitosamente en Supabase (Proyecto #${projRes.proyectoId})`);
      refreshFromSupabase();
    } catch (err: any) {
      setScreenError({
        step: 'SUPABASE_SAVE',
        message: err?.message || 'Error guardando en Supabase',
      });
    } finally {
      setIsSavingToSupabase(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 text-left">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 relative">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#142154] via-[#1B2A6B] to-[#142154] text-white p-5 sm:px-6 flex items-center justify-between shrink-0 border-b border-[#1f3074]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#2FAE6D] text-white flex items-center justify-center shadow-md shrink-0">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-black text-white">
                  Cotizador de Proyectos & Pinturas
                </h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-0.5 rounded-full border border-emerald-400/40">
                  Acceso Libre • Sin Registro
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Calcula tus metros cuadrados, galones requeridos y presupuesto en tiempo real.
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsRequestModalOpen(false)}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Bar (3 Pasos Directos) */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 py-2.5 flex items-center justify-between overflow-x-auto text-[11px]">
          {[
            { num: 1, label: '1. Diagnóstico & m²', sub: 'Medidas & Superficies' },
            { num: 2, label: '2. Selección de Pinturas', sub: 'Productos & Costos' },
            { num: 3, label: '3. Resumen & Carrito', sub: 'Cotización Inmediata' },
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
                  <div>
                    <span className={`block leading-tight font-bold ${isCurrent ? 'text-indigo-950' : 'text-slate-700'}`}>
                      {s.label}
                    </span>
                    <span className="text-[9px] text-slate-400 block">{s.sub}</span>
                  </div>
                </div>
                {idx < arr.length - 1 && (
                  <div
                    className={`flex-1 min-w-4 h-0.5 mx-2 transition-colors ${
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
          {/* Notification: Added to Cart */}
          {cartAddedSuccess && (
            <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>¡Cotización agregada al carrito con éxito!</strong> Puedes proceder al pago cuando desees.</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsRequestModalOpen(false);
                  setIsCartOpen(true);
                }}
                className="px-3 py-1 bg-[#2FAE6D] hover:bg-[#27995f] text-white font-bold rounded-lg text-[11px] shrink-0 cursor-pointer"
              >
                Abrir Carrito
              </button>
            </div>
          )}

          {/* Error Banner */}
          {screenError && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="font-bold">{screenError.step}: </span>
                <span>{screenError.message}</span>
              </div>
              <button onClick={() => setScreenError(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* =========================================================================
              PASO 1: DIAGNÓSTICO TÉCNICO & ÁREAS (m² Y GALONES ESTIMADOS)
              ========================================================================= */}
          {currentStep === 1 && (
            <div className="space-y-5 text-xs text-slate-800">
              {/* Info banner */}
              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <h4 className="font-bold text-blue-950">
                      Calculadora de Pintura por Metros Cuadrados
                    </h4>
                    <p className="text-[11px] text-blue-800">
                      Ingresa tus áreas y el sistema calculará automáticamente los galones según la norma oficial de 35 m²/gal a 2 manos.
                    </p>
                  </div>
                </div>
              </div>

              {/* General Project Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Ciudad del Proyecto
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={ciudad}
                      onChange={(e) => setCiudad(e.target.value)}
                      placeholder="Ej. Bogotá D.C., Medellín..."
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 bg-white font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tipo de Proyecto
                  </label>
                  <select
                    value={tipoProyecto}
                    onChange={(e) => setTipoProyecto(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white font-medium cursor-pointer"
                  >
                    <option value="Residencial">Residencial (Apartamento / Casa)</option>
                    <option value="Comercial">Comercial (Local / Oficina)</option>
                    <option value="Institucional">Institucional (Colegio / Clínica)</option>
                    <option value="Industrial">Industrial (Bodega / Planta)</option>
                  </select>
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tipo de Superficie</label>
                  <select
                    value={tipoSuperficie}
                    onChange={(e) => setTipoSuperficie(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 bg-white cursor-pointer"
                  >
                    <option value="Mampostería / Muros">Mampostería / Muros</option>
                    <option value="Drywall / Yeso">Drywall / Yeso</option>
                    <option value="Fachada Exterior">Fachada Exterior</option>
                    <option value="Pisos / Alto Tráfico">Pisos / Alto Tráfico</option>
                    <option value="Madera Natural">Madera Natural</option>
                    <option value="Metal / Estructura Acero">Metal / Estructura Acero</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Ambiente</label>
                  <select
                    value={ambiente}
                    onChange={(e) => setAmbiente(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 bg-white cursor-pointer"
                  >
                    <option value="Interior">Interior</option>
                    <option value="Exterior">Exterior</option>
                    <option value="Zona Húmeda / Baños">Zona Húmeda / Baños</option>
                    <option value="Tráfico Pesado">Tráfico Pesado</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Condición del Muro</label>
                  <select
                    value={condicion}
                    onChange={(e) => setCondicion(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 bg-white cursor-pointer"
                  >
                    <option value="Buena (Repinte Estándar)">Buena (Repinte Estándar)</option>
                    <option value="Nueva (Obra Gris / Pañete)">Nueva (Obra Gris / Pañete)</option>
                    <option value="Con Humedad o Salitre">Con Humedad o Salitre</option>
                    <option value="Con Fisuras o Desprendimiento">Con Fisuras</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Color Deseado</label>
                  <div className="relative">
                    <Palette className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      placeholder="Ej. Blanco Almendra"
                      className="w-full pl-8 pr-2.5 py-2 rounded-xl border border-slate-300 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Áreas Dinámicas (m²) */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-slate-900 flex items-center gap-1.5 uppercase tracking-wide">
                      <Layers className="w-4 h-4 text-indigo-600" />
                      <span>Áreas o Estancias a Pintar</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Especifica las medidas de tus paredes (ej. ancho × alto).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddArea}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar Área</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {areas.map((area, idx) => (
                    <div
                      key={area.id}
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200"
                    >
                      <span className="w-5 text-center text-slate-400 font-mono font-bold text-[11px]">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={area.Descripcion}
                        onChange={(e) => handleUpdateArea(area.id, 'Descripcion', e.target.value)}
                        placeholder="Descripción (ej. Sala, Cuarto principal...)"
                        className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50/50"
                      />
                      <div className="flex items-center gap-1 w-28 shrink-0">
                        <input
                          type="number"
                          min="1"
                          step="0.5"
                          value={area.Medida_m2}
                          onChange={(e) => handleUpdateArea(area.id, 'Medida_m2', e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50/50 text-right font-mono font-bold"
                        />
                        <span className="text-slate-500 font-bold text-[11px]">m²</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveArea(area.id)}
                        disabled={areas.length <= 1}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg disabled:opacity-30 cursor-pointer"
                        title="Eliminar área"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Resumen de Cálculo en vivo */}
                <div className="p-3 bg-indigo-50/80 rounded-xl border border-indigo-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-slate-600">Área Total Calculada: </span>
                    <strong className="text-indigo-950 font-black text-sm">{sumaMedidaM2Areas} m²</strong>
                    <span className="text-slate-500 text-[11px] ml-2">(Rendimiento oficial: 35 m²/gal a 2 manos)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700">Pintura Necesaria:</span>
                    <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-indigo-300">
                      <input
                        type="number"
                        min="0.5"
                        step="0.5"
                        value={galonesEstimados}
                        onChange={(e) => {
                          setIsGalonesManuallyEdited(true);
                          setGalonesEstimados(e.target.value);
                        }}
                        className="w-16 text-right font-black text-indigo-900 font-mono text-xs outline-hidden"
                      />
                      <span className="font-black text-indigo-900 text-xs">Gal</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botón de Siguiente Paso */}
              <div className="pt-3 border-t border-slate-200 flex justify-end">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-3 bg-[#142154] hover:bg-[#1a2b6d] text-white rounded-xl font-extrabold text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-95"
                >
                  <span>Continuar a Selección de Pinturas & Precios</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
              PASO 2: SELECCIÓN DE PRODUCTOS & COSTOS EN VIVO
              ========================================================================= */}
          {currentStep === 2 && (
            <div className="space-y-5 text-xs text-slate-800">
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200 flex items-center justify-between gap-2">
                <div>
                  <h4 className="font-bold text-indigo-950">
                    Paso 2: Productos Homologados & Cantidades en Galones
                  </h4>
                  <p className="text-[11px] text-indigo-800">
                    Total área: <strong>{sumaMedidaM2Areas} m²</strong> • Galones sugeridos: <strong>{galonesEstimados} Gal</strong> • Tono: <strong>{color}</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddCotizacionLine}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Agregar Producto</span>
                </button>
              </div>

              {/* Tabla de Productos seleccionados */}
              <div className="space-y-2.5">
                {cotizacionLines.map((line, idx) => {
                  const prod = availableProducts.find((p) => p.ID_DE_PRODUCTO === Number(line.ID_de_producto));
                  const precio = prod ? getProdPrecio(prod) : 0;
                  const cant = Number(line.Cantidad_requerida) || 1;
                  const lineSubtotal = precio * cant;

                  return (
                    <div
                      key={line.id}
                      className="p-3.5 rounded-2xl bg-white border border-slate-200 space-y-2.5 shadow-2xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-slate-500 text-[11px]">Línea #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCotizacionLine(line.id)}
                          disabled={cotizacionLines.length <= 1}
                          className="text-slate-400 hover:text-rose-600 p-1 disabled:opacity-30 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                        <div className="sm:col-span-7">
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">
                            Pintura / Recubrimiento Pintuco
                          </label>
                          <select
                            value={line.ID_de_producto}
                            onChange={(e) =>
                              handleUpdateCotizacionLine(line.id, 'ID_de_producto', Number(e.target.value))
                            }
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium cursor-pointer"
                          >
                            {availableProducts.map((p) => (
                              <option key={p.ID_DE_PRODUCTO} value={p.ID_DE_PRODUCTO}>
                                {getProdNombre(p)} — ${getProdPrecio(p).toLocaleString('es-CO')} COP / Gal
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-[10px] font-bold text-slate-500 mb-1">
                            Cantidad (Gal)
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={line.Cantidad_requerida}
                            onChange={(e) =>
                              handleUpdateCotizacionLine(line.id, 'Cantidad_requerida', e.target.value)
                            }
                            className="w-full px-2.5 py-2 rounded-xl border border-slate-300 bg-white font-mono font-bold text-center"
                          />
                        </div>

                        <div className="sm:col-span-3 text-right">
                          <span className="block text-[10px] font-bold text-slate-500 mb-1">
                            Subtotal Línea
                          </span>
                          <span className="font-mono font-black text-sm text-slate-900">
                            ${lineSubtotal.toLocaleString('es-CO')} <span className="text-[10px] text-slate-400">COP</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total Card */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-mono font-bold">${subtotalCOP.toLocaleString('es-CO')} COP</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>IVA Estimado (19%):</span>
                  <span className="font-mono font-bold">${ivaCOP.toLocaleString('es-CO')} COP</span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total Cotizado:</span>
                  <span className="text-[#2FAE6D] font-mono">${totalCotizacionCOP.toLocaleString('es-CO')} COP</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2.5 text-slate-600 hover:text-slate-800 text-xs font-semibold rounded-xl hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Modificar Áreas</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-6 py-3 bg-[#142154] hover:bg-[#1a2b6d] text-white rounded-xl font-extrabold text-xs flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-95"
                >
                  <span>Ver Resumen & Acciones</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* =========================================================================
              PASO 3: RESUMEN DE COTIZACIÓN & ACCIONES
              ========================================================================= */}
          {currentStep === 3 && (
            <div className="space-y-5 text-xs text-slate-800">
              {/* Success Badge */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#2FAE6D] text-white flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6 stroke-3" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-slate-900">
                      ¡Tu Cotización Está Lista!
                    </h3>
                    <p className="text-[11px] text-slate-600">
                      Presupuesto calculado al 100% sin necesidad de registro ni inicio de sesión.
                    </p>
                  </div>
                </div>
                <span className="font-mono font-black text-xs text-[#1B2A6B] bg-white px-3 py-1 rounded-xl border border-indigo-200">
                  {quotationCode}
                </span>
              </div>

              {/* Breakdown Card */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="p-2 bg-white rounded-xl border border-slate-200">
                    <span className="text-slate-400 block font-bold text-[10px]">Ciudad:</span>
                    <strong className="text-slate-800">{ciudad}</strong>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-slate-200">
                    <span className="text-slate-400 block font-bold text-[10px]">Área Total:</span>
                    <strong className="text-slate-800">{sumaMedidaM2Areas} m²</strong>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-slate-200">
                    <span className="text-slate-400 block font-bold text-[10px]">Pintura Estimada:</span>
                    <strong className="text-indigo-950">{galonesEstimados} Gal</strong>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-slate-200">
                    <span className="text-slate-400 block font-bold text-[10px]">Tono Deseado:</span>
                    <strong className="text-slate-800">{color}</strong>
                  </div>
                </div>

                {/* Items */}
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1.5">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 block tracking-wider">
                    Pinturas Cotizadas:
                  </span>
                  {cotizacionLines.map((l) => {
                    const prod = availableProducts.find((p) => p.ID_DE_PRODUCTO === Number(l.ID_de_producto));
                    const nombreProd = prod ? getProdNombre(prod) : `Producto #${l.ID_de_producto}`;
                    const precio = prod ? getProdPrecio(prod) : 0;
                    const cant = Number(l.Cantidad_requerida) || 1;
                    return (
                      <div key={l.id} className="flex justify-between items-center py-1 border-b border-slate-100 last:border-b-0 text-xs">
                        <span className="text-slate-800 font-medium">
                          {cant}x {nombreProd} (Galón, Tono: {color})
                        </span>
                        <span className="font-mono font-bold text-slate-900">
                          ${(precio * cant).toLocaleString('es-CO')} COP
                        </span>
                      </div>
                    );
                  })}
                  <div className="flex justify-between items-center pt-2 text-sm font-black text-slate-900">
                    <span>Total Presupuestado (IVA Inc.):</span>
                    <span className="text-[#2FAE6D] font-mono">${totalCotizacionCOP.toLocaleString('es-CO')} COP</span>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS (DIRECT ACCESS & PURCHASE) */}
              <div className="space-y-2.5 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Action 1: Add to cart and continue browsing */}
                  <button
                    type="button"
                    onClick={() => handleAddQuoteToCart(false)}
                    className="py-3 px-4 bg-indigo-50 hover:bg-indigo-100 text-[#1B2A6B] border border-indigo-200 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98"
                  >
                    <ShoppingCart className="w-4 h-4 text-indigo-600" />
                    <span>Añadir al Carrito</span>
                  </button>

                  {/* Action 2: Add and go to checkout (purchase gate) */}
                  <button
                    type="button"
                    onClick={() => handleAddQuoteToCart(true)}
                    className="py-3 px-4 bg-[#2FAE6D] hover:bg-[#27995f] text-white rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg cursor-pointer transition-all active:scale-98"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>Completar Compra de esta Cotización</span>
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleCopySummary}
                    className="px-3.5 py-2 text-slate-600 hover:text-slate-900 text-xs font-semibold rounded-xl hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer border border-slate-200"
                  >
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>{copiedSuccess ? '✓ Copiado al portapapeles' : 'Copiar Resumen'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="px-3.5 py-2 text-slate-600 hover:text-slate-900 text-xs font-semibold rounded-xl hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Ajustar Cantidades</span>
                  </button>
                </div>
              </div>

              {/* Opcional: Guardado Formal en Supabase */}
              <div className="pt-3 border-t border-slate-200">
                <details className="group rounded-2xl bg-slate-50 border border-slate-200 p-3.5 text-xs">
                  <summary className="font-bold text-slate-700 cursor-pointer flex items-center justify-between list-none">
                    <span className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-indigo-600" />
                      <span>¿Deseas registrar este proyecto formalmente en Supabase? (Opcional)</span>
                    </span>
                    <span className="text-[10px] text-indigo-600 font-bold group-open:rotate-180 transition-transform">
                      ▼
                    </span>
                  </summary>

                  <div className="pt-3 space-y-3">
                    <p className="text-[11px] text-slate-500">
                      Si eres contratista o deseas consultar este proyecto después en la tabla de Supabase, puedes ingresar tus datos opcionales a continuación:
                    </p>

                    {supabaseSaveSuccess && (
                      <div className="p-2.5 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-bold">
                        {supabaseSaveSuccess}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Nombre / Empresa</label>
                        <input
                          type="text"
                          value={optionalClientName}
                          onChange={(e) => setOptionalClientName(e.target.value)}
                          placeholder="Tu nombre o empresa"
                          className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Identificación / NIT</label>
                        <input
                          type="text"
                          value={optionalClientDoc}
                          onChange={(e) => setOptionalClientDoc(e.target.value)}
                          placeholder="Cédula o NIT"
                          className="w-full p-2 bg-white border border-slate-300 rounded-xl text-xs"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isSavingToSupabase}
                      onClick={handleOptionalSaveSupabase}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      {isSavingToSupabase ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Guardando en Supabase...</span>
                        </>
                      ) : (
                        <>
                          <Database className="w-3.5 h-3.5" />
                          <span>Guardar en PROYECTO & USUARIO</span>
                        </>
                      )}
                    </button>
                  </div>
                </details>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
