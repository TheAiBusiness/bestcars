import { useState, useMemo, useEffect } from 'react';
import { Settings, Zap, Shield, Cpu, type LucideProps } from 'lucide-react';
import { type ComponentType } from 'react';
import type { VehicleSpecifications } from '../../types/vehicle.js';

type LucideIcon = ComponentType<LucideProps>;

interface Tab {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface Spec {
  icon: LucideIcon;
  key: string;
  value: string;
}

const tabs: Tab[] = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'motor', label: 'Motor', icon: Zap },
  { id: 'seguridad', label: 'Seguridad', icon: Shield },
  { id: 'tecnologia', label: 'Tecnología', icon: Cpu },
];

const categoryIconMap: Record<string, LucideIcon> = {
  general: Settings,
  motor: Zap,
  seguridad: Shield,
  tecnologia: Cpu,
};

interface SpecificationsSectionProps {
  specifications?: VehicleSpecifications;
}

export function SpecificationsSection({ specifications }: SpecificationsSectionProps) {
  const [activeTab, setActiveTab] = useState('general');

  // Convert specifications to Spec format with icons
  const specsData = useMemo(() => {
    if (!specifications) return {};

    const formatted: Record<string, Spec[]> = {};

    for (const [category, items] of Object.entries(specifications)) {
      if (items && items.length > 0) {
        const icon = categoryIconMap[category] || Settings;
        formatted[category] = items.map((item) => ({
          icon,
          key: item.key,
          value: item.value,
        }));
      }
    }

    return formatted;
  }, [specifications]);

  // Get available tabs (only show tabs that have data)
  const availableTabs = useMemo(() => {
    return tabs.filter((tab) => specsData[tab.id] && specsData[tab.id].length > 0);
  }, [specsData]);

  // Set active tab to first available if current tab has no data
  useEffect(() => {
    if (availableTabs.length > 0 && (!specsData[activeTab] || specsData[activeTab].length === 0)) {
      setActiveTab(availableTabs[0].id);
    }
  }, [availableTabs, specsData, activeTab]);

  if (!specifications || availableTabs.length === 0) {
    return (
      <article className="mt-6 rounded-3xl overflow-hidden bg-white/[0.03] border border-white/[.06] shadow-xl shadow-black/20 backdrop-blur-sm p-8">
        <h2 className="m-0 mb-5 text-xl font-black text-white">Especificaciones</h2>
        <p className="text-white/60">No hay especificaciones disponibles para este vehículo.</p>
      </article>
    );
  }

  return (
    <article className="mt-6 rounded-3xl overflow-hidden bg-white/[0.03] border border-white/[.06] shadow-xl shadow-black/20 backdrop-blur-sm p-8">
      <h2 className="m-0 mb-5 text-xl font-black text-white">Especificaciones</h2>

      {/* Tabs - más refinados */}
      <div className="flex gap-2 p-1.5 rounded-2xl bg-black/20 border border-white/[.06] overflow-auto mb-6">
        {availableTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all duration-200 cursor-pointer ${
              activeTab === tab.id
                ? 'text-blue-400 bg-blue-500/10 border border-blue-500/20'
                : 'text-white/60 bg-transparent border border-transparent hover:bg-white/[.03] hover:text-white/80'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Specs Grid - más limpio */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {specsData[activeTab]?.map((spec, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-white/[.02] border border-white/[.06] hover:bg-white/[.03] hover:border-white/[.08] transition-all duration-200 flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-xl grid place-items-center bg-white/[.03] border border-white/[0.08] flex-shrink-0">
              <spec.icon className="w-4 h-4 text-white/70" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-white/50 font-medium text-xs mb-0.5">
                {spec.key}
              </div>
              <div className="font-bold text-sm text-white truncate">
                {spec.value}
              </div>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}