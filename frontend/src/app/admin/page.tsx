"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/utils/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Stats {
  totalUsers: number;
  totalQuizzes: number;
  totalAttempts: number;
}

interface Quiz {
  id: string;
  title: string;
  category: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push("/dashboard");
      return;
    }

    const fetchData = async () => {
      if (!user) return;
      try {
        const [statsData, quizzesData] = await Promise.all([
          apiFetch("/admin/stats"),
          apiFetch("/quizzes"),
        ]);
        setStats(statsData);
        setQuizzes(quizzesData);
      } catch (err) {
        console.error("Failed to fetch admin data", err);
      } finally {
        setLoading(false);
      }
    };
    if (!authLoading && user?.role === "admin") {
      fetchData();
    }
  }, [user, authLoading, router]);

  const handleDelete = async (quizId: string) => {
    if (!confirm("Are you sure you want to delete this quiz? All associated questions and attempts will be permanently removed.")) return;
    
    try {
      await apiFetch(`/quizzes/${quizId}`, { method: "DELETE" });
      setQuizzes(quizzes.filter(q => q.id !== quizId));
    } catch (err) {
      console.error("Failed to delete quiz", err);
      alert("Error deleting quiz");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-accent">Loading admin dashboard...</div>;

  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <header className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-3xl font-syne font-bold text-white">Admin Dashboard</h1>
          <p className="text-foreground/40 font-dm-sans">Manage your platform and monitor performance.</p>
        </div>
        <Link 
          href="/admin/create"
          className="px-6 py-2 rounded-xl bg-accent text-background font-bold hover:scale-105 transition-all"
        >
          + Create New Quiz
        </Link>
      </header>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="p-8 rounded-2xl bg-card border border-card-border">
          <span className="text-xs font-bold text-foreground/40 uppercase tracking-widest mb-2 block">Total Users</span>
          <span className="text-5xl font-syne font-bold text-white">{stats?.totalUsers || 0}</span>
        </div>
        <div className="p-8 rounded-2xl bg-card border border-card-border">
          <span className="text-xs font-bold text-foreground/40 uppercase tracking-widest mb-2 block">Total Quizzes</span>
          <span className="text-5xl font-syne font-bold text-white">{stats?.totalQuizzes || 0}</span>
        </div>
        <div className="p-8 rounded-2xl bg-card border border-card-border">
          <span className="text-xs font-bold text-foreground/40 uppercase tracking-widest mb-2 block">Attempts Logged</span>
          <span className="text-5xl font-syne font-bold text-white">{stats?.totalAttempts || 0}</span>
        </div>
      </div>

      {/* QUIZ MANAGEMENT */}
      <section>
        <h2 className="text-xl font-syne font-bold mb-6 italic">Manage Quizzes</h2>
        <div className="bg-card border border-card-border rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-card-border bg-white/5">
                <th className="p-6 text-xs font-bold uppercase text-foreground/40">Quiz Title</th>
                <th className="p-6 text-xs font-bold uppercase text-foreground/40">Category</th>
                <th className="p-6 text-xs font-bold uppercase text-foreground/40">Created</th>
                <th className="p-6 text-xs font-bold uppercase text-foreground/40 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map((quiz) => (
                <tr key={quiz.id} className="border-b border-card-border last:border-0 hover:bg-white/5 transition-all">
                  <td className="p-6 font-medium">{quiz.title}</td>
                  <td className="p-6">
                    <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-[10px] font-bold uppercase">
                      {quiz.category}
                    </span>
                  </td>
                  <td className="p-6 text-sm text-foreground/40">
                    {new Date(quiz.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-6 text-right space-x-4">
                    <Link href={`/admin/edit/${quiz.id}`} className="text-accent text-sm font-bold hover:underline">Edit</Link>
                    <Link href={`/admin/quizzes/${quiz.id}/analytics`} className="text-white/60 text-sm font-bold hover:text-white transition-colors">Analytics</Link>
                    <button 
                      onClick={() => handleDelete(quiz.id)}
                      className="text-error text-sm font-bold hover:underline"
                    >
                      Delete
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
