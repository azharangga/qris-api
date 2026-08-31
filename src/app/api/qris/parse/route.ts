import { NextRequest, NextResponse } from "next/server";
import { parseQRIS } from "@/lib/core/parser";
import { validateQRIS } from "@/lib/core/validator";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const qris = body?.qris;

    if (!qris || typeof qris !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Missing or invalid 'qris' payload string in request body",
        },
        { status: 400 }
      );
    }

    const validation = validateQRIS(qris.trim());
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid QRIS payload format",
          details: validation.errors,
        },
        { status: 422 }
      );
    }

    const data = parseQRIS(qris.trim());
    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to parse QRIS data",
      },
      { status: 500 }
    );
  }
}
