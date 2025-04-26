import { getWhitelistedEmails } from "../actions/whitelist";
import EmailWhitelistManagerClient from "./email-whitelist-manager-client";

export default async function EmailWhitelistManager() {
  // Fetch whitelisted emails server-side
  const { data, error } = await getWhitelistedEmails();
  
  if (error) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded-md">
        Error loading whitelist: {error.message}
      </div>
    );
  }
  
  // Pass data to client component
  return <EmailWhitelistManagerClient emails={data || []} />;
}