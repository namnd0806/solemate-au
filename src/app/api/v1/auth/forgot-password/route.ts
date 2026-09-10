import { NextRequest, NextResponse } from "next/server";
import { forgotPasswordSchema } from "@/lib/validators/auth.schema";
import { AuthService } from "@/lib/services/auth.service";
import { ErrorCode, ErrorHttpStatus } from "@/lib/constants/errors";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input
    const validation = forgotPasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          code: ErrorCode.VALIDATION_ERROR,
          message: "Validation failed",
          errors: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { email } = validation.data;

    // Request password reset
    const result = await AuthService.forgotPassword(email);

    if ("code" in result) {
      const status = ErrorHttpStatus[result.code] || 500;
      return NextResponse.json(result, { status });
    }

    // Always return success (don't reveal if email exists)
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        code: ErrorCode.INTERNAL_ERROR,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
