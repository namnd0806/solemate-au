import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-zA-Z]/, "Password must contain letters")
  .regex(/[0-9]/, "Password must contain numbers");

const phoneSchema = z
  .string()
  .regex(/^\d{10,11}$/, "Phone must be 10-11 digits (AU format)")
  .optional()
  .or(z.literal(""));

const australianStateSchema = z.enum([
  "NSW",
  "VIC",
  "QLD",
  "WA",
  "SA",
  "TAS",
  "ACT",
  "NT",
]);

export const registerSchema = z
  .object({
    first_name: z.string().min(1, "First name required").max(100),
    last_name: z.string().min(1, "Last name required").max(100),
    email: z.string().email("Invalid email address"),
    password: passwordSchema,
    password_confirm: z.string(),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: "Passwords do not match",
    path: ["password_confirm"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token required"),
    password: passwordSchema,
    password_confirm: z.string(),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: "Passwords do not match",
    path: ["password_confirm"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const profileUpdateSchema = z.object({
  first_name: z.string().min(1, "First name required").max(100).optional(),
  last_name: z.string().min(1, "Last name required").max(100).optional(),
  phone: phoneSchema,
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

export const addressSchema = z.object({
  label: z.string().min(1, "Label required").max(50),
  full_name: z.string().min(1, "Full name required").max(200),
  phone: z
    .string()
    .regex(/^\d{10,11}$/, "Phone must be 10-11 digits (AU format)"),
  line1: z.string().min(1, "Street address required").max(255),
  line2: z.string().max(255).optional().or(z.literal("")),
  suburb: z.string().min(1, "Suburb required").max(120),
  state: australianStateSchema,
  postcode: z
    .string()
    .regex(/^\d{4}$/, "Postcode must be 4 digits"),
  is_default: z.boolean().optional().default(false),
});

export type AddressInput = z.infer<typeof addressSchema>;
