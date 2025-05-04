"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/utils";
import {
  LayoutDashboard,
  DollarSign,
  PiggyBank,
  // Removing unused CreditCard import
  Settings,
  Shield,
  X,
  ArrowUpDown,
  Receipt
} from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";

const baseNavItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Transactions", href: "/dashboard/transactions", icon: ArrowUpDown },
  { name: "Income", href: "/dashboard/income", icon: DollarSign },
  { name: "Expenses", href: "/dashboard/expenses", icon: Receipt },
  { name: "Savings Goals", href: "/dashboard/savings", icon: PiggyBank },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  // Removing the unused isAdmin variable since we're using it in logic later
  const [navItems, setNavItems] = useState(baseNavItems);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;

  useEffect(() => {
    const checkIfAdmin = async () => {
      setIsLoading(true);
      
      try {
        // Get the authenticated user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsLoading(false);
          return;
        }
        
        // Check if the user is in the admin_users table using the is_admin function
        const { data, error } = await supabase.rpc('is_admin', {
          user_id: user.id
        });
        
        if (error) {
          console.error("Error checking admin status:", error);
        } else if (!!data) {
          // If admin, add the admin panel link
          setNavItems([
            ...baseNavItems,
            { name: "Admin", href: "/dashboard/admin", icon: Shield },
          ]);
        } else {
          setNavItems(baseNavItems);
        }
      } catch (error) {
        console.error("Error in checkIfAdmin:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkIfAdmin();
  }, [supabase]);

  const handleNavClick = () => {
    if (isMobile && onClose) {
      onClose();
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col bg-sidebar">
        <div className="space-y-4 py-4 px-4">
          <div className="animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="my-1 h-9 rounded-md bg-muted/50 px-3 py-2"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Mobile header with close button */}
      {isMobile && (
        <div className="flex justify-between items-center p-4 border-b md:hidden">
          <div className="flex items-center space-x-2">
            <Image 
              src="/icon.svg" 
              alt="Budget Tracker Logo" 
              width={24} 
              height={24} 
            />
            <span className="text-md font-semibold">Budget Tracker</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="scale-125" />
          </Button>
        </div>
      )}
      
      <ScrollArea className="flex-1">
        <div className="space-y-4 py-4 px-4">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={handleNavClick}
                  className={cn(
                    "flex items-center rounded-md px-3 py-2 text-sm font-medium",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
                  )}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </ScrollArea>
    </div>
  );
}