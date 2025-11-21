'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Phone, DollarSign, Send, Shield, Zap, UserCheck } from 'lucide-react';
import { apiClient } from '../../lib/api';
interface P2PTransferModalProps {
  onTransferSuccess: () => void;
}

export default function P2PTransferModal({ onTransferSuccess }: P2PTransferModalProps) {
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const transferAmount = parseFloat(amount);
    const cleanPhone = phone.replace(/\D/g, '');

    if (isNaN(transferAmount) || transferAmount <= 0) {
      setError('Monto inválido.');
      setLoading(false);
      return;
    }
    if (!/^9\d{8}$/.test(cleanPhone)) {
      setError('Celular inválido.');
      setLoading(false);
      return;
    }

    const idempotencyKey = uuidv4();

    try {
      // Usamos request para pasar el header extra
      await apiClient.request('/ledger/transfer/p2p', {
        method: 'POST',
        body: JSON.stringify({ 
          amount: transferAmount,
          destination_phone_number: cleanPhone
        }),
        headers: {
          'Idempotency-Key': idempotencyKey
        }
      });

      setSuccess(true);
      setTimeout(() => {
        onTransferSuccess();
        setAmount('');
        setPhone('');
        setSuccess(false);
      }, 2000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-sky-100 dark:border-slate-700 overflow-hidden w-full max-w-md">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-500 to-blue-600 p-6 text-white">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Transferencia P2P</h2>
            <p className="text-sky-100 text-sm">Envía dinero a otro usuario</p>
          </div>
        </div>
      </div>

      {/* Estado de Éxito */}
      {success && (
        <div className="px-6 py-4 bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-100 dark:border-emerald-800">
          <div className="flex items-center gap-3">
            <UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">¡Transferencia exitosa!</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">El dinero ha sido enviado correctamente</p>
            </div>
          </div>
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="p-6">
        <div className="space-y-6">
          {/* Campo de Teléfono */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Celular del Destinatario
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="block w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 dark:focus:ring-sky-400 dark:focus:border-sky-400 transition-all duration-200 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                placeholder="987654321"
                maxLength={9}
                required
                disabled={loading || success}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-slate-400 text-sm">PE</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Ingresa el número de 9 dígitos del destinatario
            </p>
          </div>

          {/* Campo de Monto */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Monto a Transferir (S/)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="block w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 dark:focus:ring-sky-400 dark:focus:border-sky-400 transition-all duration-200 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                placeholder="0.00"
                required
                disabled={loading || success}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-slate-400 text-sm">PEN</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              El monto se transferirá inmediatamente
            </p>
          </div>

          {/* Información de Seguridad */}
          <div className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400 bg-sky-50 dark:bg-sky-900/20 p-4 rounded-xl">
            <Shield className="w-4 h-4 text-sky-600 dark:text-sky-400 mt-0.5 flex-shrink-0" />
            <span>Las transferencias P2P son instantáneas y seguras. Verifica el número antes de enviar.</span>
          </div>

          {/* Características Rápidas */}
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-sky-50 dark:bg-sky-900/20 rounded-xl">
              <Zap className="w-4 h-4 text-sky-600 dark:text-sky-400 mx-auto mb-1" />
              <p className="text-xs text-slate-600 dark:text-slate-400">Transacción</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Instantánea</p>
            </div>
            <div className="text-center p-3 bg-sky-50 dark:bg-sky-900/20 rounded-xl">
              <UserCheck className="w-4 h-4 text-sky-600 dark:text-sky-400 mx-auto mb-1" />
              <p className="text-xs text-slate-600 dark:text-slate-400">Para usuarios</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Registrados</p>
            </div>
          </div>

          {/* Mensaje de Error */}
          {error && (
            <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl p-4">
              <p className="text-rose-700 dark:text-rose-400 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Botón de Envío */}
          <button
            type="submit"
            disabled={loading || success || !phone.trim() || !amount.trim()}
            className="w-full py-3.5 text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Procesando...
              </>
            ) : success ? (
              <>
                <UserCheck className="w-4 h-4" />
                ¡Enviado!
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Enviar Transferencia
              </>
            )}
          </button>
        </div>
      </form>

      {/* Footer Informativo */}
      <div className="bg-sky-50 dark:bg-sky-900/10 px-6 py-4 border-t border-sky-100 dark:border-slate-700">
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
          • Transferencia inmediata • Sin comisiones • Máxima seguridad •
        </p>
      </div>
    </div>
  );
}