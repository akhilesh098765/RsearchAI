import React from "react";
import {
  Sparkles,
  UploadCloud,
  FileDown,
  History,
  RotateCcw,
  GraduationCap,
  Zap,
  Briefcase,
  Lightbulb,
  Minimize2,
  Maximize2,
  Palette,
  Sliders,
  Snowflake,
  ArrowLeftRight,
  Settings2,
} from "lucide-react";
import { ParaphraseMode } from "../types";

interface HeaderProps {
  currentMode: ParaphraseMode;
  onModeChange: (mode: ParaphraseMode) => void;
  synonymLevel: number;
  onSynonymLevelChange: (level: number) => void;
  freezeWordsCount: number;
  onOpenFreezeWords: () => void;
  onOpenCompareModes: () => void;
  onOpenExtractor: () => void;
  onOpenExport: () => void;
  onOpenVersions: () => void;
  onClearAll: () => void;
  onParaphrase: () => void;
  isProcessing: boolean;
  versionCount: number;
  hasContent: boolean;
}

const MODES: Array<{
  id: ParaphraseMode;
  label: string;
  desc: string;
  icon: React.ElementType;
}> = [
  {
    id: "standard",
    label: "Standard",
    desc: "Reliable rewrite with natural vocabulary",
    icon: Sparkles,
  },
  {
    id: "fluency",
    label: "Fluency",
    desc: "Smooth grammatical flow and flawless phrasing",
    icon: Zap,
  },
  {
    id: "formal",
    label: "Formal",
    desc: "Polished, executive academic tone",
    icon: Briefcase,
  },
  {
    id: "academic",
    label: "Academic",
    desc: "Rigorous scholarly phrasing & citation safe",
    icon: GraduationCap,
  },
  {
    id: "simple",
    label: "Simple",
    desc: "Plain, straightforward English without jargon",
    icon: Lightbulb,
  },
  {
    id: "creative",
    label: "Creative",
    desc: "Vivid, expressive prose and idioms",
    icon: Palette,
  },
  {
    id: "expand",
    label: "Expand",
    desc: "Adds depth, context, and structural detail",
    icon: Maximize2,
  },
  {
    id: "shorten",
    label: "Shorten",
    desc: "Concise summary cutting unnecessary fluff",
    icon: Minimize2,
  },
  {
    id: "custom",
    label: "Custom",
    desc: "User-defined custom prompt and style",
    icon: Settings2,
  },
];

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onModeChange,
  synonymLevel,
  onSynonymLevelChange,
  freezeWordsCount,
  onOpenFreezeWords,
  onOpenCompareModes,
  onOpenExtractor,
  onOpenExport,
  onOpenVersions,
  onClearAll,
  onParaphrase,
  isProcessing,
  versionCount,
  hasContent,
}) => {
  return (
    <header className="sticky top-0 z-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-2xs">
      {/* Primary Navigation Bar */}
      <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Left Side: Brand and Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
            <svg
              className="w-4.5 h-4.5 text-white fill-current"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M21.71 2.29a1 1 0 0 0-1.09-.21L2.62 9.08a1 1 0 0 0-.12 1.83l6.5 3.25 3.25 6.5a1 1 0 0 0 1.83-.12l7-18a1 1 0 0 0-.37-1.25zM13.5 17.5l-2.07-4.14 5.21-5.21a.75.75 0 0 0-1.06-1.06l-5.21 5.21L6.23 10.15l13.62-5.3-6.35 12.65z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                AI <span className="text-emerald-600">Paraphraser</span>
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 hidden sm:inline-block">
                100% Free
              </span>
            </div>
          </div>
        </div>

        {/* Right Side Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Compare Modes Button */}
          <button
            onClick={onOpenCompareModes}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            title="Compare 3 modes side by side"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden md:inline">Compare Modes</span>
          </button>

          {/* Freeze Words Button */}
          <button
            onClick={onOpenFreezeWords}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
              freezeWordsCount > 0
                ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700"
            }`}
            title="Prevent specific words from changing"
          >
            <Snowflake className="w-3.5 h-3.5 text-indigo-500" />
            <span className="hidden sm:inline">Freeze Words</span>
            {freezeWordsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                {freezeWordsCount}
              </span>
            )}
          </button>

          {/* Extract Content from File */}
          <button
            id="extract-file-header-btn"
            onClick={onOpenExtractor}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800 transition-colors shadow-2xs cursor-pointer"
            title="Extract text from PDF, Word (.docx), or Text files"
          >
            <UploadCloud className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Upload Doc</span>
          </button>

          {/* History */}
          <button
            id="history-header-btn"
            onClick={onOpenVersions}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            title="View revision history"
          >
            <History className="w-4 h-4 text-slate-500" />
            <span className="hidden md:inline">History</span>
            {versionCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-bold">
                {versionCount}
              </span>
            )}
          </button>

          {/* Export */}
          <button
            id="export-header-btn"
            onClick={onOpenExport}
            disabled={!hasContent}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
              hasContent
                ? "text-slate-700 dark:text-slate-200 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700"
                : "text-slate-300 dark:text-slate-600 border-slate-100 dark:border-slate-800 cursor-not-allowed"
            }`}
            title="Download rewritten content"
          >
            <FileDown className="w-4 h-4" />
            <span className="hidden md:inline">Export</span>
          </button>

          {/* Clear All */}
          {hasContent && (
            <button
              id="clear-all-header-btn"
              onClick={onClearAll}
              className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 text-xs transition-colors cursor-pointer"
              title="Clear all text"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}

          {/* Main Paraphrase CTA in Header */}
          <button
            id="paraphrase-header-btn"
            onClick={onParaphrase}
            disabled={isProcessing || !hasContent}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs transition-all cursor-pointer ${
              isProcessing || !hasContent
                ? "bg-emerald-300 dark:bg-emerald-800 cursor-not-allowed opacity-75"
                : "bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-200 hover:scale-[1.02] active:scale-[0.98]"
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${isProcessing ? "animate-spin" : ""}`} />
            <span>{isProcessing ? "Paraphrasing..." : "Paraphrase"}</span>
          </button>
        </div>
      </div>

      {/* Modes & Synonyms Sub-Bar */}
      <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 px-4 sm:px-6 py-2 overflow-x-auto">
        <div className="flex items-center justify-between gap-4">
          {/* Modes List */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mr-1 hidden sm:inline">
              Modes:
            </span>
            {MODES.map((mode) => {
              const Icon = mode.icon;
              const isActive = currentMode === mode.id;
              return (
                <button
                  key={mode.id}
                  id={`mode-btn-${mode.id}`}
                  onClick={() => onModeChange(mode.id)}
                  title={mode.desc}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-xs scale-100"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-slate-500"}`} />
                  <span>{mode.label}</span>
                </button>
              );
            })}
          </div>

          {/* Synonyms Slider */}
          <div className="flex items-center gap-2 shrink-0 px-2 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
            <div className="flex items-center gap-1 text-slate-500">
              <Sliders className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-semibold text-[11px] hidden sm:inline">Synonyms:</span>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => onSynonymLevelChange(lvl)}
                  title={`Synonym frequency level ${lvl}`}
                  className={`w-6 h-6 rounded-md font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${
                    synonymLevel === lvl
                      ? "bg-emerald-600 text-white shadow-2xs"
                      : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
