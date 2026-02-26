/**
 * Sección de estadísticas y rendimiento.
 * Gráficos de vistas, clics, leads, conversión y top performers.
 */
import { useMemo } from "react";
import { motion } from "motion/react";
import { TrendingUp, Eye, MousePointer, Users, Video, ChartBar } from 'lucide-react';
import { Vehicle } from '../data/mock-data';
import { ImageWithFallback } from './figma/ImageWithFallback';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
interface StatsSectionProps {
  vehicles: Vehicle[];
}

export function StatsSection({ vehicles }: StatsSectionProps) {
  // Datos para el gráfico de barras de rendimiento por vehículo
  const vehiclePerformance = useMemo(() => vehicles
    .sort((a, b) => b.leads - a.leads)
    .slice(0, 6)
    .map((v) => ({
      name: `${v.brand} ${v.model.split(" ")[0]}`,
      vistas: v.views,
      clics: v.clicks,
      leads: v.leads,
    })), [vehicles]);

  const conversionData = useMemo(() => vehicles.map((v) => ({
    name: v.brand,
    conversion: v.views > 0 ? ((v.leads / v.views) * 100).toFixed(2) : "0",
  })), [vehicles]);

  const statusData = useMemo(() => [
    { name: "Disponible", value: vehicles.filter((v) => v.status === "disponible").length, color: "#10b981" },
    { name: "Reservado", value: vehicles.filter((v) => v.status === "reservado").length, color: "#f59e0b" },
    { name: "Vendido", value: vehicles.filter((v) => v.status === "vendido").length, color: "#6b7280" },
  ], [vehicles]);

  const videoPerformance = useMemo(() => vehicles
    .filter((v) => v.videoUrl)
    .map((v) => ({
      name: v.brand,
      views: v.videoViews || 0,
      leads: v.leads,
    })), [vehicles]);

  const totalStats = useMemo(() => ({
    totalViews: vehicles.reduce((acc, v) => acc + v.views, 0),
    totalClicks: vehicles.reduce((acc, v) => acc + v.clicks, 0),
    totalLeads: vehicles.reduce((acc, v) => acc + v.leads, 0),
    avgConversion:
      vehicles.length > 0
        ? vehicles.reduce((acc, v) => acc + (v.views > 0 ? (v.leads / v.views) * 100 : 0), 0) / vehicles.length
        : 0,
  }), [vehicles]);

  const topPerformers = useMemo(() => vehicles
    .slice()
    .sort((a, b) => {
      const convA = a.views > 0 ? a.leads / a.views : 0;
      const convB = b.views > 0 ? b.leads / b.views : 0;
      if (convA !== convB) return convB - convA;
      return b.leads - a.leads;
    })
    .slice(0, 3), [vehicles]);

  if (vehicles.length === 0) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px]">
        <ChartBar className="w-16 h-16 text-white/20 mb-4" />
        <p className="text-white/50 text-center">Añade vehículos para ver estadísticas</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Top Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500/[0.08] to-blue-600/[0.08] backdrop-blur-xl p-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-blue-500/20">
              <Eye className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-sm text-white/50">Vistas Totales</p>
          </div>
          <p className="text-3xl text-white mb-1">{totalStats.totalViews.toLocaleString()}</p>
          <div className="flex items-center gap-1">
            {totalStats.totalViews > 0 ? (
              <>
                <TrendingUp className="w-3 h-3 text-green-400" />
                <span className="text-xs text-green-400">Vistas de fichas</span>
              </>
            ) : (
              <span className="text-xs text-white/40">Próximamente</span>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-white/10 bg-gradient-to-br from-purple-500/[0.08] to-purple-600/[0.08] backdrop-blur-xl p-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-purple-500/20">
              <MousePointer className="w-5 h-5 text-purple-400" />
            </div>
            <p className="text-sm text-white/50">Clics Totales</p>
          </div>
          <p className="text-3xl text-white mb-1">{totalStats.totalClicks.toLocaleString()}</p>
          <div className="flex items-center gap-1">
            {totalStats.totalClicks > 0 ? (
              <>
                <TrendingUp className="w-3 h-3 text-green-400" />
                <span className="text-xs text-green-400">Clics en CTAs</span>
              </>
            ) : (
              <span className="text-xs text-white/40">Próximamente</span>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-white/10 bg-gradient-to-br from-green-500/[0.08] to-green-600/[0.08] backdrop-blur-xl p-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-green-500/20">
              <Users className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-sm text-white/50">Leads Generados</p>
          </div>
          <p className="text-3xl text-white mb-1">{totalStats.totalLeads}</p>
          <div className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-green-400" />
            <span className="text-xs text-green-400">Contacto + prueba de manejo</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-white/10 bg-gradient-to-br from-yellow-500/[0.08] to-yellow-600/[0.08] backdrop-blur-xl p-6"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-yellow-500/20">
              <TrendingUp className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-sm text-white/50">Conversión Media</p>
          </div>
          <p className="text-3xl text-white mb-1">{totalStats.avgConversion.toFixed(2)}%</p>
          <div className="flex items-center gap-1">
            {totalStats.totalViews > 0 ? (
              <span className="text-xs text-green-400">Leads / vistas</span>
            ) : (
              <span className="text-xs text-white/40">Con vistas activas</span>
            )}
          </div>
        </motion.div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Vehicle Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-xl p-6"
        >
          <h3 className="text-lg text-white mb-6">Rendimiento por Vehículo</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={vehiclePerformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" style={{ fontSize: 12 }} />
              <YAxis stroke="rgba(255,255,255,0.4)" style={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.9)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  color: 'white',
                }}
              />
              <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.7)' }} />
              <Bar dataKey="vistas" fill="#60a5fa" radius={[8, 8, 0, 0]} />
              <Bar dataKey="clics" fill="#a78bfa" radius={[8, 8, 0, 0]} />
              <Bar dataKey="leads" fill="#34d399" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Status Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-xl p-6"
        >
          <h3 className="text-lg text-white mb-6">Distribución de Stock</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsla(0, 3.70%, 78.80%, 0.87)',
                  border: '1px solid rgba(0, 0, 0, 0.77)',
                  borderRadius: '12px',
                  padding: '10px',
                  fontSize: '12px',
                  color: 'white',
                }}
              />
              <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.7)' }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Video Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-xl p-6 mb-8"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-blue-500/20">
            <Video className="w-5 h-5 text-blue-400" />
          </div>
          <h3 className="text-lg text-white">Rendimiento de Coches</h3>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={videoPerformance}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" style={{ fontSize: 12 }} />
            <YAxis stroke="rgba(255,255,255,0.4)" style={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(0,0,0,0.9)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: 'white',
              }}
            />
            <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.7)' }} />
            <Line type="monotone" dataKey="views" stroke="#60a5fa" strokeWidth={2} dot={{ fill: '#60a5fa', r: 4 }} />
            <Line type="monotone" dataKey="leads" stroke="#34d399" strokeWidth={2} dot={{ fill: '#34d399', r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Top Performers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-xl p-6"
      >
        <h3 className="text-lg text-white mb-6">Top 3 Mejor Conversión</h3>
        <div className="space-y-4">
          {topPerformers.map((vehicle, index) => {
            const conversion = vehicle.views > 0 ? ((vehicle.leads / vehicle.views) * 100).toFixed(2) : '0.00';
            const medals = ['🥇', '🥈', '🥉'];
            
            return (
              <div
                key={vehicle.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/10"
              >
                <span className="text-3xl">{medals[index]}</span>
                <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-white/10">
                  <ImageWithFallback src={vehicle.image} alt={vehicle.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <h4 className="text-white mb-1">{vehicle.name}</h4>
                  <p className="text-sm text-white/50">
                    {vehicle.views.toLocaleString()} vistas • {vehicle.leads} leads
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl text-green-400">{conversion}%</p>
                  <p className="text-xs text-white/50">conversión</p>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
