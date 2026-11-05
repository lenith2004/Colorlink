import { createClient } from '@supabase/supabase-js';

// ==============================================================================
// CONFIGURACIÓN DE CONEXIÓN SUPABASE CON SECRETS
// Exponiendo SUPABASE_URL y SUPABASE_ANON_KEY (configurados en vite.config)
// ==============================================================================
const rawSupabaseUrl =
  (typeof process !== 'undefined' && process.env?.SUPABASE_URL) ||
  (import.meta as any).env?.VITE_SUPABASE_URL ||
  'https://ihonjeebbfmusuqtzwlv.supabase.co';

const rawSupabaseKey =
  (typeof process !== 'undefined' && process.env?.SUPABASE_ANON_KEY) ||
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_nBDvKpDhPDgAF6F7Fy4hbw_CxXvqdlF';

export const SUPABASE_URL = rawSupabaseUrl.trim();
export const SUPABASE_ANON_KEY = rawSupabaseKey.trim();

// Exportación del cliente Supabase principal
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ==============================================================================
// TIPADOS ESTRICTOS CON TABLAS Y COLUMNAS EN MAYÚSCULAS
// Tablas: USUARIO, PROYECTO, PRODUCTO, COTIZACION_DETALLE, ESPECIFICACION_TECNICA,
//         AREA, EVIDENCIA, SERVICIO_APLICACION, INVENTARIO
// ==============================================================================

export interface UsuarioRow {
  USUARIO_ID?: number;
  NOMBRE: string;
  IDENTIFICACION: string;
  CORREO: string;
  TELEFONO?: string | null;
  TIPO_CLIENTE: string;
  CREATED_AT?: string;
  UPDATED_AT?: string;
}

export interface ProyectoRow {
  PROYECTO_ID?: number;
  USUARIO_ID: number;
  CIUDAD: string;
  TIPO_PROYECTO: string;
  AREA_M2: number;
  FECHA_REQUERIDA: string;
  ESTADO_PROYECTO: string;
  CREATED_AT?: string;
  UPDATED_AT?: string;
}

export interface EspecificacionTecnicaRow {
  ID_ESPECIFICADO?: number;
  PROYECTO_ID: number;
  TIPO_SUPERFICIE: string;
  AMBIENTE: string;
  CONDICION: string;
  COLOR: string;
  GALONES_ESTIMADOS: number;
  CREATED_AT?: string;
}

export interface AreaRow {
  AREA_ID?: number;
  ID_ESPECIFICADO: number;
  DESCRIPCION: string;
  MEDIDA_M2: number;
  CREATED_AT?: string;
}

export interface ProductoRow {
  ID_DE_PRODUCTO?: number;
  SKU: string;
  NOMBRE_PRODUCTO: string;
  TIPO_PRODUCTO: string;
  UNIDAD_MEDIDA: string;
  PRECIO_UNITARIO: number;
  RENDIMIENTO_M2_GALON: number;
  MANOS_RECOMENDADAS: number;
  CREATED_AT?: string;
}

export interface CotizacionDetalleRow {
  COTIZACION_DETALLE_ID?: number;
  PROYECTO_ID: number;
  ID_DE_PRODUCTO: number;
  CANTIDAD_REQUERIDA: number;
  SUBTOTAL_DE_COSTO: number;
  CREATED_AT?: string;
}

export interface InventarioRow {
  ID_DE_INVENTARIO?: number;
  ID_DE_PRODUCTO: number;
  CENTRO_DISTRIBUCION: string;
  STOCK_DISPONIBLE: number;
  LOTE?: string | null;
  UPDATED_AT?: string;
}

export interface ServicioAplicacionRow {
  SERVICIOS_ID?: number;
  PROYECTO_ID: number;
  CONTRATISTA_ASIGNADO: string;
  FECHA_INICIO: string;
  FECHA_FIN?: string | null;
  ESTADO_SERVICIO: string;
  CREATED_AT?: string;
}

export interface EvidenciaCalidadRow {
  EVIDENCIA_ID?: number;
  PROYECTO_ID: number;
  ETAPA_OBRA: string;
  DESCRIPCION: string;
  FOTOS_URL: string;
  FECHA_REGISTRO?: string;
}

export type EvidenciaRow = EvidenciaCalidadRow;

