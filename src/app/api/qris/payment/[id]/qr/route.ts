import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { getPayment } from "@/lib/store/paymentStore";
import { errorResponse } from "@/lib/api/response";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const payment = getPayment(id);

    if (!payment) {
      return errorResponse("PAYMENT_NOT_FOUND", `Payment with ID '${id}' not found`, 404);
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "png";

    if (format === "svg") {
      const svg = await QRCode.toString(payment.qrisString, {
        type: "svg",
        margin: 2,
        color: { dark: "#000000", light: "#ffffff" },
      });
      return new NextResponse(svg, {
        headers: { "Content-Type": "image/svg+xml" },
      });
    }

    if (format === "jpeg" || format === "jpg") {
      const buffer = await QRCode.toBuffer(payment.qrisString, {
        type: "jpeg" as any,
        margin: 2,
        width: 400,
        color: { dark: "#000000", light: "#ffffff" },
      });
      return new NextResponse(new Uint8Array(buffer), {
        headers: { "Content-Type": "image/jpeg" },
      });
    }

    if (format === "webp") {
      const buffer = await QRCode.toBuffer(payment.qrisString, {
        type: "webp" as any,
        margin: 2,
        width: 400,
        color: { dark: "#000000", light: "#ffffff" },
      });
      return new NextResponse(new Uint8Array(buffer), {
        headers: { "Content-Type": "image/webp" },
      });
    }

    const buffer = await QRCode.toBuffer(payment.qrisString, {
      type: "png",
      margin: 2,
      width: 400,
      color: { dark: "#000000", light: "#ffffff" },
    });

    return new NextResponse(new Uint8Array(buffer), {
      headers: { "Content-Type": "image/png" },
    });
  } catch (error) {
    return errorResponse(
      "SERVER_ERROR",
      error instanceof Error ? error.message : "Failed to render QR image",
      500
    );
  }
}
