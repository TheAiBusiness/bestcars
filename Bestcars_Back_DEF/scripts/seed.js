import 'dotenv/config';
import prisma from '../src/config/database.js';
export async function seedDatabase() {
    try {
        const categories = [
            { name: 'general', displayName: 'General', icon: 'Settings', order: 1 },
            { name: 'motor', displayName: 'Motor', icon: 'Zap', order: 2 },
            { name: 'seguridad', displayName: 'Seguridad', icon: 'Shield', order: 3 },
            { name: 'tecnologia', displayName: 'Tecnología', icon: 'Cpu', order: 4 },
        ];
        for (const cat of categories) {
            await prisma.specificationCategory.upsert({
                where: { name: cat.name },
                update: cat,
                create: cat,
            });
        }
        const categoryMap = new Map();
        const allCategories = await prisma.specificationCategory.findMany();
        for (const cat of allCategories) {
            categoryMap.set(cat.name, cat.id);
        }
        const vehicles = [
            {
                id: 'car-1',
                title: 'Audi RS6 Avant',
                year: 2023,
                mileage: '14,000 km',
                price: '€158,000',
                priceSubtext: 'IVA Incluido',
                fuelType: 'Gasolina',
                seats: '5 Plazas',
                description: 'Audi RS6 Avant 2023, la berlina familiar más potente del mundo. Motor V8 biturbo de 4.0L con 600 HP y 800 Nm de par. Combina el rendimiento de un superdeportivo con la practicidad de un familiar. Equipado con sistema quattro, suspensión adaptativa con modo RS, y frenos de cerámica opcionales. Interior en cuero Valcona con detalles en carbono y aluminio.',
                images: [
                    'audi1.jpeg',
                    'audi2.jpeg',
                    'audi3.jpeg',
                ],
                tags: ['Familiar', 'Deportivo', 'Premium'],
                specifications: {
                    general: [
                        { key: 'Tipo de carrocería', value: 'Familiar (Avant)' },
                        { key: 'Color Exterior', value: 'Negro Nardo' },
                        { key: 'Color Interior', value: 'Negro Valcona' },
                        { key: 'Puertas', value: '5 Puertas' },
                        { key: 'Asientos', value: '5 Asientos' },
                        { key: 'Tracción', value: 'Integral (AWD)' },
                    ],
                    motor: [
                        { key: 'Motor', value: '4.0L V8 Biturbo' },
                        { key: 'Potencia', value: '600 HP @ 6,000 RPM' },
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
            },
            {
                id: 'car-2',
                title: 'BMW M4 CS',
                year: 2022,
                mileage: '22,000 km',
                price: '€140,000',
                priceSubtext: 'IVA Incluido',
                fuelType: 'Gasolina',
                seats: '4 Plazas',
                description: 'BMW M4 CS 2022 en excelente estado. Motor 3.0L Twin-Turbo de 6 cilindros con 510 HP. Equipado con transmisión automática de 8 velocidades, diferencial M Sport y sistema de suspensión adaptativa. Interior en cuero Merino con asientos deportivos M. Incluye paquete de tecnología completo con pantalla de 12.3" y sistema de sonido Harman Kardon.',
                images: [
                    'bmw1.jpeg',
                    'bmw2.jpeg',
                    'bmw3.jpeg',
                ],
                tags: ['Deportivo', 'Cupé', 'Lujo'],
                specifications: {
                    general: [
                        { key: 'Tipo de carrocería', value: 'Coupé Deportivo' },
                        { key: 'Color Exterior', value: 'Azul Marina' },
                        { key: 'Color Interior', value: 'Negro con Alcantara' },
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
            },
            {
                id: 'car-3',
                title: 'Porsche 911 GT3 RS',
                year: 2023,
                mileage: '3,000 km',
                price: '€350,000',
                priceSubtext: 'IVA Incluido',
                fuelType: 'Gasolina',
                seats: '2 Plazas',
                description: 'Porsche 911 GT3 RS 2023, la versión más extrema y orientada a circuito del 911. Motor atmosférico de 4.0L de 6 cilindros bóxer que desarrolla 525 HP, diseñado para el máximo rendimiento en pista. Con solo 3,000 km, este vehículo está prácticamente nuevo. Equipado con aerodinámica activa, suspensión de doble horquilla, frenos de cerámica PCCB y transmisión PDK de 7 velocidades. Interior ligero con jaula de seguridad, asientos deportivos de competición y sistema de sonido opcional.',
                images: [
                    'porsche1.jpeg',
                    'porsche2.jpeg',
                    'porsche3.jpeg',
                ],
                tags: ['Deportivo', 'Cupé', 'Premium'],
                specifications: {
                    general: [
                        { key: 'Tipo de carrocería', value: 'Coupé Deportivo' },
                        { key: 'Color Exterior', value: 'Gris Metálico' },
                        { key: 'Color Interior', value: 'Negro Premium' },
                        { key: 'Puertas', value: '2 Puertas' },
                        { key: 'Asientos', value: '4 Asientos' },
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
            },
            {
                id: 'car-4',
                title: 'Audi RS3',
                year: 2024,
                mileage: '24,000 km',
                price: '€65,000',
                priceSubtext: 'IVA Incluido',
                fuelType: 'Gasolina',
                seats: '5 Plazas',
                description: 'Audi RS3 2024, el compacto deportivo más potente de su segmento. Equipado con el legendario motor 2.5L TFSI de 5 cilindros que desarrolla 400 HP y 500 Nm de par máximo. Este vehículo combina el rendimiento de un deportivo puro con la practicidad de un sedán compacto. Sistema quattro con diferencial trasero RS Torque Splitter para máxima tracción y agilidad. Suspensión RS Sport con modo Dynamic Plus, frenos de alto rendimiento y escape deportivo RS. Interior en cuero RS con detalles en Alcantara y aluminio, asientos deportivos RS con ajuste eléctrico.',
                images: [
                    'rs3_1.jpeg',
                    'rs3_2.jpeg',
                    'rs3_3.jpeg',
                ],
                tags: ['Deportivo', 'Sedán', 'Premium'],
                specifications: {
                    general: [
                        { key: 'Tipo de carrocería', value: 'Sedán Deportivo' },
                        { key: 'Color Exterior', value: 'Verde Kyalami' },
                        { key: 'Color Interior', value: 'Negro con Alcantara RS' },
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
                        { key: 'Cámara Trasera', value: '360° Surround View' },
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
                images: [
                    'cayenne1.jpeg',
                    'cayenne2.jpeg',
                    'cayenne3.jpeg',
                ],
                tags: ['SUV', 'Deportivo', 'Premium'],
                specifications: {
                    general: [
                        { key: 'Tipo de carrocería', value: 'SUV Deportivo' },
                        { key: 'Color Exterior', value: 'Amarillo Racing' },
                        { key: 'Color Interior', value: 'Negro Race-Tex con Carbono' },
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
            },
        ];
        for (const vehicle of vehicles) {
            await prisma.vehicle.upsert({
                where: { id: vehicle.id },
                update: {
                    title: vehicle.title,
                    year: vehicle.year,
                    mileage: vehicle.mileage,
                    price: vehicle.price,
                    priceSubtext: vehicle.priceSubtext,
                    fuelType: vehicle.fuelType,
                    seats: vehicle.seats,
                    description: vehicle.description,
                    images: vehicle.images,
                    tags: vehicle.tags,
                },
                create: {
                    id: vehicle.id,
                    title: vehicle.title,
                    year: vehicle.year,
                    mileage: vehicle.mileage,
                    price: vehicle.price,
                    priceSubtext: vehicle.priceSubtext,
                    fuelType: vehicle.fuelType,
                    seats: vehicle.seats,
                    description: vehicle.description,
                    images: vehicle.images,
                    tags: vehicle.tags,
                },
            });
            await prisma.specification.deleteMany({
                where: { vehicleId: vehicle.id },
            });
            for (const [categoryName, specs] of Object.entries(vehicle.specifications)) {
                const categoryId = categoryMap.get(categoryName);
                if (!categoryId)
                    continue;
                for (let i = 0; i < specs.length; i++) {
                    await prisma.specification.create({
                        data: {
                            vehicleId: vehicle.id,
                            categoryId: categoryId,
                            key: specs[i].key,
                            value: specs[i].value,
                            order: i,
                        },
                    });
                }
            }
        }
        console.log(`✅ Seeded ${vehicles.length} vehicles with specifications into database`);
    }
    catch (error) {
        console.error('Error seeding database:', error);
        throw error;
    }
}
if (import.meta.url === `file://${process.argv[1]}`) {
    seedDatabase()
        .then(() => {
        console.log('Seeding completed');
        process.exit(0);
    })
        .catch((error) => {
        console.error('Seeding failed:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=seed.js.map