// ==============================================================================
// CAPA DE ACCESO A DATOS (READ / WRITE) CON TABLAS Y COLUMNAS EN MAYÚSCULAS
// ==============================================================================

export const ColorLinkAPI = {
  /**
   * Verificar conectividad con Supabase
   */
  async testConnection(): Promise<{ connected: boolean; message: string }> {
    try {
      const { data, error } = await supabase.from('PRODUCTO').select('ID_DE_PRODUCTO').limit(1);
      if (error) {
        // En caso de que la tabla aún no tenga mayúsculas o permisos
        return { connected: false, message: error.message };
      }
      return { connected: true, message: `Conectado a ${SUPABASE_URL}` };
    } catch (err: any) {
      return { connected: false, message: err?.message || 'Error de conexión' };
    }
  },

  // ----------------------------------------------------------------------------
  // 1. TABLA: USUARIO
  // ----------------------------------------------------------------------------
  async getUsuarios(): Promise<UsuarioRow[]> {
    try {
      const { data, error } = await supabase
        .from('USUARIO')
        .select('*')
        .order('USUARIO_ID', { ascending: false });

      if (error) throw error;
      return (data as UsuarioRow[]) || [];
    } catch (e: any) {
      console.warn('[Supabase USUARIO GET Warning]', e?.message);
      return [];
    }
  },

  async findOrCreateUsuario(usuario: Omit<UsuarioRow, 'USUARIO_ID' | 'CREATED_AT' | 'UPDATED_AT'>): Promise<number> {
    try {
      // Buscar por IDENTIFICACION o CORREO
      const { data: existing } = await supabase
        .from('USUARIO')
        .select('USUARIO_ID')
        .or(`IDENTIFICACION.eq.${usuario.IDENTIFICACION},CORREO.eq.${usuario.CORREO}`)
        .limit(1)
        .maybeSingle();

      if (existing?.USUARIO_ID) {
        return existing.USUARIO_ID;
      }

      // Insertar nuevo usuario
      const { data: inserted, error } = await supabase
        .from('USUARIO')
        .insert({
          NOMBRE: usuario.NOMBRE,
          IDENTIFICACION: usuario.IDENTIFICACION,
          CORREO: usuario.CORREO,
          TELEFONO: usuario.TELEFONO || null,
          TIPO_CLIENTE: usuario.TIPO_CLIENTE || 'residencial',
        })
        .select('USUARIO_ID')
        .single();

      if (error) throw error;
      return inserted.USUARIO_ID;
    } catch (e: any) {
      console.warn('[Supabase USUARIO INSERT Warning]', e?.message);
      return 1; // Fallback mock id
    }
  },

  // ----------------------------------------------------------------------------
  // 2. TABLA: PRODUCTO
  // ----------------------------------------------------------------------------
  async getProductos(): Promise<ProductoRow[]> {
    try {
      const { data, error } = await supabase
        .from('PRODUCTO')
        .select('*')
        .order('NOMBRE_PRODUCTO', { ascending: true });

      if (error) throw error;
      return (data as ProductoRow[]) || [];
    } catch (e: any) {
      console.warn('[Supabase PRODUCTO GET Warning]', e?.message);
      return [];
    }
  },

  async seedProductos(productos: Array<Omit<ProductoRow, 'ID_DE_PRODUCTO' | 'CREATED_AT'>>): Promise<boolean> {
    try {
      const { data: existing } = await supabase.from('PRODUCTO').select('ID_DE_PRODUCTO').limit(1);
      if (existing && existing.length > 0) return true; // Ya existen

      const { error } = await supabase.from('PRODUCTO').insert(productos);
      if (error) throw error;
      return true;
    } catch (e: any) {
      console.warn('[Supabase PRODUCTO SEED Warning]', e?.message);
      return false;
    }
  },

  // ----------------------------------------------------------------------------
  // 3. TABLA: INVENTARIO
  // ----------------------------------------------------------------------------
  async getInventario(): Promise<InventarioRow[]> {
    try {
      const { data, error } = await supabase
        .from('INVENTARIO')
        .select('*')
        .order('ID_DE_INVENTARIO', { ascending: true });

      if (error) throw error;
      return (data as InventarioRow[]) || [];
    } catch (e: any) {
      console.warn('[Supabase INVENTARIO GET Warning]', e?.message);
      return [];
    }
  },

  async updateInventarioStock(idDeInventario: number, nuevoStock: number, lote?: string): Promise<boolean> {
    try {
      const payload: Partial<InventarioRow> = {
        STOCK_DISPONIBLE: nuevoStock,
        UPDATED_AT: new Date().toISOString(),
      };
      if (lote) {
        payload.LOTE = lote;
      }
      const { error } = await supabase
        .from('INVENTARIO')
        .update(payload)
        .eq('ID_DE_INVENTARIO', idDeInventario);

      if (error) throw error;
      return true;
    } catch (e: any) {
      console.warn('[Supabase INVENTARIO UPDATE Warning]', e?.message);
      return false;
    }
  },

  async seedInventario(items: Array<Omit<InventarioRow, 'ID_DE_INVENTARIO' | 'UPDATED_AT'>>): Promise<boolean> {
    try {
      const { data: existing } = await supabase.from('INVENTARIO').select('ID_DE_INVENTARIO').limit(1);
      if (existing && existing.length > 0) return true;

      const { error } = await supabase.from('INVENTARIO').insert(items);
      if (error) throw error;
      return true;
    } catch (e: any) {
      console.warn('[Supabase INVENTARIO SEED Warning]', e?.message);
      return false;
    }
  },

  // ----------------------------------------------------------------------------
  // 4, 5, 6, 7. TABLAS: PROYECTO, ESPECIFICACION_TECNICA, AREA, COTIZACION_DETALLE
  // ----------------------------------------------------------------------------
  async getProyectos(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('PROYECTO')
        .select(`
          *,
          USUARIO (*),
          ESPECIFICACION_TECNICA (
            *,
            AREA (*)
          ),
          COTIZACION_DETALLE (
            *,
            PRODUCTO (*)
          ),
          SERVICIO_APLICACION (*),
          EVIDENCIA_CALIDAD (*),
          EVIDENCIA (*)
        `)
        .order('PROYECTO_ID', { ascending: false });

      if (error) {
        // Si no existen relaciones anidadas automáticas en Supabase, consultar PROYECTO plano
        const { data: flatProyectos } = await supabase
          .from('PROYECTO')
          .select('*')
          .order('PROYECTO_ID', { ascending: false });
        return flatProyectos || [];
      }
      return data || [];
    } catch (e: any) {
      console.warn('[Supabase PROYECTO GET Warning]', e?.message);
      return [];
    }
  },

  async createProyectoCompleto(payload: {
    usuario: Omit<UsuarioRow, 'USUARIO_ID' | 'CREATED_AT' | 'UPDATED_AT'>;
    proyecto: Omit<ProyectoRow, 'PROYECTO_ID' | 'USUARIO_ID' | 'CREATED_AT' | 'UPDATED_AT'>;
    especificacion: Omit<EspecificacionTecnicaRow, 'ID_ESPECIFICADO' | 'PROYECTO_ID' | 'CREATED_AT'>;
    areas?: Array<{ DESCRIPCION: string; MEDIDA_M2: number }>;
    cotizacion?: { ID_DE_PRODUCTO: number; CANTIDAD_REQUERIDA: number; SUBTOTAL_DE_COSTO: number };
  }): Promise<{ success: boolean; proyectoId?: number; error?: string }> {
    try {
      // 1. USUARIO
      const usuarioId = await this.findOrCreateUsuario(payload.usuario);

      // 2. PROYECTO
      const { data: newProj, error: projErr } = await supabase
        .from('PROYECTO')
        .insert({
          USUARIO_ID: usuarioId,
          CIUDAD: payload.proyecto.CIUDAD,
          TIPO_PROYECTO: payload.proyecto.TIPO_PROYECTO,
          AREA_M2: payload.proyecto.AREA_M2,
          FECHA_REQUERIDA: payload.proyecto.FECHA_REQUERIDA,
          ESTADO_PROYECTO: payload.proyecto.ESTADO_PROYECTO || 'necesidad',
        })
        .select('PROYECTO_ID')
        .single();

      if (projErr || !newProj) throw projErr || new Error('No se pudo crear el PROYECTO');
      const proyectoId = newProj.PROYECTO_ID;

      // 3. ESPECIFICACION_TECNICA
      const { data: newSpec, error: specErr } = await supabase
        .from('ESPECIFICACION_TECNICA')
        .insert({
          PROYECTO_ID: proyectoId,
          TIPO_SUPERFICIE: payload.especificacion.TIPO_SUPERFICIE,
          AMBIENTE: payload.especificacion.AMBIENTE,
          CONDICION: payload.especificacion.CONDICION || 'buena',
          COLOR: payload.especificacion.COLOR,
          GALONES_ESTIMADOS: payload.especificacion.GALONES_ESTIMADOS || 0,
        })
        .select('ID_ESPECIFICADO')
        .single();

      if (specErr) {
        console.warn('[Supabase ESPECIFICACION_TECNICA Insert Warning]', specErr.message);
      }

      // 4. AREA
      if (newSpec?.ID_ESPECIFICADO && payload.areas && payload.areas.length > 0) {
        const areaRows = payload.areas.map((a) => ({
          ID_ESPECIFICADO: newSpec.ID_ESPECIFICADO,
          DESCRIPCION: a.DESCRIPCION,
          MEDIDA_M2: a.MEDIDA_M2,
        }));
        await supabase.from('AREA').insert(areaRows);
      }

      // 5. COTIZACION_DETALLE
      if (payload.cotizacion) {
        await supabase.from('COTIZACION_DETALLE').insert({
          PROYECTO_ID: proyectoId,
          ID_DE_PRODUCTO: payload.cotizacion.ID_DE_PRODUCTO,
          CANTIDAD_REQUERIDA: payload.cotizacion.CANTIDAD_REQUERIDA,
          SUBTOTAL_DE_COSTO: payload.cotizacion.SUBTOTAL_DE_COSTO,
        });
      }

      return { success: true, proyectoId };
    } catch (e: any) {
      console.error('[Supabase createProyectoCompleto Error]', e);
      return { success: false, error: e?.message };
    }
  },

  async updateProyectoEstado(proyectoId: number, nuevoEstado: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('PROYECTO')
        .update({
          ESTADO_PROYECTO: nuevoEstado,
          UPDATED_AT: new Date().toISOString(),
        })
        .eq('PROYECTO_ID', proyectoId);

      if (error) throw error;
      return true;
    } catch (e: any) {
      console.warn('[Supabase PROYECTO UPDATE ESTADO Warning]', e?.message);
      return false;
    }
  },

  // ----------------------------------------------------------------------------
  // 8. TABLA: SERVICIO_APLICACION
  // ----------------------------------------------------------------------------
  async upsertServicioAplicacion(servicio: ServicioAplicacionRow): Promise<boolean> {
    try {
      const { error } = await supabase.from('SERVICIO_APLICACION').insert({
        PROYECTO_ID: servicio.PROYECTO_ID,
        CONTRATISTA_ASIGNADO: servicio.CONTRATISTA_ASIGNADO,
        FECHA_INICIO: servicio.FECHA_INICIO,
        FECHA_FIN: servicio.FECHA_FIN || null,
        ESTADO_SERVICIO: servicio.ESTADO_SERVICIO || 'programado',
      });

      if (error) throw error;
      return true;
    } catch (e: any) {
      console.warn('[Supabase SERVICIO_APLICACION Warning]', e?.message);
      return false;
    }
  },

  // ----------------------------------------------------------------------------
  // 9. TABLA: EVIDENCIA_CALIDAD
  // ----------------------------------------------------------------------------
  async addEvidenciaCalidad(evidencia: EvidenciaCalidadRow): Promise<boolean> {
    try {
      // 1. Intentar primero en la tabla oficial EVIDENCIA_CALIDAD
      const { error } = await supabase.from('EVIDENCIA_CALIDAD').insert({
        PROYECTO_ID: evidencia.PROYECTO_ID,
        ETAPA_OBRA: evidencia.ETAPA_OBRA,
        DESCRIPCION: evidencia.DESCRIPCION,
        FOTOS_URL: evidencia.FOTOS_URL,
        FECHA_REGISTRO: evidencia.FECHA_REGISTRO || new Date().toISOString(),
      });

      if (error) {
        // Fallback de contingencia si la tabla fue creada como EVIDENCIA
        const { error: err2 } = await supabase.from('EVIDENCIA').insert({
          PROYECTO_ID: evidencia.PROYECTO_ID,
          ETAPA_OBRA: evidencia.ETAPA_OBRA,
          DESCRIPCION: evidencia.DESCRIPCION,
          FOTOS_URL: evidencia.FOTOS_URL,
          FECHA_REGISTRO: evidencia.FECHA_REGISTRO || new Date().toISOString(),
        });
        if (err2) throw error;
      }
      return true;
    } catch (e: any) {
      console.warn('[Supabase EVIDENCIA_CALIDAD INSERT Warning]', e?.message);
      return false;
    }
  },

  async addEvidencia(evidencia: EvidenciaCalidadRow): Promise<boolean> {
    return this.addEvidenciaCalidad(evidencia);
  },
};

