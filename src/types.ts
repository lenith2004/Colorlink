export type UserRole = 'cliente' | 'asesor_comercial' | 'bodega_inventario' | 'calidad_servicio';

export type DocumentType = 'CC' | 'NIT' | 'CE' | 'PASAPORTE' | 'RUT';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  docType?: DocumentType;
  docNumber?: string;
  company?: string;
  phone?: string;
  avatarUrl?: string;
  city?: string;
}

export type RequestStatus = 
  | 'necesidad'           // 1. Necesidad del cliente
  | 'solucion_tecnica'    // 2. Solución técnica (Evaluación / Cotización)
  | 'abastecimiento'      // 3. Abastecimiento (Reserva de inventario / Lotes)
  | 'servicio'            // 4. Servicio / Despacho / Aplicación
  | 'calidad'             // 5. Control de Calidad / Certificación
  | 'completado';         // Finalizado con garantía

export type ChannelSource = 'web' | 'whatsapp' | 'tienda' | 'call_center';

export type SurfaceType = 
  | 'mamposteria' 
  | 'drywall' 
  | 'concreto' 
  | 'metal_acero' 
  | 'madera' 
  | 'pisos_trafico' 
  | 'fachada_exterior' 
  | 'zona_humeda';

export type FinishType = 'mate' | 'satinado' | 'semibrillante' | 'brillante' | 'epoxico_antideslizante';

export type EnvironmentType = 'interior' | 'exterior' | 'industrial_marino' | 'hospitalario_aseptico';

export interface PaintProduct {
  id: string;
  code: string;
  name: string;
  category: string;
  paintType?: string;
  description: string;
  suitableSurfaces: SurfaceType[];
  surfaceImage?: string;
  surfaceLabels?: { name: string; icon: string; description: string }[];
  applicationTip?: string;
  suitableEnvironments: EnvironmentType[];
  coveragePerGallonSqM: number; // Rendimiento teórico m² / galón a 2 manos
  recommendedCoats: number;
  availableFinishes: FinishType[];
  colors: string[];
  pricePerGallonCOP: number;
  image: string;
  badge?: string;
  dryingTimeHours: number;
  vocLevel: string;
  warrantyYears: number;
}

export interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  category: string;
  colorName: string;
  colorHex: string;
  presentation: 'Galón' | 'Cuñete (5 Gal)' | 'Tambor (55 Gal)';
  gallonsPerUnit: number;
  stockUnits: number;
  reservedUnits: number;
  minThresholdUnits: number;
  warehouseZone: string;
  unitCostCOP: number;
  batchNumber: string;
  lastUpdated: string;
}

export interface InventoryTraceabilityRecord {
  id: string;
  requestId: string;
  clientName: string;
  productName: string;
  presentation: string;
  unitsConsumed: number;
  batchNumber: string;
  date: string;
  operator: string;
}

export interface QualityChecklist {
  inspectorName: string;
  inspectionDate: string;
  viscosityPassed: boolean;
  viscosityValueKU: number; // ej: 95-105 KU
  opacityPassed: boolean;
  opacityPercent: number; // ej: 98.5%
  dryingTimePassed: boolean;
  colorMatchPassed: boolean; // Delta E < 0.5
  packagingSealPassed: boolean;
  approvedForDispatch: boolean;
  certificateNumber: string;
  observations: string;
}

export interface ServicePostSale {
  assignedTechnician?: string;
  dispatchDate?: string;
  deliveredDate?: string;
  surfacePrepVerified: boolean;
  applicationVerified: boolean;
  warrantyCertificateId: string;
  warrantyYears: number;
  clientSatisfactionRating?: number; // 1-5
  feedbackNotes?: string;
}

export interface PaintRequest {
  id: string;
  requestNumber: string; // ej. SOL-104
  createdAt: string;
  clientName: string;
  clientCompany?: string;
  clientEmail: string;
  clientPhone: string;
  city: string;
  channel: ChannelSource;
  projectName: string;
  
  // Especificaciones técnicas solicitadas
  surfaceType: SurfaceType;
  areaSqMeters: number;
  environment: EnvironmentType;
  finish: FinishType;
  selectedColorName: string;
  selectedColorHex: string;
  urgencyDays: number;
  notes?: string;

  // Cálculo de Materiales sugerido por IA/Sistema
  recommendedProductId: string;
  recommendedProductName: string;
  recommendedCoats: number;
  coveragePerGallon: number;
  gallonsNeeded: number;
  suggestedBuckets: number; // Cuñetes de 5 gal
  suggestedIndividualGallons: number;
  primerRequiredGallons: number;
  estimatedPriceCOP: number;

  // Estado del flujo
  status: RequestStatus;

  // Módulo 3: Técnico / Comercial
  technicalEvaluation?: {
    evaluatedBy: string;
    evaluationDate: string;
    technicalNotes: string;
    discountPercent: number;
    quotedTotalCOP: number;
    quotePdfGenerated: boolean;
    isApproved: boolean;
  };

  // Módulo 4: Abastecimiento / Inventario
  inventoryAllocation?: {
    allocatedBy: string;
    allocatedDate: string;
    batchNumber: string;
    stockAvailableBefore: boolean;
    shortageAlert: boolean;
    missingGallons: number;
    warehouseZone: string;
  };

  // Módulo 5: Calidad y Servicio
  qualityChecklist?: QualityChecklist;
  servicePostSale?: ServicePostSale;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  suggestedActions?: { label: string; actionType: string; payload?: any }[];
}
