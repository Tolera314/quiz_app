"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/utils/api";
import AdminSidebar from "@/components/AdminSidebar";
import Navbar from "@/components/Navbar";

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

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  _count: { attempts: number };
}

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push("/dashboard");
      return;
    }

    const fetchData = async () => {
      if (!user) return;
      try {
        const [statsData, quizzesData, usersData] = await Promise.all([
          apiFetch("/admin/stats"),
          apiFetch("/quizzes"),
          apiFetch("/admin/users"),
        ]);
        setStats(statsData);
        setQuizzes(quizzesData);
        setUsers(usersData);
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
    <div className="min-h-screen bg-background">
      <Navbar onToggle={() => setIsSidebarOpen(!isSidebarOpen)} brandText="Admin Core" />
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className={`transition-all duration-300 pt-16 ${isSidebarOpen ? "md:pl-72" : "pl-0"}`}>
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-syne font-black text-white uppercase tracking-tighter">Admin Dashboard</h1>
            <p className="text-foreground/40 font-dm-sans">Manage your platform and monitor performance.</p>
          </div>
          <Link 
            href="/admin/create"
            className="px-8 py-3 rounded-2xl bg-accent text-background font-black hover:scale-105 transition-all shadow-[0_20px_40px_rgba(200,255,0,0.1)]"
          >
            + New Quiz
          </Link>
        </header>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-8 rounded-[32px] bg-card border border-card-border shadow-xl hover:border-accent/20 transition-all">
            <span className="text-[10px] font-bold text-foreground/20 uppercase tracking-[0.2em] mb-4 block">Total Users</span>
            <span className="text-6xl font-syne font-black text-white">{stats?.totalUsers || 0}</span>
          </div>
          <div className="p-8 rounded-[32px] bg-card border border-card-border shadow-xl hover:border-accent/20 transition-all">
            <span className="text-[10px] font-bold text-foreground/20 uppercase tracking-[0.2em] mb-4 block">Total Quizzes</span>
            <span className="text-6xl font-syne font-black text-white">{stats?.totalQuizzes || 0}</span>
          </div>
          <div className="p-8 rounded-[32px] bg-card border border-card-border shadow-xl hover:border-accent/20 transition-all">
            <span className="text-[10px] font-bold text-foreground/20 uppercase tracking-[0.2em] mb-4 block">Attempts</span>
            <span className="text-6xl font-syne font-black text-white">{stats?.totalAttempts || 0}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* QUIZ MANAGEMENT */}
          <section className="lg:col-span-2">
            <h2 className="text-xs font-bold mb-6 uppercase tracking-[0.4em] text-foreground/20">Quiz Registry</h2>
            <div className="bg-card border border-card-border rounded-[32px] overflow-hidden shadow-2xl">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-card-border bg-white/5">
                    <th className="p-6 text-[10px] font-bold uppercase text-foreground/40">Title</th>
                    <th className="p-6 text-[10px] font-bold uppercase text-foreground/40 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {quizzes.map((quiz) => (
                    <tr key={quiz.id} className="border-b border-card-border last:border-0 hover:bg-white/5 transition-all group">
                      <td className="p-6">
                        <p className="font-bold text-white group-hover:text-accent transition-colors">{quiz.title}</p>
                        <p className="text-[10px] text-foreground/40 uppercase tracking-widest">{quiz.category}</p>
                      </td>
                      <td className="p-6 text-right space-x-4">
                        <Link href={`/admin/edit/${quiz.id}`} className="text-white/60 text-xs font-bold hover:text-white transition-colors">Edit</Link>
                        <button 
                          onClick={() => handleDelete(quiz.id)}
                          className="text-error/60 text-xs font-bold hover:text-error transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {quizzes.length === 0 && (
                <div className="p-20 text-center text-foreground/20 italic">No quizzes created yet. Start by initializing a new one.</div>
              )}
            </div>
          </section>

          {/* USER SYNOPSIS */}
          <section className="lg:col-span-1">
            <h2 className="text-xs font-bold mb-6 uppercase tracking-[0.4em] text-foreground/20">User Synopsis</h2>
            <div className="bg-card border border-card-border rounded-[32px] p-8 shadow-2xl flex flex-col h-[calc(100%-3rem)]">
              <div className="flex-1 space-y-6">
                {users.slice(0, 5).map((u) => (
                  <div key={u.id} className="flex justify-between items-center group">
                    <div>
                      <p className="text-sm font-bold text-white group-hover:text-accent transition-colors leading-none mb-1">{u.name}</p>
                      <p className="text-[10px] text-foreground/40 font-mono italic">{u.role}</p>
                    </div>
                    <span className="text-[10px] font-black text-foreground/40">{u._count.attempts} attempts</span>
                  </div>
                ))}
              </div>
              <Link 
                href="/admin/users"
                className="mt-8 block w-full py-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-accent hover:border-accent hover:text-background text-white text-center text-[10px] font-black uppercase tracking-[0.3em] transition-all"
              >
                Enter Full Directory →
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
