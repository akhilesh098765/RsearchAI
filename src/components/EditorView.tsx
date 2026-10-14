import React, { useState, useRef, useEffect } from "react";
import {
  Copy,
  Check,
  RotateCcw,
  UploadCloud,
  Sparkles,
  ArrowRight,
  ArrowLeftRight,
  FileText,
  Trash2,
  Clipboard,
  FileDown,
  Edit3,
  Eye,
  Undo2,
  CheckCircle2,
  Info,
} from "lucide-react";
import { ParaphraseMode, WordSuggestion, SemanticEvaluation } from "../types";
import { computeWordDiff, calculateReadabilityMetrics } from "../services/nlpEngine";
import { WordSuggestionPopup } from "./WordSuggestionPopup";
import { requestSuggestions } from "../services/api";

interface EditorViewProps {
  originalText: string;
  setOriginalText: (text: string) => void;
  paraphrasedText: string;
  setParaphrasedText: (text: string) => void;
  semanticScore: number;
  semanticEvaluation?: SemanticEvaluation;
  wordChanges: WordSuggestion[];
  onAcceptWordChange?: (index: number) => void;
  onRejectWordChange?: (index: number) => void;
  onRestoreOriginal: () => void;
  currentMode: ParaphraseMode;
  onOpenExtractor: () => void;
  onOpenExport: () => void;
  onFileUpload: (file: File) => void;
  isProcessing: boolean;
  onParaphrase: () => void;
}

