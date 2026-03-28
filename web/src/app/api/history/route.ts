import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { history } from "@/lib/db/schema/core";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const results = await db
      .select()
      .from(history)
      .where(eq(history.userId, userId))
      .orderBy(history.id)
      .limit(50);

    return NextResponse.json({ history: results });
  } catch (error) {
    console.error("History fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
