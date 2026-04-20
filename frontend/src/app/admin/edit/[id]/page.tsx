"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/utils/api";
import AdminSidebar from "@/components/AdminSidebar";
import Navbar from "@/components/Navbar";

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

export default function EditQuizPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [timeLimit, setTimeLimit] = useState(600);
  const [questions, setQuestions] = useState<Question[]>([]);
  
  // New Question State
  const [newQuestionText, setNewQuestionText] = useState("");
  const [newOptions, setNewOptions] = useState([
    { optionText: "", isCorrect: true },
    { optionText: "", isCorrect: false },
    { optionText: "", isCorrect: false },
    { optionText: "", isCorrect: false },
  ]);
  const [creating, setCreating] = useState(false);

  // Bulk Upload State
  const [bulkJson, setBulkJson] = useState("");
  const [bulkLoading, setBulkLoading] = useState(false);

  const fetchQuiz = async () => {
    try {
      const data = await apiFetch(`/quizzes/${id}`);
      setTitle(data.title);
      setDescription(data.description || "");
      setCategory(data.category);
      setTimeLimit(data.timeLimit);
      setQuestions(data.questions || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load quiz");
      router.push("/admin");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuiz();
  }, [id, router]);

  const handleUpdateDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiFetch(`/quizzes/${id}`, {
        method: "PUT",
        body: JSON.stringify({ title, description, category, timeLimit }),
      });
      alert("Details updated!");
    } catch (err) {
      console.error(err);
      alert("Failed to update quiz");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuestion = async (qId: string) => {
    if (!confirm("Remove this question?")) return;
    try {
      await apiFetch(`/admin/questions/${qId}`, { method: "DELETE" });
      setQuestions(questions.filter(q => q.id !== qId));
    } catch (err) {
      alert("Error deleting question");
    }
  };

  const handleUpdateQuestion = async (q: Question) => {
    try {
      await apiFetch(`/admin/questions/${q.id}`, {
        method: "PUT",
        body: JSON.stringify({ questionText: q.questionText, options: q.options }),
      });
      alert("Question updated!");
    } catch (err) {
      alert("Error updating question");
    }
  };

  const handleBulkUpload = async () => {
    try {
      setBulkLoading(true);
      const parsed = JSON.parse(bulkJson);
      if (!Array.isArray(parsed)) throw new Error("Format must be an array");
      
      await apiFetch(`/admin/quizzes/${id}/bulk-questions`, {
        method: "POST",
        body: JSON.stringify({ quizId: id, questions: parsed }),
      });

      setBulkJson("");
      alert("Bulk upload successful!");
      fetchQuiz();
    } catch (err: any) {
      alert("Invalid JSON format. Please use the template.\n" + err.message);
    } finally {
      setBulkLoading(false);
    }
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;
    setCreating(true);
    try {
      await apiFetch(`/admin/quizzes/${id}/questions`, {
        method: "POST",
        body: JSON.stringify({ 
          quizId: id, 
          questionText: newQuestionText, 
          options: newOptions.filter(o => o.optionText.trim() !== "") 
        }),
      });
      setNewQuestionText("");
      setNewOptions([
        { optionText: "", isCorrect: true },
        { optionText: "", isCorrect: false },
        { optionText: "", isCorrect: false },
        { optionText: "", isCorrect: false },
      ]);
      alert("Question added!");
      fetchQuiz();
    } catch (err) {
      alert("Error creating question");
    } finally {
      setCreating(false);
    }
  };

  const copyTemplate = () => {
    const template = [
      {
        "questionText": "What is the capital of France?",
        "options": [
          { "optionText": "Paris", "isCorrect": true },
          { "optionText": "London", "isCorrect": false }
        ]
      }
    ];
    setBulkJson(JSON.stringify(template, null, 2));
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-accent">Loading engine...</div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar onToggle={() => setIsSidebarOpen(!isSidebarOpen)} brandText="Admin Core" />
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className={`transition-all duration-300 pt-16 ${isSidebarOpen ? "md:pl-72" : "pl-0"}`}>
        <div className="p-6 md:p-12 font-dm-sans">
          <div className="max-w-5xl mx-auto">
        <header className="mb-12 flex justify-between items-end">
          <div>
            <button 
              onClick={() => router.push("/admin")}
              className="text-foreground/40 text-sm hover:text-white mb-4 transition-all"
            >
              ← Back to Command Center
            </button>
            <h1 className="text-5xl font-syne font-black text-white mb-2 uppercase tracking-tighter">Edit <span className="text-accent">Quiz</span></h1>
            <p className="text-foreground/40 italic">Configuration & Content Management</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* LEFT: DETAILS FORM */}
          <div className="lg:col-span-1">
            <h2 className="text-xs font-bold mb-6 uppercase tracking-[.3em] text-foreground/40">Quiz Parameters</h2>
            <form onSubmit={handleUpdateDetails} className="space-y-6 bg-card p-6 rounded-3xl border border-card-border">
              <div>
                <label className="block text-[10px] font-bold mb-2 uppercase tracking-wider text-foreground/40">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-background border border-card-border p-3 rounded-xl outline-none focus:border-accent text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold mb-2 uppercase tracking-wider text-foreground/40">Category</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-background border border-card-border p-3 rounded-xl outline-none focus:border-accent text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold mb-2 uppercase tracking-wider text-foreground/40">Timer (sec)</label>
                <input
                  type="number"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                  className="w-full bg-background border border-card-border p-3 rounded-xl outline-none focus:border-accent text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold mb-2 uppercase tracking-wider text-foreground/40">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-background border border-card-border p-3 rounded-xl outline-none focus:border-accent min-h-[100px] text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={saving}
                className="w-full py-4 bg-white/5 text-white font-bold rounded-xl border border-white/10 hover:bg-accent hover:text-background transition-all"
              >
                {saving ? "Saving..." : "Update Details"}
              </button>
            </form>

            <div className="mt-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xs font-bold uppercase tracking-[.3em] text-foreground/40">Bulk Upload</h2>
                <button 
                  onClick={copyTemplate}
                  className="text-[10px] font-bold text-accent hover:underline uppercase tracking-widest"
                >
                  Load Template
                </button>
              </div>
              <div className="bg-card p-6 rounded-3xl border border-card-border">
                <p className="text-[10px] text-foreground/40 mb-4 italic leading-relaxed">
                  Paste an array of questions in JSON format.
                </p>
                <textarea
                  value={bulkJson}
                  onChange={(e) => setBulkJson(e.target.value)}
                  placeholder='[{"questionText": "...", "options": [{"optionText": "...", "isCorrect": true}]}]'
                  className="w-full bg-background border border-card-border p-3 rounded-xl outline-none focus:border-accent min-h-[150px] text-xs font-mono mb-4"
                />
                <button
                  onClick={handleBulkUpload}
                  disabled={bulkLoading || !bulkJson}
                  className="w-full py-3 bg-accent text-background font-black rounded-xl hover:scale-105 transition-all text-xs uppercase tracking-widest disabled:opacity-50"
                >
                  {bulkLoading ? "Processing..." : "Inject Questions"}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: QUESTION LIST & MANUAL ADD */}
          <div className="lg:col-span-2">
            {/* MANUAL ADD FORM */}
            <div className="mb-12">
              <h2 className="text-xs font-bold mb-6 uppercase tracking-[.3em] text-foreground/40">Rapid Addition</h2>
              <form onSubmit={handleCreateQuestion} className="bg-card border border-accent/20 rounded-3xl p-8 shadow-[0_0_50px_rgba(200,255,0,0.05)]">
                <div className="mb-6">
                  <label className="block text-[10px] font-bold mb-2 uppercase tracking-wider text-foreground/40">New Question Text</label>
                  <input
                    type="text"
                    value={newQuestionText}
                    onChange={(e) => setNewQuestionText(e.target.value)}
                    placeholder="Enter the question challenge..."
                    className="w-full bg-background border border-card-border p-4 rounded-2xl outline-none focus:border-accent text-lg font-syne font-bold"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {newOptions.map((opt, idx) => (
                    <div key={idx} className={`p-4 rounded-xl border flex items-center gap-4 transition-all ${opt.isCorrect ? 'border-accent/40 bg-accent/5' : 'border-card-border bg-background'}`}>
                      <input
                        type="checkbox"
                        checked={opt.isCorrect}
                        onChange={() => {
                          const updated = newOptions.map((o, i) => ({ ...o, isCorrect: i === idx }));
                          setNewOptions(updated);
                        }}
                        className="w-4 h-4 rounded-full accent-accent cursor-pointer"
                      />
                      <input
                        type="text"
                        value={opt.optionText}
                        onChange={(e) => {
                          const updated = [...newOptions];
                          updated[idx].optionText = e.target.value;
                          setNewOptions(updated);
                        }}
                        placeholder={`Option ${idx + 1}`}
                        className="bg-transparent text-sm w-full outline-none text-white italic"
                        required={idx < 2}
                      />
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={creating || !newQuestionText}
                  className="w-full py-4 bg-accent text-background font-black rounded-2xl hover:scale-[1.02] transition-all uppercase tracking-[.3em] text-sm shadow-[0_10px_30px_rgba(200,255,0,0.2)]"
                >
                  {creating ? "Adding to Bank..." : "Save Question"}
                </button>
              </form>
            </div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xs font-bold uppercase tracking-[.3em] text-foreground/40">Question Bank</h2>
              <span className="text-[10px] font-bold text-accent px-3 py-1 bg-accent/10 rounded-full">{questions.length} Items</span>
            </div>

            <div className="space-y-6">
              {questions.length === 0 ? (
                <div className="p-20 text-center rounded-3xl bg-white/[0.02] border border-dashed border-card-border text-foreground/20">
                  Bank is empty.
                </div>
              ) : (
                questions.map((q, qIdx) => (
                  <div key={q.id} className="bg-card border border-card-border rounded-3xl p-8 hover:border-accent/20 transition-all group">
                    <div className="flex justify-between items-start mb-6">
                      <span className="text-[10px] font-black text-foreground/20 uppercase tracking-[.2em]">Question {qIdx + 1}</span>
                      <div className="flex gap-4">
                        <button 
                          onClick={() => handleUpdateQuestion(q)}
                          className="p-2 rounded-lg bg-white/5 text-accent opacity-0 group-hover:opacity-100 transition-all hover:bg-accent hover:text-background"
                        >
                          Save
                        </button>
                        <button 
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="p-2 rounded-lg bg-white/5 text-error opacity-0 group-hover:opacity-100 transition-all hover:bg-error hover:text-white"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <input
                      type="text"
                      value={q.questionText}
                      onChange={(e) => {
                        const newQs = [...questions];
                        newQs[qIdx].questionText = e.target.value;
                        setQuestions(newQs);
                      }}
                      className="w-full bg-transparent border-b border-card-border pb-2 mb-8 text-xl font-syne font-bold text-white outline-none focus:border-accent transition-all"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {q.options.map((opt, oIdx) => (
                        <div key={opt.id} className={`p-4 rounded-2xl border flex items-center gap-4 transition-all ${opt.isCorrect ? 'border-accent/40 bg-accent/5' : 'border-white/5 bg-background/50'}`}>
                          <input
                            type="checkbox"
                            checked={opt.isCorrect}
                            onChange={(e) => {
                              const newQs = [...questions];
                              // Only one correct option for now (MCQ)
                              newQs[qIdx].options.forEach((o, idx) => o.isCorrect = idx === oIdx);
                              setQuestions(newQs);
                            }}
                            className="w-4 h-4 rounded-full accent-accent cursor-pointer"
                          />
                          <input
                            type="text"
                            value={opt.optionText}
                            onChange={(e) => {
                              const newQs = [...questions];
                              newQs[qIdx].options[oIdx].optionText = e.target.value;
                              setQuestions(newQs);
                            }}
                            className="bg-transparent text-sm w-full outline-none text-white/80"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
        </div>
      </main>
    </div>
  );
}

