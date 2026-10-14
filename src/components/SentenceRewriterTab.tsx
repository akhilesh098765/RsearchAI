import React, { useState } from "react";
import { GitFork, Sparkles, Check, ArrowRight, ShieldCheck, RefreshCw, Copy } from "lucide-react";
import { AcademicDomain } from "../types";
import { requestRestructure } from "../services/api";

interface SentenceRewriterTabProps {
  currentDomain: AcademicDomain;
  onApplyToEditor: (newSentence: string) => void;
}

const TRANSFORMATIONS = [
  {
    id: "active_to_passive",
    title: "Active → Passive Voice",
    desc: "Emphasizes methodology or experimental findings rather than the researcher persona.",
    sample: "The researchers conducted an experiment to evaluate the proposed method.",
  },
  {
    id: "passive_to_active",
    title: "Passive → Active Voice",
    desc: "Restores direct subject agency for punchy, dynamic academic claims.",
    sample: "A significant correlation was observed by the analytical team across all samples.",
  },
  {
    id: "split_long",
    title: "Long Sentence → Multiple Sentences",
    desc: "Decomposes convoluted compound thoughts into crisp, logically progressive propositions.",
    sample: "Although the neural network achieved high baseline accuracy, the memory consumption grew quadratically, which severely limited edge device deployment, and therefore quantization was necessary.",
  },
  {
    id: "combine_short",
    title: "Short Sentences → Coherent Paragraph",
    desc: "Synthesizes fragmented assertions into a fluid, cohesive academic sentence.",
    sample: "The algorithm is fast. It uses little memory. It scales well on distributed clusters.",
  },
  {
    id: "nominalize_to_verbal",
    title: "Nominalization → Dynamic Verbal Syntax",
    desc: "Converts heavy noun-stacked phrases into natural, engaging scientific verbs.",
    sample: "The implementation of the optimization method yielded an improvement in execution speed.",
  },
  {
    id: "concise_flow",
    title: "Repetitive Sentence → Concise Academic Flow",
    desc: "Prunes academic padding and wordiness while maintaining 100% factual scope.",
    sample: "Due to the fact that empirical observations were conducted over time, it serves to demonstrate the viability.",
  },
];

export const SentenceRewriterTab: React.FC<SentenceRewriterTabProps> = ({
  currentDomain,
  onApplyToEditor,
}) => {
  const [selectedTransformation, setSelectedTransformation] = useState(TRANSFORMATIONS[0].id);
  const [inputSentence, setInputSentence] = useState(TRANSFORMATIONS[0].sample);
  const [result, setResult] = useState<{
    rewrittenSentence: string;
    factualPreserved: boolean;
    explanation: string;
    alternatives: string[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSelectPreset = (t: typeof TRANSFORMATIONS[0]) => {
    setSelectedTransformation(t.id);
    setInputSentence(t.sample);
    setResult(null);
  };

  const handleRestructure = async () => {
    if (!inputSentence.trim()) return;
    setIsLoading(true);
    try {
      const res = await requestRestructure({
        sentence: inputSentence,
        transformation: selectedTransformation,
        domain: currentDomain,
      });
      setResult(res.data);
    } catch (err) {
      console.error("Restructure error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 font-['Plus_Jakarta_Sans']">
          <GitFork className="w-5 h-5 text-indigo-600" />
          <span>Academic Sentence Restructuring Engine</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Transform sentence syntax and voice while rigorously preserving citations, scientific facts, and empirical accuracy.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Transformation Presets */}
        <div className="lg:col-span-4 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Transformation Typologies
          </span>
          {TRANSFORMATIONS.map((t) => {
            const isSelected = selectedTransformation === t.id;
            return (
              <button
                key={t.id}
                onClick={() => handleSelectPreset(t)}
                className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-indigo-50/80 border-indigo-300 shadow-xs ring-1 ring-indigo-500/20"
                    : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="font-semibold text-slate-800 text-xs flex items-center justify-between mb-1">
                  <span>{t.title}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                </div>
                <p className="text-[11px] text-slate-500 leading-snug">{t.desc}</p>
              </button>
            );
          })}
        </div>

        {/* Right: Interactive Workbench */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-2">
              Original Sentence (Domain: {currentDomain})
            </label>
            <textarea
              value={inputSentence}
              onChange={(e) => setInputSentence(e.target.value)}
              rows={3}
              placeholder="Enter an academic sentence to restructure..."
              className="w-full p-3 text-sm text-slate-800 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden font-['Crimson_Pro'] text-base"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleRestructure}
              disabled={isLoading || !inputSentence.trim()}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 disabled:opacity-60 transition-all cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing Syntax...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Restructure Sentence</span>
                </>
              )}
            </button>
          </div>

          {/* Results Display */}
          {result && (
            <div className="mt-2 pt-4 border-t border-slate-100 space-y-4 animate-in fade-in">
              {/* Primary Rewrite */}
              <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-800 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Recommended Academic Transformation</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(result.rewrittenSentence)}
                      className="text-xs text-indigo-700 hover:text-indigo-900 flex items-center gap-1 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copied ? "Copied" : "Copy"}</span>
                    </button>
                    <button
                      onClick={() => onApplyToEditor(result.rewrittenSentence)}
                      className="text-xs font-semibold px-2.5 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer"
                    >
                      Insert Into Editor
                    </button>
                  </div>
                </div>

                <p className="font-['Crimson_Pro'] text-lg text-slate-900 leading-relaxed font-medium">
                  "{result.rewrittenSentence}"
                </p>

                <div className="mt-3 flex items-center gap-3 text-xs text-slate-600">
                  <div className="flex items-center gap-1 text-emerald-700 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Factual Meaning Preserved</span>
                  </div>
                  <span>•</span>
                  <span>{result.explanation}</span>
                </div>
              </div>

              {/* Alternative Variations */}
              {result.alternatives && result.alternatives.length > 0 && (
                <div>
                  <span className="text-xs font-semibold text-slate-600 block mb-2">
                    Alternative Stylistic Variations:
                  </span>
                  <div className="space-y-2">
                    {result.alternatives.map((alt, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg border border-slate-200 hover:border-indigo-200 bg-slate-50/50 flex items-center justify-between gap-3 text-xs"
                      >
                        <p className="font-['Crimson_Pro'] text-base text-slate-800 flex-1">
                          "{alt}"
                        </p>
                        <button
                          onClick={() => onApplyToEditor(alt)}
                          className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline shrink-0 cursor-pointer"
                        >
                          Use This
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
