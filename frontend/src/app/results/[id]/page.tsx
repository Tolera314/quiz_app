"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/utils/api";
import Link from "next/link";
import Leaderboard from "@/components/Leaderboard";

interface Option {
  id: string;
  optionText: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  questionText: string;
  options: Option[];
}

interface Answer {
  questionId: string;
  selectedOptionId: string;
}

interface Attempt {
  id: string;
  score: number;
  quizId: string;
  startedAt: string;
  completedAt: string;
  quiz: {
    title: string;
    questions: Question[];
  };
  answers: Answer[];
}

export default function ResultsPage() {
  const { id } = useParams();
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const data = await apiFetch(`/attempts/${id}`);
        setAttempt(data);
      } catch (err) {
        console.error("Failed to fetch results", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [id]);

  if (loading || !attempt) return <div className="min-h-screen flex items-center justify-center text-accent">Calculating results...</div>;

  const totalQuestions = attempt.quiz.questions.length;
  const percentage = Math.round((attempt.score / totalQuestions) * 100);

  // Calculate time taken
  const startTime = new Date(attempt.startedAt).getTime();
  const endTime = new Date(attempt.completedAt).getTime();
  const durationSeconds = Math.floor((endTime - startTime) / 1000);
  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;
  const timeTakenStr = `${minutes}m ${seconds}s`;

  return (
    <div className="min-h-screen bg-background text-white p-6 md:p-12 font-dm-sans">
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h1 className="text-xl font-syne text-foreground/20 uppercase tracking-[.4em] mb-6">Quiz Finalized</h1>
        <h2 className="text-6xl md:text-7xl font-syne font-black text-white mb-12 leading-none">{attempt.quiz.title}</h2>
        
        <div className="flex flex-col md:flex-row gap-8 justify-center items-center mb-16">
          <div className="p-1 bg-gradient-to-tr from-accent to-accent/20 rounded-[32px] shadow-[0_0_60px_rgba(200,255,0,0.15)]">
            <div className="bg-background rounded-[28px] px-12 py-10 flex flex-col items-center">
              <span className="text-sm font-bold text-foreground/40 uppercase tracking-widest mb-2">Performance</span>
              <span className="text-7xl font-syne font-bold text-white mb-2">{attempt.score} <span className="text-3xl text-foreground/20">/ {totalQuestions}</span></span>
              <span className="text-accent font-black tracking-[0.2em]">{percentage}% ACCURACY</span>
            </div>
          </div>

          <div className="p-[1px] bg-white/10 rounded-[32px]">
            <div className="bg-card rounded-[31px] px-12 py-10 flex flex-col items-center min-w-[200px]">
              <span className="text-sm font-bold text-foreground/40 uppercase tracking-widest mb-2">Completion Time</span>
              <span className="text-4xl font-syne font-bold text-white mb-2">{timeTakenStr}</span>
              <span className="text-foreground/40 text-[10px] font-bold tracking-widest uppercase italic">Total Duration</span>
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-6">
          <Link href="/dashboard" className="px-10 py-4 rounded-2xl bg-accent text-background font-black hover:scale-105 transition-all shadow-[0_20px_40px_rgba(200,255,0,0.2)]">
            Home Base
          </Link>
          <Link href="/history" className="px-10 py-4 rounded-2xl border border-white/10 hover:bg-white/5 transition-all font-bold text-foreground/60">
            View History
          </Link>
        </div>
      </div>


      <div className="max-w-3xl mx-auto space-y-12">
        <section>
          <Leaderboard quizId={attempt.quizId} />
        </section>

        <section>
          <h3 className="text-2xl font-syne font-bold mb-8 italic">Breakdown</h3>
        
        {attempt.quiz.questions.map((q, idx) => {
          const userAnswer = attempt.answers.find(a => a.questionId === q.id);
          const isCorrect = q.options.find(opt => opt.id === userAnswer?.selectedOptionId)?.isCorrect;

          return (
            <div key={q.id} className="p-6 rounded-2xl bg-card border border-card-border shadow-lg">
              <div className="flex items-start justify-between mb-6">
                <span className="text-foreground/40 font-mono text-sm mr-4">Q{idx + 1}</span>
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${isCorrect ? "bg-accent/10 text-accent" : "bg-error/10 text-error"}`}>
                  {isCorrect ? "Correct" : "Incorrect"}
                </div>
              </div>
              
              <h4 className="text-lg font-dm-sans mb-6">{q.questionText}</h4>

              <div className="grid grid-cols-1 gap-3">
                {q.options.map(opt => {
                  const isSelected = userAnswer?.selectedOptionId === opt.id;
                  let borderClass = "border-card-border";
                  let bgClass = "bg-background/20";
                  
                  if (isSelected) {
                    borderClass = isCorrect ? "border-accent" : "border-error";
                    bgClass = isCorrect ? "bg-accent/5" : "bg-error/5";
                  } else if (opt.isCorrect) {
                     borderClass = "border-accent/40";
                  }

                  return (
                    <div key={opt.id} className={`p-4 rounded-xl border ${borderClass} ${bgClass} flex items-center justify-between`}>
                      <span className={`text-sm ${isSelected ? "text-white font-medium" : "text-white/60"}`}>{opt.optionText}</span>
                      {opt.isCorrect && (
                        <span className="text-[10px] font-bold text-accent uppercase bg-accent/10 px-2 py-0.5 rounded">Correct Answer</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        </section>
      </div>
    </div>
  );
}
