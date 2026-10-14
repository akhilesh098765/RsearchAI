import React, { useState } from "react";
import { History, RotateCcw, Columns, Calendar, Eye, Check, X } from "lucide-react";
import { VersionRecord } from "../types";
import { computeWordDiff } from "../services/nlpEngine";

interface VersionHistoryProps {
  versions: VersionRecord[];
  currentText: string;
  onRestoreVersion: (version: VersionRecord) => void;
  onClose?: () => void;
  isModal?: boolean;
}

export const VersionHistoryDrawer: React.FC<VersionHistoryProps> = ({
  versions,
  currentText,
  onRestoreVersion,
  onClose,
  isModal = false,
}) => {
  const [selectedV1Index, setSelectedV1Index] = useState<number>(0);
  const [selectedV2Index, setSelectedV2Index] = useState<number>(Math.max(0, versions.length - 1));
  const [compareMode, setCompareMode] = useState<"side-by-side" | "diff">("side-by-side");

  const v1 = versions[selectedV1Index] || versions[0];
  const v2 = versions[selectedV2Index] || versions[versions.length - 1];

  const diffChunks = v1 && v2 ? computeWordDiff(v1.text, v2.text) : [];

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2 font-['Plus_Jakarta_Sans']">
            <History className="w-5 h-5 text-indigo-600" />
            <span>Document Version History & Revisions</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Compare any two historical checkpoints, inspect word changes, and restore prior iterations safely.
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {versions.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400">
          <History className="w-8 h-8 mx-auto mb-2 text-slate-300" />
          <p className="text-sm">No historical revisions recorded yet. Paraphrase your document to create versions.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Version List Timeline */}
          <div className="lg:col-span-4 bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Revision Checkpoints ({versions.length})
            </span>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {versions.map((ver, idx) => {
                const isV1 = selectedV1Index === idx;
                const isV2 = selectedV2Index === idx;

                return (
                  <div
                    key={ver.id}
                    className={`p-3 rounded-xl border text-xs transition-all ${
                      isV2
                        ? "bg-indigo-50/80 border-indigo-300 shadow-xs ring-1 ring-indigo-500/20"
                        : "bg-white border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-900">{ver.label}</span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {ver.timestamp}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-2">
                      <span className="capitalize">{ver.mode} Mode</span>
                      <span>•</span>
                      <span>{ver.wordCount} words</span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSelectedV1Index(idx)}
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold cursor-pointer ${
                            isV1 ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          Compare as A
                        </button>
                        <button
                          onClick={() => setSelectedV2Index(idx)}
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold cursor-pointer ${
                            isV2 ? "bg-indigo-600 text-white" : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                          }`}
                        >
                          Compare as B
                        </button>
                      </div>

                      <button
                        onClick={() => onRestoreVersion(ver)}
                        className="text-indigo-600 hover:text-indigo-800 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                        title="Restore this version into editor"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Restore</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Comparative Inspection */}
          <div className="lg:col-span-8 bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-slate-700">Comparing:</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-bold">
                  {v1?.label || "Version A"}
                </span>
                <span className="text-slate-400">vs</span>
                <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 font-bold border border-indigo-200">
                  {v2?.label || "Version B"}
                </span>
              </div>

              {/* Diff Toggle */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                <button
                  onClick={() => setCompareMode("side-by-side")}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md cursor-pointer ${
                    compareMode === "side-by-side" ? "bg-white text-indigo-700 font-semibold shadow-xs" : "text-slate-600"
                  }`}
                >
                  Side-by-Side
                </button>
                <button
                  onClick={() => setCompareMode("diff")}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md cursor-pointer ${
                    compareMode === "diff" ? "bg-white text-indigo-700 font-semibold shadow-xs" : "text-slate-600"
                  }`}
                >
                  Inline Diff
                </button>
              </div>
            </div>

            {/* Comparison Display */}
            <div className="flex-1 min-h-[360px] overflow-y-auto">
              {compareMode === "side-by-side" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50/70 rounded-lg border border-slate-100">
                    <span className="text-[11px] font-bold text-slate-500 uppercase block mb-2">
                      {v1?.label || "Version A"}
                    </span>
                    <p className="font-['Crimson_Pro'] text-base text-slate-800 whitespace-pre-wrap leading-relaxed">
                      {v1?.text}
                    </p>
                  </div>
                  <div className="p-3 bg-indigo-50/30 rounded-lg border border-indigo-100">
                    <span className="text-[11px] font-bold text-indigo-700 uppercase block mb-2">
                      {v2?.label || "Version B"}
                    </span>
                    <p className="font-['Crimson_Pro'] text-base text-slate-900 whitespace-pre-wrap leading-relaxed">
                      {v2?.text}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 font-['Crimson_Pro'] text-base leading-relaxed text-slate-800 whitespace-pre-wrap">
                  {diffChunks.map((chunk, idx) => {
                    if (chunk.added) {
                      return (
                        <span key={idx} className="bg-emerald-100 text-emerald-950 px-1 py-0.5 rounded font-medium">
                          {chunk.value}
                        </span>
                      );
                    }
                    if (chunk.removed) {
                      return (
                        <span key={idx} className="bg-rose-50 text-rose-700 line-through px-1 py-0.5 rounded text-xs opacity-75 mr-0.5">
                          {chunk.value}
                        </span>
                      );
                    }
                    return <span key={idx}>{chunk.value}</span>;
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
