import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // WARNING: This will wipe the requests table and reset IDs to 1
    await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0;');
    await prisma.$executeRawUnsafe('TRUNCATE TABLE Request;');
    await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1;');

    return NextResponse.json({ success: true, message: "Database requests wiped and ID reset to 1." });
  } catch (error) {
    console.error("Error wiping db:", error);
    return NextResponse.json({ error: "Failed to wipe database" }, { status: 500 });
  }
}
