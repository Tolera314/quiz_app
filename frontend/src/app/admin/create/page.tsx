"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/utils/api";

interface QuestionInput {
  text: string;
  options: { text: string; isCorrect: boolean }[];
}

export default function CreateQuizPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Quiz Info
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("General");
  const [timeLimit, setTimeLimit] = useState(600); // 10 mins default
  const [quizId, setQuizId] = useState("");

  // Questions Manual Mode
  const [questions, setQuestions] = useState<QuestionInput[]>([
    { text: "", options: [{ text: "", isCorrect: true }, { text: "", isCorrect: false }, { text: "", isCorrect: false }, { text: "", isCorrect: false }] }
  ]);

  // Bulk Mode
  const [isBulk, setIsBulk] = useState(false);
  const [bulkJson, setBulkJson] = useState("");

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await apiFetch("/quizzes", {
        method: "POST",
        body: JSON.stringify({ title, description, category, timeLimit }),
      });
      setQuizId(data.id);
      setStep(2);
    } catch (err) {
      console.error(err);
      alert("Failed to create quiz info");
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    setQuestions([...questions, { text: "", options: [{ text: "", isCorrect: true }, { text: "", isCorrect: false }, { text: "", isCorrect: false }, { text: "", isCorrect: false }] }]);
  };

  const updateQuestion = (idx: number, text: string) => {
    const newQs = [...questions];
    newQs[idx].text = text;
    setQuestions(newQs);
  };

  const updateOption = (qIdx: number, oIdx: number, text: string) => {
    const newQs = [...questions];
    newQs[qIdx].options[oIdx].text = text;
    setQuestions(newQs);
  };

  const setCorrectOption = (qIdx: number, oIdx: number) => {
    const newQs = [...questions];
    newQs[qIdx].options = newQs[qIdx].options.map((opt, i) => ({ ...opt, isCorrect: i === oIdx }));
    setQuestions(newQs);
  };

  const handleSaveQuestions = async () => {
    if (isBulk && !bulkJson.trim()) return;
    
    setLoading(true);
    try {
      if (isBulk) {
        const parsed = JSON.parse(bulkJson);
        await apiFetch(`/admin/quizzes/${quizId}/bulk-questions`, {
          method: "POST",
          body: JSON.stringify({ quizId, questions: parsed }),
        });
      } else {
        await apiFetch("/quizzes/questions", {
          method: "POST",
          body: JSON.stringify({ quizId, questions }),
        });
      }
      router.push("/admin");
    } catch (err: any) {
      console.error(err);
      alert("Failed to add questions. " + (isBulk ? "Check JSON format." : ""));
    } finally {
      setLoading(false);
    }
  };

  const loadTemplate = () => {
    const template = [
      {
        "questionText": "Example Question 1?",
        "options": [
          { "optionText": "Correct Answer", "isCorrect": true },
          { "optionText": "Incorrect Answer", "isCorrect": false }
        ]
      },
      {
        "questionText": "Example Question 2?",
        "options": [
          { "optionText": "Option A", "isCorrect": false },
          { "optionText": "Option B (Correct)", "isCorrect": true }
        ]
      }
    ];
    setBulkJson(JSON.stringify(template, null, 2));
  };

  return (
    <div className="min-h-screen bg-background p-6 md:p-12 font-dm-sans">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <button 
              onClick={() => step === 1 ? router.push("/admin") : setStep(1)}
              className="text-foreground/40 text-sm hover:text-white mb-4 transition-all"
            >
              ← {step === 1 ? "Exit to Admin" : "Back to Settings"}
            </button>
            <h1 className="text-4xl font-syne font-bold text-white mb-2 tracking-tight">
              {step === 1 ? "Initialize Quiz" : "Content Generation"}
            </h1>
            <p className="text-foreground/40 italic">Phase {step} of 2</p>
          </div>
          {step === 2 && (
             <div className="flex bg-card p-1 rounded-xl border border-card-border mb-2">
                <button 
                  onClick={() => setIsBulk(false)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${!isBulk ? 'bg-accent text-background' : 'text-foreground/40 hover:text-white'}`}
                >
                  Manual
                </button>
                <button 
                  onClick={() => setIsBulk(true)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${isBulk ? 'bg-accent text-background' : 'text-foreground/40 hover:text-white'}`}
                >
                  Bulk JSON
                </button>
             </div>
          )}
        </header>

        {step === 1 ? (
          <form onSubmit={handleCreateQuiz} className="space-y-6 bg-card p-8 rounded-3xl border border-card-border shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold mb-2 uppercase tracking-widest text-foreground/40">Quiz Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-background border border-card-border p-4 rounded-xl outline-none focus:border-accent text-white"
                  placeholder="The Future of Web Development"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold mb-2 uppercase tracking-widest text-foreground/40">Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-background border border-card-border p-4 rounded-xl outline-none focus:border-accent text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold mb-2 uppercase tracking-widest text-foreground/40">Time (Seconds)</label>
                <input
                  type="number"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                  className="w-full bg-background border border-card-border p-4 rounded-xl outline-none focus:border-accent text-white"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold mb-2 uppercase tracking-widest text-foreground/40">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-background border border-card-border p-4 rounded-xl outline-none focus:border-accent h-32 text-white"
                  placeholder="Master the core concepts of..."
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-accent text-background font-black rounded-2xl hover:scale-[1.01] transition-all uppercase tracking-widest shadow-[0_10px_30px_rgba(200,255,0,0.1)] flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-background/20 border-t-background rounded-full animate-spin" />
                  Generating ID...
                </>
              ) : "Continue to Phase 2"}
            </button>
          </form>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {isBulk ? (
              <div className="bg-card p-8 rounded-3xl border border-accent/20 shadow-[0_0_50px_rgba(200,255,0,0.05)]">
                 <div className="flex justify-between items-center mb-4">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-foreground/60">JSON Question Array</label>
                    <button 
                      onClick={loadTemplate}
                      className="text-[10px] font-bold text-accent hover:underline uppercase tracking-widest"
                    >
                      Load Working Example
                    </button>
                 </div>
                 <textarea
                  value={bulkJson}
                  onChange={(e) => setBulkJson(e.target.value)}
                  placeholder='[{"questionText": "Example?", "options": [{"optionText": "Yes", "isCorrect": true}]}]'
                  className="w-full bg-background border border-card-border p-5 rounded-2xl outline-none focus:border-accent h-96 text-xs font-mono text-accent/80 leading-relaxed"
                />
              </div>
            ) : (
              <div className="space-y-8">
                {questions.map((q, qIdx) => (
                  <div key={qIdx} className="bg-card p-8 rounded-3xl border border-card-border relative shadow-lg">
                    <div className="absolute -left-3 top-8 bg-accent text-background w-8 h-8 rounded-lg flex items-center justify-center font-black shadow-lg">
                      {qIdx + 1}
                    </div>
                    
                    <div className="mb-8">
                      <label className="block text-[10px] font-bold mb-2 uppercase text-foreground/20 tracking-widest italic">Question String</label>
                      <input
                        type="text"
                        value={q.text}
                        onChange={(e) => updateQuestion(qIdx, e.target.value)}
                        className="w-full text-2xl font-syne font-bold bg-transparent border-b border-card-border py-4 outline-none focus:border-accent transition-all text-white"
                        placeholder="Challenge context..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx} className={`p-4 rounded-xl border flex items-center gap-4 transition-all ${opt.isCorrect ? "bg-accent/5 border-accent/40" : "bg-background/40 border-card-border"}`}>
                          <input
                            type="radio"
                            name={`q-${qIdx}`}
                            checked={opt.isCorrect}
                            onChange={() => setCorrectOption(qIdx, oIdx)}
                            className="w-5 h-5 accent-accent cursor-pointer"
                          />
                          <input
                            type="text"
                            value={opt.text}
                            onChange={(e) => updateOption(qIdx, oIdx, e.target.value)}
                            className="flex-1 bg-transparent border-none outline-none text-sm placeholder:text-white/10 text-white"
                            placeholder={`Option ${oIdx + 1}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                <button
                  onClick={handleAddQuestion}
                  className="w-full py-4 border border-dashed border-card-border rounded-2xl font-bold text-foreground/40 hover:text-white hover:bg-white/5 transition-all text-sm uppercase tracking-widest"
                >
                  + Append New Question
                </button>
              </div>
            )}

            <div className="flex flex-col md:flex-row gap-4 pt-12 border-t border-card-border">
              <button
                onClick={handleSaveQuestions}
                disabled={loading || (isBulk && !bulkJson)}
                className="flex-1 py-5 bg-accent text-background font-black rounded-2xl hover:scale-[1.02] transition-all disabled:opacity-50 shadow-[0_20px_40px_rgba(200,255,0,0.15)] flex items-center justify-center gap-3"
              >
                {loading ? (
                   <>
                    <div className="w-5 h-5 border-2 border-background/20 border-t-background rounded-full animate-spin" />
                    Deploying...
                  </>
                ) : (isBulk ? "Deploy Bulk Collection" : "Finalize & Publish Quiz")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
