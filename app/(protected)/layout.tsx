// src/app/(protected)/layout.tsx
import React from 'react';
import Layout from '@/app/components/Layout';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return <Layout>{children}</Layout>;
}
