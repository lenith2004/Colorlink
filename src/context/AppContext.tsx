import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  UserProfile,
  UserRole,
  PaintProduct,
  InventoryItem,
  PaintRequest,
  InventoryTraceabilityRecord,
  RequestStatus,
  SurfaceType,
  EnvironmentType,
  FinishType,
  QualityChecklist,
  ServicePostSale,
  ChatMessage,
  CartItem,
  BotParsedAction,
} from '../types';
import { processPintuBotMessage } from '../lib/pintuBotEngine';
import {
  DEMO_USERS,
  PRODUCTS_CATALOG,
  INITIAL_INVENTORY,
  INITIAL_REQUESTS,
  INITIAL_TRACEABILITY,
  COLOR_PALETTES,
} from '../data/initialData';
import {
  supabase,
  SUPABASE_URL,
  ColorLinkAPI,
  UsuarioRow,
  ProyectoRow,
  ProductoRow,
  InventarioRow,
  EspecificacionTecnicaRow,
  CotizacionDetalleRow,
  ServicioAplicacionRow,
  EvidenciaRow,
} from '../lib/supabase';

interface SupabaseSyncState {
  connected: boolean;
  message: string;
  isSyncing: boolean;
  lastSyncedAt: string | null;
}

interface AppContextType {
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (logged: boolean) => void;
  logout: () => void;
  allUsers: UserProfile[];
  switchRole: (role: UserRole) => void;
  
  // Products & Inventory
  products: PaintProduct[];
  inventory: InventoryItem[];
  traceability: InventoryTraceabilityRecord[];
  updateInventoryStock: (itemId: string, newStock: number) => void;
  restockProduct: (itemId: string, unitsToAdd: number, batchNumber: string) => void;
  
  // Paint Requests
  requests: PaintRequest[];
  createPaintRequest: (data: Partial<PaintRequest>) => PaintRequest;
  updateRequestStatus: (requestId: string, newStatus: RequestStatus) => void;
  approveTechnicalEvaluation: (
    requestId: string,
    data: { notes: string; discountPercent: number; quotedTotal: number }
  ) => void;
  allocateInventoryToRequest: (
    requestId: string,
    batchNumber: string,
    warehouseZone: string
  ) => { success: boolean; shortage: boolean; missingGallons: number };
  submitQualityInspection: (requestId: string, checklist: QualityChecklist) => void;
  updateServicePostSale: (requestId: string, postSaleData: Partial<ServicePostSale>) => void;
  
  // Active view navigation & modals
  activeView: 'home' | 'dashboard' | 'products' | 'solutions' | 'contact' | 'simulator';
  setActiveView: (view: 'home' | 'dashboard' | 'products' | 'solutions' | 'contact' | 'simulator') => void;
  simulatorScenario: string;
  setSimulatorScenario: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  
  // Modals & Drawers
  isRequestModalOpen: boolean;
  setIsRequestModalOpen: (open: boolean) => void;
  selectedRequestForDetail: PaintRequest | null;
  setSelectedRequestForDetail: (req: PaintRequest | null) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
  
  // AI Advisor Chat
  chatMessages: ChatMessage[];
  sendChatMessage: (text: string) => void;
  
  // Helpers
  calculateRequirements: (
    surface: SurfaceType,
    areaSqMeters: number,
    environment: EnvironmentType,
    finish: FinishType
  ) => {
    product: PaintProduct;
    coats: number;
    coverage: number;
    gallonsNeeded: number;
    suggestedBuckets: number;
    suggestedIndividualGallons: number;
    primerRequiredGallons: number;
    estimatedPriceCOP: number;
  };

  // WhatsApp & Registered Clients Integration
  whatsAppCommercialNumber: string;
  setWhatsAppCommercialNumber: (num: string) => void;
  registeredClients: UserProfile[];
  registerClient: (userData: UserProfile) => {
    user: UserProfile;
    whatsappUrl: string;
    userWhatsAppUrl: string;
    formattedMessage: string;
    userConfirmationMessage: string;
  };
  getWhatsAppRegistrationUrl: (user: UserProfile, phoneOverride?: string) => string;
  getUserConfirmationWhatsAppUrl: (user: UserProfile) => string;
  getWhatsAppQuotationUrl: (request: PaintRequest, phoneOverride?: string) => string;

  // Supabase State & Manual Refresh
  supabaseStatus: SupabaseSyncState;
  refreshFromSupabase: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'pintuco_colorlink_user_v1',
  REQUESTS: 'pintuco_colorlink_requests_v1',
  INVENTORY: 'pintuco_colorlink_inventory_v1',
  TRACEABILITY: 'pintuco_colorlink_traceability_v1',
  CHAT: 'pintuco_colorlink_chat_v1',
  REGISTERED_CLIENTS: 'pintuco_colorlink_registered_clients_v1',
  WHATSAPP_NUMBER: 'pintuco_colorlink_whatsapp_number_v1',
};

const DEFAULT_WHATSAPP_COMMERCIAL = '573101234567';

export const normalizeWhatsAppNumber = (phoneStr: string): string => {
  const digits = (phoneStr || '').replace(/[^0-9]/g, '');
  if (!digits) return '';
  if (digits.length === 10 && digits.startsWith('3')) {
    return `57${digits}`;
  }
  return digits;
};

export const buildUserConfirmationWhatsAppMessage = (user: UserProfile): string => {
  return `🎨 *CONFIRMACIÓN DE REGISTRO - PINTUCO COLORLINK* 🎨\n\n` +
    `¡Hola ${user.name}! Tu registro ha sido procesado exitosamente en el portal oficial de Pintuco ColorLink.\n\n` +
    `📋 *Tus Datos de Acceso Registrados:*\n` +
    `• Documento: ${user.docType || 'CC'} ${user.docNumber}\n` +
    `• Nombre: ${user.name}\n` +
    `• Empresa / Obra: ${user.company || 'Cliente Particular'}\n` +
    `• Celular Registrado: ${user.phone}\n` +
    `• Correo: ${user.email}\n` +
    `• Ciudad Principal: ${user.city || 'Bogotá D.C.'}\n` +
    `• Fecha: ${user.registeredAt || new Date().toLocaleString('es-CO')}\n\n` +
    `💡 *Acceso Rápido:*\n` +
    `Puedes ingresar siempre a tu portal con tu número de documento (${user.docNumber}) para cotizar m² de pintura, ver cartas de color y gestionar pedidos.`;
};

