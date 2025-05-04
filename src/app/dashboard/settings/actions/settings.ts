// src/app/dashboard/settings/actions/settings.ts
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
// import { redirect } from 'next/navigation' - Removing unused import

/**
 * Update user display name
 */
export async function updateProfile(formData: FormData): Promise<{
  success: boolean;
  error: Error | null;
}> {
  try {
    const fullName = formData.get('fullName') as string;
    
    if (!fullName || fullName.trim() === '') {
      return { 
        success: false, 
        error: new Error('Display name is required') 
      };
    }
    
    const supabase = await createClient();
    
    // Verify the user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: new Error('Unauthorized') };
    }
    
    // Update the user metadata
    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName }
    });
      
    if (error) {
      throw error;
    }
    
    // Revalidate the settings page to show updated data
    revalidatePath('/dashboard/settings');
    
    return { success: true, error: null };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}

/**
 * Mark account for deletion
 */
export async function markAccountForDeletion(): Promise<{
  success: boolean;
  error: Error | null;
}> {
  try {
    const supabase = await createClient();
    
    // Verify the user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: new Error('Unauthorized') };
    }
    
    // Create a record in a dedicated accounts_pending_deletion table
    const { error: insertError } = await supabase
      .from("accounts_pending_deletion")
      .insert([{ 
        user_id: user.id,
        email: user.email,
        requested_at: new Date().toISOString()
      }]);
    
    if (insertError) {
      throw insertError;
    }
    
    // Update the user's metadata to mark them for deletion
    const { error: updateError } = await supabase.auth.updateUser({
      data: { 
        marked_for_deletion: true,
        deletion_requested_at: new Date().toISOString()
      }
    });
      
    if (updateError) {
      throw updateError;
    }
    
    // Sign the user out - do this last
    await supabase.auth.signOut();
    
    // We don't actually need to redirect here since the middleware
    // would normally redirect to /login, but we want to go to our custom page
    return { success: true, error: null };
  } catch (error) {
    console.error("Error marking account for deletion:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error('Unknown error') 
    };
  }
}