import React, { useState, useRef, useId } from 'react';
import {
  Sparkles,
  Sun,
  Sunset,
  Moon,
  Lamp,
  Layers,
  Check,
  Maximize2,
  Minimize2,
  Home,
  Building2,
  BedDouble,
  UtensilsCrossed,
  ZoomIn,
  Search,
  CheckCircle2,
  Split,
  Camera,
  RotateCcw,
  Palette,
  Droplets,
  ShieldCheck,
  Paintbrush,
  SlidersHorizontal,
  Eye,
  Info,
} from 'lucide-react';
import { SurfaceType, FinishType, EnvironmentType, ColorPaletteItem } from '../types';
import { COLOR_PALETTES } from '../data/initialData';

export interface ColorSimulationStudioProps {
  selectedColorName: string;
  selectedColorHex: string;
  onSelectColor: (color: ColorPaletteItem) => void;
  surfaceType: SurfaceType;
  finish: FinishType;
  environment: EnvironmentType;
  productName?: string;
}

export type SceneZone =
  | 'sala_contemporanea'
  | 'habitacion_suite'
  | 'fachada_moderna'
  | 'comedor_minimal'
  | 'textura_macro';

export type LightingMode = 'daylight' | 'golden_hour' | 'warm_interior' | 'cool_modern';

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
    description: 'Paleta insignia Pintuco: Biofilia serena, tonos telúricos y calma contemporánea.',
    colors: [
      { name: 'Verde Salvia Nórdico', hex: '#84A98C', category: 'Tendencias 2025', code: 'PIN-6045', lrv: 44, family: 'Salvia Botánico', description: 'Tono botánico suave, aporta serenidad zen y conexión biofílica en interiores.' },
      { name: 'Terracota Colonial', hex: '#C2410C', category: 'Tendencias 2025', code: 'PIN-3050', lrv: 20, family: 'Arcilla Artesanal', description: 'Tierra cálida de carácter colombiano, ideal para muros focales de acento y fachadas.' },
      { name: 'Arena Sahara', hex: '#D4B996', category: 'Tendencias 2025', code: 'PIN-3015', lrv: 58, family: 'Tierra Serena', description: 'Neutro cálido y envolvente, armoniza con maderas nobles, lino y fibras naturales.' },
      { name: 'Lino Nórdico', hex: '#E2E8F0', category: 'Tendencias 2025', code: 'PIN-1040', lrv: 74, family: 'Gris Arquitectónico', description: 'Gris ultra claro y aireado, preferido en arquitectura moderna y divisiones de drywall.' },
      { name: 'Ocre Dorado', hex: '#D97706', category: 'Tendencias 2025', code: 'PIN-3080', lrv: 29, family: 'Mostaza Cálido', description: 'Amarillo tostado que evoca la luz dorada del sol y la calidez del hogar.' },
      { name: 'Durazno Suave', hex: '#FDBA74', category: 'Tendencias 2025', code: 'PIN-3022', lrv: 63, family: 'Melocotón Confort', description: 'Matiz suave y reconfortante para dormitorios principales y salas de descanso.' },
      { name: 'Verde Eucalipto', hex: '#52796F', category: 'Tendencias 2025', code: 'PIN-6055', lrv: 24, family: 'Biofilia Profunda', description: 'Verde arquitectónico sobrio con matiz grisáceo para muros protagonistas.' },
      { name: 'Marfil Imperial', hex: '#FEF3C7', category: 'Tendencias 2025', code: 'PIN-1025', lrv: 78, family: 'Blanco Aterciopelado', description: 'Elegancia clásica aterciopelada, aporta calidez y luminosidad natural sin destellos.' },
    ],
  },
  {
    id: 'blancos_luz',
    name: 'Blancos & Luz',
    icon: '⚪',
    description: 'Máxima reflectancia lumínica (LRV > 75%), sensación de amplitud y pureza visual.',
    colors: [
      { name: 'Blanco Puro', hex: '#F9FAFB', category: 'Blancos & Luz', code: 'PIN-1001', lrv: 88, family: 'Blanco Luminoso', description: 'Blanco óptico de máxima reflectancia, perfecto para cielos rasos y muros despejados.' },
      { name: 'Nieve Andina', hex: '#FFFFFF', category: 'Blancos & Luz', code: 'PIN-1000', lrv: 92, family: 'Blanco Absoluto', description: 'Pureza visual total, maximiza la luz natural en espacios con ventanales amplios.' },
      { name: 'Blanco Seda', hex: '#F1F5F9', category: 'Blancos & Luz', code: 'PIN-1030', lrv: 82, family: 'Gris Perla Suave', description: 'Blanco con leve matiz frío de alta definición arquitectónica contemporánea.' },
      { name: 'Marfil Imperial', hex: '#FEF3C7', category: 'Blancos & Luz', code: 'PIN-1025', lrv: 78, family: 'Blanco Cálido', description: 'Calidez discreta y confortable sin reflejos deslumbrantes.' },
      { name: 'Crema Tradición', hex: '#FDF6E2', category: 'Blancos & Luz', code: 'PIN-1015', lrv: 80, family: 'Vainilla Neutro', description: 'Tono marfil elegante para ambientes residenciales clásicos o transicionales.' },
      { name: 'Lino Nórdico', hex: '#E2E8F0', category: 'Blancos & Luz', code: 'PIN-1040', lrv: 74, family: 'Gris Arquitectónico', description: 'Grisáceo luminoso que disimula el paso del tiempo y el roce cotidiano.' },
    ],
  },
  {
    id: 'grises_concreto',
    name: 'Grises & Concreto',
    icon: '🏢',
    description: 'Sobriedad metropolitana, textura de concreto arquitectónico y alta elegancia.',
    colors: [
      { name: 'Lino Nórdico', hex: '#E2E8F0', category: 'Grises & Concreto', code: 'PIN-1040', lrv: 74, family: 'Gris Luminoso', description: 'Gris perla claro, versátil para todo tipo de iluminación interior.' },
      { name: 'Gris Urbano', hex: '#94A3B8', category: 'Grises & Concreto', code: 'PIN-2015', lrv: 52, family: 'Neutro Medio', description: 'Gris medio contemporáneo, predilecto en oficinas, recepciones y pasillos.' },
      { name: 'Gris Cemento', hex: '#64748B', category: 'Grises & Concreto', code: 'PIN-2045', lrv: 38, family: 'Concreto Pulido', description: 'Inspirado en losas de hormigón a la vista para estilos industriales y loft.' },
      { name: 'Gris Plomo', hex: '#475569', category: 'Grises & Concreto', code: 'PIN-2080', lrv: 26, family: 'Grafito Intenso', description: 'Gris oscuro con gran prestancia para fondos de TV o cabeceros.' },
      { name: 'Grafito Titanio', hex: '#334155', category: 'Grises & Concreto', code: 'PIN-2090', lrv: 18, family: 'Antracita Puro', description: 'Carácter imponente y alta sofisticación para detalles arquitectónicos.' },
      { name: 'Piedra Caliza', hex: '#CBD5E1', category: 'Grises & Concreto', code: 'PIN-2005', lrv: 66, family: 'Gris Caliza', description: 'Tono mineral suave que aporta elegancia atemporal y equilibrio.' },
    ],
  },
  {
    id: 'azules_oceano',
    name: 'Azules & Océano',
    icon: '🌊',
    description: 'Calma mental, concentración, profundidad espacial y prestigio institucional.',
    colors: [
      { name: 'Azul Pintuco', hex: '#1B2A6B', category: 'Azules & Océano', code: 'PIN-5010', lrv: 12, family: 'Azul Institucional', description: 'El azul de referencia Pintuco: solidez pigmentaria, prestigio y máxima durabilidad.' },
      { name: 'Azul Naval Profundo', hex: '#0F172A', category: 'Azules & Océano', code: 'PIN-5095', lrv: 7, family: 'Noche Profundo', description: 'Azul noche de acento sobrio, transmite lujo contemporáneo y silencio visual.' },
      { name: 'Azul Índigo Real', hex: '#1E3A8A', category: 'Azules & Océano', code: 'PIN-5040', lrv: 15, family: 'Índigo Cobalto', description: 'Tono regio y vibrante para salas de juntas y muros protagonistas.' },
      { name: 'Azul Mediterráneo', hex: '#0284C7', category: 'Azules & Océano', code: 'PIN-5025', lrv: 28, family: 'Azul Marino Cielo', description: 'Fresco y estimulante, ideal para salas recreativas, terrazas o zonas creativas.' },
      { name: 'Celeste Glaciar', hex: '#BAE6FD', category: 'Azules & Océano', code: 'PIN-5005', lrv: 70, family: 'Pastel Aire', description: 'Claridad etérea que amplía visualmente recámaras infantiles y consultorios.' },
    ],
  },
  {
    id: 'verdes_biofilia',
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
    id: 'tierras_calidos',
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
    name: 'Industrial & Demarcación',
    icon: '⚠️',
    description: 'Gama técnica normada para demarcación vial, pisos industriales y áreas de seguridad.',
    colors: [
      { name: 'Amarillo Seguridad', hex: '#EAB308', category: 'Industrial & Demarcación', code: 'PIN-8010', lrv: 59, family: 'Tráfico & Vial', description: 'Color normalizado para señalización de desniveles, bodegas y pasos peatonales.' },
      { name: 'Rojo Señalización', hex: '#DC2626', category: 'Industrial & Demarcación', code: 'PIN-9020', lrv: 18, family: 'Seguridad Industrial', description: 'Normado para gabinetes contra incendios, válvulas y áreas de riesgo.' },
      { name: 'Negro Ébano Industrial', hex: '#18181B', category: 'Industrial & Demarcación', code: 'PIN-9999', lrv: 4, family: 'Azabache Mate', description: 'Alta opacidad para perfiles metálicos, cielorrasos abiertos y ductos vistos.' },
      { name: 'Blanco Tráfico', hex: '#F8FAFC', category: 'Industrial & Demarcación', code: 'PIN-8001', lrv: 86, family: 'Reflectivo Vial', description: 'Pintura de alto tráfico para líneas de parqueadero y canchas deportivas.' },
    ],
  },
];

