import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    const text = body?.text || body?.qris;
    const format = body?.format || "data_url";

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Field 'text' or 'qris' is required",
        },
        { status: 400 }
      );
    }

    if (format === "svg") {
      const svg = await QRCode.toString(text, {
        type: "svg",
        margin: 2,
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });
      return new NextResponse(svg, {
        headers: { "Content-Type": "image/svg+xml" },
      });
    }

    const dataUrl = await QRCode.toDataURL(text, {
      margin: 2,
      width: 400,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    });

    return NextResponse.json({
      success: true,
      dataUrl,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate QR Code",
      },
      { status: 500 }
    );
  }
}
