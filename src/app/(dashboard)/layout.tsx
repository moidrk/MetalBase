'use client';

import { ReactNode } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Add navigation/sidebar here in future phases */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
