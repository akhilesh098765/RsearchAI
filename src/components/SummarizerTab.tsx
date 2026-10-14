import React, { useState } from "react";
import {
  AlignLeft,
  List,
  FileText,
  Copy,
  Check,
  Sparkles,
  Trash2,
  Download,
  Volume2,
  VolumeX,
  Sliders,
  TrendingDown,
} from "lucide-react";
import { SummarizeMode, SummarizeLength, SummarizeResult } from "../types";
import { requestSummarize } from "../services/api";

const SAMPLE_SUMMARY_INPUT = `The rapid escalation of foundation models across diverse computer vision and multimodal reasoning domains has illuminated significant architectural vulnerabilities. Most notably, standard self-attention mechanisms require quadratic memory complexity relative to sequence length, precipitating severe latency degradation when deployed on constrained edge hardware. While model pruning and 4-bit INT quantization have emerged as viable remediation strategies, post-training quantization often introduces non-trivial perplexity spikes in high-precision scientific reasoning contexts. Recent studies indicate that hybrid linear attention formulations combined with low-rank adaptation preserve empirical accuracy benchmarks while curtailing inference energy budgets by upwards of 42%.`;

export const SummarizerTab: React.FC = () => {
  const [text, setText] = useState<string>(SAMPLE_SUMMARY_INPUT);
  const [mode, setMode] = useState<SummarizeMode>("paragraph");
  const [length, setLength] = useState<SummarizeLength>("medium");
  const [result, setResult] = useState<SummarizeResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handleSummarize = async () => {
    if (!text.trim()) return;
    setIsLoading(true);
    try {
      const res = await requestSummarize({ text, mode, length });
      if (res.data) {
        setResult(res.data);
      }
    } catch (err) {
      console.error("Summarize error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result?.summary) return;
    const toCopy =
      mode === "key_sentences" && result.keyPoints?.length
        ? result.keyPoints.map((p) => `• ${p}`).join("\n")
        : result.summary;
    navigator.clipboard.writeText(toCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!result?.summary) return;
    const blob = new Blob([result.summary], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ai-paraphraser-summary.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleToggleSpeech = () => {
    if (!result?.summary) return;
    if ("speechSynthesis" in window) {
      if (isPlayingAudio) {
        window.speechSynthesis.cancel();
        setIsPlayingAudio(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(result.summary);
        utterance.rate = 1.0;
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        setIsPlayingAudio(true);
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  const originalWords = text.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="flex-1 flex flex-col gap-4">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <AlignLeft className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-base text-slate-900 dark:text-white">
              AI Summarizer
            </h2>
            <p className="text-xs text-slate-500">
              Condense articles, research papers, and documents instantly. 100% Free.
            </p>
          </div>
        </div>

        {/* Mode Selector (Key Sentences vs Paragraph) */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setMode("paragraph")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                mode === "paragraph"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Paragraph</span>
            </button>
            <button
              onClick={() => setMode("key_sentences")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                mode === "key_sentences"
                  ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Key Sentences</span>
            </button>
          </div>

          {/* Summary Length Selector */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <span className="font-medium text-slate-500">Length:</span>
            {(["short", "medium", "long"] as SummarizeLength[]).map((len) => (
              <button
                key={len}
                onClick={() => setLength(len)}
                className={`px-2 py-0.5 rounded capitalize font-semibold cursor-pointer ${
                  length === len
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {len}
              </button>
            ))}
          </div>

          <button
            onClick={handleSummarize}
            disabled={isLoading || !text.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>{isLoading ? "Summarizing..." : "Summarize"}</span>
          </button>
        </div>
      </div>

      {/* Dual Pane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
        {/* Left Input Pane */}
        <div className="flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span>Original Document</span>
              <button
                onClick={() => setText(SAMPLE_SUMMARY_INPUT)}
                className="text-emerald-600 hover:underline font-semibold"
              >
                Insert Sample
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span>{originalWords} words</span>
              <button
                onClick={() => {
                  setText("");
                  setResult(null);
                }}
                className="hover:text-red-500 p-1 rounded"
                title="Clear"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex-1 p-4 min-h-[360px]">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste article, essay, or paper to summarize..."
              className="w-full h-full min-h-[340px] resize-none bg-transparent outline-hidden text-slate-800 dark:text-slate-100 leading-relaxed font-normal text-sm sm:text-base selection:bg-emerald-100"
            />
          </div>
        </div>

        {/* Right Output Summary Pane */}
        <div className="flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                Summary Output
              </span>
              {result && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <TrendingDown className="w-3 h-3" />
                  {result.reductionPercentage}% reduced
                </span>
              )}
            </div>

            {result && (
              <div className="flex items-center gap-2">
                <span>{result.summaryWordCount} words</span>
                <span>•</span>
                <button
                  onClick={handleToggleSpeech}
                  className="p-1 hover:text-slate-900 dark:hover:text-white"
                  title="Read Aloud"
                >
                  {isPlayingAudio ? (
                    <VolumeX className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  onClick={handleCopy}
                  className="p-1 hover:text-slate-900 dark:hover:text-white"
                  title="Copy"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  onClick={handleDownload}
                  className="p-1 hover:text-slate-900 dark:hover:text-white"
                  title="Download .txt"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 p-5 overflow-y-auto min-h-[360px]">
            {!result ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-16">
                <AlignLeft className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
                <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                  Ready to Summarize
                </p>
                <p className="text-xs max-w-xs mt-1">
                  Click "Summarize" above to generate bullet points or a concise paragraph.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Key Topics Badges */}
                {result.keyTopics && result.keyTopics.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Key Topics:
                    </span>
                    {result.keyTopics.map((topic, i) => (
                      <span
                        key={i}
                        className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                )}

                {/* Content: Key Sentences bullets OR Paragraph */}
                {mode === "key_sentences" && result.keyPoints && result.keyPoints.length > 0 ? (
                  <ul className="space-y-2.5">
                    {result.keyPoints.map((point, index) => (
                      <li key={index} className="flex items-start gap-2.5 text-sm text-slate-800 dark:text-slate-100 leading-relaxed">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0"></span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm sm:text-base text-slate-800 dark:text-slate-100 leading-relaxed font-normal">
                    {result.summary}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
