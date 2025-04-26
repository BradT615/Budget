'use client';

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, UserPlus } from "lucide-react";
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
import { 
  AdminUser, 
  addAdminUser, 
  removeAdminUser 
} from "../actions/admin-users";
import { useRouter } from "next/navigation";

interface AdminUsersManagerClientProps {
  adminUsers: AdminUser[];
  currentUserId: string;
}

export default function AdminUsersManagerClient({ 
  adminUsers, 
  currentUserId 
}: AdminUsersManagerClientProps) {
  const [error, setError] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const router = useRouter();

  const handleAddUser = async (formData: FormData) => {
    setAddError(null);

    // Client-side validation
    const email = formData.get('email') as string;
    if (!email) {
      setAddError("Email is required");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setAddError("Please enter a valid email address");
      return;
    }

    const result = await addAdminUser(formData);
    if (!result.success) {
      setAddError(result.error?.message || "Failed to add admin user");
      return;
    }

    // Success
    setIsAddDialogOpen(false);
    router.refresh();
  };

  const handleRemoveUser = async (userId: string) => {
    setError(null);
    
    // Client-side validation to prevent removing yourself
    if (userId === currentUserId) {
      setError("You cannot remove yourself as an admin.");
      return;
    }
    
    const formData = new FormData();
    formData.append('userId', userId);
    
    const result = await removeAdminUser(formData);
    if (!result.success) {
      setError(result.error?.message || "Failed to remove admin user");
      return;
    }
    
    router.refresh();
  };

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
            <form action={handleAddUser} className="space-y-4 py-4">
              {addError && (
                <div className="text-red-600 text-sm">{addError}</div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">User Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@example.com"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Note: The user must have already signed up and be in the whitelist.
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <DialogClose asChild>
                  <Button type="button" variant="outline">Cancel</Button>
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
        
        {adminUsers.length === 0 ? (
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
                    {admin.user_id === currentUserId && " (You)"}
                  </TableCell>
                  <TableCell>
                    {new Date(admin.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      {admin.user_id !== currentUserId && (
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
                                onClick={() => handleRemoveUser(admin.user_id)}
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