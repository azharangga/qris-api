import { NextResponse } from "next/server";

export function generateRequestId(): string {
  return "req_" + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}

export function successResponse(data: any, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
      meta: {
        requestId: generateRequestId(),
        timestamp: new Date().toISOString(),
      },
    },
    { status }
  );
}

export function errorResponse(code: string, message: string, status = 400, details?: any) {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        details,
      },
      meta: {
        requestId: generateRequestId(),
        timestamp: new Date().toISOString(),
      },
    },
    { status }
  );
}
