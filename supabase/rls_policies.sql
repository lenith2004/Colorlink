-- ==============================================================================
-- COLORLINK / PINTUCO: Políticas de Seguridad RLS (Row Level Security)
-- ==============================================================================
-- Este script implementa el control de acceso basado en roles (RBAC) en Supabase:
--   1. cliente: Acceso exclusivo a sus propios datos, cotizaciones y seguimiento de obra.
--   2. asesor_comercial: Gestión de solicitudes, especificación técnica y cotizaciones.
--   3. bodega_inventario: Control de inventarios por CD, lotes y abastecimiento.
--   4. calidad_servicio: Inspecciones, bitácora fotográfica y emisión de garantías.
-- ==============================================================================

-- 0. Vincular opcionalmente la tabla usuario con auth.users de Supabase
ALTER TABLE usuario 
ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_usuario_auth_user_id ON usuario(auth_user_id);

-- ==============================================================================
-- FUNCIONES AUXILIARES DE ROL E IDENTIDAD (SECURITY DEFINER)
-- ==============================================================================

-- Obtiene el usuario_id interno correspondiente al usuario autenticado en Supabase
CREATE OR REPLACE FUNCTION get_current_usuario_id()
RETURNS BIGINT
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_usuario_id BIGINT;
BEGIN
    -- 1. Intentar por auth_user_id
    SELECT usuario_id INTO v_usuario_id
    FROM usuario
    WHERE auth_user_id = auth.uid()
    LIMIT 1;

    -- 2. Si no coincide aún por UUID, intentar por email del token JWT
    IF v_usuario_id IS NULL AND auth.jwt() ->> 'email' IS NOT NULL THEN
        SELECT usuario_id INTO v_usuario_id
        FROM usuario
        WHERE LOWER(correo) = LOWER(auth.jwt() ->> 'email')
        LIMIT 1;
    END IF;

    RETURN v_usuario_id;
END;
$$;

-- Obtiene el rol del usuario autenticado
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS VARCHAR
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_role VARCHAR;
BEGIN
    -- 1. Verificar si viene en los claims del token JWT (app_metadata / user_metadata)
    v_role := COALESCE(
        auth.jwt() -> 'app_metadata' ->> 'role',
        auth.jwt() -> 'user_metadata' ->> 'role'
    );

    IF v_role IS NOT NULL THEN
        RETURN v_role;
    END IF;

    -- 2. Si no viene en el token, consultar la tabla usuario
    SELECT tipo_cliente INTO v_role
    FROM usuario
    WHERE usuario_id = get_current_usuario_id()
    LIMIT 1;

    RETURN COALESCE(v_role, 'cliente');
END;
$$;

-- Verificadores rápidos de permisos
CREATE OR REPLACE FUNCTION is_staff()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
    SELECT get_current_user_role() IN ('asesor_comercial', 'bodega_inventario', 'calidad_servicio', 'admin', 'service_role');
$$;

CREATE OR REPLACE FUNCTION is_advisor()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
    SELECT get_current_user_role() IN ('asesor_comercial', 'admin', 'service_role');
$$;

CREATE OR REPLACE FUNCTION is_warehouse()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
    SELECT get_current_user_role() IN ('bodega_inventario', 'admin', 'service_role');
$$;

CREATE OR REPLACE FUNCTION is_quality()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
AS $$
    SELECT get_current_user_role() IN ('calidad_servicio', 'admin', 'service_role');
$$;

-- ==============================================================================
-- ACTIVACIÓN DE ROW LEVEL SECURITY EN TODAS LAS TABLAS
-- ==============================================================================
ALTER TABLE usuario ENABLE ROW LEVEL SECURITY;
ALTER TABLE proyecto ENABLE ROW LEVEL SECURITY;
ALTER TABLE especificacion_tecnica ENABLE ROW LEVEL SECURITY;
ALTER TABLE area ENABLE ROW LEVEL SECURITY;
ALTER TABLE producto ENABLE ROW LEVEL SECURITY;
ALTER TABLE cotizacion_detalle ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventario ENABLE ROW LEVEL SECURITY;
ALTER TABLE servicio_aplicacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidencia_calidad ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 1. POLÍTICAS: USUARIO
-- ==============================================================================
DROP POLICY IF EXISTS "usuario_select_policy" ON usuario;
CREATE POLICY "usuario_select_policy" ON usuario
FOR SELECT
TO authenticated
USING (
    -- El propio usuario puede ver su perfil, o el personal interno puede ver a sus clientes
    usuario_id = get_current_usuario_id() OR is_staff()
);

