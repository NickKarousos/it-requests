"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CompleteButton({ id, currentStatus }: { id: number, currentStatus: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  if (currentStatus === "Resolved" || currentStatus === "Closed") {
    return null;
  }

  const handleComplete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Resolved" }),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleComplete}
      disabled={loading}
      className="btn-primary"
      style={{
        padding: "0.25rem 0.5rem",
        fontSize: "0.85rem",
        opacity: loading ? 0.5 : 1,
        backgroundColor: "var(--success)"
      }}
      title="Mark as Completed"
    >
      Complete
    </button>
  );
}