export const buildWhatsAppRegistrationMessage = (user: UserProfile): string => {
  return `🏢 *NUEVO CLIENTE REGISTRADO - PINTUCO COLORLINK* 🎨\n\n` +
    `👤 *Nombre / Contacto:* ${user.name}\n` +
    `🆔 *Documento:* ${user.docType || 'NIT'} ${user.docNumber || 'No indicado'}\n` +
    `🏗️ *Empresa / Obra:* ${user.company || 'Cliente Particular'}\n` +
    `📱 *WhatsApp / Teléfono:* ${user.phone || 'No indicado'}\n` +
    `✉️ *Correo Electrónico:* ${user.email}\n` +
    `📍 *Ciudad de Entrega:* ${user.city || 'Bogotá D.C.'}\n` +
    `📅 *Fecha de Registro:* ${user.registeredAt || new Date().toLocaleString('es-CO')}\n\n` +
    `💬 *Mensaje del Cliente:* Hola, me he registrado exitosamente en el portal Pintuco ColorLink. Deseo recibir asesoría técnica y cotización comercial para mis proyectos de pintura y recubrimientos.`;
};

export const buildWhatsAppQuotationMessage = (req: PaintRequest): string => {
  return `📋 *SOLICITUD DE COTIZACIÓN - PINTUCO COLORLINK* 🎨\n\n` +
    `🔖 *Código Solicitud:* ${req.requestNumber}\n` +
    `🏗️ *Proyecto:* ${req.projectName}\n` +
    `👤 *Cliente:* ${req.clientName} (${req.clientCompany || 'Particular'})\n` +
    `📱 *WhatsApp / Tel:* ${req.clientPhone || 'No indicado'}\n` +
    `📍 *Ciudad:* ${req.city}\n\n` +
    `🧪 *ESPECIFICACIÓN TÉCNICA:*\n` +
    `• Superficie: ${req.surfaceType}\n` +
    `• Área de Obra: ${req.areaSqMeters} m²\n` +
    `• Producto Recomendado: ${req.recommendedProductName}\n` +
    `• Acabado Solicitado: ${req.finish}\n` +
    `• Galones Requeridos: ${req.gallonsNeeded} Gal\n` +
    `• Presupuesto Estimado: $${req.estimatedPriceCOP.toLocaleString('es-CO')} COP\n\n` +
    `💬 Deseo coordinar con un asesor técnico de Pintuco para validar disponibilidad de lote y despacho.`;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Supabase sync & connection state
  const [supabaseStatus, setSupabaseStatus] = useState<SupabaseSyncState>({
    connected: false,
    message: 'Iniciando conexión...',
    isSyncing: false,
    lastSyncedAt: null,
  });

  // Current user & auth state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const saved = localStorage.getItem('pintuco_colorlink_logged_in');
    return saved !== null ? JSON.parse(saved) : false;
  });

  const [currentUser, setCurrentUserState] = useState<UserProfile | null>(() => {
    const savedLoggedIn = localStorage.getItem('pintuco_colorlink_logged_in');
    const isLogged = savedLoggedIn !== null ? JSON.parse(savedLoggedIn) : false;
    if (!isLogged) return null;
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  // Products catalog state (initially populated, synced with Supabase PRODUCTO)
  const [products, setProducts] = useState<PaintProduct[]>(PRODUCTS_CATALOG);

  // Inventory state (synced with Supabase INVENTARIO)
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INVENTORY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_INVENTORY;
  });

  // Traceability logs
  const [traceability, setTraceability] = useState<InventoryTraceabilityRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRACEABILITY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_TRACEABILITY;
  });

  // Requests / Projects state (synced with Supabase PROYECTO + ESPECIFICACION + AREA + COTIZACION)
  const [requests, setRequests] = useState<PaintRequest[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REQUESTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_REQUESTS;
  });

  // Registered clients (synced with Supabase USUARIO)
  const [registeredClients, setRegisteredClients] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REGISTERED_CLIENTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return [
      {
        id: 'user-client-1',
        name: 'Carlos Gómez Arango',
        email: 'carlos.gomez@constructoraandes.com',
        role: 'cliente',
        docType: 'NIT',
        docNumber: '900482195',
        company: 'Constructora Los Andes S.A.S.',
        phone: '+57 312 458 9920',
        city: 'Bogotá D.C.',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        registeredAt: '24/09/2026, 09:30 AM',
      },
    ];
  });

  // Navigation & UI state
  const [activeView, setActiveView] = useState<'home' | 'dashboard' | 'products' | 'solutions' | 'contact' | 'simulator'>('home');
  const [simulatorScenario, setSimulatorScenario] = useState<string>('sala_de_estar');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('Bogotá D.C.');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState<boolean>(false);
  const [selectedRequestForDetail, setSelectedRequestForDetail] = useState<PaintRequest | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  // Chat messages
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'msg-init',
        sender: 'assistant',
        text: '¡Hola! Soy tu Asesor Inteligente ColorLink de Pintuco. 🎨 Puedo calcular los galones de pintura para tu proyecto, recomendarte la mejor formulación técnica (Koraza, Viniltex, Epóxico) o darte el estado en tiempo real de tu solicitud (#SOL-101 a #SOL-105). ¿En qué te ayudo hoy?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: [
          { label: '📐 Calcular galones para 50m²', actionType: 'calc_sample' },
          { label: '🛡️ ¿Qué pintura uso para humedad?', actionType: 'recommend_moisture' },
          { label: '📦 Rastrear solicitud #SOL-102', actionType: 'track_sol_102' },
          { label: '✨ Ver catálogo más vendidos', actionType: 'view_catalog' },
        ],
      },
    ];
  });

  // WhatsApp commercial hotline number
  const [whatsAppCommercialNumber, setWhatsAppCommercialNumber] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WHATSAPP_NUMBER);
    return saved || DEFAULT_WHATSAPP_COMMERCIAL;
  });

  // ----------------------------------------------------------------------------
  // PERSISTENCE: Save to localStorage (as offline cache / optimistic backup)
  // ----------------------------------------------------------------------------
  useEffect(() => {
    if (currentUser && isLoggedIn) {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  }, [currentUser, isLoggedIn]);

  useEffect(() => {
    localStorage.setItem('pintuco_colorlink_logged_in', JSON.stringify(isLoggedIn));
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRACEABILITY, JSON.stringify(traceability));
  }, [traceability]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WHATSAPP_NUMBER, whatsAppCommercialNumber);
  }, [whatsAppCommercialNumber]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.REGISTERED_CLIENTS, JSON.stringify(registeredClients));
  }, [registeredClients]);

  // ============================================================================
  // SUPABASE: Sincronización bidireccional (READ / SEED) con las 9 tablas
  // USUARIO, PROYECTO, PRODUCTO, COTIZACION_DETALLE, ESPECIFICACION_TECNICA,
  // AREA, EVIDENCIA, SERVICIO_APLICACION, INVENTARIO
  // ============================================================================
  const refreshFromSupabase = useCallback(async () => {
    setSupabaseStatus((prev) => ({ ...prev, isSyncing: true }));
    try {
      // 1. LEER TABLA PRODUCTO
      const { data: dbProductos, error: prodErr } = await supabase
        .from('PRODUCTO')
        .select('*')
        .order('NOMBRE_PRODUCTO', { ascending: true });

      if (!prodErr && dbProductos && dbProductos.length > 0) {
        // Enlazar los productos con el catálogo visual
        const mergedProducts = PRODUCTS_CATALOG.map((catProd) => {
          const match = dbProductos.find(
            (p: ProductoRow) =>
              (p.SKU && p.SKU.toLowerCase() === catProd.code.toLowerCase()) ||
              (p.NOMBRE_PRODUCTO && p.NOMBRE_PRODUCTO.toLowerCase().includes(catProd.name.toLowerCase().slice(0, 10)))
          );
          if (match) {
            return {
              ...catProd,
              pricePerGallonCOP: Number(match.PRECIO_UNITARIO) || catProd.pricePerGallonCOP,
              coveragePerGallonSqM: Number(match.RENDIMIENTO_M2_GALON) || catProd.coveragePerGallonSqM,
              recommendedCoats: Number(match.MANOS_RECOMENDADAS) || catProd.recommendedCoats,
            };
          }
          return catProd;
        });
        setProducts(mergedProducts);
      } else if (!prodErr && (!dbProductos || dbProductos.length === 0)) {
        // Inicializar/Sembrar catálogo en Supabase si la tabla PRODUCTO está vacía
        const rowsToSeed = PRODUCTS_CATALOG.map((p) => ({
          SKU: p.code,
          NOMBRE_PRODUCTO: p.name,
          TIPO_PRODUCTO: p.category,
          UNIDAD_MEDIDA: 'Galón',
          PRECIO_UNITARIO: p.pricePerGallonCOP,
          RENDIMIENTO_M2_GALON: p.coveragePerGallonSqM,
          MANOS_RECOMENDADAS: p.recommendedCoats,
        }));
        await ColorLinkAPI.seedProductos(rowsToSeed);
      }

      // 2. LEER TABLA INVENTARIO
      const { data: dbInventario, error: invErr } = await supabase
        .from('INVENTARIO')
        .select('*')
        .order('ID_DE_INVENTARIO', { ascending: true });

      if (!invErr && dbInventario && dbInventario.length > 0) {
        const mappedInventory: InventoryItem[] = dbInventario.map((row: InventarioRow, index: number) => {
          // Buscar producto correspondiente
          const matchingProd = products.find((p) => p.code.includes(String(row.ID_DE_PRODUCTO))) || products[index % products.length];
          const defaultColor = COLOR_PALETTES[index % COLOR_PALETTES.length];
          return {
            id: `inv-${row.ID_DE_INVENTARIO}`,
            dbInventoryId: row.ID_DE_INVENTARIO,
            productId: matchingProd?.id || 'prod-viniltex',
            dbProductId: row.ID_DE_PRODUCTO,
            productName: matchingProd?.name || 'Viniltex Avanzado® Antibacterial',
            category: matchingProd?.category || 'Arquitectónica Interior',
            colorName: defaultColor.name,
            colorHex: defaultColor.hex,
            presentation: index % 2 === 0 ? 'Cuñete (5 Gal)' : 'Galón',
            gallonsPerUnit: index % 2 === 0 ? 5 : 1,
            stockUnits: Number(row.STOCK_DISPONIBLE) || 0,
            reservedUnits: Math.round(Number(row.STOCK_DISPONIBLE) * 0.15),
            minThresholdUnits: 15,
            warehouseZone: row.CENTRO_DISTRIBUCION || 'Bodega Central - Pasillo A-04',
            unitCostCOP: matchingProd?.pricePerGallonCOP || 89900,
            batchNumber: row.LOTE || `LOT-2026-PINTUCO-${row.ID_DE_INVENTARIO}`,
            lastUpdated: row.UPDATED_AT ? row.UPDATED_AT.replace('T', ' ').slice(0, 16) : new Date().toISOString().slice(0, 16),
          };
        });
        setInventory(mappedInventory);
      } else if (!invErr && (!dbInventario || dbInventario.length === 0)) {
        // Inicializar inventario en Supabase si está vacío
        const initialInvRows = INITIAL_INVENTORY.map((inv, idx) => ({
          ID_DE_PRODUCTO: idx + 1,
          CENTRO_DISTRIBUCION: inv.warehouseZone,
          STOCK_DISPONIBLE: inv.stockUnits,
          LOTE: inv.batchNumber,
        }));
        await ColorLinkAPI.seedInventario(initialInvRows);
      }

      // 3. LEER TABLA USUARIO
      const { data: dbUsuarios, error: userErr } = await supabase
        .from('USUARIO')
        .select('*')
        .order('USUARIO_ID', { ascending: false });

      if (!userErr && dbUsuarios && dbUsuarios.length > 0) {
        const mappedUsers: UserProfile[] = dbUsuarios.map((u: UsuarioRow) => ({
          id: `user-${u.USUARIO_ID || u.IDENTIFICACION}`,
          dbUsuarioId: u.USUARIO_ID,
          name: u.NOMBRE,
          email: u.CORREO,
          phone: u.TELEFONO || '',
          role: 'cliente',
          docType: (u.TIPO_CLIENTE === 'comercial' || u.TIPO_CLIENTE === 'industrial' ? 'NIT' : 'CC'),
          docNumber: u.IDENTIFICACION,
          company: u.TIPO_CLIENTE === 'comercial' ? 'Empresa Registrada' : 'Cliente Particular',
          city: 'Bogotá D.C.',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
          registeredAt: u.CREATED_AT ? new Date(u.CREATED_AT).toLocaleString('es-CO') : new Date().toLocaleString('es-CO'),
        }));
        setRegisteredClients(mappedUsers);
      }

      // 4. LEER PROYECTOS Y TABLAS RELACIONADAS (ESPECIFICACION_TECNICA, AREA, COTIZACION_DETALLE, SERVICIO_APLICACION, EVIDENCIA)
      const { data: dbProyectos, error: projErr } = await supabase
        .from('PROYECTO')
        .select('*')
        .order('PROYECTO_ID', { ascending: false });

      if (!projErr && dbProyectos && dbProyectos.length > 0) {
        // Leer también especificaciones técnicas y cotizaciones asociadas
        const { data: dbSpecs } = await supabase.from('ESPECIFICACION_TECNICA').select('*');
        const { data: dbCotizaciones } = await supabase.from('COTIZACION_DETALLE').select('*');
        const { data: dbServicios } = await supabase.from('SERVICIO_APLICACION').select('*');
        // Leer evidencias de calidad desde la tabla EVIDENCIA_CALIDAD (o fallback a EVIDENCIA)
        let dbEvidencias: any[] | null = null;
        const { data: evidCalidad, error: errEvidCalidad } = await supabase.from('EVIDENCIA_CALIDAD').select('*');
        if (!errEvidCalidad && evidCalidad) {
          dbEvidencias = evidCalidad;
        } else {
          const { data: evidSimple } = await supabase.from('EVIDENCIA').select('*');
          dbEvidencias = evidSimple || [];
        }

        const reconstructedRequests: PaintRequest[] = dbProyectos.map((p: ProyectoRow) => {
          const spec = dbSpecs?.find((s: EspecificacionTecnicaRow) => s.PROYECTO_ID === p.PROYECTO_ID);
          const cot = dbCotizaciones?.find((c: CotizacionDetalleRow) => c.PROYECTO_ID === p.PROYECTO_ID);
          const serv = dbServicios?.find((s: ServicioAplicacionRow) => s.PROYECTO_ID === p.PROYECTO_ID);
          const evid = dbEvidencias?.find((e: any) => e.PROYECTO_ID === p.PROYECTO_ID);
          const user = dbUsuarios?.find((u: UsuarioRow) => u.USUARIO_ID === p.USUARIO_ID);

          const surface = (spec?.TIPO_SUPERFICIE as SurfaceType) || 'mamposteria';
          const env = (spec?.AMBIENTE as EnvironmentType) || 'interior';
          const area = Number(p.AREA_M2) || 100;
          const finish: FinishType = 'mate';

          const calc = calculateRequirements(surface, area, env, finish);
          const colorName = spec?.COLOR || 'Blanco Puro';
          const colorHex = COLOR_PALETTES.find((c) => c.name.toLowerCase() === colorName.toLowerCase())?.hex || '#F9FAFB';

          const status = (p.ESTADO_PROYECTO || 'necesidad') as RequestStatus;

          const req: PaintRequest = {
            id: `req-db-${p.PROYECTO_ID}`,
            dbProjectId: p.PROYECTO_ID,
            requestNumber: `SOL-${100 + Number(p.PROYECTO_ID)}`,
            createdAt: p.CREATED_AT ? p.CREATED_AT.replace('T', ' ').slice(0, 16) : new Date().toISOString().slice(0, 16),
            clientName: user?.NOMBRE || 'Cliente Registrado',
            clientCompany: user?.TIPO_CLIENTE === 'comercial' ? 'Constructora Homologada' : 'Particular / Obra',
            clientEmail: user?.CORREO || 'cliente@colorlink.pintuco.com',
            clientPhone: user?.TELEFONO || '+57 300 000 0000',
            city: p.CIUDAD || 'Bogotá D.C.',
            channel: 'web',
            projectName: p.TIPO_PROYECTO || `Proyecto ${colorName}`,
            surfaceType: surface,
            areaSqMeters: area,
            environment: env,
            finish,
            selectedColorName: colorName,
            selectedColorHex: colorHex,
            urgencyDays: 5,
            notes: 'Solicitud sincronizada desde base de datos Supabase.',
            recommendedProductId: calc.product.id,
            recommendedProductName: calc.product.name,
            recommendedCoats: calc.coats,
            coveragePerGallon: calc.coverage,
            gallonsNeeded: spec?.GALONES_ESTIMADOS ? Number(spec.GALONES_ESTIMADOS) : calc.gallonsNeeded,
            suggestedBuckets: calc.suggestedBuckets,
            suggestedIndividualGallons: calc.suggestedIndividualGallons,
            primerRequiredGallons: calc.primerRequiredGallons,
            estimatedPriceCOP: cot?.SUBTOTAL_DE_COSTO ? Number(cot.SUBTOTAL_DE_COSTO) : calc.estimatedPriceCOP,
            status: ['necesidad', 'solucion_tecnica', 'abastecimiento', 'servicio', 'calidad', 'completado'].includes(status)
              ? status
              : 'necesidad',
          };

          if (cot) {
            req.technicalEvaluation = {
              evaluatedBy: 'Ing. Laura Mendoza (Asesor Comercial)',
              evaluationDate: cot.CREATED_AT ? cot.CREATED_AT.slice(0, 16).replace('T', ' ') : new Date().toISOString().slice(0, 16),
              technicalNotes: 'Cotización técnica registrada en tabla COTIZACION_DETALLE de Supabase.',
              discountPercent: 5,
              quotedTotalCOP: Number(cot.SUBTOTAL_DE_COSTO),
              quotePdfGenerated: true,
              isApproved: true,
            };
          }

          if (serv) {
            req.servicePostSale = {
              assignedTechnician: serv.CONTRATISTA_ASIGNADO,
              dispatchDate: serv.FECHA_INICIO,
              deliveredDate: serv.FECHA_FIN || undefined,
              surfacePrepVerified: true,
              applicationVerified: serv.ESTADO_SERVICIO === 'finalizado',
              warrantyCertificateId: `GAR-DB-${p.PROYECTO_ID}`,
              warrantyYears: 5,
            };
          }

          if (evid) {
            req.qualityChecklist = {
              inspectorName: 'Dra. Sofía Rincón V. (Laboratorio Central)',
              inspectionDate: evid.FECHA_REGISTRO ? evid.FECHA_REGISTRO.slice(0, 16).replace('T', ' ') : new Date().toISOString().slice(0, 16),
              viscosityPassed: true,
              viscosityValueKU: 101,
              opacityPassed: true,
              opacityPercent: 99.2,
              dryingTimePassed: true,
              colorMatchPassed: true,
              packagingSealPassed: true,
              approvedForDispatch: true,
              certificateNumber: `CERT-DB-${evid.EVIDENCIA_ID || p.PROYECTO_ID}`,
              observations: evid.DESCRIPCION || 'Conforme a especificación técnica.',
            };
          }

          return req;
        });

        // Combinar con solicitudes locales para no perder demos si hay pocos registros
        setRequests(reconstructedRequests);
      }

      setSupabaseStatus({
        connected: true,
        message: `Conectado exitosamente con Supabase (${SUPABASE_URL})`,
        isSyncing: false,
        lastSyncedAt: new Date().toLocaleTimeString('es-CO'),
      });
    } catch (err: any) {
      console.warn('[Supabase Sync Notice]', err?.message || err);
      setSupabaseStatus({
        connected: false,
        message: err?.message || 'Modo local activo',
        isSyncing: false,
        lastSyncedAt: new Date().toLocaleTimeString('es-CO'),
      });
    }
  }, [products]);

  // Ejecutar sincronización al inicio
  useEffect(() => {
    refreshFromSupabase();
  }, [refreshFromSupabase]);

  // Auth helper methods
  const setCurrentUser = (user: UserProfile | null) => {
    setCurrentUserState(user);
    if (user) {
      setIsLoggedIn(true);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      localStorage.setItem('pintuco_colorlink_logged_in', 'true');
    } else {
      setIsLoggedIn(false);
      localStorage.removeItem(STORAGE_KEYS.USER);
      localStorage.setItem('pintuco_colorlink_logged_in', 'false');
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setCurrentUserState(null);
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.setItem('pintuco_colorlink_logged_in', 'false');
    setActiveView('home');
  };

  const switchRole = (role: UserRole) => {
    const found = DEMO_USERS.find((u) => u.role === role);
    if (found) {
      setCurrentUser(found);
    }
  };

  // Requirement calculation engine
  const calculateRequirements = (
    surface: SurfaceType,
    areaSqMeters: number,
    environment: EnvironmentType,
    finish: FinishType
  ) => {
    let chosenProduct: PaintProduct = products[0];

    if (surface === 'fachada_exterior') {
      chosenProduct = products.find((p) => p.id === 'prod-koraza') || products[0];
    } else if (surface === 'pisos_trafico') {
      if (environment === 'exterior') {
        chosenProduct = products.find((p) => p.id === 'prod-trafico') || products[3];
      } else {
        chosenProduct = products.find((p) => p.id === 'prod-epoxico') || products[3];
      }
    } else if (surface === 'metal_acero') {
      chosenProduct = products.find((p) => p.id === 'prod-pintulux') || products[2];
    } else if (surface === 'madera') {
      chosenProduct = products.find((p) => p.id === 'prod-madera') || products[2];
    } else if (surface === 'zona_humeda') {
      chosenProduct = products.find((p) => p.id === 'prod-aquatec') || products[1];
    } else if (environment === 'exterior') {
      chosenProduct = products.find((p) => p.id === 'prod-koraza') || products[0];
    } else if (environment === 'hospitalario_aseptico') {
      chosenProduct = products.find((p) => p.id === 'prod-viniltex') || products[0];
    } else {
      chosenProduct = products.find((p) => p.id === 'prod-viniltex') || products[0];
    }

    const coats = chosenProduct.recommendedCoats || 2;
    const theoreticalCoverage = chosenProduct.coveragePerGallonSqM || 35;
    
    const totalGallonsRaw = (areaSqMeters * coats) / theoreticalCoverage;
    const gallonsNeeded = Math.max(1, Math.ceil(totalGallonsRaw * 1.05));

    const suggestedBuckets = Math.floor(gallonsNeeded / 5);
    const suggestedIndividualGallons = gallonsNeeded % 5;

    let primerRequiredGallons = 0;
    if (['concreto', 'mamposteria', 'fachada_exterior', 'zona_humeda'].includes(surface)) {
      primerRequiredGallons = Math.ceil(areaSqMeters / 30);
    } else if (surface === 'metal_acero') {
      primerRequiredGallons = Math.ceil(areaSqMeters / 35);
    }

    const bucketPrice = chosenProduct.pricePerGallonCOP * 5 * 0.90;
    const gallonPrice = chosenProduct.pricePerGallonCOP;
    const estimatedPriceCOP = Math.round(suggestedBuckets * bucketPrice + suggestedIndividualGallons * gallonPrice);

    return {
      product: chosenProduct,
      coats,
      coverage: theoreticalCoverage,
      gallonsNeeded,
      suggestedBuckets,
      suggestedIndividualGallons,
      primerRequiredGallons,
      estimatedPriceCOP,
    };
  };

  // ----------------------------------------------------------------------------
  // MUTATION: Create Paint Request
  // Escribe en: USUARIO, PROYECTO, ESPECIFICACION_TECNICA, AREA, COTIZACION_DETALLE
  // ----------------------------------------------------------------------------
  const createPaintRequest = (data: Partial<PaintRequest>): PaintRequest => {
    const nextIndex = requests.length + 101;
    const requestNumber = `SOL-${nextIndex}`;
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const surface = data.surfaceType || 'mamposteria';
    const area = Number(data.areaSqMeters) || 100;
    const env = data.environment || 'interior';
    const finish = data.finish || 'mate';

    const calculation = calculateRequirements(surface, area, env, finish);
    const selectedColor = COLOR_PALETTES.find((c) => c.name === data.selectedColorName) || COLOR_PALETTES[0];

    const tempId = `req-${Date.now()}`;
    const newRequest: PaintRequest = {
      id: tempId,
      requestNumber,
      createdAt: nowStr,
      clientName: data.clientName || (currentUser ? currentUser.name : 'Cliente Invitado'),
      clientCompany: data.clientCompany || (currentUser ? currentUser.company : 'Particular / Obra'),
      clientEmail: data.clientEmail || (currentUser ? currentUser.email : ''),
      clientPhone: data.clientPhone || (currentUser ? currentUser.phone : '+57 300 000 0000'),
      city: data.city || selectedCity,
      channel: data.channel || 'web',
      projectName: data.projectName || `Proyecto de Pintura ${selectedColor.name}`,
      surfaceType: surface,
      areaSqMeters: area,
      environment: env,
      finish: finish,
      selectedColorName: selectedColor.name,
      selectedColorHex: selectedColor.hex,
      urgencyDays: data.urgencyDays || 5,
      notes: data.notes || '',

      recommendedProductId: calculation.product.id,
      recommendedProductName: calculation.product.name,
      recommendedCoats: calculation.coats,
      coveragePerGallon: calculation.coverage,
      gallonsNeeded: calculation.gallonsNeeded,
      suggestedBuckets: calculation.suggestedBuckets,
      suggestedIndividualGallons: calculation.suggestedIndividualGallons,
      primerRequiredGallons: calculation.primerRequiredGallons,
      estimatedPriceCOP: calculation.estimatedPriceCOP,

      status: 'necesidad',
    };

    // Actualización optimista inmediata
    setRequests((prev) => [newRequest, ...prev]);

    // ESCRITURA EN SUPABASE (Tablas con nombres en MAYÚSCULAS)
    ColorLinkAPI.createProyectoCompleto({
      usuario: {
        NOMBRE: newRequest.clientName,
        IDENTIFICACION: (currentUser?.docNumber || '1020304050').replace(/\D/g, '') || '1020304050',
        CORREO: newRequest.clientEmail || `contacto.${Date.now()}@pintuco.com`,
        TELEFONO: newRequest.clientPhone || null,
        TIPO_CLIENTE: (currentUser?.docType === 'NIT' ? 'comercial' : 'residencial'),
      },
      proyecto: {
        CIUDAD: newRequest.city,
        TIPO_PROYECTO: newRequest.projectName,
        AREA_M2: newRequest.areaSqMeters,
        FECHA_REQUERIDA: new Date(Date.now() + (newRequest.urgencyDays || 5) * 86400000).toISOString().slice(0, 10),
        ESTADO_PROYECTO: 'necesidad',
      },
      especificacion: {
        TIPO_SUPERFICIE: newRequest.surfaceType,
        AMBIENTE: newRequest.environment,
        CONDICION: 'buena',
        COLOR: newRequest.selectedColorName,
        GALONES_ESTIMADOS: newRequest.gallonsNeeded,
      },
      areas: [
        {
          DESCRIPCION: `Muro principal (${newRequest.surfaceType})`,
          MEDIDA_M2: newRequest.areaSqMeters,
        },
      ],
      cotizacion: {
        ID_DE_PRODUCTO: 1,
        CANTIDAD_REQUERIDA: newRequest.gallonsNeeded,
        SUBTOTAL_DE_COSTO: newRequest.estimatedPriceCOP,
      },
    }).then((res) => {
      if (res.success && res.proyectoId) {
        console.log(`[Supabase Live Write] Proyecto guardado con PROYECTO_ID: ${res.proyectoId}`);
        // Actualizar el ID de base de datos en la solicitud
        setRequests((prev) =>
          prev.map((r) => (r.id === tempId ? { ...r, dbProjectId: res.proyectoId } : r))
        );
      }
    }).catch((e) => {
      console.warn('[Supabase Live Write Error]', e);
    });

    return newRequest;
  };

  // ----------------------------------------------------------------------------
  // MUTATION: Update Request Status
  // Escribe en: PROYECTO (columna ESTADO_PROYECTO)
  // ----------------------------------------------------------------------------
  const updateRequestStatus = (requestId: string, newStatus: RequestStatus) => {
    setRequests((prev) =>
      prev.map((req) => (req.id === requestId ? { ...req, status: newStatus } : req))
    );
    if (selectedRequestForDetail?.id === requestId) {
      setSelectedRequestForDetail((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    const targetReq = requests.find((r) => r.id === requestId);
    if (targetReq?.dbProjectId) {
      ColorLinkAPI.updateProyectoEstado(targetReq.dbProjectId, newStatus);
    }
  };

  // ----------------------------------------------------------------------------
  // MUTATION: Módulo Comercial - Aprobar Evaluación Técnica
  // Escribe en: PROYECTO (ESTADO_PROYECTO = 'abastecimiento'), COTIZACION_DETALLE
  // ----------------------------------------------------------------------------
  const approveTechnicalEvaluation = (
    requestId: string,
    data: { notes: string; discountPercent: number; quotedTotal: number }
  ) => {
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    let targetDbId: number | undefined;

    setRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          targetDbId = req.dbProjectId;
          const updated: PaintRequest = {
            ...req,
            status: 'abastecimiento',
            technicalEvaluation: {
              evaluatedBy: currentUser?.name || 'Asesor Comercial Pintuco',
              evaluationDate: nowStr,
              technicalNotes: data.notes,
              discountPercent: data.discountPercent,
              quotedTotalCOP: data.quotedTotal,
              quotePdfGenerated: true,
              isApproved: true,
            },
          };
          if (selectedRequestForDetail?.id === requestId) {
            setSelectedRequestForDetail(updated);
          }
          return updated;
        }
        return req;
      })
    );

    // Escribir en Supabase
    if (targetDbId) {
      ColorLinkAPI.updateProyectoEstado(targetDbId, 'abastecimiento');
      supabase.from('COTIZACION_DETALLE').insert({
        PROYECTO_ID: targetDbId,
        ID_DE_PRODUCTO: 1,
        CANTIDAD_REQUERIDA: 1,
        SUBTOTAL_DE_COSTO: data.quotedTotal,
      }).then(() => {
        console.log(`[Supabase Cotización] Registrada para PROYECTO_ID: ${targetDbId}`);
      });
    }
  };

  // ----------------------------------------------------------------------------
  // MUTATION: Módulo Inventario - Asignar Lote y Reservar
  // Escribe en: INVENTARIO (STOCK_DISPONIBLE, UPDATED_AT), PROYECTO (ESTADO_PROYECTO = 'calidad')
  // ----------------------------------------------------------------------------
  const allocateInventoryToRequest = (
    requestId: string,
    batchNumber: string,
    warehouseZone: string
  ) => {
    const targetReq = requests.find((r) => r.id === requestId);
    if (!targetReq) return { success: false, shortage: false, missingGallons: 0 };

    const gallonsNeeded = targetReq.gallonsNeeded;
    const invItem = inventory.find((i) => i.productId === targetReq.recommendedProductId);

    const availableGallons = invItem
      ? (invItem.stockUnits - invItem.reservedUnits) * invItem.gallonsPerUnit
      : 0;

    const isShortage = availableGallons < gallonsNeeded;
    const missingGallons = isShortage ? gallonsNeeded - availableGallons : 0;
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);

    // Actualizar inventario en memoria y en Supabase
    if (invItem) {
      const unitsToConsume = Math.max(1, Math.ceil(gallonsNeeded / invItem.gallonsPerUnit));
      const newStock = Math.max(0, invItem.stockUnits - unitsToConsume);

      setInventory((prev) =>
        prev.map((item) =>
          item.id === invItem.id
            ? {
                ...item,
                stockUnits: newStock,
                lastUpdated: nowStr,
              }
            : item
        )
      );

      // Escribir actualización en Supabase INVENTARIO
      if (invItem.dbInventoryId) {
        ColorLinkAPI.updateInventarioStock(invItem.dbInventoryId, newStock, batchNumber);
      }

      // Bitácora de trazabilidad
      const newLog: InventoryTraceabilityRecord = {
        id: `tr-${Date.now()}`,
        requestId: targetReq.requestNumber,
        clientName: targetReq.clientName,
        productName: targetReq.recommendedProductName,
        presentation: `${invItem.presentation} (Lote: ${batchNumber})`,
        unitsConsumed: unitsToConsume,
        batchNumber,
        date: nowStr,
        operator: currentUser?.name || 'Operador Logístico ColorLink',
      };
      setTraceability((prev) => [newLog, ...prev]);
    }

    setRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          const updated: PaintRequest = {
            ...req,
            status: 'calidad',
            inventoryAllocation: {
              allocatedBy: currentUser?.name || 'Asesor Bodega Pintuco',
              allocatedDate: nowStr,
              batchNumber,
              stockAvailableBefore: !isShortage,
              shortageAlert: isShortage,
              missingGallons,
              warehouseZone,
            },
          };
          if (selectedRequestForDetail?.id === requestId) {
            setSelectedRequestForDetail(updated);
          }
          return updated;
        }
        return req;
      })
    );

    if (targetReq.dbProjectId) {
      ColorLinkAPI.updateProyectoEstado(targetReq.dbProjectId, 'calidad');
    }

    return {
      success: true,
      shortage: isShortage,
      missingGallons,
    };
  };

  // ----------------------------------------------------------------------------
  // MUTATION: Módulo Calidad - Enviar Checklist de Inspección
  // Escribe en: EVIDENCIA (PROYECTO_ID, ETAPA_OBRA, DESCRIPCION, FOTOS_URL), PROYECTO (ESTADO_PROYECTO = 'servicio')
  // ----------------------------------------------------------------------------
  const submitQualityInspection = (requestId: string, checklist: QualityChecklist) => {
    let targetDbId: number | undefined;

    setRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          targetDbId = req.dbProjectId;
          const updated: PaintRequest = {
            ...req,
            status: 'servicio',
            qualityChecklist: checklist,
          };
          if (selectedRequestForDetail?.id === requestId) {
            setSelectedRequestForDetail(updated);
          }
          return updated;
        }
        return req;
      })
    );

    // Escribir en Supabase EVIDENCIA_CALIDAD y PROYECTO
    if (targetDbId) {
      ColorLinkAPI.updateProyectoEstado(targetDbId, 'servicio');
      ColorLinkAPI.addEvidenciaCalidad({
        PROYECTO_ID: targetDbId,
        ETAPA_OBRA: 'Inspección de Laboratorio - Control de Calidad',
        DESCRIPCION: checklist.observations || `Inspección aprobada. Viscosidad: ${checklist.viscosityValueKU} KU. Opacidad: ${checklist.opacityPercent}%. Certificado: ${checklist.certificateNumber}`,
        FOTOS_URL: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
        FECHA_REGISTRO: new Date().toISOString(),
      });
    }
  };

  // ----------------------------------------------------------------------------
  // MUTATION: Módulo Servicio Postventa
  // Escribe en: SERVICIO_APLICACION, PROYECTO (ESTADO_PROYECTO = 'completado')
  // ----------------------------------------------------------------------------
  const updateServicePostSale = (requestId: string, postSaleData: Partial<ServicePostSale>) => {
    let targetDbId: number | undefined;

    setRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          targetDbId = req.dbProjectId;
          const currentPostSale = req.servicePostSale || {
            surfacePrepVerified: true,
            applicationVerified: true,
            warrantyCertificateId: `GAR-${Date.now().toString().slice(-5)}`,
            warrantyYears: 5,
          };
          const updated: PaintRequest = {
            ...req,
            status: 'completado',
            servicePostSale: {
              ...currentPostSale,
              ...postSaleData,
            },
          };
          if (selectedRequestForDetail?.id === requestId) {
            setSelectedRequestForDetail(updated);
          }
          return updated;
        }
        return req;
      })
    );

    // Escribir en Supabase SERVICIO_APLICACION y PROYECTO
    if (targetDbId) {
      ColorLinkAPI.updateProyectoEstado(targetDbId, 'completado');
      ColorLinkAPI.upsertServicioAplicacion({
        PROYECTO_ID: targetDbId,
        CONTRATISTA_ASIGNADO: postSaleData.assignedTechnician || 'Técnico Homologado Pintuco',
        FECHA_INICIO: postSaleData.dispatchDate ? postSaleData.dispatchDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
        FECHA_FIN: postSaleData.deliveredDate ? postSaleData.deliveredDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
        ESTADO_SERVICIO: 'finalizado',
      });
    }
  };

  // ----------------------------------------------------------------------------
  // MUTATION: Inventario Manual & Reabastecimiento
  // Escribe en: INVENTARIO (STOCK_DISPONIBLE, LOTE, UPDATED_AT)
  // ----------------------------------------------------------------------------
  const updateInventoryStock = (itemId: string, newStock: number) => {
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const targetItem = inventory.find((i) => i.id === itemId);

    setInventory((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, stockUnits: newStock, lastUpdated: nowStr } : item))
    );

    if (targetItem?.dbInventoryId) {
      ColorLinkAPI.updateInventarioStock(targetItem.dbInventoryId, newStock);
    }
  };

  const restockProduct = (itemId: string, unitsToAdd: number, batchNumber: string) => {
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const targetItem = inventory.find((i) => i.id === itemId);
    const newStock = (targetItem?.stockUnits || 0) + unitsToAdd;

    setInventory((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              stockUnits: newStock,
              batchNumber: batchNumber || item.batchNumber,
              lastUpdated: nowStr,
            }
          : item
      )
    );

    if (targetItem?.dbInventoryId) {
      ColorLinkAPI.updateInventarioStock(targetItem.dbInventoryId, newStock, batchNumber);
    }
  };

  // ----------------------------------------------------------------------------
  // MUTATION: Registrar Cliente
  // Escribe en: USUARIO (NOMBRE, IDENTIFICACION, CORREO, TELEFONO, TIPO_CLIENTE)
  // ----------------------------------------------------------------------------
  const registerClient = (userData: UserProfile) => {
    const stampedUser: UserProfile = {
      ...userData,
      registeredAt: userData.registeredAt || new Date().toLocaleString('es-CO'),
    };

    setRegisteredClients((prev) => {
      const filtered = prev.filter(
        (u) => u.id !== stampedUser.id && !(stampedUser.docNumber && u.docNumber === stampedUser.docNumber)
      );
      return [stampedUser, ...filtered];
    });

    setCurrentUserState(stampedUser);
    setIsLoggedIn(true);

    // Escribir en Supabase USUARIO
    ColorLinkAPI.findOrCreateUsuario({
      NOMBRE: stampedUser.name,
      IDENTIFICACION: stampedUser.docNumber || stampedUser.id.replace('user-', ''),
      CORREO: stampedUser.email,
      TELEFONO: stampedUser.phone || null,
      TIPO_CLIENTE: stampedUser.docType === 'NIT' ? 'comercial' : 'residencial',
    }).then((usuarioId) => {
      console.log(`[Supabase USUARIO Registrado] USUARIO_ID: ${usuarioId}`);
      stampedUser.dbUsuarioId = usuarioId;
    });

    const userConfirmationMessage = buildUserConfirmationWhatsAppMessage(stampedUser);
    const userWhatsAppUrl = getUserConfirmationWhatsAppUrl(stampedUser);
    const formattedMessage = buildWhatsAppRegistrationMessage(stampedUser);
    const whatsappUrl = getWhatsAppRegistrationUrl(stampedUser);

    return {
      user: stampedUser,
      whatsappUrl,
      userWhatsAppUrl,
      formattedMessage,
      userConfirmationMessage,
    };
  };

  // WhatsApp link generators
  const getWhatsAppRegistrationUrl = (user: UserProfile, phoneOverride?: string): string => {
    const rawTarget = phoneOverride || whatsAppCommercialNumber;
    const targetPhone = normalizeWhatsAppNumber(rawTarget);
    const message = buildWhatsAppRegistrationMessage(user);
    return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
  };

  const getUserConfirmationWhatsAppUrl = (user: UserProfile): string => {
    const targetPhone = normalizeWhatsAppNumber(user.phone || '');
    const message = buildUserConfirmationWhatsAppMessage(user);
    return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
  };

  const getWhatsAppQuotationUrl = (req: PaintRequest, phoneOverride?: string): string => {
    const rawTarget = phoneOverride || whatsAppCommercialNumber;
    const targetPhone = normalizeWhatsAppNumber(rawTarget);
    const message = buildWhatsAppQuotationMessage(req);
    return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
  };

  // AI Chat Assistant
  const sendChatMessage = (userText: string) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: nowTime,
    };

    setChatMessages((prev) => [...prev, userMsg]);

    setTimeout(() => {
      let replyText = '';
      let actions: { label: string; actionType: string; payload?: any }[] | undefined = undefined;

      const lower = userText.toLowerCase();

      const solMatch = lower.match(/sol[- ]?(\d+)/);
      if (solMatch) {
        const num = `SOL-${solMatch[1]}`;
        const found = requests.find((r) => r.requestNumber.toLowerCase() === num.toLowerCase());
        if (found) {
          const statusLabels: Record<RequestStatus, string> = {
            necesidad: '1️⃣ En espera de Solución Técnica',
            solucion_tecnica: '2️⃣ En Evaluación Técnica / Cotización',
            abastecimiento: '3️⃣ En Asignación de Stock y Lote en Bodega',
            calidad: '4️⃣ En Inspección de Calidad de Laboratorio',
            servicio: '5️⃣ En Logística de Despacho y Acompañamiento Técnico',
            completado: '✅ Entregado y Certificado con Garantía Pintuco',
          };
          replyText = `🔍 Encontré la solicitud **${found.requestNumber}**:\n\n• **Proyecto:** ${found.projectName}\n• **Cliente:** ${found.clientName}\n• **Producto:** ${found.recommendedProductName} (${found.gallonsNeeded} Galones)\n• **Estado actual:** ${statusLabels[found.status]}\n• **Ciudad:** ${found.city}`;
          actions = [
            { label: `Ver ficha de ${found.requestNumber}`, actionType: 'open_request', payload: found },
          ];
        } else {
          replyText = `No encontré una solicitud con el código ${num.toUpperCase()}. Las solicitudes activas son: ${requests.map((r) => r.requestNumber).join(', ')}.`;
        }
      } else if (lower.includes('humedad') || lower.includes('terraza') || lower.includes('filtracion') || lower.includes('filtración')) {
        replyText = `🛡️ Para problemas de humedad y cubiertas expuestas te recomiendo **Aquatec® Impermeabilizante Fibratado** (garantía de hasta 10 años) o **Koraza® Máxima Protección** para fachadas con repelencia al agua. ¿Deseas cotizar los m² de tu superficie?`;
        actions = [
          { label: '📐 Cotizar impermeabilización', actionType: 'open_request_modal' },
        ];
      } else if (lower.includes('m2') || lower.includes('m²') || lower.includes('cuanto') || lower.includes('cuánto') || lower.includes('galon') || lower.includes('galón') || lower.includes('calcular')) {
        replyText = `📐 **Regla Técnica Pintuco:**\n• **Viniltex Avanzado:** rinde ~40 m²/gal a 2 manos.\n• **Koraza Exteriores:** rinde ~32 m²/gal a 2 manos.\n• **Epóxico Pisos:** rinde ~25 m²/gal a 2 manos.\n\nPara un área de 50 m², por ejemplo, requieres aproximadamente **2 a 3 galones** según la porosidad de la pared.`;
        actions = [
          { label: 'Abrir Calculadora Automática', actionType: 'open_request_modal' },
        ];
      } else if (lower.includes('epox') || lower.includes('piso') || lower.includes('clinica') || lower.includes('hospital')) {
        replyText = `🏥 Para pisos industriales, bodegas y clínicas, la solución ideal es **Pintuco Epóxico Pisos 100% Sólidos**, acabado monolítico de alta resistencia mecánica a montacargas y desinfectantes hospitalarios.`;
        actions = [
          { label: 'Ver Ficha Epóxico', actionType: 'filter_catalog', payload: 'epoxico' },
          { label: 'Crear Solicitud de Piso', actionType: 'open_request_modal' },
        ];
      } else if (lower.includes('catalogo') || lower.includes('catálogo') || lower.includes('productos') || lower.includes('precio')) {
        replyText = `🎨 Disponemos de las líneas líderes de Pintuco:\n1. **Viniltex Avanzado®** (Interiores / Antibacterial)\n2. **Koraza®** (Fachadas y Exteriores)\n3. **Pintulux®** (Esmalte Sintético Anticorrosivo)\n4. **Epóxico Pisos 100% Sólidos**\n5. **Aquatec® Impermeabilizante**\n6. **Pintuco Tráfico Pesado**`;
        actions = [
          { label: 'Explorar Catálogo', actionType: 'view_catalog' },
          { label: 'Nueva Solicitud', actionType: 'open_request_modal' },
        ];
      } else {
        replyText = `Gracias por tu consulta. ColorLink conecta en segundos tu requerimiento con nuestro laboratorio técnico, centro de distribución y control de calidad. Puedes crear una nueva solicitud con cálculo de m² o consultar el estado de cualquier orden.`;
        actions = [
          { label: 'Crear Solicitud de Material', actionType: 'open_request_modal' },
          { label: 'Ver Estado de Inventario', actionType: 'view_inventory' },
        ];
      }

      const botMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedActions: actions,
      };

      setChatMessages((prev) => [...prev, botMsg]);
    }, 600);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isLoggedIn,
        setIsLoggedIn,
        logout,
        allUsers: DEMO_USERS,
        switchRole,
        products,
        inventory,
        traceability,
        updateInventoryStock,
        restockProduct,
        requests,
        createPaintRequest,
        updateRequestStatus,
        approveTechnicalEvaluation,
        allocateInventoryToRequest,
        submitQualityInspection,
        updateServicePostSale,
        activeView,
        setActiveView,
        simulatorScenario,
        setSimulatorScenario,
        searchQuery,
        setSearchQuery,
        selectedCity,
        setSelectedCity,
        isRequestModalOpen,
        setIsRequestModalOpen,
        selectedRequestForDetail,
        setSelectedRequestForDetail,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isChatOpen,
        setIsChatOpen,
        chatMessages,
        sendChatMessage,
        calculateRequirements,
        whatsAppCommercialNumber,
        setWhatsAppCommercialNumber,
        registeredClients,
        registerClient,
        getWhatsAppRegistrationUrl,
        getUserConfirmationWhatsAppUrl,
        getWhatsAppQuotationUrl,
        supabaseStatus,
        refreshFromSupabase,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
