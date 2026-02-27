/**
 * Sección de gestión de leads (contactos interesados en vehículos).
 * Filtros por estado y origen, listado con tarjetas detalladas.
 */
import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Mail, Phone, Calendar, User, MessageSquare, Inbox, Trash2 } from 'lucide-react';
import { Lead, Vehicle } from '../data/mock-data';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface LeadsSectionProps {
  leads: Lead[];
  vehicles: Vehicle[];
  onLeadUpdate: (leadId: string, updates: Partial<Lead>) => void;
  onLeadDelete?: (leadId: string) => void;
}

export function LeadsSection({ leads, vehicles, onLeadUpdate, onLeadDelete }: LeadsSectionProps) {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterOrigin, setFilterOrigin] = useState<string>("all");

  // Opciones de filtro por estado del lead
  const statusOptions = [
    { value: 'all', label: 'Todos' },
    { value: 'nuevo', label: 'Nuevos' },
    { value: 'contactado', label: 'Contactados' },
    { value: 'seguimiento', label: 'Seguimiento' },
    { value: 'convertido', label: 'Convertidos' },
    { value: 'perdido', label: 'Perdidos' },
  ];

  // Opciones de filtro por origen del lead
  const originOptions = [
    { value: "all", label: "Todos" },
    { value: 'web', label: 'Web' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'portal', label: 'Portal' },
    { value: 'anuncio', label: 'Anuncio' },
    { value: 'referido', label: 'Referido' },
  ];

  const statusColors = {
    nuevo: 'from-blue-500/20 to-blue-600/20 border-blue-500/30 text-blue-300',
    contactado: 'from-purple-500/20 to-purple-600/20 border-purple-500/30 text-purple-300',
    seguimiento: 'from-yellow-500/20 to-yellow-600/20 border-yellow-500/30 text-yellow-300',
    convertido: 'from-green-500/20 to-green-600/20 border-green-500/30 text-green-300',
    perdido: 'from-gray-500/20 to-gray-600/20 border-gray-500/30 text-gray-300',
  };

  const originIcons = {
    web: '🌐',
    instagram: '📱',
    portal: '🔍',
    anuncio: '📢',
    referido: '🤝',
  };

  // Leads filtrados por estado y origen (memoizado para evitar recálculos)
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (filterStatus !== "all" && lead.status !== filterStatus) return false;
      if (filterOrigin !== "all" && lead.origin !== filterOrigin) return false;
      return true;
    });
  }, [leads, filterStatus, filterOrigin]);

  const getVehicleForLead = (vehicleId: string) =>
    vehicles.find((v) => v.id === vehicleId);

  // Estadísticas resumidas de leads
  const stats = useMemo(() => ({
    total: leads.length,
    nuevos: leads.filter((l) => l.status === "nuevo").length,
    seguimiento: leads.filter((l) => l.status === "seguimiento").length,
    convertidos: leads.filter((l) => l.status === "convertido").length,
    conversionRate:
      leads.length > 0
        ? ((leads.filter((l) => l.status === "convertido").length / leads.length) * 100).toFixed(1)
        : "0",
  }), [leads]);

  return (
    <div className="p-4 md:p-8">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-xl p-6"
        >
          <p className="text-sm text-white/50 mb-2">Total Leads</p>
          <p className="text-3xl text-white">{stats.total}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500/[0.08] to-blue-600/[0.08] backdrop-blur-xl p-6"
        >
          <p className="text-sm text-white/50 mb-2">Nuevos</p>
          <p className="text-3xl text-white">{stats.nuevos}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-white/10 bg-gradient-to-br from-yellow-500/[0.08] to-yellow-600/[0.08] backdrop-blur-xl p-6"
        >
          <p className="text-sm text-white/50 mb-2">En Seguimiento</p>
          <p className="text-3xl text-white">{stats.seguimiento}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-white/10 bg-gradient-to-br from-green-500/[0.08] to-green-600/[0.08] backdrop-blur-xl p-6"
        >
          <p className="text-sm text-white/50 mb-2">Convertidos</p>
          <p className="text-3xl text-white">{stats.convertidos}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-white/10 bg-gradient-to-br from-purple-500/[0.08] to-purple-600/[0.08] backdrop-blur-xl p-6"
        >
          <p className="text-sm text-white/50 mb-2">Tasa Conversión</p>
          <p className="text-3xl text-white">{stats.conversionRate}%</p>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white/90 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05] appearance-none pr-10"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value} className="bg-black text-white">
                {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <span className="text-white/40 text-xs">▾</span>
          </div>
        </div>
        <div className="flex-1 relative">
          <select
            value={filterOrigin}
            onChange={(e) => setFilterOrigin(e.target.value)}
            className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white/90 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05] appearance-none pr-10"
          >
            {originOptions.map((option) => (
              <option key={option.value} value={option.value} className="bg-black text-white">
                {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <span className="text-white/40 text-xs">▾</span>
          </div>
        </div>
      </div>

      {/* Leads List */}
      <div className="space-y-4">
        {filteredLeads.map((lead, index) => {
          const vehicle = getVehicleForLead(lead.vehicleId);
          
          return (
            <motion.div
              key={lead.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-xl overflow-hidden"
            >
              <div className="p-6">
                <div className="flex gap-6">
                  {/* Vehicle Image */}
                  {vehicle && (
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl overflow-hidden flex-shrink-0 border border-white/10">
                      <ImageWithFallback
                        src={vehicle.image}
                        alt={vehicle.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Lead Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg text-white mb-1">{lead.name}</h3>
                        <p className="text-sm text-white/50">
                          Interesado en: <span className="text-white/70">{vehicle?.name}</span>
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{originIcons[lead.origin]}</span>
                        <div className={`px-3 py-1.5 rounded-full bg-gradient-to-r ${statusColors[lead.status]} border backdrop-blur-sm`}>
                          <span className="text-xs capitalize">{lead.status}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-white/40" />
                        <span className="text-sm text-white/70">{lead.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-white/40" />
                        <span className="text-sm text-white/70">{lead.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-white/40" />
                        <span className="text-sm text-white/70">
                          {new Date(lead.date).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      {lead.assignedTo && (
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-white/40" />
                          <span className="text-sm text-white/70">{lead.assignedTo}</span>
                        </div>
                      )}
                    </div>

                    {/* Notes */}
                    {lead.notes && (
                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                        <div className="flex items-start gap-2">
                          <MessageSquare className="w-4 h-4 text-white/40 mt-0.5" />
                          <p className="text-sm text-white/60">{lead.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <select
                      value={lead.status}
                      onChange={(e) =>
                        onLeadUpdate(lead.id, { status: e.target.value as Lead['status'] })
                      }
                      className="px-3 py-2 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-white/90 focus:outline-none focus:border-blue-500/50 appearance-none pr-8"
                    >
                      <option value="nuevo" className="bg-black text-white">Nuevo</option>
                      <option value="contactado" className="bg-black text-white">Contactado</option>
                      <option value="seguimiento" className="bg-black text-white">Seguimiento</option>
                      <option value="convertido" className="bg-black text-white">Convertido</option>
                      <option value="perdido" className="bg-black text-white">Perdido</option>
                    </select>
                    {onLeadDelete && (
                      <button
                        type="button"
                        onClick={() => window.confirm('¿Eliminar este lead?') && onLeadDelete(lead.id)}
                        className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 text-sm transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {filteredLeads.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 px-4 rounded-2xl border border-dashed border-white/10 bg-white/[0.02]"
        >
          <Inbox className="w-16 h-16 text-white/20 mb-4" strokeWidth={1.5} />
          <h3 className="text-lg text-white/70 mb-2">Sin resultados</h3>
          <p className="text-sm text-white/40 text-center max-w-sm">
            {leads.length === 0
              ? "Aún no hay leads. Los contactos del formulario web aparecerán aquí."
              : "No hay leads que coincidan con los filtros seleccionados. Prueba con otros criterios."}
          </p>
        </motion.div>
      )}
    </div>
  );
}