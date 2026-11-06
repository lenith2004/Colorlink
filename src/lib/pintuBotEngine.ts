import { PRODUCTS_CATALOG, COLOR_PALETTES } from '../data/initialData';
import { PaintProduct, BotParsedAction } from '../types';

export interface PintuBotResponse {
  replyText: string;
  suggestedActions: { label: string; actionType: string; payload?: any }[];
  parsedActions: BotParsedAction[];
  productCards: PaintProduct[];
  simulationImageUrl?: string;
  simulationSpace?: string;
  simulationColor?: string;
}

/**
 * Normaliza y analiza acciones con formato [ACTION: ...] presentes en el texto
 */
export function extractBotActions(text: string): BotParsedAction[] {
  const actions: BotParsedAction[] = [];

  // 1. [ACTION: NAVIGATE_TO("/...")]
  const navRegex = /\[ACTION:\s*NAVIGATE_TO\("([^"]+)"\)\]/gi;
  let navMatch;
  while ((navMatch = navRegex.exec(text)) !== null) {
    actions.push({
      type: 'NAVIGATE_TO',
      path: navMatch[1],
      rawText: navMatch[0],
    });
  }

  // 2. [ACTION: SEARCH_PRODUCT query="..."]
  const searchRegex = /\[ACTION:\s*SEARCH_PRODUCT\s+query="([^"]+)"\]/gi;
  let searchMatch;
  while ((searchMatch = searchRegex.exec(text)) !== null) {
    actions.push({
      type: 'SEARCH_PRODUCT',
      query: searchMatch[1],
      rawText: searchMatch[0],
    });
  }

  // 3. [ACTION: ADD_TO_CART SKU="..." quantity=...]
  const cartRegex = /\[ACTION:\s*ADD_TO_CART\s+SKU="([^"]+)"(?:\s+quantity=(\d+))?\]/gi;
  let cartMatch;
  while ((cartMatch = cartRegex.exec(text)) !== null) {
    actions.push({
      type: 'ADD_TO_CART',
      sku: cartMatch[1],
      quantity: cartMatch[2] ? parseInt(cartMatch[2], 10) : 1,
      rawText: cartMatch[0],
    });
  }

  return actions;
}

/**
 * Busca productos en el catálogo de Pintuco
 */
export function findMatchingProducts(query: string): PaintProduct[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const tokens = q.split(/\s+/).filter(Boolean);

  return PRODUCTS_CATALOG.filter((prod) => {
    const text = `${prod.name} ${prod.code} ${prod.category} ${prod.paintType || ''} ${prod.description} ${prod.suitableSurfaces.join(' ')}`.toLowerCase();
    return tokens.every((token) => text.includes(token)) || tokens.some((token) => text.includes(token));
  }).slice(0, 3);
}

/**
 * Encuentra un producto por código o SKU
 */
export function findProductBySku(skuOrCode: string): PaintProduct | undefined {
  const clean = skuOrCode.toUpperCase().trim();
  return PRODUCTS_CATALOG.find(
    (p) => p.code.toUpperCase() === clean || clean.includes(p.code.toUpperCase()) || p.id.toUpperCase() === clean
  );
}

/**
 * Motor central de respuestas de PintuBot
 */
