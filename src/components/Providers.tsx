"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { useEffect } from "react";

function ActiveUserPinger() {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user) return;

    // Ping immediately when the app loads
    fetch('/api/ping', { method: 'POST' }).catch(console.error);

    // Ping every 2 minutes
    const interval = setInterval(() => {
      fetch('/api/ping', { method: 'POST' }).catch(console.error);
    }, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, [session]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ActiveUserPinger />
      {children}
    </SessionProvider>
  );
}
