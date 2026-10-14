import React from "react";
import { ShieldCheck, X, Trash2, Lock, FileCheck, CheckCircle2, AlertTriangle } from "lucide-react";

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClearSession: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({
  isOpen,
  onClose,
  onClearSession,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 text-xs animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-sm font-['Plus_Jakarta_Sans']">
                Academic Integrity & Data Privacy Charter
              </h2>
              <p className="text-[11px] text-slate-500">
                Ethical scholarship principles and document protection standards.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Ethical Academic Charter */}
        <div className="space-y-3 mb-5">
          <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200 text-emerald-950">
            <span className="font-bold block mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Zero-Deception Academic Mandate</span>
            </span>
            <p className="text-[11px] leading-relaxed">
              ScholarWrite is intentionally designed for genuine scholarly enhancement—refining clarity, coherence, grammar, and scholarly tone. It contains <strong>zero mechanisms to deceive or bypass plagiarism detection software</strong> or evade attribution.
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-start gap-2 p-2.5 rounded-lg border border-slate-200 bg-slate-50/50">
              <Lock className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-900 block">Strict Citation Anchoring</span>
                <span className="text-slate-600 text-[11px]">
                  Citations are never deleted, fabricated, or separated from the empirical claims they support.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2 p-2.5 rounded-lg border border-slate-200 bg-slate-50/50">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-900 block">Never Invent Facts or Hallucinate Citations</span>
                <span className="text-slate-600 text-[11px]">
                  The NLP engine strictly forbids hallucinating statistics, p-values, DOIs, URLs, or literature that was not present in the original manuscript.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-2 p-2.5 rounded-lg border border-slate-200 bg-slate-50/50">
              <FileCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-900 block">Ephemeral In-Memory Processing</span>
                <span className="text-slate-600 text-[11px]">
                  Documents reside only in client runtime memory and transient API inference. No papers are logged, indexed, or stored.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Clear Data Now */}
        <div className="p-3 rounded-xl bg-slate-100 border border-slate-200 mb-6 flex items-center justify-between">
          <div>
            <span className="font-bold text-slate-800 block">Purge Session Data</span>
            <span className="text-[11px] text-slate-500">Wipe all current text, history, and uploaded files from browser memory.</span>
          </div>
          <button
            onClick={() => {
              onClearSession();
              onClose();
            }}
            className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Purge Now</span>
          </button>
        </div>

        {/* Close button */}
        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs cursor-pointer"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};
