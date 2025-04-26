'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export type AdminUser = {
  user_id: string;
  created_at: string;
  user_email?: string;
};

/**
 * Fetch all admin users
 */
export async function getAdminUsers(): Promise<{
  data: AdminUser[] | null;
  currentUserId: string | null;
  error: Error | null;
}> {
  try {
    const supabase = await createClient();
    
    // Verify the user is an admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { data: null, currentUserId: null, error: new Error('Unauthorized') };
    }
    
    const { data: isAdmin } = await supabase.rpc('is_admin', {
      user_id: user.id
    });
    
    if (!isAdmin) {
      return { data: null, currentUserId: null, error: new Error('Unauthorized') };
    }
    
    // Fetch the data
    const { data: adminData, error: adminError } = await supabase
      .from("admin_users")
      .select("*")
      .order("created_at", { ascending: false });
      
    if (adminError) {
      throw adminError;
    }
    
    // For each admin user, fetch their email from auth.users
    // In a real app, you'd implement a proper RPC function to get user emails
    // This is just a placeholder
    const adminsWithEmail = (adminData || []).map((admin) => {
      return {
        ...admin,
        user_email: "admin user", // In real app, fetch actual email
      };
    });
    
    return { 
      data: adminsWithEmail, 
      currentUserId: user.id,
      error: null 
    };
  } catch (error) {
    console.error("Error fetching admin users:", error);
    return { 
      data: null, 
      currentUserId: null,
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}

/**
 * Add a new admin user
 */
export async function addAdminUser(formData: FormData): Promise<{
  success: boolean;
  error: Error | null;
}> {
  try {
    const email = formData.get('email') as string;
    
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
    
    // First, find the user by email in whitelist
    const { data: userData, error: userError } = await supabase
      .from("email_whitelist")
      .select("email")
      .eq("email", email)
      .maybeSingle();
    
    if (userError) {
      throw userError;
    }
    
    if (!userData) {
      return { 
        success: false, 
        error: new Error('This email is not in the whitelist. Please add it to the whitelist first.') 
      };
    }
    
    // For a real app, you'd implement a proper RPC function to get user ID from email
    // This is simplified - in a real app you'd need to access auth.users through an RPC
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      throw authError;
    }
    
    const targetUser = authData?.users?.find(u => u.email === email);
    
    if (!targetUser) {
      return { 
        success: false, 
        error: new Error('User not found. Make sure they have signed up first.') 
      };
    }
    
    // Add the user to admin_users
    const { error: insertError } = await supabase
      .from("admin_users")
      .insert([{ 
        user_id: targetUser.id, 
        created_by: user.id 
      }]);
    
    if (insertError) {
      throw insertError;
    }
    
    // Revalidate the admin page to show updated data
    revalidatePath('/dashboard/admin');
    
    return { success: true, error: null };
  } catch (error) {
    console.error("Error adding admin user:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}

/**
 * Remove an admin user
 */
export async function removeAdminUser(formData: FormData): Promise<{
  success: boolean;
  error: Error | null;
}> {
  try {
    const userId = formData.get('userId') as string;
    
    if (!userId) {
      return { success: false, error: new Error('User ID is required') };
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
    
    // Prevent removing yourself
    if (userId === user.id) {
      return { success: false, error: new Error('You cannot remove yourself as an admin.') };
    }
    
    // Remove the admin user
    const { error: deleteError } = await supabase
      .from("admin_users")
      .delete()
      .eq("user_id", userId);
      
    if (deleteError) {
      throw deleteError;
    }
    
    // Revalidate the admin page to show updated data
    revalidatePath('/dashboard/admin');
    
    return { success: true, error: null };
  } catch (error) {
    console.error("Error removing admin user:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}