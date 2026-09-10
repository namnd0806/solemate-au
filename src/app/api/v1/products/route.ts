import { NextRequest, NextResponse } from "next/server";
import { CatalogService } from "@/lib/services/catalog.service";
import { ErrorCode, ErrorHttpStatus } from "@/lib/constants/errors";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("q") || "";
    const brand_id = searchParams.get("brand_id") || undefined;
    const category_id = searchParams.get("category_id") || undefined;
    const min_price = searchParams.get("min_price")
      ? parseInt(searchParams.get("min_price")!)
      : undefined;
    const max_price = searchParams.get("max_price")
      ? parseInt(searchParams.get("max_price")!)
      : undefined;
    const sort_by = searchParams.get("sort_by") || "newest";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const result = await CatalogService.searchProducts(
      query,
      brand_id,
      min_price,
      max_price,
      category_id,
      sort_by,
      page,
      limit
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
