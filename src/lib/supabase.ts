import { createClient } from '@supabase/supabase-js';

// ==============================================================================
// CONFIGURACIÓN DE CONEXIÓN SUPABASE (COLORLINK)
// ==============================================================================
export const SUPABASE_URL =
  (import.meta as any).env?.VITE_SUPABASE_URL || 'https://ihonjeebbfmusuqtzwlv.supabase.co';
export const SUPABASE_PUBLISHABLE_KEY =
  (import.meta as any).env?.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_nBDvKpDhPDgAF6F7Fy4hbw_CxXvqdlF';

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type TipoCliente = 'residencial' | 'comercial' | 'contratista' | 'industrial' | 'institucional';
export type EstadoProyecto =
  | 'necesidad'
  | 'solucion_tecnica'
  | 'abastecimiento'
  | 'servicio'
  | 'calidad'
  | 'completado'
  | 'cancelado';
export type TipoAmbiente = 'interior' | 'exterior' | 'industrial_marino' | 'hospitalario_aseptico';
export type EstadoServicio = 'programado' | 'en_preparacion' | 'en_aplicacion' | 'finalizado' | 'suspendido';

export interface Database {
  public: {
    Tables: {
      usuario: {
        Row: {
          usuario_id: number;
          nombre: string;
          identificacion: string;
          correo: string;
          telefono: string | null;
          tipo_cliente: TipoCliente;
          auth_user_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          usuario_id?: number;
          nombre: string;
          identificacion: string;
          correo: string;
          telefono?: string | null;
          tipo_cliente?: TipoCliente;
          auth_user_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          usuario_id?: number;
          nombre?: string;
          identificacion?: string;
          correo?: string;
          telefono?: string | null;
          tipo_cliente?: TipoCliente;
          auth_user_id?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      proyecto: {
        Row: {
          proyecto_id: number;
          usuario_id: number;
          ciudad: string;
          tipo_proyecto: string;
          area_m2: number;
          fecha_requerida: string;
          estado_proyecto: EstadoProyecto;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          proyecto_id?: number;
          usuario_id: number;
          ciudad: string;
          tipo_proyecto: string;
          area_m2: number;
          fecha_requerida: string;
          estado_proyecto?: EstadoProyecto;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          proyecto_id?: number;
          usuario_id?: number;
          ciudad?: string;
          tipo_proyecto?: string;
          area_m2?: number;
          fecha_requerida?: string;
          estado_proyecto?: EstadoProyecto;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_proyecto_usuario';
            columns: ['usuario_id'];
            isOneToOne: false;
            referencedRelation: 'usuario';
            referencedColumns: ['usuario_id'];
          }
        ];
      };
      especificacion_tecnica: {
        Row: {
          id_especificado: number;
          proyecto_id: number;
          tipo_superficie: string;
          ambiente: TipoAmbiente;
          condicion: string;
          color: string;
          galones_estimados: number;
          created_at: string;
        };
        Insert: {
          id_especificado?: number;
          proyecto_id: number;
          tipo_superficie: string;
          ambiente: TipoAmbiente;
          condicion?: string;
          color: string;
          galones_estimados?: number;
          created_at?: string;
        };
        Update: {
          id_especificado?: number;
          proyecto_id?: number;
          tipo_superficie?: string;
          ambiente?: TipoAmbiente;
          condicion?: string;
          color?: string;
          galones_estimados?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_especificacion_proyecto';
            columns: ['proyecto_id'];
            isOneToOne: false;
            referencedRelation: 'proyecto';
            referencedColumns: ['proyecto_id'];
          }
        ];
      };
      area: {
        Row: {
          area_id: number;
          id_especificado: number;
          descripcion: string;
          medida_m2: number;
          created_at: string;
        };
        Insert: {
          area_id?: number;
          id_especificado: number;
          descripcion: string;
          medida_m2: number;
          created_at?: string;
        };
        Update: {
          area_id?: number;
          id_especificado?: number;
          descripcion?: string;
          medida_m2?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_area_especificacion';
            columns: ['id_especificado'];
            isOneToOne: false;
            referencedRelation: 'especificacion_tecnica';
            referencedColumns: ['id_especificado'];
          }
        ];
      };
      producto: {
        Row: {
          id_de_producto: number;
          sku: string;
          nombre_producto: string;
          tipo_producto: string;
          unidad_medida: string;
          precio_unitario: number;
          rendimiento_m2_galon: number;
          manos_recomendadas: number;
          created_at: string;
        };
        Insert: {
          id_de_producto?: number;
          sku: string;
          nombre_producto: string;
          tipo_producto: string;
          unidad_medida?: string;
          precio_unitario: number;
          rendimiento_m2_galon?: number;
          manos_recomendadas?: number;
          created_at?: string;
        };
        Update: {
          id_de_producto?: number;
          sku?: string;
          nombre_producto?: string;
          tipo_producto?: string;
          unidad_medida?: string;
          precio_unitario?: number;
          rendimiento_m2_galon?: number;
          manos_recomendadas?: number;
        };
        Relationships: [];
      };
      cotizacion_detalle: {
        Row: {
          cotizacion_detalle_id: number;
          proyecto_id: number;
          id_de_producto: number;
          cantidad_requerida: number;
          subtotal_de_costo: number;
          created_at: string;
        };
        Insert: {
          cotizacion_detalle_id?: number;
          proyecto_id: number;
          id_de_producto: number;
          cantidad_requerida: number;
          subtotal_de_costo?: number;
          created_at?: string;
        };
        Update: {
          cotizacion_detalle_id?: number;
          proyecto_id?: number;
          id_de_producto?: number;
          cantidad_requerida?: number;
          subtotal_de_costo?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_cotizacion_proyecto';
            columns: ['proyecto_id'];
            isOneToOne: false;
            referencedRelation: 'proyecto';
            referencedColumns: ['proyecto_id'];
          },
          {
            foreignKeyName: 'fk_cotizacion_producto';
            columns: ['id_de_producto'];
            isOneToOne: false;
            referencedRelation: 'producto';
            referencedColumns: ['id_de_producto'];
          }
        ];
      };
      inventario: {
        Row: {
          id_de_inventario: number;
          id_de_producto: number;
          centro_distribucion: string;
          stock_disponible: number;
          lote: string | null;
          updated_at: string;
        };
        Insert: {
          id_de_inventario?: number;
          id_de_producto: number;
          centro_distribucion: string;
          stock_disponible?: number;
          lote?: string | null;
          updated_at?: string;
        };
        Update: {
          id_de_inventario?: number;
          id_de_producto?: number;
          centro_distribucion?: string;
          stock_disponible?: number;
          lote?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_inventario_producto';
            columns: ['id_de_producto'];
            isOneToOne: false;
            referencedRelation: 'producto';
            referencedColumns: ['id_de_producto'];
          }
        ];
      };
      servicio_aplicacion: {
        Row: {
          servicios_id: number;
          proyecto_id: number;
          contratista_asignado: string;
          fecha_inicio: string;
          fecha_fin: string | null;
          estado_servicio: EstadoServicio;
          created_at: string;
        };
        Insert: {
          servicios_id?: number;
          proyecto_id: number;
          contratista_asignado: string;
          fecha_inicio: string;
          fecha_fin?: string | null;
          estado_servicio?: EstadoServicio;
          created_at?: string;
        };
        Update: {
          servicios_id?: number;
          proyecto_id?: number;
          contratista_asignado?: string;
          fecha_inicio?: string;
          fecha_fin?: string | null;
          estado_servicio?: EstadoServicio;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_servicio_proyecto';
            columns: ['proyecto_id'];
            isOneToOne: false;
            referencedRelation: 'proyecto';
            referencedColumns: ['proyecto_id'];
          }
        ];
      };
      evidencia_calidad: {
        Row: {
          evidencia_id: number;
          proyecto_id: number;
          etapa_obra: string;
          descripcion: string;
          fotos_url: string;
          fecha_registro: string;
        };
        Insert: {
          evidencia_id?: number;
          proyecto_id: number;
          etapa_obra: string;
          descripcion: string;
          fotos_url: string;
          fecha_registro?: string;
        };
        Update: {
          evidencia_id?: number;
          proyecto_id?: number;
          etapa_obra?: string;
          descripcion?: string;
          fotos_url?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_evidencia_proyecto';
            columns: ['proyecto_id'];
            isOneToOne: false;
            referencedRelation: 'proyecto';
            referencedColumns: ['proyecto_id'];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      calcular_cotizacion_proyecto: {
        Args: {
          p_proyecto_id: number;
          p_id_de_producto: number;
          p_descuento_porcentaje?: number;
        };
        Returns: Json;
      };
      verificar_disponibilidad_inventario: {
        Args: {
          p_proyecto_id: number;
          p_centro_distribucion: string;
          p_reservar?: boolean;
        };
        Returns: Json;
      };
      avanzar_fase_proyecto: {
        Args: {
          p_proyecto_id: number;
          p_nuevo_estado: EstadoProyecto;
          p_notas?: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Cliente inicializado con tipado genérico estricto
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// ==============================================================================
// CAPA DE SERVICIO API / MÉTODOS HELPER TIPADOS PARA COLORLINK
// ==============================================================================

export interface RegistrarSolicitudPayload {
  cliente: {
    nombre: string;
    identificacion: string;
    correo: string;
    telefono: string;
    tipo_cliente?: TipoCliente;
  };
  proyecto: {
    ciudad: string;
    tipo_proyecto: string;
    area_m2: number;
    fecha_requerida: string;
  };
  especificacion: {
    tipo_superficie: string;
    ambiente: TipoAmbiente;
    condicion?: string;
    color: string;
    galones_estimados?: number;
  };
  areas?: Array<{
    descripcion: string;
    medida_m2: number;
  }>;
}

export const ColorLinkAPI = {
  /**
   * 1. Consulta el catálogo de productos con stock y precios oficiales
   */
  async getProducts() {
    const { data, error } = await supabase
      .from('producto')
      .select('*')
      .order('nombre_producto', { ascending: true });

    if (error) {
      console.warn('Supabase getProducts fallback/error:', error.message);
      return [];
    }
    return data || [];
  },

  /**
   * 2. Registra una nueva necesidad/solicitud completa en una transacción relacional
   */
  async createProjectRequest(payload: RegistrarSolicitudPayload) {
    try {
      // a. Buscar o registrar al usuario por identificación
      const { data: existingUser } = await supabase
        .from('usuario')
        .select('*')
        .eq('identificacion', payload.cliente.identificacion)
        .maybeSingle();

      let usuarioId: number;

      if (existingUser) {
        usuarioId = existingUser.usuario_id;
      } else {
        const { data: newUser, error: userError } = await supabase
          .from('usuario')
          .insert({
            nombre: payload.cliente.nombre,
            identificacion: payload.cliente.identificacion,
            correo: payload.cliente.correo,
            telefono: payload.cliente.telefono,
            tipo_cliente: payload.cliente.tipo_cliente || 'residencial',
          })
          .select('usuario_id')
          .single();

        if (userError || !newUser) throw new Error(userError?.message || 'Error registrando usuario');
        usuarioId = newUser.usuario_id;
      }

      // b. Crear el proyecto
      const { data: newProject, error: projectError } = await supabase
        .from('proyecto')
        .insert({
          usuario_id: usuarioId,
          ciudad: payload.proyecto.ciudad,
          tipo_proyecto: payload.proyecto.tipo_proyecto,
          area_m2: payload.proyecto.area_m2,
          fecha_requerida: payload.proyecto.fecha_requerida,
          estado_proyecto: 'necesidad',
        })
        .select('proyecto_id')
        .single();

      if (projectError || !newProject) throw new Error(projectError?.message || 'Error creando proyecto');
      const proyectoId = newProject.proyecto_id;

      // c. Crear especificación técnica
      const { data: newSpec, error: specError } = await supabase
        .from('especificacion_tecnica')
        .insert({
          proyecto_id: proyectoId,
          tipo_superficie: payload.especificacion.tipo_superficie,
          ambiente: payload.especificacion.ambiente,
          condicion: payload.especificacion.condicion || 'buena',
          color: payload.especificacion.color,
          galones_estimados: payload.especificacion.galones_estimados || 0,
        })
        .select('id_especificado')
        .single();

      if (specError || !newSpec) throw new Error(specError?.message || 'Error registrando especificación técnica');

      // d. Registrar áreas individuales si existen
      if (payload.areas && payload.areas.length > 0) {
        const areaRows = payload.areas.map((a) => ({
          id_especificado: newSpec.id_especificado,
          descripcion: a.descripcion,
          medida_m2: a.medida_m2,
        }));
        await supabase.from('area').insert(areaRows);
      }

      return { success: true, proyectoId, usuarioId };
    } catch (err: any) {
      console.error('Error en ColorLinkAPI.createProjectRequest:', err);
      return { success: false, error: err.message };
    }
  },

  /**
   * 3. Invoca la función RPC para calcular la cotización técnica exacta en PostgreSQL
   */
  async calculateProjectQuote(projectId: number, productId: number, discountPct: number = 0) {
    const { data, error } = await supabase.rpc('calcular_cotizacion_proyecto', {
      p_proyecto_id: projectId,
      p_id_de_producto: productId,
      p_descuento_porcentaje: discountPct,
    });

    if (error) {
      console.warn('RPC calcular_cotizacion_proyecto error:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true, cotizacion: data };
  },

  /**
   * 4. Valida y reserva el stock en bodega e inventario por lote químico (RPC)
   */
  async verifyAndReserveInventory(projectId: number, distributionCenter: string, reserve: boolean = true) {
    const { data, error } = await supabase.rpc('verificar_disponibilidad_inventario', {
      p_proyecto_id: projectId,
      p_centro_distribucion: distributionCenter,
      p_reservar: reserve,
    });

    if (error) {
      console.warn('RPC verificar_disponibilidad_inventario error:', error.message);
      return { success: false, error: error.message };
    }
    return { success: true, resultado: data };
  },

  /**
   * 5. Consulta el expediente integral de un proyecto con sus 5 fases operativas
   */
  async getProjectFullTimeline(projectId: number) {
    const { data, error } = await supabase
      .from('proyecto')
      .select(`
        *,
        usuario (*),
        especificacion_tecnica (
          *,
          area (*)
        ),
        cotizacion_detalle (
          *,
          producto (*)
        ),
        servicio_aplicacion (*),
        evidencia_calidad (*)
      `)
      .eq('proyecto_id', projectId)
      .single();

    if (error) {
      console.warn('Error fetching project timeline:', error.message);
      return null;
    }
    return data;
  },

  /**
   * 6. Registra un avance o inspección de control de calidad fotográfico
   */
  async addQualityInspection(projectId: number, stageName: string, description: string, photosUrl: string) {
    const { data, error } = await supabase
      .from('evidencia_calidad')
      .insert({
        proyecto_id: projectId,
        etapa_obra: stageName,
        descripcion: description,
        fotos_url: photosUrl,
      })
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, evidencia: data };
  },
};
