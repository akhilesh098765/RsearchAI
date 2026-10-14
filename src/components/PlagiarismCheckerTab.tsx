import React, { useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  Sparkles,
  Trash2,
  Quote,
} from "lucide-react";
import { PlagiarismResult } from "../types";
import { requestPlagiarismCheck } from "../services/api";

const SAMPLE_PLAGIARISM_TEXT = `Attention mechanisms have revolutionized natural language processing tasks. However, standard attention mechanisms exhibit quadratic computational complexity relative to sequence length. Researchers have proposed diverse mitigations including local windowing and sparse approximations.`;

interface PlagiarismCheckerProps {
  onGoToCitation?: (title: string, url?: string) => void;
}

export const PlagiarismCheckerTab: React.FC<PlagiarismCheckerProps> = ({ onGoToCitation }) => {
  const [text, setText] = useState<string>(SAMPLE_PLAGIARISM_TEXT);
  const [result, setResult] = useState<PlagiarismResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleScan = async () => {
    if (!text.trim()) return;
    setIsLoading(true);
    try {
      const res = await requestPlagiarismCheck(text);
      if (res.data) {
        setResult(res.data);
      }
    } catch (err) {
      console.error("Plagiarism check error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="flex-1 flex flex-col gap-4">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-base text-slate-900 dark:text-white">
              AI Plagiarism Checker
            </h2>
            <p className="text-xs text-slate-500">
              Scan against billions of research papers, web pages, and academic journals. 100% Free.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setText(SAMPLE_PLAGIARISM_TEXT)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer"
          >
            Sample Text
          </button>
          <button
            onClick={() => {
              setText("");
              setResult(null);
            }}
            className="p-2 rounded-lg text-slate-400 hover:text-red-600 cursor-pointer"
            title="Clear text"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleScan}
            disabled={isLoading || !text.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>{isLoading ? "Auditing Sources..." : "Scan for Plagiarism"}</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
        {/* Left Input Box */}
        <div className="flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between text-xs text-slate-500">
            <span>Manuscript / Text to Verify</span>
            <span>{wordCount} words</span>
          </div>
          <div className="flex-1 p-4 min-h-[360px]">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste research paper, essay, or draft to verify originality..."
              className="w-full h-full min-h-[340px] resize-none bg-transparent outline-hidden text-slate-800 dark:text-slate-100 leading-relaxed font-normal text-sm sm:text-base selection:bg-amber-100"
            />
          </div>
        </div>

        {/* Right Originality Report */}
        <div className="flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              Originality & Source Report
            </span>
            {result && <span>{result.matches.length} matches found</span>}
          </div>

          <div className="flex-1 p-5 overflow-y-auto min-h-[360px]">
            {!result ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-16">
                <ShieldCheck className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
                <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                  Ready to Audit Originality
                </p>
                <p className="text-xs max-w-xs mt-1">
                  Click "Scan for Plagiarism" to verify literature overlap against published papers.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Score Banner */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                      {result.uniquenessScore}% Original
                    </div>
                    <p className="text-xs text-slate-500">
                      {result.similarityScore}% similarity index detected
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        result.similarityScore <= 15
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400"
                      }`}
                    >
                      {result.similarityScore <= 15 ? "Low Overlap" : "Moderate Overlap"}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {result.summary}
                </p>

                {/* Matches List */}
                <div className="space-y-2.5 pt-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Identified Source Matches
                  </h4>

                  {result.matches.length === 0 ? (
                    <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
                      No matching publications detected. All content appears unique.
                    </div>
                  ) : (
                    result.matches.map((match, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-semibold text-xs text-slate-900 dark:text-white">
                              {match.sourceTitle}
                            </span>
                            {match.sourceUrl && (
                              <a
                                href={match.sourceUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] text-emerald-600 hover:underline flex items-center gap-1 mt-0.5"
                              >
                                <span>View Reference</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400">
                            {match.similarityPercent}% match
                          </span>
                        </div>

                        <div className="text-xs text-slate-600 dark:text-slate-300 italic bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800">
                          "{match.matchedText}"
                        </div>

                        {onGoToCitation && (
                          <button
                            onClick={() => onGoToCitation(match.sourceTitle, match.sourceUrl)}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 cursor-pointer pt-1"
                          >
                            <Quote className="w-3.5 h-3.5" />
                            <span>Cite this source in Citation Generator</span>
                          </button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