// ==============================================================================
// FLUJO DEDICADO: "NUEVA SOLICITUD" (USUARIO -> PROYECTO)
// Cumpliendo los nombres de columnas y tablas solicitados:
// USUARIO: nombre, identificacion, correo, telefono, tipo_cliente -> Usuario_ID
// PROYECTO: Ciudad, Tipo_proyecto, Area_m2, Fecha_requerida, Usuario_ID, Estado_proyecto = 'Nuevo' -> Proyecto_ID
// ==============================================================================

export interface SolicitudClienteInput {
  nombre: string;
  identificacion: string;
  correo: string;
  telefono: string;
  tipo_cliente: string;
}

export interface SolicitudProyectoInput {
  Ciudad: string;
  Tipo_proyecto: string;
  Area_m2: number;
  Fecha_requerida: string;
  Usuario_ID: number;
  Estado_proyecto?: string;
}

export interface SolicitudClienteResult {
  usuarioId: number;
  reutilizado: boolean;
  usuario: any;
  autoGeneratedId: boolean;
  note?: string;
}

export interface SolicitudProyectoResult {
  proyectoId: number;
  proyecto: any;
  autoGeneratedId: boolean;
  note?: string;
}

/**
 * 1. Formulario de Cliente:
 * Busca en la tabla USUARIO por identificacion.
 * Si ya existe, lo reutiliza devolviendo su Usuario_ID.
 * Si no existe, lo inserta en la tabla USUARIO.
 */
