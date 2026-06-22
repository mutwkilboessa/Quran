import { ImageResponse } from "next/og";
import { crescentIcon } from "@/lib/appIcon";

export const dynamic = "force-static";

export async function GET() {
  return new ImageResponse(crescentIcon(192), { width: 192, height: 192 });
}
