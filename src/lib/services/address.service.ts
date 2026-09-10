import { createClient } from "@/lib/supabase/server";
import { ErrorCode } from "@/lib/constants/errors";

export interface Address {
  id: string;
  label: string;
  full_name: string;
  phone: string;
  line1: string;
  line2: string | null;
  suburb: string;
  state: string;
  postcode: string;
  country: string;
  is_default: boolean;
  created_at: string;
}

interface AddressError {
  code: ErrorCode;
  message: string;
}

export class AddressService {
  static async getAddresses(): Promise<Address[] | AddressError> {
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

      const { data: addresses, error: _fetchError } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", authUser.id)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false });

      return addresses || [];
    } catch {
      return {
        code: ErrorCode.INTERNAL_ERROR,
        message: "Failed to fetch addresses",
      };
    }
  }

  static async createAddress(
    label: string,
    fullName: string,
    phone: string,
    line1: string,
    line2: string | null,
    suburb: string,
    state: string,
    postcode: string,
    isDefault: boolean = false
  ): Promise<Address | AddressError> {
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

      // If setting as default, unset previous default
      if (isDefault) {
        const { error: _updateError } = await supabase
          .from("addresses")
          .update({ is_default: false })
          .eq("user_id", authUser.id)
          .eq("is_default", true);

        if (_updateError) {
          return {
            code: ErrorCode.INTERNAL_ERROR,
            message: "Failed to update default address",
          };
        }
      }

      // Create address
      const { data: address, error: _createError } = await supabase
        .from("addresses")
        .insert({
          user_id: authUser.id,
          label,
          full_name: fullName,
          phone,
          line1,
          line2,
          suburb,
          state,
          postcode,
          country: "AU",
          is_default: isDefault,
        })
        .select()
        .single();

      if (!address) {
        return {
          code: ErrorCode.INTERNAL_ERROR,
          message: "Failed to create address",
        };
      }

      return address;
    } catch {
      return {
        code: ErrorCode.INTERNAL_ERROR,
        message: "Failed to create address",
      };
    }
  }

  static async updateAddress(
    addressId: string,
    updates: Partial<Omit<Address, "id" | "user_id" | "country" | "created_at">>
  ): Promise<Address | AddressError> {
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

      // Verify ownership
      const { data: existing, error: _fetchError } = await supabase
        .from("addresses")
        .select("id, user_id, is_default")
        .eq("id", addressId)
        .single();

      if (!existing) {
        return {
          code: ErrorCode.ADDRESS_NOT_FOUND,
          message: "Address not found",
        };
      }

      if (existing.user_id !== authUser.id) {
        return {
          code: ErrorCode.FORBIDDEN,
          message: "Cannot access this address",
        };
      }

      // If setting as default, unset previous default
      if (updates.is_default && !existing.is_default) {
        const { error: _updateError } = await supabase
          .from("addresses")
          .update({ is_default: false })
          .eq("user_id", authUser.id)
          .eq("is_default", true)
          .neq("id", addressId);

        if (_updateError) {
          return {
            code: ErrorCode.INTERNAL_ERROR,
            message: "Failed to update default address",
          };
        }
      }

      // Update address
      const { data: address, error: _updateAddressError } = await supabase
        .from("addresses")
        .update(updates)
        .eq("id", addressId)
        .select()
        .single();

      if (!address) {
        return {
          code: ErrorCode.INTERNAL_ERROR,
          message: "Failed to update address",
        };
      }

      return address;
    } catch {
      return {
        code: ErrorCode.INTERNAL_ERROR,
        message: "Failed to update address",
      };
    }
  }

  static async deleteAddress(addressId: string): Promise<void | AddressError> {
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

      // Verify ownership
      const { data: existing, error: _fetchError } = await supabase
        .from("addresses")
        .select("id, user_id, is_default")
        .eq("id", addressId)
        .single();

      if (!existing) {
        return {
          code: ErrorCode.ADDRESS_NOT_FOUND,
          message: "Address not found",
        };
      }

      if (existing.user_id !== authUser.id) {
        return {
          code: ErrorCode.FORBIDDEN,
          message: "Cannot access this address",
        };
      }

      // Delete address
      const { error: _deleteError } = await supabase
        .from("addresses")
        .delete()
        .eq("id", addressId);

      if (_deleteError) {
        return {
          code: ErrorCode.INTERNAL_ERROR,
          message: "Failed to delete address",
        };
      }
    } catch {
      return {
        code: ErrorCode.INTERNAL_ERROR,
        message: "Failed to delete address",
      };
    }
  }
}
