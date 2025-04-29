// src/app/dashboard/savings/actions/savings-goals.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { Database } from '@/types/supabase'

export type SavingsGoal = Database['public']['Tables']['savings_goals']['Row'];
export type SavingsGoalInsert = Database['public']['Tables']['savings_goals']['Insert'];
export type SavingsGoalUpdate = Database['public']['Tables']['savings_goals']['Update'];

/**
 * Fetch all savings goals for a user
 */
export async function getSavingsGoals(): Promise<{
  data: SavingsGoal[] | null;
  error: Error | null;
}> {
  try {
    const supabase = await createClient();
    
    // Verify the user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: new Error('Unauthorized') };
    }
    
    // Fetch the data (Row Level Security will ensure we only get this user's savings goals)
    const { data, error } = await supabase
      .from("savings_goals")
      .select("*")
      .order("created_at", { ascending: false });
      
    if (error) {
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error("Error fetching savings goals:", error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}

/**
 * Add a new savings goal
 */
export async function addSavingsGoal(formData: FormData): Promise<{
  success: boolean;
  error: Error | null;
}> {
  try {
    const name = formData.get('name') as string;
    const targetAmount = parseFloat(formData.get('targetAmount') as string);
    const currentAmount = parseFloat(formData.get('currentAmount') as string || '0');
    const targetDate = formData.get('targetDate') as string || null;
    
    if (!name || isNaN(targetAmount)) {
      return { 
        success: false, 
        error: new Error('Name and target amount are required') 
      };
    }
    
    const supabase = await createClient();
    
    // Verify the user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: new Error('Unauthorized') };
    }
    
    // Add the savings goal
    const { error } = await supabase
      .from("savings_goals")
      .insert([{ 
        user_id: user.id, 
        name,
        target_amount: targetAmount,
        current_amount: isNaN(currentAmount) ? 0 : currentAmount,
        target_date: targetDate
      }]);
      
    if (error) {
      throw error;
    }
    
    // Revalidate the savings page to show updated data
    revalidatePath('/dashboard/savings');
    
    return { success: true, error: null };
  } catch (error) {
    console.error("Error adding savings goal:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}

/**
 * Update an existing savings goal
 */
export async function updateSavingsGoal(formData: FormData): Promise<{
  success: boolean;
  error: Error | null;
}> {
  try {
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const targetAmount = parseFloat(formData.get('targetAmount') as string);
    const currentAmount = parseFloat(formData.get('currentAmount') as string || '0');
    const targetDate = formData.get('targetDate') as string || null;
    
    if (!id || !name || isNaN(targetAmount)) {
      return { 
        success: false, 
        error: new Error('ID, name, and target amount are required') 
      };
    }
    
    const supabase = await createClient();
    
    // Verify the user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: new Error('Unauthorized') };
    }
    
    // RLS will ensure users can only update their own savings goals
    const { error } = await supabase
      .from("savings_goals")
      .update({ 
        name,
        target_amount: targetAmount,
        current_amount: isNaN(currentAmount) ? 0 : currentAmount,
        target_date: targetDate
      })
      .eq("id", id)
      .eq("user_id", user.id);
      
    if (error) {
      throw error;
    }
    
    // Revalidate the savings page to show updated data
    revalidatePath('/dashboard/savings');
    
    return { success: true, error: null };
  } catch (error) {
    console.error("Error updating savings goal:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}

/**
 * Delete a savings goal
 */
export async function deleteSavingsGoal(formData: FormData): Promise<{
  success: boolean;
  error: Error | null;
}> {
  try {
    const id = formData.get('id') as string;
    
    if (!id) {
      return { success: false, error: new Error('Savings goal ID is required') };
    }
    
    const supabase = await createClient();
    
    // Verify the user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: new Error('Unauthorized') };
    }
    
    // RLS will ensure users can only delete their own savings goals
    const { error } = await supabase
      .from("savings_goals")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);
      
    if (error) {
      throw error;
    }
    
    // Revalidate the savings page to show updated data
    revalidatePath('/dashboard/savings');
    
    return { success: true, error: null };
  } catch (error) {
    console.error("Error deleting savings goal:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}