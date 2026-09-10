import { NextRequest, NextResponse } from "next/server";
import { registerSchema } from "@/lib/validators/auth.schema";
import { AuthService } from "@/lib/services/auth.service";
import { ErrorCode, ErrorHttpStatus } from "@/lib/constants/errors";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input
    const validation = registerSchema.safeParse(body);
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

    const { first_name, last_name, email, password } = validation.data;

    // Register user
    const result = await AuthService.register(
      email,
      password,
      first_name,
      last_name
    );

    if ("code" in result) {
      const status = ErrorHttpStatus[result.code] || 500;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result, { status: 201 });
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
