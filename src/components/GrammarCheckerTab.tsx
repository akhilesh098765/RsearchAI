import React, { useState } from "react";
import {
  SpellCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Trash2,
  FileDown,
  ArrowRight,
  ShieldCheck,
  Lightbulb,
} from "lucide-react";
import { GrammarIssue, GrammarStats } from "../types";
import { requestGrammarCheck } from "../services/api";

const SAMPLE_GRAMMAR_TEXT = `Teh neural network architecture recieve state-of-the-art results on edge devices. However their is a bottleneck due to the fact that standard attention mechanisms scale quadratically. In order to mitigate this problem researchers have applied quantization to effect the latency.`;

export const GrammarCheckerTab: React.FC = () => {
  const [text, setText] = useState<string>(SAMPLE_GRAMMAR_TEXT);
  const [correctedText, setCorrectedText] = useState<string>("");
  const [issues, setIssues] = useState<GrammarIssue[]>([]);
  const [stats, setStats] = useState<GrammarStats | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

  const handleCheckGrammar = async () => {
    if (!text.trim()) return;
    setIsLoading(true);
    try {
      const res = await requestGrammarCheck(text);
      if (res.data) {
        setCorrectedText(res.data.correctedText);
        setIssues(res.data.issues || []);
        setStats(res.data.stats || null);
      }
    } catch (err) {
      console.error("Grammar check error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFixAll = () => {
    if (correctedText) {
      setText(correctedText);
      setIssues([]);
      if (stats) {
        setStats({
          spellingCount: 0,
          grammarCount: 0,
          punctuationCount: 0,
          styleCount: 0,
          overallAccuracy: 100,
        });
      }
    }
  };

  const handleAcceptIssue = (issue: GrammarIssue) => {
    const regex = new RegExp(`\\b${issue.originalText}\\b`, "i");
    setText((prev) => prev.replace(regex, issue.suggestedText));
    setIssues((prev) => prev.filter((i) => i.id !== issue.id));
  };

  const handleDismissIssue = (issueId: string) => {
    setIssues((prev) => prev.filter((i) => i.id !== issueId));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredIssues = issues.filter((issue) => {
    if (activeFilter === "all") return true;
    return issue.ruleCategory?.toLowerCase() === activeFilter.toLowerCase();
  });

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const charCount = text.length;

  return (
    <div className="flex-1 flex flex-col gap-4">
      {/* Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <SpellCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-base text-slate-900 dark:text-white">
              AI Grammar Checker
            </h2>
            <p className="text-xs text-slate-500">
              Fix spelling, grammar, punctuation, and wordiness with 1 click. 100% Free.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setText(SAMPLE_GRAMMAR_TEXT)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            Sample Text
          </button>
          <button
            onClick={() => {
              setText("");
              setIssues([]);
              setStats(null);
            }}
            className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 cursor-pointer"
            title="Clear text"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Copied" : "Copy"}</span>
          </button>
          <button
            onClick={handleCheckGrammar}
            disabled={isLoading || !text.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>{isLoading ? "Auditing Text..." : "Check Grammar"}</span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
        {/* Left Editor Canvas (2 columns) */}
        <div className="lg:col-span-2 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between text-xs text-slate-500">
            <span>Editor</span>
            <div className="flex items-center gap-3">
              <span>{wordCount} words</span>
              <span>•</span>
              <span>{charCount} characters</span>
            </div>
          </div>

          <div className="flex-1 p-4 relative min-h-[360px]">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste or type your text here to check for grammar, spelling, and clarity..."
              className="w-full h-full min-h-[340px] resize-none bg-transparent outline-hidden text-slate-800 dark:text-slate-100 leading-relaxed font-normal text-sm sm:text-base selection:bg-emerald-100"
            />
          </div>

          {/* Under-editor legend */}
          <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
              <span>Spelling</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span>Grammar</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>Clarity & Style</span>
            </div>
          </div>
        </div>

        {/* Right Suggestions & Error Fixes Panel (1 column) */}
        <div className="flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
          {/* Top Panel Header with Fix All */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Suggestions ({issues.length})
              </h3>
              {stats && (
                <p className="text-xs text-slate-500">
                  Overall Accuracy: {stats.overallAccuracy}%
                </p>
              )}
            </div>

            {issues.length > 0 && (
              <button
                onClick={handleFixAll}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-2xs transition-colors cursor-pointer"
              >
                Fix All ({issues.length})
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex border-b border-slate-200 dark:border-slate-800 p-1.5 gap-1 text-xs overflow-x-auto">
            {["all", "spelling", "grammar", "clarity"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-2.5 py-1 rounded-md font-medium capitalize cursor-pointer transition-colors ${
                  activeFilter === tab
                    ? "bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Cards List */}
          <div className="flex-1 p-3 space-y-2.5 overflow-y-auto max-h-[500px]">
            {issues.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-2" />
                <p className="font-bold text-sm text-slate-700 dark:text-slate-300">
                  No Grammar Issues Detected
                </p>
                <p className="text-xs max-w-xs mt-1">
                  Click "Check Grammar" above or paste text to perform a comprehensive proofread.
                </p>
              </div>
            ) : (
              filteredIssues.map((issue) => (
                <div
                  key={issue.id}
                  className={`p-3 rounded-xl border transition-all ${
                    selectedIssueId === issue.id
                      ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30"
                      : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        issue.ruleCategory === "spelling"
                          ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400"
                          : issue.ruleCategory === "grammar"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400"
                      }`}
                    >
                      {issue.ruleCategory}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleAcceptIssue(issue)}
                        className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold cursor-pointer"
                        title="Accept correction"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleDismissIssue(issue.id)}
                        className="px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-700 text-[11px] font-medium cursor-pointer"
                        title="Dismiss"
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>

                  {/* Original -> Replacement */}
                  <div className="flex items-center gap-2 my-2 text-xs font-semibold">
                    <span className="text-red-500 line-through bg-red-50 dark:bg-red-950/50 px-1.5 py-0.5 rounded">
                      {issue.originalText}
                    </span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                    <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded font-bold">
                      {issue.suggestedText}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-snug">
                    {issue.explanation}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
