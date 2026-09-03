import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const userCount = await prisma.user.count();
    const firstUser = await prisma.user.findFirst();
    
    return NextResponse.json({
      status: "success",
      env_NEXTAUTH_URL: process.env.NEXTAUTH_URL || "MISSING",
      env_DATABASE_URL: process.env.DATABASE_URL ? "SET" : "MISSING",
      userCount,
      firstUserEmail: firstUser ? firstUser.email : "NO_USERS"
    });
  } catch (err: any) {
    return NextResponse.json({
      status: "error",
      message: err.message,
      env_DATABASE_URL: process.env.DATABASE_URL ? "SET" : "MISSING",
    }, { status: 500 });
  }
}
