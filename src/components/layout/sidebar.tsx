// src/components/layout/sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/utils";
import {
  LayoutDashboard,
  DollarSign,
  PiggyBank,
  CreditCard,
  Settings,
  Shield,
} from "lucide-react";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

const baseNavItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Income", href: "/dashboard/income", icon: DollarSign },
  { name: "Expenses", href: "/dashboard/expenses", icon: CreditCard },
  { name: "Savings Goals", href: "/dashboard/savings", icon: PiggyBank },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [navItems, setNavItems] = useState(baseNavItems);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const checkIfAdmin = async () => {
      setIsLoading(true);
      
      try {
        // Get the authenticated user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsAdmin(false);
          setIsLoading(false);
          return;
        }
        
        // Check if the user is in the admin_users table using the is_admin function
        const { data, error } = await supabase.rpc('is_admin', {
          user_id: user.id
        });
        
        if (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
        } else {
          setIsAdmin(!!data);
          
          // If admin, add the admin panel link
          if (!!data) {
            setNavItems([
              ...baseNavItems,
              { name: "Admin", href: "/dashboard/admin", icon: Shield },
            ]);
          } else {
            setNavItems(baseNavItems);
          }
        }
      } catch (error) {
        console.error("Error in checkIfAdmin:", error);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkIfAdmin();
  }, [supabase]);

  if (isLoading) {
    return (
      <div className="hidden border-r bg-background md:block md:w-64">
        <div className="flex h-full flex-col px-4">
          <div className="space-y-4 py-4">
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
      </div>
    );
  }

  return (
    <div className="hidden border-r bg-background md:block md:w-64">
      <div className="flex h-full flex-col px-4">
        <div className="space-y-4 py-4">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
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
      </div>
    </div>
  );
}