import React from 'react';
import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '../components/ui/breadcrumb';
import { Header } from '../components/Header';
import { VehicleDetailSkeleton } from '../components/VehicleDetailSkeleton';
import { HeroGallery } from '../components/HeroGallery';
import { ProductHeader } from '../components/ProductHeader';
import { StatsRow } from '../components/StatsRow';
import { DescriptionSection } from '../components/DescriptionSection';
import { SpecificationsSection } from '../components/SpecificationsSection';
import { ContactForm, type ContactFormRef } from '../components/ContactForm';
import { api } from '../../services/api.js';
import { vehicleToStats } from '../../utils/vehicleUtils.js';
import { mapImageUrls } from '../../utils/imageMap.js';
import type { Vehicle } from '../../types/vehicle.js';

export function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const contactFormRef = useRef<ContactFormRef>(null);

  useEffect(() => {
    if (!id) {
      setError('Vehicle ID is required');
      setLoading(false);
      return;
    }

    const fetchVehicle = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getVehicleById(id);
        setVehicle(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load vehicle');
      } finally {
        setLoading(false);
      }
    };

    fetchVehicle();
  }, [id]);

  if (loading) {
    return <VehicleDetailSkeleton />;
  }

  if (error || !vehicle) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="max-w-[1280px] mx-auto my-6 mb-24 px-6">
          <div className="rounded-3xl bg-red-500/10 border border-red-500/20 p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-black text-white mb-2">Error al cargar el vehículo</h2>
            <p className="text-white/70">{error || 'Vehículo no encontrado'}</p>
          </div>
        </main>
      </div>
    );
  }

  const stats = vehicleToStats(vehicle);
  const mappedImages = mapImageUrls(vehicle.images);

  // SEO: título dinámico por vehículo
  useEffect(() => {
    const title = `${vehicle.title} | Best Cars Ibérica`;
    document.title = title;
    return () => {
      document.title = 'Best Cars Ibérica | Vehículos de Lujo';
    };
  }, [vehicle.title]);

  return (
    <div className="min-h-screen">
      <Header hideCloseButton={true} />

      <main className="max-w-[1280px] mx-auto my-6 mb-32 pb-12 px-6">
        {/* Breadcrumbs */}
        <Breadcrumb className="mb-4">
          <BreadcrumbList className="text-white/60">
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/" className="hover:text-white transition-colors">Inicio</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <span className="text-white/30">/</span>
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to="/garage" className="hover:text-white transition-colors">Stock</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <span className="text-white/30">/</span>
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage className="text-white truncate max-w-[200px]">{vehicle.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Hero Gallery */}
        <HeroGallery images={mappedImages} />

        {/* Main Grid */}
        <section className="mt-6 grid grid-cols-1 lg:grid-cols-[1.65fr_.85fr] gap-6 items-start">
          {/* Left Column */}
          <div>
            <ProductHeader
              title={vehicle.title}
              year={vehicle.year}
              mileage={vehicle.mileage}
              price={vehicle.price}
              priceSubtext={vehicle.priceSubtext ?? ""}
              tags={vehicle.tags}
              onRequestTestDrive={() => contactFormRef.current?.focusNameField()}
              vehicleId={vehicle.id}
              vehicleTitle={vehicle.title}
            />

            <StatsRow stats={stats} />

            <DescriptionSection description={vehicle.description || undefined} />

            <SpecificationsSection specifications={vehicle.specifications || undefined} />
          </div>

          {/* Right Column (Sidebar) */}
          <ContactForm ref={contactFormRef} vehicleId={vehicle.id} vehicleTitle={vehicle.title} />
        </section>
      </main>

    </div>
  );
}

export default VehicleDetailPage;
