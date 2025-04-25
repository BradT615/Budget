"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, UserPlus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type AdminUser = {
  user_id: string;
  created_at: string;
  user_email?: string; // This will be fetched separately
};

export default function AdminUsersManager({ currentAdmin }: { currentAdmin: string }) {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  
  const supabase = createClient();

  const fetchAdminUsers = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch admin users from the admin_users table
      const { data: adminData, error: adminError } = await supabase
        .from("admin_users")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (adminError) throw adminError;
      
      // For each admin user, fetch their email from auth.users
      const adminsWithEmail = await Promise.all(
        (adminData || []).map(async (admin) => {
          try {
            // We can't directly query auth.users, so we'll use a custom RPC function
            // For now, we'll leave the email blank - in a real app you'd implement an RPC function
            return {
              ...admin,
              user_email: "admin user", // Placeholder - in a real app you'd fetch the actual email
            };
          } catch (e) {
            return {
              ...admin,
              user_email: "Could not fetch email",
            };
          }
        })
      );
      
      setAdminUsers(adminsWithEmail);
    } catch (err: any) {
      console.error("Error fetching admin users:", err);
      setError(err.message || "Failed to fetch admin users");
    } finally {
      setIsLoading(false);
    }
  };

  const addAdminUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    
    if (!newUserEmail) {
      setAddError("Email is required");
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUserEmail)) {
      setAddError("Please enter a valid email address");
      return;
    }
    
    try {
      // First, find the user by email
      const { data: userData, error: userError } = await supabase
        .from("email_whitelist")
        .select("email")
        .eq("email", newUserEmail)
        .maybeSingle();
      
      if (userError) throw userError;
      
      if (!userData) {
        setAddError("This email is not in the whitelist. Please add it to the whitelist first.");
        return;
      }
      
      // Now get the auth user ID for this email
      const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) throw authError;
      
      const user = authData?.users?.find(u => u.email === newUserEmail);
      
      if (!user) {
        setAddError("User not found. Make sure they have signed up first.");
        return;
      }
      
      // Finally, add the user to admin_users
      const { error: insertError } = await supabase
        .from("admin_users")
        .insert([{ user_id: user.id, created_by: currentAdmin }]);
      
      if (insertError) throw insertError;
      
      // Refresh the list
      fetchAdminUsers();
      setNewUserEmail("");
      setIsAddDialogOpen(false);
    } catch (err: any) {
      console.error("Error adding admin user:", err);
      setAddError(err.message || "Failed to add admin user");
    }
  };
  
  const removeAdminUser = async (userId: string) => {
    // Prevent removing yourself
    if (userId === currentAdmin) {
      setError("You cannot remove yourself as an admin.");
      return;
    }
    
    try {
      const { error: deleteError } = await supabase
        .from("admin_users")
        .delete()
        .eq("user_id", userId);
      
      if (deleteError) throw deleteError;
      
      // Refresh the list
      fetchAdminUsers();
    } catch (err: any) {
      console.error("Error removing admin user:", err);
      setError(err.message || "Failed to remove admin user");
    }
  };

  useEffect(() => {
    fetchAdminUsers();
  }, []);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Admin Users</CardTitle>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Add Admin
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Admin User</DialogTitle>
            </DialogHeader>
            <form onSubmit={addAdminUser} className="space-y-4 py-4">
              {addError && (
                <div className="text-red-600 text-sm">{addError}</div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">User Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Note: The user must have already signed up and be in the whitelist.
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="submit">Add Admin</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
            Error: {error}
          </div>
        )}
        
        {isLoading ? (
          <div className="text-center py-4">Loading...</div>
        ) : adminUsers.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No admin users found. Add your first admin to get started.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Added On</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adminUsers.map((admin) => (
                <TableRow key={admin.user_id}>
                  <TableCell className="font-medium">
                    {admin.user_email || admin.user_id}
                    {admin.user_id === currentAdmin && " (You)"}
                  </TableCell>
                  <TableCell>
                    {new Date(admin.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      {admin.user_id !== currentAdmin && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Remove Admin"
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Remove Admin Privileges
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove admin privileges from this user?
                                They will no longer have access to the admin panel.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-red-600 hover:bg-red-700"
                                onClick={() => removeAdminUser(admin.user_id)}
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}