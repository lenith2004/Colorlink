import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Sun,
  Moon,
  Lamp,
  Layers,
  Check,
  Pipette,
  Maximize2,
  Home,
  Building,
  Bed,
  Briefcase,
  Utensils,
  ZoomIn,
  Search,
  CheckCircle2,
  Info,
  Split,
  Camera,
  RotateCcw,
  Palette,
} from 'lucide-react';
import { SurfaceType, FinishType, EnvironmentType, ColorPaletteItem } from '../types';
import { COLOR_PALETTES } from '../data/initialData';

interface ColorSimulationStudioProps {
  selectedColorName: string;
  selectedColorHex: string;
  onSelectColor: (color: ColorPaletteItem) => void;
  surfaceType: SurfaceType;
  finish: FinishType;
  environment: EnvironmentType;
  productName?: string;
}

export type SceneZone =
  | 'sala_estar'
  | 'fachada_exterior'
  | 'dormitorio'
  | 'oficina_estudio'
  | 'cocina_comedor'
  | 'macro_textura';

export type LightingMode = 'daylight' | 'warm' | 'cool' | 'golden_hour';

// Extended official Pintuco Color Portfolios (Carteras de Color)
export interface ColorPortfolio {
  id: string;
  name: string;
  icon: string;
  description: string;
  colors: ColorPaletteItem[];
}