export async function procesarClienteEnSupabase(
  cliente: SolicitudClienteInput
): Promise<SolicitudClienteResult> {
  const cleanId = String(cliente.identificacion || '').trim();
  if (!cleanId) {
    throw new Error('La identificación del cliente es obligatoria.');
  }

  // 1. Buscar si ya existe un usuario con esa identificacion
  const { data: existingUsers, error: searchError } = await supabase
    .from('USUARIO')
    .select('*')
    .eq('identificacion', cleanId);

  if (searchError) {
    // Si la columna en la BD tiene mayúsculas
    const { data: upperUsers, error: upperSearchError } = await supabase
      .from('USUARIO')
      .select('*')
      .eq('IDENTIFICACION', cleanId);

    if (!upperSearchError && upperUsers && upperUsers.length > 0) {
      const u = upperUsers[0];
      const uid = u.Usuario_ID ?? u.USUARIO_ID ?? u.usuario_id ?? u.id;
      return {
        usuarioId: Number(uid),
        reutilizado: true,
        usuario: u,
        autoGeneratedId: true,
        note: `Cliente existente reutilizado con Identificación "${cleanId}" (ID: ${uid}).`,
      };
    }
  } else if (existingUsers && existingUsers.length > 0) {
    const u = existingUsers[0];
    const uid = u.Usuario_ID ?? u.USUARIO_ID ?? u.usuario_id ?? u.id;
    return {
      usuarioId: Number(uid),
      reutilizado: true,
      usuario: u,
      autoGeneratedId: true,
      note: `Cliente existente reutilizado con Identificación "${cleanId}" (ID: ${uid}).`,
    };
  }

  // 2. Si no existe, guardar nuevo cliente en USUARIO (sin enviar columna de ID)
  const basePayload = {
    nombre: cliente.nombre.trim(),
    identificacion: cleanId,
    correo: cliente.correo.trim(),
    telefono: cliente.telefono.trim(),
    tipo_cliente: cliente.tipo_cliente.trim() || 'Particular',
  };

  // Inserción limpia sin columna ID: Supabase la genera automáticamente
  const insertRes = await supabase.from('USUARIO').insert([basePayload]).select();

  if (insertRes.error || !insertRes.data || insertRes.data.length === 0) {
    throw new Error(
      `Error al guardar en tabla USUARIO: ${insertRes.error?.message || 'No se obtuvo respuesta de Supabase'}`
    );
  }

  const created = insertRes.data[0];
  const uid = created.Usuario_ID ?? created.USUARIO_ID ?? created.usuario_id ?? created.id;
  return {
    usuarioId: Number(uid),
    reutilizado: false,
    usuario: created,
    autoGeneratedId: true,
    note: `Nuevo cliente creado en Supabase con Usuario_ID ${uid}.`,
  };
}

