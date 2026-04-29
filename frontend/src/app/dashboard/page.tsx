"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/utils/api";
import Link from "next/link";
import StudentSidebar from "@/components/StudentSidebar";
import Navbar from "@/components/Navbar";

interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  timeLimit: number;
  _count: { questions: number };
}

interface Attempt {
  id: string;
  quizId: string;
  quiz: Quiz;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [unfinishedAttempt, setUnfinishedAttempt] = useState<Attempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    const fetchData = async () => {
      // Fetch quizzes — critical, must succeed
      try {
        const quizzesData = await apiFetch("/quizzes");
        setQuizzes(quizzesData);
      } catch (err) {
        console.error("Failed to fetch quizzes", err);
      }

      // Fetch unfinished attempt — optional, failure is non-fatal
      try {
        const unfinishedData = await apiFetch("/attempts/latest-unfinished");
        setUnfinishedAttempt(unfinishedData ?? null);
      } catch (err) {
        console.error("Failed to fetch latest unfinished attempt", err);
        setUnfinishedAttempt(null);
      }

      setLoading(false);
    };

    if (user) {
      fetchData();
    }
  }, [user, authLoading]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-accent">Loading quizzes...</div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar onToggle={() => setIsSidebarOpen(!isSidebarOpen)} brandText="Arena" />
      <StudentSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <main className={`transition-all duration-300 pt-16 ${isSidebarOpen ? "md:pl-72" : "pl-0"}`}>
        <div className="p-6 md:p-12 font-dm-sans">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-5xl font-syne font-black text-white uppercase tracking-tighter">
              Arena
            </h1>
            <p className="text-foreground/40 text-lg">Welcome back, {user?.name}. Selection is your only task.</p>
          </div>
        </header>

      {/* CONTINUE LAST QUIZ SECTION */}
      {unfinishedAttempt && (
        <section className="mb-16">
          <div className="relative group overflow-hidden rounded-[32px] p-8 md:p-12 bg-gradient-to-br from-accent/20 to-transparent border border-accent/30 shadow-[0_0_50px_rgba(200,255,0,0.1)]">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-accent text-background text-[10px] font-black mb-4 uppercase tracking-[0.2em]">
                  In Progress
                </span>
                <h2 className="text-3xl md:text-5xl font-syne font-black text-white mb-4">
                  Continue {unfinishedAttempt.quiz.title}
                </h2>
                <p className="text-foreground/60 max-w-xl">
                  You have an unfinished attempt. Don't leave those points on the table—finish what you started!
                </p>
              </div>
              <Link
                href={`/quiz/${unfinishedAttempt.quizId}?attemptId=${unfinishedAttempt.id}`}
                className="inline-flex items-center justify-center px-10 py-5 bg-accent text-background text-lg font-black rounded-2xl hover:scale-105 transition-all shadow-[0_20px_40px_rgba(200,255,0,0.3)]"
              >
                Resume Quiz
              </Link>
            </div>
            
            {/* Decorative element */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
          </div>
        </section>
      )}

      <section>
        <h2 className="text-xs font-bold mb-8 uppercase tracking-[.3em] text-foreground/20">
          Available Challenges
        </h2>

        {quizzes.length === 0 ? (
          <div className="p-20 text-center rounded-[32px] bg-card border border-dashed border-card-border text-foreground/20">
            <div className="text-5xl mb-6">🏜️</div>
            <p className="text-xl font-syne">The arena is empty. Check back later for new quizzes!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {quizzes.map((quiz) => (
              <div key={quiz.id} className="group p-8 rounded-[32px] bg-card border border-card-border hover:border-accent/40 hover:translate-y-[-8px] transition-all duration-500 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-white/5 text-foreground/60 text-[10px] font-bold mb-4 uppercase tracking-wider border border-white/5">
                      {quiz.category}
                    </span>
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex items-center justify-center group-hover:border-accent/40 transition-colors">
                      <span className="text-xl">⚡</span>
                    </div>
                  </div>
                  <h3 className="text-2xl font-syne font-bold mb-3 group-hover:text-accent transition-colors leading-tight">
                    {quiz.title}
                  </h3>
                  <p className="text-foreground/40 text-sm mb-8 leading-relaxed line-clamp-2">
                    {quiz.description || "Challenge yourself with this expertly curated quiz."}
                  </p>
                </div>
                
                <div className="flex items-center justify-between pt-6 border-t border-white/5">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-foreground/20 font-bold uppercase tracking-tighter">Capacity</span>
                    <span className="text-sm text-foreground/60 font-medium">
                      {quiz._count.questions} Qs • {quiz.timeLimit / 60}m
                    </span>
                  </div>
                  <Link
                    href={`/quiz/${quiz.id}`}
                    className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center hover:bg-accent hover:text-background transition-all group-hover:scale-110"
                  >
                    <span className="text-xl">→</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
        </div>
      </main>
    </div>
  );
}

