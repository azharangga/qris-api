import { NextRequest, NextResponse } from "next/server";
import { convertQRIS } from "@/lib/core/converter";
import { validateQRIS } from "@/lib/core/validator";
import { parseQRIS } from "@/lib/core/parser";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const { qris, amount, fee } = body || {};

    if (!qris || typeof qris !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Field 'qris' is required and must be a string",
        },
        { status: 400 }
      );
    }

    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Field 'amount' must be a valid positive number",
        },
        { status: 400 }
      );
    }

    const validation = validateQRIS(qris.trim());
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid QRIS string",
          details: validation.errors,
        },
        { status: 422 }
      );
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

    return NextResponse.json({
      success: true,
      dynamic_qris: dynamicQRIS,
      details: {
        merchantName: parsedDynamic.merchantName,
        merchantCity: parsedDynamic.merchantCity,
        amount: parsedDynamic.amount,
        feeType: feeOption?.type || null,
        feeValue: feeOption?.value || null,
        method: parsedDynamic.method,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to convert QRIS",
      },
      { status: 500 }
    );
  }
}
