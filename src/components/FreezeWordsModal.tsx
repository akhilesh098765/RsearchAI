import React, { useState } from "react";
import { Snowflake, X, Plus, Sparkles, Check } from "lucide-react";

interface FreezeWordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  freezeWords: string[];
  onAddFreezeWord: (word: string) => void;
  onRemoveFreezeWord: (word: string) => void;
  onClearAll: () => void;
}

const PRESET_DOMAINS = [
  {
    name: "AI & ML",
    words: ["transformer", "attention mechanism", "quantization", "eigenvalue", "backpropagation"],
  },
  {
    name: "Biomedical",
    words: ["CRISPR-Cas9", "heteroscedasticity", "polymerase", "in vitro", "double-blind"],
  },
  {
    name: "Law & Philosophy",
    words: ["prima facie", "de facto", "habeas corpus", "categorical imperative", "stare decisis"],
  },
];

export const FreezeWordsModal: React.FC<FreezeWordsModalProps> = ({
  isOpen,
  onClose,
  freezeWords,
  onAddFreezeWord,
  onRemoveFreezeWord,
  onClearAll,
}) => {
  const [inputValue, setInputValue] = useState("");

  if (!isOpen) return null;

  const handleAdd = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    // support comma separated
    const words = trimmed.split(",").map((w) => w.trim()).filter(Boolean);
    words.forEach((w) => onAddFreezeWord(w));
    setInputValue("");
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Snowflake className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Freeze Words
              </h3>
              <p className="text-xs text-slate-500">
                Words or phrases that will NEVER be changed during paraphrasing.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <div className="p-4 space-y-4">
          <form onSubmit={handleAdd} className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type word or phrase (e.g. transformer)..."
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Freeze</span>
            </button>
          </form>

          {/* Active Frozen Words Chips */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Currently Frozen ({freezeWords.length})
              </span>
              {freezeWords.length > 0 && (
                <button
                  onClick={onClearAll}
                  className="text-xs text-red-500 hover:underline font-semibold"
                >
                  Clear All
                </button>
              )}
            </div>

            {freezeWords.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-2">
                No words currently frozen. Add words above or choose from presets below.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-1">
                {freezeWords.map((word) => (
                  <span
                    key={word}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60"
                  >
                    <span>{word}</span>
                    <button
                      onClick={() => onRemoveFreezeWord(word)}
                      className="hover:text-red-500 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Presets */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Add Domain Presets
            </span>
            <div className="space-y-2">
              {PRESET_DOMAINS.map((domain) => (
                <div key={domain.name} className="space-y-1">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {domain.name}:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {domain.words.map((w) => {
                      const isAdded = freezeWords.includes(w);
                      return (
                        <button
                          key={w}
                          onClick={() => (isAdded ? onRemoveFreezeWord(w) : onAddFreezeWord(w))}
                          className={`text-[11px] px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                            isAdded
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 border-slate-200 dark:border-slate-700"
                          }`}
                        >
                          {isAdded ? "✓ " : "+ "}
                          {w}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
