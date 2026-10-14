import React, { useState } from "react";
import {
  PenTool,
  Sparkles,
  ArrowRight,
  BookOpen,
  ListOrdered,
  Plus,
  Copy,
  Check,
  RotateCcw,
  StickyNote,
} from "lucide-react";
import { CowriterResult } from "../types";
import { requestCowriter } from "../services/api";

const SAMPLE_COWRITER_DOC = `# Mitigating Attention Bottlenecks in Transformer Architectures

## 1. Introduction
The transformer architecture has become the de facto standard for sequence transduction tasks. However, the self-attention mechanism incurs quadratic computational complexity relative to sequence length.

## 2. Parameter Quantization
Recent empirical investigations have explored post-training quantization as a methodology to reduce latency on constrained edge devices...`;

export const CowriterTab: React.FC = () => {
  const [docContent, setDocContent] = useState<string>(SAMPLE_COWRITER_DOC);
  const [activeSideTab, setActiveSideTab] = useState<"ai" | "notes">("ai");
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [lastGenerated, setLastGenerated] = useState<CowriterResult | null>(null);
  const [scratchNotes, setScratchNotes] = useState<string>("Key References:\n- Vaswani et al. (2017)\n- Child et al. (2019) Sparse Transformers");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleRunCowriter = async (action: "continue" | "expand" | "counterargument" | "outline") => {
    setIsLoading(true);
    try {
      const res = await requestCowriter({
        prompt: customPrompt,
        currentDocument: docContent,
        action,
      });

      if (res.data) {
        setLastGenerated(res.data);
      }
    } catch (err) {
      console.error("Co-writer error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsertIntoDoc = (text: string) => {
    setDocContent((prev) => `${prev}\n\n${text}`);
    setLastGenerated(null);
  };

  const wordCount = docContent.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="flex-1 flex flex-col gap-4">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <PenTool className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-base text-slate-900 dark:text-white">
              AI Co-Writer
            </h2>
            <p className="text-xs text-slate-500">
              All-in-one AI writing space with auto-complete, citations, and research notes. 100% Free.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              navigator.clipboard.writeText(docContent);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy Doc"}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Writing Canvas (Left) + AI & Notes Sidebar (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
        {/* Writing Canvas (2 columns) */}
        <div className="lg:col-span-2 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between text-xs text-slate-500">
            <span>Manuscript Document</span>
            <span>{wordCount} words</span>
          </div>

          <div className="flex-1 p-5 min-h-[420px]">
            <textarea
              value={docContent}
              onChange={(e) => setDocContent(e.target.value)}
              placeholder="Start drafting your research paper or article here..."
              className="w-full h-full min-h-[400px] resize-none bg-transparent outline-hidden text-slate-800 dark:text-slate-100 leading-relaxed font-normal text-sm sm:text-base selection:bg-indigo-100 font-serif"
            />
          </div>
        </div>

        {/* Co-Writer Assistant Side Panel (1 column) */}
        <div className="flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
          {/* Side Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 p-2 gap-1 text-xs">
            <button
              onClick={() => setActiveSideTab("ai")}
              className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                activeSideTab === "ai"
                  ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 font-bold"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Smart Assist</span>
            </button>
            <button
              onClick={() => setActiveSideTab("notes")}
              className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                activeSideTab === "notes"
                  ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <StickyNote className="w-3.5 h-3.5" />
              <span>Notes & Sources</span>
            </button>
          </div>

          {/* AI Panel Body */}
          {activeSideTab === "ai" ? (
            <div className="p-4 space-y-4 flex-1 overflow-y-auto">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  AI Auto-Completion
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => handleRunCowriter("continue")}
                    disabled={isLoading}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 bg-slate-50 dark:bg-slate-800/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 text-left font-semibold cursor-pointer"
                  >
                    <div className="flex items-center gap-1 text-emerald-600 mb-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Continue Writing</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-normal">Next paragraph</p>
                  </button>

                  <button
                    onClick={() => handleRunCowriter("expand")}
                    disabled={isLoading}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 bg-slate-50 dark:bg-slate-800/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 text-left font-semibold cursor-pointer"
                  >
                    <div className="flex items-center gap-1 text-emerald-600 mb-1">
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>Elaborate</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-normal">Add depth & proof</p>
                  </button>

                  <button
                    onClick={() => handleRunCowriter("counterargument")}
                    disabled={isLoading}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 bg-slate-50 dark:bg-slate-800/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 text-left font-semibold cursor-pointer"
                  >
                    <div className="flex items-center gap-1 text-emerald-600 mb-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Counterargument</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-normal">Scholarly critique</p>
                  </button>

                  <button
                    onClick={() => handleRunCowriter("outline")}
                    disabled={isLoading}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 bg-slate-50 dark:bg-slate-800/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 text-left font-semibold cursor-pointer"
                  >
                    <div className="flex items-center gap-1 text-emerald-600 mb-1">
                      <ListOrdered className="w-3.5 h-3.5" />
                      <span>Add Outline</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-normal">Section structure</p>
                  </button>
                </div>
              </div>

              {/* Custom Prompt Box */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                  Custom AI Instruction
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="e.g. Add a paragraph comparing INT8 vs FP16..."
                    className="flex-1 p-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white outline-hidden"
                  />
                  <button
                    onClick={() => handleRunCowriter("continue")}
                    disabled={isLoading || !customPrompt.trim()}
                    className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold disabled:opacity-50 cursor-pointer"
                  >
                    Ask
                  </button>
                </div>
              </div>

              {/* Generated Result Preview Card */}
              {lastGenerated && (
                <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-800 dark:text-emerald-300">
                      Generated Suggestion
                    </span>
                    <button
                      onClick={() => handleInsertIntoDoc(lastGenerated.generatedText)}
                      className="flex items-center gap-1 px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Insert into Doc</span>
                    </button>
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 leading-relaxed italic">
                    "{lastGenerated.generatedText}"
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 flex-1 flex flex-col">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Research Scratchpad & Quotes
              </span>
              <textarea
                value={scratchNotes}
                onChange={(e) => setScratchNotes(e.target.value)}
                placeholder="Paste key citations, bibliography snippets, or ideas here..."
                className="flex-1 w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs resize-none outline-hidden"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
