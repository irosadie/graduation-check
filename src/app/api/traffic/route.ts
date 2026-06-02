import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const userAgent = request.headers.get("user-agent") || null;
    const page = request.headers.get("referer") || null;

    let body: Record<string, unknown> = {};
    try { body = await request.json(); } catch {}

    const nisn = typeof body.nisn === "string" ? body.nisn : null;
    const action = typeof body.action === "string" ? body.action : null;

    await prisma.traffic.create({
      data: {
        ip,
        userInfo: JSON.stringify({
          userAgent,
          page,
          nisn,
          action,
        }),
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
