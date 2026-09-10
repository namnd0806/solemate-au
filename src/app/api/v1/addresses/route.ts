import { NextRequest, NextResponse } from "next/server";
import { addressSchema } from "@/lib/validators/auth.schema";
import { AddressService } from "@/lib/services/address.service";
import { ErrorCode, ErrorHttpStatus } from "@/lib/constants/errors";

export async function GET(req: NextRequest) {
  try {
    const result = await AddressService.getAddresses();

    if ("code" in result) {
      const status = ErrorHttpStatus[result.code] || 500;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json({ addresses: result }, { status: 200 });
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const validation = addressSchema.safeParse(body);
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

    const {
      label,
      full_name,
      phone,
      line1,
      line2,
      suburb,
      state,
      postcode,
      is_default,
    } = validation.data;

    const result = await AddressService.createAddress(
      label,
      full_name,
      phone,
      line1,
      line2 || null,
      suburb,
      state,
      postcode,
      is_default
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
