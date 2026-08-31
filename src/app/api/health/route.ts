import { successResponse } from "@/lib/api/response";

const START_TIME = Date.now();

export async function GET() {
  const uptimeSeconds = Math.floor((Date.now() - START_TIME) / 1000);
  return successResponse({
    creator: "Azharangga Kusuma",
    status: "online",
    service: "QRIS API Service",
    version: process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0",
    uptime: `${uptimeSeconds}s`,
    timestamp: new Date().toISOString(),
    docs: "/#health",
  });
}