/**
 * 2. Formulario de Proyecto:
 * Guarda en la tabla PROYECTO con:
 * Ciudad, Tipo_proyecto, Area_m2, Fecha_requerida, Usuario_ID, Estado_proyecto = 'Nuevo'
 * NO envía columna Proyecto_ID; Supabase la autogenera.
 */
export async function crearProyectoEnSupabase(
  proyecto: SolicitudProyectoInput
): Promise<SolicitudProyectoResult> {
  if (!proyecto.Usuario_ID) {
    throw new Error('Se requiere el Usuario_ID del cliente para vincular el proyecto.');
  }

  const basePayload = {
    Ciudad: proyecto.Ciudad.trim(),
    Tipo_proyecto: proyecto.Tipo_proyecto.trim(),
    Area_m2: Number(proyecto.Area_m2) || 1,
    Fecha_requerida: proyecto.Fecha_requerida,
    Usuario_ID: proyecto.Usuario_ID,
    Estado_proyecto: 'Nuevo',
  };

  // Inserción limpia sin columna ID: Supabase la genera automáticamente
  const insertRes = await supabase.from('PROYECTO').insert([basePayload]).select();

  if (insertRes.error || !insertRes.data || insertRes.data.length === 0) {
    throw new Error(
      `Error al guardar en tabla PROYECTO: ${insertRes.error?.message || 'No se obtuvo respuesta de Supabase'}`
    );
  }

  const created = insertRes.data[0];
  const pid = created.Proyecto_ID ?? created.PROYECTO_ID ?? created.proyecto_id ?? created.id;
  return {
    proyectoId: Number(pid),
    proyecto: created,
    autoGeneratedId: true,
    note: `Proyecto guardado en Supabase con Proyecto_ID ${pid}.`,
  };
}

