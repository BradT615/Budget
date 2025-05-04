// src/contexts/WhitelistContext.tsx
"use client";

import { createContext, useState, useEffect, useContext, ReactNode, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";

type WhitelistedEmail = {
  id: string;
  email: string;
  created_at: string;
  notes: string | null;
  status: "active" | "inactive";
};

type WhitelistContextType = {
  whitelistedEmails: WhitelistedEmail[];
  isLoading: boolean;
  error: string | null;
  addEmail: (email: string, notes?: string) => Promise<void>;
  removeEmail: (id: string) => Promise<void>;
  updateEmailStatus: (id: string, status: "active" | "inactive") => Promise<void>;
  refreshWhitelist: () => Promise<void>;
};

const WhitelistContext = createContext<WhitelistContextType | undefined>(undefined);

type ErrorWithMessage = {
  message: string;
  [key: string]: unknown;
};

export function WhitelistProvider({ children }: { children: ReactNode }) {
  const [whitelistedEmails, setWhitelistedEmails] = useState<WhitelistedEmail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  // Use useCallback to memoize the function so it doesn't change on every render
  const fetchWhitelistedEmails = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from("email_whitelist")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setWhitelistedEmails(data || []);
    } catch (err) {
      console.error("Error fetching whitelist:", err);
      setError(typeof err === 'object' && err !== null && 'message' in err 
        ? String((err as ErrorWithMessage).message) 
        : "Failed to fetch whitelisted emails");
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const addEmail = async (email: string, notes?: string) => {
    setError(null);
    
    try {
      const { error } = await supabase
        .from("email_whitelist")
        .insert([{ email, notes }]);
      
      if (error) throw error;
      await fetchWhitelistedEmails();
    } catch (err) {
      console.error("Error adding email to whitelist:", err);
      setError(typeof err === 'object' && err !== null && 'message' in err 
        ? String((err as ErrorWithMessage).message) 
        : "Failed to add email to whitelist");
      throw err;
    }
  };

  const removeEmail = async (id: string) => {
    setError(null);
    
    try {
      const { error } = await supabase
        .from("email_whitelist")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      await fetchWhitelistedEmails();
    } catch (err) {
      console.error("Error removing email from whitelist:", err);
      setError(typeof err === 'object' && err !== null && 'message' in err 
        ? String((err as ErrorWithMessage).message) 
        : "Failed to remove email from whitelist");
      throw err;
    }
  };

  const updateEmailStatus = async (id: string, status: "active" | "inactive") => {
    setError(null);
    
    try {
      const { error } = await supabase
        .from("email_whitelist")
        .update({ status })
        .eq("id", id);
      
      if (error) throw error;
      await fetchWhitelistedEmails();
    } catch (err) {
      console.error("Error updating email status:", err);
      setError(typeof err === 'object' && err !== null && 'message' in err 
        ? String((err as ErrorWithMessage).message) 
        : "Failed to update email status");
      throw err;
    }
  };

  // Use the fetchWhitelistedEmails function for refreshWhitelist
  const refreshWhitelist = fetchWhitelistedEmails;

  useEffect(() => {
    // Now we can include fetchWhitelistedEmails in the dependency array
    // without causing infinite rerenders because it's memoized with useCallback
    fetchWhitelistedEmails();
  }, [fetchWhitelistedEmails]);

  return (
    <WhitelistContext.Provider
      value={{
        whitelistedEmails,
        isLoading,
        error,
        addEmail,
        removeEmail,
        updateEmailStatus,
        refreshWhitelist
      }}
    >
      {children}
    </WhitelistContext.Provider>
  );
}

export function useWhitelist() {
  const context = useContext(WhitelistContext);
  if (context === undefined) {
    throw new Error("useWhitelist must be used within a WhitelistProvider");
  }
  return context;
}