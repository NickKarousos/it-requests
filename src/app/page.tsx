import { getServerSession } from "next-auth/next";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import MyRequests from "@/components/MyRequests";
import Link from "next/link";

export const dynamic = 'force-dynamic';

export default async function MyRequestsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect("/login");
  }
  
  // Allow Admins to view the dashboard too

  return (
    <main className="container">
      <header className="page-header" style={{ marginBottom: "2rem", display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
        <div style={{ position: "absolute", top: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              Logged in as <strong style={{ color: "var(--text-primary)" }}>{session.user?.name}</strong>
            </span>
            <Link href="/api/auth/signout" className="btn-secondary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}>
              Sign Out
            </Link>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <Link href="/submit" className="btn-primary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}>
              + New Request
            </Link>
            {session.user?.role === "ADMIN" && (
              <Link href="/admin" className="btn-secondary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}>
                Admin Dashboard →
              </Link>
            )}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="ROBBIE Logo" style={{ height: "90px" }} />
          <div>
            <h1 className="page-title" style={{ marginBottom: 0, fontSize: "2rem" }}>My Requests</h1>
          </div>
        </div>
        <p className="page-subtitle" style={{ fontSize: "1rem", marginTop: "0.5rem", textAlign: "center" }}>Track and manage your submitted requests.</p>
      </header>

      <section style={{ maxWidth: "100%", padding: "0 4rem", margin: "0 auto" }}>
        <MyRequests refreshKey={0} />
      </section>
    </main>
  );
}
