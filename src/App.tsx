import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { EditorView } from "./components/EditorView";
import { FileExtractorModal } from "./components/FileExtractorModal";
import { ExportModal } from "./components/ExportModal";
import { VersionHistoryDrawer } from "./components/VersionHistoryDrawer";
import { QuillBotSidebar } from "./components/QuillBotSidebar";
import { GrammarCheckerTab } from "./components/GrammarCheckerTab";
import { SummarizerTab } from "./components/SummarizerTab";
import { AiDetectorTab } from "./components/AiDetectorTab";
import { PlagiarismCheckerTab } from "./components/PlagiarismCheckerTab";
import { TranslatorTab } from "./components/TranslatorTab";
import { CitationGeneratorTab } from "./components/CitationGeneratorTab";
import { CowriterTab } from "./components/CowriterTab";
import { FreezeWordsModal } from "./components/FreezeWordsModal";
import { CompareModesModal } from "./components/CompareModesModal";

import {
  ParaphraseMode,
  QuillBotTab,
  VersionRecord,
  WordSuggestion,
  SemanticEvaluation,
} from "./types";

import { requestParaphrase, requestExtractFile } from "./services/api";

const INITIAL_SAMPLE_TEXT = `The advent of modern machine learning architectures has transformed natural language processing and computational linguistics (Vaswani et al., 2017). However, standard attention mechanisms exhibit quadratic computational complexity relative to sequence length, creating severe memory bottlenecks during real-time inference on edge computing devices (Child et al., 2019). Researchers have attempted to mitigate this constraint through parameter quantization and dynamic sparsity.`;

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<QuillBotTab>("paraphraser");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Paraphraser Settings
  const [currentMode, setCurrentMode] = useState<ParaphraseMode>("academic");
  const [synonymLevel, setSynonymLevel] = useState<number>(2);
  const [freezeWords, setFreezeWords] = useState<string[]>(["attention mechanism", "transformer"]);

  // Document Text States
  const [originalText, setOriginalText] = useState<string>(INITIAL_SAMPLE_TEXT);
  const [paraphrasedText, setParaphrasedText] = useState<string>("");
  const [documentTitle, setDocumentTitle] = useState<string>("My Rewritten Document");

  // Semantic & Linguistic Feedback
  const [semanticScore, setSemanticScore] = useState<number>(0.96);
  const [semanticEvaluation, setSemanticEvaluation] = useState<SemanticEvaluation>({
    meaningPreserved: true,
    possibleMeaningChange: false,
    missingInfo: [],
    addedInfo: [],
    contradictionWarning: null,
  });
  const [wordChanges, setWordChanges] = useState<WordSuggestion[]>([]);

  // Version Control History
  const [versions, setVersions] = useState<VersionRecord[]>([]);

  // Modals Visibility
  const [isExtractorOpen, setIsExtractorOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isVersionsOpen, setIsVersionsOpen] = useState(false);
  const [isFreezeWordsOpen, setIsFreezeWordsOpen] = useState(false);
  const [isCompareModesOpen, setIsCompareModesOpen] = useState(false);

  // Processing & Error States
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Dark Mode Sync
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Paraphrase Execution Handler
  const handleParaphrase = async (textToParaphrase?: string) => {
    const text = textToParaphrase !== undefined ? textToParaphrase : originalText;
    if (!text || !text.trim()) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const response = await requestParaphrase({
        text,
        mode: currentMode,
        domain: "General Academic",
        freezeWords,
        synonymLevel,
        controls: {
          creativity: synonymLevel * 25,
          vocabulary: 80,
          restructuring: 60,
          formality: currentMode === "academic" ? 90 : 70,
          conciseness: currentMode === "shorten" ? 85 : 50,
          meaningPreservation: 95,
        },
        sourceLanguage: "English",
        targetLanguage: "English",
        preserveCitations: true,
      });

      const data = response.data;
      setParaphrasedText(data.paraphrasedText);
      setSemanticScore(data.semanticSimilarityScore || 0.96);
      setSemanticEvaluation(data.semanticEvaluation);
      setWordChanges(data.wordChanges || []);

      // Save to version history
      const newVersionNum = versions.length + 1;
      const newVer: VersionRecord = {
        id: `v${newVersionNum}`,
        versionNumber: newVersionNum,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        label: `Version ${newVersionNum} (${currentMode.toUpperCase()})`,
        mode: currentMode,
        domain: "General Academic",
        text: data.paraphrasedText,
        wordCount: data.paraphrasedText.split(/\s+/).filter(Boolean).length,
        changesCount: (data.wordChanges || []).length,
        semanticScore: data.semanticSimilarityScore || 0.96,
      };
      setVersions((prev) => [newVer, ...prev]);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to rewrite content. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Re-run paraphrase when mode changes if user already generated output
  const handleModeChange = (newMode: ParaphraseMode) => {
    setCurrentMode(newMode);
    if (paraphrasedText && originalText.trim() && !isProcessing) {
      setTimeout(() => {
        handleParaphrase();
      }, 50);
    }
  };

  // Freeze words management
  const handleAddFreezeWord = (word: string) => {
    if (!freezeWords.includes(word.toLowerCase())) {
      setFreezeWords((prev) => [...prev, word.toLowerCase()]);
    }
  };

  const handleRemoveFreezeWord = (word: string) => {
    setFreezeWords((prev) => prev.filter((w) => w !== word.toLowerCase()));
  };

  // File Extraction Handlers
  const handleInsertExtractedText = (text: string, append = false) => {
    if (append) {
      setOriginalText((prev) => (prev ? `${prev}\n\n${text}` : text));
    } else {
      setOriginalText(text);
    }
  };

  const handleExtractAndParaphrase = (text: string) => {
    setOriginalText(text);
    handleParaphrase(text);
  };

  // Direct File Upload from Drop on Editor
  const handleDirectFileUpload = async (file: File) => {
    try {
      const fileName = file.name;
      const fileType = file.type;

      // Plain text formats
      if (
        fileType.includes("text") ||
        fileName.endsWith(".txt") ||
        fileName.endsWith(".md") ||
        fileName.endsWith(".json") ||
        fileName.endsWith(".csv")
      ) {
        const text = await file.text();
        if (text.trim()) {
          setOriginalText(text.trim());
          return;
        }
      }

      // PDFs & Word docs
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          setIsProcessing(true);
          const base64Data = reader.result as string;
          const res = await requestExtractFile({
            fileName,
            fileType,
            base64Data,
          });

          if (res.text) {
            setOriginalText(res.text);
          }
        } catch (err: any) {
          setErrorMessage(err.message || "Failed to extract file content.");
        } finally {
          setIsProcessing(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setErrorMessage(err.message || "Could not read uploaded file.");
    }
  };

  // Restore previous version
  const handleRestoreVersion = (version: VersionRecord) => {
    setParaphrasedText(version.text);
    setIsVersionsOpen(false);
  };

  // Revert all word changes back to original
  const handleRestoreOriginal = () => {
    setParaphrasedText(originalText);
    setWordChanges([]);
  };

  // Clear all text
  const handleClearAll = () => {
    setOriginalText("");
    setParaphrasedText("");
    setWordChanges([]);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex font-['Plus_Jakarta_Sans'] text-slate-900 dark:text-slate-100 selection:bg-emerald-100 selection:text-emerald-900 transition-colors">
      {/* Sidebar Navigation */}
      <QuillBotSidebar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
      />

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header shown on Paraphraser tab */}
        {activeTab === "paraphraser" && (
          <Header
            currentMode={currentMode}
            onModeChange={handleModeChange}
            synonymLevel={synonymLevel}
            onSynonymLevelChange={(lvl) => setSynonymLevel(lvl)}
            freezeWordsCount={freezeWords.length}
            onOpenFreezeWords={() => setIsFreezeWordsOpen(true)}
            onOpenCompareModes={() => setIsCompareModesOpen(true)}
            onOpenExtractor={() => setIsExtractorOpen(true)}
            onOpenExport={() => setIsExportOpen(true)}
            onOpenVersions={() => setIsVersionsOpen(true)}
            onClearAll={handleClearAll}
            onParaphrase={() => handleParaphrase()}
            isProcessing={isProcessing}
            versionCount={versions.length}
            hasContent={Boolean(originalText.trim() || paraphrasedText.trim())}
          />
        )}

        {/* Dynamic Tool Workspace */}
        <main className="flex-1 p-4 sm:p-6 flex flex-col gap-4 max-w-7xl w-full mx-auto">
          {/* Error Banner */}
          {errorMessage && (
            <div
              id="error-banner"
              className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 flex items-center justify-between gap-3 text-xs text-red-800 dark:text-red-300 animate-in fade-in"
            >
              <p className="font-medium">{errorMessage}</p>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-red-600 hover:text-red-900 dark:hover:text-red-200 font-bold px-2 py-0.5 rounded cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Render Active Tool Tab */}
          {activeTab === "paraphraser" && (
            <EditorView
              originalText={originalText}
              setOriginalText={setOriginalText}
              paraphrasedText={paraphrasedText}
              setParaphrasedText={setParaphrasedText}
              semanticScore={semanticScore}
              semanticEvaluation={semanticEvaluation}
              wordChanges={wordChanges}
              onRestoreOriginal={handleRestoreOriginal}
              currentMode={currentMode}
              onOpenExtractor={() => setIsExtractorOpen(true)}
              onOpenExport={() => setIsExportOpen(true)}
              onFileUpload={handleDirectFileUpload}
              isProcessing={isProcessing}
              onParaphrase={() => handleParaphrase()}
            />
          )}

          {activeTab === "grammar-checker" && <GrammarCheckerTab />}

          {activeTab === "summarizer" && <SummarizerTab />}

          {activeTab === "ai-detector" && <AiDetectorTab />}

          {activeTab === "plagiarism-checker" && (
            <PlagiarismCheckerTab
              onGoToCitation={() => {
                setActiveTab("citation-generator");
              }}
            />
          )}

          {activeTab === "cowriter" && <CowriterTab />}

          {activeTab === "translator" && <TranslatorTab />}

          {activeTab === "citation-generator" && <CitationGeneratorTab />}
        </main>

        {/* Global Footer */}
        <footer className="py-3 px-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center text-xs text-slate-400">
          <p>
            AI Paraphraser • 100% Free Suite: Paraphraser, Grammar Checker, AI Detector, Summarizer, Co-Writer, Translator & Citations
          </p>
        </footer>
      </div>

      {/* Freeze Words Modal */}
      <FreezeWordsModal
        isOpen={isFreezeWordsOpen}
        onClose={() => setIsFreezeWordsOpen(false)}
        freezeWords={freezeWords}
        onAddFreezeWord={handleAddFreezeWord}
        onRemoveFreezeWord={handleRemoveFreezeWord}
        onClearAll={() => setFreezeWords([])}
      />

      {/* Compare Modes Modal */}
      <CompareModesModal
        isOpen={isCompareModesOpen}
        onClose={() => setIsCompareModesOpen(false)}
        originalText={originalText}
        onSelectVersion={(text, mode) => {
          setParaphrasedText(text);
          setCurrentMode(mode);
        }}
      />

      {/* Extract Content from File Modal */}
      <FileExtractorModal
        isOpen={isExtractorOpen}
        onClose={() => setIsExtractorOpen(false)}
        onInsertText={handleInsertExtractedText}
        onExtractAndParaphrase={handleExtractAndParaphrase}
      />

      {/* Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        documentTitle={documentTitle}
        sections={[]}
        paraphrasedFullText={paraphrasedText}
        pipelineReport={null}
      />

      {/* Version History Modal / Drawer */}
      {isVersionsOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <VersionHistoryDrawer
              versions={versions}
              currentText={paraphrasedText}
              onRestoreVersion={handleRestoreVersion}
              onClose={() => setIsVersionsOpen(false)}
              isModal={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}
