"use client";

import React, { useEffect, useState } from "react";
import { apiFetch } from "@/utils/api";
import Link from "next/link";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import StudentSidebar from "@/components/StudentSidebar";
import Navbar from "@/components/Navbar";

interface Attempt {
  id: string;
  score: number;
  startedAt: string;
  quiz: {
    title: string;
    category: string;
  };
}

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const [history, setHistory] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    const fetchHistory = async () => {
      try {
        const data = await apiFetch("/attempts/history");
        setHistory(data);
      } catch (err) {
        console.error("Failed to fetch history", err);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) {
      fetchHistory();
    }
  }, [user, authLoading]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-accent">Loading history...</div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar onToggle={() => setIsSidebarOpen(!isSidebarOpen)} brandText="Attempt Lore" />
      <StudentSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className={`transition-all duration-300 pt-16 ${isSidebarOpen ? "md:pl-72" : "pl-0"}`}>
        <div className="p-6 md:p-12">
          <header className="flex justify-between items-center mb-12">
            <div>
              <h1 className="text-3xl font-syne font-bold text-white">Attempt History</h1>
              <p className="text-foreground/40 font-dm-sans">Track your growth and past performances.</p>
            </div>
          </header>

      <div className="max-w-4xl mx-auto space-y-4">
        {history.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-card border border-dashed border-card-border text-foreground/40 font-dm-sans">
            You haven't attempted any quizzes yet. Go to the dashboard to start!
          </div>
        ) : (
          history.map((attempt) => (
            <div key={attempt.id} className="p-6 rounded-2xl bg-card border border-card-border hover:border-white/10 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-bold mr-4 text-xs">
                  {attempt.quiz.category.substring(0, 3).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-syne font-bold text-lg leading-tight mb-1">{attempt.quiz.title}</h3>
                  <p className="text-xs text-foreground/40 font-mono">
                    {format(new Date(attempt.startedAt), "MMM dd, yyyy • HH:mm")}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-8">
                <div className="text-right">
                  <span className="block text-2xl font-syne font-bold text-white leading-none">{attempt.score}</span>
                  <span className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest">Score</span>
                </div>
                
                <Link
                  href={`/results/${attempt.id}`}
                  className="px-6 py-2 rounded-xl border border-accent/20 text-accent font-bold text-sm hover:bg-accent hover:text-background transition-all"
                >
                  Review
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
        </div>
      </main>
    </div>
  );
}
