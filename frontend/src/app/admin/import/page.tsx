"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/utils/api";
import AdminSidebar from "@/components/AdminSidebar";
import Navbar from "@/components/Navbar";

// ── Types ──────────────────────────────────────────────────────────────────────
interface PreviewAnswer {
  key: string;
  text: string;
  isCorrect: boolean;
}

interface PreviewQuestion {
  id: number;
  question: string;
  category: string;
  difficulty: string;
  tags: string[];
  answers: PreviewAnswer[];
}

interface ImportResult {
  success: boolean;
  message: string;
  quiz: { id: string; title: string; questionCount: number };
}

// ── Difficulty badge colours ───────────────────────────────────────────────────
const difficultyStyles: Record<string, string> = {
  easy:   "bg-green-500/15 text-green-400 border-green-500/30",
  medium: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  hard:   "bg-red-500/15 text-red-400 border-red-500/30",
};

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function ImportQuizPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Form state
  const [title, setTitle]           = useState("");
  const [category, setCategory]     = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [tags, setTags]             = useState("");
  const [limit, setLimit]           = useState(10);
  const [timeLimit, setTimeLimit]   = useState(600);

  // Data state
  const [categories, setCategories]     = useState<string[]>([]);
  const [preview, setPreview]           = useState<PreviewQuestion[]>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  // UI state
  const [loadingCats, setLoadingCats]       = useState(true);
  const [previewing, setPreviewing]         = useState(false);
  const [importing, setImporting]           = useState(false);
  const [error, setError]                   = useState("");
  const [expandedId, setExpandedId]         = useState<number | null>(null);

  // Guard: admin only
  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await apiFetch("/quizapi/categories");
        // The Trivia API categories come as an array of { name, slug }
        const names: string[] = (data.categories ?? []).map(
          (c: { name: string }) => c.name
        );
        setCategories(names);
      } catch {
        // non-fatal
      } finally {
        setLoadingCats(false);
      }
    };
    if (user?.role === "admin") loadCategories();
  }, [user]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handlePreview = async () => {
    setError("");
    setImportResult(null);
    setPreviewing(true);
    setPreview([]);
    try {
      const params = new URLSearchParams({ limit: String(limit) });
      if (category)   params.append("categories",   category); // Trivia API uses plural 'categories'
      if (difficulty) params.append("difficulty",  difficulty);
      if (tags)       params.append("tags",        tags);

      const data = await apiFetch(`/quizapi/questions?${params.toString()}`);
      setPreview(data.questions ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Preview failed");
    } finally {
      setPreviewing(false);
    }
  };

  const handleImport = async () => {
    if (!title.trim()) { setError("Please enter a quiz title before importing."); return; }
    setError("");
    setImporting(true);
    try {
      const result: ImportResult = await apiFetch("/quizapi/import", {
        method: "POST",
        body: JSON.stringify({ title, categories: category, difficulty, tags, limit, timeLimit }),
      });
      setImportResult(result);
      setPreview([]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setImporting(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <Navbar onToggle={() => setIsSidebarOpen(!isSidebarOpen)} brandText="Admin Core" />
      <AdminSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <main className={`transition-all duration-300 pt-16 ${isSidebarOpen ? "md:pl-72" : "pl-0"}`}>
        <div className="p-6 md:p-12 font-dm-sans max-w-6xl">

          {/* ── Page Header ── */}
          <header className="mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-[10px] font-black uppercase tracking-[0.2em] mb-4">
              <span>⚡</span> QuizAPI.io
            </div>
            <h1 className="text-4xl font-syne font-black text-white uppercase tracking-tighter">
              Import Questions
            </h1>
            <p className="text-foreground/40 mt-2 max-w-xl">
              Pull tech questions from QuizAPI.io, preview them live, then save as a new quiz in your database with one click.
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

            {/* ── Filter Panel ── */}
            <aside className="lg:col-span-2">
              <div className="bg-card border border-card-border rounded-[32px] p-8 shadow-2xl sticky top-24">
                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-foreground/30 mb-8">Filters</h2>

                {/* Title */}
                <div className="mb-6">
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 mb-2">
                    Quiz Title <span className="text-accent">*</span>
                  </label>
                  <input
                    id="import-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Linux Essentials"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm placeholder-foreground/20 focus:outline-none focus:border-accent/50 transition-colors"
                  />
                </div>

                {/* Category */}
                <div className="mb-6">
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 mb-2">
                    Category
                  </label>
                  {loadingCats ? (
                    <div className="w-full h-11 bg-white/5 rounded-2xl animate-pulse" />
                  ) : (
                    <select
                      id="import-category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm focus:outline-none focus:border-accent/50 transition-colors appearance-none"
                    >
                      <option value="">Any Category</option>
                      {categories.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Difficulty */}
                <div className="mb-6">
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 mb-2">
                    Difficulty
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {["", "easy", "medium", "hard"].map((d) => (
                      <button
                        key={d}
                        onClick={() => setDifficulty(d)}
                        className={`py-2 rounded-xl text-[11px] font-black uppercase tracking-wide border transition-all ${
                          difficulty === d
                            ? "bg-accent text-background border-accent"
                            : "bg-white/5 text-foreground/40 border-white/10 hover:border-white/20 hover:text-white"
                        }`}
                      >
                        {d === "" ? "Any" : d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div className="mb-6">
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 mb-2">
                    Tag <span className="text-foreground/20">(optional)</span>
                  </label>
                  <input
                    id="import-tags"
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="e.g. php, docker"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-sm placeholder-foreground/20 focus:outline-none focus:border-accent/50 transition-colors"
                  />
                </div>

                {/* Limit */}
                <div className="mb-6">
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 mb-2">
                    Number of Questions — <span className="text-accent">{limit}</span>
                  </label>
                  <input
                    id="import-limit"
                    type="range"
                    min={1} max={20} value={limit}
                    onChange={(e) => setLimit(Number(e.target.value))}
                    className="w-full accent-[hsl(74,100%,50%)]"
                  />
                  <div className="flex justify-between text-[10px] text-foreground/20 mt-1">
                    <span>1</span><span>20</span>
                  </div>
                </div>

                {/* Time Limit */}
                <div className="mb-8">
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40 mb-2">
                    Time Limit — <span className="text-accent">{timeLimit / 60} min</span>
                  </label>
                  <input
                    id="import-timelimit"
                    type="range"
                    min={60} max={3600} step={60} value={timeLimit}
                    onChange={(e) => setTimeLimit(Number(e.target.value))}
                    className="w-full accent-[hsl(74,100%,50%)]"
                  />
                  <div className="flex justify-between text-[10px] text-foreground/20 mt-1">
                    <span>1 min</span><span>60 min</span>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold">
                    ⚠ {error}
                  </div>
                )}

                {/* Actions */}
                <div className="space-y-3">
                  <button
                    id="btn-preview"
                    onClick={handlePreview}
                    disabled={previewing}
                    className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-white text-sm font-black uppercase tracking-[0.2em] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {previewing ? "Fetching…" : "👁 Preview Questions"}
                  </button>
                  <button
                    id="btn-import"
                    onClick={handleImport}
                    disabled={importing || !title.trim()}
                    className="w-full py-4 rounded-2xl bg-accent text-background text-sm font-black uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-[0_20px_40px_rgba(200,255,0,0.2)] disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
                  >
                    {importing ? "Importing…" : "⚡ Import to Database"}
                  </button>
                </div>
              </div>
            </aside>

            {/* ── Preview / Result Panel ── */}
            <section className="lg:col-span-3">

              {/* Success Banner */}
              {importResult && (
                <div className="mb-8 p-8 rounded-[32px] bg-accent/10 border border-accent/30 shadow-[0_0_40px_rgba(200,255,0,0.08)]">
                  <div className="flex items-start gap-4">
                    <span className="text-3xl">✅</span>
                    <div>
                      <p className="text-accent font-black text-lg font-syne">{importResult.message}</p>
                      <p className="text-foreground/40 text-sm mt-1">
                        Quiz ID: <code className="text-white/60 font-mono text-xs">{importResult.quiz.id}</code>
                      </p>
                      <div className="flex gap-3 mt-4">
                        <a
                          href={`/admin/edit/${importResult.quiz.id}`}
                          className="px-5 py-2 rounded-xl bg-accent text-background text-xs font-black uppercase tracking-wide hover:scale-105 transition-all"
                        >
                          Edit Quiz →
                        </a>
                        <button
                          onClick={() => { setImportResult(null); setTitle(""); }}
                          className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-black uppercase tracking-wide hover:bg-white/10 transition-all"
                        >
                          Import Another
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Empty state */}
              {!previewing && preview.length === 0 && !importResult && (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] rounded-[32px] border border-dashed border-card-border text-center p-12">
                  <div className="text-6xl mb-4 opacity-30">🔭</div>
                  <p className="text-foreground/20 font-syne text-xl font-bold">Nothing previewed yet</p>
                  <p className="text-foreground/20 text-sm mt-2">
                    Configure the filters on the left and click <strong className="text-foreground/40">Preview Questions</strong> to see what will be imported.
                  </p>
                </div>
              )}

              {/* Loading skeleton */}
              {previewing && (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-20 rounded-[20px] bg-card border border-card-border animate-pulse" />
                  ))}
                </div>
              )}

              {/* Preview list */}
              {!previewing && preview.length > 0 && (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xs font-black uppercase tracking-[0.3em] text-foreground/30">
                      Preview — {preview.length} Question{preview.length !== 1 ? "s" : ""}
                    </h2>
                    <span className="text-[10px] text-foreground/20 font-mono">
                      Click a card to reveal answers
                    </span>
                  </div>

                  <div className="space-y-4">
                    {preview.map((q, idx) => {
                      const isExpanded = expandedId === q.id;
                      const diff = (q.difficulty || "").toLowerCase();
                      return (
                        <div
                          key={q.id}
                          className={`rounded-[24px] bg-card border transition-all duration-300 cursor-pointer ${
                            isExpanded
                              ? "border-accent/30 shadow-[0_0_30px_rgba(200,255,0,0.06)]"
                              : "border-card-border hover:border-white/20"
                          }`}
                          onClick={() => setExpandedId(isExpanded ? null : q.id)}
                        >
                          {/* Question header */}
                          <div className="flex items-start gap-4 p-6">
                            <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xs font-black text-foreground/40">
                              {idx + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-white font-bold text-sm leading-snug">{q.question}</p>
                              <div className="flex flex-wrap gap-2 mt-3">
                                {q.category && (
                                  <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/5 text-[10px] text-foreground/40 font-bold uppercase tracking-wide">
                                    {q.category}
                                  </span>
                                )}
                                {diff && (
                                  <span className={`px-2 py-0.5 rounded-lg border text-[10px] font-black uppercase tracking-wide ${difficultyStyles[diff] || "bg-white/5 text-foreground/40 border-white/10"}`}>
                                    {diff}
                                  </span>
                                )}
                                {q.tags.slice(0, 3).map((t) => (
                                  <span key={t} className="px-2 py-0.5 rounded-lg bg-accent/5 border border-accent/10 text-[10px] text-accent/60 font-bold">
                                    #{t}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <span className={`text-foreground/20 transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}>
                              ▾
                            </span>
                          </div>

                          {/* Answers (expanded) */}
                          {isExpanded && (
                            <div className="px-6 pb-6 grid grid-cols-1 sm:grid-cols-2 gap-2 border-t border-white/5 pt-4">
                              {q.answers.map((a) => (
                                <div
                                  key={a.key}
                                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-xs font-bold transition-colors ${
                                    a.isCorrect
                                      ? "bg-green-500/10 border-green-500/30 text-green-400"
                                      : "bg-white/5 border-white/5 text-foreground/40"
                                  }`}
                                >
                                  <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] flex-shrink-0 ${a.isCorrect ? "bg-green-500/20" : "bg-white/10"}`}>
                                    {a.key.replace("answer_", "").toUpperCase()}
                                  </span>
                                  {a.text}
                                  {a.isCorrect && <span className="ml-auto">✓</span>}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
