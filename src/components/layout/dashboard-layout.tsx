"use client";

import { ReactNode, useState } from "react";
import Sidebar from "./sidebar";
import TopNav from "./top-nav";
import { cn } from "@/utils/utils";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopNav toggleSidebar={toggleSidebar} />
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)} 
          />
        )}

        {/* Sidebar */}
        <div 
          className={cn(
            "fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-200 ease-in-out border-r h-full md:translate-x-0 md:relative md:h-full",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}