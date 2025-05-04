"use client";

import { ReactNode, useState, useEffect, useRef } from "react";
import Sidebar from "@/components/layout/sidebar";
import TopNav from "@/components/layout/top-nav";
import { cn } from "@/utils/utils";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);
  const mainContentRef = useRef<HTMLDivElement>(null);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Add scroll event listener to detect when user scrolls
  useEffect(() => {
    const mainContent = mainContentRef.current;
    
    if (!mainContent) return;
    
    const handleScroll = () => {
      // Check if the user has scrolled down even slightly
      if (mainContent.scrollTop > 5) {
        setHasScrolled(true);
      } else {
        setHasScrolled(false);
      }
    };

    // Add the scroll event listener to the main content area
    mainContent.addEventListener('scroll', handleScroll);
    
    // Clean up event listener when component unmounts
    return () => {
      mainContent.removeEventListener('scroll', handleScroll);
    };
  }, []);

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

        {/* Scrollable main content with ref */}
        <main 
          ref={mainContentRef}
          className="flex-1 overflow-auto min-w-0 relative"
        >
          {/* Top shadow - only visible when user has scrolled */}
          <div 
            className={cn(
              "sticky top-0 left-0 right-0 h-5 pointer-events-none z-10",
              "bg-gradient-to-b from-background to-transparent",
              "transition-opacity duration-200 ease-in-out",
              hasScrolled ? "opacity-100" : "opacity-0"
            )}
            style={{ boxShadow: hasScrolled ? 'inset 0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none' }}
          />
          
          {children}
        </main>
      </div>
    </div>
  );
}