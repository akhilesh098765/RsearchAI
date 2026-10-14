import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileText,
  FileCode,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Copy,
  Check,
  FileType,
} from "lucide-react";
import { requestExtractFile } from "../services/api";

interface FileExtractorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertText: (text: string, append?: boolean) => void;
  onExtractAndParaphrase: (text: string) => void;
}

const SAMPLE_STARTERS = [
  {
    title: "Academic Abstract",
    desc: "Transformer attention bottlenecks",
    text: "Modern Transformer architectures exhibit quadratic computational complexity relative to sequence length O(N²), which significantly impedes real-time inference in resource-constrained environments (Vaswani et al., 2017). This paper investigates sparse attention mechanisms and parameter quantization to alleviate computational bottlenecks without sacrificing validation perplexity.",
  },
  {
    title: "Executive Email",
    desc: "Project milestone update",
    text: "I am writing to provide a formal update regarding the Q3 infrastructure migration. Despite minor delays caused by third-party API rate limits, our engineering team has successfully deployed the primary database clusters and finalized the automated integration test suite.",
  },
  {
    title: "Essay Introduction",
    desc: "Renewable energy economics",
    text: "The transition toward renewable energy infrastructures represents one of the most critical socio-economic imperatives of the twenty-first century. While capital expenditures for solar photovoltaic and wind turbine installations have declined precipitously over the past decade, grid stabilization and energy storage technologies still pose considerable logistical hurdles.",
  },
];

