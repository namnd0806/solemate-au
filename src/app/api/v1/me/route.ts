import { NextRequest, NextResponse } from "next/server";
import { ProfileService } from "@/lib/services/profile.service";
import { ErrorCode, ErrorHttpStatus } from "@/lib/constants/errors";
import { extractBearerToken } from "@/lib/supabase/auth-helpers";

export async function GET(req: NextRequest) {
  try {
    const token = extractBearerToken(req);
    if (!token) {
      return NextResponse.json(
        {
          code: ErrorCode.UNAUTHORIZED,
          message: "Not authenticated",
        },
        { status: 401 }
      );
    }

    const result = await ProfileService.getProfile(token);

    if ("code" in result) {
      const status = ErrorHttpStatus[result.code] || 500;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result, { status: 200 });
  } catch {
    return NextResponse.json(
      {
        code: ErrorCode.INTERNAL_ERROR,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const token = extractBearerToken(req);
    if (!token) {
      return NextResponse.json(
        {
          code: ErrorCode.UNAUTHORIZED,
          message: "Not authenticated",
        },
        { status: 401 }
      );
    }

    const body = await req.json();

    const result = await ProfileService.updateProfile(
      token,
      body.first_name,
      body.last_name,
      body.phone
    );

    if ("code" in result) {
      const status = ErrorHttpStatus[result.code] || 500;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result, { status: 200 });
  } catch {
    return NextResponse.json(
      {
        code: ErrorCode.INTERNAL_ERROR,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
