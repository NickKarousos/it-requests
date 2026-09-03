"use client";


import RequestForm from "@/components/RequestForm";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  return (
    <main className="container" style={{ zoom: 0.9 }}>
      <header className="page-header" style={{ position: "relative" }}>
        <div style={{ position: "absolute", top: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            {session ? (
              <>
                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                  Logged in as <strong style={{ color: "var(--text-primary)" }}>{session.user?.name}</strong>
                </span>
                <button onClick={() => signOut()} className="btn-secondary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}>
                  Sign Out
                </button>
              </>
            ) : (
              <Link href="/login" className="btn-primary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}>
                Log In
              </Link>
            )}
          </div>
          {session && (
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {session.user?.role !== "ADMIN" && (
                <Link href="/" className="btn-secondary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}>
                  My Requests
                </Link>
              )}
              {session.user?.role === "ADMIN" && (
                <Link href="/admin" className="btn-secondary" style={{ padding: "0.4rem 0.8rem", fontSize: "0.85rem" }}>
                  Admin Dashboard →
                </Link>
              )}
            </div>
          )}
        </div>
        
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem", marginBottom: "0.5rem" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="ROBBIE Logo" style={{ height: "90px" }} />
          <h1 className="page-title" style={{ marginBottom: 0 }}>IT Requests</h1>
        </div>
        <p className="page-subtitle">Submit a request, report a bug, or ask for something you need.</p>
      </header>

      <section style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <RequestForm />
        
      </section>
    </main>
  );
}
