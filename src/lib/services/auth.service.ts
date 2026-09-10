import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { ErrorCode } from "@/lib/constants/errors";

interface AuthResponse {
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone: string | null;
    role: string;
    status: string;
  };
  token?: string;
}

interface AuthError {
  code: ErrorCode;
  message: string;
}

export class AuthService {
  static async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<AuthResponse | AuthError> {
    try {
      const supabase = createAdminClient();

      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      if (authError) {
        if (authError.message.includes("already registered")) {
          return {
            code: ErrorCode.DUPLICATE_EMAIL,
            message: "Email already registered",
          };
        }
        return {
          code: ErrorCode.AUTH_INVALID_CREDENTIALS,
          message: "Registration failed",
        };
      }

      if (!authData.user) {
        return {
          code: ErrorCode.INTERNAL_ERROR,
          message: "User creation failed",
        };
      }

      // Trigger will auto-create profile, but we can query it
      const { data: profile, error: _profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authData.user.id)
        .single();

      if (!profile) {
        return {
          code: ErrorCode.INTERNAL_ERROR,
          message: "Profile creation failed",
        };
      }

      return {
        user: {
          id: profile.id,
          email: authData.user.email || "",
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone: profile.phone,
          role: profile.role,
          status: profile.status,
        },
      };
    } catch (error) {
      return {
        code: ErrorCode.INTERNAL_ERROR,
        message: "Registration failed",
      };
    }
  }

  static async login(
    email: string,
    password: string
  ): Promise<AuthResponse | AuthError> {
    try {
      const supabase = createAdminClient();

      // Sign in with email/password
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        return {
          code: ErrorCode.AUTH_INVALID_CREDENTIALS,
          message: "Invalid credentials",
        };
      }

      if (!authData.user) {
        return {
          code: ErrorCode.AUTH_INVALID_CREDENTIALS,
          message: "Invalid credentials",
        };
      }

      // Get profile
      const { data: profile, error: _profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authData.user.id)
        .single();

      if (!profile) {
        return {
          code: ErrorCode.ENTITY_NOT_FOUND,
          message: "Profile not found",
        };
      }

      // Check account status
      if (profile.status === "DISABLED") {
        return {
          code: ErrorCode.ACCOUNT_DISABLED,
          message: "Account is disabled",
        };
      }

      if (profile.status === "LOCKED") {
        return {
          code: ErrorCode.ACCOUNT_LOCKED,
          message: "Account is locked",
        };
      }

      return {
        user: {
          id: profile.id,
          email: authData.user.email || "",
          first_name: profile.first_name,
          last_name: profile.last_name,
          phone: profile.phone,
          role: profile.role,
          status: profile.status,
        },
        token: authData.session?.access_token,
      };
    } catch (error) {
      return {
        code: ErrorCode.INTERNAL_ERROR,
        message: "Login failed",
      };
    }
  }

  static async logout(): Promise<void | AuthError> {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        return {
          code: ErrorCode.INTERNAL_ERROR,
          message: "Logout failed",
        };
      }
    } catch {
      return {
        code: ErrorCode.INTERNAL_ERROR,
        message: "Logout failed",
      };
    }
  }

  static async forgotPassword(email: string): Promise<{ message: string } | AuthError> {
    try {
      const supabase = createAdminClient();

      // Always return success message (security: don't reveal if email exists)
      // In production, send reset email via Supabase Auth or custom email service
      // For MVP, token would be generated and sent
      await supabase
        .from("profiles")
        .select("id")
        .eq("email", email)
        .single();

      return {
        message: "Check your email for reset link",
      };
    } catch {
      // Still return success message even on error
      return {
        message: "Check your email for reset link",
      };
    }
  }

  static async resetPassword(
    _token: string,
    _password: string
  ): Promise<{ message: string } | AuthError> {
    // In MVP, this would:
    // 1. Validate token from custom table or Supabase Auth recovery
    // 2. Update password
    // For now, return error - proper implementation depends on token storage

    return {
      code: ErrorCode.RESET_TOKEN_INVALID,
      message: "Invalid or expired reset token",
    };
  }

  static async getCurrentUser(): Promise<AuthResponse["user"] | AuthError> {
    try {
      const supabase = await createClient();

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
      const { data: profile, error: _profileError } = await supabase
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
      };
    } catch {
      return {
        code: ErrorCode.INTERNAL_ERROR,
        message: "Failed to fetch user",
      };
    }
  }
}
