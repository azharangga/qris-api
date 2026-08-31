import { NextRequest, NextResponse } from "next/server";
import { validateQRIS } from "@/lib/core/validator";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const qris = body?.qris;

    if (!qris || typeof qris !== "string") {
      return NextResponse.json(
        {
          valid: false,
          errors: ["Missing or invalid 'qris' payload string in request body"],
        },
        { status: 400 }
      );
    }

    const validation = validateQRIS(qris.trim());
    return NextResponse.json({
      valid: validation.valid,
      errors: validation.errors,
    });
  } catch (error) {
    return NextResponse.json(
      {
        valid: false,
        errors: [error instanceof Error ? error.message : "Validation process failed"],
      },
      { status: 500 }
    );
  }
}