// ----------------------------------------------------------------------------
// 3. PASO: DIAGNÓSTICO TÉCNICO & ÁREAS (ESPECIFICACION_TECNICA y AREA)
// ----------------------------------------------------------------------------
export interface AreaInput {
  Descripcion: string;
  Medida_m2: number;
}

export interface SolicitudEspecificacionInput {
  Proyecto_ID: number;
  Tipo_superficie: string;
  Ambiente: string;
  Condicion: string;
  Color: string;
  Galones_estimados: number;
  areas: AreaInput[];
}

export interface SolicitudEspecificacionResult {
  idEspecificado: number;
  areasGuardadas: number;
  especificacion: any;
  areas: any[];
}

export async function guardarEspecificacionTecnicaYAreasEnSupabase(
  input: SolicitudEspecificacionInput
): Promise<SolicitudEspecificacionResult> {
  if (!input.Proyecto_ID) {
    throw new Error('Se requiere Proyecto_ID para registrar la especificación técnica.');
  }

  // 1. Guardar en ESPECIFICACION_TECNICA
  const specPayload = {
    Proyecto_ID: input.Proyecto_ID,
    Tipo_superficie: input.Tipo_superficie.trim(),
    Ambiente: input.Ambiente.trim(),
    Condicion: input.Condicion.trim(),
    Color: input.Color.trim(),
    Galones_estimados: Number(input.Galones_estimados) || 0,
  };

  const { data: specData, error: specErr } = await supabase
    .from('ESPECIFICACION_TECNICA')
    .insert([specPayload])
    .select();

  if (specErr || !specData || specData.length === 0) {
    throw new Error(
      `Error al guardar en ESPECIFICACION_TECNICA: ${specErr?.message || 'No se recibió respuesta de Supabase'}`
    );
  }

  const createdSpec = specData[0];
  const idEspecificado = Number(
    createdSpec.ID_ESPECIFICADO ?? createdSpec.id_especificado ?? createdSpec.id
  );

  // 2. Guardar cada área en la tabla AREA
  const areasGuardadas: any[] = [];
  if (input.areas && input.areas.length > 0) {
    const areasPayload = input.areas.map((a, idx) => ({
      ID_ESPECIFICADO: idEspecificado,
      Descripcion: a.Descripcion.trim() || `Área ${idx + 1}`,
      Medida_m2: Number(a.Medida_m2) || 0,
    }));

    const { data: areaData, error: areaErr } = await supabase
      .from('AREA')
      .insert(areasPayload)
      .select();

    if (areaErr) {
      throw new Error(`Error al guardar en tabla AREA: ${areaErr.message}`);
    }

    if (areaData) {
      areasGuardadas.push(...areaData);
    }
  }

  return {
    idEspecificado,
    areasGuardadas: areasGuardadas.length,
    especificacion: createdSpec,
    areas: areasGuardadas,
  };
}

