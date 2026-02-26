import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import type { FormEvent } from 'react';
import { Send, Phone, Mail, CheckCircle2, Loader2, CheckCircle } from 'lucide-react';
import { api } from '../../services/api.js';
import { getPhoneErrorMessage } from '../../utils/validation.js';

interface ContactFormProps {
  vehicleId?: string;
  vehicleTitle?: string;
  /** Llamado la primera vez que el usuario interactúa con el formulario (focus en cualquier campo). */
  onFirstInteraction?: () => void;
}

export interface ContactFormRef {
  focusNameField: () => void;
}

export const ContactForm = forwardRef<ContactFormRef, ContactFormProps>(({ vehicleId, vehicleTitle, onFirstInteraction }, ref) => {
  const nameInputRef = useRef<HTMLInputElement>(null);
  const hasFiredFirstInteraction = useRef(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useImperativeHandle(ref, () => ({
    focusNameField: () => {
      nameInputRef.current?.focus();
    },
  }));

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Se requiere un nombre';
    }

    if (!formData.email.trim()) {
      errors.email = 'Se requiere una dirección de correo electrónico';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = 'Formato de correo electrónico inválido';
      }
    }

    if (formData.phone) {
      const phoneError = getPhoneErrorMessage(formData.phone);
      if (phoneError) {
        errors.phone = phoneError;
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await api.submitContact({
        vehicleId: vehicleId || undefined,
        vehicleTitle: vehicleTitle || undefined,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        message: formData.message || undefined,
      });

      setSuccess(true);
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: '',
      });

      // Hide success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar el mensaje');
    } finally {
      setLoading(false);
    }
  };

  const handleFormFocus = () => {
    if (hasFiredFirstInteraction.current || !onFirstInteraction) return;
    hasFiredFirstInteraction.current = true;
    onFirstInteraction();
  };

  return (
    <aside className="sticky top-[calc(68px+20px)]">
      <article className="rounded-3xl overflow-hidden bg-white/[0.03] border border-white/[.06] shadow-xl shadow-black/20 backdrop-blur-sm p-6">
        <h2 className="m-0 mb-5 text-lg font-black text-white">Solicitar Información</h2>

        <form onSubmit={handleSubmit} onFocus={handleFormFocus} className="space-y-4">
          <div>
            <label
              className="block text-white/70 mb-2"
              style={{ fontSize: '14px', fontWeight: 600 }}
            >
              Nombre completo
            </label>
            <input
              ref={nameInputRef}
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (fieldErrors.name) {
                  setFieldErrors({ ...fieldErrors, name: '' });
                }
              }}
              className={`w-full rounded-xl border ${
                fieldErrors.name
                  ? 'border-red-500/50'
                  : 'border-white/[0.08] focus:border-blue-500/50'
              } bg-white/[.02] text-white px-4 py-3 outline-none focus:bg-white/[.04] transition-all duration-200`}
              placeholder="Tu nombre"
              style={{ fontSize: '16px', fontWeight: 500 }}
            />
            {fieldErrors.name && (
              <p className="mt-1 text-red-400 text-xs">{fieldErrors.name}</p>
            )}
          </div>

          <div>
            <label
              className="block text-white/70 mb-2"
              style={{ fontSize: '14px', fontWeight: 600 }}
            >
              Correo electrónico
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (fieldErrors.email) {
                  setFieldErrors({ ...fieldErrors, email: '' });
                }
              }}
              className={`w-full rounded-xl border ${
                fieldErrors.email
                  ? 'border-red-500/50'
                  : 'border-white/[0.08] focus:border-blue-500/50'
              } bg-white/[.02] text-white px-4 py-3 outline-none focus:bg-white/[.04] transition-all duration-200`}
              placeholder="tu@email.com"
              style={{ fontSize: '16px', fontWeight: 500 }}
            />
            {fieldErrors.email && (
              <p className="mt-1 text-red-400 text-xs">{fieldErrors.email}</p>
            )}
          </div>

          <div>
            <label
              className="block text-white/70 mb-2"
              style={{ fontSize: '14px', fontWeight: 600 }}
            >
              Teléfono <span className="text-white/40 text-xs">(opcional)</span>
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => {
                setFormData({ ...formData, phone: e.target.value });
                if (fieldErrors.phone) {
                  setFieldErrors({ ...fieldErrors, phone: '' });
                }
              }}
              className={`w-full rounded-xl border ${
                fieldErrors.phone
                  ? 'border-red-500/50'
                  : 'border-white/[0.08] focus:border-blue-500/50'
              } bg-white/[.02] text-white px-4 py-3 outline-none focus:bg-white/[.04] transition-all duration-200`}
              placeholder="+34 600 000 000"
              style={{ fontSize: '16px', fontWeight: 500 }}
            />
            {fieldErrors.phone && (
              <p className="mt-1 text-red-400 text-xs">{fieldErrors.phone}</p>
            )}
          </div>

          <div>
            <label
              className="block text-white/70 mb-2"
              style={{ fontSize: '14px', fontWeight: 600 }}
            >
              Mensaje
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full min-h-[100px] resize-none rounded-xl border border-white/[0.08] bg-white/[.02] text-white px-4 py-3 outline-none focus:border-blue-500/50 focus:bg-white/[.04] transition-all duration-200"
              placeholder="Cuéntanos qué te interesa saber..."
              style={{ fontSize: '16px', fontWeight: 500 }}
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Mensaje enviado correctamente
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-600/20 transition-all duration-200"
            style={{ fontSize: '16px', fontWeight: 600 }}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Enviar Mensaje
              </>
            )}
          </button>
        </form>

        {/* Direct contact */}
        <div className="mt-6 pt-6 border-t border-white/[.06]">
          <p
            className="m-0 mb-3 text-white/40 uppercase"
            style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em' }}
          >
            O CONTÁCTANOS DIRECTAMENTE
          </p>

          <div className="space-y-2">
            <div className="flex items-center gap-3 p-3 rounded-xl border border-white/[.06] bg-white/[.02] hover:bg-white/[.03] transition-colors">
              <div className="w-9 h-9 rounded-lg grid place-items-center border border-white/[0.08] bg-white/[.03]">
                <Phone className="w-4 h-4 text-white/70" />
              </div>
              <span className="text-white/80" style={{ fontSize: '14px', fontWeight: 600 }}>
              +34 659 16 41 04
              </span>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl border border-white/[.06] bg-white/[.02] hover:bg-white/[.03] transition-colors">
              <div className="w-9 h-9 rounded-lg grid place-items-center border border-white/[0.08] bg-white/[.03]">
                <Mail className="w-4 h-4 text-white/70" />
              </div>
              <span className="text-white/80" style={{ fontSize: '14px', fontWeight: 600 }}>
                direccion@bcarsiberica.com
              </span>
            </div>
          </div>
        </div>
      </article>

      {/* Included services */}
      <div className="mt-5 p-6 rounded-3xl bg-gradient-to-br from-blue-500/10 via-transparent to-emerald-500/5 border border-white/[.08] shadow-xl shadow-black/20">
        <h4 className="m-0 mb-4 text-base font-black text-white flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          Incluye
        </h4>
        <ul className="m-0 p-0 list-none space-y-2.5">
          {[
            'Garantía de fábrica extendida',
            'Historial de mantenimiento completo',
            'Inspección certificada de 150 puntos',
            'Asistencia en carretera 24/7',
            'Financiamiento disponible',
          ].map((item, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2.5 text-white/70 leading-relaxed"
              style={{ fontSize: '14px', fontWeight: 500 }}
            >
              <CheckCircle2 className="w-4 h-4 mt-0.5 text-emerald-400 flex-shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
});

ContactForm.displayName = 'ContactForm';