
import { supabase } from "@/integrations/supabase/client";

// Helper function to find existing user in auth by email
export const findExistingAuthUser = async (email: string) => {
  // We can't directly query auth.users, but we can check if user exists by trying to sign them up
  // If they exist, we'll get a specific error that we can catch
  return null; // We'll handle this in the signup attempt
};

// Helper function to find existing user ID by email from company_users
export const findExistingCompanyUser = async (email: string) => {
  const { data: existingUser, error } = await supabase
    .from("company_users")
    .select("auth_user_id, company_id, is_active")
    .eq("email", email)
    .single();

  if (!error && existingUser) {
    return existingUser;
  }

  return null;
};
