/**
 * Datos mock de vehículos para desarrollo y pruebas
 * Cuando se conecte la base de datos real, estos datos serán reemplazados
 * por consultas a Prisma (Vehicle model)
 */

import type { VehicleSpecifications } from '../types/vehicle.js';

/** Tipo extendido para vehículos mock con especificaciones */
export interface MockVehicle {
  id: string;
  title: string;
  year: number;
  mileage: string;
  price: string;
  priceSubtext?: string;
  fuelType?: string;
  seats?: string;
  description?: string;
  images: string[];
  tags: string[];
  specifications: VehicleSpecifications;
  createdAt: Date;
  updatedAt: Date;
}

/** Lista de vehículos de demostración (modo MOCK) */
export const mockVehicles: MockVehicle[] = [
  {
    id: 'car-1',
    title: 'Audi RS6 Performance',
    year: 2024,
    mileage: '14,000 km',
    price: '€158,000',
    priceSubtext: 'IVA Incluido',
    fuelType: 'Gasolina',
    seats: '5 Plazas',
    description: 'Audi RS6 Performance 2024, la berlina familiar más potente del mundo. Motor V8 biturbo de 4.0L con 636 HP y 800 Nm de par. Combina el rendimiento de un superdeportivo con la practicidad de un familiar. Equipado con sistema quattro, suspensión adaptativa con modo RS, y frenos de cerámica opcionales. Interior en cuero Valcona con detalles en carbono y aluminio.',
    images: ['AUDI RS6_42.jpg', 'AUDI RS6_43.jpg', 'AUDI RS6_44.jpg', 'AUDI RS6_45.jpg', 'AUDI RS6_46.jpg', 'AUDI RS6_47.jpg', 'AUDI RS6_48.jpg', 'AUDI RS6_49.jpg', 'AUDI RS6_50.jpg', 'AUDI RS6_51.jpg', 'AUDI RS6_52.jpg', 'AUDI RS6_53.jpg', 'AUDI RS6_54.jpg', 'AUDI RS6_55.jpg', 'AUDI RS6_56.jpg', 'AUDI RS6_57.jpg', 'AUDI RS6_58.jpg', 'AUDI RS6_59.jpg', 'AUDI RS6_60.jpg', 'AUDI RS6_61.jpg', 'AUDI RS6_62.jpg', 'AUDI RS6_63.jpg', 'AUDI RS6_64.jpg', 'AUDI RS6_65.jpg', 'AUDI RS6_66.jpg', 'AUDI RS6_67.jpg', 'AUDI RS6_68.jpg', 'AUDI RS6_69.jpg', 'AUDI RS6_70.jpg', 'AUDI RS6_71.jpg', 'AUDI RS6_72.jpg', 'AUDI RS6_73.jpg', 'AUDI RS6_74.jpg', 'AUDI RS6_75.jpg', 'AUDI RS6_76.jpg', 'AUDI RS6_77.jpg', 'AUDI RS6_78.jpg', 'AUDI RS6_79.jpg', 'AUDI RS6_80.jpg', 'AUDI RS6_81.jpg', 'AUDI RS6_82.jpg', 'AUDI RS6_83.jpg', 'AUDI RS6_84.jpg', 'AUDI RS6_85.jpg', 'AUDI RS6_86.jpg', 'AUDI RS6_87.jpg', 'AUDI RS6_88.jpg', 'AUDI RS6_89.jpg', 'AUDI RS6_90.jpg', 'AUDI RS6_91.jpg', 'AUDI RS6_92.jpg', 'AUDI RS6_93.jpg', 'AUDI RS6_94.jpg'],
    tags: ['Berlina Familiar', 'Deportivo', 'Premium'],
    specifications: {
      general: [
        { key: 'Tipo de carrocería', value: 'Familiar (Avant)' },
        { key: 'Color Exterior', value: 'Negro' },
        { key: 'Color Interior', value: 'Negro y rojo' },
        { key: 'Puertas', value: '5 Puertas' },
        { key: 'Asientos', value: '5 Asientos' },
        { key: 'Tracción', value: 'Integral (AWD)' },
      ],
      motor: [
        { key: 'Motor', value: '4.0L V8 Biturbo' },
        { key: 'Potencia', value: '636 HP @ 6,000 RPM' },
        { key: 'Torque', value: '800 Nm @ 2,050 RPM' },
        { key: 'Transmisión', value: 'Tiptronic 8 velocidades' },
        { key: '0-100 km/h', value: '3.6 segundos' },
        { key: 'Velocidad Máxima', value: '305 km/h' },
      ],
      seguridad: [
        { key: 'Airbags', value: '8 (frontal, lateral, cortina)' },
        { key: 'ABS', value: 'Sistema Antibloqueo' },
        { key: 'Control Estabilidad', value: 'ESP con modo RS' },
        { key: 'Control Tracción', value: 'quattro Sport' },
        { key: 'Asistente Frenado', value: 'Sistema Inteligente' },
        { key: 'Cámara Trasera', value: '360° Surround View' },
      ],
      tecnologia: [
        { key: 'Pantalla', value: '10.1" + 8.6" Táctil HD' },
        { key: 'Sistema Audio', value: 'Bang & Olufsen 23 Bocinas' },
        { key: 'Conectividad', value: 'Apple CarPlay / Android Auto' },
        { key: 'Navegación', value: 'MMI Navigation Plus' },
        { key: 'Carga Inalámbrica', value: 'Qi Compatible' },
        { key: 'Sistema Entrada', value: 'Audi Advanced Key' },
      ],
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'car-2',
    title: 'BMW M4 CS',
    year: 2025,
    mileage: '22,000 km',
    price: '€140,000',
    priceSubtext: 'IVA Incluido',
    fuelType: 'Gasolina',
    seats: '4 Plazas',
    description: 'BMW M4 CS 2025 en excelente estado. Motor 3.0L Twin-Turbo de 6 cilindros con 510 HP. Equipado con transmisión automática de 8 velocidades, diferencial M Sport y sistema de suspensión adaptativa. Interior en cuero Merino con asientos deportivos M. Incluye paquete de tecnología completo con pantalla de 12.3" y sistema de sonido Harman Kardon.',
    images: ['M4cs (SOLO EXTERIOR).jpg', 'M4cs (SOLO EXTERIOR)_1.jpg', 'M4cs (SOLO EXTERIOR)_2.jpg', 'M4cs (SOLO EXTERIOR)_3.jpg', 'M4cs (SOLO EXTERIOR)_4.jpg', 'M4cs (SOLO EXTERIOR)_5.jpg', 'M4cs (SOLO EXTERIOR)_6.jpg', 'M4cs (SOLO EXTERIOR)_7.jpg', 'M4cs (SOLO EXTERIOR)_8.jpg', 'M4cs (SOLO EXTERIOR)_9.jpg', 'M4cs (SOLO EXTERIOR)_10.jpg', 'M4cs (SOLO EXTERIOR)_11.jpg', 'M4cs (SOLO EXTERIOR)_12.jpg', 'M4cs (SOLO EXTERIOR)_13.jpg', 'M4cs (SOLO EXTERIOR)_14.jpg', 'M4cs (SOLO EXTERIOR)_15.jpg', 'M4cs (SOLO EXTERIOR)_16.jpg', 'M4cs (SOLO EXTERIOR)_17.jpg', 'm4cs_10.jpg', 'm4cs_11.jpg', 'm4cs_12.jpg', 'm4cs_13.jpg', 'm4cs_14.jpg', 'm4cs_18.jpg', 'M4CS Interior.jpg', 'M4CS Interior_1.jpg', 'M4CS Interior_2.jpg', 'M4CS Interior_3.jpg', 'M4CS Interior_4.jpg', 'M4CS Interior_5.jpg', 'M4CS Interior_6.jpg', 'M4CS Interior_7.jpg', 'M4CS Interior_8.jpg', 'M4CS Interior_9.jpg', 'M4CS Interior_10.jpg', 'M4CS Interior_11.jpg', 'M4CS Interior_12.jpg', 'M4CS Interior_13.jpg', 'M4CS Interior_14.jpg', 'M4CS Interior_15.jpg', 'M4CS Interior_16.jpg', 'M4CS Interior_17.jpg', 'M4CS Interior_18.jpg', 'M4CS Interior_19.jpg', 'M4CS Interior_20.jpg', 'M4CS Interior_21.jpg'],
    tags: ['Deportivo', 'Cupé', 'Lujo'],
    specifications: {
      general: [
        { key: 'Tipo de carrocería', value: 'Coupé Deportivo' },
        { key: 'Color Exterior', value: 'Negro' },
        { key: 'Color Interior', value: 'Negro y rojo + Fibra de Carbono' },
        { key: 'Puertas', value: '2 Puertas' },
        { key: 'Asientos', value: '4 Asientos' },
        { key: 'Tracción', value: 'Trasera (RWD)' },
      ],
      motor: [
        { key: 'Motor', value: '3.0L Twin-Turbo 6' },
        { key: 'Potencia', value: '510 HP @ 6,250 RPM' },
        { key: 'Torque', value: '650 Nm @ 2,750 RPM' },
        { key: 'Transmisión', value: 'Automática 8 velocidades' },
        { key: '0-100 km/h', value: '3.9 segundos' },
        { key: 'Velocidad Máxima', value: '290 km/h' },
      ],
      seguridad: [
        { key: 'Airbags', value: '6 (frontal, lateral, cortina)' },
        { key: 'ABS', value: 'Sistema Antibloqueo' },
        { key: 'Control Estabilidad', value: 'DSC con modo M' },
        { key: 'Control Tracción', value: 'Sistema M Traction' },
        { key: 'Asistente Frenado', value: 'Sistema Inteligente' },
        { key: 'Cámara Trasera', value: '360° Surround View' },
      ],
      tecnologia: [
        { key: 'Pantalla', value: '12.3" Táctil HD' },
        { key: 'Sistema Audio', value: 'Harman Kardon 16 Bocinas' },
        { key: 'Conectividad', value: 'Apple CarPlay / Android Auto' },
        { key: 'Navegación', value: 'GPS Professional' },
        { key: 'Carga Inalámbrica', value: 'Qi Compatible' },
        { key: 'Sistema Entrada', value: 'Comfort Access' },
      ],
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'car-3',
    title: 'Porsche 911 GT3 RS',
    year: 2025,
    mileage: '3,000 km',
    price: '€350,000',
    priceSubtext: 'IVA Incluido',
    fuelType: 'Gasolina',
    seats: '2 Plazas',
    description: 'Porsche 911 GT3 RS 2025, la versión más extrema y orientada a circuito del 911. Motor atmosférico de 4.0L de 6 cilindros bóxer que desarrolla 525 HP, diseñado para el máximo rendimiento en pista. Con solo 3,000 km, este vehículo está prácticamente nuevo. Equipado con aerodinámica activa, suspensión de doble horquilla, frenos de cerámica PCCB y transmisión PDK de 7 velocidades. Interior ligero con jaula de seguridad, asientos deportivos de competición y sistema de sonido opcional.',
    images: ['GT3RS.jpg', 'GT3RS_1.jpg', 'GT3RS_2.jpg', 'GT3RS_3.jpg', 'GT3RS_4.jpg', 'GT3RS_5.jpg', 'GT3RS_6.jpg', 'GT3RS_8.jpg', 'GT3RS_25.jpg', 'GT3RS_11.jpg', 'GT3RS_12.jpg', 'GT3RS_13.jpg', 'GT3RS_14.jpg', 'GT3RS_15.jpg', 'GT3RS_16.jpg', 'GT3RS_17.jpg', 'GT3RS_18.jpg', 'GT3RS_19.jpg', 'GT3RS_20.jpg', 'GT3RS_21.jpg', 'GT3RS_22.jpg', 'GT3RS_9.jpg', 'GT3RS_26.jpg', 'GT3RS_27.jpg', 'GT3RS_28.jpg', 'GT3RS_29.jpg', 'GT3RS_30.jpg', 'GT3RS_31.jpg', 'GT3RS_32.jpg', 'GT3RS_33.jpg', 'GT3RS_34.jpg', 'GT3RS_35.jpg', 'GT3RS_36.jpg', 'GT3RS_37.jpg', 'GT3RS_38.jpg', 'GT3RS_39.jpg', 'GT3RS_40.jpg', 'GT3RS_41.jpg', 'GT3RS_42.jpg', 'GT3RS_43.jpg', 'GT3RS_44.jpg', 'GT3RS_45.jpg', 'GT3RS_46.jpg', 'GT3RS_47.jpg', 'GT3RS_48.jpg', 'GT3RS_49.jpg', 'GT3RS_50.jpg', 'GT3RS_51.jpg', 'GT3RS_52.jpg', 'GT3RS_53.jpg', 'GT3RS_54.jpg', 'GT3RS_55.jpg', 'GT3RS_56.jpg', 'GT3RS_57.jpg', 'GT3RS_58.jpg', 'GT3RS_59.jpg', 'GT3RS_60.jpg', 'GT3RS_61.jpg', 'GT3RS_62.jpg', 'GT3RS_63.jpg', 'GT3RS_64.jpg', 'GT3RS_65.jpg', 'GT3RS_66.jpg'],
    tags: ['Superdeportivo', 'Cupé', 'Premium'],
    specifications: {
      general: [
        { key: 'Tipo de carrocería', value: 'Superdeportivo' },
        { key: 'Color Exterior', value: 'Negro' },
        { key: 'Color Interior', value: 'Negro y amarillo' },
        { key: 'Puertas', value: '2 Puertas' },
        { key: 'Asientos', value: '2 Asientos' },
        { key: 'Tracción', value: 'Trasera (RWD)' },
      ],
      motor: [
        { key: 'Motor', value: '4.0L Atmosférico Bóxer 6' },
        { key: 'Potencia', value: '525 HP @ 8,500 RPM' },
        { key: 'Torque', value: '465 Nm @ 6,300 RPM' },
        { key: 'Transmisión', value: 'PDK 7 velocidades' },
        { key: '0-100 km/h', value: '3.2 segundos' },
        { key: 'Velocidad Máxima', value: '296 km/h' },
      ],
      seguridad: [
        { key: 'Airbags', value: '8 (frontal, lateral, cortina)' },
        { key: 'ABS', value: 'Sistema Antibloqueo' },
        { key: 'Control Estabilidad', value: 'PSM (Porsche Stability)' },
        { key: 'Control Tracción', value: 'PTM (Porsche Traction)' },
        { key: 'Asistente Frenado', value: 'Sistema Inteligente' },
        { key: 'Cámara Trasera', value: '360° Surround View' },
      ],
      tecnologia: [
        { key: 'Pantalla', value: '10.9" Táctil HD' },
        { key: 'Sistema Audio', value: 'Bose Surround 12 Bocinas' },
        { key: 'Conectividad', value: 'Apple CarPlay / Android Auto' },
        { key: 'Navegación', value: 'GPS con Mapas en Vivo' },
        { key: 'Carga Inalámbrica', value: 'Qi Compatible' },
        { key: 'Sistema Entrada', value: 'Keyless Entry & Start' },
      ],
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'car-4',
    title: 'Audi RS3 Sportback',
    year: 2023,
    mileage: '24,000 km',
    price: '€65,000',
    priceSubtext: 'IVA Incluido',
    fuelType: 'Gasolina',
    seats: '5 Plazas',
    description: 'Audi RS3 2023, el compacto deportivo más potente de su segmento. Equipado con el legendario motor 2.5L TFSI de 5 cilindros que desarrolla 400 HP y 500 Nm de par máximo. Este vehículo combina el rendimiento de un deportivo puro con la practicidad de un sedán compacto. Sistema quattro con diferencial trasero RS Torque Splitter para máxima tracción y agilidad. Suspensión RS Sport con modo Dynamic Plus, frenos de alto rendimiento y escape deportivo RS. Interior en cuero RS con detalles en Alcantara y aluminio, asientos deportivos RS con ajuste eléctrico.',
    images: ['RS3.jpg', 'RS3_1.jpg', 'RS3_2.jpg', 'RS3_3.jpg', 'RS3_4.jpg', 'RS3_5.jpg', 'RS3_6.jpg', 'RS3_7.jpg', 'RS3_8.jpg', 'RS3_9.jpg', 'RS3_10.jpg', 'RS3_11.jpg', 'RS3_12.jpg', 'RS3_13.jpg', 'RS3_14.jpg', 'RS3_15.jpg', 'RS3_16.jpg', 'RS3_17.jpg', 'RS3_18.jpg', 'RS3_19.jpg', 'RS3_20.jpg', 'RS3_21.jpg', 'RS3_22.jpg', 'RS3_23.jpg', 'RS3_24.jpg', 'RS3_25.jpg', 'RS3_26.jpg', 'RS3_27.jpg', 'RS3_28.jpg', 'RS3_29.jpg', 'RS3_30.jpg', 'RS3_31.jpg', 'RS3_32.jpg', 'RS3_33.jpg', 'RS3_34.jpg', 'RS3_35.jpg'],
    tags: ['Deportivo', 'Sportback', 'Premium'],
    specifications: {
      general: [
        { key: 'Tipo de carrocería', value: 'Sportback Deportivo' },
        { key: 'Color Exterior', value: 'Negro' },
        { key: 'Color Interior', value: 'Negro con Verde Kyalami' },
        { key: 'Puertas', value: '4 Puertas' },
        { key: 'Asientos', value: '5 Asientos' },
        { key: 'Tracción', value: 'Integral quattro (AWD)' },
      ],
      motor: [
        { key: 'Motor', value: '2.5L TFSI 5 Cilindros Turbo' },
        { key: 'Potencia', value: '400 HP @ 5,850 RPM' },
        { key: 'Torque', value: '500 Nm @ 2,250 RPM' },
        { key: 'Transmisión', value: 'S tronic 7 velocidades' },
        { key: '0-100 km/h', value: '3.8 segundos' },
        { key: 'Velocidad Máxima', value: '290 km/h' },
      ],
      seguridad: [
        { key: 'Airbags', value: '8 (frontal, lateral, cortina)' },
        { key: 'ABS', value: 'Sistema Antibloqueo' },
        { key: 'Control Estabilidad', value: 'ESP con modo RS' },
        { key: 'Control Tracción', value: 'quattro con RS Torque Splitter' },
        { key: 'Asistente Frenado', value: 'Sistema Inteligente' },
        { key: 'Cámara Trasera', value: 'Cámara de visión trasera' },
      ],
      tecnologia: [
        { key: 'Pantalla', value: '10.1" MMI Touch Response' },
        { key: 'Sistema Audio', value: 'Bang & Olufsen 14 Bocinas' },
        { key: 'Conectividad', value: 'Apple CarPlay / Android Auto' },
        { key: 'Navegación', value: 'MMI Navigation Plus' },
        { key: 'Carga Inalámbrica', value: 'Qi Compatible' },
        { key: 'Sistema Entrada', value: 'Audi Advanced Key' },
      ],
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'car-5',
    title: 'Porsche Cayenne Turbo GT',
    year: 2023,
    mileage: '24,000 km',
    price: '€207,000',
    priceSubtext: 'IVA Incluido',
    fuelType: 'Gasolina',
    seats: '5 Plazas',
    description: 'Porsche Cayenne Turbo GT 2023, el SUV más rápido del mundo en el circuito de Nürburgring. Motor V8 biturbo de 4.0L que genera 640 HP y 850 Nm de par máximo. Este vehículo redefine las expectativas de rendimiento en un SUV, combinando la versatilidad de un todo terreno con el corazón de un superdeportivo. Equipado con suspensión adaptativa PASM, sistema de tracción integral PTM, frenos de cerámica PCCB y escape deportivo activo. Interior en cuero Race-Tex con detalles en carbono, asientos deportivos adaptables y sistema de sonido Burmester 3D High-End Surround Sound.',
    images: ['TURBO GT_9.jpg', 'TURBO GT_10.jpg', 'TURBO GT_11.jpg', 'TURBO GT_12.jpg', 'TURBO GT_13.jpg', 'TURBO GT_14.jpg', 'TURBO GT_15.jpg', 'TURBO GT_16.jpg', 'TURBO GT_17.jpg', 'TURBO GT_18.jpg', 'TURBO GT_19.jpg', 'TURBO GT_20.jpg', 'TURBO GT_21.jpg', 'TURBO GT_22.jpg', 'TURBO GT_23.jpg', 'TURBO GT_24.jpg', 'TURBO GT_25.jpg', 'TURBO GT_26.jpg', 'TURBO GT_27.jpg', 'TURBO GT_28.jpg', 'TURBO GT_29.jpg', 'TURBO GT_30.jpg', 'TURBO GT_31.jpg', 'TURBO GT_32.jpg', 'TURBO GT_33.jpg', 'TURBO GT_34.jpg', 'TURBO GT_35.jpg', 'TURBO GT_36.jpg', 'TURBO GT_37.jpg', 'TURBO GT_38.jpg', 'TURBO GT_39.jpg', 'TURBO GT_40.jpg', 'TURBO GT_41.jpg', 'TURBO GT_42.jpg', 'TURBO GT_43.jpg', 'TURBO GT_44.jpg'],
    tags: ['SUV', 'Deportivo', 'Premium'],
    specifications: {
      general: [
        { key: 'Tipo de carrocería', value: 'SUV Deportivo' },
        { key: 'Color Exterior', value: 'Negro' },
        { key: 'Color Interior', value: 'Alcantara y Camel' },
        { key: 'Puertas', value: '5 Puertas' },
        { key: 'Asientos', value: '5 Asientos' },
        { key: 'Tracción', value: 'Integral PTM (AWD)' },
      ],
      motor: [
        { key: 'Motor', value: '4.0L V8 Biturbo' },
        { key: 'Potencia', value: '640 HP @ 6,000 RPM' },
        { key: 'Torque', value: '850 Nm @ 2,300 RPM' },
        { key: 'Transmisión', value: 'Tiptronic S 8 velocidades' },
        { key: '0-100 km/h', value: '3.3 segundos' },
        { key: 'Velocidad Máxima', value: '300 km/h' },
      ],
      seguridad: [
        { key: 'Airbags', value: '9 (frontal, lateral, cortina, rodilla)' },
        { key: 'ABS', value: 'Sistema Antibloqueo' },
        { key: 'Control Estabilidad', value: 'PSM (Porsche Stability)' },
        { key: 'Control Tracción', value: 'PTM (Porsche Traction)' },
        { key: 'Asistente Frenado', value: 'Sistema Inteligente' },
        { key: 'Cámara Trasera', value: '360° Surround View' },
      ],
      tecnologia: [
        { key: 'Pantalla', value: '12.3" Porsche Communication Management' },
        { key: 'Sistema Audio', value: 'Burmester 3D High-End 21 Bocinas' },
        { key: 'Conectividad', value: 'Apple CarPlay / Android Auto' },
        { key: 'Navegación', value: 'GPS con Mapas en Vivo' },
        { key: 'Carga Inalámbrica', value: 'Qi Compatible' },
        { key: 'Sistema Entrada', value: 'Keyless Entry & Start' },
      ],
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
