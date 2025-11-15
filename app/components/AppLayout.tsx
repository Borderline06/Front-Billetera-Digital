'use client';

import Sidebar from "./Sidebar";
import AppHeader from "./header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Sidebar />
      <main className="flex-1 p-6">
        <AppHeader />
        {children}
      </main>
    </div>
  );
}