// ----------------------------------------------------------------------------
// 4. PASO: COTIZACIÓN (COTIZACION_DETALLE)
// ----------------------------------------------------------------------------
export interface ItemCotizacionInput {
  ID_de_producto: number;
  Cantidad_requerida: number;
  Subtotal_de_costo: number;
  Nombre_producto?: string;
  Precio_unitario?: number;
}

export interface SolicitudCotizacionInput {
  Proyecto_ID: number;
  items: ItemCotizacionInput[];
}

export interface SolicitudCotizacionResult {
  total: number;
  itemsCount: number;
  detalles: any[];
}

export async function guardarCotizacionDetalleEnSupabase(
  input: SolicitudCotizacionInput
): Promise<SolicitudCotizacionResult> {
  if (!input.Proyecto_ID) {
    throw new Error('Se requiere Proyecto_ID para registrar la cotización.');
  }

  if (!input.items || input.items.length === 0) {
    return { total: 0, itemsCount: 0, detalles: [] };
  }

  const totalCalculado = input.items.reduce(
    (sum, item) => sum + (Number(item.Subtotal_de_costo) || 0),
    0
  );

  const payload = input.items.map((item) => ({
    Proyecto_ID: input.Proyecto_ID,
    ID_de_producto: item.ID_de_producto,
    Cantidad_requerida: Number(item.Cantidad_requerida) || 1,
    Subtotal_de_costo: Number(item.Subtotal_de_costo) || 0,
  }));

  const { data, error } = await supabase.from('COTIZACION_DETALLE').insert(payload).select();

  if (error) {
    throw new Error(`Error al guardar en COTIZACION_DETALLE: ${error.message}`);
  }

  return {
    total: totalCalculado,
    itemsCount: data ? data.length : payload.length,
    detalles: data || [],
  };
}

// ==============================================================================
// 5. ACTUALIZAR ESTADO DEL PROYECTO (updateEstadoProyectoEnSupabase)
// ==============================================================================
export async function updateEstadoProyectoEnSupabase(
  proyectoId: number,
  nuevoEstado: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('PROYECTO')
      .update({
        Estado_proyecto: nuevoEstado,
      })
      .eq('Proyecto_ID', proyectoId);

    if (error) {
      // Intentar también con columna en mayúsculas por si acaso
      const { error: err2 } = await supabase
        .from('PROYECTO')
        .update({
          ESTADO_PROYECTO: nuevoEstado,
        })
        .eq('PROYECTO_ID', proyectoId);

      if (err2) throw error;
    }
    return true;
  } catch (err: any) {
    console.warn('[Supabase updateEstadoProyectoEnSupabase Warning]', err?.message);
    return false;
  }
}

// ==============================================================================
// 6. CONTRATISTAS Y SERVICIOS DE APLICACIÓN (RequestDetailModal)
// ==============================================================================
export async function getContratistasFromSupabase(): Promise<UsuarioRow[]> {
  try {
    const { data, error } = await supabase
      .from('USUARIO')
      .select('*')
      .eq('tipo_cliente', 'Contratista');

    if (error) {
      const { data: upperData } = await supabase
        .from('USUARIO')
        .select('*')
        .eq('TIPO_CLIENTE', 'Contratista');
      return (upperData as UsuarioRow[]) || [];
    }
    return (data as UsuarioRow[]) || [];
  } catch (e: any) {
    console.warn('[Supabase getContratistas Warning]', e?.message);
    return [];
  }
}

