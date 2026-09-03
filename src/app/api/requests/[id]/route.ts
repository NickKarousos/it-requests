import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: paramId } = await params;
    const id = parseInt(paramId);
    const data = await request.json();

    const reqRecord = await prisma.request.findUnique({ where: { id } });
    if (!reqRecord) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const isOwner = reqRecord.userId.toString() === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updateData: any = {};
    
    // If the user is an Admin, they can update everything including status and assignment
    if (isOwner || isAdmin) {
      if (data.status !== undefined) {
        updateData.status = data.status;
        if (data.status === 'Resolved' || data.status === 'Closed') {
          updateData.completedAt = new Date();
        } else if (data.status === 'Open' || data.status === 'In Progress') {
          updateData.completedAt = null;
        }
      }
      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.category !== undefined) updateData.category = data.category;
      if (data.priority !== undefined) updateData.priority = data.priority;
      if (data.requiredByDate !== undefined) updateData.requiredByDate = data.requiredByDate ? new Date(data.requiredByDate) : null;
      if (data.attachmentUrl !== undefined) updateData.attachmentUrl = data.attachmentUrl;
    }

    if (isAdmin && data.userId !== undefined) {
      updateData.userId = data.userId;
    }

    if (Object.keys(updateData).length === 0) {
       return NextResponse.json(reqRecord);
    }

    const updatedRequest = await prisma.request.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error("Error updating request:", error);
    return NextResponse.json({ error: "Failed to update request" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: paramId } = await params;
    const id = parseInt(paramId);
    const reqRecord = await prisma.request.findUnique({ where: { id } });

    if (!reqRecord) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Check permissions: either the user owns it, or it's the admin
    const isOwner = reqRecord.userId.toString() === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.request.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting request:", error);
    return NextResponse.json({ error: "Failed to delete request" }, { status: 500 });
  }
}
