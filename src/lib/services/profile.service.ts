import { createClient } from "@/lib/supabase/server";
import { ErrorCode } from "@/lib/constants/errors";

export interface Profile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface ProfileError {
  code: ErrorCode;
  message: string;
}

export class ProfileService {
  static async getProfile(): Promise<Profile | ProfileError> {
    try {
      const supabase = await createClient();

      // Get current user
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        return {
          code: ErrorCode.UNAUTHORIZED,
          message: "Not authenticated",
        };
      }

      // Get profile
      const { data: profile, error: _fetchError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authUser.id)
        .single();

      if (!profile) {
        return {
          code: ErrorCode.ENTITY_NOT_FOUND,
          message: "Profile not found",
        };
      }

      return {
        id: profile.id,
        email: authUser.email || "",
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone,
        role: profile.role,
        status: profile.status,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      };
    } catch {
      return {
        code: ErrorCode.INTERNAL_ERROR,
        message: "Failed to fetch profile",
      };
    }
  }

  static async updateProfile(
    firstName?: string,
    lastName?: string,
    phone?: string | null
  ): Promise<Profile | ProfileError> {
    try {
      const supabase = await createClient();

      // Get current user
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (!authUser) {
        return {
          code: ErrorCode.UNAUTHORIZED,
          message: "Not authenticated",
        };
      }

      // Build update object - only include provided fields
      const updates: Record<string, string | null> = {};
      if (firstName !== undefined) updates.first_name = firstName;
      if (lastName !== undefined) updates.last_name = lastName;
      if (phone !== undefined) updates.phone = phone || null;

      // Update profile
      const { data: profile, error: _updateError } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", authUser.id)
        .select()
        .single();

      if (!profile) {
        return {
          code: ErrorCode.INTERNAL_ERROR,
          message: "Failed to update profile",
        };
      }

      return {
        id: profile.id,
        email: authUser.email || "",
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone,
        role: profile.role,
        status: profile.status,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      };
    } catch {
      return {
        code: ErrorCode.INTERNAL_ERROR,
        message: "Failed to update profile",
      };
    }
  }
}
