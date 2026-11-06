import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Sparkles,
  RotateCcw,
  Check,
  Calculator,
  Download,
  Eye,
  Layers,
  ArrowRight,
  ShieldCheck,
  Droplets,
  Palette,
  Maximize2,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export interface RoomScenario {
  id: 'sala_de_estar' | 'cocina' | 'habitacion' | 'exterior_casa' | 'oficina';
  name: string;
  category: 'Interior' | 'Exterior';
  description: string;
  surfaceType: string;
  recommendedProduct: string;
  imageSrc: string;
  maskSrc: string;
  aspectRatio: string;
  accentTip: string;
}

export const ROOM_SCENARIOS: RoomScenario[] = [
  {
    id: 'sala_de_estar',
    name: 'Sala de Estar',
    category: 'Interior',
    description: 'Muros principales con sofá gris, mesa de centro, tapete artesanal y ventanal al jardín.',
    surfaceType: 'Mampostería / Muros interiores',
    recommendedProduct: 'Viniltex Avanzado® Antibacterial (Lavable)',
    imageSrc: '/assets/simulator/sala_de_estar.jpg',
    maskSrc: '/assets/simulator/sala_de_estar_mask.png',
    aspectRatio: '702 / 382',
    accentTip: '20 variaciones fotorrealistas con muebles y piso 100% aislados e intactos.',
  },
  {
    id: 'cocina',
    name: 'Cocina',
    category: 'Interior',
    description: 'Muros perimetrales y vano de ventana sobre gabinetes blancos y mesón gris.',
    surfaceType: 'Zona Húmeda / Mampostería',
    recommendedProduct: 'Viniltex Baños & Cocina® Antihongos con Teflón®',
    imageSrc: '/assets/simulator/cocina.jpg',
    maskSrc: '/assets/simulator/cocina_mask.png',
    aspectRatio: '702 / 382',
    accentTip: '20 variaciones fotorrealistas con gabinetes, mesón, grifería y ventana 100% aislados e intactos.',
  },
  {
    id: 'habitacion',
    name: 'Habitación',
    category: 'Interior',
    description: 'Pared principal de cabecero con lámparas de noche cálidas, tocador y ventanal amplio.',
    surfaceType: 'Mampostería / Drywall',
    recommendedProduct: 'Viniltex Avanzado® Mate (Bajo Olor y Cero Brillo)',
    imageSrc: '/assets/simulator/habitacion.jpg',
    maskSrc: '/assets/simulator/habitacion_mask.png',
    aspectRatio: '702 / 382',
    accentTip: '20 variaciones fotorrealistas con cama, cabecero, mesas de noche, tocador y lámparas 100% aislados e intactos.',
  },
  {
    id: 'exterior_casa',
    name: 'Exterior de Casa',
    category: 'Exterior',
    description: 'Fachada frontal moderna con porche de columnas blancas, zócalo de ladrillo, ventanales y jardín exterior.',
    surfaceType: 'Fachada Exterior / Concreto y Pañete',
    recommendedProduct: 'Koraza 5® Máxima Protección Exterior',
    imageSrc: '/assets/simulator/exterior_casa.jpg',
    maskSrc: '/assets/simulator/exterior_casa_mask.png',
    aspectRatio: '702 / 382',
    accentTip: '20 variaciones fotorrealistas con techo, columnas, ventanas, puerta, zócalo de ladrillo y jardín 100% aislados e intactos.',
  },
  {
    id: 'oficina',
    name: 'Oficina',
    category: 'Interior',
    description: 'Oficina ejecutiva con ventanales panorámicos de esquina, escritorio gerencial, biblioteca y sillón de cuero.',
    surfaceType: 'Muros / Yeso / Drywall',
    recommendedProduct: 'Viniltex Avanzado® o Satinado Profesional',
    imageSrc: '/assets/simulator/oficina.jpg',
    maskSrc: '/assets/simulator/oficina_mask.png',
    aspectRatio: '702 / 382',
    accentTip: '20 variaciones fotorrealistas con ventanales, escritorios, computadores, biblioteca, puertas y escultura 100% aislados e intactos.',
  },
];

export interface RealWallColor {
  id: string;
  name: string;
  code: string;
  family: 'Verdes & Frescura' | 'Azules & Serenidad' | 'Rosas & Púrpuras' | 'Cálidos & Tierras' | 'Blancos, Grises & Neutros';
  hex: string;
  image: string;
  description: string;
}

/**
 * 20 COLORES REALES DE MURO DE LAS IMÁGENES
 * Cada color corresponde exactamente al color de la pared de cada imagen
 */
export const SALA_WALL_COLORS: RealWallColor[] = [
  // 1. Verdes & Frescura
  {
    id: 'verde_menta_claro',
    name: 'Verde Menta Luminoso',
    code: 'PIN-V01',
    family: 'Verdes & Frescura',
    hex: '#DDF4EC',
    image: '/assets/simulator/sala_variations/verde_menta_claro.jpg',
    description: 'Tono menta pastel muy luminoso y fresco; maximiza la entrada de luz natural.',
  },
  {
    id: 'verde_salvia',
    name: 'Verde Salvia Nórdico',
    code: 'PIN-V02',
    family: 'Verdes & Frescura',
    hex: '#B1C1A7',
    image: '/assets/simulator/sala_variations/verde_salvia.jpg',
    description: 'Verde salvia orgánico de tendencia; aporta serenidad, equilibrio y confort visual.',
  },
  {
    id: 'verde_bosque',
    name: 'Verde Bosque Profundo',
    code: 'PIN-V03',
    family: 'Verdes & Frescura',
    hex: '#2F5543',
    image: '/assets/simulator/sala_variations/verde_bosque.jpg',
    description: 'Verde esmeralda oscuro de acento arquitectónico; alto contraste con maderas claras.',
  },
  {
    id: 'verde_oliva',
    name: 'Verde Oliva Elegante',
    code: 'PIN-V04',
    family: 'Verdes & Frescura',
    hex: '#424A33',
    image: '/assets/simulator/sala_variations/verde_oliva.jpg',
    description: 'Verde militar y oliva refinado con matices cálidos; sofisticado y contemporáneo.',
  },

  // 2. Azules & Serenidad
  {
    id: 'azul_celeste',
    name: 'Azul Celeste Cielo',
    code: 'PIN-A01',
    family: 'Azules & Serenidad',
    hex: '#A7DFFA',
    image: '/assets/simulator/sala_variations/azul_celeste.jpg',
    description: 'Azul cielo limpio y vibrante; genera sensación de amplitud y cielo abierto.',
  },
  {
    id: 'azul_lavanda_sereno',
    name: 'Azul Lavanda Sereno',
    code: 'PIN-A02',
    family: 'Azules & Serenidad',
    hex: '#9FB1D4',
    image: '/assets/simulator/sala_variations/azul_lavanda_sereno.jpg',
    description: 'Azul lavanda suave y sereno; calma visual y relajación para zonas de estar.',
  },
  {
    id: 'azul_rey_cobalto',
    name: 'Azul Rey Cobalto',
    code: 'PIN-A03',
    family: 'Azules & Serenidad',
    hex: '#255087',
    image: '/assets/simulator/sala_variations/azul_rey_cobalto.jpg',
    description: 'Azul cobalto intenso de gran carácter; resalta molduras y muebles neutros.',
  },
  {
    id: 'azul_marino_profundo',
    name: 'Azul Marino Profundo',
    code: 'PIN-A04',
    family: 'Azules & Serenidad',
    hex: '#1F314A',
    image: '/assets/simulator/sala_variations/azul_marino_profundo.jpg',
    description: 'Azul noche profundo; transmite elegancia sobria, lujo y profundidad espacial.',
  },

  // 3. Rosas & Púrpuras
  {
    id: 'rosa_pastel',
    name: 'Rosa Pastel Suave',
    code: 'PIN-R01',
    family: 'Rosas & Púrpuras',
    hex: '#FBD5D8',
    image: '/assets/simulator/sala_variations/rosa_pastel.jpg',
    description: 'Rosa pálido aterciopelado; aporta calidez delicada sin saturar el ambiente.',
  },
  {
    id: 'coral_romantico',
    name: 'Coral Romántico',
    code: 'PIN-R02',
    family: 'Rosas & Púrpuras',
    hex: '#D28083',
    image: '/assets/simulator/sala_variations/coral_romantico.jpg',
    description: 'Rosa terracota y coral suave; combina calidez moderna y luminosidad acogedora.',
  },
  {
    id: 'borgona_vino',
    name: 'Borgoña Vino Tinto',
    code: 'PIN-R03',
    family: 'Rosas & Púrpuras',
    hex: '#552D3E',
    image: '/assets/simulator/sala_variations/borgona_vino.jpg',
    description: 'Vino tinto profundo y suntuoso; ideal para muros de acento de alto impacto.',
  },
  {
    id: 'purpura_amatista',
    name: 'Púrpura Amatista',
    code: 'PIN-R04',
    family: 'Rosas & Púrpuras',
    hex: '#8A6996',
    image: '/assets/simulator/sala_variations/purpura_amatista.jpg',
    description: 'Púrpura mineral equilibrado; estimula la creatividad y personalidad del espacio.',
  },

  // 4. Cálidos & Tierras
  {
    id: 'amarillo_mantequilla',
    name: 'Amarillo Mantequilla Suave',
    code: 'PIN-C01',
    family: 'Cálidos & Tierras',
    hex: '#FDF3A9',
    image: '/assets/simulator/sala_variations/amarillo_mantequilla.jpg',
    description: 'Amarillo suave y solar; ilumina espacios con poca entrada de luz exterior.',
  },
  {
    id: 'ocre_mostaza',
    name: 'Ocre Mostaza Cálido',
    code: 'PIN-C02',
    family: 'Cálidos & Tierras',
    hex: '#F5B45D',
    image: '/assets/simulator/sala_variations/ocre_mostaza.jpg',
    description: 'Ocre dorado energizante; calidez artesanal que resalta pisos de madera clara.',
  },
  {
    id: 'rojo_colonial',
    name: 'Rojo Colonial Profundo',
    code: 'PIN-C03',
    family: 'Cálidos & Tierras',
    hex: '#662931',
    image: '/assets/simulator/sala_variations/rojo_colonial.jpg',
    description: 'Rojo vino colonial tradicional; presencia imponente y raíces arquitectónicas.',
  },
  {
    id: 'terracota_arcilla',
    name: 'Terracota Arcilla',
    code: 'PIN-C04',
    family: 'Cálidos & Tierras',
    hex: '#8D451C',
    image: '/assets/simulator/sala_variations/terracota_arcilla.jpg',
    description: 'Tierra cocida mediterránea y artesanal; textura cálida de gran arraigo visual.',
  },

  // 5. Blancos, Grises & Neutros
  {
    id: 'blanco_puro',
    name: 'Blanco Puro Luminoso',
    code: 'PIN-N01',
    family: 'Blancos, Grises & Neutros',
    hex: '#F3F3F3',
    image: '/assets/simulator/sala_variations/blanco_puro.jpg',
    description: 'Blanco arquitectónico neutro; máxima reflectancia lumínica y pureza visual.',
  },
  {
    id: 'gris_lino',
    name: 'Gris Lino Claro',
    code: 'PIN-N02',
    family: 'Blancos, Grises & Neutros',
    hex: '#C8C8CA',
    image: '/assets/simulator/sala_variations/gris_lino.jpg',
    description: 'Gris muy claro con destellos cálidos; base neutral ideal para diseño escandinavo.',
  },
  {
    id: 'gris_urbano',
    name: 'Gris Urbano Contemporáneo',
    code: 'PIN-N03',
    family: 'Blancos, Grises & Neutros',
    hex: '#6F6F6F',
    image: '/assets/simulator/sala_variations/gris_urbano.jpg',
    description: 'Gris medio de alta versatilidad; contrasta limpiamente con techos blancos y sofás.',
  },
  {
    id: 'negro_ebano',
    name: 'Negro Ébano Grafito',
    code: 'PIN-N04',
    family: 'Blancos, Grises & Neutros',
    hex: '#3C3C3E',
    image: '/assets/simulator/sala_variations/negro_ebano.jpg',
    description: 'Grafito oscuro de estética industrial; drama visual y modernismo sobrio.',
  },
];

