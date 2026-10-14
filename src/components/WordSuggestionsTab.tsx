import React, { useState } from "react";
import { Sparkles, Check, RotateCcw, AlertTriangle, BookOpen, Search } from "lucide-react";
import { AcademicDomain, ParaphraseMode, WordSuggestion } from "../types";
import { WordSuggestionPopup } from "./WordSuggestionPopup";
import { requestSuggestions } from "../services/api";

interface WordSuggestionsTabProps {
  currentDomain: AcademicDomain;
  currentMode: ParaphraseMode;
  paraphrasedText: string;
  setParaphrasedText: (text: string) => void;
  wordChanges: WordSuggestion[];
  onAcceptWordChange: (index: number) => void;
  onRejectWordChange: (index: number) => void;
  onAcceptAllWordChanges: () => void;
}

export const WordSuggestionsTab: React.FC<WordSuggestionsTabProps> = ({
  currentDomain,
  currentMode,
  paraphrasedText,
  setParaphrasedText,
  wordChanges,
  onAcceptWordChange,
  onRejectWordChange,
  onAcceptAllWordChanges,
}) => {
  const [selectedWord, setSelectedWord] = useState<string>("");
  const [suggestionData, setSuggestionData] = useState<{
    originalWord: string;
    suggestions: WordSuggestion[];
    isTechnicalTerm?: boolean;
    technicalTermWarning?: string | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLookup = async (wordToLookup: string) => {
    const clean = wordToLookup.trim().replace(/[^a-zA-Z0-9'-]/g, "");
    if (!clean) return;
    setSelectedWord(clean);
    setIsLoading(true);
    try {
      const res = await requestSuggestions({
        selectedText: clean,
        sentenceContext: paraphrasedText.slice(0, 300),
        domain: currentDomain,
        mode: currentMode,
      });
      setSuggestionData({
        originalWord: clean,
        suggestions: res.data.suggestions,
        isTechnicalTerm: res.data.isTechnicalTerm,
        technicalTermWarning: res.data.technicalTermWarning,
      });
    } catch (err) {
      console.error("Lookup error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = (orig: string, repl: string) => {
    const regex = new RegExp(`\\b${orig}\\b`, "i");
    const updated = paraphrasedText.replace(regex, repl);
    setParaphrasedText(updated);
    setSuggestionData(null);
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 font-['Plus_Jakarta_Sans']">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <span>Context-Aware Academic Vocabulary & Synonym Engine</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Explore scholarly substitutions ranked by semantic compatibility, formality index, and domain-specific lexicon standards.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Quick Word Search & Active Changes */}
        <div className="lg:col-span-4 space-y-4">
          {/* Quick Search */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Query Academic Synonyms
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                value={selectedWord}
                onChange={(e) => setSelectedWord(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLookup(selectedWord)}
                placeholder="Type a word (e.g. show, big, good)..."
                className="flex-1 p-2 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-hidden font-medium"
              />
              <button
                onClick={() => handleLookup(selectedWord)}
                disabled={isLoading || !selectedWord.trim()}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1 cursor-pointer disabled:opacity-60"
              >
                <Search className="w-3.5 h-3.5" />
                <span>Search</span>
              </button>
            </div>
          </div>

          {/* Pending Changes in Current Manuscript */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Manuscript Word Rewrites ({wordChanges.length})
              </span>
              {wordChanges.length > 0 && (
                <button
                  onClick={onAcceptAllWordChanges}
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                >
                  Accept All
                </button>
              )}
            </div>

            {wordChanges.length === 0 ? (
              <p className="text-xs text-slate-400">No active word-level substitutions pending.</p>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {wordChanges.map((change, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg border border-slate-100 hover:border-slate-200 bg-slate-50/50 text-xs flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                        <span className="line-through text-slate-400 font-normal">
                          {change.originalWord}
                        </span>
                        <span>→</span>
                        <span className="text-indigo-700 font-bold">{change.suggestedReplacement || change.replacement}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        {Math.round(change.meaningCompatibility * 100)}% fit • {change.formalityLevel}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onAcceptWordChange(idx)}
                        className={`p-1 rounded cursor-pointer ${
                          change.status === "accepted"
                            ? "bg-emerald-600 text-white"
                            : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                        }`}
                        title="Accept"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onRejectWordChange(idx)}
                        className={`p-1 rounded cursor-pointer ${
                          change.status === "rejected"
                            ? "bg-rose-600 text-white"
                            : "text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        }`}
                        title="Reject"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Interactive Manuscript Inspector & Suggestion Popover */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Interactive Text Inspector (Click Any Word)
            </span>
            <span className="text-[11px] text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
              Domain: {currentDomain}
            </span>
          </div>

          <div className="relative flex-1 min-h-[350px]">
            <div className="font-['Crimson_Pro'] text-base leading-relaxed text-slate-800 whitespace-pre-wrap">
              {paraphrasedText.split(/(\s+)/).map((segment, idx) => {
                if (/^\s+$/.test(segment)) return <span key={idx}>{segment}</span>;
                const clean = segment.replace(/[^a-zA-Z0-9'-]/g, "");

                return (
                  <span
                    key={idx}
                    onClick={() => handleLookup(clean)}
                    className="inline hover:bg-indigo-100 hover:text-indigo-950 px-0.5 rounded cursor-pointer transition-colors"
                  >
                    {segment}
                  </span>
                );
              })}
            </div>

            {/* Float or Inline popup */}
            {suggestionData && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <WordSuggestionPopup
                  suggestionData={suggestionData}
                  onApplyReplacement={handleApply}
                  onClose={() => setSuggestionData(null)}
                  isLoading={isLoading}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
