export interface User {
  id: number;
  name: string;
  email: string;
  phone_number: string;
  
  // --- CAMPOS HÍBRIDOS (Merge Causa + Stress) ---
  // Son opcionales (?) para no romper la compatibilidad con usuarios de tests antiguos
  telegram_chat_id?: string; 
  is_phone_verified?: boolean;
  
  // Campos de auditoría
  is_active?: boolean;
}

// Tipos para respuestas de autenticación
export interface AuthResponse {
  access_token?: string; // Puede venir directo en Stress Mode
  token_type?: string;
  user_id: number;
  name: string;
  email: string;
  is_phone_verified?: boolean;
  id?: number; // A veces el endpoint de registro devuelve 'id' en vez de 'user_id'
}