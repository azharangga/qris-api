import { NextResponse } from "next/server";

const START_TIME = Date.now();

export async function GET() {
  const uptimeSeconds = Math.floor((Date.now() - START_TIME) / 1000);
  return NextResponse.json(
    {
      creator: "Azharangga Kusuma",
      status: "online",
      service: "QRIS API Service",
      version: process.env.NEXT_PUBLIC_APP_VERSION,
      uptime: `${uptimeSeconds}s`,
      timestamp: new Date().toISOString(),
      docs: "/#health",
    },
    { status: 200 }
  );
}
