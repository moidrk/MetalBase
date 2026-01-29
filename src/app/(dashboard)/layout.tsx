'use client';

import { ReactNode } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { SidebarProvider } from '@/context/SidebarContext';
import { cn } from '@/lib/utils';

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main
          className={cn(
            "min-h-screen transition-all duration-200 ease-in-out",
            "pt-0 md:pt-0"
          )}
        >
          <div className="p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
