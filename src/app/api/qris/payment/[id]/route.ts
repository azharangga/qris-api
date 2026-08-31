import { NextRequest } from "next/server";
import { getPayment } from "@/lib/store/paymentStore";
import QRCode from "qrcode";
import { successResponse, errorResponse } from "@/lib/api/response";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const payment = getPayment(id);

    if (!payment) {
      return errorResponse("PAYMENT_NOT_FOUND", `Payment with ID '${id}' not found`, 404);
    }

    const qrDataUrl = await QRCode.toDataURL(payment.qrisString, {
      margin: 2,
      width: 400,
      color: { dark: "#000000", light: "#ffffff" },
    });

    return successResponse({
      ...payment,
      dataUrl: qrDataUrl,
    });
  } catch (error) {
    return errorResponse(
      "SERVER_ERROR",
      error instanceof Error ? error.message : "Failed to retrieve payment",
      500
    );
  }
}