/**
 * 20 COLORES REALES DE MURO DE LAS IMÁGENES PARA COCINA
 * Cada color corresponde exactamente al color de la pared de cada imagen
 */
export const COCINA_WALL_COLORS: RealWallColor[] = [
  // 1. Verdes & Frescura
  {
    id: 'verde_menta_claro',
    name: 'Verde Menta Luminoso',
    code: 'PIN-V01',
    family: 'Verdes & Frescura',
    hex: '#DDF0EA',
    image: '/assets/simulator/cocina_variations/verde_menta_claro.jpg',
    description: 'Tono menta fresco y luminoso; ideal para cocinas modernas con luz natural.',
  },
  {
    id: 'verde_salvia',
    name: 'Verde Salvia Nórdico',
    code: 'PIN-V02',
    family: 'Verdes & Frescura',
    hex: '#A4B799',
    image: '/assets/simulator/cocina_variations/verde_salvia.jpg',
    description: 'Verde salvia orgánico; armoniza perfectamente con gabinetes blancos y madera.',
  },
  {
    id: 'verde_bosque',
    name: 'Verde Bosque Profundo',
    code: 'PIN-V03',
    family: 'Verdes & Frescura',
    hex: '#2D5441',
    image: '/assets/simulator/cocina_variations/verde_bosque.jpg',
    description: 'Verde esmeralda profundo; contraste premium con mesones y electrodomésticos.',
  },
  {
    id: 'verde_oliva',
    name: 'Verde Oliva Elegante',
    code: 'PIN-V04',
    family: 'Verdes & Frescura',
    hex: '#454D35',
    image: '/assets/simulator/cocina_variations/verde_oliva.jpg',
    description: 'Verde oliva contemporáneo con matices cálidos; sofisticado y acogedor.',
  },

  // 2. Azules & Serenidad
  {
    id: 'azul_celeste',
    name: 'Azul Celeste Cielo',
    code: 'PIN-A01',
    family: 'Azules & Serenidad',
    hex: '#AFE1F8',
    image: '/assets/simulator/cocina_variations/azul_celeste.jpg',
    description: 'Azul cielo limpio y vibrante; aporta frescura y sensación de amplitud.',
  },
  {
    id: 'azul_lavanda_sereno',
    name: 'Azul Lavanda Sereno',
    code: 'PIN-A02',
    family: 'Azules & Serenidad',
    hex: '#9AACD2',
    image: '/assets/simulator/cocina_variations/azul_lavanda_sereno.jpg',
    description: 'Azul lavanda suave; serenidad y equilibrio para el corazón del hogar.',
  },
  {
    id: 'azul_rey_cobalto',
    name: 'Azul Rey Cobalto',
    code: 'PIN-A03',
    family: 'Azules & Serenidad',
    hex: '#234C84',
    image: '/assets/simulator/cocina_variations/azul_rey_cobalto.jpg',
    description: 'Azul cobalto intenso; gran impacto visual en muros de cocina.',
  },
  {
    id: 'azul_marino_profundo',
    name: 'Azul Marino Profundo',
    code: 'PIN-A04',
    family: 'Azules & Serenidad',
    hex: '#1D2E48',
    image: '/assets/simulator/cocina_variations/azul_marino_profundo.jpg',
    description: 'Azul noche sofisticado; lujo moderno con gabinetes y cuarzo blanco.',
  },

  // 3. Rosas & Púrpuras
  {
    id: 'rosa_pastel',
    name: 'Rosa Pastel Suave',
    code: 'PIN-R01',
    family: 'Rosas & Púrpuras',
    hex: '#FBD7DB',
    image: '/assets/simulator/cocina_variations/rosa_pastel.jpg',
    description: 'Rosa suave y cálido; añade un toque de luminosidad pastel acogedora.',
  },
  {
    id: 'coral_romantico',
    name: 'Coral Romántico',
    code: 'PIN-R02',
    family: 'Rosas & Púrpuras',
    hex: '#D88985',
    image: '/assets/simulator/cocina_variations/coral_romantico.jpg',
    description: 'Coral terracota vibrante; estimula el apetito y la calidez familiar.',
  },
  {
    id: 'borgona_vino',
    name: 'Borgoña Vino Tinto',
    code: 'PIN-R03',
    family: 'Rosas & Púrpuras',
    hex: '#502D41',
    image: '/assets/simulator/cocina_variations/borgona_vino.jpg',
    description: 'Vino tinto profundo; carácter gourmet de alta cocina europea.',
  },
  {
    id: 'purpura_amatista',
    name: 'Púrpura Amatista',
    code: 'PIN-R04',
    family: 'Rosas & Púrpuras',
    hex: '#936EA4',
    image: '/assets/simulator/cocina_variations/purpura_amatista.jpg',
    description: 'Púrpura amatista refinado; personalidad creativa y distinción culinaria.',
  },

  // 4. Cálidos & Tierras
  {
    id: 'amarillo_mantequilla',
    name: 'Amarillo Mantequilla Suave',
    code: 'PIN-C01',
    family: 'Cálidos & Tierras',
    hex: '#FBEFBF',
    image: '/assets/simulator/cocina_variations/amarillo_mantequilla.jpg',
    description: 'Amarillo cálido y solar; maximiza la luz matutina en la cocina.',
  },
  {
    id: 'ocre_mostaza',
    name: 'Ocre Mostaza Cálido',
    code: 'PIN-C02',
    family: 'Cálidos & Tierras',
    hex: '#D78F2D',
    image: '/assets/simulator/cocina_variations/ocre_mostaza.jpg',
    description: 'Ocre dorado energizante; calidez artesanal y estilo rústico moderno.',
  },
  {
    id: 'rojo_colonial',
    name: 'Rojo Colonial Profundo',
    code: 'PIN-C03',
    family: 'Cálidos & Tierras',
    hex: '#5C2A36',
    image: '/assets/simulator/cocina_variations/rojo_colonial.jpg',
    description: 'Rojo colonial clásico; tradición gastronómica y energía vibrante.',
  },
  {
    id: 'terracota_arcilla',
    name: 'Terracota Arcilla',
    code: 'PIN-C04',
    family: 'Cálidos & Tierras',
    hex: '#924E2B',
    image: '/assets/simulator/cocina_variations/terracota_arcilla.jpg',
    description: 'Tierra cocida mediterránea; estilo toscano rústico y acogedor.',
  },

  // 5. Blancos, Grises & Neutros
  {
    id: 'blanco_puro',
    name: 'Blanco Puro Luminoso',
    code: 'PIN-N01',
    family: 'Blancos, Grises & Neutros',
    hex: '#F2F2F0',
    image: '/assets/simulator/cocina_variations/blanco_puro.jpg',
    description: 'Blanco arquitectónico puro; máxima higiene visual, amplitud y luminosidad.',
  },
  {
    id: 'gris_lino',
    name: 'Gris Lino Claro',
    code: 'PIN-N02',
    family: 'Blancos, Grises & Neutros',
    hex: '#B9B9BB',
    image: '/assets/simulator/cocina_variations/gris_lino.jpg',
    description: 'Gris neutro luminoso; base contemporánea perfecta para cocinas minimalistas.',
  },
  {
    id: 'gris_urbano',
    name: 'Gris Urbano Contemporáneo',
    code: 'PIN-N03',
    family: 'Blancos, Grises & Neutros',
    hex: '#646263',
    image: '/assets/simulator/cocina_variations/gris_urbano.jpg',
    description: 'Gris medio de alta elegancia; contraste sobrio con blanco y madera clara.',
  },
  {
    id: 'negro_ebano',
    name: 'Negro Ébano Grafito',
    code: 'PIN-N04',
    family: 'Blancos, Grises & Neutros',
    hex: '#2D2D2F',
    image: '/assets/simulator/cocina_variations/negro_ebano.jpg',
    description: 'Negro grafito de vanguardia; estética industrial moderna de alto nivel.',
  },
];

