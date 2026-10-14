import React from "react";
import { Check, X, Sparkles, AlertTriangle, BookOpen } from "lucide-react";
import { WordSuggestion } from "../types";

interface WordSuggestionPopupProps {
  suggestionData: {
    originalWord: string;
    suggestions: WordSuggestion[];
    isTechnicalTerm?: boolean;
    technicalTermWarning?: string | null;
  } | null;
  onApplyReplacement: (original: string, replacement: string) => void;
  onClose: () => void;
  isLoading?: boolean;
}

export const WordSuggestionPopup: React.FC<WordSuggestionPopupProps> = ({
  suggestionData,
  onApplyReplacement,
  onClose,
  isLoading = false,
}) => {
  if (!suggestionData && !isLoading) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-indigo-100 p-3.5 w-80 text-xs animate-in fade-in zoom-in-95">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
        <div className="flex items-center gap-1.5 font-semibold text-slate-800">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>Academic Synonym Engine</span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {isLoading ? (
        <div className="py-6 text-center text-slate-500 flex flex-col items-center gap-2">
          <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span>Analyzing context & academic suitability...</span>
        </div>
      ) : (
        <>
          {/* Original Word Badge */}
          <div className="flex items-center justify-between bg-slate-50 rounded-lg px-2.5 py-1.5 mb-2.5">
            <span className="text-slate-500 font-medium">Original:</span>
            <span className="font-bold text-slate-900 font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">
              "{suggestionData?.originalWord}"
            </span>
          </div>

          {/* Technical Term Warning */}
          {suggestionData?.isTechnicalTerm && (
            <div className="mb-2.5 p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-start gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold">Standardized Technical Term:</span>{" "}
                {suggestionData.technicalTermWarning || "Altering this term may dilute technical accuracy."}
              </div>
            </div>
          )}

          {/* Suggestions List */}
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {suggestionData?.suggestions.map((sug, idx) => (
              <div
                key={idx}
                className="group p-2.5 rounded-lg border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 transition-all"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900 text-sm">{sug.replacement}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {Math.round(sug.meaningCompatibility * 100)}% fit
                    </span>
                    <button
                      onClick={() => onApplyReplacement(sug.originalWord, sug.replacement)}
                      className="p-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs cursor-pointer"
                      title="Accept suggestion"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Metadata tags */}
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-1.5">
                  <span className="bg-slate-100 px-1.5 py-0.2 rounded font-medium">{sug.partOfSpeech}</span>
                  <span>•</span>
                  <span className="text-slate-600 font-medium">{sug.formalityLevel}</span>
                  <span>•</span>
                  <span className="text-emerald-700 font-semibold">{sug.academicSuitability} Rigor</span>
                </div>

                {/* Example sentence */}
                {sug.exampleSentence && (
                  <div className="text-[11px] text-slate-600 italic bg-slate-50 p-1.5 rounded border border-slate-100 flex items-start gap-1">
                    <BookOpen className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                    <span>"{sug.exampleSentence}"</span>
                  </div>
                )}

                {/* Rationale */}
                {sug.reason && (
                  <p className="text-[10px] text-slate-500 mt-1">
                    <span className="font-medium text-slate-600">Rationale:</span> {sug.reason}
                  </p>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
