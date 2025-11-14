// src/components/AppLayout.tsx
'use client';

import Sidebar from "./Sidebar";
import AppHeader from "./header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      <Sidebar />

      <main className="flex-1 p-6">
        <AppHeader />
        {children}
      </main>
    </div>
  );
}
