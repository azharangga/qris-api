import { NextRequest } from "next/server";
import { getPayment, updatePaymentStatus } from "@/lib/store/paymentStore";
import { successResponse, errorResponse } from "@/lib/api/response";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const payment = getPayment(id);

    if (!payment) {
      return errorResponse("PAYMENT_NOT_FOUND", `Payment with ID '${id}' not found`, 404);
    }

    if (payment.status === "expired") {
      return errorResponse("PAYMENT_EXPIRED", "Cannot confirm an expired payment order", 400);
    }

    if (payment.status === "cancelled") {
      return errorResponse("PAYMENT_CANCELLED", "Cannot confirm a cancelled payment order", 400);
    }

    if (payment.status === "paid") {
      const p = { ...payment };
      delete (p as any).qrisString;
      return successResponse(p);
    }

    const updated = updatePaymentStatus(id, "paid");
    const p = { ...updated };
    delete (p as any).qrisString;
    return successResponse(p);
  } catch (error) {
    return errorResponse(
      "SERVER_ERROR",
      error instanceof Error ? error.message : "Failed to confirm payment",
      500
    );
  }
}
