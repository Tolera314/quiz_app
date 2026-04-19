"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/utils/api";

interface Option {
  id: string;
  optionText: string;
}

interface Question {
  id: string;
  questionText: string;
  options: Option[];
}

interface Quiz {
  id: string;
  title: string;
  timeLimit: number;
  questions: Question[];
}

export default function QuizPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: string]: string }>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const isSubmittingRef = React.useRef(false);

  // START OR RESUME ATTEMPT
  useEffect(() => {
    const initializeQuiz = async () => {
      try {
        const resumeId = searchParams.get("attemptId");
        let currentAttemptId = resumeId;
        let initialAnswers: any = {};
        let initialTimeLeft = 0;

        if (resumeId) {
          // Resume existing
          const attemptData = await apiFetch(`/attempts/${resumeId}`);
          if (attemptData.completedAt) {
            router.push(`/results/${resumeId}`);
            return;
          }
          
          attemptData.answers.forEach((ans: any) => {
            initialAnswers[ans.questionId] = ans.selectedOptionId;
          });

          // Calculate time left
          const endTime = new Date(attemptData.scheduledEndTime).getTime();
          initialTimeLeft = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
        } else {
          // Start new
          const attemptData = await apiFetch("/attempts/start", {
            method: "POST",
            body: JSON.stringify({ quizId: id }),
          });
          currentAttemptId = attemptData.id;
        }

        // Fetch quiz with seeded randomization
        const quizData = await apiFetch(`/quizzes/${id}?attemptId=${currentAttemptId}`);
        
        setQuiz(quizData);
        setAttemptId(currentAttemptId);
        setAnswers(initialAnswers);
        if (!resumeId) {
          setTimeLeft(quizData.timeLimit);
        } else {
          setTimeLeft(initialTimeLeft);
        }

      } catch (err) {
        console.error("Failed to initialize quiz", err);
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    initializeQuiz();
  }, [id, router, searchParams]);



  const handleSubmit = useCallback(async () => {
    if (!attemptId || isSubmittingRef.current) return;
    
    isSubmittingRef.current = true;
    setSubmitting(true);

    try {
      const formattedAnswers = Object.entries(answers).map(([qId, oId]) => ({
        questionId: qId,
        selectedOptionId: oId,
      }));

      await apiFetch("/attempts/submit", {
        method: "POST",
        body: JSON.stringify({ attemptId, answers: formattedAnswers }),
      });
      router.push(`/results/${attemptId}`);
    } catch (err: any) {
      console.error("Failed to submit quiz", err);
      // If it was already submitted, just go to results
      if (err.message === "Attempt already submitted") {
        router.push(`/results/${attemptId}`);
      } else {
        isSubmittingRef.current = false;
        setSubmitting(false);
      }
    }
  }, [attemptId, answers, router]);

  // TIMER LOGIC
  useEffect(() => {
    if (timeLeft <= 0 && !loading && quiz && !isSubmittingRef.current) {
      handleSubmit();
      return;
    }

    if (isSubmittingRef.current) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, loading, quiz, handleSubmit]);


  const handleOptionSelect = async (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    
    // Silent background sync
    if (attemptId) {
      try {
        apiFetch("/attempts/save-answer", {
          method: "POST",
          body: JSON.stringify({ attemptId, questionId, selectedOptionId: optionId }),
        });
      } catch (err) {
        // Silent fail as per user request
        console.error("Silent sync failed", err);
      }
    }
  };

  if (loading || !quiz) return <div className="min-h-screen flex items-center justify-center text-accent">Initializing quiz...</div>;

  const currentQuestion = quiz.questions[currentIndex];
  const progress = ((currentIndex + 1) / quiz.questions.length) * 100;

  return (
    <div className="min-h-screen bg-background text-white p-6 md:p-12">
      {/* HEADER */}
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-10">
        <div>
          <h1 className="text-2xl font-syne font-bold">{quiz.title}</h1>
          <p className="text-foreground/40 text-sm">Question {currentIndex + 1} of {quiz.questions.length}</p>
        </div>
        <div className={`px-4 py-2 rounded-xl border font-mono font-bold ${timeLeft < 30 ? "border-error text-error animate-pulse" : "border-card-border text-accent"}`}>
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
        </div>
      </div>

      {/* PROGRESS BAR */}
      <div className="max-w-4xl mx-auto h-1.5 w-full bg-card border border-card-border rounded-full mb-12 overflow-hidden">
        <div 
          className="h-full bg-accent transition-all duration-300 shadow-[0_0_10px_rgba(200,255,0,0.5)]" 
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* QUESTION CARD */}
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="p-8 rounded-3xl bg-card border border-card-border shadow-xl">
          <h2 className="text-2xl font-dm-sans font-medium mb-10 leading-relaxed">
            {currentQuestion.questionText}
          </h2>

          <div className="grid grid-cols-1 gap-4">
            {currentQuestion.options.map((option) => (
              <button
                key={option.id}
                onClick={() => handleOptionSelect(currentQuestion.id, option.id)}
                className={`p-5 rounded-2xl border text-left transition-all flex items-center group ${
                  answers[currentQuestion.id] === option.id
                    ? "bg-accent/10 border-accent shadow-[inset_0_0_15px_rgba(200,255,0,0.1)]"
                    : "bg-background/40 border-card-border hover:border-white/20"
                }`}
              >
                <div className={`w-6 h-6 rounded-full border mr-4 flex items-center justify-center transition-all ${
                  answers[currentQuestion.id] === option.id
                    ? "bg-accent border-accent"
                    : "border-card-border group-hover:border-white/40"
                }`}>
                  {answers[currentQuestion.id] === option.id && (
                    <div className="w-2.5 h-2.5 rounded-full bg-background" />
                  )}
                </div>
                <span className={`font-dm-sans ${answers[currentQuestion.id] === option.id ? "text-white" : "text-white/70"}`}>
                  {option.optionText}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* NAVIGATION */}
        <div className="flex justify-between items-center pt-6">
          <button
            onClick={() => setCurrentIndex((p) => Math.max(0, p - 1))}
            disabled={currentIndex === 0}
            className="px-8 py-3 rounded-xl border border-card-border hover:bg-white/5 transition-all disabled:opacity-30 disabled:hover:bg-transparent"
          >
            Previous
          </button>
          
          {currentIndex === quiz.questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-10 py-3 rounded-xl bg-accent text-background font-bold hover:scale-105 active:scale-95 transition-all"
            >
              {submitting ? "Submitting..." : "Submit Quiz"}
            </button>
          ) : (
            <button
              onClick={() => setCurrentIndex((p) => Math.min(quiz.questions.length - 1, p + 1))}
              className="px-8 py-3 rounded-xl bg-card border border-card-border hover:border-white/20 hover:bg-white/5 transition-all font-bold"
            >
              Next Question
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
