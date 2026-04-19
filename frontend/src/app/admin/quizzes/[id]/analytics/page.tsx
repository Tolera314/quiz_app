"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/utils/api";

interface Analytics {
  totalAttempts: number;
  uniqueStudents: number;
  avgScore: number;
  highestScore: number;
  recentAttempts: any[];
}

export default function QuizAnalyticsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await apiFetch(`/admin/quizzes/${id}/analytics`);
        setAnalytics(data);
      } catch (err) {
        console.error(err);
        alert("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [id]);

  if (loading || !analytics) return <div className="min-h-screen flex items-center justify-center text-accent">Crunching data...</div>;

  return (
    <div className="min-h-screen bg-background p-6 md:p-12 font-dm-sans">
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <button 
              onClick={() => router.back()}
              className="text-foreground/40 text-sm hover:text-white mb-4 transition-all"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-5xl font-syne font-black text-white mb-2 uppercase tracking-tighter">Impact <span className="text-accent">Metrics</span></h1>
            <p className="text-foreground/40">Real-time performance distribution for this challenge.</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <StatCard label="Total Submissions" value={analytics.totalAttempts} subValue="All time" />
          <StatCard label="Unique Students" value={analytics.uniqueStudents} subValue="Participants" />
          <StatCard label="Average Performance" value={`${Math.round(analytics.avgScore * 10) / 10}`} subValue="Mean score" accent />
          <StatCard label="Peak Achievement" value={analytics.highestScore} subValue="High score" />
        </div>

        <section className="bg-card border border-card-border rounded-[32px] overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-card-border bg-white/5 flex justify-between items-center">
            <h2 className="text-xl font-syne font-bold uppercase tracking-widest text-white/80">Activity Stream</h2>
            <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest px-3 py-1 bg-background rounded-full">Recent Entries</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-card-border">
                  <th className="p-8 text-[10px] font-black uppercase text-foreground/20 tracking-[.2em]">Student ID</th>
                  <th className="p-8 text-[10px] font-black uppercase text-foreground/20 tracking-[.2em]">Result</th>
                  <th className="p-8 text-[10px] font-black uppercase text-foreground/20 tracking-[.2em]">Completion Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border/50">
                {analytics.recentAttempts.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-12 text-center text-foreground/20 italic">No data points recorded yet.</td>
                  </tr>
                ) : (
                  analytics.recentAttempts.map((attempt, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-8 font-mono text-xs text-white/60">{attempt.userId}</td>
                      <td className="p-8 font-syne font-bold text-xl text-accent">{attempt.score} <span className="text-xs text-foreground/40 font-dm-sans">points</span></td>
                      <td className="p-8 text-sm text-foreground/40">{new Date(attempt.completedAt).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value, subValue, accent = false }: { label: string, value: any, subValue: string, accent?: boolean }) {
  return (
    <div className={`p-8 rounded-[32px] bg-card border ${accent ? 'border-accent/40 shadow-[0_0_30px_rgba(200,255,0,0.1)]' : 'border-card-border'}`}>
      <span className="text-[10px] font-bold text-foreground/20 uppercase tracking-[.2em] mb-4 block">{label}</span>
      <div className="flex items-baseline gap-2 mb-2">
        <span className={`text-5xl font-syne font-black ${accent ? 'text-accent' : 'text-white'}`}>{value}</span>
      </div>
      <span className="text-xs text-foreground/40 font-medium italic">{subValue}</span>
    </div>
  );
}
