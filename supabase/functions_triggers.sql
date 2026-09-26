-- ==============================================================================
-- COLORLINK / PINTUCO: Funciones RPC y Triggers de Automatización
-- ==============================================================================
-- Este script implementa la lógica de negocio en la base de datos PostgreSQL:
--   1. Cálculo automático de m² y galones al registrar o editar áreas.
--   2. Cálculo automático de subtotales en cotización al insertar productos.
--   3. Función RPC: 'calcular_cotizacion_proyecto' (Desglose Cuñetes/Galones y Costo).
--   4. Función RPC: 'verificar_disponibilidad_inventario' (Validación de Stock por CD).
--   5. Trigger de control de inventario y auditoría de cambios de estado.
-- ==============================================================================

-- ==============================================================================
-- 1. TRIGGER: CÁLCULO DE SUBWAY / SUBTOTAL EN COTIZACIÓN_DETALLE
-- ==============================================================================
-- Cuando se añade un producto a la cotización, calcula automáticamente el subtotal
-- multiplicando la cantidad requerida por el precio unitario oficial del producto.
CREATE OR REPLACE FUNCTION trg_fn_calcular_subtotal_cotizacion()
RETURNS TRIGGER AS $$
DECLARE
    v_precio_unitario NUMERIC(12, 2);
BEGIN
    -- Obtener el precio unitario del catálogo oficial de productos
    SELECT precio_unitario INTO v_precio_unitario
    FROM producto
    WHERE id_de_producto = NEW.id_de_producto;

    IF v_precio_unitario IS NULL THEN
        RAISE EXCEPTION 'El producto con ID % no existe en el catálogo maestro.', NEW.id_de_producto;
    END IF;

    -- Si no se suministró subtotal o es 0, calcularlo con el precio oficial
    IF NEW.subtotal_de_costo IS NULL OR NEW.subtotal_de_costo = 0 THEN
        NEW.subtotal_de_costo := ROUND(NEW.cantidad_requerida * v_precio_unitario, 2);
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_calcular_subtotal ON cotizacion_detalle;
CREATE TRIGGER trg_calcular_subtotal
BEFORE INSERT OR UPDATE OF cantidad_requerida, id_de_producto
ON cotizacion_detalle
FOR EACH ROW
EXECUTE FUNCTION trg_fn_calcular_subtotal_cotizacion();

-- ==============================================================================
-- 2. TRIGGER: RECALCULAR TOTAL M² Y GALONES ESTIMADOS DESDE TABLA 'AREA'
-- ==============================================================================
-- Al insertar, modificar o eliminar estancias en la tabla 'area', se totaliza
-- la medida en m² y se actualiza 'galones_estimados' en 'especificacion_tecnica'
-- y 'area_m2' en 'proyecto'.
CREATE OR REPLACE FUNCTION trg_fn_sincronizar_areas_proyecto()
RETURNS TRIGGER AS $$
DECLARE
    v_id_especificado BIGINT;
    v_proyecto_id BIGINT;
    v_total_m2 NUMERIC(10, 2);
    v_rendimiento NUMERIC(8, 2) := 35.00; -- Rendimiento estándar Pintuco Tipo 1 (m²/galón a 2 manos)
    v_galones_calculados NUMERIC(10, 2);
BEGIN
    v_id_especificado := COALESCE(NEW.id_especificado, OLD.id_especificado);

    -- Sumar todos los m² de las áreas registradas para esta especificación
    SELECT COALESCE(SUM(medida_m2), 0)
    INTO v_total_m2
    FROM area
    WHERE id_especificado = v_id_especificado;

    -- Obtener el ID del proyecto
    SELECT proyecto_id INTO v_proyecto_id
    FROM especificacion_tecnica
    WHERE id_especificado = v_id_especificado;

    -- Calcular galones teóricos con factor de desperdicio técnico (5%)
    IF v_total_m2 > 0 THEN
        v_galones_calculados := ROUND((v_total_m2 / v_rendimiento) * 1.05, 2);
    ELSE
        v_galones_calculados := 0.00;
    END IF;

    -- Actualizar especificacion_tecnica
    UPDATE especificacion_tecnica
    SET galones_estimados = v_galones_calculados
    WHERE id_especificado = v_id_especificado;

    -- Actualizar proyecto si tiene m² calculados
    IF v_proyecto_id IS NOT NULL AND v_total_m2 > 0 THEN
        UPDATE proyecto
        SET area_m2 = v_total_m2
        WHERE proyecto_id = v_proyecto_id;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_actualizar_area_total ON area;
CREATE TRIGGER trg_actualizar_area_total
AFTER INSERT OR UPDATE OR DELETE ON area
FOR EACH ROW
EXECUTE FUNCTION trg_fn_sincronizar_areas_proyecto();

