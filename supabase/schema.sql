-- ==============================================================================
-- COLORLINK / PINTUCO: DDL de Creación de Base de Datos (PostgreSQL / Supabase)
-- ==============================================================================
-- Este script crea las 9 tablas del modelo de datos de ColorLink, incluyendo:
--   - Llaves primarias autoincrementales (IDENTITY)
--   - Llaves foráneas con reglas de integridad referencial
--   - Restricciones CHECK para validar estados, rangos y formatos
--   - Índices optimizados (B-Tree) para consultas frecuentes y relaciones FK
--   - Función y triggers para actualización automática de 'updated_at'
-- ==============================================================================

-- 1. Habilitar extensiones requeridas si no existen
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Función genérica para actualizar el campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- TABLA 1: USUARIO
-- Clientes, asesores, contratistas y personal de la plataforma.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS usuario (
    usuario_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    identificacion VARCHAR(50) NOT NULL,
    correo VARCHAR(255) NOT NULL,
    telefono VARCHAR(50),
    tipo_cliente VARCHAR(50) NOT NULL DEFAULT 'residencial',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    CONSTRAINT uq_usuario_identificacion UNIQUE (identificacion),
    CONSTRAINT uq_usuario_correo UNIQUE (correo),
    CONSTRAINT chk_usuario_correo CHECK (correo ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_usuario_tipo CHECK (tipo_cliente IN ('residencial', 'comercial', 'contratista', 'industrial', 'institucional'))
);

CREATE INDEX IF NOT EXISTS idx_usuario_identificacion ON usuario(identificacion);
CREATE INDEX IF NOT EXISTS idx_usuario_correo ON usuario(correo);
CREATE INDEX IF NOT EXISTS idx_usuario_tipo_cliente ON usuario(tipo_cliente);

COMMENT ON TABLE usuario IS 'Registro maestro de clientes y usuarios operativos de ColorLink';
COMMENT ON COLUMN usuario.usuario_id IS 'Identificador único del usuario';
COMMENT ON COLUMN usuario.identificacion IS 'Cédula, NIT, RUT o pasaporte único';
COMMENT ON COLUMN usuario.tipo_cliente IS 'Clasificación comercial (residencial, comercial, contratista, industrial)';

CREATE OR REPLACE TRIGGER trg_usuario_updated_at
BEFORE UPDATE ON usuario
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- TABLA 2: PROYECTO
-- Proyectos y solicitudes de pintura en el flujo de 5 etapas.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS proyecto (
    proyecto_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    tipo_proyecto VARCHAR(100) NOT NULL,
    area_m2 NUMERIC(10, 2) NOT NULL,
    fecha_requerida DATE NOT NULL,
    estado_proyecto VARCHAR(50) NOT NULL DEFAULT 'necesidad',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_proyecto_usuario 
        FOREIGN KEY (usuario_id) 
        REFERENCES usuario(usuario_id) 
        ON UPDATE CASCADE 
        ON DELETE RESTRICT,

    CONSTRAINT chk_proyecto_area CHECK (area_m2 > 0),
    CONSTRAINT chk_proyecto_estado CHECK (
        estado_proyecto IN (
            'necesidad',          -- Etapa 1: Registro de requerimiento
            'solucion_tecnica',   -- Etapa 2: Especificación y cotización
            'abastecimiento',     -- Etapa 3: Reserva de inventario y lotes
            'servicio',           -- Etapa 4: Despacho y aplicación
            'calidad',            -- Etapa 5: Certificación y entrega
            'completado',         -- Finalizado exitosamente
            'cancelado'           -- Cancelado
        )
    )
);

CREATE INDEX IF NOT EXISTS idx_proyecto_usuario_id ON proyecto(usuario_id);
CREATE INDEX IF NOT EXISTS idx_proyecto_estado ON proyecto(estado_proyecto);
CREATE INDEX IF NOT EXISTS idx_proyecto_ciudad ON proyecto(ciudad);
CREATE INDEX IF NOT EXISTS idx_proyecto_fecha_requerida ON proyecto(fecha_requerida);

COMMENT ON TABLE proyecto IS 'Expediente central de cada obra o proyecto de recubrimiento';
COMMENT ON COLUMN proyecto.estado_proyecto IS 'Fase actual dentro del flujo de valor de 5 etapas';

CREATE OR REPLACE TRIGGER trg_proyecto_updated_at
BEFORE UPDATE ON proyecto
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- TABLA 3: ESPECIFICACION_TECNICA
-- Diagnóstico y prescripción técnica de recubrimientos para el proyecto.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS especificacion_tecnica (
    id_especificado BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    proyecto_id BIGINT NOT NULL,
    tipo_superficie VARCHAR(100) NOT NULL,
    ambiente VARCHAR(50) NOT NULL,
    condicion VARCHAR(100) NOT NULL DEFAULT 'buena',
    color VARCHAR(100) NOT NULL,
    galones_estimados NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_especificacion_proyecto 
        FOREIGN KEY (proyecto_id) 
        REFERENCES proyecto(proyecto_id) 
        ON UPDATE CASCADE 
        ON DELETE CASCADE,

    CONSTRAINT chk_especificacion_ambiente CHECK (
        ambiente IN ('interior', 'exterior', 'industrial_marino', 'hospitalario_aseptico')
    ),
    CONSTRAINT chk_especificacion_galones CHECK (galones_estimados >= 0)
);

CREATE INDEX IF NOT EXISTS idx_especificacion_proyecto_id ON especificacion_tecnica(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_especificacion_superficie ON especificacion_tecnica(tipo_superficie);

COMMENT ON TABLE especificacion_tecnica IS 'Parámetros técnicos de la superficie, ambiente y volumen requerido';

-- ==============================================================================
-- TABLA 4: AREA
-- Desglose de zonas o estancias específicas calculadas dentro de la prescripción.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS area (
    area_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_especificado BIGINT NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    medida_m2 NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_area_especificacion 
        FOREIGN KEY (id_especificado) 
        REFERENCES especificacion_tecnica(id_especificado) 
        ON UPDATE CASCADE 
        ON DELETE CASCADE,

    CONSTRAINT chk_area_medida CHECK (medida_m2 > 0)
);

CREATE INDEX IF NOT EXISTS idx_area_especificado_id ON area(id_especificado);

COMMENT ON TABLE area IS 'Espacios particulares (ej. Sala, Fachada Norte, Consultorio) con su m²';

-- ==============================================================================
-- TABLA 5: PRODUCTO
-- Catálogo maestro de pinturas, primers, esmaltes y recubrimientos Pintuco.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS producto (
    id_de_producto BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    sku VARCHAR(50) NOT NULL,
    nombre_producto VARCHAR(255) NOT NULL,
    tipo_producto VARCHAR(100) NOT NULL,
    unidad_medida VARCHAR(50) NOT NULL DEFAULT 'Galón',
    precio_unitario NUMERIC(12, 2) NOT NULL,
    rendimiento_m2_galon NUMERIC(8, 2) DEFAULT 35.00,
    manos_recomendadas INT DEFAULT 2,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_producto_sku UNIQUE (sku),
    CONSTRAINT chk_producto_precio CHECK (precio_unitario >= 0),
    CONSTRAINT chk_producto_rendimiento CHECK (rendimiento_m2_galon > 0),
    CONSTRAINT chk_producto_manos CHECK (manos_recomendadas >= 1)
);

CREATE INDEX IF NOT EXISTS idx_producto_sku ON producto(sku);
CREATE INDEX IF NOT EXISTS idx_producto_tipo ON producto(tipo_producto);
CREATE INDEX IF NOT EXISTS idx_producto_nombre ON producto(nombre_producto);

COMMENT ON TABLE producto IS 'Catálogo comercial e industrial de pinturas y recubrimientos';

-- ==============================================================================
-- TABLA 6: COTIZACION_DETALLE
-- Renglones de productos y costos vinculados a la cotización del proyecto.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS cotizacion_detalle (
    cotizacion_detalle_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    proyecto_id BIGINT NOT NULL,
    id_de_producto BIGINT NOT NULL,
    cantidad_requerida NUMERIC(10, 2) NOT NULL,
    subtotal_de_costo NUMERIC(12, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_cotizacion_proyecto 
        FOREIGN KEY (proyecto_id) 
        REFERENCES proyecto(proyecto_id) 
        ON UPDATE CASCADE 
        ON DELETE CASCADE,

    CONSTRAINT fk_cotizacion_producto 
        FOREIGN KEY (id_de_producto) 
        REFERENCES producto(id_de_producto) 
        ON UPDATE CASCADE 
        ON DELETE RESTRICT,

    CONSTRAINT chk_cotizacion_cantidad CHECK (cantidad_requerida > 0),
    CONSTRAINT chk_cotizacion_subtotal CHECK (subtotal_de_costo >= 0)
);

CREATE INDEX IF NOT EXISTS idx_cotizacion_proyecto_id ON cotizacion_detalle(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_cotizacion_producto_id ON cotizacion_detalle(id_de_producto);

COMMENT ON TABLE cotizacion_detalle IS 'Líneas cotizadas por proyecto con cantidades calculadas y costos';

-- ==============================================================================
-- TABLA 7: INVENTARIO
-- Existencias en centros de distribución / bodegas y lotes de producto.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS inventario (
    id_de_inventario BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_de_producto BIGINT NOT NULL,
    centro_distribucion VARCHAR(100) NOT NULL,
    stock_disponible NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    lote VARCHAR(50),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_inventario_producto 
        FOREIGN KEY (id_de_producto) 
        REFERENCES producto(id_de_producto) 
        ON UPDATE CASCADE 
        ON DELETE RESTRICT,

    CONSTRAINT chk_inventario_stock CHECK (stock_disponible >= 0)
);

CREATE INDEX IF NOT EXISTS idx_inventario_producto_id ON inventario(id_de_producto);
CREATE INDEX IF NOT EXISTS idx_inventario_cd ON inventario(centro_distribucion);
CREATE INDEX IF NOT EXISTS idx_inventario_lote ON inventario(lote);

COMMENT ON TABLE inventario IS 'Disponibilidad de existencias en Centros de Distribución por SKU';

CREATE OR REPLACE TRIGGER trg_inventario_updated_at
BEFORE UPDATE ON inventario
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- TABLA 8: SERVICIO_APLICACION
-- Gestión de contratistas, fechas de obra y estado del servicio de pintura.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS servicio_aplicacion (
    servicios_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    proyecto_id BIGINT NOT NULL,
    contratista_asignado VARCHAR(255) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    estado_servicio VARCHAR(50) NOT NULL DEFAULT 'programado',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_servicio_proyecto 
        FOREIGN KEY (proyecto_id) 
        REFERENCES proyecto(proyecto_id) 
        ON UPDATE CASCADE 
        ON DELETE CASCADE,

    CONSTRAINT chk_servicio_fechas CHECK (fecha_fin IS NULL OR fecha_fin >= fecha_inicio),
    CONSTRAINT chk_servicio_estado CHECK (
        estado_servicio IN (
            'programado',       -- Servicio agendado
            'en_preparacion',   -- Limpieza/preparación de superficie
            'en_aplicacion',    -- Manos de pintura en curso
            'finalizado',       -- Concluido
            'suspendido'        -- En pausa por clima u obra
        )
    )
);

CREATE INDEX IF NOT EXISTS idx_servicio_proyecto_id ON servicio_aplicacion(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_servicio_estado ON servicio_aplicacion(estado_servicio);
CREATE INDEX IF NOT EXISTS idx_servicio_contratista ON servicio_aplicacion(contratista_asignado);

COMMENT ON TABLE servicio_aplicacion IS 'Planificación y estado del servicio de pintura y contratista';

-- ==============================================================================
-- TABLA 9: EVIDENCIA_CALIDAD
-- Registro fotográfico y técnico de control de calidad por etapas.
-- ==============================================================================
CREATE TABLE IF NOT EXISTS evidencia_calidad (
    evidencia_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    proyecto_id BIGINT NOT NULL,
    etapa_obra VARCHAR(100) NOT NULL,
    descripcion TEXT NOT NULL,
    fotos_url TEXT NOT NULL,
    fecha_registro TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_evidencia_proyecto 
        FOREIGN KEY (proyecto_id) 
        REFERENCES proyecto(proyecto_id) 
        ON UPDATE CASCADE 
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_evidencia_proyecto_id ON evidencia_calidad(proyecto_id);
CREATE INDEX IF NOT EXISTS idx_evidencia_etapa ON evidencia_calidad(etapa_obra);
CREATE INDEX IF NOT EXISTS idx_evidencia_fecha ON evidencia_calidad(fecha_registro);

COMMENT ON TABLE evidencia_calidad IS 'Bitácora fotográfica y de inspección de calidad de la obra';
