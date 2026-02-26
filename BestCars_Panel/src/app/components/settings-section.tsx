/**
 * Sección de configuración del panel.
 * Perfil, notificaciones, seguridad (solo cambiar contraseña) e idioma (solo español).
 */
import { useState } from "react";
import { motion } from "motion/react";
import { User, Bell, Shield, Lock, Globe } from "lucide-react";
import { toast } from "sonner";
import { changePassword as apiChangePassword } from "../../services/api";

export function SettingsSection() {
  const [modalOpen, setModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.trim().length < 6) {
      toast.error("La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("La nueva contraseña y la confirmación no coinciden");
      return;
    }
    setLoading(true);
    try {
      await apiChangePassword(currentPassword, newPassword);
      toast.success("Contraseña actualizada. Usa la nueva contraseña en el próximo inicio de sesión.");
      setModalOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const msg = err && typeof err === "object" && "message" in err ? String((err as { message: string }).message) : "Error al cambiar la contraseña";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Perfil de Usuario */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-blue-500/20">
              <User className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-lg text-white">Perfil de Usuario</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-white/50 mb-2">Nombre completo</label>
              <input
                type="text"
                defaultValue="Admin Principal"
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white/90 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05]"
              />
            </div>
            <div>
              <label className="block text-sm text-white/50 mb-2">Email</label>
              <input
                type="email"
                defaultValue="admin@autopanel.com"
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white/90 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05]"
              />
            </div>
            <div>
              <label className="block text-sm text-white/50 mb-2">Rol</label>
              <select className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white/90 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05]">
                <option value="admin" className="bg-black">Administrador</option>
                <option value="comercial" className="bg-black">Comercial</option>
                <option value="marketing" className="bg-black">Marketing</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* Notificaciones */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-purple-500/20">
              <Bell className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="text-lg text-white">Notificaciones</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/10">
              <div>
                <p className="text-white/90 mb-1">Nuevos leads</p>
                <p className="text-sm text-white/50">Recibir notificación cuando llegue un nuevo lead</p>
              </div>
              <label className="relative inline-block w-12 h-6">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-full h-full bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-500 transition-all"></div>
                <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all peer-checked:translate-x-6"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/10">
              <div>
                <p className="text-white/90 mb-1">Cambios de precio</p>
                <p className="text-sm text-white/50">Notificar cuando se modifique el precio de un vehículo</p>
              </div>
              <label className="relative inline-block w-12 h-6">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-full h-full bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-500 transition-all"></div>
                <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all peer-checked:translate-x-6"></div>
              </label>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.03] border border-white/10">
              <div>
                <p className="text-white/90 mb-1">Leads convertidos</p>
                <p className="text-sm text-white/50">Notificar cuando un lead se convierta en venta</p>
              </div>
              <label className="relative inline-block w-12 h-6">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-full h-full bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:bg-blue-500 transition-all"></div>
                <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-all peer-checked:translate-x-6"></div>
              </label>
            </div>
          </div>
        </motion.div>

        {/* Seguridad: solo Cambiar contraseña (funcional) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-red-500/20">
              <Shield className="w-5 h-5 text-red-400" />
            </div>
            <h3 className="text-lg text-white">Seguridad</h3>
          </div>
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 hover:bg-white/[0.05] text-white/90 transition-all text-left flex items-center gap-3"
            >
              <Lock className="w-4 h-4 text-white/50" />
              Cambiar contraseña
            </button>
          </div>
        </motion.div>

        {/* Idioma: solo Español */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-xl bg-indigo-500/20">
              <Globe className="w-5 h-5 text-indigo-400" />
            </div>
            <h3 className="text-lg text-white">Idioma y Región</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-white/50 mb-2">Idioma</label>
              <select className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white/90 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05]">
                <option value="es" className="bg-black">Español</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-white/50 mb-2">Zona horaria</label>
              <select className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white/90 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.05]">
                <option value="europe/madrid" className="bg-black">Europe/Madrid (GMT+1)</option>
              </select>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modal Cambiar contraseña */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-6 shadow-xl">
            <h4 className="text-lg text-white mb-4">Cambiar contraseña</h4>
            <form onSubmit={handleSubmitPassword} className="space-y-4">
              <div>
                <label className="block text-sm text-white/50 mb-2">Contraseña actual</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-3 bg-white/[0.05] border border-white/10 rounded-xl text-white/90 focus:outline-none focus:border-blue-500/50"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm text-white/50 mb-2">Nueva contraseña (mín. 6 caracteres)</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  className="w-full px-4 py-3 bg-white/[0.05] border border-white/10 rounded-xl text-white/90 focus:outline-none focus:border-blue-500/50"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm text-white/50 mb-2">Confirmar nueva contraseña</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="w-full px-4 py-3 bg-white/[0.05] border border-white/10 rounded-xl text-white/90 focus:outline-none focus:border-blue-500/50"
                  placeholder="••••••••"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                  }}
                  className="flex-1 px-4 py-3 rounded-xl border border-white/10 text-white/70 hover:bg-white/[0.05] transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-medium transition-all disabled:opacity-50"
                >
                  {loading ? "Guardando…" : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
