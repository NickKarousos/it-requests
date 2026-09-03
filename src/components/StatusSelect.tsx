"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StatusSelect({ id, currentStatus }: { id: number, currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    setLoading(true);

    try {
      const res = await fetch(`/api/requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to update status");
        setStatus(currentStatus);
      }
    } catch (error) {
      console.error(error);
      setStatus(currentStatus);
    } finally {
      setLoading(false);
    }
  };

  return (
    <select 
      value={status}
      onChange={handleChange}
      className="input-field" 
      style={{ padding: "0.25rem 0.5rem", fontSize: "0.85rem", height: "auto", opacity: loading ? 0.5 : 1 }}
      disabled={loading}
    >
      <option value="Open">Open</option>
      <option value="In Progress">In Progress</option>
      <option value="Resolved">Resolved</option>
    </select>
  );
}
