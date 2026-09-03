import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export default async function ArchivedRequests() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }
  
  if (session.user.role !== "ADMIN") {
    return (
      <main className="container">
        <div className="glass-card" style={{ textAlign: "center" }}>
          <h2>Access Denied</h2>
          <p>You do not have permission to view this page.</p>
          <Link href="/" className="btn-primary" style={{ marginTop: "1rem" }}>Go Home</Link>
        </div>
      </main>
    );
  }

  const archivedRequests = await prisma.request.findMany({
    where: { status: "Archived" },
    orderBy: { createdAt: "desc" },
    include: { user: true },
  });

  return (
    <main className="container" style={{ maxWidth: "100%", padding: "0 4rem" }}>
      <header className="page-header" style={{ marginBottom: "2rem", display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="ROBBIE Logo" style={{ height: "90px" }} />
          <div>
            <h1 className="page-title" style={{ marginBottom: 0, fontSize: "2rem" }}>Archived Requests</h1>
            <p className="page-subtitle" style={{ fontSize: "1rem", textAlign: "center" }}>Past Completed Requests</p>
          </div>
        </div>
        <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)" }}>
          <Link href="/admin" className="btn-secondary" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
            &larr; Back to Dashboard
          </Link>
        </div>
      </header>

      <div className="glass-card" style={{ padding: "0" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--glass-border)", backgroundColor: "rgba(255,255,255,0.02)" }}>
              <th style={{ padding: "1rem", textAlign: "left", color: "var(--text-secondary)", fontWeight: "normal" }}>ID</th>
              <th style={{ padding: "1rem", textAlign: "left", color: "var(--text-secondary)", fontWeight: "normal" }}>Title</th>
              <th style={{ padding: "1rem", textAlign: "left", color: "var(--text-secondary)", fontWeight: "normal" }}>Requested For</th>
              <th style={{ padding: "1rem", textAlign: "left", color: "var(--text-secondary)", fontWeight: "normal" }}>Archived On</th>
              <th style={{ padding: "1rem", textAlign: "left", color: "var(--text-secondary)", fontWeight: "normal" }}>Time Spent</th>
              <th style={{ padding: "1rem", textAlign: "right", color: "var(--text-secondary)", fontWeight: "normal" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {archivedRequests.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: "2rem", textAlign: "center", color: "var(--text-secondary)" }}>
                  No archived requests found.
                </td>
              </tr>
            ) : (
              archivedRequests.map(req => (
                <tr key={req.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                  <td style={{ padding: "1rem", color: "var(--text-secondary)" }}>#{req.id}</td>
                  <td style={{ padding: "1rem", fontWeight: "bold" }}>{req.title}</td>
                  <td style={{ padding: "1rem" }}>{req.user.name}</td>
                  <td style={{ padding: "1rem", color: "var(--text-secondary)" }}>{req.updatedAt.toLocaleDateString()}</td>
                  <td style={{ padding: "1rem" }}>{req.timeSpent}s</td>
                  <td style={{ padding: "1rem", textAlign: "right" }}>
                    <Link href={`/requests/${req.id}`} className="btn-secondary" style={{ padding: "0.25rem 0.5rem", fontSize: "0.85rem", background: "var(--glass-bg)", color: "var(--text-primary)", border: "1px solid var(--glass-border)" }}>
                      View Details
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