/**
 * 20 COLORES REALES DE MURO DE LAS IMÁGENES PARA HABITACIÓN
 * Cada color corresponde exactamente al color de la pared de cada imagen
 */
export const HABITACION_WALL_COLORS: RealWallColor[] = [
  // 1. Verdes & Frescura
  {
    id: 'verde_menta_claro',
    name: 'Verde Menta Luminoso',
    code: 'PIN-V01',
    family: 'Verdes & Frescura',
    hex: '#C7E5DB',
    image: '/assets/simulator/habitacion_variations/verde_menta_claro.jpg',
    description: 'Tono menta relajante y luminoso; aporta frescura serena y descanso visual.',
  },
  {
    id: 'verde_salvia',
    name: 'Verde Salvia Nórdico',
    code: 'PIN-V02',
    family: 'Verdes & Frescura',
    hex: '#89997E',
    image: '/assets/simulator/habitacion_variations/verde_salvia.jpg',
    description: 'Verde salvia orgánico; equilibrio natural que induce calma y descanso profundo.',
  },
  {
    id: 'verde_bosque',
    name: 'Verde Bosque Profundo',
    code: 'PIN-V03',
    family: 'Verdes & Frescura',
    hex: '#1B3C2B',
    image: '/assets/simulator/habitacion_variations/verde_bosque.jpg',
    description: 'Verde bosque envolvente; crea un muro de acento íntimo y acogedor.',
  },
  {
    id: 'verde_oliva',
    name: 'Verde Oliva Elegante',
    code: 'PIN-V04',
    family: 'Verdes & Frescura',
    hex: '#2B351D',
    image: '/assets/simulator/habitacion_variations/verde_oliva.jpg',
    description: 'Verde oliva cálido y sobrio; combina calidez orgánica y distinción.',
  },

  // 2. Azules & Serenidad
  {
    id: 'azul_celeste',
    name: 'Azul Celeste Cielo',
    code: 'PIN-A01',
    family: 'Azules & Serenidad',
    hex: '#9DD8F8',
    image: '/assets/simulator/habitacion_variations/azul_celeste.jpg',
    description: 'Azul celeste pacífico; transmite paz, frescura y sensación de espacio abierto.',
  },
  {
    id: 'azul_lavanda_sereno',
    name: 'Azul Lavanda Sereno',
    code: 'PIN-A02',
    family: 'Azules & Serenidad',
    hex: '#7E8DB4',
    image: '/assets/simulator/habitacion_variations/azul_lavanda_sereno.jpg',
    description: 'Azul lavanda suave; perfecto para dormitorios por sus propiedades relajantes.',
  },
  {
    id: 'azul_rey_cobalto',
    name: 'Azul Rey Cobalto',
    code: 'PIN-A03',
    family: 'Azules & Serenidad',
    hex: '#163B6F',
    image: '/assets/simulator/habitacion_variations/azul_rey_cobalto.jpg',
    description: 'Azul cobalto sofisticado; cabecero de alto impacto y carácter refinado.',
  },
  {
    id: 'azul_marino_profundo',
    name: 'Azul Marino Profundo',
    code: 'PIN-A04',
    family: 'Azules & Serenidad',
    hex: '#0B1C2C',
    image: '/assets/simulator/habitacion_variations/azul_marino_profundo.jpg',
    description: 'Azul noche profundo; atmósfera de hotel boutique con textiles blancos.',
  },

  // 3. Rosas & Púrpuras
  {
    id: 'rosa_pastel',
    name: 'Rosa Pastel Suave',
    code: 'PIN-R01',
    family: 'Rosas & Púrpuras',
    hex: '#EABFC6',
    image: '/assets/simulator/habitacion_variations/rosa_pastel.jpg',
    description: 'Rosa empolvado cálido; ternura, luminosidad y confort acogedor.',
  },
  {
    id: 'coral_romantico',
    name: 'Coral Romántico',
    code: 'PIN-R02',
    family: 'Rosas & Púrpuras',
    hex: '#C86F6B',
    image: '/assets/simulator/habitacion_variations/coral_romantico.jpg',
    description: 'Coral suave aterciopelado; calidez envolvente de estilo mediterráneo.',
  },
  {
    id: 'borgona_vino',
    name: 'Borgoña Vino Tinto',
    code: 'PIN-R03',
    family: 'Rosas & Púrpuras',
    hex: '#3E1920',
    image: '/assets/simulator/habitacion_variations/borgona_vino.jpg',
    description: 'Vino tinto aterciopelado; elegancia dramática y lujo sensorial.',
  },
  {
    id: 'purpura_amatista',
    name: 'Púrpura Amatista',
    code: 'PIN-R04',
    family: 'Rosas & Púrpuras',
    hex: '#775B84',
    image: '/assets/simulator/habitacion_variations/purpura_amatista.jpg',
    description: 'Púrpura amatista sereno; estimula el bienestar espiritual y la calma.',
  },

  // 4. Cálidos & Tierras
  {
    id: 'amarillo_mantequilla',
    name: 'Amarillo Mantequilla Suave',
    code: 'PIN-C01',
    family: 'Cálidos & Tierras',
    hex: '#E8DFA4',
    image: '/assets/simulator/habitacion_variations/amarillo_mantequilla.jpg',
    description: 'Amarillo crema suave; despierta con luz dorada natural cada mañana.',
  },
  {
    id: 'ocre_mostaza',
    name: 'Ocre Mostaza Cálido',
    code: 'PIN-C02',
    family: 'Cálidos & Tierras',
    hex: '#A9701F',
    image: '/assets/simulator/habitacion_variations/ocre_mostaza.jpg',
    description: 'Ocre mostaza artesanal; calidez acogedora con muebles de nogal.',
  },
  {
    id: 'rojo_colonial',
    name: 'Rojo Colonial Profundo',
    code: 'PIN-C03',
    family: 'Cálidos & Tierras',
    hex: '#3F161A',
    image: '/assets/simulator/habitacion_variations/rojo_colonial.jpg',
    description: 'Rojo vino colonial; intimidad clásica y calidez arquitectónica.',
  },
  {
    id: 'terracota_arcilla',
    name: 'Terracota Arcilla',
    code: 'PIN-C04',
    family: 'Cálidos & Tierras',
    hex: '#713209',
    image: '/assets/simulator/habitacion_variations/terracota_arcilla.jpg',
    description: 'Terracota artesanal; atmósfera rústica de retiro campestre.',
  },

  // 5. Blancos, Grises & Neutros
  {
    id: 'blanco_puro',
    name: 'Blanco Puro Luminoso',
    code: 'PIN-N01',
    family: 'Blancos, Grises & Neutros',
    hex: '#DDDDDD',
    image: '/assets/simulator/habitacion_variations/blanco_puro.jpg',
    description: 'Blanco puro arquitectónico; pureza visual, luminosidad total y serenidad.',
  },
  {
    id: 'gris_lino',
    name: 'Gris Lino Claro',
    code: 'PIN-N02',
    family: 'Blancos, Grises & Neutros',
    hex: '#A1A1A1',
    image: '/assets/simulator/habitacion_variations/gris_lino.jpg',
    description: 'Gris lino suave; base neutral ideal para descanso de estilo escandinavo.',
  },
  {
    id: 'gris_urbano',
    name: 'Gris Urbano Contemporáneo',
    code: 'PIN-N03',
    family: 'Blancos, Grises & Neutros',
    hex: '#5A585B',
    image: '/assets/simulator/habitacion_variations/gris_urbano.jpg',
    description: 'Gris medio sofisticado; perfecto contraste con lencería blanca de cama.',
  },
  {
    id: 'negro_ebano',
    name: 'Negro Ébano Grafito',
    code: 'PIN-N04',
    family: 'Blancos, Grises & Neutros',
    hex: '#171717',
    image: '/assets/simulator/habitacion_variations/negro_ebano.jpg',
    description: 'Negro grafito sobrio; muro de cabecero de máximo impacto contemporáneo.',
  },
];

