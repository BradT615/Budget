// src/app/dashboard/expenses/actions/expenses.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { Database } from '@/types/supabase'

export type Expense = Database['public']['Tables']['expenses']['Row'];
export type ExpenseInsert = Database['public']['Tables']['expenses']['Insert'];
export type ExpenseUpdate = Database['public']['Tables']['expenses']['Update'];

/**
 * Fetch all expenses for a user
 */
export async function getExpenses(): Promise<{
  data: Expense[] | null;
  error: Error | null;
}> {
  try {
    const supabase = await createClient();
    
    // Verify the user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: new Error('Unauthorized') };
    }
    
    // Fetch the data (Row Level Security will ensure we only get this user's expenses)
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .order("date", { ascending: false });
      
    if (error) {
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}

/**
 * Add a new expense
 */
export async function addExpense(formData: FormData): Promise<{
  success: boolean;
  error: Error | null;
}> {
  try {
    const description = formData.get('description') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const date = formData.get('date') as string;
    
    if (!description || isNaN(amount) || !date) {
      return { 
        success: false, 
        error: new Error('Description, amount, and date are required') 
      };
    }
    
    const supabase = await createClient();
    
    // Verify the user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: new Error('Unauthorized') };
    }
    
    // Add the expense
    const { error } = await supabase
      .from("expenses")
      .insert([{ 
        user_id: user.id, 
        description,
        amount,
        date
      }]);
      
    if (error) {
      throw error;
    }
    
    // Revalidate the expenses page to show updated data
    revalidatePath('/dashboard/expenses');
    // Also revalidate the dashboard page since it shows recent transactions
    revalidatePath('/dashboard');
    
    return { success: true, error: null };
  } catch (error) {
    console.error("Error adding expense:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}

/**
 * Update an existing expense
 */
export async function updateExpense(formData: FormData): Promise<{
  success: boolean;
  error: Error | null;
}> {
  try {
    const id = formData.get('id') as string;
    const description = formData.get('description') as string;
    const amount = parseFloat(formData.get('amount') as string);
    const date = formData.get('date') as string;
    
    if (!id || !description || isNaN(amount) || !date) {
      return { 
        success: false, 
        error: new Error('ID, description, amount, and date are required') 
      };
    }
    
    const supabase = await createClient();
    
    // Verify the user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: new Error('Unauthorized') };
    }
    
    // RLS will ensure users can only update their own expenses
    const { error } = await supabase
      .from("expenses")
      .update({ 
        description,
        amount,
        date
      })
      .eq("id", id)
      .eq("user_id", user.id);
      
    if (error) {
      throw error;
    }
    
    // Revalidate the expenses page to show updated data
    revalidatePath('/dashboard/expenses');
    // Also revalidate the dashboard page since it shows recent transactions
    revalidatePath('/dashboard');
    
    return { success: true, error: null };
  } catch (error) {
    console.error("Error updating expense:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}

/**
 * Delete an expense
 */
export async function deleteExpense(formData: FormData): Promise<{
  success: boolean;
  error: Error | null;
}> {
  try {
    const id = formData.get('id') as string;
    
    if (!id) {
      return { success: false, error: new Error('Expense ID is required') };
    }
    
    const supabase = await createClient();
    
    // Verify the user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: new Error('Unauthorized') };
    }
    
    // RLS will ensure users can only delete their own expenses
    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);
      
    if (error) {
      throw error;
    }
    
    // Revalidate the expenses page to show updated data
    revalidatePath('/dashboard/expenses');
    // Also revalidate the dashboard page since it shows recent transactions
    revalidatePath('/dashboard');
    
    return { success: true, error: null };
  } catch (error) {
    console.error("Error deleting expense:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}