export const PINTUCO_PORTFOLIOS: ColorPortfolio[] = [
  {
    id: 'tendencias_2025',
    name: 'Tendencias 2025',
    icon: '🌟',
    description: 'Paleta del año: Biofilia, calma reconfortante y tonos orgánicos equilibrados.',
    colors: [
      { name: 'Verde Salvia Nórdico', hex: '#84A98C', category: 'Tendencias 2025', code: 'PIN-6045', lrv: 44, family: 'Salvia Mineral', description: 'Tono botánico suave, aporta serenidad zen y conexión biofílica en interiores contemporáneos.' },
      { name: 'Terracota Colonial', hex: '#C2410C', category: 'Tendencias 2025', code: 'PIN-3050', lrv: 20, family: 'Arcilla Tradicional', description: 'Tierra cálida de carácter artesanal, ideal para muros de acento y fachadas.' },
      { name: 'Arena Sahara', hex: '#D4B996', category: 'Tendencias 2025', code: 'PIN-3015', lrv: 58, family: 'Tierra Suave', description: 'Neutro cálido y acogedor, combina con maderas nobles, lino y acabados en piedra.' },
      { name: 'Lino Nórdico', hex: '#E2E8F0', category: 'Tendencias 2025', code: 'PIN-1040', lrv: 74, family: 'Gris Arquitectónico', description: 'Gris ultra claro y aireado, preferido en arquitectura moderna y divisiones de drywall.' },
      { name: 'Ocre Dorado', hex: '#D97706', category: 'Tendencias 2025', code: 'PIN-3080', lrv: 29, family: 'Mostaza Cálido', description: 'Amarillo tostado que evoca la luz dorada de la tarde y la calidez del hogar.' },
      { name: 'Durazno Cálido', hex: '#FDBA74', category: 'Tendencias 2025', code: 'PIN-3022', lrv: 63, family: 'Melocotón Serena', description: 'Matiz suave y envolvente para dormitorios y salas de relajación.' },
      { name: 'Verde Eucalipto', hex: '#52796F', category: 'Tendencias 2025', code: 'PIN-6055', lrv: 24, family: 'Biofilia Profunda', description: 'Verde arquitectónico sobrio con matiz grisáceo para muros de acento.' },
      { name: 'Marfil Suave', hex: '#FEF3C7', category: 'Tendencias 2025', code: 'PIN-1025', lrv: 78, family: 'Blanco Cálido', description: 'Elegancia clásica aterciopelada, aporta calidez y luminosidad natural.' },
    ],
  },
  {
    id: 'blancos_luminosidad',
    name: 'Blancos & Luz',
    icon: '⚪',
    description: 'Máxima reflectancia lumínica (LRV > 75%), sensación de amplitud y pureza.',
    colors: [
      { name: 'Blanco Puro', hex: '#F9FAFB', category: 'Blancos & Luz', code: 'PIN-1001', lrv: 88, family: 'Blanco Luminoso', description: 'Blanco óptico de máxima reflectancia, perfecto para cielos rasos y muros despejados.' },
      { name: 'Nieve Andina', hex: '#FFFFFF', category: 'Blancos & Luz', code: 'PIN-1000', lrv: 92, family: 'Blanco Absoluto', description: 'Pureza visual total, maximiza la luz natural en espacios con ventanales.' },
      { name: 'Blanco Seda', hex: '#F1F5F9', category: 'Blancos & Luz', code: 'PIN-1030', lrv: 82, family: 'Gris Perla Suave', description: 'Blanco con leve matiz frío de alta definición arquitectónica.' },
      { name: 'Marfil Suave', hex: '#FEF3C7', category: 'Blancos & Luz', code: 'PIN-1025', lrv: 78, family: 'Blanco Cálido', description: 'Calidez discreta y confortable sin reflejos deslumbrantes.' },
      { name: 'Crema Imperial', hex: '#FDF6E2', category: 'Blancos & Luz', code: 'PIN-1015', lrv: 80, family: 'Vainilla Neutro', description: 'Tono marfil elegante para ambientes residenciales clásicos o transicionales.' },
      { name: 'Lino Nórdico', hex: '#E2E8F0', category: 'Blancos & Luz', code: 'PIN-1040', lrv: 74, family: 'Gris Arquitectónico', description: 'Grisáceo luminoso que disimula el paso del tiempo y el roce cotidiano.' },
    ],
  },
  {
    id: 'grises_contemporaneos',
    name: 'Grises & Concreto',
    icon: '🏢',
    description: 'Sobriedad metropolitana, textura de concreto arquitectónico y alta elegancia.',
    colors: [
      { name: 'Lino Nórdico', hex: '#E2E8F0', category: 'Grises & Concreto', code: 'PIN-1040', lrv: 74, family: 'Gris Luminoso', description: 'Gris perla claro, versátil para todo tipo de iluminación interior.' },
      { name: 'Gris Urbano', hex: '#94A3B8', category: 'Grises & Concreto', code: 'PIN-2015', lrv: 52, family: 'Neutro Medio', description: 'Gris medio contemporáneo, predilecto en oficinas, recepciones y pasillos.' },
      { name: 'Gris Cemento', hex: '#64748B', category: 'Grises & Concreto', code: 'PIN-2045', lrv: 38, family: 'Concreto Pulido', description: 'Inspirado en losas de hormigón a la vista para estilos industriales y loft.' },
      { name: 'Gris Plomo', hex: '#475569', category: 'Grises & Concreto', code: 'PIN-2080', lrv: 26, family: 'Grafito Intenso', description: 'Gris oscuro con gran prestancia para fondos de TV o cabeceros.' },
      { name: 'Grafito Titanio', hex: '#334155', category: 'Grises & Concreto', code: 'PIN-2090', lrv: 18, family: 'Antracita Puro', description: 'Carácter imponente y alta sofisticación para detalles arquitectónicos.' },
      { name: 'Piedra París', hex: '#CBD5E1', category: 'Grises & Concreto', code: 'PIN-2005', lrv: 66, family: 'Gris Caliza', description: 'Tono mineral suave que aporta elegancia atemporal y equilibrio.' },
    ],
  },
  {
    id: 'azules_oceano',
    name: 'Azules & Océano',
    icon: '🌊',
    description: 'Calma mental, concentración, profundidad espacial y prestigio institucional.',
    colors: [
      { name: 'Azul Pintuco', hex: '#1B2A6B', category: 'Azules & Océano', code: 'PIN-5010', lrv: 12, family: 'Azul Institucional', description: 'El azul de referencia Pintuco: prestigio, solidez pigmentaria y máxima durabilidad.' },
      { name: 'Azul Naval Profundo', hex: '#0F172A', category: 'Azules & Océano', code: 'PIN-5095', lrv: 7, family: 'Noche Profundo', description: 'Azul noche de acento sobrio, transmite lujo contemporáneo y silencio visual.' },
      { name: 'Azul Índigo Real', hex: '#1E3A8A', category: 'Azules & Océano', code: 'PIN-5040', lrv: 15, family: 'Índigo Cobalto', description: 'Tono regio y vibrante para salas de juntas y muros protagonistas.' },
      { name: 'Azul Mediterráneo', hex: '#0284C7', category: 'Azules & Océano', code: 'PIN-5025', lrv: 28, family: 'Azul Marino Cielo', description: 'Fresco y estimulante, ideal para salas de juego, terrazas o zonas creativas.' },
      { name: 'Celeste Glaciar', hex: '#BAE6FD', category: 'Azules & Océano', code: 'PIN-5005', lrv: 70, family: 'Pastel Aire', description: 'Claridad etérea que amplía visualmente recámaras infantiles y consultorios.' },
    ],
  },
  {
    id: 'verdes_biofilicos',
    name: 'Verdes & Biofilia',
    icon: '🌿',
    description: 'Conexión con la naturaleza viva, renovación de energía y bienestar psicológico.',
    colors: [
      { name: 'Verde Foresta', hex: '#2FAE6D', category: 'Verdes & Biofilia', code: 'PIN-6020', lrv: 34, family: 'Biofilia Vibrante', description: 'Verde orgánico y natural, aporta frescura, renovación y equilibrio ambiental.' },
      { name: 'Verde Salvia Nórdico', hex: '#84A98C', category: 'Verdes & Biofilia', code: 'PIN-6045', lrv: 44, family: 'Salvia Mineral', description: 'Tono botánico desaturado, favorito de diseñadores para estancias de descanso.' },
      { name: 'Verde Esmeralda Colombia', hex: '#059669', category: 'Verdes & Biofilia', code: 'PIN-6030', lrv: 28, family: 'Joya Botánica', description: 'Verde joya profundo, resalta molduras clásicas y cuadros decorativos.' },
      { name: 'Verde Olivo Colonial', hex: '#4D7C0F', category: 'Verdes & Biofilia', code: 'PIN-6060', lrv: 25, family: 'Olivo Rústico', description: 'Evoca olivares mediterráneos y jardines de haciendas coloniales.' },
      { name: 'Menta Suave', hex: '#A7F3D0', category: 'Verdes & Biofilia', code: 'PIN-6010', lrv: 72, family: 'Menta Pastel', description: 'Frescura tonificante, muy recomendada en cuartos de estudio y baños.' },
    ],
  },
  {
    id: 'calidos_tierras',
    name: 'Tierras & Terracota',
    icon: '🏺',
    description: 'Pigmentos telúricos, calidez artesanal colombiana y textura envolvente.',
    colors: [
      { name: 'Terracota Colonial', hex: '#C2410C', category: 'Tierras & Terracota', code: 'PIN-3050', lrv: 20, family: 'Arcilla Tradicional', description: 'Rojo tierra icónico en fachadas de Boyacá y Santander, y acentos interiores.' },
      { name: 'Ocre Dorado', hex: '#D97706', category: 'Tierras & Terracota', code: 'PIN-3080', lrv: 29, family: 'Mostaza Cálido', description: 'Amarillo cálido y energizante, transmite alegría acogedora en comedores.' },
      { name: 'Arena Sahara', hex: '#D4B996', category: 'Tierras & Terracota', code: 'PIN-3015', lrv: 58, family: 'Tierra Suave', description: 'Beige natural muy versátil con pisos de madera clara y texturas rústicas.' },
      { name: 'Canela Tostada', hex: '#78350F', category: 'Tierras & Terracota', code: 'PIN-3090', lrv: 14, family: 'Café Especiado', description: 'Marrón profundo y aromático para bibliotecas y salas de degustación.' },
      { name: 'Arcilla Caliza', hex: '#EA580C', category: 'Tierras & Terracota', code: 'PIN-3040', lrv: 25, family: 'Terracota Vivo', description: 'Tono vibrante lleno de vitalidad para patios interiores y muros focales.' },
    ],
  },
  {
    id: 'industrial_seguridad',
    name: 'Industrial & Seguridad',
    icon: '⚠️',
    description: 'Gama técnica normada para demarcación vial, tuberías y protección estructural.',
    colors: [
      { name: 'Amarillo Seguridad', hex: '#EAB308', category: 'Industrial & Seguridad', code: 'PIN-8010', lrv: 59, family: 'Tráfico & Vial', description: 'Color normalizado para señalización de desniveles, bodegas y pasos peatonales.' },
      { name: 'Rojo Señalización', hex: '#DC2626', category: 'Industrial & Seguridad', code: 'PIN-9020', lrv: 18, family: 'Seguridad Industrial', description: 'Normado para gabinetes contra incendios, válvulas y áreas de riesgo.' },
      { name: 'Negro Ébano Industrial', hex: '#18181B', category: 'Industrial & Seguridad', code: 'PIN-9999', lrv: 4, family: 'Azabache Mate', description: 'Alta opacidad para perfiles metálicos, cielorrasos abiertos y ductos vistos.' },
      { name: 'Blanco Tráfico', hex: '#F8FAFC', category: 'Industrial & Seguridad', code: 'PIN-8001', lrv: 86, family: 'Reflectivo Vial', description: 'Pintura de alto tráfico para líneas de parqueadero y canchas deportivas.' },
    ],
  },
];

