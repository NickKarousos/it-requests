"use client";

import { useState } from "react";

export default function DeleteButton({ id }: { id: number }) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this request? This cannot be undone.")) {
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(`/api/requests/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        window.location.reload();
      } else {
        const data = await res.json().catch(() => ({}));
        alert("Failed to delete request: " + (data.error || "Unknown error"));
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={loading}
      className="btn-secondary"
      style={{
        padding: "0.25rem 0.5rem",
        fontSize: "0.85rem",
        color: "var(--danger)",
        borderColor: "rgba(239, 68, 68, 0.3)",
        opacity: loading ? 0.5 : 1
      }}
      title="Delete Request"
    >
      Delete
    </button>
  );
}
