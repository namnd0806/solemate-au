import { NextRequest, NextResponse } from "next/server";
import { CatalogService } from "@/lib/services/catalog.service";
import { ErrorCode, ErrorHttpStatus } from "@/lib/constants/errors";

export async function GET(_req: NextRequest) {
  try {
    const result = await CatalogService.getHome();

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