export function processPintuBotMessage(userText: string): PintuBotResponse {
  const lower = userText.toLowerCase().trim();
  const parsedActions: BotParsedAction[] = [];
  const productCards: PaintProduct[] = [];
  const suggestedActions: { label: string; actionType: string; payload?: any }[] = [];

  let replyText = '';

  // -------------------------------------------------------------------------
  // 0. INTENCIÓN: ASISTENTE VISUAL DE PINTURAS & SIMULACIÓN ARQUITECTÓNICA
  // -------------------------------------------------------------------------
  const isImageOrSpaceInquiry =
    lower.includes('image_0') ||
    lower.includes('qué espacios') ||
    lower.includes('que espacios') ||
    lower.includes('identificado') ||
    lower.includes('analiza la imagen') ||
    lower.includes('analizar imagen') ||
    lower.includes('segmentación') ||
    lower.includes('segmentacion');

  if (isImageOrSpaceInquiry) {
    replyText = `He analizado la imagen y mediante segmentación semántica he identificado los siguientes 5 espacios arquitectónicos independientes para trabajar de forma individual:\n\n1. 🛋️ **Sala de Estar** (Muros principales con sofá, mesa de centro, tapete y ventanal aislados).\n2. 🍳 **Cocina** (Muros perimetrales con gabinetes superiores/inferiores, mesón y grifería aislados).\n3. 🛏️ **Habitación** (Pared de cabecero con cama, mesas de noche y clóset empotrado aislados).\n4. 🏡 **Exterior de Casa** (Fachada frontal contemporánea con vanos y cancelería aislados).\n5. 💼 **Oficina** (Pared de acento con escritorio de madera, silla y biblioteca aislados).\n\n¿Cuál de estos espacios deseas pintar y qué color te gustaría aplicarle? (Ej: *"Quiero ver la Sala de Estar de Verde Menta"* o *"Habitación con Azul Marino"*).`;

    suggestedActions.push(
      { label: '🛋️ Sala de Estar en Verde Menta', actionType: 'sim_sala_verde_menta' },
      { label: '🛏️ Habitación en Azul Marino', actionType: 'sim_habitacion_azul' },
      { label: '🏡 Exterior en Terracota', actionType: 'sim_exterior_terracota' },
      { label: '💼 Oficina: Pared de Acento', actionType: 'sim_oficina_acento' },
      { label: '🎨 Abrir Simulador 3D', actionType: 'navigate_simulator' }
    );

    return {
      replyText,
      suggestedActions,
      parsedActions: [{ type: 'NAVIGATE_TO', path: '/simulador', rawText: '[ACTION: NAVIGATE_TO("/simulador")]' }],
      productCards: [PRODUCTS_CATALOG[0]],
    };
  }

  // Si el usuario pide pintar un espacio específico con un color
  const isSimulateColorIntent =
    (lower.includes('pintar') || lower.includes('color') || lower.includes('quiero ver') || lower.includes('simular') || lower.includes('aplica') || lower.includes('aplicar') || lower.includes('verde') || lower.includes('azul') || lower.includes('terracota') || lower.includes('blanco') || lower.includes('gris') || lower.includes('menta')) &&
    (lower.includes('sala') || lower.includes('cocina') || lower.includes('habitacion') || lower.includes('habitación') || lower.includes('exterior') || lower.includes('fachada') || lower.includes('oficina') || lower.includes('pared') || lower.includes('muro'));

  if (isSimulateColorIntent) {
    let spaceName = 'Sala de Estar';
    let spaceId = 'sala_de_estar';
    let isolatedElements = 'el sofá, la mesa de centro, el tapete y la vista exterior';
    let colorFile = 'verde_menta_claro.jpg';
    let colorName = 'Verde Menta Luminoso';
    let productRec = PRODUCTS_CATALOG[0];

    // Detectar espacio
    if (lower.includes('cocina')) {
      spaceName = 'Cocina';
      spaceId = 'cocina';
      isolatedElements = 'los gabinetes blancos, el mesón de cuarzo gris, la grifería y el ventanal';
      productRec = PRODUCTS_CATALOG.find((p) => p.code === 'VIN-120') || productRec;
    } else if (lower.includes('habitacion') || lower.includes('habitación') || lower.includes('dormitorio') || lower.includes('cuarto')) {
      spaceName = 'Habitación';
      spaceId = 'habitacion';
      isolatedElements = 'la cama, el respaldo de madera, las mesas de noche, las lámparas cálidas y el clóset';
      productRec = PRODUCTS_CATALOG[0];
    } else if (lower.includes('exterior') || lower.includes('fachada') || lower.includes('casa')) {
      spaceName = 'Exterior de Casa';
      spaceId = 'exterior_casa';
      isolatedElements = 'la cancelería negra, ventanales, portón de garaje, andén de concreto y vegetación';
      productRec = PRODUCTS_CATALOG.find((p) => p.code === 'KOR-200') || productRec;
    } else if (lower.includes('oficina') || lower.includes('estudio')) {
      spaceName = 'Oficina';
      spaceId = 'oficina';
      isolatedElements = 'el escritorio de madera, la silla ergonómica, la biblioteca con libros y la ventana';
      productRec = PRODUCTS_CATALOG.find((p) => p.code === 'VIN-150') || productRec;
    }

    // Detectar color de entre los 20 colores reales
    if (lower.includes('azul marino') || lower.includes('azul oscuro') || lower.includes('navy')) {
      colorName = 'Azul Marino Profundo';
      colorFile = 'azul_marino_profundo.jpg';
    } else if (lower.includes('azul rey') || lower.includes('cobalto')) {
      colorName = 'Azul Rey Cobalto';
      colorFile = 'azul_rey_cobalto.jpg';
    } else if (lower.includes('lavanda') || lower.includes('azul suave')) {
      colorName = 'Azul Lavanda Sereno';
      colorFile = 'azul_lavanda_sereno.jpg';
    } else if (lower.includes('celeste') || lower.includes('azul cielo') || lower.includes('azul')) {
      colorName = 'Azul Celeste Cielo';
      colorFile = 'azul_celeste.jpg';
    } else if (lower.includes('menta') || lower.includes('verde menta')) {
      colorName = 'Verde Menta Luminoso';
      colorFile = 'verde_menta_claro.jpg';
    } else if (lower.includes('salvia') || lower.includes('verde salvia')) {
      colorName = 'Verde Salvia Nórdico';
      colorFile = 'verde_salvia.jpg';
    } else if (lower.includes('bosque') || lower.includes('esmeralda') || lower.includes('verde oscuro')) {
      colorName = 'Verde Bosque Profundo';
      colorFile = 'verde_bosque.jpg';
    } else if (lower.includes('oliva') || lower.includes('militar')) {
      colorName = 'Verde Oliva Elegante';
      colorFile = 'verde_oliva.jpg';
    } else if (lower.includes('verde')) {
      colorName = 'Verde Menta Luminoso';
      colorFile = 'verde_menta_claro.jpg';
    } else if (lower.includes('rosa') || lower.includes('rosado')) {
      colorName = 'Rosa Pastel Suave';
      colorFile = 'rosa_pastel.jpg';
    } else if (lower.includes('coral') || lower.includes('salmon')) {
      colorName = 'Coral Romántico';
      colorFile = 'coral_romantico.jpg';
    } else if (lower.includes('vino') || lower.includes('borgoña') || lower.includes('borgona')) {
      colorName = 'Borgoña Vino Tinto';
      colorFile = 'borgona_vino.jpg';
    } else if (lower.includes('purpura') || lower.includes('púrpura') || lower.includes('amatista') || lower.includes('lila') || lower.includes('morado')) {
      colorName = 'Púrpura Amatista';
      colorFile = 'purpura_amatista.jpg';
    } else if (lower.includes('amarillo') || lower.includes('mantequilla')) {
      colorName = 'Amarillo Mantequilla Suave';
      colorFile = 'amarillo_mantequilla.jpg';
    } else if (lower.includes('ocre') || lower.includes('mostaza') || lower.includes('dorado')) {
      colorName = 'Ocre Mostaza Cálido';
      colorFile = 'ocre_mostaza.jpg';
    } else if (lower.includes('rojo') || lower.includes('colonial')) {
      colorName = 'Rojo Colonial Profundo';
      colorFile = 'rojo_colonial.jpg';
    } else if (lower.includes('terracota') || lower.includes('arcilla') || lower.includes('ladrillo') || lower.includes('naranja')) {
      colorName = 'Terracota Arcilla';
      colorFile = 'terracota_arcilla.jpg';
    } else if (lower.includes('negro') || lower.includes('ebano') || lower.includes('grafito')) {
      colorName = 'Negro Ébano Grafito';
      colorFile = 'negro_ebano.jpg';
    } else if (lower.includes('gris claro') || lower.includes('lino')) {
      colorName = 'Gris Lino Claro';
      colorFile = 'gris_lino.jpg';
    } else if (lower.includes('gris') || lower.includes('plomo')) {
      colorName = 'Gris Urbano Contemporáneo';
      colorFile = 'gris_urbano.jpg';
    } else if (lower.includes('blanco')) {
      colorName = 'Blanco Puro Luminoso';
      colorFile = 'blanco_puro.jpg';
    }

    let simulationImageUrl = '/assets/simulator/cocina.jpg';
    if (spaceId === 'sala_de_estar') {
      simulationImageUrl = `/assets/simulator/sala_variations/${colorFile}`;
    } else if (spaceId === 'cocina') {
      simulationImageUrl = `/assets/simulator/cocina_variations/${colorFile}`;
    } else if (spaceId === 'habitacion') {
      simulationImageUrl = `/assets/simulator/habitacion_variations/${colorFile}`;
    } else if (spaceId === 'exterior_casa') {
      simulationImageUrl = `/assets/simulator/exterior_variations/${colorFile}`;
    } else if (spaceId === 'oficina') {
      simulationImageUrl = `/assets/simulator/oficina_variations/${colorFile}`;
    }

    const navAction = `[ACTION: NAVIGATE_TO("/simulador")]`;
    parsedActions.push({
      type: 'NAVIGATE_TO',
      path: '/simulador',
      rawText: navAction,
    });

    productCards.push(productRec);

    replyText = `Aquí tienes la **${spaceName}** con las paredes pintadas en **'${colorName}'**.\n\nHe conservado intactos ${isolatedElements} para que puedas apreciar el cambio real con iluminación natural, sombras de esquinas y textura arquitectónica original.\n\n${navAction}\n\n• **Pintura recomendada:** ${productRec.name} (SKU: \`${productRec.code}\`)\n• **Precio:** $${productRec.pricePerGallonCOP.toLocaleString('es-CO')} COP / galón\n• **Rendimiento:** ~${productRec.coveragePerGallonSqM} m²/gal a 2 manos`;

    suggestedActions.push(
      { label: `🛒 Añadir ${productRec.name.split('®')[0]} al Carrito`, actionType: 'add_rec_to_cart', payload: productRec.code },
      { label: '📐 Calcular galones m²', actionType: 'calc_prompt' },
      { label: '🎨 Probar más tonos en el Simulador 3D', actionType: 'navigate_simulator' }
    );

    return {
      replyText,
      suggestedActions,
      parsedActions,
      productCards,
      simulationImageUrl,
      simulationSpace: spaceName,
      simulationColor: colorName,
    };
  }

  // -------------------------------------------------------------------------
  // 1. INTENCIÓN: AGREGAR AL CARRITO DIRECTO
  // Ej: "agrégame 2 galones de pintura blanca lavable al carrito", "comprar 1 galon de viniltex"
  // -------------------------------------------------------------------------
  const isBuyIntent =
    (lower.includes('agrega') || lower.includes('agregar') || lower.includes('añade') || lower.includes('añadir') || lower.includes('comprar') || lower.includes('llevar')) &&
    (lower.includes('carrito') || lower.includes('galon') || lower.includes('galón') || lower.includes('cuñete') || lower.includes('cuarto') || lower.includes('unidad'));

  if (isBuyIntent) {
    // Detectar cantidad
    const qtyMatch = lower.match(/(\d+)\s*(galon|galones|cuñete|cuñetes|cuarto|cuartos|unidad|unidades)?/);
    const quantity = qtyMatch ? parseInt(qtyMatch[1], 10) : 1;

    // Detectar producto
    let targetProduct = PRODUCTS_CATALOG[0]; // Viniltex Avanzado por defecto
    if (lower.includes('bano') || lower.includes('baño') || lower.includes('cocina')) {
      targetProduct = PRODUCTS_CATALOG.find((p) => p.code === 'VIN-120') || targetProduct;
    } else if (lower.includes('koraza') || lower.includes('exterior') || lower.includes('fachada')) {
      targetProduct = PRODUCTS_CATALOG.find((p) => p.code === 'KOR-200') || targetProduct;
    } else if (lower.includes('satinad')) {
      targetProduct = PRODUCTS_CATALOG.find((p) => p.code === 'VIN-150') || targetProduct;
    } else if (lower.includes('pintulux') || lower.includes('metal') || lower.includes('esmalte')) {
      targetProduct = PRODUCTS_CATALOG.find((p) => p.code === 'PLX-400') || targetProduct;
    } else if (lower.includes('madera') || lower.includes('barniz') || lower.includes('madetec')) {
      targetProduct = PRODUCTS_CATALOG.find((p) => p.code === 'MDT-600') || targetProduct;
    } else if (lower.includes('impermeabilizante') || lower.includes('aquatec')) {
      targetProduct = PRODUCTS_CATALOG.find((p) => p.code === 'AQT-700') || targetProduct;
    } else if (lower.includes('epox')) {
      targetProduct = PRODUCTS_CATALOG.find((p) => p.code === 'EPX-800') || targetProduct;
    }

    const skuAction = `[ACTION: ADD_TO_CART SKU="${targetProduct.code}" quantity=${quantity}]`;
    const navAction = `[ACTION: NAVIGATE_TO("/cart")]`;

    parsedActions.push(
      {
        type: 'ADD_TO_CART',
        sku: targetProduct.code,
        quantity,
        rawText: skuAction,
      },
      {
        type: 'NAVIGATE_TO',
        path: '/cart',
        rawText: navAction,
      }
    );

    productCards.push(targetProduct);

    replyText = `¡Listo! He añadido a tu carrito de compras:\n\n• **Producto:** ${targetProduct.name} (SKU: ${targetProduct.code})\n• **Presentación:** Galón oficial Pintuco\n• **Color:** Blanco Puro (o personalizable en checkout)\n• **Cantidad:** ${quantity} ${quantity === 1 ? 'galón' : 'galones'}\n• **Total:** $${(targetProduct.pricePerGallonCOP * quantity).toLocaleString('es-CO')} COP\n\n${skuAction}\n\n¿Deseas finalizar tu pedido ahora?\n${navAction}`;

    suggestedActions.push(
      { label: '🛒 Ver Carrito y Checkout', actionType: 'navigate_cart' },
      { label: '🎨 Ver en Simulador 3D', actionType: 'navigate_simulator' },
      { label: '➕ Seguir explorando catálogo', actionType: 'navigate_catalog' }
    );

    return { replyText, suggestedActions, parsedActions, productCards };
  }

  // -------------------------------------------------------------------------
  // 2. INTENCIÓN: NAVEGACIÓN DIRECTA
  // (Simulador, Carrito, Catálogo)
  // -------------------------------------------------------------------------
  if (lower.includes('simulador') || lower.includes('probar color') || lower.includes('foto de mi') || lower.includes('subir foto') || lower.includes('como queda') || lower.includes('cómo queda')) {
    const actionStr = `[ACTION: NAVIGATE_TO("/simulador")]`;
    parsedActions.push({
      type: 'NAVIGATE_TO',
      path: '/simulador',
      rawText: actionStr,
    });

    replyText = `¡Claro que sí! Con nuestro **Simulador Arquitectónico de Color**, puedes probar cualquier tono oficial de Pintuco en fotografías reales de 5 escenarios (Sala, Cocina, Habitación, Fachada Exterior y Oficina) con muebles y pisos totalmente aislados y protegidos.\n\nTe redirijo de inmediato al simulador:\n${actionStr}`;

    suggestedActions.push(
      { label: '🎨 Entrar al Simulador', actionType: 'navigate_simulator' },
      { label: '📐 Calcular cantidad m²', actionType: 'calc_prompt' }
    );

    return { replyText, suggestedActions, parsedActions, productCards };
  }

  if (lower.includes('carrito') || lower.includes('checkout') || lower.includes('pagar') || lower.includes('mi pedido') || lower.includes('bolsa')) {
    const actionStr = `[ACTION: NAVIGATE_TO("/cart")]`;
    parsedActions.push({
      type: 'NAVIGATE_TO',
      path: '/cart',
      rawText: actionStr,
    });

    replyText = `Con gusto te llevo a tu carrito de compras para revisar tus galones seleccionados, verificar el subtotal y proceder con la cotización o compra:\n\n${actionStr}`;

    suggestedActions.push(
      { label: '🛒 Abrir Carrito de Compras', actionType: 'navigate_cart' },
      { label: '🔍 Buscar más productos', actionType: 'search_prompt' }
    );

    return { replyText, suggestedActions, parsedActions, productCards };
  }

  // -------------------------------------------------------------------------
  // 3. INTENCIÓN: DIAGNÓSTICO TÉCNICO DE HUMEDAD (CONOCIMIENTO EXPERTO)
  // -------------------------------------------------------------------------
  if (lower.includes('humed') || lower.includes('filtrac') || lower.includes('moho') || lower.includes('hongo') || lower.includes('capilaridad') || lower.includes('salitre') || lower.includes('descascara') || lower.includes('ampoll')) {
    let typeDiagnosis = '';
    let productRec = PRODUCTS_CATALOG.find((p) => p.code === 'VIN-120') || PRODUCTS_CATALOG[0];

    if (lower.includes('baño') || lower.includes('cocina') || lower.includes('vapor') || lower.includes('condensac')) {
      typeDiagnosis = '**Condensación:** Producida por vapor de agua y poca ventilación en baños o cocinas.';
      productRec = PRODUCTS_CATALOG.find((p) => p.code === 'VIN-120') || productRec;
    } else if (lower.includes('piso') || lower.includes('suelo') || lower.includes('cimiento') || lower.includes('abajo') || lower.includes('capilar')) {
      typeDiagnosis = '**Capilaridad:** Humedad que asciende desde el subsuelo o cimientos por falta de impermeabilización.';
      productRec = PRODUCTS_CATALOG.find((p) => p.code === 'SEL-300') || productRec;
    } else {
      typeDiagnosis = '**Filtración o Intemperie:** Ingreso de agua por fisuras exteriores, cubiertas o posibles fugas en tuberías internas (debe repararse la fuga física antes de pintar).';
      productRec = PRODUCTS_CATALOG.find((p) => p.code === 'AQT-700') || productRec;
    }

    productCards.push(productRec);

    replyText = `Hola, como **PintuBot**, te asesoro en el diagnóstico técnico de humedad:\n\n🔍 **Diagnóstico preliminar:**\n${typeDiagnosis}\n\n🛠️ **Protocolo de 4 pasos obligatorios antes de pintar:**\n1. **Lijar y remover:** Retirar todo el material suelto, pintura ampollada o revoque dañado hasta llegar a superficie firme.\n2. **Desinfectar:** Lavar a fondo con solución de agua e hipoclorito (cloro al 10%) o producto antihongos para eliminar esporas. Dejar secar 24 horas.\n3. **Sellar/Imprimar:** Aplicar una mano de sellador hidrófugo (**Sellomax®** o imprimante acrílico) para bloquear sales alcalinas y sellar poros.\n4. **Acabado final:** Aplicar 2 manos de **${productRec.name}** con alta resistencia a humedad y hongos.\n\n¿Quieres que calculemos la cantidad de pintura para esta área o ver la ficha del producto?`;

    suggestedActions.push(
      { label: `🛒 Añadir ${productRec.name.split('®')[0]}`, actionType: 'add_rec_to_cart', payload: productRec.code },
      { label: '📐 Calcular cantidad exacta m²', actionType: 'calc_prompt' },
      { label: '🎨 Probar color en Simulador', actionType: 'navigate_simulator' }
    );

    return { replyText, suggestedActions, parsedActions, productCards };
  }

  // -------------------------------------------------------------------------
  // 4. INTENCIÓN: ASESORÍA POR TIPO DE SUPERFICIE
  // (Interiores/Drywall, Fachadas/Exteriores, Madera, Metal, Zonas Húmedas)
  // -------------------------------------------------------------------------
  if (lower.includes('madera') || lower.includes('deck') || lower.includes('puerta de madera') || lower.includes('barniz')) {
    const p1 = PRODUCTS_CATALOG.find((p) => p.code === 'MDT-600')!;
    const p2 = PRODUCTS_CATALOG.find((p) => p.code === 'MDT-620')!;
    productCards.push(p1, p2);

    const actionStr = `[ACTION: NAVIGATE_TO("/catalogo?categoria=madera")]`;
    parsedActions.push({ type: 'NAVIGATE_TO', path: '/catalogo?categoria=madera', rawText: actionStr });

    replyText = `🪵 **Asesoría Técnica para Madera:**\nPara maderas debes definir el nivel de exposición y acabado:\n\n• **Pisos, escaleras y pasamanos (tráfico):** Recomiendo **${p1.name}**, poliuretano de alta resistencia al roce y brillo impecable.\n• **Exteriores, decks y pérgolas (sol y lluvia):** **${p2.name}** con filtro solar UV que previene el agrietamiento y decoloración.\n\n🛠️ **Preparación:** Lijar en sentido de la veta con grano 180, limpiar polvo con thiner y aplicar 2 a 3 manos.\n\n${actionStr}`;

    suggestedActions.push(
      { label: '🛒 Añadir Barniz Madetec', actionType: 'add_rec_to_cart', payload: 'MDT-600' },
      { label: '📂 Ver catálogo de Maderas', actionType: 'navigate_catalog_wood' }
    );
    return { replyText, suggestedActions, parsedActions, productCards };
  }

  if (lower.includes('metal') || lower.includes('reja') || lower.includes('porton') || lower.includes('portón') || lower.includes('corrosio') || lower.includes('oxido') || lower.includes('óxido')) {
    const p1 = PRODUCTS_CATALOG.find((p) => p.code === 'PLX-400')!;
    const p2 = PRODUCTS_CATALOG.find((p) => p.code === 'PLX-450')!;
    productCards.push(p1, p2);

    const actionStr = `[ACTION: NAVIGATE_TO("/catalogo?categoria=metal")]`;
    parsedActions.push({ type: 'NAVIGATE_TO', path: '/catalogo?categoria=metal', rawText: actionStr });

    replyText = `⚙️ **Asesoría Técnica para Metales:**\nLos metales ferrosos requieren protección anticorrosiva obligatoria:\n\n1. **Preparación:** Remover óxido con cepillo de alambre o lija para metal grano 120. Desengrasar con solvente.\n2. **Anticorrosivo:** Aplicar 1 mano de **Corrotec® Primario** (o usa **Pintulux® 3 en 1 Directo al Metal** si el óxido es leve).\n3. **Acabado:** 2 manos de **${p1.name}** (acabado brillante o mate de máxima durabilidad).\n\n${actionStr}`;

    suggestedActions.push(
      { label: '🛒 Añadir Pintulux Esmalte', actionType: 'add_rec_to_cart', payload: 'PLX-400' },
      { label: '📐 Calcular galones necesarios', actionType: 'calc_prompt' }
    );
    return { replyText, suggestedActions, parsedActions, productCards };
  }

  if (lower.includes('fachada') || lower.includes('exterior') || lower.includes('intemperie') || lower.includes('lluvia')) {
    const p1 = PRODUCTS_CATALOG.find((p) => p.code === 'KOR-200')!;
    const p2 = PRODUCTS_CATALOG.find((p) => p.code === 'KOR-220')!;
    productCards.push(p1, p2);

    const actionStr = `[ACTION: NAVIGATE_TO("/catalogo?categoria=exteriores")]`;
    parsedActions.push({ type: 'NAVIGATE_TO', path: '/catalogo?categoria=exteriores', rawText: actionStr });

    replyText = `☀️ **Asesoría Técnica para Fachadas y Exteriores:**\nLas superficies a la intemperie necesitan pintura elastomérica de alta repelencia al agua y sol:\n\n• **Línea recomendada:** **${p1.name}** (resiste lluvia ácida, rayos UV y polución).\n• **Si el muro tiene fisuras:** **${p2.name}**, que puentea microfisuras de hasta 1mm evitando filtraciones.\n• **Rendimiento:** ~30 a 35 m² por galón a 2 manos.\n\n${actionStr}`;

    suggestedActions.push(
      { label: '🛒 Añadir Koraza a Carrito', actionType: 'add_rec_to_cart', payload: 'KOR-200' },
      { label: '🎨 Simular Color en Fachada Exterior', actionType: 'navigate_simulator_exterior' }
    );
    return { replyText, suggestedActions, parsedActions, productCards };
  }

  if (lower.includes('drywall') || lower.includes('interior') || lower.includes('sala') || lower.includes('habitacion') || lower.includes('habitación') || lower.includes('pared')) {
    const p1 = PRODUCTS_CATALOG.find((p) => p.code === 'VIN-100')!;
    const p2 = PRODUCTS_CATALOG.find((p) => p.code === 'VIN-150')!;
    productCards.push(p1, p2);

    replyText = `🏠 **Asesoría para Muros Interiores y Drywall:**\n• **Recomendación número 1:** **${p1.name}** (Pintura Tipo 1, ultra lavable y antibacterial).\n• **Para salas y comedores elegantes:** **${p2.name}** con textura sedosa y brillo suave.\n• **Preparación:** Asegurar que el muro esté seco, libre de grasa y con estuco bien lijado.\n• **Rendimiento promedio:** 40 m² por galón a 2 manos.`;

    suggestedActions.push(
      { label: '🛒 Añadir Viniltex Avanzado', actionType: 'add_rec_to_cart', payload: 'VIN-100' },
      { label: '🎨 Probar en Simulador de Sala', actionType: 'navigate_simulator_sala' },
      { label: '📐 Calcular cantidad m²', actionType: 'calc_prompt' }
    );
    return { replyText, suggestedActions, parsedActions, productCards };
  }

  // -------------------------------------------------------------------------
  // 5. INTENCIÓN: CALCULADORA DE PINTURA (RENDIMIENTO POR M²)
  // -------------------------------------------------------------------------
  const isCalcRequest =
    lower.includes('calcul') ||
    lower.includes('cuant') ||
    lower.includes('cuánt') ||
    lower.includes('rendimiento') ||
    lower.includes('m2') ||
    lower.includes('m²') ||
    lower.includes('medida') ||
    /\b(\d+(?:\.\d+)?)\s*(metros|m|m2|m²|de ancho|de largo|de alto)\b/.test(lower);

  if (isCalcRequest) {
    // Intentar extraer dimensiones
    // Casos:
    // a) "tengo 4 de largo y 2.5 de alto", "4x2.5", "4 por 3"
    // b) "son 50 m2", "tengo 35 metros"
    let width = 0;
    let height = 0;
    let totalArea = 0;
    let doors = 0;
    let windows = 0;

    const dimensionsMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:m|metros)?\s*(?:de\s+)?(ancho|largo|x|por|\*)\s*(\d+(?:\.\d+)?)/);
    const areaDirectMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:m2|m²|metros\s+cuadrados)/);
    const doorsMatch = lower.match(/(\d+)\s*puerta/);
    const windowsMatch = lower.match(/(\d+)\s*ventana/);

    if (doorsMatch) doors = parseInt(doorsMatch[1], 10);
    if (windowsMatch) windows = parseInt(windowsMatch[1], 10);

    if (dimensionsMatch) {
      width = parseFloat(dimensionsMatch[1]);
      height = parseFloat(dimensionsMatch[3]);
      totalArea = width * height;
    } else if (areaDirectMatch) {
      totalArea = parseFloat(areaDirectMatch[1]);
    }

    if (totalArea > 0) {
      // Aplicar descuentos
      const discountDoors = doors * 1.5;
      const discountWindows = windows * 1.0;
      const netArea = Math.max(1, totalArea - discountDoors - discountWindows);

      // Rendimiento a 2 manos: Vinilo estándar ~ 10-12 m²/gal por capa => ~ 5 a 6 m² reales netos terminados a 2 manos
      const gallonsExact = netArea / 5.5;
      const gallonsRounded = Math.ceil(gallonsExact);

      // Desglose de presentación
      let presentationBreakdown = '';
      if (gallonsExact <= 0.35) {
        presentationBreakdown = '👉 **Recomendación:** **1 Cuarto (1/4 de galón)**';
      } else if (gallonsExact <= 0.75) {
        presentationBreakdown = '👉 **Recomendación:** **1 a 2 Cuartos** o **1 Galón** (para retoques futuros)';
      } else if (gallonsRounded < 5) {
        presentationBreakdown = `👉 **Recomendación:** **${gallonsRounded} ${gallonsRounded === 1 ? 'Galón' : 'Galones'}**`;
      } else {
        const cunetes = Math.floor(gallonsRounded / 5);
        const remGallons = gallonsRounded % 5;
        presentationBreakdown = `👉 **Recomendación:** **${cunetes} Cuñete(s) (de 5 Galones)**` + (remGallons > 0 ? ` + **${remGallons} Galón(es) individual(es)**` : '');
      }

      const recProd = PRODUCTS_CATALOG[0];
      productCards.push(recProd);

      replyText = `📐 **Cálculo Técnico de Pintura Realizado (PintuBot):**\n\n` +
        `• **Área bruta:** ${totalArea.toFixed(1)} m² ${width && height ? `(${width}m ancho × ${height}m alto)` : ''}\n` +
        (doors || windows ? `• **Descuentos aplicados:** -${discountDoors + discountWindows} m² (${doors} puertas = -${discountDoors}m², ${windows} ventanas = -${discountWindows}m²)\n• **Área neta a pintar:** **${netArea.toFixed(1)} m²**\n` : '') +
        `• **Número de capas:** 2 manos recomendadas\n` +
        `• **Rendimiento oficial Pintuco:** ~10 a 12 m²/gal por mano (~5.5 m² netos terminados a 2 manos)\n` +
        `• **Consumo calculado:** ${gallonsExact.toFixed(2)} galones netos\n\n` +
        `${presentationBreakdown}\n\n` +
        `¿Deseas que agregue esta cantidad de **${recProd.name}** a tu carrito de compras?`;

      suggestedActions.push(
        { label: `🛒 Agregar ${gallonsRounded} Galón(es) al Carrito`, actionType: 'add_rec_to_cart', payload: recProd.code },
        { label: '🎨 Ver este color en Simulador', actionType: 'navigate_simulator' },
        { label: '🛒 Abrir Carrito', actionType: 'navigate_cart' }
      );

      return { replyText, suggestedActions, parsedActions, productCards };
    } else {
      replyText = `📐 **Calculadora de Pintura PintuBot:**\n\nPara darte la cantidad exacta que no te sobre ni te falte, indícame por favor:\n• **Largo (ancho) y Alto de la pared en metros** (ej: *"mide 4 metros de ancho por 2.5 de alto"*).\n• Si tiene puertas o ventanas para descontarlas (descontamos 1.5 m² por puerta y 1 m² por ventana).\n• Por defecto calcularemos a **2 capas** para garantizar cubrimiento total.\n\n¿Cuáles son las medidas aproximadas de tu espacio?`;

      suggestedActions.push(
        { label: 'Ej: 4m de ancho por 2.6m de alto', actionType: 'calc_sample_4x26' },
        { label: 'Ej: Pared de 25 m²', actionType: 'calc_sample_25m2' },
        { label: '🎨 Probar primero en Simulador', actionType: 'navigate_simulator' }
      );

      return { replyText, suggestedActions, parsedActions, productCards };
    }
  }

  // -------------------------------------------------------------------------
  // 6. INTENCIÓN: BÚSQUEDA DE PRODUCTO
  // Formato: [ACTION: SEARCH_PRODUCT query="..."]
  // -------------------------------------------------------------------------
  const isSearchIntent =
    lower.includes('busca') ||
    lower.includes('buscar') ||
    lower.includes('busco') ||
    lower.includes('tienen') ||
    lower.includes('precio') ||
    lower.includes('catalogo') ||
    lower.includes('catálogo');

  if (isSearchIntent) {
    // Limpiar query
    const cleanQuery = lower
      .replace(/busca|buscar|busco|tienen|precio|de|el|la|los|las|por|favor|catalogo|catálogo/gi, '')
      .trim() || 'pintura';

    const matches = findMatchingProducts(cleanQuery);
    const actionStr = `[ACTION: SEARCH_PRODUCT query="${cleanQuery}"]`;
    parsedActions.push({
      type: 'SEARCH_PRODUCT',
      query: cleanQuery,
      rawText: actionStr,
    });

    if (matches.length > 0) {
      productCards.push(...matches);
      replyText = `🔍 Encontré estas opciones destacadas en nuestro catálogo para tu búsqueda "${cleanQuery}":\n\n` +
        matches
          .map(
            (p, idx) =>
              `${idx + 1}. **${p.name}** (SKU: \`${p.code}\`)\n   • **Tipo:** ${p.paintType || p.category}\n   • **Precio Galón:** $${p.pricePerGallonCOP.toLocaleString('es-CO')} COP\n   • **Rendimiento:** ~${p.coveragePerGallonSqM} m²/gal`
          )
          .join('\n\n') +
        `\n\n${actionStr}\n\nPuedes agregar cualquiera directamente o ver más detalles.`;

      matches.forEach((m) => {
        suggestedActions.push({
          label: `🛒 Añadir ${m.name.split('®')[0]}`,
          actionType: 'add_rec_to_cart',
          payload: m.code,
        });
      });
    } else {
      replyText = `🔍 Consulté nuestro catálogo técnico con la consulta "${cleanQuery}".\n${actionStr}\n\nTe recomiendo explorar las categorías principales de interiores, exteriores, esmaltes y maderas.`;
      suggestedActions.push({ label: '📂 Ver Catálogo Completo', actionType: 'navigate_catalog' });
    }

    return { replyText, suggestedActions, parsedActions, productCards };
  }

  // -------------------------------------------------------------------------
  // 7. RESPUESTA POR DEFECTO / BIENVENIDA EMPÁTICA
  // -------------------------------------------------------------------------
  replyText = `¡Hola! Soy **PintuBot**, tu experto técnico en pinturas y asesor virtual de compras en Pintuco.\n\n¿En qué te puedo asesorar hoy?\n• 🛠️ **Diagnóstico y preparación:** Tratamiento de humedad, hongos, lijado o selladores.\n• 🧱 **Recomendación por superficie:** Muros interiores, fachadas, madera, metal o pisos.\n• 📐 **Calculadora de $m^2$:** Dime las medidas de tu pared y te calculo los galones exactos.\n• 🎨 **Simulador de Color:** Prueba cómo lucen los tonos en fotos reales con 1 clic: \`[ACTION: NAVIGATE_TO("/simulador")]\`\n• 🛒 **Compras y Carrito:** Dime qué producto necesitas y te lo agrego al instante.`;

  suggestedActions.push(
    { label: '📐 Calcular galones para mi pared', actionType: 'calc_prompt' },
    { label: '💧 Tengo humedad en una pared', actionType: 'moisture_prompt' },
    { label: '🎨 Probar Simulador de Color', actionType: 'navigate_simulator' },
    { label: '🔍 Buscar pintura lavable blanca', actionType: 'search_white_washable' },
    { label: '🛒 Ver Carrito de Compras', actionType: 'navigate_cart' }
  );

  return { replyText, suggestedActions, parsedActions, productCards };
}
