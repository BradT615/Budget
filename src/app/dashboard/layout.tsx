"use client";

import { ReactNode, useState } from "react";
import Sidebar from "@/components/layout/sidebar";
import TopNav from "@/components/layout/top-nav";
import { cn } from "@/utils/utils";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Fixed top navigation */}
      <div className="fixed top-0 left-0 right-0 z-30">
        <TopNav toggleSidebar={toggleSidebar} />
      </div>
      
      {/* Main content area below top nav */}
      <div className="flex flex-1 overflow-hidden pt-16">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)} 
          />
        )}

        {/* Fixed Sidebar */}
        <div 
          className={cn(
            "fixed inset-y-0 left-0 z-20 w-64 transform transition-transform duration-200 ease-in-out border-r h-screen pt-16 md:translate-x-0 md:relative md:h-full md:pt-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Scrollable main content */}
        <main className="flex-1 overflow-auto min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}