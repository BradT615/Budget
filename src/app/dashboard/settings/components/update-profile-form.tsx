// src/app/dashboard/settings/components/update-profile-form.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateProfile } from "../actions/settings";
import { User } from "@supabase/supabase-js";

interface UpdateProfileFormProps {
  user: User;
}

export default function UpdateProfileForm({ user }: UpdateProfileFormProps) {
  const [fullName, setFullName] = useState(user.user_metadata?.full_name || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    
    if (!fullName.trim()) {
      setError("Display name is required");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('fullName', fullName);
      
      const result = await updateProfile(formData);
      
      if (!result.success) {
        setError(result.error?.message || "Failed to update profile");
        return;
      }
      
      // Success
      setSuccess(true);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm font-medium border border-red-200">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm font-medium border border-green-200">
          Profile updated successfully!
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={user.email || ''}
          disabled
          className="bg-muted"
        />
        <p className="text-sm text-muted-foreground">
          Email cannot be changed
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="fullName">Display Name</Label>
        <Input
          id="fullName"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Your Name"
          disabled={isSubmitting}
        />
      </div>
      
      <Button 
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}