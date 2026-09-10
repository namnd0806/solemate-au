import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/lib/validators/auth.schema";
import { AuthService } from "@/lib/services/auth.service";
import { ErrorCode, ErrorHttpStatus } from "@/lib/constants/errors";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input
    const validation = loginSchema.safeParse(body);
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

    const { email, password } = validation.data;

    // Login user
    const result = await AuthService.login(email, password);

    if ("code" in result) {
      const status = ErrorHttpStatus[result.code] || 500;
      return NextResponse.json(result, { status });
    }

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
