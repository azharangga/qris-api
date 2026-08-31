import { NextRequest } from "next/server";
import { parseQRIS } from "@/lib/core/parser";
import { validateQRIS } from "@/lib/core/validator";
import { successResponse, errorResponse } from "@/lib/api/response";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const { raw } = body || {};

    if (!raw || typeof raw !== "string") {
      return errorResponse("INVALID_PAYLOAD", "Field 'raw' (QR string or decoded payload) is required", 400);
    }

    const validation = validateQRIS(raw.trim());
    if (!validation.valid) {
      return errorResponse("INVALID_QRIS", "Decoded payload is not a valid QRIS string", 422, validation.errors);
    }

    const parsed = parseQRIS(raw.trim());
    
    return successResponse({
      decodedText: raw.trim(),
      merchant: {
        name: parsed.merchantName || null,
        city: parsed.merchantCity || null,
        postalCode: parsed.postalCode || null,
        countryCode: parsed.countryCode || "ID",
        categoryCode: parsed.merchantCategoryCode || null,
      },
      payment: {
        type: parsed.method,
        currency: parsed.currency === "360" ? "IDR" : parsed.currency,
        amount: parsed.amount ? Number(parsed.amount) : null,
      },
      crc: parsed.crc,
      details: {
        version: parsed.version,
        acquirers: parsed.merchantAccountInfo.map((acc) => ({
          tag: acc.tag,
          domain: acc.globallyUniqueId,
          merchantId: acc.merchantId || null,
          criteria: acc.merchantCriteria || null,
        })),
      },
    });
  } catch (error) {
    return errorResponse(
      "SERVER_ERROR",
      error instanceof Error ? error.message : "Failed to decode payload",
      500
    );
  }
}
