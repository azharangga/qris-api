import { NextRequest } from "next/server";
import { validateQRIS } from "@/lib/core/validator";
import { successResponse, errorResponse } from "@/lib/api/response";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const qris = body?.qris;

    if (!qris || typeof qris !== "string") {
      return errorResponse("INVALID_PAYLOAD", "Field 'qris' is required and must be a string", 400);
    }

    const validation = validateQRIS(qris.trim());
    return successResponse({
      valid: validation.valid,
      errors: validation.errors,
    });
  } catch (error) {
    return errorResponse(
      "SERVER_ERROR",
      error instanceof Error ? error.message : "Validation process failed",
      500
    );
  }
}
