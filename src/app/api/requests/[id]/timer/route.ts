import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: paramId } = await params;
    const id = parseInt(paramId);
    const data = await request.json(); // { action: "start" | "stop" }

    const reqRecord = await prisma.request.findUnique({ where: { id } });
    if (!reqRecord) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (data.action === "start") {
      const updated = await prisma.request.update({
        where: { id },
        data: { timerStartedAt: new Date() },
      });
      return NextResponse.json(updated);
    } 
    
    if (data.action === "stop") {
      if (reqRecord.timerStartedAt) {
        const diffSeconds = Math.floor((new Date().getTime() - new Date(reqRecord.timerStartedAt).getTime()) / 1000);
        const updated = await prisma.request.update({
          where: { id },
          data: {
            timeSpent: reqRecord.timeSpent + diffSeconds,
            timerStartedAt: null
          }
        });
        return NextResponse.json(updated);
      } else {
        // Was not started
        return NextResponse.json(reqRecord);
      }
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Timer error:", error);
    return NextResponse.json({ error: "Failed to update timer" }, { status: 500 });
  }
}
