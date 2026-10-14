import React, { useState } from "react";
import {
  Cpu,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  Copy,
  Sparkles,
  Trash2,
  HelpCircle,
  BarChart3,
} from "lucide-react";
import { AiDetectorResult } from "../types";
import { requestAiDetector } from "../services/api";

const SAMPLE_AI_DETECTOR_TEXT = `The advent of modern machine learning architectures has revolutionized computational linguistics. In particular, transformer models have fundamentally altered the paradigm of representation learning. Standard multi-head self-attention mechanisms compute pairwise interactions across all input tokens. However, this architectural design introduces quadratic computational and memory complexity relative to context window length.`;

export const AiDetectorTab: React.FC = () => {
  const [text, setText] = useState<string>(SAMPLE_AI_DETECTOR_TEXT);
  const [result, setResult] = useState<AiDetectorResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSentenceIndex, setSelectedSentenceIndex] = useState<number | null>(null);

  const handleScan = async () => {
    if (!text.trim()) return;
    setIsLoading(true);
    try {
      const res = await requestAiDetector(text);
      if (res.data) {
        setResult(res.data);
      }
    } catch (err) {
      console.error("AI detector error:", err);
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
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-base text-slate-900 dark:text-white">
              AI Content Detector
            </h2>
            <p className="text-xs text-slate-500">
              Detect ChatGPT, Claude, Gemini, and AI-generated text with sentence-level precision. 100% Free.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setText(SAMPLE_AI_DETECTOR_TEXT)}
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
            <span>{isLoading ? "Analyzing Text..." : "Scan for AI"}</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
        {/* Left Input Pane */}
        <div className="flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between text-xs text-slate-500">
            <span>Input Text</span>
            <span>{wordCount} words</span>
          </div>
          <div className="flex-1 p-4 min-h-[360px]">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste text here to detect AI-generated patterns..."
              className="w-full h-full min-h-[340px] resize-none bg-transparent outline-hidden text-slate-800 dark:text-slate-100 leading-relaxed font-normal text-sm sm:text-base selection:bg-purple-100"
            />
          </div>
        </div>

        {/* Right Detector Report */}
        <div className="flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              AI Detection Analysis
            </span>
            {result && (
              <span className="font-semibold text-slate-500">
                {result.sentences.length} sentences analyzed
              </span>
            )}
          </div>

          <div className="flex-1 p-5 overflow-y-auto min-h-[360px]">
            {!result ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-16">
                <Cpu className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
                <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                  Awaiting Text Scan
                </p>
                <p className="text-xs max-w-xs mt-1">
                  Click "Scan for AI" above to inspect perplexity, burstiness, and sentence probability.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Score Meters Card */}
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Circular Gauge Representation */}
                  <div className="flex items-center gap-4">
                    <div className="relative w-20 h-20 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-slate-200 dark:text-slate-700"
                          strokeWidth="3.5"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className={
                            result.aiProbability > 60
                              ? "text-red-500"
                              : result.aiProbability > 30
                              ? "text-amber-500"
                              : "text-emerald-500"
                          }
                          strokeDasharray={`${result.aiProbability}, 100`}
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-lg font-bold text-slate-900 dark:text-white leading-none">
                          {result.aiProbability}%
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase">AI</span>
                      </div>
                    </div>

                    <div>
                      <span
                        className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full mb-1 ${
                          result.aiProbability > 60
                            ? "bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-400"
                            : result.aiProbability > 30
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400"
                            : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400"
                        }`}
                      >
                        {result.assessment}
                      </span>
                      <p className="text-xs text-slate-500">
                        {result.humanProbability}% Human Probability
                      </p>
                    </div>
                  </div>

                  {/* Perplexity & Burstiness stats */}
                  <div className="flex items-center gap-4 text-xs">
                    <div className="px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div className="text-slate-400 text-[10px] uppercase font-bold">Perplexity</div>
                      <div className="font-bold text-slate-800 dark:text-slate-100">
                        {result.metrics?.perplexity || "High"}
                      </div>
                    </div>
                    <div className="px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                      <div className="text-slate-400 text-[10px] uppercase font-bold">Burstiness</div>
                      <div className="font-bold text-slate-800 dark:text-slate-100">
                        {result.metrics?.burstiness || "Moderate"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-red-200 dark:bg-red-900 border border-red-400"></span>
                    <span>AI Generated</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-amber-200 dark:bg-amber-900 border border-amber-400"></span>
                    <span>Mixed / Unclear</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded bg-emerald-100 dark:bg-emerald-900 border border-emerald-400"></span>
                    <span>Human Authored</span>
                  </div>
                </div>

                {/* Sentence Highlight Breakdown */}
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Sentence-by-Sentence Breakdown (Click to Inspect)
                  </h4>
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-sm leading-relaxed space-y-1.5">
                    {result.sentences.map((sent, idx) => {
                      const isAi = sent.classification === "ai" || sent.aiScore > 60;
                      const isMixed = sent.classification === "mixed" || (sent.aiScore > 30 && sent.aiScore <= 60);

                      return (
                        <span
                          key={idx}
                          onClick={() => setSelectedSentenceIndex(idx)}
                          className={`cursor-pointer rounded px-1 py-0.5 transition-all inline ${
                            selectedSentenceIndex === idx ? "ring-2 ring-purple-500" : ""
                          } ${
                            isAi
                              ? "bg-red-100 dark:bg-red-950/60 text-red-900 dark:text-red-200 hover:bg-red-200"
                              : isMixed
                              ? "bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 hover:bg-amber-200"
                              : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 hover:bg-emerald-100"
                          }`}
                        >
                          {sent.text}{" "}
                        </span>
                      );
                    })}
                  </div>

                  {/* Selected Sentence Tooltip Box */}
                  {selectedSentenceIndex !== null && result.sentences[selectedSentenceIndex] && (
                    <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-purple-900 dark:text-purple-300">
                          Sentence {selectedSentenceIndex + 1} Analysis
                        </span>
                        <span className="font-semibold text-purple-700 dark:text-purple-400">
                          {result.sentences[selectedSentenceIndex].aiScore}% AI Likelihood
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300">
                        {result.sentences[selectedSentenceIndex].reason ||
                          "Syntactic cadence analysis indicates predictable token probability distribution."}
                      </p>
                    </div>
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
