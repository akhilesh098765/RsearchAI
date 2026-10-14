import React, { useState } from "react";
import {
  Quote,
  Copy,
  Check,
  Sparkles,
  BookOpen,
  Globe,
  FileText,
  Video,
  Download,
  Plus,
  Trash2,
} from "lucide-react";
import { CitationStyle, CitationSourceType, CitationResult } from "../types";
import { requestCitation } from "../services/api";

interface SavedCitation extends CitationResult {
  id: string;
  style: CitationStyle;
  title: string;
}

export const CitationGeneratorTab: React.FC = () => {
  const [style, setStyle] = useState<CitationStyle>("APA");
  const [sourceType, setSourceType] = useState<CitationSourceType>("journal");

  // Input fields
  const [title, setTitle] = useState("Attention Is All You Need");
  const [authors, setAuthors] = useState("Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J.");
  const [year, setYear] = useState("2017");
  const [journal, setJournal] = useState("Advances in Neural Information Processing Systems (NeurIPS)");
  const [url, setUrl] = useState("https://arxiv.org/abs/1706.03762");

  const [currentCitation, setCurrentCitation] = useState<CitationResult | null>(null);
  const [savedCitations, setSavedCitations] = useState<SavedCitation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedInText, setCopiedInText] = useState(false);
  const [copiedFull, setCopiedFull] = useState(false);

  const handleGenerateCitation = async () => {
    setIsLoading(true);
    try {
      const res = await requestCitation({
        style,
        sourceType,
        details: {
          title,
          authors,
          year,
          journal,
          url,
        },
      });

      if (res.data) {
        setCurrentCitation(res.data);
      }
    } catch (err) {
      console.error("Citation generator error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCitation = () => {
    if (!currentCitation) return;
    const newSaved: SavedCitation = {
      ...currentCitation,
      id: `cite-${Date.now()}`,
      style,
      title: title || "Academic Citation",
    };
    setSavedCitations((prev) => [newSaved, ...prev]);
  };

  const handleCopyInText = () => {
    if (!currentCitation?.inTextCitation) return;
    navigator.clipboard.writeText(currentCitation.inTextCitation);
    setCopiedInText(true);
    setTimeout(() => setCopiedInText(false), 2000);
  };

  const handleCopyFull = () => {
    if (!currentCitation?.fullCitation) return;
    navigator.clipboard.writeText(currentCitation.fullCitation);
    setCopiedFull(true);
    setTimeout(() => setCopiedFull(false), 2000);
  };

  const handleExportAll = () => {
    if (savedCitations.length === 0) return;
    const content = savedCitations.map((c) => c.fullCitation).join("\n\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `references-${style.toLowerCase()}.txt`;
    link.click();
  };

  return (
    <div className="flex-1 flex flex-col gap-4">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
            <Quote className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-base text-slate-900 dark:text-white">
              AI Citation Generator
            </h2>
            <p className="text-xs text-slate-500">
              Generate flawless in-text and full bibliography citations in APA, MLA, Chicago, and Harvard. 100% Free.
            </p>
          </div>
        </div>

        {/* Style Selector Tabs */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            {(["APA", "MLA", "Chicago", "Harvard"] as CitationStyle[]).map((s) => (
              <button
                key={s}
                onClick={() => setStyle(s)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer ${
                  style === s
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <button
            onClick={handleGenerateCitation}
            disabled={isLoading || !title.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>{isLoading ? "Formatting..." : "Generate Citation"}</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
        {/* Left Source Form */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <span className="font-bold text-sm text-slate-900 dark:text-white">
              Source Details
            </span>

            {/* Source Type Selector */}
            <div className="flex items-center gap-1 text-xs">
              {[
                { id: "journal", label: "Journal", icon: BookOpen },
                { id: "website", label: "Website", icon: Globe },
                { id: "book", label: "Book", icon: FileText },
              ].map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSourceType(t.id as CitationSourceType)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg font-medium cursor-pointer ${
                      sourceType === t.id
                        ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-semibold"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Article / Source Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Attention Is All You Need"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                Author(s) (Format: Last, First M.)
              </label>
              <input
                type="text"
                value={authors}
                onChange={(e) => setAuthors(e.target.value)}
                placeholder="e.g. Vaswani, A., Shazeer, N."
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Publication Year
                </label>
                <input
                  type="text"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="2017"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Journal / Publisher
                </label>
                <input
                  type="text"
                  value={journal}
                  onChange={(e) => setJournal(e.target.value)}
                  placeholder="NeurIPS"
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                URL or DOI
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://arxiv.org/abs/1706.03762"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Right Citation Output & Saved List */}
        <div className="flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <span className="font-bold text-sm text-slate-900 dark:text-white">
              Generated Citation ({style})
            </span>

            {currentCitation && (
              <button
                onClick={handleSaveCitation}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-100 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Save to Bibliography</span>
              </button>
            )}
          </div>

          {!currentCitation ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-400 py-12">
              <Quote className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
              <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                No Citation Formatted Yet
              </p>
              <p className="text-xs max-w-xs mt-1">
                Click "Generate Citation" to create in-text citations and reference list entries.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* In-Text Citation Preview */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    In-Text Citation
                  </span>
                  <button
                    onClick={handleCopyInText}
                    className="flex items-center gap-1 text-xs text-emerald-600 font-semibold hover:underline"
                  >
                    {copiedInText ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedInText ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <div className="font-semibold text-sm text-slate-900 dark:text-white">
                  {currentCitation.inTextCitation}
                </div>
              </div>

              {/* Full Bibliography Citation */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Full Reference (Bibliography)
                  </span>
                  <button
                    onClick={handleCopyFull}
                    className="flex items-center gap-1 text-xs text-emerald-600 font-semibold hover:underline"
                  >
                    {copiedFull ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedFull ? "Copied" : "Copy"}</span>
                  </button>
                </div>
                <div className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-serif">
                  {currentCitation.fullCitation}
                </div>
              </div>
            </div>
          )}

          {/* Saved Citations List */}
          {savedCitations.length > 0 && (
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Saved Bibliography ({savedCitations.length})
                </span>
                <button
                  onClick={handleExportAll}
                  className="flex items-center gap-1 text-xs text-emerald-600 font-bold hover:underline"
                >
                  <Download className="w-3 h-3" />
                  <span>Export All (.txt)</span>
                </button>
              </div>

              <div className="max-h-40 overflow-y-auto space-y-2">
                {savedCitations.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between text-xs"
                  >
                    <span className="truncate pr-2 font-medium text-slate-800 dark:text-slate-200">
                      {item.title} ({item.style})
                    </span>
                    <button
                      onClick={() => setSavedCitations((prev) => prev.filter((c) => c.id !== item.id))}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
