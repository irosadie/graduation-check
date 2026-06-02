import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function parseDate(str: string): Date {
  const [datePart, timePart] = str.split(" ");
  const [day, month, year] = datePart.split("/").map(Number);
  const [hour, minute, second] = timePart.split(":").map(Number);
  const wib = Date.UTC(year, month - 1, day, hour, minute, second);
  const utc = wib - 7 * 60 * 60 * 1000;
  return new Date(utc);
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get("mode");
    const pass = searchParams.get("pass");
    const isDevBypass = mode === process.env.MODE && pass === process.env.PASS;

    if (!isDevBypass) {
      const openAtStr = process.env.OPEN_AT;
      if (openAtStr) {
        const openAt = parseDate(openAtStr);
        if (Date.now() < openAt.getTime()) {
          return NextResponse.json({ closed: true, openAt: openAt.toISOString() });
        }
      }
    }

    const q = searchParams.get("q")?.trim();

    if (!q) {
      return NextResponse.json({ result: null });
    }

    const student = await prisma.student.findUnique({
      where: { nisn: q },
    });

    return NextResponse.json({ result: student });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
