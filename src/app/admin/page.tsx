import Link from "next/link";
import styles from "./Admin.module.css";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AdminKanbanClient from "@/components/AdminKanbanClient";

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }
  
  if (session.user.role !== "ADMIN") {
    return (
      <main className="container">
        <div className="glass-card" style={{ textAlign: "center" }}>
          <h2>Access Denied</h2>
          <p>You do not have permission to view the Admin Dashboard.</p>
          <Link href="/" className="btn-primary" style={{ marginTop: "1rem" }}>Go Home</Link>
        </div>
      </main>
    );
  }

  const requests = await prisma.request.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true },
  });

  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  const onlineUsers = await prisma.user.findMany({
    where: { lastSeenAt: { gte: fiveMinutesAgo } },
    select: { name: true },
  });

  return (
    <main className="container" style={{ maxWidth: "100%", padding: "0 4rem" }}>
      <header className="page-header" style={{ marginBottom: "2rem", display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="ROBBIE Logo" style={{ height: "90px" }} />
          <div>
            <h1 className="page-title" style={{ marginBottom: 0, fontSize: "2rem" }}>Admin Dashboard</h1>
            <p className="page-subtitle" style={{ fontSize: "1rem", textAlign: "center" }}>Manage IT Requests</p>
          </div>
        </div>
        <div style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", display: "flex", gap: "1rem" }}>
          <Link href="/" className="btn-secondary" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
            My Requests
          </Link>
          <Link href="/admin/archived" className="btn-secondary" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
            View Archived
          </Link>
          <Link href="/submit" className="btn-primary">
            + New Request
          </Link>
          <Link href="/api/auth/signout" className="btn-secondary">
            Sign Out
          </Link>
        </div>
      </header>

      <div className={styles.statsGrid}>
        <div className={`glass-card ${styles.statCard}`}>
          <div className={styles.statNumber}>{requests.length}</div>
          <div className={styles.statLabel}>Total</div>
        </div>
        <div className={`glass-card ${styles.statCard}`}>
          <div className={styles.statNumber}>{requests.filter(r => r.status === 'Open').length}</div>
          <div className={styles.statLabel}>Open</div>
        </div>
      </div>

      {onlineUsers.length > 0 && (
        <div className="glass-card" style={{ padding: "0.5rem 1rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem" }}>
          <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#22c55e", boxShadow: "0 0 8px #22c55e" }}></div>
          <span style={{ color: "var(--text-secondary)" }}>Online Now:</span>
          <span>{onlineUsers.map(u => u.name).join(", ")}</span>
        </div>
      )}

      <AdminKanbanClient requests={requests} />
    </main>
  );
}