export const EditorView: React.FC<EditorViewProps> = ({
  originalText,
  setOriginalText,
  paraphrasedText,
  setParaphrasedText,
  semanticScore,
  wordChanges,
  onRestoreOriginal,
  currentMode,
  onOpenExtractor,
  onOpenExport,
  onFileUpload,
  isProcessing,
  onParaphrase,
}) => {
  const [viewMode, setViewMode] = useState<"interactive" | "diff" | "edit">("interactive");
  const [copied, setCopied] = useState(false);
  const [isDragOverInput, setIsDragOverInput] = useState(false);
  const [selectedWordData, setSelectedWordData] = useState<{
    originalWord: string;
    suggestions: WordSuggestion[];
    isTechnicalTerm?: boolean;
    technicalTermWarning?: string | null;
  } | null>(null);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number } | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Computations
  const origMetrics = calculateReadabilityMetrics(originalText);
  const paraMetrics = calculateReadabilityMetrics(paraphrasedText);
  const diffChunks = computeWordDiff(originalText, paraphrasedText);

  // Copy to clipboard
  const handleCopy = () => {
    if (!paraphrasedText) return;
    navigator.clipboard.writeText(paraphrasedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Paste from clipboard into input
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setOriginalText(text);
      }
    } catch {
      // Focus textarea so user can paste with keyboard
      textareaRef.current?.focus();
    }
  };

  // Keyboard shortcut: Ctrl+Enter / Cmd+Enter to rewrite
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        if (!isProcessing && originalText.trim()) {
          onParaphrase();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isProcessing, originalText, onParaphrase]);

  // Handle Drag & Drop directly onto input box
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverInput(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverInput(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverInput(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };

  // Click on any word in the output to get smart synonyms
  const handleWordClick = async (
    word: string,
    surroundingSentence: string,
    e: React.MouseEvent
  ) => {
    const cleanWord = word.replace(/[^a-zA-Z0-9'-]/g, "");
    if (!cleanWord || cleanWord.length <= 2) return;

    // Position popup near clicked element
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setPopupPosition({
      x: Math.min(rect.left, window.innerWidth - 340),
      y: rect.bottom + 8,
    });

    setIsLoadingSuggestions(true);
    setSelectedWordData({
      originalWord: cleanWord,
      suggestions: [],
    });

    try {
      const res = await requestSuggestions({
        selectedText: cleanWord,
        sentenceContext: surroundingSentence,
        domain: "General Academic",
        mode: currentMode,
      });

      setSelectedWordData({
        originalWord: cleanWord,
        suggestions: res.data.suggestions,
        isTechnicalTerm: res.data.isTechnicalTerm,
        technicalTermWarning: res.data.technicalTermWarning,
      });
    } catch (err) {
      console.error("Failed to load word suggestions:", err);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  // Replace word in the output
  const handleApplyReplacement = (originalWord: string, replacement: string) => {
    const regex = new RegExp(`\\b${originalWord}\\b`, "i");
    setParaphrasedText(paraphrasedText.replace(regex, replacement));
    setSelectedWordData(null);
  };

  // Put rewritten text back into input to iterate
  const handleSendToInput = () => {
    if (!paraphrasedText) return;
    setOriginalText(paraphrasedText);
    setParaphrasedText("");
  };

  // Sample starter text
  const handleInsertSample = () => {
    setOriginalText(
      "Modern machine learning architectures frequently encounter severe memory bottlenecks during large-scale inference on edge devices (Smith et al., 2023). Researchers have attempted to mitigate this computational challenge through dynamic weight quantization and low-rank approximation algorithms."
    );
  };

  return (
    <div id="editor-workspace" className="space-y-4">
      {/* Hidden file input for fast upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,.doc,.txt,.md,.rtf,.csv"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            onFileUpload(e.target.files[0]);
          }
        }}
      />

      {/* Main 2-Box Writing Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* ========================================================= */}
        {/* LEFT BOX: WRITE YOUR CONTENT IN BOX                       */}
        {/* ========================================================= */}
        <div
          id="input-card"
          className={`bg-white rounded-2xl border shadow-xs flex flex-col transition-all overflow-hidden relative ${
            isDragOverInput
              ? "border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/20"
              : "border-slate-200"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Drag & Drop Visual Overlay */}
          {isDragOverInput && (
            <div className="absolute inset-0 z-30 bg-indigo-600/10 backdrop-blur-2xs border-2 border-dashed border-indigo-600 rounded-2xl flex flex-col items-center justify-center pointer-events-none">
              <div className="w-14 h-14 rounded-full bg-white text-indigo-600 shadow-md flex items-center justify-center mb-2">
                <UploadCloud className="w-8 h-8 animate-bounce" />
              </div>
              <p className="text-sm font-bold text-indigo-900">Drop your file here to extract content</p>
              <p className="text-xs text-indigo-700">PDF, Word (.docx), or Text files supported</p>
            </div>
          )}

          {/* Top Bar of Input Box */}
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Write Your Content
              </span>
              <span className="text-[11px] text-slate-600 hidden sm:inline">
                (Type, paste, or upload)
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Extract Content from File Button */}
              <button
                id="extract-file-box-btn"
                onClick={onOpenExtractor}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200 transition-colors shadow-2xs cursor-pointer"
                title="Upload PDF, DOCX, or text file to extract content"
              >
                <UploadCloud className="w-3.5 h-3.5 text-indigo-600" />
                <span>Extract from File</span>
              </button>

              {/* Paste Button */}
              <button
                id="paste-input-btn"
                onClick={handlePaste}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 text-xs font-medium transition-colors cursor-pointer"
                title="Paste from clipboard"
              >
                <Clipboard className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">Paste</span>
              </button>

              {/* Sample Button */}
              {!originalText && (
                <button
                  id="sample-input-btn"
                  onClick={handleInsertSample}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 text-xs font-medium transition-colors cursor-pointer"
                  title="Try with a sample sentence"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="hidden sm:inline">Try Sample</span>
                </button>
              )}

              {/* Clear Button */}
              {originalText && (
                <button
                  id="clear-input-btn"
                  onClick={() => setOriginalText("")}
                  className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 text-xs transition-colors cursor-pointer"
                  title="Clear text in this box"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Direct Writing Box */}
          <div className="relative flex-1 min-h-[380px] p-4 flex flex-col">
            <textarea
              ref={textareaRef}
              id="user-content-input"
              value={originalText}
              onChange={(e) => setOriginalText(e.target.value)}
              placeholder="Write or paste your content in this box, or click 'Extract from File' above to load a document..."
              className="w-full flex-1 text-slate-900 placeholder:text-slate-500 text-sm sm:text-base leading-relaxed resize-none focus:outline-hidden font-sans border-0 p-0 bg-transparent"
              spellCheck={true}
            />
          </div>

          {/* Bottom Bar of Input Box */}
          <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
            {/* Word & Character Metrics */}
            <div className="flex items-center gap-3 text-xs text-slate-600">
              <span className="font-semibold text-slate-700">
                {origMetrics.totalWords} {origMetrics.totalWords === 1 ? "word" : "words"}
              </span>
              <span>•</span>
              <span>{origMetrics.totalChars} chars</span>
              {origMetrics.totalWords > 0 && (
                <>
                  <span className="hidden sm:inline">•</span>
                  <span className="hidden sm:inline text-slate-600">
                    ~{Math.max(1, Math.ceil(origMetrics.totalWords / 200))} min read
                  </span>
                </>
              )}
            </div>

            {/* Prominent Paraphrase Button */}
            <button
              id="rewrite-content-btn"
              onClick={onParaphrase}
              disabled={isProcessing || !originalText.trim()}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white shadow-md transition-all cursor-pointer ${
                isProcessing || !originalText.trim()
                  ? "bg-indigo-300 cursor-not-allowed opacity-75 shadow-none"
                  : "bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-300/50 hover:scale-[1.01] active:scale-[0.99]"
              }`}
            >
              <Sparkles className={`w-4 h-4 ${isProcessing ? "animate-spin" : ""}`} />
              <span>{isProcessing ? "Rewriting Content..." : "Rewrite Content"}</span>
              <span className="hidden sm:inline text-[10px] opacity-75 font-mono ml-1 px-1.5 py-0.5 rounded bg-white/20">
                Ctrl+Enter
              </span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT BOX: REWRITTEN CONTENT OUTPUT                       */}
        {/* ========================================================= */}
        <div
          id="output-card"
          className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col overflow-hidden relative"
        >
          {/* Top Bar of Output Box */}
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Rewritten Output
              </span>

              {/* View Switchers */}
              {paraphrasedText && (
                <div className="flex items-center bg-slate-200/70 p-0.5 rounded-lg ml-1">
                  <button
                    id="view-interactive-btn"
                    onClick={() => setViewMode("interactive")}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                      viewMode === "interactive"
                        ? "bg-white text-indigo-700 shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                    title="Click any word to change synonyms"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Interactive</span>
                  </button>
                  <button
                    id="view-diff-btn"
                    onClick={() => setViewMode("diff")}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                      viewMode === "diff"
                        ? "bg-white text-indigo-700 shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                    title="Highlight changes"
                  >
                    <ArrowLeftRight className="w-3 h-3" />
                    <span>Compare</span>
                  </button>
                  <button
                    id="view-edit-btn"
                    onClick={() => setViewMode("edit")}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                      viewMode === "edit"
                        ? "bg-white text-indigo-700 shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                    title="Directly edit rewritten text"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                </div>
              )}
            </div>

            {/* Output Actions */}
            <div className="flex items-center gap-1.5">
              {paraphrasedText && (
                <>
                  {/* Send Back to Input */}
                  <button
                    id="send-to-input-btn"
                    onClick={handleSendToInput}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-slate-200/60 text-xs font-medium transition-colors cursor-pointer"
                    title="Put rewritten text back into the input box to iterate"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Send to Input</span>
                  </button>

                  {/* Copy Button */}
                  <button
                    id="copy-output-btn"
                    onClick={handleCopy}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
                    title="Copy rewritten text"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>

                  {/* Export Button */}
                  <button
                    id="export-output-btn"
                    onClick={onOpenExport}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
                    title="Export as Word, PDF, or text"
                  >
                    <FileDown className="w-3.5 h-3.5 text-slate-500" />
                    <span className="hidden sm:inline">Export</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Output Content Area */}
          <div className="relative flex-1 min-h-[380px] p-4 flex flex-col overflow-y-auto">
            {/* Loading Indicator */}
            {isProcessing && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-2xs z-20 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 mb-3 shadow-xs">
                  <Sparkles className="w-6 h-6 animate-spin" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">
                  Rewriting with {currentMode} Tone...
                </h3>
                <p className="text-xs text-slate-500 max-w-xs mt-1">
                  Enhancing vocabulary, cadence, and clarity while preserving 100% of underlying meaning.
                </p>
              </div>
            )}

            {/* Empty State */}
            {!paraphrasedText && !isProcessing && (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-slate-700 mb-1">
                  Your Rewritten Text Will Appear Here
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mb-4">
                  Write or paste text into the box on the left, choose your preferred writing mode, and click <strong className="text-indigo-600">Rewrite Content</strong>.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-1.5 text-[11px] text-slate-500">
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200">
                    💡 Click any word to swap synonyms
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200">
                    🔍 Instant diff view
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200">
                    📄 Export to Word & PDF
                  </span>
                </div>
              </div>
            )}

            {/* View 1: Interactive Word-by-Word View */}
            {paraphrasedText && !isProcessing && viewMode === "interactive" && (
              <div className="flex-1 flex flex-col">
                <div className="p-2 mb-2 rounded-lg bg-indigo-50/60 border border-indigo-100 flex items-center justify-between text-xs text-indigo-800">
                  <div className="flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>
                      Tip: <strong>Click on any word</strong> to see smart academic synonyms and replace it instantly.
                    </span>
                  </div>
                  {onRestoreOriginal && (
                    <button
                      onClick={onRestoreOriginal}
                      className="text-[11px] font-semibold text-indigo-700 hover:underline flex items-center gap-1 shrink-0 ml-2"
                    >
                      <RotateCcw className="w-3 h-3" /> Revert all
                    </button>
                  )}
                </div>

                <div className="text-slate-900 text-sm sm:text-base leading-relaxed font-sans space-y-3 flex-1 select-text">
                  {paraphrasedText.split("\n\n").map((para, pIdx) => (
                    <p key={pIdx} className="leading-relaxed">
                      {para.split(/\s+/).map((rawWord, wIdx) => {
                        const cleanWord = rawWord.replace(/[^a-zA-Z0-9'-]/g, "");
                        const isChanged = wordChanges.some(
                          (c) =>
                            c.replacement.toLowerCase() === cleanWord.toLowerCase() ||
                            c.suggestedReplacement?.toLowerCase() === cleanWord.toLowerCase()
                        );

                        return (
                          <span
                            key={wIdx}
                            onClick={(e) => handleWordClick(cleanWord, para, e)}
                            className={`inline-block mx-0.5 px-0.5 rounded transition-all cursor-pointer ${
                              isChanged
                                ? "bg-indigo-100 text-indigo-950 font-medium hover:bg-indigo-200"
                                : "hover:bg-slate-100 hover:text-indigo-600"
                            }`}
                            title="Click to view synonyms"
                          >
                            {rawWord}
                          </span>
                        );
                      })}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* View 2: Diff Highlight View */}
            {paraphrasedText && !isProcessing && viewMode === "diff" && (
              <div className="flex-1 space-y-3 text-sm sm:text-base leading-relaxed font-sans select-text">
                <div className="flex items-center gap-4 text-xs font-semibold pb-2 border-b border-slate-100">
                  <span className="flex items-center gap-1 text-emerald-700">
                    <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300 inline-block" />
                    Added / Rewritten phrasing
                  </span>
                  <span className="flex items-center gap-1 text-red-700">
                    <span className="w-3 h-3 rounded bg-red-100 border border-red-300 inline-block line-through" />
                    Original removed text
                  </span>
                </div>

                <div className="leading-relaxed">
                  {diffChunks.map((chunk, idx) => {
                    if (chunk.added) {
                      return (
                        <span
                          key={idx}
                          className="bg-emerald-100 text-emerald-950 px-1 py-0.5 rounded font-medium mx-0.5"
                        >
                          {chunk.value}
                        </span>
                      );
                    }
                    if (chunk.removed) {
                      return (
                        <span
                          key={idx}
                          className="bg-red-100 text-red-800 line-through px-1 py-0.5 rounded mx-0.5 text-xs opacity-75"
                        >
                          {chunk.value}
                        </span>
                      );
                    }
                    return <span key={idx}>{chunk.value}</span>;
                  })}
                </div>
              </div>
            )}

            {/* View 3: Direct Manual Edit View */}
            {paraphrasedText && !isProcessing && viewMode === "edit" && (
              <div className="flex-1 flex flex-col">
                <textarea
                  id="paraphrased-content-textarea"
                  value={paraphrasedText}
                  onChange={(e) => setParaphrasedText(e.target.value)}
                  className="w-full flex-1 text-slate-900 text-sm sm:text-base leading-relaxed resize-none focus:outline-hidden font-sans border-0 p-0 bg-transparent"
                  spellCheck={true}
                />
              </div>
            )}
          </div>

          {/* Bottom Bar of Output Box */}
          {paraphrasedText && (
            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
              {/* Word count & Difference */}
              <div className="flex items-center gap-3 text-xs text-slate-600">
                <span className="font-semibold text-slate-700">
                  {paraMetrics.totalWords} words
                </span>
                <span>•</span>
                <span>{paraMetrics.totalChars} chars</span>
                <span className="hidden sm:inline">•</span>
                <span className="hidden sm:inline font-medium text-indigo-700">
                  {paraMetrics.totalWords - origMetrics.totalWords >= 0 ? "+" : ""}
                  {paraMetrics.totalWords - origMetrics.totalWords} words diff
                </span>
              </div>

              {/* Quality / Semantic Indicator */}
              <div className="flex items-center gap-2">
                {wordChanges.length > 0 && (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {wordChanges.length} refinements
                  </span>
                )}
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  {Math.round(semanticScore * 100)}% Meaning Preserved
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Word Suggestion Popup */}
      {selectedWordData && popupPosition && (
        <div
          style={{
            position: "fixed",
            left: `${popupPosition.x}px`,
            top: `${popupPosition.y}px`,
            zIndex: 60,
          }}
        >
          <WordSuggestionPopup
            suggestionData={selectedWordData}
            onApplyReplacement={handleApplyReplacement}
            onClose={() => setSelectedWordData(null)}
            isLoading={isLoadingSuggestions}
          />
        </div>
      )}
    </div>
  );
};
