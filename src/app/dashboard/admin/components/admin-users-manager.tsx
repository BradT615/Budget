import { getAdminUsers } from "../actions/admin-users";
import AdminUsersManagerClient from "./admin-users-manager-client";

export default async function AdminUsersManager() {
  // Fetch admin users server-side
  const { data, currentUserId, error } = await getAdminUsers();
  
  if (error) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded-md">
        Error loading admin users: {error.message}
      </div>
    );
  }
  
  if (!currentUserId) {
    return (
      <div className="bg-yellow-100 text-yellow-700 p-4 rounded-md">
        Not authorized to view admin users.
      </div>
    );
  }
  
  // Pass data to client component
  return (
    <AdminUsersManagerClient 
      adminUsers={data || []} 
      currentUserId={currentUserId} 
    />
  );
}