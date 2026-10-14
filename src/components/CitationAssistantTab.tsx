import React from "react";
import { Quote, CheckCircle2, AlertTriangle, ShieldCheck, BookOpen, ExternalLink } from "lucide-react";
import { extractCitations, verifyCitationsPreserved } from "../services/nlpEngine";

interface CitationAssistantTabProps {
  originalText: string;
  paraphrasedText: string;
}

export const CitationAssistantTab: React.FC<CitationAssistantTabProps> = ({
  originalText,
  paraphrasedText,
}) => {
  const { originalCitations, missingCitations, retentionRate } = verifyCitationsPreserved(
    originalText,
    paraphrasedText
  );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 font-['Plus_Jakarta_Sans']">
          <Quote className="w-5 h-5 text-indigo-600" />
          <span>Citation Preservation & Attribution Assistant</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Detects and anchors in-text citations (APA, IEEE, MLA, Chicago, Harvard, Vancouver). Guarantees citations remain attached to their respective scientific claims.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Detected Citations
          </span>
          <div className="text-2xl font-bold text-slate-900">{originalCitations.length}</div>
          <span className="text-xs text-slate-500">In-text references recognized</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Preservation Rate
          </span>
          <div className="text-2xl font-bold text-emerald-700">{retentionRate}%</div>
          <span className="text-xs text-emerald-600 font-medium">
            {missingCitations.length === 0 ? "100% Retained and Claim-Anchored" : `${missingCitations.length} citation(s) require review`}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Citation Styles
          </span>
          <div className="flex items-center gap-1.5 flex-wrap mt-1">
            {["APA", "IEEE", "MLA", "Vancouver"].map((style) => (
              <span
                key={style}
                className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
              >
                {style}
              </span>
            ))}
          </div>
          <span className="text-xs text-slate-500 block mt-1.5">Strict formatting preservation</span>
        </div>
      </div>

      {/* Citations Inventory */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden mb-6">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-['Plus_Jakarta_Sans']">
            Preserved In-Text Citations Inventory
          </h3>
          <span className="text-xs text-slate-500">
            {originalCitations.length} tracked items
          </span>
        </div>

        {originalCitations.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            <Quote className="w-6 h-6 mx-auto mb-2 text-slate-300" />
            <p>No recognized in-text citation patterns found in the original document.</p>
            <p className="mt-1 text-[11px] text-slate-400">
              Supports APA e.g. (Smith et al., 2024), IEEE e.g. [1], MLA e.g. (Smith 45), Vancouver e.g. (1).
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {originalCitations.map((cit, idx) => {
              const isMissing = missingCitations.includes(cit.citation);
              return (
                <div key={idx} className="p-4 hover:bg-slate-50/70 transition-colors flex items-start gap-3">
                  <div className="mt-0.5">
                    {isMissing ? (
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    )}
                  </div>
                  <div className="flex-1 text-xs">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-900 font-mono text-sm bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {cit.citation}
                      </span>
                      <span className="px-2 py-0.2 rounded font-semibold text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {cit.format} Format
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.2 rounded ${isMissing ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>
                        {isMissing ? "Detached in Rewrite" : "Affixed to Proposition"}
                      </span>
                    </div>

                    <p className="text-slate-600 mt-1">
                      <span className="font-semibold text-slate-500">Associated Claim:</span> "{cit.attachedClaim}"
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Academic Integrity & Ethics Standard */}
      <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-200 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-indigo-700 shrink-0 mt-0.5" />
        <div className="text-xs text-indigo-950 leading-relaxed">
          <span className="font-bold block mb-1">Academic Integrity & Ethical Paraphrasing Policy</span>
          ScholarWrite explicitly disclaims any feature designed to evade plagiarism scanners or deceive attribution. Academic paraphrasing serves to enhance clarity, eliminate convoluted syntax, and polish scientific expression while giving full, uncompromised credit to original authors through preserved citations.
        </div>
      </div>
    </div>
  );
};
