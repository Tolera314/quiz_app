"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/utils/api";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password, role }),
      });
      login(data.token, data.user);
    } catch (err: any) {
      setError(err.message || "Failed to register");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md p-8 rounded-2xl bg-card border border-card-border shadow-2xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-syne font-extrabold text-accent mb-2">JOIN US</h1>
          <p className="text-foreground/60 font-dm-sans">Start your journey today.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 text-sm text-white bg-error/20 border border-error/50 rounded-lg text-center">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1 pl-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-background border border-card-border focus:border-accent outline-none transition-all placeholder:text-white/20"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 pl-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-background border border-card-border focus:border-accent outline-none transition-all placeholder:text-white/20"
              placeholder="name@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 pl-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-background border border-card-border focus:border-accent outline-none transition-all placeholder:text-white/20"
              placeholder="••••••••"
              required
            />
          </div>

          <input type="hidden" value="user" />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-accent text-background font-bold text-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
          >
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

        <p className="text-center mt-8 text-sm text-foreground/40">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-accent hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </main>
  );
}
