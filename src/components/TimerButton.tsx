"use client";

import { useState, useEffect } from "react";


export default function TimerButton({ id, isRunning, timeSpent, timerStartedAt, readOnly = false }: { id: number, isRunning: boolean, timeSpent: number, timerStartedAt?: string | Date | null, readOnly?: boolean }) {
  const [loading, setLoading] = useState(false);
  const [activeTime, setActiveTime] = useState(() => {
    if (isRunning && timerStartedAt) {
      const start = new Date(timerStartedAt).getTime();
      return timeSpent + Math.floor((Date.now() - start) / 1000);
    }
    return timeSpent;
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning && timerStartedAt) {
      const start = new Date(timerStartedAt).getTime();
      interval = setInterval(() => {
        const now = Date.now();
        setActiveTime(timeSpent + Math.floor((now - start) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeSpent, timerStartedAt]);

  const handleToggle = async () => {
    if (readOnly) return;
    setLoading(true);
    const action = isRunning ? "stop" : "start";
    try {
      const res = await fetch(`/api/requests/${id}/timer`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        // If we are on the kanban board (which is client side), we might need window.location.reload()
        // since router.refresh() doesn't refresh client state.
        window.location.reload();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      {!readOnly && (
        <button 
          onClick={handleToggle}
          disabled={loading}
          style={{
            background: "transparent",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "1.25rem",
            opacity: loading ? 0.5 : 1
          }}
          title={isRunning ? "Stop Timer" : "Start Timer"}
        >
          {isRunning ? "🛑" : "▶️"}
        </button>
      )}
      <span style={{ fontSize: "0.85rem", color: isRunning ? "var(--accent-primary)" : "var(--text-secondary)", fontWeight: isRunning ? "bold" : "normal" }}>
        {formatTime(activeTime)}
      </span>
      {readOnly && isRunning && (
        <span style={{ fontSize: "0.7rem", color: "var(--accent-primary)", fontStyle: "italic", animation: "pulse 2s infinite" }}>
          (Admin is working on this)
        </span>
      )}
    </div>
  );
}
