import React, { createContext, useContext, useState, useEffect } from 'react';
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
} from '../types';
import {
  DEMO_USERS,
  PRODUCTS_CATALOG,
  INITIAL_INVENTORY,
  INITIAL_REQUESTS,
  INITIAL_TRACEABILITY,
  COLOR_PALETTES,
} from '../data/initialData';

interface AppContextType {
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
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
  activeView: 'home' | 'dashboard' | 'products' | 'solutions' | 'contact';
  setActiveView: (view: 'home' | 'dashboard' | 'products' | 'solutions' | 'contact') => void;
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  USER: 'pintuco_colorlink_user_v1',
  REQUESTS: 'pintuco_colorlink_requests_v1',
  INVENTORY: 'pintuco_colorlink_inventory_v1',
  TRACEABILITY: 'pintuco_colorlink_traceability_v1',
  CHAT: 'pintuco_colorlink_chat_v1',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Current user & auth state: default to false if not saved so guest visitors experience full open quoting
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    const saved = localStorage.getItem('pintuco_colorlink_logged_in');
    return saved !== null ? JSON.parse(saved) : false;
  });

  const [currentUser, setCurrentUserState] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.USER);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return DEMO_USERS[0]; // Cliente por defecto
  });

  const [products] = useState<PaintProduct[]>(PRODUCTS_CATALOG);

  // Inventory state
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

  // Requests state
  const [requests, setRequests] = useState<PaintRequest[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.REQUESTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return INITIAL_REQUESTS;
  });

  // Navigation & UI state
  const [activeView, setActiveView] = useState<'home' | 'dashboard' | 'products' | 'solutions' | 'contact'>('home');
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

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
  }, [currentUser]);

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

  const setCurrentUser = (user: UserProfile) => {
    setCurrentUserState(user);
    setIsLoggedIn(true);
  };

  const logout = () => {
    setIsLoggedIn(false);
  };

  const switchRole = (role: UserRole) => {
    const found = DEMO_USERS.find((u) => u.role === role);
    if (found) {
      setCurrentUserState(found);
      setIsLoggedIn(true);
    }
  };

  // Requirement calculation engine
  const calculateRequirements = (
    surface: SurfaceType,
    areaSqMeters: number,
    environment: EnvironmentType,
    finish: FinishType
  ) => {
    let chosenProduct: PaintProduct = products[0]; // Viniltex default

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
    
    // Total gallons calculation
    const totalGallonsRaw = (areaSqMeters * coats) / theoreticalCoverage;
    const gallonsNeeded = Math.max(1, Math.ceil(totalGallonsRaw * 1.05)); // 5% factor de desperdicio técnico

    const suggestedBuckets = Math.floor(gallonsNeeded / 5);
    const suggestedIndividualGallons = gallonsNeeded % 5;

    // Primer requirement
    let primerRequiredGallons = 0;
    if (['concreto', 'mamposteria', 'fachada_exterior', 'zona_humeda'].includes(surface)) {
      primerRequiredGallons = Math.ceil(areaSqMeters / 30);
    } else if (surface === 'metal_acero') {
      primerRequiredGallons = Math.ceil(areaSqMeters / 35);
    }

    // Price calculation with bulk discount for buckets (5 gal)
    const bucketPrice = chosenProduct.pricePerGallonCOP * 5 * 0.90; // 10% ahorro por cuñete
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

  // Create Paint Request
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

    const newRequest: PaintRequest = {
      id: `req-${Date.now()}`,
      requestNumber,
      createdAt: nowStr,
      clientName: data.clientName || currentUser.name,
      clientCompany: data.clientCompany || currentUser.company || 'Particular',
      clientEmail: data.clientEmail || currentUser.email,
      clientPhone: data.clientPhone || currentUser.phone || '+57 300 000 0000',
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

    setRequests((prev) => [newRequest, ...prev]);

    // Check inventory stock warning right away
    const matchedInventory = inventory.find(
      (inv) => inv.productId === calculation.product.id
    );
    const availableGallons = matchedInventory
      ? (matchedInventory.stockUnits - matchedInventory.reservedUnits) * matchedInventory.gallonsPerUnit
      : 0;

    if (matchedInventory && availableGallons < calculation.gallonsNeeded) {
      console.warn(`[ColorLink Alerta] La solicitud ${requestNumber} requiere ${calculation.gallonsNeeded} gal pero hay disponible ${availableGallons} gal.`);
    }

    return newRequest;
  };

  const updateRequestStatus = (requestId: string, newStatus: RequestStatus) => {
    setRequests((prev) =>
      prev.map((req) => (req.id === requestId ? { ...req, status: newStatus } : req))
    );
    if (selectedRequestForDetail?.id === requestId) {
      setSelectedRequestForDetail((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  // Módulo Comercial: Aprobar Evaluación Técnica
  const approveTechnicalEvaluation = (
    requestId: string,
    data: { notes: string; discountPercent: number; quotedTotal: number }
  ) => {
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
          const updated: PaintRequest = {
            ...req,
            status: 'abastecimiento',
            technicalEvaluation: {
              evaluatedBy: currentUser.name,
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
  };

  // Módulo Inventario / Abastecimiento: Asignar Lote y Reservar
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

    // Update inventory reservations & stock
    if (invItem) {
      const unitsToConsume = Math.max(1, Math.ceil(gallonsNeeded / invItem.gallonsPerUnit));
      setInventory((prev) =>
        prev.map((item) =>
          item.id === invItem.id
            ? {
                ...item,
                stockUnits: Math.max(0, item.stockUnits - unitsToConsume),
                lastUpdated: nowStr,
              }
            : item
        )
      );

      // Add to traceability log
      const newLog: InventoryTraceabilityRecord = {
        id: `tr-${Date.now()}`,
        requestId: targetReq.requestNumber,
        clientName: targetReq.clientName,
        productName: targetReq.recommendedProductName,
        presentation: `${invItem.presentation} (Lote: ${batchNumber})`,
        unitsConsumed: unitsToConsume,
        batchNumber,
        date: nowStr,
        operator: currentUser.name,
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
              allocatedBy: currentUser.name,
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

    return {
      success: true,
      shortage: isShortage,
      missingGallons,
    };
  };

  // Módulo Calidad: Enviar Checklist de Inspección
  const submitQualityInspection = (requestId: string, checklist: QualityChecklist) => {
    setRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
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
  };

  // Módulo Servicio Postventa
  const updateServicePostSale = (requestId: string, postSaleData: Partial<ServicePostSale>) => {
    setRequests((prev) =>
      prev.map((req) => {
        if (req.id === requestId) {
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
  };

  const updateInventoryStock = (itemId: string, newStock: number) => {
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setInventory((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, stockUnits: newStock, lastUpdated: nowStr } : item))
    );
  };

  const restockProduct = (itemId: string, unitsToAdd: number, batchNumber: string) => {
    const nowStr = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setInventory((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              stockUnits: item.stockUnits + unitsToAdd,
              batchNumber: batchNumber || item.batchNumber,
              lastUpdated: nowStr,
            }
          : item
      )
    );
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

      // Check order tracking
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
