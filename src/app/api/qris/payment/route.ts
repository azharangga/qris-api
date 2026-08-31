import { randomUUID } from "crypto";
import { NextRequest } from "next/server";
import { convertQRIS } from "@/lib/core/converter";
import { validateQRIS } from "@/lib/core/validator";
import { successResponse, errorResponse } from "@/lib/api/response";
import QRCode from "qrcode";
import {
  createPayment,
  getPaymentByIdempotencyKey,
  generatePaymentId,
  generateInvoiceId,
  listPayments,
  PaymentOrder,
  DEMO_PAYMENT_ID,
} from "@/lib/store/paymentStore";

// POST /api/qris/payment - Create payment invoice
export async function POST(request: NextRequest) {
  try {
    const idempotencyKey = request.headers.get("Idempotency-Key") || undefined;

    // If Idempotency-Key provided, return cached order if exists
    if (idempotencyKey) {
      const existing = getPaymentByIdempotencyKey(idempotencyKey);
      if (existing) {
        return successResponse(existing, 200);
      }
    }

    const body = await request.json().catch(() => null);
    const {
      qris,
      amount,
      referenceId,
      description = "QRIS Payment Order",
      expiresIn = 86400, // default 24 hours (86400 seconds)
      fee,
    } = body || {};

    if (!qris || typeof qris !== "string") {
      return errorResponse("INVALID_PAYLOAD", "Field 'qris' is required and must be a string", 400);
    }

    const parsedAmount = Math.floor(Number(amount));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return errorResponse("INVALID_AMOUNT", "Field 'amount' must be a valid positive integer in IDR", 400);
    }

    const validation = validateQRIS(qris.trim());
    if (!validation.valid) {
      return errorResponse("INVALID_QRIS", "Static QRIS string is invalid", 422, validation.errors);
    }

    let feeOption = undefined;
    if (fee && typeof fee === "object") {
      const feeVal = Number(fee.value);
      if (fee.type && ["fixed", "percentage"].includes(fee.type) && !isNaN(feeVal) && feeVal >= 0) {
        feeOption = {
          type: fee.type as "fixed" | "percentage",
          value: feeVal,
        };
      }
    }

    const dynamicQRIS = convertQRIS(qris.trim(), {
      amount: parsedAmount,
      fee: feeOption,
    });

    const now = new Date();
    const expiryDate = new Date(now.getTime() + Math.max(60, Number(expiresIn)) * 1000);

    const isDemoPayload = qris.trim() === "00020101021126570011ID.DANA.WWW011893600915300026191402090002619140303UMI51440014ID.CO.QRIS.WWW0215ID10254684634640303UMI5204737253033605802ID5914Rangga Digital6015Kabupaten Cireb610545183630495B3" && (!referenceId || referenceId === "DRV-20260831-8F4K2M");
    const paymentId = isDemoPayload ? DEMO_PAYMENT_ID : generatePaymentId();
    const invoiceId = isDemoPayload ? "inv_01K4Z8Y2F7P3M9Q6D4K8R1X5" : generateInvoiceId();
    const refId = referenceId && typeof referenceId === "string" && referenceId.trim() !== "" ? referenceId : (isDemoPayload ? "DRV-20260831-8F4K2M" : null);

    const order: PaymentOrder = {
      id: isDemoPayload ? "a9a3b6f2-51c3-4d89-9a2f-7634891b2c5d" : randomUUID(),
      paymentId,
      invoiceId,
      referenceId: refId,
      amount: parsedAmount,
      currency: "IDR",
      status: "pending",
      description: String(description),
      qrisString: dynamicQRIS,
      idempotencyKey,
      expiresAt: expiryDate.toISOString(),
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    createPayment(order);

    // Dynamic rendering helper property for visual preview mapping in EndpointDoc component
    const qrDataUrl = await QRCode.toDataURL(dynamicQRIS, {
      margin: 2,
      width: 400,
      color: { dark: "#000000", light: "#ffffff" },
    });

    return successResponse({
      ...order,
      dataUrl: qrDataUrl,
    }, 201);
  } catch (error) {
    return errorResponse(
      "SERVER_ERROR",
      error instanceof Error ? error.message : "Failed to create payment order",
      500
    );
  }
}

// GET /api/qris/payment - List payments with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));

    let items = listPayments();

    if (status) {
      items = items.filter((p) => p.status === status);
    }

    const total = items.length;
    const offset = (page - 1) * limit;
    const paginatedItems = items.slice(offset, offset + limit);

    return successResponse({
      items: paginatedItems,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    return errorResponse(
      "SERVER_ERROR",
      error instanceof Error ? error.message : "Failed to list payments",
      500
    );
  }
}
