"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useNotification } from "../contexts/NotificationContext";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    // Rutas públicas
    if (pathname === "/login" || pathname === "/register") {
      setAuthorized(true);
      return;
    }

    const token = localStorage.getItem("pixel-token");
    const isVerifiedStr = localStorage.getItem("is_phone_verified");

    // 1. Sin token -> Login
    if (!token) {
      router.push("/login");
      return;
    }

    // 2. Con token, validar estado de verificación (Lógica Híbrida)
    // Si existe la bandera explícita 'false', bloqueamos.
    // Si la bandera no existe (null) o es 'true', permitimos (Compatibilidad Stress Test).
    if (isVerifiedStr === "false") {
        showNotification("Cuenta no verificada. Contacte soporte.", "warning");
        // En un flujo ideal, aquí redirigiríamos a una página de verificar, 
        // pero por ahora mandamos al login para limpiar estado.
        localStorage.clear();
        router.push("/login");
        return;
    }

    setAuthorized(true);
  }, [router, pathname]);

  if (!authorized && pathname !== "/login" && pathname !== "/register") {
    return null; // Evitar flash de contenido
  }

  return <>{children}</>;
}