import { NextRequest } from "next/server";
import { convertQRIS } from "@/lib/core/converter";
import { validateQRIS } from "@/lib/core/validator";
import { parseQRIS } from "@/lib/core/parser";
import QRCode from "qrcode";
import { successResponse, errorResponse } from "@/lib/api/response";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const { qris, amount, fee, format } = body || {};

    if (!qris || typeof qris !== "string") {
      return errorResponse("INVALID_PAYLOAD", "Field 'qris' is required and must be a string", 400);
    }

    const parsedAmount = Math.floor(Number(amount));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return errorResponse("INVALID_AMOUNT", "Field 'amount' must be a valid positive integer in IDR", 400);
    }

    const validation = validateQRIS(qris.trim());
    if (!validation.valid) {
      return errorResponse("INVALID_QRIS", "Invalid QRIS payload structure", 422, validation.errors);
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

    const parsedDynamic = parseQRIS(dynamicQRIS);
    
    let qrDataUrl = undefined;
    let qrSvg = undefined;
    
    if (format === "data_url" || !format) {
      qrDataUrl = await QRCode.toDataURL(dynamicQRIS, {
        margin: 2,
        width: 400,
        color: { dark: "#000000", light: "#ffffff" },
      });
    } else if (format === "svg") {
      qrSvg = await QRCode.toString(dynamicQRIS, {
        type: "svg",
        margin: 2,
        color: { dark: "#000000", light: "#ffffff" },
      });
    }

    return successResponse({
      dynamicQris: dynamicQRIS,
      merchantName: parsedDynamic.merchantName,
      merchantCity: parsedDynamic.merchantCity,
      amount: parsedAmount,
      currency: "IDR",
      feeType: feeOption?.type || null,
      feeValue: feeOption?.value || null,
      method: parsedDynamic.method,
      dataUrl: qrDataUrl,
      svg: qrSvg
    });
  } catch (error) {
    return errorResponse(
      "SERVER_ERROR",
      error instanceof Error ? error.message : "Failed to convert QRIS",
      500
    );
  }
}