export async function getServiciosDeProyecto(proyectoId: number): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('SERVICIO_APLICACION')
      .select('*')
      .eq('Proyecto_ID', proyectoId)
      .order('Servicios_ID', { ascending: false });

    if (error) {
      const { data: altData } = await supabase
        .from('SERVICIO_APLICACION')
        .select('*')
        .eq('PROYECTO_ID', proyectoId);
      return altData || [];
    }
    return data || [];
  } catch (e: any) {
    console.warn('[Supabase getServiciosDeProyecto Warning]', e?.message);
    return [];
  }
}

export interface GuardarServicioAplicacionInput {
  Proyecto_ID: number;
  Contratista_asignado: string | number;
  Fecha_inicio: string;
  Fecha_fin?: string | null;
  Estado_servicio?: string;
}

export async function guardarServicioAplicacionEnSupabase(
  input: GuardarServicioAplicacionInput
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    // Note: Column in DB is 'Fecha_incio' (schema spelling)
    const payload: any = {
      Proyecto_ID: input.Proyecto_ID,
      Contratista_asignado: String(input.Contratista_asignado),
      Fecha_incio: input.Fecha_inicio,
      Fecha_fin: input.Fecha_fin || null,
      Estado_servicio: input.Estado_servicio || 'Programado',
    };

    const { data, error } = await supabase
      .from('SERVICIO_APLICACION')
      .insert([payload])
      .select();

    if (error) {
      // Reintento en caso de que Fecha_inicio esté corregido en la BD
      const retryPayload = { ...payload, Fecha_inicio: input.Fecha_inicio };
      delete retryPayload.Fecha_incio;
      const { data: retryData, error: retryErr } = await supabase
        .from('SERVICIO_APLICACION')
        .insert([retryPayload])
        .select();

      if (retryErr) throw error;
      return { success: true, data: retryData };
    }

    // Actualizar también el Estado_proyecto en PROYECTO
    const nuevoEstado = input.Estado_servicio === 'Finalizado' ? 'Finalizado' : 'En ejecución';
    await updateEstadoProyectoEnSupabase(input.Proyecto_ID, nuevoEstado);

    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Error al guardar servicio' };
  }
}

// ==============================================================================
// 7. EVIDENCIAS DE CALIDAD Y SUPABASE STORAGE (RequestDetailModal)
// ==============================================================================
export async function subirFotoEvidenciaStorage(
  file: File,
  customFileName?: string
): Promise<string> {
  const fileExt = file.name.split('.').pop() || 'jpg';
  const cleanName = (customFileName || `obra_${Date.now()}_${Math.random().toString(36).substring(7)}`)
    .replace(/[^a-zA-Z0-9._-]/g, '_');
  const filePath = `${Date.now()}_${cleanName}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('evidencias')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    });

  if (error) {
    throw new Error(`Error al subir imagen al bucket 'evidencias': ${error.message}`);
  }

  const { data: urlData } = supabase.storage
    .from('evidencias')
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

export interface GuardarEvidenciaCalidadInput {
  Proyecto_ID: number;
  Etapa_obra: string;
  Descripcion: string;
  Fotos_URL: string;
  Fecha_registro?: string;
}

export async function guardarEvidenciaCalidadEnSupabase(
  input: GuardarEvidenciaCalidadInput
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    const payload = {
      Proyecto_ID: input.Proyecto_ID,
      Etapa_obra: input.Etapa_obra,
      Descripcion: input.Descripcion,
      Fotos_URL: input.Fotos_URL,
      Fecha_registro: input.Fecha_registro || new Date().toISOString().split('T')[0],
    };

    const { data, error } = await supabase
      .from('EVIDENCIA_CALIDAD')
      .insert([payload])
      .select();

    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Error al guardar evidencia' };
  }
}

export async function getEvidenciasDeProyecto(proyectoId: number): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('EVIDENCIA_CALIDAD')
      .select('*')
      .eq('Proyecto_ID', proyectoId)
      .order('Evidencia_ID', { ascending: false });

    if (error) {
      const { data: altData } = await supabase
        .from('EVIDENCIA_CALIDAD')
        .select('*')
        .eq('PROYECTO_ID', proyectoId);
      return altData || [];
    }
    return data || [];
  } catch (e: any) {
    console.warn('[Supabase getEvidenciasDeProyecto Warning]', e?.message);
    return [];
  }
}