/**
 * 20 COLORES REALES DE MURO DE LAS IMÁGENES PARA FACHADA / EXTERIOR DE CASA
 * Cada color corresponde exactamente al color de la pared de cada imagen
 */
export const EXTERIOR_WALL_COLORS: RealWallColor[] = [
  // 1. Verdes & Frescura
  {
    id: 'verde_menta_claro',
    name: 'Verde Menta Luminoso',
    code: 'PIN-V01',
    family: 'Verdes & Frescura',
    hex: '#CEEDDC',
    image: '/assets/simulator/exterior_variations/verde_menta_claro.jpg',
    description: 'Verde menta exterior fresco y luminoso; gran luminosidad diurna y realce arquitectónico.',
  },
  {
    id: 'verde_salvia',
    name: 'Verde Salvia Nórdico',
    code: 'PIN-V02',
    family: 'Verdes & Frescura',
    hex: '#869B76',
    image: '/assets/simulator/exterior_variations/verde_salvia.jpg',
    description: 'Verde salvia orgánico; armoniza perfectamente con jardines y vegetación frontal.',
  },
  {
    id: 'verde_bosque',
    name: 'Verde Bosque Profundo',
    code: 'PIN-V03',
    family: 'Verdes & Frescura',
    hex: '#204530',
    image: '/assets/simulator/exterior_variations/verde_bosque.jpg',
    description: 'Verde bosque intenso; volumen exterior contemporáneo de alto contraste.',
  },
  {
    id: 'verde_oliva',
    name: 'Verde Oliva Elegante',
    code: 'PIN-V04',
    family: 'Verdes & Frescura',
    hex: '#4A502E',
    image: '/assets/simulator/exterior_variations/verde_oliva.jpg',
    description: 'Verde oliva natural y sobrio; carácter artesanal y sofisticación exterior.',
  },

  // 2. Azules & Serenidad
  {
    id: 'azul_celeste',
    name: 'Azul Celeste Cielo',
    code: 'PIN-A01',
    family: 'Azules & Serenidad',
    hex: '#9CDBF1',
    image: '/assets/simulator/exterior_variations/azul_celeste.jpg',
    description: 'Azul celeste costero; proyecta amplitud, frescura y estilo náutico moderno.',
  },
  {
    id: 'azul_lavanda_sereno',
    name: 'Azul Lavanda Sereno',
    code: 'PIN-A02',
    family: 'Azules & Serenidad',
    hex: '#8D9AC6',
    image: '/assets/simulator/exterior_variations/azul_lavanda_sereno.jpg',
    description: 'Azul lavanda suave; serenidad y distinción exterior sobria.',
  },
  {
    id: 'azul_rey_cobalto',
    name: 'Azul Rey Cobalto',
    code: 'PIN-A03',
    family: 'Azules & Serenidad',
    hex: '#1B4778',
    image: '/assets/simulator/exterior_variations/azul_rey_cobalto.jpg',
    description: 'Azul cobalto vivo; contraste enérgico y moderno con molduras blancas.',
  },
  {
    id: 'azul_marino_profundo',
    name: 'Azul Marino Profundo',
    code: 'PIN-A04',
    family: 'Azules & Serenidad',
    hex: '#172131',
    image: '/assets/simulator/exterior_variations/azul_marino_profundo.jpg',
    description: 'Azul marino profundo; elegancia atemporal de gran prestancia y sobriedad.',
  },

  // 3. Rosas & Púrpuras
  {
    id: 'rosa_pastel',
    name: 'Rosa Pastel Suave',
    code: 'PIN-R01',
    family: 'Rosas & Púrpuras',
    hex: '#F2CDCF',
    image: '/assets/simulator/exterior_variations/rosa_pastel.jpg',
    description: 'Rosa pastel romántico; calidez luminosa y estética vintage contemporánea.',
  },
  {
    id: 'coral_romantico',
    name: 'Coral Romántico',
    code: 'PIN-R02',
    family: 'Rosas & Púrpuras',
    hex: '#E2877C',
    image: '/assets/simulator/exterior_variations/coral_romantico.jpg',
    description: 'Coral cálido vibrante; alegría y luminosidad mediterránea en fachada.',
  },
  {
    id: 'borgona_vino',
    name: 'Borgoña Vino Tinto',
    code: 'PIN-R03',
    family: 'Rosas & Púrpuras',
    hex: '#592B33',
    image: '/assets/simulator/exterior_variations/borgona_vino.jpg',
    description: 'Borgoña vino intenso; estética victoriana sobria y presencia arquitectónica fuerte.',
  },
  {
    id: 'purpura_amatista',
    name: 'Púrpura Amatista',
    code: 'PIN-R04',
    family: 'Rosas & Púrpuras',
    hex: '#8E6A9A',
    image: '/assets/simulator/exterior_variations/purpura_amatista.jpg',
    description: 'Púrpura amatista refinado; personalidad moderna y vanguardista en exteriores.',
  },

  // 4. Cálidos & Tierras
  {
    id: 'amarillo_mantequilla',
    name: 'Amarillo Mantequilla Suave',
    code: 'PIN-C01',
    family: 'Cálidos & Tierras',
    hex: '#EFE3AF',
    image: '/assets/simulator/exterior_variations/amarillo_mantequilla.jpg',
    description: 'Amarillo mantequilla cálido; invita a la bienvenida con luminosidad acogedora.',
  },
  {
    id: 'ocre_mostaza',
    name: 'Ocre Mostaza Cálido',
    code: 'PIN-C02',
    family: 'Cálidos & Tierras',
    hex: '#C68832',
    image: '/assets/simulator/exterior_variations/ocre_mostaza.jpg',
    description: 'Mostaza ocre colonial; solidez, tradición y calidez visual de gran personalidad.',
  },
  {
    id: 'rojo_colonial',
    name: 'Rojo Colonial Profundo',
    code: 'PIN-C03',
    family: 'Cálidos & Tierras',
    hex: '#542B2F',
    image: '/assets/simulator/exterior_variations/rojo_colonial.jpg',
    description: 'Rojo teja colonial; acento clásico y señorial de alta durabilidad visual.',
  },
  {
    id: 'terracota_arcilla',
    name: 'Terracota Arcilla',
    code: 'PIN-C04',
    family: 'Cálidos & Tierras',
    hex: '#A15632',
    image: '/assets/simulator/exterior_variations/terracota_arcilla.jpg',
    description: 'Terracota rústico y artesanal; textura terrosa que realza el entorno natural.',
  },

  // 5. Blancos, Grises & Neutros
  {
    id: 'blanco_puro',
    name: 'Blanco Puro Luminoso',
    code: 'PIN-N01',
    family: 'Blancos, Grises & Neutros',
    hex: '#EDEFEB',
    image: '/assets/simulator/exterior_variations/blanco_puro.jpg',
    description: 'Blanco puro de alta reflectancia; máxima limpieza, amplitud y elegancia colonial.',
  },
  {
    id: 'gris_lino',
    name: 'Gris Lino Claro',
    code: 'PIN-N02',
    family: 'Blancos, Grises & Neutros',
    hex: '#A5A5A5',
    image: '/assets/simulator/exterior_variations/gris_lino.jpg',
    description: 'Gris perla lino; sobriedad contemporánea y fácil combinación de materiales.',
  },
  {
    id: 'gris_urbano',
    name: 'Gris Urbano Contemporáneo',
    code: 'PIN-N03',
    family: 'Blancos, Grises & Neutros',
    hex: '#595D57',
    image: '/assets/simulator/exterior_variations/gris_urbano.jpg',
    description: 'Gris carbón medio; neutralidad moderna ideal para arquitectura contemporánea.',
  },
  {
    id: 'negro_ebano',
    name: 'Negro Ébano Grafito',
    code: 'PIN-N04',
    family: 'Blancos, Grises & Neutros',
    hex: '#282A24',
    image: '/assets/simulator/exterior_variations/negro_ebano.jpg',
    description: 'Negro grafito y antracita; máxima sofisticación y contraste dramático con molduras.',
  },
];

