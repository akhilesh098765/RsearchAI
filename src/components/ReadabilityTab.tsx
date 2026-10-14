import React from "react";
import { Gauge, BookOpen, BarChart3, TrendingUp } from "lucide-react";
import { calculateReadabilityMetrics } from "../services/nlpEngine";

interface ReadabilityTabProps {
  originalText: string;
  paraphrasedText: string;
}

export const ReadabilityTab: React.FC<ReadabilityTabProps> = ({
  originalText,
  paraphrasedText,
}) => {
  const orig = calculateReadabilityMetrics(originalText);
  const para = calculateReadabilityMetrics(paraphrasedText);

  const METRICS = [
    {
      title: "Flesch Reading Ease",
      origValue: `${orig.readingEase} / 100`,
      paraValue: `${para.readingEase} / 100`,
      desc: "Standard metric for readability. Academic prose balances between 35 and 55.",
      higherIsBetter: true,
    },
    {
      title: "Flesch-Kincaid Grade Level",
      origValue: `Grade ${orig.gradeLevel}`,
      paraValue: `Grade ${para.gradeLevel}`,
      desc: "Target for peer-reviewed papers is Grade 13.0 to 16.0 (Undergraduate to Doctoral).",
      higherIsBetter: null,
    },
    {
      title: "Gunning Fog Index",
      origValue: `${orig.gunningFog}`,
      paraValue: `${para.gunningFog}`,
      desc: "Estimates the years of formal education needed to understand the text on first reading.",
      higherIsBetter: null,
    },
    {
      title: "Vocabulary Diversity (TTR)",
      origValue: `${Math.round(orig.typeTokenRatio * 100)}%`,
      paraValue: `${Math.round(para.typeTokenRatio * 100)}%`,
      desc: "Unique words divided by total words. Higher diversity prevents repetitive prose.",
      higherIsBetter: true,
    },
    {
      title: "Average Sentence Length",
      origValue: `${orig.avgWordsPerSentence} words`,
      paraValue: `${para.avgWordsPerSentence} words`,
      desc: "Scholarly sweet spot is 18–24 words per proposition.",
      higherIsBetter: null,
    },
    {
      title: "Passive Voice Ratio",
      origValue: `${orig.passiveRatio}%`,
      paraValue: `${para.passiveRatio}%`,
      desc: "Scientific methodology sections commonly feature 25%–40% passive voice.",
      higherIsBetter: null,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 font-['Plus_Jakarta_Sans']">
          <Gauge className="w-5 h-5 text-indigo-600" />
          <span>Readability & Scholarly Linguistics Diagnostics</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Quantitative readability metrics comparing source manuscript with rewritten academic text.
        </p>
      </div>

      {/* Comparison Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {METRICS.map((m, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between"
          >
            <div>
              <span className="text-xs font-bold text-slate-700 block mb-2">{m.title}</span>
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mb-2.5">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold block">
                    Original
                  </span>
                  <span className="text-sm font-semibold text-slate-700">{m.origValue}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-indigo-600 font-semibold block">
                    Paraphrased
                  </span>
                  <span className="text-sm font-bold text-indigo-900">{m.paraValue}</span>
                </div>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">{m.desc}</p>
          </div>
        ))}
      </div>

      {/* Target Audience Interpretation */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-2 font-bold text-slate-800 text-sm font-['Plus_Jakarta_Sans']">
          <BookOpen className="w-4 h-4 text-indigo-600" />
          <span>Target Audience Calibration</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          The current paraphrased manuscript registers at{" "}
          <strong className="text-slate-900">{para.academicGradeDescription}</strong>. This registers optimal syntactic cadence for scholarly peer-review, dissertation review boards, and indexed conference presentations.
        </p>
      </div>
    </div>
  );
};
