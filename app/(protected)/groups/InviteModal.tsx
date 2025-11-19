'use client';

import { useState } from 'react';
import { X, Phone, UserPlus, Users, Shield, Mail, CheckCircle } from 'lucide-react';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInviteSuccess: () => void;
  group: { id: number; name: string }; 
}

export default function InviteModal({
  isOpen,
  onClose,
  onInviteSuccess,
  group
}: InviteModalProps) {

  const [phoneToInvite, setPhoneToInvite] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const API_GATEWAY_URL = 'http://localhost:8080';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    if (!phoneToInvite.trim()) {
      setError('Por favor, ingresa un número de celular.');
      setLoading(false);
      return;
    }

    // Validar formato básico de teléfono peruano (9 dígitos)
    const phoneRegex = /^9\d{8}$/;
    if (!phoneRegex.test(phoneToInvite.replace(/\D/g, ''))) {
      setError('Por favor, ingresa un número de celular válido (9 dígitos, empezando con 9).');
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('pixel-token');
    if (!token) {
      setError('No estás autenticado.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_GATEWAY_URL}/groups/${group.id}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          phone_number_to_invite: phoneToInvite.replace(/\D/g, '')
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Error al invitar al miembro');
      }

      console.log('Invitación exitosa:', data);
      setSuccess(true);
      setTimeout(() => {
        onInviteSuccess();
        onClose();
        setPhoneToInvite('');
        setSuccess(false);
      }, 1500);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-3xl shadow-2xl w-full max-w-md border border-sky-100 dark:border-slate-700 overflow-hidden animate-fade-in-up">
        {/* Header del Modal */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Invitar Miembro</h2>
                <p className="text-amber-100 text-sm">Amplía tu comunidad</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Información del Grupo */}
        <div className="p-6 border-b border-sky-100 dark:border-slate-700">
          <div className="flex items-center gap-3 bg-sky-50 dark:bg-sky-900/20 rounded-xl p-4">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-600 dark:text-slate-400">Estás invitando a</p>
              <p className="font-semibold text-slate-800 dark:text-slate-100">{group.name}</p>
            </div>
          </div>
        </div>

        {/* Estado de Éxito */}
        {success && (
          <div className="px-6 py-4 bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-100 dark:border-emerald-800">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">¡Invitación enviada!</p>
                <p className="text-xs text-emerald-700 dark:text-emerald-400">El usuario recibirá una notificación</p>
              </div>
            </div>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Campo de Teléfono */}
            <div>
              <label htmlFor="phone_invite" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Número de Celular
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="phone_invite"
                  name="phone_invite"
                  type="tel"
                  required
                  value={phoneToInvite}
                  onChange={(e) => setPhoneToInvite(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:focus:ring-amber-400 dark:focus:border-amber-400 transition-all duration-200"
                  placeholder="987654321"
                  maxLength={9}
                  disabled={loading || success}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-slate-400 text-sm">PE</span>
                </div>
              </div>
              <div className="flex justify-between mt-2">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Ingresa el número de 9 dígitos (sin espacios)
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {phoneToInvite.length}/9
                </p>
              </div>
            </div>

            {/* Información de Requisitos */}
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4">
              <h4 className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Requisitos para la invitación
              </h4>
              <ul className="text-xs text-amber-700 dark:text-amber-400 space-y-1">
                <li>• El usuario debe estar registrado en Pixel Money</li>
                <li>• Debe tener el número verificado en su cuenta</li>
                <li>• Recibirá una notificación de invitación</li>
              </ul>
            </div>

            {/* Información de Seguridad */}
            <div className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400 bg-sky-50 dark:bg-sky-900/20 p-4 rounded-xl">
              <Shield className="w-4 h-4 text-sky-600 dark:text-sky-400 mt-0.5 flex-shrink-0" />
              <span>Solo podrás invitar a usuarios que ya estén registrados en la plataforma.</span>
            </div>

            {/* Mensaje de Error */}
            {error && (
              <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl p-4">
                <p className="text-rose-700 dark:text-rose-400 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading || success}
                className="flex-1 px-4 py-3 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl font-medium transition-colors duration-200 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || success || !phoneToInvite.trim()}
                className="flex-1 px-4 py-3 text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 rounded-xl font-medium shadow-lg shadow-amber-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Enviando...
                  </>
                ) : success ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    ¡Enviado!
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Invitar Usuario
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Footer Informativo */}
        <div className="bg-amber-50 dark:bg-amber-900/10 px-6 py-4 border-t border-amber-100 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
            • Solo usuarios registrados • Notificación inmediata • Aceptación voluntaria •
          </p>
        </div>
      </div>
    </div>
  );
}