'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export type WhitelistedEmail = {
  id: string;
  email: string;
  created_at: string;
  notes: string | null;
  status: "active" | "inactive";
};

/**
 * Fetch all whitelisted emails
 */
export async function getWhitelistedEmails(): Promise<{
  data: WhitelistedEmail[] | null;
  error: Error | null;
}> {
  try {
    const supabase = await createClient();
    
    // Verify the user is an admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, error: new Error('Unauthorized') };
    }
    
    const { data: isAdmin } = await supabase.rpc('is_admin', {
      user_id: user.id
    });
    
    if (!isAdmin) {
      return { data: null, error: new Error('Unauthorized') };
    }
    
    // Fetch the data
    const { data, error } = await supabase
      .from("email_whitelist")
      .select("*")
      .order("created_at", { ascending: false });
      
    if (error) {
      throw error;
    }
    
    return { data, error: null };
  } catch (error) {
    console.error("Error fetching whitelist:", error);
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
}

/**
 * Add a new email to the whitelist
 */
export async function addEmailToWhitelist(formData: FormData): Promise<{
  success: boolean;
  error: Error | null;
}> {
  try {
    const email = formData.get('email') as string;
    const notes = formData.get('notes') as string;
    
    if (!email) {
      return { success: false, error: new Error('Email is required') };
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, error: new Error('Please enter a valid email address') };
    }
    
    const supabase = await createClient();
    
    // Verify the user is an admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: new Error('Unauthorized') };
    }
    
    const { data: isAdmin } = await supabase.rpc('is_admin', {
      user_id: user.id
    });
    
    if (!isAdmin) {
      return { success: false, error: new Error('Unauthorized') };
    }
    
    // Add the email
    const { error } = await supabase
      .from("email_whitelist")
      .insert([{ 
        email, 
        notes: notes || null,
        status: 'active' 
      }]);
      
    if (error) {
      throw error;
    }
    
    // Revalidate the admin page to show updated data
    revalidatePath('/dashboard/admin');
    
    return { success: true, error: null };
  } catch (error) {
    console.error("Error adding email to whitelist:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}

/**
 * Remove an email from the whitelist
 */
export async function removeEmailFromWhitelist(formData: FormData): Promise<{
  success: boolean;
  error: Error | null;
}> {
  try {
    const id = formData.get('id') as string;
    
    if (!id) {
      return { success: false, error: new Error('Email ID is required') };
    }
    
    const supabase = await createClient();
    
    // Verify the user is an admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: new Error('Unauthorized') };
    }
    
    const { data: isAdmin } = await supabase.rpc('is_admin', {
      user_id: user.id
    });
    
    if (!isAdmin) {
      return { success: false, error: new Error('Unauthorized') };
    }
    
    // Remove the email
    const { error } = await supabase
      .from("email_whitelist")
      .delete()
      .eq("id", id);
      
    if (error) {
      throw error;
    }
    
    // Revalidate the admin page to show updated data
    revalidatePath('/dashboard/admin');
    
    return { success: true, error: null };
  } catch (error) {
    console.error("Error removing email from whitelist:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}

/**
 * Update email status in the whitelist
 */
export async function updateEmailStatus(formData: FormData): Promise<{
  success: boolean;
  error: Error | null;
}> {
  try {
    const id = formData.get('id') as string;
    const status = formData.get('status') as "active" | "inactive";
    
    if (!id || !status) {
      return { success: false, error: new Error('ID and status are required') };
    }
    
    // Validate status
    if (status !== 'active' && status !== 'inactive') {
      return { success: false, error: new Error('Invalid status value') };
    }
    
    const supabase = await createClient();
    
    // Verify the user is an admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: new Error('Unauthorized') };
    }
    
    const { data: isAdmin } = await supabase.rpc('is_admin', {
      user_id: user.id
    });
    
    if (!isAdmin) {
      return { success: false, error: new Error('Unauthorized') };
    }
    
    // Update the email status
    const { error } = await supabase
      .from("email_whitelist")
      .update({ status })
      .eq("id", id);
      
    if (error) {
      throw error;
    }
    
    // Revalidate the admin page to show updated data
    revalidatePath('/dashboard/admin');
    
    return { success: true, error: null };
  } catch (error) {
    console.error("Error updating email status:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}