/**
 * 20 COLORES REALES DE MURO DE LAS IMÁGENES PARA OFICINA
 * Cada color corresponde exactamente al color de la pared de cada imagen
 */
export const OFICINA_WALL_COLORS: RealWallColor[] = [
  // 1. Verdes & Frescura
  {
    id: 'verde_menta_claro',
    name: 'Verde Menta Luminoso',
    code: 'PIN-V01',
    family: 'Verdes & Frescura',
    hex: '#A9C7BD',
    image: '/assets/simulator/oficina_variations/verde_menta_claro.jpg',
    description: 'Verde menta corporativo fresco y luminoso; estimula la concentración y el bienestar laboral.',
  },
  {
    id: 'verde_salvia',
    name: 'Verde Salvia Nórdico',
    code: 'PIN-V02',
    family: 'Verdes & Frescura',
    hex: '#8E9E84',
    image: '/assets/simulator/oficina_variations/verde_salvia.jpg',
    description: 'Verde salvia refinado; aporta calma visual y equilibrio en oficinas gerenciales.',
  },
  {
    id: 'verde_bosque',
    name: 'Verde Bosque Profundo',
    code: 'PIN-V03',
    family: 'Verdes & Frescura',
    hex: '#1E504D',
    image: '/assets/simulator/oficina_variations/verde_bosque.jpg',
    description: 'Verde bosque imponente; muro de acento de alta jerarquía y distinción ejecutiva.',
  },
  {
    id: 'verde_oliva',
    name: 'Verde Oliva Elegante',
    code: 'PIN-V04',
    family: 'Verdes & Frescura',
    hex: '#1E3B29',
    image: '/assets/simulator/oficina_variations/verde_oliva.jpg',
    description: 'Verde oliva contemporáneo; elegancia sobria que combina con maderas oscuras.',
  },

  // 2. Azules & Serenidad
  {
    id: 'azul_celeste',
    name: 'Azul Celeste Cielo',
    code: 'PIN-A01',
    family: 'Azules & Serenidad',
    hex: '#A7D9EA',
    image: '/assets/simulator/oficina_variations/azul_celeste.jpg',
    description: 'Azul celeste energizante; claridad mental y sensación de amplitud panorámica.',
  },
  {
    id: 'azul_lavanda_sereno',
    name: 'Azul Lavanda Sereno',
    code: 'PIN-A02',
    family: 'Azules & Serenidad',
    hex: '#95A8D6',
    image: '/assets/simulator/oficina_variations/azul_lavanda_sereno.jpg',
    description: 'Azul lavanda balanceado; tranquilidad y enfoque analítico en jornadas intensas.',
  },
  {
    id: 'azul_rey_cobalto',
    name: 'Azul Rey Cobalto',
    code: 'PIN-A03',
    family: 'Azules & Serenidad',
    hex: '#033F85',
    image: '/assets/simulator/oficina_variations/azul_rey_cobalto.jpg',
    description: 'Azul cobalto de alta energía; confianza corporativa, dinamismo y liderazgo.',
  },
  {
    id: 'azul_marino_profundo',
    name: 'Azul Marino Profundo',
    code: 'PIN-A04',
    family: 'Azules & Serenidad',
    hex: '#38475A',
    image: '/assets/simulator/oficina_variations/azul_marino_profundo.jpg',
    description: 'Azul marino ejecutivo; sobriedad directiva, máxima elegancia y prestigio.',
  },

  // 3. Rosas & Púrpuras
  {
    id: 'rosa_pastel',
    name: 'Rosa Pastel Suave',
    code: 'PIN-R01',
    family: 'Rosas & Púrpuras',
    hex: '#DDB4BA',
    image: '/assets/simulator/oficina_variations/rosa_pastel.jpg',
    description: 'Rosa empolvado cálido; creatividad, diseño vanguardista y confort acústico-visual.',
  },
  {
    id: 'coral_romantico',
    name: 'Coral Romántico',
    code: 'PIN-R02',
    family: 'Rosas & Púrpuras',
    hex: '#CE7267',
    image: '/assets/simulator/oficina_variations/coral_romantico.jpg',
    description: 'Coral estimulante; entusiasmo, dinamismo e innovación para espacios creativos.',
  },
  {
    id: 'borgona_vino',
    name: 'Borgoña Vino Tinto',
    code: 'PIN-R03',
    family: 'Rosas & Púrpuras',
    hex: '#441923',
    image: '/assets/simulator/oficina_variations/borgona_vino.jpg',
    description: 'Borgoña señorial; presencia ejecutiva sólida con gran calidez premium.',
  },
  {
    id: 'purpura_amatista',
    name: 'Púrpura Amatista',
    code: 'PIN-R04',
    family: 'Rosas & Púrpuras',
    hex: '#765987',
    image: '/assets/simulator/oficina_variations/purpura_amatista.jpg',
    description: 'Púrpura amatista creativo; distinción intelectual y carácter contemporáneo.',
  },

  // 4. Cálidos & Tierras
  {
    id: 'amarillo_mantequilla',
    name: 'Amarillo Mantequilla Suave',
    code: 'PIN-C01',
    family: 'Cálidos & Tierras',
    hex: '#E2D8A8',
    image: '/assets/simulator/oficina_variations/amarillo_mantequilla.jpg',
    description: 'Amarillo suave luminoso; optimismo diurno y claridad lumínica en oficinas.',
  },
  {
    id: 'ocre_mostaza',
    name: 'Ocre Mostaza Cálido',
    code: 'PIN-C02',
    family: 'Cálidos & Tierras',
    hex: '#AD701F',
    image: '/assets/simulator/oficina_variations/ocre_mostaza.jpg',
    description: 'Ocre mostaza corporativo; calidez y solidez que destacan mobiliario ejecutivo.',
  },
  {
    id: 'rojo_colonial',
    name: 'Rojo Colonial Profundo',
    code: 'PIN-C03',
    family: 'Cálidos & Tierras',
    hex: '#401820',
    image: '/assets/simulator/oficina_variations/rojo_colonial.jpg',
    description: 'Rojo terracota colonial; fuerza arquitectónica, dinamismo y decisión.',
  },
  {
    id: 'terracota_arcilla',
    name: 'Terracota Arcilla',
    code: 'PIN-C04',
    family: 'Cálidos & Tierras',
    hex: '#96492B',
    image: '/assets/simulator/oficina_variations/terracota_arcilla.jpg',
    description: 'Terracota cálido artesanal; confort visual terroso para ambientes colaborativos.',
  },

  // 5. Blancos, Grises & Neutros
  {
    id: 'blanco_puro',
    name: 'Blanco Puro Luminoso',
    code: 'PIN-N01',
    family: 'Blancos, Grises & Neutros',
    hex: '#D1D4D3',
    image: '/assets/simulator/oficina_variations/blanco_puro.jpg',
    description: 'Blanco puro arquitectónico; máxima reflectancia de luz en oficinas ejecutivas.',
  },
  {
    id: 'gris_lino',
    name: 'Gris Lino Claro',
    code: 'PIN-N02',
    family: 'Blancos, Grises & Neutros',
    hex: '#B6B9C0',
    image: '/assets/simulator/oficina_variations/gris_lino.jpg',
    description: 'Gris lino neutro; base atemporal que realza escritorios y ventanales.',
  },
  {
    id: 'gris_urbano',
    name: 'Gris Urbano Contemporáneo',
    code: 'PIN-N03',
    family: 'Blancos, Grises & Neutros',
    hex: '#505251',
    image: '/assets/simulator/oficina_variations/gris_urbano.jpg',
    description: 'Gris urbano medio; sobriedad tecnológica y elegancia corporativa.',
  },
  {
    id: 'negro_ebano',
    name: 'Negro Ébano Grafito',
    code: 'PIN-N04',
    family: 'Blancos, Grises & Neutros',
    hex: '#161F28',
    image: '/assets/simulator/oficina_variations/negro_ebano.jpg',
    description: 'Negro grafito ejecutivo; sofisticación máxima y contraste con ventanales.',
  },
];

export const getScenarioWallColors = (scenarioId: string): RealWallColor[] => {
  if (scenarioId === 'oficina') return OFICINA_WALL_COLORS;
  if (scenarioId === 'exterior_casa') return EXTERIOR_WALL_COLORS;
  if (scenarioId === 'habitacion') return HABITACION_WALL_COLORS;
  if (scenarioId === 'cocina') return COCINA_WALL_COLORS;
  return SALA_WALL_COLORS;
};

