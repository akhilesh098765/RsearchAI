import React, { useState } from "react";
import { X, ArrowLeftRight, Sparkles, Copy, Check, CheckCircle } from "lucide-react";
import { ParaphraseMode } from "../types";
import { requestParaphrase } from "../services/api";

interface CompareModesModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalText: string;
  onSelectVersion: (text: string, mode: ParaphraseMode) => void;
}

export const CompareModesModal: React.FC<CompareModesModalProps> = ({
  isOpen,
  onClose,
  originalText,
  onSelectVersion,
}) => {
  const [results, setResults] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMode, setCopiedMode] = useState<string | null>(null);

  if (!isOpen) return null;

  const compareModes: Array<{ id: ParaphraseMode; title: string; desc: string }> = [
    { id: "standard", title: "Standard", desc: "Balanced rewrite for everyday clarity" },
    { id: "fluency", title: "Fluency", desc: "Smooth grammatical refinement" },
    { id: "academic", title: "Academic", desc: "Scholarly vocabulary with citation preservation" },
  ];

  const handleRunCompare = async () => {
    if (!originalText.trim()) return;
    setIsLoading(true);
    const newResults: Record<string, string> = {};

    try {
      // Run paraphrases in parallel for 3 modes
      await Promise.all(
        compareModes.map(async (m) => {
          try {
            const res = await requestParaphrase({
              text: originalText,
              mode: m.id,
              domain: "General Academic",
              controls: {
                creativity: 35,
                vocabulary: 75,
                restructuring: 60,
                formality: m.id === "academic" ? 90 : 70,
                conciseness: 50,
                meaningPreservation: 95,
              },
            });
            if (res.data?.paraphrasedText) {
              newResults[m.id] = res.data.paraphrasedText;
            }
          } catch (e) {
            console.warn(`Failed mode ${m.id}`, e);
          }
        })
      );

      setResults(newResults);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (modeId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMode(modeId);
    setTimeout(() => setCopiedMode(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Compare Modes
              </h3>
              <p className="text-xs text-slate-500">
                Evaluate Standard, Fluency, and Academic rewrites side-by-side.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRunCompare}
              disabled={isLoading || !originalText.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>{isLoading ? "Comparing..." : "Generate Comparison"}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {compareModes.map((m) => {
            const output = results[m.id];
            return (
              <div
                key={m.id}
                className="flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 overflow-hidden"
              >
                <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white capitalize">
                      {m.title}
                    </h4>
                    <p className="text-[10px] text-slate-400 leading-tight">{m.desc}</p>
                  </div>
                  {output && (
                    <button
                      onClick={() => handleCopy(m.id, output)}
                      className="p-1 hover:text-emerald-600 text-slate-400"
                      title="Copy"
                    >
                      {copiedMode === m.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>

                <div className="p-3 flex-1 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-normal min-h-[140px]">
                  {output ? (
                    output
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 text-center italic">
                      {isLoading ? "Generating rewrite..." : 'Click "Generate Comparison"'}
                    </div>
                  )}
                </div>

                {output && (
                  <div className="p-2 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <button
                      onClick={() => {
                        onSelectVersion(output, m.id);
                        onClose();
                      }}
                      className="w-full py-1.5 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 font-bold text-xs rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Use this Version</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
