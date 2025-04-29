// src/app/dashboard/income/actions/income.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { Database } from '@/types/supabase'

export type Income = Database['public']['Tables']['income']['Row'];
export type IncomeInsert = Database['public']['Tables']['income']['Insert'];
export type IncomeUpdate = Database['public']['Tables']['income']['Update'];

/**
 * Fetch all income entries for a user
 */
export async function getIncomes(): Promise<{
  data: Income[] | null;
  error: Error | null;
}> {
  try {
    const supabase = await createClient();
    
    // Verify the user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: new Error('Unauthorized') };
    }
    
    // Fetch the data (Row Level Security will ensure we only get this user's income entries)
    const { data, error } = await supabase
      .from("income")
      .select("*")
      .order("date", { ascending: false });
      
    if (error) {
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error("Error fetching income entries:", error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}

/**
 * Add a new income entry
 */
export async function addIncome(formData: FormData): Promise<{
  success: boolean;
  error: Error | null;
}> {
  try {
    const source = formData.get('source') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const date = formData.get('date') as string;
    
    if (!source || isNaN(amount) || !date) {
      return { 
        success: false, 
        error: new Error('Source, amount, and date are required') 
      };
    }
    
    const supabase = await createClient();
    
    // Verify the user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: new Error('Unauthorized') };
    }
    
    // Add the income entry
    const { error } = await supabase
      .from("income")
      .insert([{ 
        user_id: user.id, 
        source,
        amount,
        date
      }]);
      
    if (error) {
      throw error;
    }
    
    // Revalidate the income page to show updated data
    revalidatePath('/dashboard/income');
    // Also revalidate the dashboard page since it shows recent transactions
    revalidatePath('/dashboard');
    
    return { success: true, error: null };
  } catch (error) {
    console.error("Error adding income:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}

/**
 * Update an existing income entry
 */
export async function updateIncome(formData: FormData): Promise<{
  success: boolean;
  error: Error | null;
}> {
  try {
    const id = formData.get('id') as string;
    const source = formData.get('source') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const date = formData.get('date') as string;
    
    if (!id || !source || isNaN(amount) || !date) {
      return { 
        success: false, 
        error: new Error('ID, source, amount, and date are required') 
      };
    }
    
    const supabase = await createClient();
    
    // Verify the user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: new Error('Unauthorized') };
    }
    
    // RLS will ensure users can only update their own income entries
    const { error } = await supabase
      .from("income")
      .update({ 
        source,
        amount,
        date
      })
      .eq("id", id)
      .eq("user_id", user.id);
      
    if (error) {
      throw error;
    }
    
    // Revalidate the income page to show updated data
    revalidatePath('/dashboard/income');
    // Also revalidate the dashboard page since it shows recent transactions
    revalidatePath('/dashboard');
    
    return { success: true, error: null };
  } catch (error) {
    console.error("Error updating income:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}

/**
 * Delete an income entry
 */
export async function deleteIncome(formData: FormData): Promise<{
  success: boolean;
  error: Error | null;
}> {
  try {
    const id = formData.get('id') as string;
    
    if (!id) {
      return { success: false, error: new Error('Income ID is required') };
    }
    
    const supabase = await createClient();
    
    // Verify the user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: new Error('Unauthorized') };
    }
    
    // RLS will ensure users can only delete their own income entries
    const { error } = await supabase
      .from("income")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);
      
    if (error) {
      throw error;
    }
    
    // Revalidate the income page to show updated data
    revalidatePath('/dashboard/income');
    // Also revalidate the dashboard page since it shows recent transactions
    revalidatePath('/dashboard');
    
    return { success: true, error: null };
  } catch (error) {
    console.error("Error deleting income:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}