DROP POLICY IF EXISTS "usuario_insert_self" ON usuario;
CREATE POLICY "usuario_insert_self" ON usuario
FOR INSERT
TO authenticated, anon
WITH CHECK (
    -- Permite auto-registro
    auth_user_id IS NULL OR auth_user_id = auth.uid() OR is_staff()
);

DROP POLICY IF EXISTS "usuario_update_self" ON usuario;
CREATE POLICY "usuario_update_self" ON usuario
FOR UPDATE
TO authenticated
USING (
    usuario_id = get_current_usuario_id() OR is_staff()
)
WITH CHECK (
    usuario_id = get_current_usuario_id() OR is_staff()
);

-- ==============================================================================
-- 2. POLÍTICAS: PRODUCTO (Catálogo abierto para consulta)
-- ==============================================================================
DROP POLICY IF EXISTS "producto_select_public" ON producto;
CREATE POLICY "producto_select_public" ON producto
FOR SELECT
TO authenticated, anon
USING (true); -- El catálogo de pinturas Pintuco es público para cotizar

DROP POLICY IF EXISTS "producto_write_staff" ON producto;
CREATE POLICY "producto_write_staff" ON producto
FOR ALL
TO authenticated
USING (is_advisor())
WITH CHECK (is_advisor());

-- ==============================================================================
-- 3. POLÍTICAS: PROYECTO
-- ==============================================================================
DROP POLICY IF EXISTS "proyecto_select_policy" ON proyecto;
CREATE POLICY "proyecto_select_policy" ON proyecto
FOR SELECT
TO authenticated
USING (
    -- El cliente ve solo sus proyectos; asesores y calidad ven todos los proyectos; bodega ve proyectos con abastecimiento
    usuario_id = get_current_usuario_id() 
    OR is_advisor() 
    OR is_quality()
    OR (is_warehouse() AND estado_proyecto IN ('abastecimiento', 'servicio', 'calidad', 'completado'))
);

DROP POLICY IF EXISTS "proyecto_insert_client" ON proyecto;
CREATE POLICY "proyecto_insert_client" ON proyecto
FOR INSERT
TO authenticated
WITH CHECK (
    usuario_id = get_current_usuario_id() OR is_advisor()
);

DROP POLICY IF EXISTS "proyecto_update_policy" ON proyecto;
CREATE POLICY "proyecto_update_policy" ON proyecto
FOR UPDATE
TO authenticated
USING (
    -- Cliente solo puede editar si el proyecto está en etapa inicial 'necesidad'
    (usuario_id = get_current_usuario_id() AND estado_proyecto = 'necesidad')
    OR is_advisor()
    OR is_quality()
)
WITH CHECK (
    (usuario_id = get_current_usuario_id() AND estado_proyecto = 'necesidad')
    OR is_advisor()
    OR is_quality()
);

-- ==============================================================================
-- 4. POLÍTICAS: ESPECIFICACION_TECNICA
-- ==============================================================================
DROP POLICY IF EXISTS "especificacion_select_policy" ON especificacion_tecnica;
CREATE POLICY "especificacion_select_policy" ON especificacion_tecnica
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM proyecto p 
        WHERE p.proyecto_id = especificacion_tecnica.proyecto_id 
        AND (p.usuario_id = get_current_usuario_id() OR is_staff())
    )
);

DROP POLICY IF EXISTS "especificacion_write_policy" ON especificacion_tecnica;
CREATE POLICY "especificacion_write_policy" ON especificacion_tecnica
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM proyecto p 
        WHERE p.proyecto_id = especificacion_tecnica.proyecto_id 
        AND ((p.usuario_id = get_current_usuario_id() AND p.estado_proyecto = 'necesidad') OR is_advisor())
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM proyecto p 
        WHERE p.proyecto_id = especificacion_tecnica.proyecto_id 
        AND ((p.usuario_id = get_current_usuario_id() AND p.estado_proyecto = 'necesidad') OR is_advisor())
    )
);

