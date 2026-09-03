"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <main className="container" style={{ maxWidth: "500px" }}>
      <div className="glass-card">
        <h1 className="page-title" style={{ textAlign: "center", fontSize: "2rem" }}>Log In</h1>
        <p className="page-subtitle" style={{ textAlign: "center", marginBottom: "2rem" }}>Access the IT Requests Portal</p>
        
        {error && <div style={{ color: "var(--danger)", marginBottom: "1rem", textAlign: "center" }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label" htmlFor="email">Email</label>
            <input required type="email" id="email" name="email" className="input-field" placeholder="you@company.com" />
          </div>
          <div className="input-group">
            <label className="input-label" htmlFor="password">Password</label>
            <input required type="password" id="password" name="password" className="input-field" />
          </div>
          <div className="input-group" style={{ flexDirection: "row", alignItems: "center", gap: "0.5rem" }}>
            <input type="checkbox" id="rememberMe" name="rememberMe" defaultChecked />
            <label htmlFor="rememberMe" style={{ color: "var(--text-secondary)", fontSize: "0.85rem", cursor: "pointer" }}>
              Remember me for 30 days
            </label>
          </div>
          <button type="submit" className="btn-primary" style={{ width: "100%" }}>Log In</button>
        </form>
      </div>
    </main>
  );
}
