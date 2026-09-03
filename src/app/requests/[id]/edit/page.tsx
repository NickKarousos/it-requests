import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import EditRequestForm from "./EditRequestForm";

export default async function EditRequestPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
    redirect("/login");
  }

  const { id: paramId } = await params;
  const id = parseInt(paramId);
  const reqRecord = await prisma.request.findUnique({
    where: { id },
  });

  if (!reqRecord) {
    return (
      <main className="container">
        <div className="glass-card" style={{ textAlign: "center" }}>
          <h2>Request Not Found</h2>
          <Link href="/" className="btn-primary" style={{ marginTop: "1rem" }}>Go Home</Link>
        </div>
      </main>
    );
  }

  const isAdmin = session.user.role === "ADMIN";

  // Only owner or admin can edit
  if (reqRecord.userId.toString() !== session.user.id && !isAdmin) {
    return (
      <main className="container">
        <div className="glass-card" style={{ textAlign: "center" }}>
          <h2>Access Denied</h2>
          <p>You can only edit your own requests.</p>
          <Link href={`/requests/${id}`} className="btn-primary" style={{ marginTop: "1rem" }}>Back to Request</Link>
        </div>
      </main>
    );
  }

  let users: { id: string, name: string | null, email: string | null }[] = [];
  if (isAdmin) {
    users = await prisma.user.findMany({
      select: { id: true, name: true, email: true },
    });
  }

  return (
    <main className="container" style={{ maxWidth: "800px" }}>
      <header className="page-header" style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="ROBBIE Logo" style={{ height: "90px" }} />
          <div>
            <h1 className="page-title" style={{ marginBottom: "0.25rem", fontSize: "2rem" }}>Edit Request #{id}</h1>
          </div>
        </div>
        <Link href={`/requests/${id}`} className="btn-secondary">
          Cancel
        </Link>
      </header>

      <div className="glass-card">
        <EditRequestForm requestData={reqRecord} isAdmin={isAdmin} users={users} />
      </div>
    </main>
  );
}
