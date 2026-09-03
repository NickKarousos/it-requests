import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Find all Resolved or Closed requests updated more than 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const oldRequests = await prisma.request.findMany({
      where: {
        status: { in: ["Resolved", "Closed"] },
        updatedAt: { lt: thirtyDaysAgo }
      }
    });

    if (oldRequests.length === 0) {
      return NextResponse.json({ success: true, archivedCount: 0 });
    }

    let archivedCount = 0;

    for (const req of oldRequests) {
      // 1. Delete attachment from filesystem if it exists
      if (req.attachmentUrl) {
        try {
          // attachmentUrl is typically something like "/uploads/1721200000-file.png"
          const filename = req.attachmentUrl.split("/uploads/")[1];
          if (filename) {
            const filePath = path.join(process.cwd(), "public", "uploads", filename);
            await fs.unlink(filePath).catch(() => {
              // Ignore error if file doesn't exist
            });
          }
        } catch (err) {
          console.error(`Failed to delete attachment for request ${req.id}:`, err);
        }
      }

      // 2. Update database record to 'Archived' and remove attachmentUrl
      await prisma.request.update({
        where: { id: req.id },
        data: {
          status: "Archived",
          attachmentUrl: null
        }
      });

      archivedCount++;
    }

    return NextResponse.json({ success: true, archivedCount });
  } catch (error) {
    console.error("Auto-archive error:", error);
    return NextResponse.json({ error: "Failed to run archive job" }, { status: 500 });
  }
}
