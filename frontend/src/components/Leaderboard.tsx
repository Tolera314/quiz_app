"use client";

import React, { useEffect, useState } from "react";
import { apiFetch } from "@/utils/api";

interface LeaderboardEntry {
  id: string;
  score: number;
  startedAt: string;
  user: {
    name: string;
    email: string;
  };
}

interface LeaderboardProps {
  quizId: string;
}

export default function Leaderboard({ quizId }: LeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await apiFetch(`/quizzes/${quizId}/leaderboard`);
        setEntries(data);
      } catch (err) {
        console.error("Failed to fetch leaderboard", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [quizId]);

  if (loading) return <div className="p-8 text-accent text-center animate-pulse">Loading rankings...</div>;
  if (entries.length === 0) return <div className="p-8 text-white/20 text-center italic">No attempts logged yet. Be the first!</div>;

  return (
    <div className="bg-card/30 rounded-3xl border border-card-border overflow-hidden">
      <div className="p-6 border-b border-card-border bg-white/5">
        <h3 className="text-lg font-syne font-bold text-white flex items-center gap-2">
          🏆 Top Performers
        </h3>
      </div>
      <div className="divide-y divide-card-border">
        {entries.map((entry, index) => (
          <div key={entry.id} className="p-6 flex items-center justify-between group hover:bg-white/5 transition-all">
            <div className="flex items-center gap-4">
              <span className={`w-8 font-syne font-black text-xl flex items-center justify-center ${
                index === 0 ? "text-accent" : 
                index === 1 ? "text-white/80" : 
                index === 2 ? "text-white/50" : "text-white/20"
              }`}>
                {index + 1}
              </span>
              <div>
                <p className="font-dm-sans font-bold text-white group-hover:text-accent transition-colors">{entry.user.name}</p>
                <p className="text-xs text-foreground/40 font-mono italic">#{entry.id.slice(0, 5)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-syne font-bold text-accent">{entry.score}</p>
              <p className="text-[10px] uppercase font-bold tracking-widest text-foreground/40">Points</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