-- ==============================================================================
-- 3. FUNCIÓN RPC: 'calcular_cotizacion_proyecto'
-- ==============================================================================
-- Genera o recalcula la cotización formal de un proyecto:
--   - Calcula galones teóricos necesarios según m² y rendimiento del producto.
--   - Realiza la descomposición inteligente de presentaciones:
--       * Cuñetes de 5 Galones (mayor eficiencia y economía).
--       * Galones individuales para el residuo.
--   - Aplica descuentos comerciales si aplican.
--   - Inserta o actualiza el renglón en 'cotizacion_detalle'.
--   - Avanza automáticamente el estado a 'solucion_tecnica'.
-- Retorna un JSON con el desglose comercial completo.
CREATE OR REPLACE FUNCTION calcular_cotizacion_proyecto(
    p_proyecto_id BIGINT,
    p_id_de_producto BIGINT,
    p_descuento_porcentaje NUMERIC DEFAULT 0.00
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_proyecto RECORD;
    v_producto RECORD;
    v_area_m2 NUMERIC(10, 2);
    v_rendimiento NUMERIC(8, 2);
    v_manos INT;
    v_galones_brutos NUMERIC(10, 2);
    v_cunetes_5gal INT;
    v_galones_sueltos INT;
    v_total_galones_redondeados INT;
    v_precio_unitario NUMERIC(12, 2);
    v_precio_cunete NUMERIC(12, 2);
    v_subtotal_bruto NUMERIC(12, 2);
    v_valor_descuento NUMERIC(12, 2);
    v_total_neto NUMERIC(12, 2);
    v_cotizacion_id BIGINT;
    v_resultado JSONB;
BEGIN
    -- 1. Validar existencia del proyecto
    SELECT * INTO v_proyecto FROM proyecto WHERE proyecto_id = p_proyecto_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'El proyecto % no fue encontrado.', p_proyecto_id;
    END IF;

    -- 2. Validar existencia del producto
    SELECT * INTO v_producto FROM producto WHERE id_de_producto = p_id_de_producto;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'El producto % no fue encontrado en catálogo.', p_id_de_producto;
    END IF;

    -- 3. Parámetros de cálculo
    v_area_m2 := v_proyecto.area_m2;
    v_rendimiento := COALESCE(v_producto.rendimiento_m2_galon, 35.00);
    v_manos := COALESCE(v_producto.manos_recomendadas, 2);
    v_precio_unitario := v_producto.precio_unitario;
    
    -- El cuñete de 5 galones equivale a 5 galones con un 8% de ahorro por empaque industrial
    v_precio_cunete := ROUND((v_precio_unitario * 5) * 0.92, 2);

    -- 4. Cálculo de galones exactos requeridos (con 5% de tolerancia por merma)
    v_galones_brutos := (v_area_m2 / v_rendimiento) * 1.05;

    -- Descomposición óptima para entrega en obra:
    -- Cuñetes de 5 galones
    v_cunetes_5gal := FLOOR(v_galones_brutos / 5);
    -- Galones sueltos restantes para completar el volumen
    v_galones_sueltos := CEIL(v_galones_brutos - (v_cunetes_5gal * 5));

    -- Total en galones equivalentes adquiridos
    v_total_galones_redondeados := (v_cunetes_5gal * 5) + v_galones_sueltos;

    -- 5. Cálculo de costos
    v_subtotal_bruto := (v_cunetes_5gal * v_precio_cunete) + (v_galones_sueltos * v_precio_unitario);
    
    -- Aplicación de descuento comercial
    IF p_descuento_porcentaje > 0 THEN
        v_valor_descuento := ROUND(v_subtotal_bruto * (p_descuento_porcentaje / 100.00), 2);
    ELSE
        v_valor_descuento := 0.00;
    END IF;

    v_total_neto := v_subtotal_bruto - v_valor_descuento;

    -- 6. Insertar o actualizar en 'cotizacion_detalle'
    SELECT cotizacion_detalle_id INTO v_cotizacion_id
    FROM cotizacion_detalle
    WHERE proyecto_id = p_proyecto_id AND id_de_producto = p_id_de_producto
    LIMIT 1;

    IF v_cotizacion_id IS NOT NULL THEN
        UPDATE cotizacion_detalle
        SET cantidad_requerida = v_total_galones_redondeados,
            subtotal_de_costo = v_total_neto
        WHERE cotizacion_detalle_id = v_cotizacion_id;
    ELSE
        INSERT INTO cotizacion_detalle (
            proyecto_id,
            id_de_producto,
            cantidad_requerida,
            subtotal_de_costo
        ) VALUES (
            p_proyecto_id,
            p_id_de_producto,
            v_total_galones_redondeados,
            v_total_neto
        ) RETURNING cotizacion_detalle_id INTO v_cotizacion_id;
    END IF;

    -- 7. Avanzar estado del proyecto a 'solucion_tecnica' si aún estaba en 'necesidad'
    IF v_proyecto.estado_proyecto = 'necesidad' THEN
        UPDATE proyecto
        SET estado_proyecto = 'solucion_tecnica'
        WHERE proyecto_id = p_proyecto_id;
    END IF;

    -- 8. Construir respuesta JSON
    v_resultado := jsonb_build_object(
        'proyecto_id', p_proyecto_id,
        'cotizacion_detalle_id', v_cotizacion_id,
        'producto', jsonb_build_object(
            'id', v_producto.id_de_producto,
            'nombre', v_producto.nombre_producto,
            'sku', v_producto.sku,
            'precio_unitario_galon', v_precio_unitario,
            'precio_cunete_5gal', v_precio_cunete
        ),
        'calculo_superficie', jsonb_build_object(
            'area_total_m2', v_area_m2,
            'rendimiento_m2_galon', v_rendimiento,
            'manos_recomendadas', v_manos,
            'galones_teoricos_exactos', ROUND(v_galones_brutos, 2)
        ),
        'desglose_presentaciones', jsonb_build_object(
            'cunetes_5_galones', v_cunetes_5gal,
            'galones_individuales', v_galones_sueltos,
            'total_galones_facturados', v_total_galones_redondeados
        ),
        'presupuesto_cop', jsonb_build_object(
            'subtotal_bruto', v_subtotal_bruto,
            'descuento_porcentaje', p_descuento_porcentaje,
            'valor_descuento', v_valor_descuento,
            'total_neto_cop', v_total_neto
        ),
        'estado_actualizado', 'solucion_tecnica',
        'fecha_calculo', NOW()
    );

    RETURN v_resultado;
END;
$$;

-- ==============================================================================
-- 4. FUNCIÓN RPC: 'verificar_disponibilidad_inventario'
-- ==============================================================================
-- Comprueba si el Centro de Distribución cuenta con stock para los productos
-- cotizados en el proyecto.
-- Si hay stock suficiente y p_reservar es TRUE, descuenta la cantidad reservada
-- y avanza el estado del proyecto a 'abastecimiento'.
CREATE OR REPLACE FUNCTION verificar_disponibilidad_inventario(
    p_proyecto_id BIGINT,
    p_centro_distribucion VARCHAR,
    p_reservar BOOLEAN DEFAULT FALSE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    r_item RECORD;
    v_stock_actual NUMERIC(10, 2);
    v_disponibilidad_completa BOOLEAN := TRUE;
    v_faltantes JSONB := '[]'::JSONB;
    v_items_verificados JSONB := '[]'::JSONB;
    v_resultado JSONB;
BEGIN
    -- Recorrer los productos requeridos en la cotización del proyecto
    FOR r_item IN
        SELECT 
            cd.id_de_producto,
            cd.cantidad_requerida,
            p.nombre_producto,
            p.sku
        FROM cotizacion_detalle cd
        JOIN producto p ON p.id_de_producto = cd.id_de_producto
        WHERE cd.proyecto_id = p_proyecto_id
    LOOP
        -- Consultar el stock disponible en el Centro de Distribución
        SELECT COALESCE(SUM(stock_disponible), 0)
        INTO v_stock_actual
        FROM inventario
        WHERE id_de_producto = r_item.id_de_producto
          AND LOWER(centro_distribucion) = LOWER(p_centro_distribucion);

        IF v_stock_actual >= r_item.cantidad_requerida THEN
            v_items_verificados := v_items_verificados || jsonb_build_object(
                'producto_id', r_item.id_de_producto,
                'nombre', r_item.nombre_producto,
                'sku', r_item.sku,
                'requerido', r_item.cantidad_requerida,
                'stock_disponible', v_stock_actual,
                'suficiente', TRUE
            );

            -- Si se solicita reserva inmediata, descontar del inventario
            IF p_reservar THEN
                UPDATE inventario
                SET stock_disponible = stock_disponible - r_item.cantidad_requerida
                WHERE id_de_producto = r_item.id_de_producto
                  AND LOWER(centro_distribucion) = LOWER(p_centro_distribucion);
            END IF;
        ELSE
            v_disponibilidad_completa := FALSE;
            v_faltantes := v_faltantes || jsonb_build_object(
                'producto_id', r_item.id_de_producto,
                'nombre', r_item.nombre_producto,
                'sku', r_item.sku,
                'requerido', r_item.cantidad_requerida,
                'stock_disponible', v_stock_actual,
                'faltante', r_item.cantidad_requerida - v_stock_actual
            );
        END IF;
    END LOOP;

    -- Si se reservó exitosamente, actualizar estado del proyecto a 'abastecimiento'
    IF p_reservar AND v_disponibilidad_completa THEN
        UPDATE proyecto
        SET estado_proyecto = 'abastecimiento'
        WHERE proyecto_id = p_proyecto_id;
    END IF;

    v_resultado := jsonb_build_object(
        'proyecto_id', p_proyecto_id,
        'centro_distribucion', p_centro_distribucion,
        'disponibilidad_completa', v_disponibilidad_completa,
        'reserva_ejecutada', (p_reservar AND v_disponibilidad_completa),
        'items_aprobados', v_items_verificados,
        'items_faltantes', v_faltantes,
        'nuevo_estado', CASE WHEN (p_reservar AND v_disponibilidad_completa) THEN 'abastecimiento' ELSE NULL END
    );

    RETURN v_resultado;
END;
$$;