export const RealisticColorSimulator: React.FC = () => {
  const { setActiveView, setIsRequestModalOpen, simulatorScenario, setSimulatorScenario, addToCart, setIsCartOpen } = useApp();

  // Selected scenario
  const selectedScenario = ROOM_SCENARIOS.find((s) => s.id === simulatorScenario) || ROOM_SCENARIOS[0];
  const handleSelectScenario = (scenario: RoomScenario) => {
    setSimulatorScenario(scenario.id);
  };

  // Active palette depends on selected scenario (Habitación, Cocina o Sala de Estar)
  const currentScenarioColors = getScenarioWallColors(selectedScenario.id);

  // Selected real wall color
  const [selectedColor, setSelectedColor] = useState<RealWallColor>(
    getScenarioWallColors(simulatorScenario)[0]
  );

  // Sync selectedColor whenever scenario changes so it points to the matching color in the new room
  useEffect(() => {
    const list = getScenarioWallColors(selectedScenario.id);
    const match = list.find((c) => c.id === selectedColor.id) || list[0];
    setSelectedColor(match);
  }, [selectedScenario.id]);

  // Compare mode (toggle original photo vs painted)
  const [showOriginal, setShowOriginal] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Paint finish
  const [finishEffect, setFinishEffect] = useState<'mate' | 'satinado' | 'brillante'>('mate');

  // Filter palette categories
  const [activeFamily, setActiveFamily] = useState<string>('all');
  const colorFamilies = [
    'all',
    'Verdes & Frescura',
    'Azules & Serenidad',
    'Rosas & Púrpuras',
    'Cálidos & Tierras',
    'Blancos, Grises & Neutros',
  ];

  const filteredColors = currentScenarioColors.filter((c) => {
    if (activeFamily === 'all') return true;
    return c.family === activeFamily;
  });

  // Canvas ref for real-time rendering & high-res export
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Render simulation
  const renderSimulation = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsProcessing(true);

    const baseImg = new Image();
    baseImg.crossOrigin = 'anonymous';

    // Para todos los escenarios (Sala de Estar, Cocina, Habitación, Exterior de Casa y Oficina):
    // Si showOriginal está activo, dibuja la foto base original blanca.
    // Si showOriginal es falso, dibuja la foto de alta fidelidad de la variación seleccionada.
    if (
      selectedScenario.id === 'sala_de_estar' ||
      selectedScenario.id === 'cocina' ||
      selectedScenario.id === 'habitacion' ||
      selectedScenario.id === 'exterior_casa' ||
      selectedScenario.id === 'oficina'
    ) {
      baseImg.src = showOriginal ? selectedScenario.imageSrc : selectedColor.image;

      baseImg.onload = () => {
        canvas.width = baseImg.naturalWidth || 702;
        canvas.height = baseImg.naturalHeight || 382;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);

        // Aplica brillo sutil si es satinado o brillante
        if (!showOriginal && (finishEffect === 'satinado' || finishEffect === 'brillante')) {
          ctx.save();
          ctx.globalAlpha = finishEffect === 'satinado' ? 0.08 : 0.16;
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.restore();
        }

        setIsProcessing(false);
      };
    } else {
      // Para los otros 4 espacios (Cocina, Habitación, Exterior, Oficina):
      // Aplicación por máscara y composición de luminancia natural
      const maskImg = new Image();
      maskImg.crossOrigin = 'anonymous';

      baseImg.src = selectedScenario.imageSrc;
      maskImg.src = selectedScenario.maskSrc;

      let loadedCount = 0;
      const onLoadBoth = () => {
        loadedCount++;
        if (loadedCount < 2) return;

        canvas.width = baseImg.naturalWidth || 702;
        canvas.height = baseImg.naturalHeight || 382;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);

        if (showOriginal) {
          setIsProcessing(false);
          return;
        }

        const offscreen = document.createElement('canvas');
        offscreen.width = canvas.width;
        offscreen.height = canvas.height;
        const offCtx = offscreen.getContext('2d');
        if (!offCtx) return;

        offCtx.drawImage(maskImg, 0, 0, canvas.width, canvas.height);
        offCtx.globalCompositeOperation = 'source-in';
        offCtx.fillStyle = selectedColor.hex;
        offCtx.fillRect(0, 0, canvas.width, canvas.height);

        if (finishEffect === 'satinado') {
          offCtx.globalAlpha = 0.15;
          offCtx.fillStyle = '#ffffff';
          offCtx.fillRect(0, 0, canvas.width, canvas.height);
        } else if (finishEffect === 'brillante') {
          offCtx.globalAlpha = 0.28;
          offCtx.fillStyle = '#ffffff';
          offCtx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.save();
        ctx.globalAlpha = 0.85;
        ctx.globalCompositeOperation = 'multiply';
        ctx.drawImage(offscreen, 0, 0);

        ctx.globalAlpha = 0.35;
        ctx.globalCompositeOperation = 'color';
        ctx.drawImage(offscreen, 0, 0);

        ctx.restore();
        setIsProcessing(false);
      };

      baseImg.onload = onLoadBoth;
      maskImg.onload = onLoadBoth;
    }
  }, [selectedScenario, selectedColor, showOriginal, finishEffect]);

  useEffect(() => {
    renderSimulation();
  }, [renderSimulation]);

  // Export / Download High-Res Photo
  const handleDownloadSimulation = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `pintuco_${selectedScenario.id}_${selectedColor.id}.jpg`;
    link.href = canvas.toDataURL('image/jpeg', 0.95);
    link.click();
  };

  const handleAddToCart = () => {
    addToCart({
      name: `${selectedScenario.recommendedProduct} (${selectedColor.name})`,
      colorName: selectedColor.name,
      colorHex: selectedColor.hex,
      presentation: 'Galón',
      quantity: 1,
      image: selectedColor.image,
    });
    setIsCartOpen(true);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8 text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Navigation Breadcrumb & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <button
                onClick={() => setActiveView('home')}
                className="hover:text-[#1B2A6B] font-semibold cursor-pointer text-slate-600"
              >
                Inicio
              </button>
              <span>/</span>
              <span className="text-[#2FAE6D] font-bold">Simulador de Color</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
              <span className="w-9 h-9 rounded-2xl bg-[#2FAE6D] text-white flex items-center justify-center shrink-0 shadow-xs">
                <Sparkles className="w-5 h-5" />
              </span>
              <span>Simulador de Color</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Selecciona el espacio y el color de pared que deseas probar. Muebles, pisos, ventanas, electrodomésticos y techos permanecen 100% intactos con sus sombras y luces originales.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsRequestModalOpen(true)}
              className="px-4 py-2.5 bg-[#2FAE6D] hover:bg-[#27995f] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs cursor-pointer transition-all active:scale-95"
            >
              <Calculator className="w-4 h-4" />
              <span>Cotizar este Color en m²</span>
            </button>
            <button
              onClick={handleAddToCart}
              className="px-4 py-2.5 bg-[#1B2A6B] hover:bg-[#142154] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs cursor-pointer transition-all active:scale-95"
            >
              <Droplets className="w-4 h-4 text-emerald-400" />
              <span>Agregar Galón al Carrito</span>
            </button>
            <button
              onClick={handleDownloadSimulation}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer transition-all"
              title="Descargar foto simulada"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">Exportar Foto</span>
            </button>
          </div>
        </div>

        {/* 1. SELECTOR DE ESPACIOS ARQUITECTÓNICOS */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#1B2A6B]" />
                <span>1. Espacio Seleccionado para Simulación</span>
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                En los 5 espacios (<strong>Sala de Estar</strong>, <strong>Cocina</strong>, <strong>Habitación</strong>, <strong>Exterior de Casa</strong> y <strong>Oficina</strong>) dispones de las <strong>20 imágenes fotorrealistas</strong> correspondientes a cada color exacto de pared.
              </p>
            </div>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              {selectedScenario.name} activo
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {ROOM_SCENARIOS.map((scenario) => {
              const isSelected = selectedScenario.id === scenario.id;
              return (
                <button
                  key={scenario.id}
                  onClick={() => handleSelectScenario(scenario)}
                  className={`group relative rounded-2xl overflow-hidden text-left transition-all cursor-pointer border-2 ${
                    isSelected
                      ? 'border-[#2FAE6D] ring-2 ring-emerald-300 shadow-md'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="aspect-video w-full overflow-hidden bg-slate-100 relative">
                    <img
                      src={
                        scenario.id === selectedScenario.id
                          ? selectedColor.image
                          : scenario.id === 'sala_de_estar'
                          ? '/assets/simulator/sala_variations/verde_menta_claro.jpg'
                          : scenario.id === 'cocina'
                          ? '/assets/simulator/cocina_variations/verde_menta_claro.jpg'
                          : scenario.id === 'habitacion'
                          ? '/assets/simulator/habitacion_variations/verde_menta_claro.jpg'
                          : scenario.id === 'exterior_casa'
                          ? '/assets/simulator/exterior_variations/verde_menta_claro.jpg'
                          : '/assets/simulator/oficina_variations/verde_menta_claro.jpg'
                      }
                      alt={scenario.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#2FAE6D] text-white flex items-center justify-center shadow-xs">
                        <Check className="w-3.5 h-3.5 stroke-3" />
                      </div>
                    )}
                    <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-600 text-white shadow-xs">
                      20 Tonos Reales
                    </span>
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/80 text-white backdrop-blur-xs">
                      {scenario.category}
                    </span>
                  </div>
                  <div className="p-2.5">
                    <h3 className="font-bold text-xs text-slate-900 group-hover:text-[#1B2A6B] transition-colors">
                      {scenario.name}
                    </h3>
                    <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                      {scenario.surfaceType}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. VISOR PRINCIPAL Y SELECTOR DE BOTONES DE COLOR DE PARED */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Main Visualizer (7 Columns on large screens) */}
          <div className="lg:col-span-7 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            
            {/* Visualizer Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span
                  className="w-4 h-4 rounded-full border border-black/15 shadow-xs"
                  style={{ backgroundColor: selectedColor.hex }}
                />
                <span className="text-xs font-bold text-slate-900">
                  {selectedColor.name} ({selectedColor.code})
                </span>
                <span className="text-slate-300 text-xs">•</span>
                <span className="text-xs text-slate-500 font-mono font-bold">{selectedColor.hex}</span>
              </div>

              {/* Compare toggle button */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onMouseDown={() => setShowOriginal(true)}
                  onMouseUp={() => setShowOriginal(false)}
                  onTouchStart={() => setShowOriginal(true)}
                  onTouchEnd={() => setShowOriginal(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer select-none transition-colors"
                  title="Mantén presionado para ver la pared original blanca"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>Mantén para ver Pared Original</span>
                </button>
              </div>
            </div>

            {/* Stage Canvas / High-Res Image Viewport */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 shadow-inner flex items-center justify-center border border-slate-200">
              <canvas
                ref={canvasRef}
                className="w-full h-auto max-h-[520px] object-contain transition-all duration-200"
              />

              {isProcessing && (
                <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-2xs flex items-center justify-center">
                  <div className="px-3.5 py-1.5 rounded-full bg-white/90 text-slate-800 text-xs font-bold shadow-md flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#2FAE6D] animate-ping" />
                    <span>Cargando color de pared...</span>
                  </div>
                </div>
              )}

              {/* Floating Color Badge */}
              <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-2xl shadow-lg border border-white/40 flex items-center gap-3">
                <div
                  className="w-7 h-7 rounded-xl shadow-xs border border-black/15 shrink-0"
                  style={{ backgroundColor: selectedColor.hex }}
                />
                <div className="text-[11px] leading-tight">
                  <strong className="text-slate-900 block font-black text-xs">{selectedColor.name}</strong>
                  <span className="text-slate-500 font-mono text-[10px]">{selectedColor.code} • {selectedColor.family}</span>
                </div>
              </div>

              {/* High-Fidelity Protection Marker */}
              <div className="absolute top-3 right-3 bg-slate-900/85 backdrop-blur-md px-2.5 py-1 rounded-xl shadow-xs border border-white/10 text-white flex items-center gap-1.5 text-[10px] font-bold pointer-events-none">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Muebles, Piso y Ventana Intactos</span>
              </div>
            </div>

            {/* Recommendation Strip */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#2FAE6D] shrink-0 mt-0.5" />
              <div className="flex-1">
                <strong className="text-emerald-900 font-bold block">
                  Recomendación Oficial Pintuco para {selectedScenario.name}:
                </strong>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  {selectedScenario.recommendedProduct}. {selectedColor.description}
                </p>
              </div>
            </div>
          </div>

          {/* Color Buttons Palette (5 Columns on large screens) */}
          <div className="lg:col-span-5 bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
            
            {/* Header */}
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-[#2FAE6D]" />
                  <span>2. Elige el Color de la Pared (20 Tonos Reales)</span>
                </h2>
                <span className="text-[10px] font-mono text-slate-400">
                  {filteredColors.length} disponibles
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Haz clic en cualquier botón de color para ver instantáneamente la imagen de la pared en ese tono.
              </p>
            </div>

            {/* Category filter pills */}
            <div className="flex flex-wrap gap-1">
              {colorFamilies.map((fam) => (
                <button
                  key={fam}
                  onClick={() => setActiveFamily(fam)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                    activeFamily === fam
                      ? 'bg-[#142154] text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {fam === 'all' ? 'Todos (20)' : fam.split('&')[0]}
                </button>
              ))}
            </div>

            {/* COLOR BUTTONS GRID: Cada imagen tiene su botón con el color exacto de la pared */}
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2.5 max-h-[460px] overflow-y-auto pr-1">
              {filteredColors.map((colorItem) => {
                const isSelected = selectedColor.id === colorItem.id;
                return (
                  <button
                    key={colorItem.id}
                    onClick={() => setSelectedColor(colorItem)}
                    className={`group p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 relative ${
                      isSelected
                        ? 'border-[#2FAE6D] ring-2 ring-emerald-300 bg-emerald-50/50 shadow-md'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                    }`}
                    title={`Ver imagen con pared en ${colorItem.name}`}
                  >
                    {/* Color Swatch Circle / Square with wall color */}
                    <div
                      className="w-10 h-10 rounded-xl border border-black/15 shadow-xs shrink-0 relative overflow-hidden flex items-center justify-center"
                      style={{ backgroundColor: colorItem.hex }}
                    >
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-xs">
                          <Check className="w-3 h-3 stroke-3 text-emerald-700" />
                        </div>
                      )}
                    </div>

                    {/* Text Details */}
                    <div className="min-w-0 flex-1">
                      <span className="font-extrabold text-[11px] text-slate-900 block truncate group-hover:text-[#1B2A6B]">
                        {colorItem.name}
                      </span>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                        <span>{colorItem.code}</span>
                        <span>•</span>
                        <span className="font-bold text-slate-700">{colorItem.hex}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Finish & Lighting Customizer */}
            <div className="pt-3 border-t border-slate-100 space-y-2.5 text-xs">
              <span className="font-black text-slate-900 block uppercase tracking-wider text-[11px]">
                3. Acabado de la Pintura
              </span>

              <div className="grid grid-cols-3 gap-1.5">
                {(['mate', 'satinado', 'brillante'] as const).map((fin) => (
                  <button
                    key={fin}
                    type="button"
                    onClick={() => setFinishEffect(fin)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-bold capitalize transition-colors cursor-pointer border ${
                      finishEffect === fin
                        ? 'bg-[#142154] text-white border-[#142154] shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {fin}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions: Cotizar & Carrito */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full py-3 bg-[#2FAE6D] hover:bg-[#27995f] text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer active:scale-98"
              >
                <Droplets className="w-4 h-4" />
                <span>Comprar Galón de {selectedColor.name}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsRequestModalOpen(true)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Calculator className="w-3.5 h-3.5 text-slate-600" />
                <span>Calcular cuántos galones necesito para mi pared</span>
              </button>
            </div>

          </div>
        </div>

        {/* 3. GALERÍA VISUAL DE LAS LÁMINAS ENVIADAS POR EL CLIENTE */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Palette className="w-4 h-4 text-[#2FAE6D]" />
                <span>
                  Catálogo Completo de las 5 Gamas de Color en {selectedScenario.id === 'oficina' ? 'Oficina' : selectedScenario.id === 'exterior_casa' ? 'Fachada Exterior' : selectedScenario.id === 'habitacion' ? 'Habitación' : selectedScenario.id === 'cocina' ? 'Cocina' : 'Sala de Estar'}
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Cada lámina agrupa 4 tonos fotorrealistas coordinados probados sobre este espacio arquitectónico.
              </p>
            </div>
            <span className="text-xs font-bold text-[#1B2A6B] bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              5 Gamas • 20 Variaciones
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {(selectedScenario.id === 'oficina'
              ? [
                  {
                    title: 'Gama Verdes & Frescura',
                    file: '/assets/aistudio/Gemini_Generated_Image_xsjt7vxsjt7vxsjt_da212566.jpeg',
                    tones: ['Menta', 'Salvia', 'Bosque', 'Oliva'],
                    firstColorId: 'verde_menta_claro',
                  },
                  {
                    title: 'Gama Azules & Serenidad',
                    file: '/assets/aistudio/Gemini_Generated_Image_qnwyslqnwyslqnwy_35c12f20.jpeg',
                    tones: ['Celeste', 'Lavanda', 'Cobalto', 'Marino'],
                    firstColorId: 'azul_marino_profundo',
                  },
                  {
                    title: 'Gama Rosas & Púrpuras',
                    file: '/assets/aistudio/Gemini_Generated_Image_v1rdtav1rdtav1rd_f57e1007.jpeg',
                    tones: ['Pastel', 'Coral', 'Borgoña', 'Púrpura'],
                    firstColorId: 'rosa_pastel',
                  },
                  {
                    title: 'Gama Cálidos & Tierras',
                    file: '/assets/aistudio/Gemini_Generated_Image_dj6pewdj6pewdj6p_19f16a58.jpeg',
                    tones: ['Mantequilla', 'Mostaza', 'Colonial', 'Terracota'],
                    firstColorId: 'terracota_arcilla',
                  },
                  {
                    title: 'Gama Neutros & Grafito',
                    file: '/assets/aistudio/Gemini_Generated_Image_y6wkvky6wkvky6wk_f33aa226.jpeg',
                    tones: ['Blanco', 'Lino', 'Gris Urbano', 'Ébano'],
                    firstColorId: 'gris_urbano',
                  },
                ]
              : selectedScenario.id === 'exterior_casa'
              ? [
                  {
                    title: 'Gama Verdes & Frescura',
                    file: '/assets/aistudio/Gemini_Generated_Image_u3lr06u3lr06u3lr_f5cdabe7.jpeg',
                    tones: ['Menta', 'Salvia', 'Bosque', 'Oliva'],
                    firstColorId: 'verde_menta_claro',
                  },
                  {
                    title: 'Gama Azules & Serenidad',
                    file: '/assets/aistudio/Gemini_Generated_Image_8lci6z8lci6z8lci_af77c8d5.jpeg',
                    tones: ['Celeste', 'Lavanda', 'Cobalto', 'Marino'],
                    firstColorId: 'azul_marino_profundo',
                  },
                  {
                    title: 'Gama Rosas & Púrpuras',
                    file: '/assets/aistudio/Gemini_Generated_Image_2jx7hh2jx7hh2jx7_ae72945c.jpeg',
                    tones: ['Pastel', 'Coral', 'Borgoña', 'Púrpura'],
                    firstColorId: 'rosa_pastel',
                  },
                  {
                    title: 'Gama Cálidos & Tierras',
                    file: '/assets/aistudio/Gemini_Generated_Image_6fo31q6fo31q6fo3_c5a18de8.jpeg',
                    tones: ['Mantequilla', 'Mostaza', 'Colonial', 'Terracota'],
                    firstColorId: 'terracota_arcilla',
                  },
                  {
                    title: 'Gama Neutros & Grafito',
                    file: '/assets/aistudio/Gemini_Generated_Image_sq7geksq7geksq7g_d6124a83.jpeg',
                    tones: ['Blanco', 'Lino', 'Gris Urbano', 'Ébano'],
                    firstColorId: 'gris_urbano',
                  },
                ]
              : selectedScenario.id === 'habitacion'
              ? [
                  {
                    title: 'Gama Verdes & Frescura',
                    file: '/assets/aistudio/Gemini_Generated_Image_pebrrzpebrrzpebr_a2b09c1a.jpeg',
                    tones: ['Menta', 'Salvia', 'Bosque', 'Oliva'],
                    firstColorId: 'verde_menta_claro',
                  },
                  {
                    title: 'Gama Azules & Serenidad',
                    file: '/assets/aistudio/Gemini_Generated_Image_nm9cspnm9cspnm9c_941d347d.jpeg',
                    tones: ['Celeste', 'Lavanda', 'Cobalto', 'Marino'],
                    firstColorId: 'azul_marino_profundo',
                  },
                  {
                    title: 'Gama Rosas & Púrpuras',
                    file: '/assets/aistudio/Gemini_Generated_Image_axs5iuaxs5iuaxs5_2b6ea660.jpeg',
                    tones: ['Pastel', 'Coral', 'Borgoña', 'Púrpura'],
                    firstColorId: 'rosa_pastel',
                  },
                  {
                    title: 'Gama Cálidos & Tierras',
                    file: '/assets/aistudio/Gemini_Generated_Image_2ix1oc2ix1oc2ix1_ed90b233.jpeg',
                    tones: ['Mantequilla', 'Mostaza', 'Colonial', 'Terracota'],
                    firstColorId: 'terracota_arcilla',
                  },
                  {
                    title: 'Gama Neutros & Grafito',
                    file: '/assets/aistudio/Gemini_Generated_Image_2ec1v32ec1v32ec1_ad8f3ef8.jpeg',
                    tones: ['Blanco', 'Lino', 'Gris Urbano', 'Ébano'],
                    firstColorId: 'gris_urbano',
                  },
                ]
              : selectedScenario.id === 'cocina'
              ? [
                  {
                    title: 'Gama Verdes & Menta',
                    file: '/assets/aistudio/Gemini_Generated_Image_hzktafhzktafhzkt_71bbdca3.jpeg',
                    tones: ['Menta', 'Salvia', 'Bosque', 'Oliva'],
                    firstColorId: 'verde_menta_claro',
                  },
                  {
                    title: 'Gama Azules & Serenidad',
                    file: '/assets/aistudio/Gemini_Generated_Image_unvixyunvixyunvi_0d78985c.jpeg',
                    tones: ['Celeste', 'Lavanda', 'Cobalto', 'Marino'],
                    firstColorId: 'azul_marino_profundo',
                  },
                  {
                    title: 'Gama Rosas & Púrpuras',
                    file: '/assets/aistudio/Gemini_Generated_Image_62b2bx62b2bx62b2_e6b6cb32.jpeg',
                    tones: ['Pastel', 'Coral', 'Borgoña', 'Púrpura'],
                    firstColorId: 'rosa_pastel',
                  },
                  {
                    title: 'Gama Cálidos & Tierras',
                    file: '/assets/aistudio/Gemini_Generated_Image_iw0j4miw0j4miw0j_d7eb36c5.jpeg',
                    tones: ['Mantequilla', 'Mostaza', 'Colonial', 'Terracota'],
                    firstColorId: 'terracota_arcilla',
                  },
                  {
                    title: 'Gama Neutros & Grafito',
                    file: '/assets/aistudio/Gemini_Generated_Image_w6eghew6eghew6eg_5e2289b6.jpeg',
                    tones: ['Blanco', 'Lino', 'Gris Urbano', 'Ébano'],
                    firstColorId: 'gris_urbano',
                  },
                ]
              : [
                  {
                    title: 'Gama Verdes & Menta',
                    file: '/assets/aistudio/Gemini_Generated_Image_1kd07x1kd07x1kd0_88ab3e78.jpeg',
                    tones: ['Menta', 'Salvia', 'Bosque', 'Oliva'],
                    firstColorId: 'verde_menta_claro',
                  },
                  {
                    title: 'Gama Azules & Serenidad',
                    file: '/assets/aistudio/Gemini_Generated_Image_s9kefms9kefms9ke_114a0259.jpeg',
                    tones: ['Celeste', 'Lavanda', 'Cobalto', 'Marino'],
                    firstColorId: 'azul_marino_profundo',
                  },
                  {
                    title: 'Gama Rosas & Púrpuras',
                    file: '/assets/aistudio/Gemini_Generated_Image_uem4bguem4bguem4_1c43932c.jpeg',
                    tones: ['Pastel', 'Coral', 'Borgoña', 'Púrpura'],
                    firstColorId: 'rosa_pastel',
                  },
                  {
                    title: 'Gama Cálidos & Tierras',
                    file: '/assets/aistudio/Gemini_Generated_Image_pfagxlpfagxlpfag_0dae9964.jpeg',
                    tones: ['Mantequilla', 'Mostaza', 'Colonial', 'Terracota'],
                    firstColorId: 'terracota_arcilla',
                  },
                  {
                    title: 'Gama Neutros & Grafito',
                    file: '/assets/aistudio/Gemini_Generated_Image_3dlm2i3dlm2i3dlm_7a95916b.jpeg',
                    tones: ['Blanco', 'Lino', 'Gris Urbano', 'Ébano'],
                    firstColorId: 'gris_urbano',
                  },
                ]
            ).map((sheet, idx) => (
              <div
                key={idx}
                className="group rounded-2xl border border-slate-200 hover:border-emerald-500 overflow-hidden bg-slate-50 flex flex-col transition-all shadow-xs hover:shadow-md"
              >
                <div className="aspect-video w-full overflow-hidden bg-slate-900 relative">
                  <img
                    src={sheet.file}
                    alt={sheet.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900/80 text-white backdrop-blur-xs">
                    4 Tonos
                  </span>
                </div>

                <div className="p-3 flex-1 flex flex-col justify-between space-y-2.5">
                  <div>
                    <h3 className="font-bold text-xs text-slate-900">{sheet.title}</h3>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {sheet.tones.map((t, tidx) => (
                        <span key={tidx} className="text-[9px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-600 font-medium">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const list = getScenarioWallColors(selectedScenario.id);
                      const match = list.find((c) => c.id === sheet.firstColorId);
                      if (match) setSelectedColor(match);
                      window.scrollTo({ top: 320, behavior: 'smooth' });
                    }}
                    className="w-full py-1.5 bg-white hover:bg-[#2FAE6D] hover:text-white border border-slate-200 hover:border-[#2FAE6D] text-slate-700 text-[11px] font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>Probar Gama</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