interface SceneData {
  id: SceneZone;
  title: string;
  subtitle: string;
  roomType: 'interior' | 'exterior' | 'macro';
  surfaceAreaM2: number;
  productSuggestion: string;
  lightSource: 'left' | 'right' | 'overhead';
}

const SCENES: Record<SceneZone, SceneData> = {
  sala_contemporanea: {
    id: 'sala_contemporanea',
    title: 'Sala de Estar Contemporánea',
    subtitle: 'Muro arquitectónico principal de fondo con iluminación natural de ventanal',
    roomType: 'interior',
    surfaceAreaM2: 24.5,
    productSuggestion: 'Viniltex® Avanzado Mate • Cero Reflejos Molestos y Ultra Lavable',
    lightSource: 'left',
  },
  habitacion_suite: {
    id: 'habitacion_suite',
    title: 'Habitación Master Suite',
    subtitle: 'Pared cabecero de descanso con lámparas de noche y calidez relajante',
    roomType: 'interior',
    surfaceAreaM2: 18.0,
    productSuggestion: 'Viniltex® Acrílico Satinado • Tersura Sedosa y Gran Elegancia',
    lightSource: 'left',
  },
  fachada_moderna: {
    id: 'fachada_moderna',
    title: 'Fachada Exterior Moderna',
    subtitle: 'Planos de mampostería expuestos al sol colombiano y al clima exterior',
    roomType: 'exterior',
    surfaceAreaM2: 48.0,
    productSuggestion: 'Koraza® 5 Máxima Protección • Resistencia a Rayos UV y Lluvia Torrencial',
    lightSource: 'right',
  },
  comedor_minimal: {
    id: 'comedor_minimal',
    title: 'Comedor & Cocina Gourmet',
    subtitle: 'Muro focal de ambiente abierto con iluminación cenital sobre mesa',
    roomType: 'interior',
    surfaceAreaM2: 20.0,
    productSuggestion: 'Viniltex® Baños & Cocina con Teflón® Antihongos y Grasa',
    lightSource: 'overhead',
  },
  textura_macro: {
    id: 'textura_macro',
    title: 'Estudio de Película Seca 1:1',
    subtitle: 'Inspección macro de microrrugosidad, poder cubriente y brillo del acabado',
    roomType: 'macro',
    surfaceAreaM2: 1.5,
    productSuggestion: 'Acabado físico según película seca y nivel de brillo seleccionado',
    lightSource: 'left',
  },
};

