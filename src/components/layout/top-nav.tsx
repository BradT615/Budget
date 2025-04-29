"use client";

import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, Settings, LogOut, Paintbrush } from "lucide-react";
import { ThemeToggle } from "../theme-toggle";

interface TopNavProps {
  toggleSidebar?: () => void;
}

export default function TopNav({ toggleSidebar }: TopNavProps) {
  const router = useRouter();
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    // Check if mobile
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh(); // Refresh the page to update auth state
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user || !user.email) return "?";
    return user.email
      .split("@")[0]
      .split(".")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="border-b">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          {isMobile && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={toggleSidebar}
              className="md:hidden"
            >
              <Menu className="scale-125" />
            </Button>
          )}
          <Image 
            src="/icon.svg" 
            alt="Budget Tracker Logo" 
            width={32} 
            height={32} 
          />
          <span className="text-lg font-semibold">Budget Tracker</span>
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.user_metadata?.avatar_url} alt="User" />
                    <AvatarFallback className="bg-primary/10 text-foreground font-medium">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                {/* User Info */}
                <div className="px-4 py-3">
                  <p className="font-medium text-sm">Account</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user.email || "user@example.com"}
                  </p>
                </div>
                
                <DropdownMenuSeparator />
                
                {/* Account Settings */}
                <DropdownMenuItem 
                  className="py-2 cursor-pointer hover:bg-accent"
                  onClick={() => router.push('/dashboard/settings')}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Account Settings
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                {/* Theme Toggle */}
                <div className="p-1">
                  <div className="flex items-center px-2 py-1.5 text-sm">
                    <Paintbrush className="mr-2 h-4 w-4" />
                    <span>Theme</span>
                    <ThemeToggle className="ml-auto" />
                  </div>
                </div>
                
                <DropdownMenuSeparator />
                
                {/* Logout */}
                <DropdownMenuItem 
                  className="py-2 cursor-pointer flex items-center hover:bg-accent"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  );
}