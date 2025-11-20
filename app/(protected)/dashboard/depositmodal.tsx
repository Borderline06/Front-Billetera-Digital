'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { X, TrendingUp, DollarSign, Clock, Shield } from 'lucide-react';

interface LoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoanSuccess: () => void;
}

export default function LoanModal({ isOpen, onClose, onLoanSuccess }: LoanModalProps) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_GATEWAY_URL = 'http://localhost:8080';

  const handleLoanRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      setError('Por favor, ingresa un monto válido.');
      setLoading(false);
      return;
    }

    if (depositAmount > 500) {
      setError('El monto máximo permitido es S/ 500.00');
      setLoading(false);
      return;
    }

    const token = localStorage.getItem('pixel-token');
    if (!token) {
      setError('No estás autenticado.');
      setLoading(false);
      return;
    }

    const idempotencyKey = uuidv4();

    try {
      const response = await fetch(`${API_GATEWAY_URL}/request-loan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Idempotency-Key': idempotencyKey,
        },
        body: JSON.stringify({ amount: parseFloat(amount) }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Error al procesar el préstamo');
      }

      console.log('Préstamo exitoso:', data);
      onLoanSuccess();
      onClose();
      setAmount('');

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-3xl shadow-2xl w-full max-w-md border border-sky-100 dark:border-slate-700 overflow-hidden animate-fade-in-up">
        {/* Header del Modal */}
        <div className="bg-gradient-to-r from-sky-500 to-blue-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Solicitar Préstamo</h2>
                <p className="text-sky-100 text-sm">Obtén financiamiento rápido y seguro</p>
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

        {/* Información del Préstamo */}
        <div className="p-6 border-b border-sky-100 dark:border-slate-700">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 bg-sky-50 dark:bg-sky-900/20 rounded-xl">
              <DollarSign className="w-5 h-5 text-sky-600 dark:text-sky-400 mx-auto mb-2" />
              <p className="text-xs text-slate-600 dark:text-slate-400">Monto Máximo</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">S/ 500.00</p>
            </div>
            <div className="text-center p-3 bg-sky-50 dark:bg-sky-900/20 rounded-xl">
              <Clock className="w-5 h-5 text-sky-600 dark:text-sky-400 mx-auto mb-2" />
              <p className="text-xs text-slate-600 dark:text-slate-400">Desembolso</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Inmediato</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl">
            <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Tu información está protegida con encriptación de última generación</span>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleLoanRequest} className="p-6">
          <div className="space-y-4">
            {/* Campo de Monto */}
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Monto a Solicitar (S/)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  max="500"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 dark:focus:ring-sky-400 dark:focus:border-sky-400 transition-all duration-200"
                  placeholder="0.00"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-slate-400 text-sm">PEN</span>
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Ingresa un monto entre S/ 1.00 y S/ 500.00
              </p>
            </div>

            {/* Mensaje de Error */}
            {error && (
              <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl p-4">
                <p className="text-rose-700 dark:text-rose-400 text-sm text-center">{error}</p>
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-3 text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl font-medium transition-colors duration-200 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 rounded-xl font-medium shadow-lg shadow-blue-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4" />
                    Solicitar Préstamo
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Footer Informativo */}
        <div className="bg-sky-50 dark:bg-sky-900/10 px-6 py-4 border-t border-sky-100 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
            • Tasa de interés competitiva • Sin comisiones ocultas • Aprobación inmediata •
          </p>
        </div>
      </div>
    </div>
  );
}