export const FileExtractorModal: React.FC<FileExtractorModalProps> = ({
  isOpen,
  onClose,
  onInsertText,
  onExtractAndParaphrase,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedFile, setExtractedFile] = useState<{
    name: string;
    size: number;
    text: string;
    wordCount: number;
    type: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [appendMode, setAppendMode] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFile = async (file: File) => {
    setErrorMessage(null);
    setIsExtracting(true);

    try {
      const fileName = file.name;
      const fileType = file.type;
      const fileSize = file.size;

      // Handle simple plain-text formats directly on client
      const isPlainText =
        fileType.includes("text") ||
        fileName.endsWith(".txt") ||
        fileName.endsWith(".md") ||
        fileName.endsWith(".json") ||
        fileName.endsWith(".csv") ||
        fileName.endsWith(".rtf") ||
        fileName.endsWith(".html");

      if (isPlainText) {
        const text = await file.text();
        const clean = text.trim();
        if (!clean) {
          throw new Error("The selected text file is empty.");
        }
        setExtractedFile({
          name: fileName,
          size: fileSize,
          text: clean,
          wordCount: clean.split(/\s+/).filter(Boolean).length,
          type: "Plain Text / Markdown",
        });
        setIsExtracting(false);
        return;
      }

      // For PDF, DOCX, and other documents, convert to base64 and call the server extraction endpoint
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result as string;
          const res = await requestExtractFile({
            fileName,
            fileType,
            base64Data,
          });

          if (!res.text) {
            throw new Error("No readable text could be found in this document.");
          }

          setExtractedFile({
            name: fileName,
            size: fileSize,
            text: res.text,
            wordCount: res.wordCount || res.text.split(/\s+/).filter(Boolean).length,
            type: fileName.endsWith(".pdf") ? "PDF Document" : "Word / Rich Document",
          });
        } catch (err: any) {
          setErrorMessage(err.message || "Failed to extract content from file.");
        } finally {
          setIsExtracting(false);
        }
      };

      reader.onerror = () => {
        setErrorMessage("Failed to read the local file.");
        setIsExtracting(false);
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      setErrorMessage(err.message || "Could not read file.");
      setIsExtracting(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleCopyExtracted = () => {
    if (!extractedFile?.text) return;
    navigator.clipboard.writeText(extractedFile.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleInsert = (andParaphrase = false) => {
    if (!extractedFile?.text) return;
    if (andParaphrase) {
      onExtractAndParaphrase(extractedFile.text);
    } else {
      onInsertText(extractedFile.text, appendMode);
    }
    onClose();
  };

  const handleUseSample = (sample: typeof SAMPLE_STARTERS[0]) => {
    setExtractedFile({
      name: `${sample.title}.txt`,
      size: sample.text.length,
      text: sample.text,
      wordCount: sample.text.split(/\s+/).filter(Boolean).length,
      type: "Sample Template",
    });
  };

  return (
    <div
      id="file-extractor-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="file-extractor-dialog"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Extract Content from File
              </h2>
              <p className="text-xs text-slate-500">
                Upload any PDF, Word document, or text file to extract readable text
              </p>
            </div>
          </div>
          <button
            id="close-extractor-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.doc,.txt,.md,.rtf,.csv,.json,.html"
            className="hidden"
            onChange={handleInputChange}
          />

          {/* Drag & Drop Zone */}
          {!extractedFile && (
            <div
              id="file-dropzone"
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                isDragging
                  ? "border-indigo-600 bg-indigo-50/70 scale-[1.01]"
                  : "border-slate-300 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50"
              }`}
            >
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-indigo-100/80 text-indigo-700 flex items-center justify-center">
                {isExtracting ? (
                  <RefreshCw className="w-6 h-6 animate-spin" />
                ) : (
                  <UploadCloud className="w-6 h-6" />
                )}
              </div>
              <p className="text-sm font-semibold text-slate-800">
                {isExtracting
                  ? "Extracting document content..."
                  : "Click to browse or drop your document here"}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Supports PDF (.pdf), Microsoft Word (.docx, .doc), Plain Text (.txt, .md, .rtf)
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 shadow-2xs">
                  <FileText className="w-3 h-3 text-red-500" /> PDF Document
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 shadow-2xs">
                  <FileType className="w-3 h-3 text-blue-500" /> Word DOCX
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 shadow-2xs">
                  <FileCode className="w-3 h-3 text-emerald-500" /> Plain Text / Markdown
                </span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Extraction notice</p>
                <p>{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Extracted Preview */}
          {extractedFile && (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/70 border border-indigo-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 truncate max-w-xs sm:max-w-sm">
                      {extractedFile.name}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {extractedFile.wordCount} words • {extractedFile.type} •{" "}
                      {Math.round(extractedFile.size / 1024)} KB
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleCopyExtracted}
                    className="p-1.5 rounded-lg text-slate-600 hover:bg-white hover:text-indigo-600 border border-transparent hover:border-slate-200 text-xs font-medium flex items-center gap-1 transition-colors"
                    title="Copy extracted text"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span className="hidden sm:inline">{copied ? "Copied" : "Copy"}</span>
                  </button>
                  <button
                    onClick={() => setExtractedFile(null)}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-white hover:text-red-600 border border-transparent hover:border-slate-200 text-xs font-medium transition-colors"
                    title="Upload another file"
                  >
                    Change File
                  </button>
                </div>
              </div>

              {/* Extracted Text Box */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Extracted Text Preview
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Ready to insert into your writing box
                  </span>
                </div>
                <textarea
                  value={extractedFile.text}
                  onChange={(e) =>
                    setExtractedFile({
                      ...extractedFile,
                      text: e.target.value,
                      wordCount: e.target.value.split(/\s+/).filter(Boolean).length,
                    })
                  }
                  rows={8}
                  className="w-full text-xs font-sans text-slate-800 bg-slate-50/70 border border-slate-200 rounded-xl p-3 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-y leading-relaxed"
                />
              </div>

              {/* Insertion Mode */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="append-checkbox"
                  checked={appendMode}
                  onChange={(e) => setAppendMode(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                <label htmlFor="append-checkbox" className="text-xs text-slate-600 cursor-pointer">
                  Append to existing text in box (instead of replacing)
                </label>
              </div>
            </div>
          )}

          {/* Quick Starter Templates */}
          {!extractedFile && (
            <div>
              <p className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Or try a quick sample snippet:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {SAMPLE_STARTERS.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleUseSample(s)}
                    className="text-left p-2.5 rounded-xl border border-slate-200 hover:border-indigo-400 bg-white hover:bg-indigo-50/40 transition-all group"
                  >
                    <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-700">
                      {s.title}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">{s.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/70 transition-colors"
          >
            Cancel
          </button>

          {extractedFile ? (
            <div className="flex items-center gap-2">
              <button
                id="insert-to-box-btn"
                onClick={() => handleInsert(false)}
                className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:border-slate-400 text-xs font-semibold text-slate-800 shadow-2xs hover:bg-slate-50 transition-colors"
              >
                Write in Box
              </button>
              <button
                id="extract-and-paraphrase-btn"
                onClick={() => handleInsert(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Insert & Paraphrase
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <UploadCloud className="w-4 h-4" />
              Browse File
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
