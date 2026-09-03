"use client";

import { useEffect, useState } from "react";
import styles from "../app/admin/Admin.module.css";
import DeleteButton from "./DeleteButton";
import Link from "next/link";
import TimerButton from "./TimerButton";

type Request = {
  id: number;
  title: string;
  category: string;
  priority: string;
  status: string;
  createdAt: string;
  completedAt: string | null;
  requiredByDate: string | null;
  timeSpent: number;
  timerStartedAt: string | null;
};

const priorityWeight = {
  Urgent: 4,
  High: 3,
  Medium: 2,
  Normal: 2,
  Low: 1
};

export function sortRequests(a: Request, b: Request) {
  const dateA = a.requiredByDate ? new Date(a.requiredByDate).getTime() : Infinity;
  const dateB = b.requiredByDate ? new Date(b.requiredByDate).getTime() : Infinity;
  
  if (dateA !== dateB) {
    return dateA - dateB;
  }
  
  const pA = priorityWeight[a.priority as keyof typeof priorityWeight] || 0;
  const pB = priorityWeight[b.priority as keyof typeof priorityWeight] || 0;
  
  return pB - pA;
}

export default function MyRequests({ refreshKey }: { refreshKey: number }) {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRequests() {
      try {
        const res = await fetch("/api/requests?me=true");
        if (res.ok) {
          const data = await res.json();
          setRequests(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchRequests();
  }, [refreshKey]);

  if (loading) return <div style={{ textAlign: "center", margin: "2rem" }}>Loading your requests...</div>;
  
  if (requests.length === 0) {
    return (
      <div className="glass-card" style={{ margin: "4rem auto", maxWidth: "600px", textAlign: "center", padding: "4rem 2rem" }}>
        <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>No Requests Yet</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "2rem" }}>
          You haven&apos;t submitted any IT requests. Need help or reporting an issue? Click below to get started.
        </p>
        <Link href="/submit" className="btn-primary" style={{ fontSize: "1.25rem", padding: "1rem 2rem" }}>
          + Create New Request
        </Link>
      </div>
    );
  }

  const getPriorityBadgeClass = (priority: string) => {
    switch (priority) {
      case "Urgent": return "badge urgent";
      case "High": return "badge high";
      case "Medium": return "badge medium";
      case "Low": return "badge low";
      default: return "badge";
    }
  };

  const openRequests = requests.filter(r => r.status !== 'Resolved' && r.status !== 'Closed').sort(sortRequests);
  const resolvedRequests = requests.filter(r => r.status === 'Resolved' || r.status === 'Closed').sort(sortRequests);

  const renderCard = (req: Request) => (
    <div key={req.id} className="glass-card" style={{ padding: '1rem', marginBottom: '1rem', border: '1px solid var(--glass-border)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>#{req.id}</span>
        <span className={getPriorityBadgeClass(req.priority)}>{req.priority}</span>
      </div>
      <h3 style={{ fontSize: '1rem', marginBottom: '0.2rem' }}>{req.title}</h3>
      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
        Category: {req.category}
      </div>
      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
        Status: <span style={{ padding: "0.1rem 0.4rem", borderRadius: "4px", backgroundColor: "var(--bg-primary)", border: "1px solid var(--glass-border)" }}>{req.status}</span>
      </div>
      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
        {req.status === 'Resolved' || req.status === 'Closed' ? (
          <>Completed: {req.completedAt ? new Date(req.completedAt).toLocaleDateString() : 'N/A'}</>
        ) : (
          <>Created: {new Date(req.createdAt).toLocaleDateString()}</>
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <TimerButton id={req.id} isRunning={!!req.timerStartedAt} timeSpent={req.timeSpent} timerStartedAt={req.timerStartedAt} readOnly={true} />
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <Link href={`/requests/${req.id}`} className="btn-secondary" style={{ padding: "0.25rem 0.5rem", fontSize: "0.85rem" }}>
            View
          </Link>
          <Link href={`/requests/${req.id}/edit`} className="btn-secondary" style={{ padding: "0.25rem 0.5rem", fontSize: "0.85rem" }}>
            Edit
          </Link>
          <DeleteButton id={req.id} />
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginTop: '2rem' }}>
      <div style={{ flex: '1 1 400px', maxHeight: 'calc(100vh - 250px)', overflowY: 'auto', paddingRight: '1rem' }}>
        <h3 style={{ marginBottom: "1rem", color: "var(--text-primary)", position: "sticky", top: 0, backgroundColor: "var(--bg-primary)", paddingBottom: "0.5rem", zIndex: 10 }}>Open Requests</h3>
        {openRequests.length > 0 ? openRequests.map(renderCard) : <p style={{ color: 'var(--text-secondary)' }}>No open requests.</p>}
      </div>
      <div style={{ flex: '1 1 400px', maxHeight: 'calc(100vh - 250px)', overflowY: 'auto', paddingRight: '1rem' }}>
        <h3 style={{ marginBottom: "1rem", color: "var(--text-primary)", position: "sticky", top: 0, backgroundColor: "var(--bg-primary)", paddingBottom: "0.5rem", zIndex: 10 }}>Resolved Requests</h3>
        {resolvedRequests.length > 0 ? resolvedRequests.map(renderCard) : <p style={{ color: 'var(--text-secondary)' }}>No resolved requests yet.</p>}
      </div>
    </div>
  );
}
