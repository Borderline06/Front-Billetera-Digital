import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://pixel-money.koyeb.app';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('pixel-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const auth = {
  login: async (credentials: any) => {
    const response = await api.post('/login', credentials);
    
    // Lógica Híbrida: Guardar estado de verificación si existe
    if (typeof window !== 'undefined' && response.data) {
        if (response.data.is_phone_verified !== undefined) {
            localStorage.setItem("is_phone_verified", String(response.data.is_phone_verified));
        }
        // Si viene el telegram ID, guardarlo también
        if (response.data.telegram_chat_id) {
            localStorage.setItem("telegram_chat_id", response.data.telegram_chat_id);
        }
    }
    return response.data;
  },

  register: async (userData: any) => {
    const response = await api.post('/register', userData);
    return response.data;
  },

  // --- MÉTODOS DE RAMA CAUSA (Integrados) ---
  verifyPhone: async (data: { phone_number: string; code: string }) => {
    const response = await api.post('/verify-phone', data);
    return response.data;
  },

  resendCode: async (data: { phone_number: string }) => {
    await api.post('/resend-code', data);
  },
  // ------------------------------------------

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
    }
  },
};

export const balance = {
  get: async (userId: number) => {
    const response = await api.get(`/balance/${userId}`);
    return response.data;
  },
  check: async (data: { user_id: number; amount: number }) => {
    const response = await api.post('/balance/check', data);
    return response.data;
  }
};

export const transactions = {
    p2p: async (data: any) => {
        const response = await api.post('/transfers/p2p', data);
        return response.data;
    }
}

export const groups = {
    // ... tus métodos de grupos existentes ...
    create: async (data: any) => {
        const response = await api.post('/groups', data);
        return response.data;
    },
    list: async (userId: number) => {
        const response = await api.get(`/groups/user/${userId}`);
        return response.data;
    }
}

export default api;