-- ==============================================================================
-- 5. POLÍTICAS: AREA
-- ==============================================================================
DROP POLICY IF EXISTS "area_select_policy" ON area;
CREATE POLICY "area_select_policy" ON area
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM especificacion_tecnica e
        JOIN proyecto p ON p.proyecto_id = e.proyecto_id
        WHERE e.id_especificado = area.id_especificado
        AND (p.usuario_id = get_current_usuario_id() OR is_staff())
    )
);

DROP POLICY IF EXISTS "area_write_policy" ON area;
CREATE POLICY "area_write_policy" ON area
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM especificacion_tecnica e
        JOIN proyecto p ON p.proyecto_id = e.proyecto_id
        WHERE e.id_especificado = area.id_especificado
        AND ((p.usuario_id = get_current_usuario_id() AND p.estado_proyecto = 'necesidad') OR is_advisor())
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM especificacion_tecnica e
        JOIN proyecto p ON p.proyecto_id = e.proyecto_id
        WHERE e.id_especificado = area.id_especificado
        AND ((p.usuario_id = get_current_usuario_id() AND p.estado_proyecto = 'necesidad') OR is_advisor())
    )
);

-- ==============================================================================
-- 6. POLÍTICAS: COTIZACION_DETALLE
-- ==============================================================================
DROP POLICY IF EXISTS "cotizacion_select_policy" ON cotizacion_detalle;
CREATE POLICY "cotizacion_select_policy" ON cotizacion_detalle
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM proyecto p 
        WHERE p.proyecto_id = cotizacion_detalle.proyecto_id 
        AND (p.usuario_id = get_current_usuario_id() OR is_staff())
    )
);

DROP POLICY IF EXISTS "cotizacion_write_advisor" ON cotizacion_detalle;
CREATE POLICY "cotizacion_write_advisor" ON cotizacion_detalle
FOR ALL
TO authenticated
USING (is_advisor())
WITH CHECK (is_advisor());

-- ==============================================================================
-- 7. POLÍTICAS: INVENTARIO
-- ==============================================================================
DROP POLICY IF EXISTS "inventario_select_policy" ON inventario;
CREATE POLICY "inventario_select_policy" ON inventario
FOR SELECT
TO authenticated
USING (is_staff());

DROP POLICY IF EXISTS "inventario_modify_warehouse" ON inventario;
CREATE POLICY "inventario_modify_warehouse" ON inventario
FOR ALL
TO authenticated
USING (is_warehouse())
WITH CHECK (is_warehouse());

-- ==============================================================================
-- 8. POLÍTICAS: SERVICIO_APLICACION
-- ==============================================================================
DROP POLICY IF EXISTS "servicio_select_policy" ON servicio_aplicacion;
CREATE POLICY "servicio_select_policy" ON servicio_aplicacion
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM proyecto p 
        WHERE p.proyecto_id = servicio_aplicacion.proyecto_id 
        AND (p.usuario_id = get_current_usuario_id() OR is_staff())
    )
);

DROP POLICY IF EXISTS "servicio_write_policy" ON servicio_aplicacion;
CREATE POLICY "servicio_write_policy" ON servicio_aplicacion
FOR ALL
TO authenticated
USING (is_quality() OR is_advisor())
WITH CHECK (is_quality() OR is_advisor());

-- ==============================================================================
-- 9. POLÍTICAS: EVIDENCIA_CALIDAD
-- ==============================================================================
DROP POLICY IF EXISTS "evidencia_select_policy" ON evidencia_calidad;
CREATE POLICY "evidencia_select_policy" ON evidencia_calidad
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM proyecto p 
        WHERE p.proyecto_id = evidencia_calidad.proyecto_id 
        AND (p.usuario_id = get_current_usuario_id() OR is_staff())
    )
);

DROP POLICY IF EXISTS "evidencia_insert_quality" ON evidencia_calidad;
CREATE POLICY "evidencia_insert_quality" ON evidencia_calidad
FOR INSERT
TO authenticated
WITH CHECK (is_quality() OR is_advisor());

DROP POLICY IF EXISTS "evidencia_update_quality" ON evidencia_calidad;
CREATE POLICY "evidencia_update_quality" ON evidencia_calidad
FOR UPDATE
TO authenticated
USING (is_quality() OR is_advisor())
WITH CHECK (is_quality() OR is_advisor());