export const ColorSimulationStudio: React.FC<ColorSimulationStudioProps> = ({
  selectedColorName,
  selectedColorHex,
  onSelectColor,
  surfaceType,
  finish,
  environment,
  productName = 'Viniltex Avanzado® Pintuco',
}) => {
  const filterId = useId();
  const [activeZone, setActiveZone] = useState<SceneZone>(
    environment === 'exterior' ? 'fachada_moderna' : 'sala_contemporanea'
  );
  const [lighting, setLighting] = useState<LightingMode>('daylight');
  const [coats, setCoats] = useState<1 | 2 | 3>(2);
  const [splitPos, setSplitPos] = useState<number>(50); // 0 to 100%
  const [isSplitMode, setIsSplitMode] = useState<boolean>(true);
  const [activePortfolioId, setActivePortfolioId] = useState<string>('tendencias_2025');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [customHex, setCustomHex] = useState<string>(selectedColorHex || '#1B2A6B');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [surfaceTexture, setSurfaceTexture] = useState<'liso' | 'estuco' | 'rustico'>('liso');
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Active color lookup or fallback
  const currentColor: ColorPaletteItem =
    COLOR_PALETTES.find((c) => c.name.toLowerCase() === selectedColorName.toLowerCase()) || {
      name: selectedColorName || 'Color Seleccionado',
      hex: selectedColorHex || '#1B2A6B',
      category: 'Seleccionado',
      code: 'PIN-SEL',
      lrv: 35,
      family: 'Tintometría Especial',
      description: 'Fórmula computarizada preparada con pigmentos de alta dispersión Pintuco.',
    };

  // LRV calculation helper
  const calculateLuminance = (hex: string): number => {
    const cleanHex = hex.replace('#', '');
    if (cleanHex.length !== 6) return 50;
    const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
    const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
    const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
    // Standard relative luminance
    return Math.round((0.2126 * r + 0.7152 * g + 0.0722 * b) * 100);
  };

  const colorLRV = currentColor.lrv ?? calculateLuminance(currentColor.hex);
  const isLightColor = colorLRV > 62;
  const currentScene = SCENES[activeZone];

  // Coat factor
  const coatCoverage = coats === 1 ? 0.78 : coats === 2 ? 0.94 : 1.0;

  // Finish characteristics for paint realism
  const getFinishProperties = () => {
    switch (finish) {
      case 'brillante':
        return {
          name: 'Brillante',
          sheenOpacity: 0.35,
          roughness: 0.1,
          desc: 'Reflejo nítido y resplandor luminoso tipo esmalte.',
          gradient: 'radial-gradient(ellipse at 35% 25%, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.15) 30%, transparent 60%)',
        };
      case 'semibrillante':
        return {
          name: 'Semibrillante',
          sheenOpacity: 0.22,
          roughness: 0.3,
          desc: 'Lustre equilibrado de alta lavabilidad y elegancia.',
          gradient: 'radial-gradient(ellipse at 38% 30%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.1) 40%, transparent 70%)',
        };
      case 'satinado':
        return {
          name: 'Satinado',
          sheenOpacity: 0.14,
          roughness: 0.5,
          desc: 'Tersura sedosa con suave reflexión difusa envolvente.',
          gradient: 'radial-gradient(ellipse at 40% 35%, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.05) 50%, transparent 80%)',
        };
      case 'epoxico_antideslizante':
        return {
          name: 'Epóxico Vitrificado',
          sheenOpacity: 0.28,
          roughness: 0.2,
          desc: 'Película polimérica ultra resistente.',
          gradient: 'radial-gradient(ellipse at 36% 28%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.1) 35%, transparent 65%)',
        };
      case 'mate':
      default:
        return {
          name: 'Mate Antirreflejo',
          sheenOpacity: 0.03,
          roughness: 0.85,
          desc: 'Absorbe la luz sin destellos; disimula imperfecciones.',
          gradient: 'none',
        };
    }
  };

  const finishProps = getFinishProperties();

  // Lighting temperature effects
  const getLightingFilter = () => {
    switch (lighting) {
      case 'golden_hour':
        return {
          label: 'Atardecer Dorado (3200K)',
          colorCast: 'rgba(251, 146, 60, 0.18)',
          lightBlend: 'soft-light',
          gradient: 'linear-gradient(115deg, rgba(254, 215, 170, 0.35) 0%, rgba(251, 146, 60, 0.12) 45%, transparent 80%)',
          brightness: 'brightness(1.03) contrast(1.04)',
        };
      case 'warm_interior':
        return {
          label: 'Interior Cálido (2700K)',
          colorCast: 'rgba(245, 158, 11, 0.14)',
          lightBlend: 'soft-light',
          gradient: 'radial-gradient(circle at 75% 25%, rgba(253, 230, 138, 0.4) 0%, rgba(245, 158, 11, 0.1) 40%, transparent 75%)',
          brightness: 'brightness(0.98) contrast(1.02)',
        };
      case 'cool_modern':
        return {
          label: 'Luz Fría / LED (6500K)',
          colorCast: 'rgba(186, 230, 253, 0.16)',
          lightBlend: 'soft-light',
          gradient: 'linear-gradient(to right, rgba(224, 242, 254, 0.3) 0%, transparent 60%)',
          brightness: 'brightness(1.02) contrast(1.05)',
        };
      case 'daylight':
      default:
        return {
          label: 'Luz Natural Día (5500K)',
          colorCast: 'rgba(255, 255, 255, 0.08)',
          lightBlend: 'screen',
          gradient: 'linear-gradient(to right, rgba(255, 255, 255, 0.32) 0%, rgba(255, 255, 255, 0.08) 40%, transparent 75%)',
          brightness: 'brightness(1.0) contrast(1.0)',
        };
    }
  };

  const lightEffect = getLightingFilter();

  // Slider interaction for Before/After
  const handleSliderMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSplitPos(pct);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    handleSliderMove(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging) {
      handleSliderMove(e.clientX);
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Custom Hex Input
  const handleCustomHexChange = (hex: string) => {
    setCustomHex(hex);
    if (/^#([0-9A-F]{3}){1,2}$/i.test(hex)) {
      onSelectColor({
        name: `Tono Especial (${hex.toUpperCase()})`,
        hex: hex,
        category: 'Personalizado',
        code: 'PIN-CUSTOM',
        lrv: calculateLuminance(hex),
        family: 'Tintometría Especial',
        description: `Color formulado según requerimiento específico (${hex.toUpperCase()}).`,
      });
    }
  };

  // Filtered colors
  const currentPortfolio =
    PINTUCO_PORTFOLIOS.find((p) => p.id === activePortfolioId) || PINTUCO_PORTFOLIOS[0];

  const filteredColors = currentPortfolio.colors.filter((c) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(query) ||
      c.code?.toLowerCase().includes(query) ||
      c.family?.toLowerCase().includes(query)
    );
  });

  // Gallons estimate for the scene
  const gallonsNeeded = Math.max(
    1,
    Math.ceil((currentScene.surfaceAreaM2 * coats) / (coats === 1 ? 40 : 36))
  );

  return (
    <div
      className={`bg-slate-950 text-white rounded-3xl border border-slate-800 shadow-2xl overflow-hidden transition-all duration-300 ${
        isFullscreen ? 'fixed inset-2 z-50 overflow-y-auto max-h-[98vh]' : 'relative'
      }`}
    >
      {/* SVG Texture Filters Definition */}
      <svg className="absolute w-0 h-0 overflow-hidden" aria-hidden="true">
        <defs>
          <filter id={`wall-grain-${filterId}`} x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency={surfaceTexture === 'rustico' ? '0.7' : surfaceTexture === 'estuco' ? '0.9' : '1.2'}
              numOctaves={3}
              result="noise"
            />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.12 0"
              result="coloredNoise"
            />
            <feComposite operator="in" in2="SourceGraphic" />
          </filter>
        </defs>
      </svg>

      {/* TOP BAR: STUDIO BRANDING & HIGH-LEVEL CONTROLS */}
      <div className="bg-slate-900/95 px-5 sm:px-6 py-3.5 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#1B2A6B] via-[#0284C7] to-[#2FAE6D] flex items-center justify-center text-white shadow-lg shadow-blue-950/60 ring-1 ring-white/20">
            <Paintbrush className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                Simulador Arquitectónico Pintuco®
              </h3>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Sparkles className="w-3 h-3" />
                Óptica Realista
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Prueba colores en tiempo real con luz natural, sombras de esquina y textura de película seca.
            </p>
          </div>
        </div>

        {/* CONTROLS: Before/After, Coats, Texture, Fullscreen */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Before/After Split Switch */}
          <button
            type="button"
            onClick={() => setIsSplitMode(!isSplitMode)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isSplitMode
                ? 'bg-[#1B2A6B] text-white shadow-md ring-1 ring-blue-400/50'
                : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
            }`}
            title="Comparar antes (pared original) y después (color simulado)"
          >
            <Split className="w-3.5 h-3.5" />
            <span>{isSplitMode ? 'Antes / Después' : 'Vista Completa'}</span>
          </button>

          {/* Manos de Pintura (Coats) */}
          <div className="flex items-center gap-1 bg-slate-800/90 px-2.5 py-1 rounded-xl border border-slate-700/80 text-xs">
            <span className="text-[11px] font-bold text-slate-400 mr-1 hidden sm:inline">Manos:</span>
            {([1, 2, 3] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCoats(c)}
                className={`w-6 h-6 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                  coats === c
                    ? 'bg-[#2FAE6D] text-white shadow-xs scale-105'
                    : 'text-slate-400 hover:text-white hover:bg-slate-700/60'
                }`}
                title={`${c} ${c === 1 ? 'Mano (Capa delgada)' : 'Manos (Recomendado Pintuco)'}`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Surface Texture */}
          <div className="hidden md:flex items-center bg-slate-800/90 p-0.5 rounded-xl border border-slate-700/80 text-xs">
            <button
              type="button"
              onClick={() => setSurfaceTexture('liso')}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                surfaceTexture === 'liso' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Liso Yeso
            </button>
            <button
              type="button"
              onClick={() => setSurfaceTexture('estuco')}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                surfaceTexture === 'estuco' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Estuco
            </button>
            <button
              type="button"
              onClick={() => setSurfaceTexture('rustico')}
              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                surfaceTexture === 'rustico' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Rústico
            </button>
          </div>

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
            title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* SCENE TABS (Sala, Habitación, Fachada, Comedor, Textura) */}
      <div className="bg-slate-900 border-b border-slate-800/80 px-4 sm:px-6 py-2.5">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'sala_contemporanea' as SceneZone, label: 'Sala Contemporánea', icon: Home },
            { id: 'habitacion_suite' as SceneZone, label: 'Habitación Suite', icon: BedDouble },
            { id: 'fachada_moderna' as SceneZone, label: 'Fachada Exterior', icon: Building2 },
            { id: 'comedor_minimal' as SceneZone, label: 'Comedor Gourmet', icon: UtensilsCrossed },
            { id: 'textura_macro' as SceneZone, label: 'Textura & Brillo 1:1', icon: ZoomIn },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeZone === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveZone(tab.id)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#1B2A6B] text-white shadow-md shadow-blue-950/60 ring-1 ring-blue-400/50'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                    isActive ? 'bg-[#2FAE6D] text-white' : 'bg-slate-700 text-slate-400'
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

      {/* MAIN REALISTIC PHOTOREALISTIC VIEWPORT */}
      <div className="p-4 sm:p-6 bg-slate-950">
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="relative w-full aspect-[16/10] sm:aspect-[16/9] max-h-[520px] rounded-3xl overflow-hidden bg-slate-900 shadow-2xl border border-slate-800 select-none group touch-none"
        >
          {/* ========================================================================= */}
          {/* PHOTOREALISTIC ARCHITECTURAL SCENE ENGINE                                */}
          {/* We render high-resolution architectural settings with organic wall depth */}
          {/* ========================================================================= */}

          {/* SCENE 1: SALA CONTEMPORÁNEA */}
          {activeZone === 'sala_contemporanea' && (
            <div className="absolute inset-0">
              {/* Original Room Base Photo */}
              <img
                src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1400&q=85"
                alt="Sala de estar contemporánea"
                className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
                draggable={false}
              />

              {/* REALISTIC PAINT APPLICATION LAYER (Masked precisely to the wall plane) */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  clipPath: isSplitMode ? `inset(0 0 0 ${splitPos}%)` : 'none',
                }}
              >
                {/* Wall architectural plane SVG mask: covers main wall cleanly behind furniture */}
                <svg
                  className="absolute inset-0 w-full h-full"
                  viewBox="0 0 1000 600"
                  preserveAspectRatio="none"
                >
                  <defs>
                    {/* Wall geometry excluding floor parquet and foreground sofa */}
                    <clipPath id="sala-wall-clip">
                      <polygon points="120,0 1000,0 1000,460 120,460" />
                    </clipPath>
                  </defs>

                  {/* 1. Pigment Body with Realistic Subtractive Absorption */}
                  <rect
                    x="120"
                    y="0"
                    width="880"
                    height="460"
                    fill={currentColor.hex}
                    style={{
                      mixBlendMode: isLightColor ? 'soft-light' : 'multiply',
                      opacity: isLightColor
                        ? Math.min(0.95, (0.68 + (colorLRV / 100) * 0.28) * coatCoverage)
                        : Math.min(0.92, (0.58 + ((65 - colorLRV) / 65) * 0.32) * coatCoverage),
                    }}
                  />

                  {/* 2. Chrominance Pintuco Pigment Vibrancy */}
                  <rect
                    x="120"
                    y="0"
                    width="880"
                    height="460"
                    fill={currentColor.hex}
                    style={{
                      mixBlendMode: 'color',
                      opacity: Math.min(0.85, 0.72 * coatCoverage),
                    }}
                  />

                  {/* 3. Wall Corner Ambient Occlusion (Ceiling, Floor, Left Corner crease) */}
                  <rect
                    x="120"
                    y="0"
                    width="880"
                    height="460"
                    fill="url(#sala-corner-shadow)"
                    style={{ mixBlendMode: 'multiply', opacity: 0.8 }}
                  />

                  {/* 4. Natural Window Light Falloff (Bright near left window, gentle gradient across) */}
                  <rect
                    x="120"
                    y="0"
                    width="880"
                    height="460"
                    fill="url(#sala-window-light)"
                    style={{ mixBlendMode: 'overlay', opacity: 0.65 }}
                  />

                  <defs>
                    <linearGradient id="sala-corner-shadow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#000000" stopOpacity="0.35" />
                      <stop offset="8%" stopColor="#000000" stopOpacity="0.08" />
                      <stop offset="25%" stopColor="#000000" stopOpacity="0" />
                      <stop offset="80%" stopColor="#000000" stopOpacity="0" />
                      <stop offset="92%" stopColor="#000000" stopOpacity="0.12" />
                      <stop offset="100%" stopColor="#000000" stopOpacity="0.4" />
                    </linearGradient>

                    <linearGradient id="sala-window-light" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
                      <stop offset="40%" stopColor="#ffffff" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#000000" stopOpacity="0.25" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Micro-roller stipple texture */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-25"
                  style={{
                    clipPath: 'polygon(12% 0%, 100% 0%, 100% 77%, 12% 77%)',
                    backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.4) 1px, transparent 0), radial-gradient(circle at 3px 3px, rgba(0,0,0,0.3) 1px, transparent 0)`,
                    backgroundSize: '4px 4px',
                    mixBlendMode: 'overlay',
                  }}
                />

                {/* Finish Specular Sheen (Mate / Satinado / Semibrillante / Brillante) */}
                {finishProps.sheenOpacity > 0.05 && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      clipPath: 'polygon(12% 0%, 100% 0%, 100% 77%, 12% 77%)',
                      background: finishProps.gradient,
                      mixBlendMode: 'overlay',
                      opacity: finishProps.sheenOpacity * coatCoverage,
                    }}
                  />
                )}

                {/* Dynamic Lighting Mode Glow */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    clipPath: 'polygon(12% 0%, 100% 0%, 100% 77%, 12% 77%)',
                    background: lightEffect.gradient,
                    mixBlendMode: 'soft-light',
                    opacity: 0.85,
                  }}
                />

                {/* FOREGROUND PROTECTION LAYER: Furniture, frame, and brass lamp stay crisp in front */}
                {/* 1. Wood parquet floor */}
                <div
                  className="absolute inset-0 pointer-events-none overflow-hidden"
                  style={{ clipPath: 'polygon(0% 77%, 100% 77%, 100% 100%, 0% 100%)' }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1400&q=85"
                    alt="Piso"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* 2. Left architectural column & window frame */}
                <div
                  className="absolute inset-0 pointer-events-none overflow-hidden"
                  style={{ clipPath: 'polygon(0% 0%, 12% 0%, 12% 100%, 0% 100%)' }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1400&q=85"
                    alt="Columna"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* 3. Framed picture art on wall */}
                <div
                  className="absolute inset-0 pointer-events-none overflow-hidden"
                  style={{ clipPath: 'polygon(27.8% 12.8%, 43.2% 12.8%, 43.2% 57.8%, 27.8% 57.8%)' }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1400&q=85"
                    alt="Cuadro"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* 4. Designer yellow armchair in front */}
                <div
                  className="absolute inset-0 pointer-events-none overflow-hidden"
                  style={{ clipPath: 'polygon(21% 54%, 59% 54%, 60% 78%, 18% 78%)' }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1400&q=85"
                    alt="Sillón"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SCENE 2: HABITACIÓN MASTER SUITE */}
          {activeZone === 'habitacion_suite' && (
            <div className="absolute inset-0">
              <img
                src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1400&q=85"
                alt="Habitación master suite"
                className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
                draggable={false}
              />

              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  clipPath: isSplitMode ? `inset(0 0 0 ${splitPos}%)` : 'none',
                }}
              >
                {/* Headboard Wall Paint Layer */}
                <div
                  className="absolute inset-0"
                  style={{
                    clipPath: 'polygon(0% 6%, 100% 6%, 100% 76%, 0% 76%)',
                    backgroundColor: currentColor.hex,
                    mixBlendMode: isLightColor ? 'soft-light' : 'multiply',
                    opacity: isLightColor
                      ? Math.min(0.96, (0.72 + (colorLRV / 100) * 0.25) * coatCoverage)
                      : Math.min(0.94, (0.6 + ((65 - colorLRV) / 65) * 0.3) * coatCoverage),
                  }}
                />

                <div
                  className="absolute inset-0"
                  style={{
                    clipPath: 'polygon(0% 6%, 100% 6%, 100% 76%, 0% 76%)',
                    backgroundColor: currentColor.hex,
                    mixBlendMode: 'color',
                    opacity: 0.75 * coatCoverage,
                  }}
                />

                {/* Ceiling & Floor Ambient Occlusion */}
                <div
                  className="absolute inset-0"
                  style={{
                    clipPath: 'polygon(0% 6%, 100% 6%, 100% 76%, 0% 76%)',
                    background:
                      'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 15%, transparent 80%, rgba(0,0,0,0.35) 100%)',
                    mixBlendMode: 'multiply',
                  }}
                />

                {/* Lighting glow */}
                <div
                  className="absolute inset-0"
                  style={{
                    clipPath: 'polygon(0% 6%, 100% 6%, 100% 76%, 0% 76%)',
                    background: lightEffect.gradient,
                    mixBlendMode: 'soft-light',
                    opacity: 0.85,
                  }}
                />

                {/* Foreground: Bed & Ceiling Molding preserved */}
                <div
                  className="absolute inset-0 pointer-events-none overflow-hidden"
                  style={{ clipPath: 'polygon(0% 0%, 100% 0%, 100% 6%, 0% 6%)' }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1400&q=85"
                    alt="Moldura cielo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div
                  className="absolute inset-0 pointer-events-none overflow-hidden"
                  style={{ clipPath: 'polygon(16% 45%, 84% 45%, 88% 100%, 12% 100%)' }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1400&q=85"
                    alt="Cama"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div
                  className="absolute inset-0 pointer-events-none overflow-hidden"
                  style={{ clipPath: 'polygon(0% 76%, 100% 76%, 100% 100%, 0% 100%)' }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1400&q=85"
                    alt="Piso habitación"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SCENE 3: FACHADA EXTERIOR MODERNA */}
          {activeZone === 'fachada_moderna' && (
            <div className="absolute inset-0">
              <img
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85"
                alt="Fachada moderna exterior"
                className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
                draggable={false}
              />

              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  clipPath: isSplitMode ? `inset(0 0 0 ${splitPos}%)` : 'none',
                }}
              >
                {/* Exterior Stucco Volume Paint Layer */}
                <div
                  className="absolute inset-0"
                  style={{
                    clipPath: 'polygon(42% 16%, 98% 16%, 98% 84%, 66% 84%, 66% 52%, 42% 52%)',
                    backgroundColor: currentColor.hex,
                    mixBlendMode: isLightColor ? 'soft-light' : 'multiply',
                    opacity: isLightColor
                      ? Math.min(0.96, (0.74 + (colorLRV / 100) * 0.24) * coatCoverage)
                      : Math.min(0.92, (0.62 + ((65 - colorLRV) / 65) * 0.3) * coatCoverage),
                  }}
                />

                <div
                  className="absolute inset-0"
                  style={{
                    clipPath: 'polygon(42% 16%, 98% 16%, 98% 84%, 66% 84%, 66% 52%, 42% 52%)',
                    backgroundColor: currentColor.hex,
                    mixBlendMode: 'color',
                    opacity: 0.8 * coatCoverage,
                  }}
                />

                {/* Direct Sunlight & Architectural Shadow */}
                <div
                  className="absolute inset-0"
                  style={{
                    clipPath: 'polygon(42% 16%, 98% 16%, 98% 84%, 66% 84%, 66% 52%, 42% 52%)',
                    background:
                      'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 40%, rgba(0,0,0,0.25) 100%)',
                    mixBlendMode: 'overlay',
                  }}
                />

                {/* Windows and Sky preserved in front */}
                <div
                  className="absolute inset-0 pointer-events-none overflow-hidden"
                  style={{ clipPath: 'polygon(67% 28%, 86% 28%, 86% 50%, 67% 50%)' }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85"
                    alt="Ventanales"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SCENE 4: COMEDOR GOURMET */}
          {activeZone === 'comedor_minimal' && (
            <div className="absolute inset-0">
              <img
                src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1400&q=85"
                alt="Comedor y cocina gourmet"
                className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
                draggable={false}
              />

              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  clipPath: isSplitMode ? `inset(0 0 0 ${splitPos}%)` : 'none',
                }}
              >
                {/* Dining room accent wall */}
                <div
                  className="absolute inset-0"
                  style={{
                    clipPath: 'polygon(25% 0%, 100% 0%, 100% 64%, 25% 64%)',
                    backgroundColor: currentColor.hex,
                    mixBlendMode: isLightColor ? 'soft-light' : 'multiply',
                    opacity: isLightColor
                      ? Math.min(0.95, (0.7 + (colorLRV / 100) * 0.26) * coatCoverage)
                      : Math.min(0.92, (0.6 + ((65 - colorLRV) / 65) * 0.3) * coatCoverage),
                  }}
                />
                <div
                  className="absolute inset-0"
                  style={{
                    clipPath: 'polygon(25% 0%, 100% 0%, 100% 64%, 25% 64%)',
                    backgroundColor: currentColor.hex,
                    mixBlendMode: 'color',
                    opacity: 0.78 * coatCoverage,
                  }}
                />
                {/* Ambient ceiling shadow */}
                <div
                  className="absolute inset-0"
                  style={{
                    clipPath: 'polygon(25% 0%, 100% 0%, 100% 64%, 25% 64%)',
                    background:
                      'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.2) 100%)',
                    mixBlendMode: 'multiply',
                  }}
                />
                {/* Island countertop & cabinets preserved in front */}
                <div
                  className="absolute inset-0 pointer-events-none overflow-hidden"
                  style={{ clipPath: 'polygon(0% 0%, 25% 0%, 25% 100%, 0% 100%)' }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1400&q=85"
                    alt="Mueble izquierdo"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div
                  className="absolute inset-0 pointer-events-none overflow-hidden"
                  style={{ clipPath: 'polygon(25% 64%, 100% 64%, 100% 100%, 25% 100%)' }}
                >
                  <img
                    src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1400&q=85"
                    alt="Mesón comedor"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SCENE 5: MACRO TEXTURA Y PELÍCULA SECA 1:1 */}
          {activeZone === 'textura_macro' && (
            <div className="absolute inset-0 bg-slate-900 flex items-center justify-center overflow-hidden">
              {/* Macro stucco texture base plate */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundColor: currentColor.hex,
                  backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.25) 1.5px, transparent 0), radial-gradient(circle at 6px 6px, rgba(0,0,0,0.35) 2px, transparent 0)`,
                  backgroundSize: '8px 8px',
                }}
              />

              {/* Raking lateral light creating realistic micro-shadows of paint roller stipple */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'linear-gradient(90deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.1) 30%, transparent 65%, rgba(0,0,0,0.35) 100%)',
                  mixBlendMode: 'overlay',
                }}
              />

              {/* Specular sheen according to finish */}
              {finishProps.sheenOpacity > 0.05 && (
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: finishProps.gradient,
                    mixBlendMode: 'overlay',
                    opacity: finishProps.sheenOpacity * 1.5,
                  }}
                />
              )}

              {/* Magnifier grid overlay */}
              <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_45%,rgba(0,0,0,0.5)_100%)] flex items-center justify-center">
                <div className="w-48 h-48 sm:w-64 sm:h-64 rounded-full border-2 border-white/40 shadow-2xl backdrop-blur-[0.5px] relative flex items-center justify-center">
                  <div className="absolute -top-3 bg-slate-950 text-emerald-400 border border-emerald-500/40 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                    Microtextura Rodillo 1:1
                  </div>
                  <div className="text-center bg-slate-950/80 p-3 rounded-2xl border border-white/10 backdrop-blur-md">
                    <span className="block text-xs font-mono font-bold text-white">
                      {currentColor.code}
                    </span>
                    <span className="block text-sm font-black text-emerald-400">
                      Acabado {finishProps.name}
                    </span>
                    <span className="text-[10px] text-slate-300">
                      Poder cubriente: {coats} {coats === 1 ? 'mano' : 'manos'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* INTERACTIVE BEFORE / AFTER SLIDER DIVIDER                                */}
          {/* ========================================================================= */}
          {isSplitMode && (
            <div
              className="absolute inset-y-0 z-20 pointer-events-none"
              style={{ left: `${splitPos}%` }}
            >
              {/* Vertical Laser Divider Line */}
              <div className="absolute inset-y-0 -left-[1.5px] w-[3px] bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)]" />

              {/* Central Drag Handle */}
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white text-slate-900 shadow-2xl flex items-center justify-center border-2 border-slate-900 cursor-ew-resize pointer-events-auto hover:scale-110 active:scale-95 transition-transform">
                <Split className="w-5 h-5 text-[#1B2A6B]" />
              </div>

              {/* Before Badge */}
              <div className="absolute top-4 -translate-x-full pr-3">
                <span className="px-2.5 py-1 rounded-lg bg-slate-950/85 backdrop-blur-md text-[11px] font-black text-slate-300 border border-slate-700/80 shadow-lg">
                  Original
                </span>
              </div>

              {/* After Badge */}
              <div className="absolute top-4 translate-x-0 pl-3">
                <span className="px-2.5 py-1 rounded-lg bg-[#1B2A6B]/90 backdrop-blur-md text-[11px] font-black text-white border border-blue-400/50 shadow-lg flex items-center gap-1">
                  <span
                    className="w-2.5 h-2.5 rounded-full inline-block border border-white/40"
                    style={{ backgroundColor: currentColor.hex }}
                  />
                  {currentColor.name}
                </span>
              </div>
            </div>
          )}

          {/* BOTTOM FLOATING LIGHTING SELECTOR OVERLAY */}
          <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
            {/* Lighting Temperature Switcher */}
            <div className="bg-slate-950/90 backdrop-blur-md p-1 rounded-2xl border border-slate-800 shadow-xl flex items-center gap-1 pointer-events-auto">
              <span className="text-[10px] font-extrabold uppercase text-slate-400 px-2 hidden sm:inline">
                Iluminación:
              </span>
              {[
                { id: 'daylight' as LightingMode, label: 'Día', icon: Sun, temp: '5500K' },
                { id: 'golden_hour' as LightingMode, label: 'Atardecer', icon: Sunset, temp: '3200K' },
                { id: 'warm_interior' as LightingMode, label: 'Cálida', icon: Lamp, temp: '2700K' },
                { id: 'cool_modern' as LightingMode, label: 'Fría', icon: Moon, temp: '6500K' },
              ].map((m) => {
                const Icon = m.icon;
                const isCur = lighting === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setLighting(m.id)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      isCur
                        ? 'bg-[#1B2A6B] text-white shadow-xs font-black ring-1 ring-blue-400/60'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                    }`}
                    title={`${m.label} (${m.temp})`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Room Area & Product Recommendation Pill */}
            <div className="bg-slate-950/90 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-slate-800 shadow-xl flex items-center gap-2 pointer-events-auto">
              <span className="text-xs font-extrabold text-white">
                {currentScene.surfaceAreaM2} m²
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-emerald-400 font-bold hidden sm:inline">
                {gallonsNeeded} {gallonsNeeded === 1 ? 'Galón' : 'Galones'} recomendados
              </span>
            </div>
          </div>
        </div>

        {/* ACTIVE COLOR SPECS & ACTION STRIP */}
        <div className="mt-4 bg-slate-900 rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl border-2 border-white/20 shadow-xl flex-shrink-0 relative overflow-hidden"
              style={{ backgroundColor: currentColor.hex }}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-black/25 via-transparent to-white/20" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-base font-black text-white">{currentColor.name}</h4>
                <span className="text-xs px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 font-mono font-bold">
                  {currentColor.code}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                  LRV: {colorLRV}%
                </span>
                <span className="text-xs px-2 py-0.5 rounded-lg bg-blue-500/20 text-blue-300 font-bold">
                  Acabado: {finishProps.name}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                {currentColor.description || currentScene.productSuggestion}
              </p>
            </div>
          </div>

          {/* Action button: Apply color */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSelectColor(currentColor)}
              className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#2FAE6D] to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-black text-xs sm:text-sm shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Usar este Color en mi Solución</span>
            </button>
          </div>
        </div>

        {/* COLOR COLLECTIONS SELECTOR & SWATCHES */}
        <div className="mt-6 space-y-4">
          {/* Header of Swatches with Search and Categories */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {PINTUCO_PORTFOLIOS.map((port) => (
                <button
                  key={port.id}
                  type="button"
                  onClick={() => setActivePortfolioId(port.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                    activePortfolioId === port.id
                      ? 'bg-white text-slate-950 font-black shadow-md'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <span>{port.icon}</span>
                  <span>{port.name}</span>
                </button>
              ))}
            </div>

            {/* Search Input & Custom Color Picker */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:w-48">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar color..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
              </div>

              {/* Custom HEX Eyedropper Picker */}
              <div className="relative flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2 py-1 rounded-xl" title="Elegir color a medida en HEX">
                <input
                  type="color"
                  value={customHex}
                  onChange={(e) => handleCustomHexChange(e.target.value)}
                  className="w-6 h-6 rounded-lg cursor-pointer bg-transparent border-0 p-0"
                />
                <span className="text-[11px] font-mono font-bold text-slate-400">
                  {customHex.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* SWATCHES GRID: Clean, Realistic Color Swatch Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
            {filteredColors.map((col) => {
              const isSelected =
                currentColor.hex.toLowerCase() === col.hex.toLowerCase() ||
                currentColor.name.toLowerCase() === col.name.toLowerCase();

              return (
                <button
                  key={`${col.code}-${col.name}`}
                  type="button"
                  onClick={() => {
                    setCustomHex(col.hex);
                    onSelectColor(col);
                  }}
                  className={`group relative p-2.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-900 border-emerald-400 shadow-lg shadow-emerald-950/40 ring-2 ring-emerald-400/40 scale-[1.03]'
                      : 'bg-slate-900/80 hover:bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Swatch Pill with realistic depth */}
                  <div
                    className="w-full h-12 rounded-xl border border-black/10 relative overflow-hidden shadow-inner group-hover:scale-[1.02] transition-transform"
                    style={{ backgroundColor: col.hex }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/20" />
                    {isSelected && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-6 h-6 rounded-full bg-slate-950/90 text-emerald-400 flex items-center justify-center shadow-lg border border-emerald-400/50">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Swatch Labels */}
                  <div className="mt-2">
                    <span className="block text-xs font-bold text-white truncate leading-tight group-hover:text-emerald-300">
                      {col.name}
                    </span>
                    <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                      <span className="font-mono">{col.code}</span>
                      <span>LRV {col.lrv}%</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