export const ColorSimulationStudio: React.FC<ColorSimulationStudioProps> = ({
  selectedColorName,
  selectedColorHex,
  onSelectColor,
  surfaceType,
  finish,
  environment,
  productName = 'Viniltex Avanzado® Pintuco',
}) => {
  // Scene zone state
  const [activeZone, setActiveZone] = useState<SceneZone>(
    environment === 'exterior' ? 'fachada_exterior' : 'sala_estar'
  );
  const [lighting, setLighting] = useState<LightingMode>('daylight');
  const [splitSliderPosition, setSplitSliderPosition] = useState<number>(50); // 0 to 100 %
  const [isSliderActive, setIsSliderActive] = useState<boolean>(true); // Before/After split
  const [accentWallOnly, setAccentWallOnly] = useState<boolean>(false);
  const [activePortfolioId, setActivePortfolioId] = useState<string>('tendencias_2025');
  const [colorSearchTerm, setColorSearchTerm] = useState<string>('');
  const [customHex, setCustomHex] = useState<string>(selectedColorHex || '#1B2A6B');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isDraggingSlider, setIsDraggingSlider] = useState<boolean>(false);
  const [imageLoaded, setImageLoaded] = useState<boolean>(true);

  const containerRef = useRef<HTMLDivElement>(null);

  // Active color lookup
  const currentColor: ColorPaletteItem =
    COLOR_PALETTES.find((c) => c.name.toLowerCase() === selectedColorName.toLowerCase()) || {
      name: selectedColorName || 'Color Seleccionado',
      hex: selectedColorHex || '#1B2A6B',
      category: 'Personalizado',
      code: 'PIN-CUSTOM',
      lrv: 35,
      family: 'Tintometría Especial',
      description: 'Fórmula computarizada preparada con pigmentos de alta dispersión Pintuco.',
    };

  // Paint coats (Manos de pintura) - 1 mano (primer), 2 manos (óptimo Pintuco), 3 manos (máximo cubrimiento)
  const [paintCoats, setPaintCoats] = useState<1 | 2 | 3>(2);
  const [paintOpacity, setPaintOpacity] = useState<number>(92); // 50 to 100 %
  const [wallMode, setWallMode] = useState<'full_wall' | 'accent_panel'>('full_wall');

  // Photorealistic Architectural Scenes with Natural Architectural Wall Planes
  // In real architecture, paint covers the entire wall plane from corner to corner and ceiling to floor,
  // eliminating any floating patch or "mancha sobrepuesta" effect.
  const scenes = {
    sala_estar: {
      id: 'sala_estar' as SceneZone,
      title: 'Sala de Estar Contemporánea',
      subtitle: 'Muro arquitectónico principal de fondo de esquina a esquina',
      imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1600&q=85',
      // Entire continuous wall plane from ceiling (0%) to parquet floor baseboard (78%)
      fullPolygon: 'polygon(0% 0%, 100% 0%, 100% 78%, 0% 78%)',
      accentPolygon: 'polygon(20% 0%, 80% 0%, 80% 78%, 20% 78%)',
      surfaceAreaM2: 24.5,
      wallLabelPos: { top: '38%', left: '50%' },
      paintRecommendation: 'Viniltex® Avanzado Mate • Cero Reflejos y Alta Lavabilidad',
      windowLightDirection: 'from-left',
    },
    dormitorio: {
      id: 'dormitorio' as SceneZone,
      title: 'Habitación Master Suite',
      subtitle: 'Pared cabecero de descanso e iluminación arquitectónica difusa',
      imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1600&q=85',
      // Wall plane extending from ceiling to platform bed
      fullPolygon: 'polygon(0% 0%, 100% 0%, 100% 70%, 0% 70%)',
      accentPolygon: 'polygon(22% 0%, 78% 0%, 78% 70%, 22% 70%)',
      surfaceAreaM2: 18.2,
      wallLabelPos: { top: '32%', left: '50%' },
      paintRecommendation: 'Viniltex® Avanzado Satinado • Tersura Suave y Sedosa',
      windowLightDirection: 'from-left',
    },
    fachada_exterior: {
      id: 'fachada_exterior' as SceneZone,
      title: 'Fachada Exterior Residencial',
      subtitle: 'Volumen arquitectónico principal en mampostería estucada',
      imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85',
      // Full right architectural stucco facade volume from roof to ground
      fullPolygon: 'polygon(42% 16%, 98% 16%, 98% 84%, 66% 84%, 66% 52%, 42% 52%)',
      accentPolygon: 'polygon(66% 16%, 98% 16%, 98% 84%, 66% 84%)',
      surfaceAreaM2: 46.0,
      wallLabelPos: { top: '36%', left: '78%' },
      paintRecommendation: 'Koraza® 5 / Koraza® Elastomérica • Máxima Resistencia a Sol y Lluvia',
      windowLightDirection: 'ambient-sun',
    },
    oficina_estudio: {
      id: 'oficina_estudio' as SceneZone,
      title: 'Oficina / Home Studio Moderno',
      subtitle: 'Muro posterior de concentración y fondo de videollamadas',
      imageUrl: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=1600&q=85',
      // Continuous wall plane behind modern credenza
      fullPolygon: 'polygon(0% 0%, 100% 0%, 100% 74%, 0% 74%)',
      accentPolygon: 'polygon(25% 0%, 75% 0%, 75% 74%, 25% 74%)',
      surfaceAreaM2: 15.0,
      wallLabelPos: { top: '34%', left: '50%' },
      paintRecommendation: 'Viniltex® Avanzado Mate • Confort Visual Sin Destellos',
      windowLightDirection: 'from-right',
    },
    cocina_comedor: {
      id: 'cocina_comedor' as SceneZone,
      title: 'Cocina & Comedor Gourmet',
      subtitle: 'Muro perimetral sobre barra americana y salpicadero',
      imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1600&q=85',
      fullPolygon: 'polygon(0% 0%, 100% 0%, 100% 64%, 0% 64%)',
      accentPolygon: 'polygon(45% 0%, 100% 0%, 100% 64%, 45% 64%)',
      surfaceAreaM2: 16.5,
      wallLabelPos: { top: '28%', left: '62%' },
      paintRecommendation: 'Viniltex® Baños & Cocinas Antibacterial Semibrillante',
      windowLightDirection: 'ambient-diffuse',
    },
    macro_textura: {
      id: 'macro_textura' as SceneZone,
      title: 'Macro Textura & Película Seca Pintuco®',
      subtitle: 'Detalle a escala 1:1 de micrograno, absorción y acabado físico',
      imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1600&q=85',
      fullPolygon: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)',
      accentPolygon: 'polygon(15% 15%, 85% 15%, 85% 85%, 15% 85%)',
      surfaceAreaM2: 2.0,
      wallLabelPos: { top: '50%', left: '50%' },
      paintRecommendation: 'Acabado físico según película seca y nivel de brillo',
      windowLightDirection: 'raking-light',
    },
  };

  const currentScene = scenes[activeZone];
  const activePolygon = wallMode === 'accent_panel' ? currentScene.accentPolygon : currentScene.fullPolygon;

  // Scene tabs navigation
  const sceneTabs = [
    { id: 'sala_estar' as SceneZone, label: 'Sala de Estar', icon: Home },
    { id: 'dormitorio' as SceneZone, label: 'Habitación', icon: Bed },
    { id: 'fachada_exterior' as SceneZone, label: 'Fachada Exterior', icon: Building },
    { id: 'oficina_estudio' as SceneZone, label: 'Oficina / Estudio', icon: Briefcase },
    { id: 'cocina_comedor' as SceneZone, label: 'Cocina & Comedor', icon: Utensils },
    { id: 'macro_textura' as SceneZone, label: 'Textura & Brillo', icon: ZoomIn },
  ];

  // Calculate LRV and color luminance physics
  const colorLRV = currentColor.lrv ?? 50;
  const isLightColor = colorLRV >= 55;
  const isVeryLightColor = colorLRV >= 75;
  const isDarkColor = colorLRV < 35;

  // Coat multiplier for coverage
  const coatFactor = paintCoats === 1 ? 0.70 : paintCoats === 2 ? 0.90 : 1.0;
  const baseCoverageOpacity = (paintOpacity / 100) * coatFactor;

  // Ambient lighting parameters applied purely as light bounce on the wall
  const getLightingProps = () => {
    switch (lighting) {
      case 'warm':
        return {
          name: 'Luz Cálida Residencial (3000K)',
          badge: '🟡 Cálida 3000K',
          wallLightGradient:
            'linear-gradient(135deg, rgba(251,191,36,0.24) 0%, rgba(245,158,11,0.10) 45%, transparent 80%)',
          ambientTint: 'rgba(251,191,36,0.08)',
        };
      case 'cool':
        return {
          name: 'Luz Fría / LED Oficina (6500K)',
          badge: '🔵 Fría 6500K',
          wallLightGradient:
            'linear-gradient(135deg, rgba(56,189,248,0.20) 0%, rgba(14,165,233,0.08) 45%, transparent 80%)',
          ambientTint: 'rgba(56,189,248,0.06)',
        };
      case 'golden_hour':
        return {
          name: 'Atardecer Dorado (2400K)',
          badge: '🌅 Atardecer 2400K',
          wallLightGradient:
            'linear-gradient(110deg, rgba(249,115,22,0.32) 0%, rgba(234,88,12,0.14) 50%, transparent 85%)',
          ambientTint: 'rgba(249,115,22,0.12)',
        };
      case 'daylight':
      default:
        return {
          name: 'Luz Solar Natural (5500K)',
          badge: '☀️ Natural 5500K',
          wallLightGradient:
            'linear-gradient(135deg, rgba(255,255,255,0.24) 0%, rgba(255,255,255,0.08) 45%, transparent 85%)',
          ambientTint: 'transparent',
        };
    }
  };

  const lightingInfo = getLightingProps();

  // Finish specular properties on the wall surface following real paint physics
  const getFinishEffect = () => {
    switch (finish) {
      case 'brillante':
        return {
          name: 'Brillante Duradero',
          sheenOpacity: 0.32,
          desc: 'Reflejo nítido y resplandor luminoso de fácil limpieza.',
          specularGradient: 'radial-gradient(circle at 40% 30%, rgba(255,255,255,0.65) 0%, transparent 55%)',
        };
      case 'semibrillante':
        return {
          name: 'Semibrillante',
          sheenOpacity: 0.20,
          desc: 'Brillo sutil equilibrado, ideal para áreas de alto tráfico.',
          specularGradient: 'radial-gradient(circle at 45% 35%, rgba(255,255,255,0.45) 0%, transparent 65%)',
        };
      case 'satinado':
        return {
          name: 'Satinado Elegante',
          sheenOpacity: 0.12,
          desc: 'Tersura sedosa elegante y suave al tacto con reflejo difuso.',
          specularGradient: 'radial-gradient(circle at 50% 40%, rgba(255,255,255,0.30) 0%, transparent 75%)',
        };
      case 'epoxico_antideslizante':
        return {
          name: 'Epóxico Vitrificado',
          sheenOpacity: 0.28,
          desc: 'Película polimérica ultra resistente de alto impacto.',
          specularGradient: 'radial-gradient(circle at 42% 32%, rgba(255,255,255,0.55) 0%, transparent 60%)',
        };
      case 'mate':
      default:
        return {
          name: 'Mate Antirreflejo',
          sheenOpacity: 0.02,
          desc: 'Cero destellos molestos; absorbe luz y disimula imperfecciones.',
          specularGradient: 'none',
        };
    }
  };

  const finishEffect = getFinishEffect();

  // Slider dragging logic for Before/After split
  const handleSliderMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (offsetX / rect.width) * 100));
    setSplitSliderPosition(pct);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      handleSliderMove(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDraggingSlider) {
      handleSliderMove(e.clientX);
    }
  };

  const handleCustomHexInput = (hex: string) => {
    setCustomHex(hex);
    if (/^#([0-9A-F]{3}){1,2}$/i.test(hex)) {
      onSelectColor({
        name: `Color a Medida (${hex.toUpperCase()})`,
        hex: hex,
        category: 'Personalizado',
        code: 'PIN-CUSTOM',
        lrv: 40,
        family: 'Tintometría Especial',
        description: `Tono formulado según muestra física del cliente (${hex.toUpperCase()}).`,
      });
    }
  };

  // Filtered colors by portfolio and search
  const currentPortfolio =
    PINTUCO_PORTFOLIOS.find((p) => p.id === activePortfolioId) || PINTUCO_PORTFOLIOS[0];

  const portfolioColors = currentPortfolio.colors.filter((c) => {
    if (!colorSearchTerm.trim()) return true;
    const term = colorSearchTerm.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      c.code.toLowerCase().includes(term) ||
      c.family.toLowerCase().includes(term)
    );
  });

  // Suggested complementary triad based on current color
  const complementaryColors = COLOR_PALETTES.filter(
    (c) => c.hex.toLowerCase() !== currentColor.hex.toLowerCase()
  ).slice(0, 3);

  return (
    <div
      className={`bg-slate-950 text-white rounded-3xl border border-slate-800 shadow-2xl overflow-hidden transition-all duration-300 ${
        isFullscreen ? 'fixed inset-3 z-50 overflow-y-auto max-h-[96vh]' : 'relative'
      }`}
    >
      {/* Top Header Bar */}
      <div className="bg-slate-900/95 px-5 sm:px-6 py-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#1B2A6B] via-emerald-600 to-[#2FAE6D] flex items-center justify-center text-white shadow-lg">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                Simulador Arquitectónico Fotorrealista Pintuco®
              </h3>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Sparkles className="w-3 h-3" />
                Fotografía HD Real
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Fotografía arquitectónica en alta definición: el color se aplica <strong className="text-emerald-400 font-semibold">únicamente sobre la pared a pintar</strong>; mobiliario, pisos, ventanales y luz natural se conservan 100% intactos.
            </p>
          </div>
        </div>

        {/* Right Header Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Paint Mode: Full Wall vs Accent Wall */}
          <div className="bg-slate-800/90 p-0.5 rounded-xl border border-slate-700/80 flex items-center">
            <button
              type="button"
              onClick={() => setWallMode('full_wall')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                wallMode === 'full_wall'
                  ? 'bg-emerald-600 text-white shadow-xs font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Pintar toda la pared arquitectónica de esquina a esquina"
            >
              Pared Completa
            </button>
            <button
              type="button"
              onClick={() => setWallMode('accent_panel')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                wallMode === 'accent_panel'
                  ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Pintar franja o muro focal de acento decorativo"
            >
              Muro Acento
            </button>
          </div>

          {/* Manos de Pintura (Coats of Paint) */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-800/90 px-2 py-1 rounded-xl border border-slate-700/80 text-xs">
            <span className="text-[11px] font-bold text-slate-400 mr-1">Manos:</span>
            {([1, 2, 3] as const).map((coat) => (
              <button
                key={coat}
                type="button"
                onClick={() => setPaintCoats(coat)}
                className={`w-5 h-5 rounded-md text-[11px] font-black transition-all cursor-pointer ${
                  paintCoats === coat
                    ? 'bg-[#1B2A6B] text-white ring-1 ring-blue-400 shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
                title={
                  coat === 1
                    ? '1 Mano: Base translúcida'
                    : coat === 2
                    ? '2 Manos: Acabado estándar recomendado Pintuco'
                    : '3 Manos: Cobertura total de alto poder cubriente'
                }
              >
                {coat}
              </button>
            ))}
          </div>

          {/* Before/After Split Slider Toggle */}
          <button
            type="button"
            onClick={() => setIsSliderActive(!isSliderActive)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isSliderActive
                ? 'bg-[#2FAE6D] text-white shadow-md'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            <Split className="w-3.5 h-3.5" />
            <span>{isSliderActive ? 'Antes / Después' : 'Solo Simulado'}</span>
          </button>

          {/* Fullscreen modal toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
            title={isFullscreen ? 'Reducir ventana' : 'Pantalla completa'}
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ZONES NAVIGATION TABS (Fachada, Sala de Estar, Habitación, Oficina, Cocina, Textura) */}
      <div className="bg-slate-900 border-b border-slate-800/80 px-4 sm:px-6 py-2.5">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {sceneTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeZone === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                id={`scene-tab-${tab.id}`}
                onClick={() => {
                  setImageLoaded(false);
                  setActiveZone(tab.id);
                  setTimeout(() => setImageLoaded(true), 100);
                }}
                className={`group px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#1B2A6B] text-white shadow-md shadow-blue-950/60 ring-1 ring-blue-400/50'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                    isActive ? 'bg-[#2FAE6D] text-white' : 'bg-slate-700 text-slate-400 group-hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN VIEWPORT: PHOTOREALISTIC ARCHITECTURAL STAGE */}
      <div className="relative p-4 sm:p-6 bg-slate-950">
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          onMouseUp={() => setIsDraggingSlider(false)}
          onTouchEnd={() => setIsDraggingSlider(false)}
          className="relative w-full h-[360px] sm:h-[460px] md:h-[500px] rounded-2xl overflow-hidden bg-slate-900 shadow-2xl border border-slate-800 select-none group"
        >
          {/* 1. BASE REAL ARCHITECTURAL PHOTOGRAPH (100% UNTOUCHED BACKGROUND) */}
          <img
            src={currentScene.imageUrl}
            alt={currentScene.title}
            onLoad={() => setImageLoaded(true)}
            className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none transition-transform duration-700"
            draggable={false}
          />

          {/* 2. ISOLATED REALISTIC PAINT LAYER ON THE ARCHITECTURAL WALL SURFACE */}
          {/* Covers the entire natural wall plane from corner to corner, preserving room architecture */}
          <div
            className="absolute inset-0 pointer-events-none transition-all duration-300"
            style={{
              clipPath: activePolygon,
            }}
          >
            {/* Split Before/After mask: reveals simulated paint only from splitSliderPosition to 100% */}
            <div
              className="absolute inset-0 transition-all duration-75 overflow-hidden"
              style={{
                clipPath: isSliderActive
                  ? `polygon(${splitSliderPosition}% 0%, 100% 0%, 100% 100%, ${splitSliderPosition}% 100%)`
                  : 'none',
              }}
            >
              {/* LAYER A: PIGMENT HUE & SATURATION (COLOR BLEND) */}
              {/* Delivers the pure chromatic identity of the Pintuco formula without altering surface shadows */}
              <div
                className="absolute inset-0 transition-all duration-500 ease-out"
                style={{
                  backgroundColor: currentColor.hex,
                  mixBlendMode: 'color',
                  opacity: Math.min(1, 0.75 + (coatFactor * 0.22)),
                }}
              />

              {/* LAYER B: LRV LUMINOSITY MODULATION ACCORDING TO PHYSICAL PAINT REFLECTANCE */}
              {isLightColor ? (
                <>
                  {/* For Light / White / Cream tones: Soft-light lifts wall luminance smoothly */}
                  <div
                    className="absolute inset-0 transition-all duration-500 ease-out"
                    style={{
                      backgroundColor: currentColor.hex,
                      mixBlendMode: 'soft-light',
                      opacity: Math.min(0.95, 0.65 * baseCoverageOpacity + ((colorLRV - 50) / 100) * 0.4),
                    }}
                  />
                  {/* Subtle screen pass so pure whites (Blanco Puro LRV 88%) look truly crisp and luminous */}
                  {isVeryLightColor && (
                    <div
                      className="absolute inset-0 transition-all duration-500 ease-out"
                      style={{
                        backgroundColor: currentColor.hex,
                        mixBlendMode: 'screen',
                        opacity: Math.min(0.35, ((colorLRV - 70) / 100) * 0.55 * baseCoverageOpacity),
                      }}
                    />
                  )}
                </>
              ) : (
                /* For Medium to Deep / Dark tones: Multiply deepens the tone while keeping wall plaster grain */
                <div
                  className="absolute inset-0 transition-all duration-500 ease-out"
                  style={{
                    backgroundColor: currentColor.hex,
                    mixBlendMode: 'multiply',
                    opacity: Math.min(0.88, (0.42 + ((55 - colorLRV) / 55) * 0.42) * baseCoverageOpacity),
                  }}
                />
              )}

              {/* LAYER C: WALL PLASTER GRAIN & ROLLER STIPPLE TEXTURE */}
              {/* Gives the paint authentic tactile physical body, eliminating flat digital looks */}
              <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  backgroundImage: `radial-gradient(rgba(255,255,255,0.15) 1px, transparent 0), radial-gradient(rgba(0,0,0,0.12) 1px, transparent 0)`,
                  backgroundSize: '4px 4px',
                  backgroundPosition: '0 0, 2px 2px',
                  mixBlendMode: 'overlay',
                }}
              />

              {/* LAYER D: ARCHITECTURAL AMBIENT OCCLUSION & CORNER CONTACT SHADOWS */}
              {/* Anchors the wall into 3D space with natural ceiling and floor contact gradients */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(to bottom, rgba(0,0,0,0.16) 0%, transparent 12%, transparent 88%, rgba(0,0,0,0.18) 100%)',
                  mixBlendMode: 'multiply',
                }}
              />

              {/* LAYER E: WALL LIGHT BOUNCE BASED ON ROOM LIGHTING TEMPERATURE */}
              <div
                className="absolute inset-0 transition-all duration-500 pointer-events-none"
                style={{
                  backgroundImage: lightingInfo.wallLightGradient,
                  mixBlendMode: 'soft-light',
                }}
              />

              {/* LAYER F: SPECULAR SHEEN BASED ON PAINT FINISH (Mate, Satinado, Semibrillante, Brillante) */}
              {finishEffect.sheenOpacity > 0.05 && (
                <div
                  className="absolute inset-0 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: finishEffect.specularGradient,
                    filter: 'blur(30px)',
                    opacity: finishEffect.sheenOpacity * coatFactor,
                    mixBlendMode: 'overlay',
                  }}
                />
              )}
            </div>
          </div>

          {/* 3. INTERACTIVE BEFORE / AFTER SLIDER DIVIDER */}
          {isSliderActive && (
            <div
              className="absolute inset-y-0 z-30 pointer-events-none"
              style={{ left: `${splitSliderPosition}%` }}
            >
              {/* Vertical line with subtle glow */}
              <div className="absolute inset-y-0 -left-px w-0.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" />

              {/* Draggable Handle Button */}
              <div
                onMouseDown={() => setIsDraggingSlider(true)}
                onTouchStart={() => setIsDraggingSlider(true)}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-slate-900/90 text-white border-2 border-white shadow-2xl flex items-center justify-center cursor-ew-resize pointer-events-auto hover:scale-110 active:scale-95 transition-transform"
                title="Arrastra para comparar Antes vs Después"
              >
                <Split className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
          )}

          {/* 4. BEFORE / AFTER FLOATING BADGES */}
          {isSliderActive && (
            <>
              <div className="absolute top-4 left-4 z-20 pointer-events-none">
                <span className="px-3 py-1 rounded-xl bg-slate-900/80 backdrop-blur-md text-slate-200 border border-white/20 text-xs font-extrabold uppercase shadow-lg flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400" />
                  Antes (Original)
                </span>
              </div>
              <div className="absolute top-4 right-4 z-20 pointer-events-none">
                <span className="px-3 py-1 rounded-xl bg-[#1B2A6B]/90 backdrop-blur-md text-white border border-blue-400/40 text-xs font-black uppercase shadow-lg flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-white/60 shadow-xs"
                    style={{ backgroundColor: currentColor.hex }}
                  />
                  Después (Pintuco®)
                </span>
              </div>
            </>
          )}

          {/* 5. INTERACTIVE SURFACE PIN INDICATOR OVER THE WALL */}
          <div
            className="absolute z-20 pointer-events-auto transform -translate-x-1/2 -translate-y-1/2"
            style={{
              top: currentScene.wallLabelPos.top,
              left: currentScene.wallLabelPos.left,
            }}
          >
            <div className="group/pin relative flex items-center justify-center">
              <div
                className="w-8 h-8 rounded-full border-2 border-white shadow-xl flex items-center justify-center transition-transform group-hover/pin:scale-125 cursor-pointer animate-pulse"
                style={{ backgroundColor: currentColor.hex }}
              >
                <div className="w-2.5 h-2.5 rounded-full bg-white shadow-xs" />
              </div>

              {/* Tooltip on hover */}
              <div className="absolute left-10 top-1/2 -translate-y-1/2 whitespace-nowrap bg-slate-950/90 backdrop-blur-md border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 shadow-2xl opacity-90 group-hover/pin:opacity-100 transition-opacity pointer-events-none">
                <div className="font-extrabold text-white flex items-center gap-1">
                  <span>📍 {wallMode === 'accent_panel' ? 'Muro de Acento' : 'Pared Principal Completa'}</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  {currentScene.surfaceAreaM2} m² • {paintCoats} {paintCoats === 1 ? 'Mano' : 'Manos'} • {finishEffect.name} • {currentColor.name}
                </div>
              </div>
            </div>
          </div>

          {/* 6. BOTTOM PHOTO INFO OVERLAY */}
          <div className="absolute bottom-4 inset-x-4 z-20 pointer-events-none flex flex-wrap items-center justify-between gap-2">
            <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-2xl px-4 py-2 text-xs">
              <div className="font-black text-white flex items-center gap-2">
                <span>{currentScene.title}</span>
                <span className="text-emerald-400 font-bold">•</span>
                <span className="text-slate-300 font-semibold">{currentScene.subtitle}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-amber-400" />
                <span>{currentScene.paintRecommendation}</span>
              </p>
            </div>

            {/* Lighting Mode Selector Pills */}
            <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-2xl p-1 flex items-center gap-1 pointer-events-auto">
              <button
                type="button"
                onClick={() => setLighting('daylight')}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  lighting === 'daylight'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Luz Solar Natural 5500K"
              >
                <Sun className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">5500K</span>
              </button>
              <button
                type="button"
                onClick={() => setLighting('warm')}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  lighting === 'warm'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Luz Cálida 3000K"
              >
                <Lamp className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">3000K</span>
              </button>
              <button
                type="button"
                onClick={() => setLighting('cool')}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  lighting === 'cool'
                    ? 'bg-sky-500 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Luz Fría LED 6500K"
              >
                <Moon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">6500K</span>
              </button>
              <button
                type="button"
                onClick={() => setLighting('golden_hour')}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  lighting === 'golden_hour'
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Atardecer Dorado 2400K"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">2400K</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CARTERA DE COLORES PINTUCO® (COLOR PORTFOLIOS & SELECTION SYSTEM) */}
      <div className="bg-slate-900 border-t border-slate-800 p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-emerald-400" />
              <h4 className="text-base font-black text-white tracking-tight">
                Carteras de Color Pintuco® Oficiales
              </h4>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Explora las colecciones cromáticas formuladas con pigmentos arquitectónicos de alta resistencia:
            </p>
          </div>

          {/* Quick Search in Color Portfolio */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={colorSearchTerm}
              onChange={(e) => setColorSearchTerm(e.target.value)}
              placeholder="Buscar tono o código (ej: PIN-1001)..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* PORTFOLIO NAVIGATION TABS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {PINTUCO_PORTFOLIOS.map((portfolio) => {
            const isActive = activePortfolioId === portfolio.id;
            return (
              <button
                key={portfolio.id}
                type="button"
                onClick={() => setActivePortfolioId(portfolio.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40 ring-1 ring-emerald-400/50'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
              >
                <span>{portfolio.icon}</span>
                <span>{portfolio.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  {portfolio.colors.length}
                </span>
              </button>
            );
          })}
        </div>

        {/* PORTFOLIO DESCRIPTION & ACTIVE CARTERA GRID */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{currentPortfolio.description}</span>
            <span className="text-slate-500 font-mono text-[11px]">
              {portfolioColors.length} colores disponibles
            </span>
          </div>

          {/* COLOR SWATCHES GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
            {portfolioColors.map((color) => {
              const isSelected = currentColor.name.toLowerCase() === color.name.toLowerCase();
              return (
                <button
                  key={color.code}
                  type="button"
                  id={`color-swatch-${color.code.toLowerCase()}`}
                  onClick={() => onSelectColor(color)}
                  className={`group relative p-2 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-800 border-emerald-400 ring-2 ring-emerald-400/50 shadow-xl scale-[1.03]'
                      : 'bg-slate-950/80 hover:bg-slate-800/80 border-slate-800 hover:border-slate-600'
                  }`}
                >
                  {/* Swatch color pill */}
                  <div className="relative w-full h-14 rounded-xl overflow-hidden shadow-inner border border-white/10 mb-2">
                    <div
                      className="absolute inset-0 transition-transform duration-300 group-hover:scale-110"
                      style={{ backgroundColor: color.hex }}
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <div className="w-6 h-6 rounded-full bg-white text-slate-950 flex items-center justify-center shadow-lg">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Color details */}
                  <div className="space-y-0.5">
                    <span className="block text-xs font-bold text-white truncate" title={color.name}>
                      {color.name}
                    </span>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>{color.code}</span>
                      <span className="text-emerald-400 font-semibold">LRV {color.lrv}%</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ACTIVE COLOR TECHNICAL STRIP & COMPLEMENTARY TRIAD */}
        <div className="bg-slate-950/90 rounded-2xl p-4 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Active color specs */}
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl border-2 border-white/20 shadow-2xl relative overflow-hidden flex-shrink-0"
              style={{ backgroundColor: currentColor.hex }}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h5 className="text-base font-black text-white">{currentColor.name}</h5>
                <span className="text-xs px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 font-mono font-bold">
                  {currentColor.code}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold">
                  LRV: {currentColor.lrv}%
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                {currentColor.description}
              </p>
            </div>
          </div>

          {/* Recommended Architectural Triad */}
          <div className="flex items-center gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 lg:border-l border-slate-800 lg:pl-6">
            <div className="text-right hidden sm:block">
              <span className="block text-[11px] font-extrabold uppercase text-slate-400">
                Tríada Recomendada
              </span>
              <span className="text-[10px] text-slate-500">Muros y Acentos Armónicos</span>
            </div>
            <div className="flex items-center gap-2">
              {complementaryColors.map((comp) => (
                <button
                  key={comp.code}
                  type="button"
                  onClick={() => onSelectColor(comp)}
                  className="group relative flex flex-col items-center cursor-pointer"
                  title={`Combinar con ${comp.name} (${comp.code})`}
                >
                  <div
                    className="w-9 h-9 rounded-xl border border-white/20 shadow-md group-hover:scale-110 transition-transform flex items-center justify-center"
                    style={{ backgroundColor: comp.hex }}
                  />
                  <span className="text-[10px] text-slate-400 mt-1 truncate max-w-[65px]">
                    {comp.name}
                  </span>
                </button>
              ))}
            </div>

            {/* Custom HEX Eyedropper Input */}
            <div className="pl-3 border-l border-slate-800 flex items-center gap-2">
              <div className="relative">
                <input
                  type="color"
                  value={customHex}
                  onChange={(e) => handleCustomHexInput(e.target.value)}
                  className="w-9 h-9 rounded-xl border border-slate-700 bg-slate-900 cursor-pointer overflow-hidden p-0.5"
                  title="Seleccionar color personalizado HEX"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
