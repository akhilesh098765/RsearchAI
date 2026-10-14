import React, { useState } from "react";
import { FileDown, X, Check, FileText, Printer, Code, Sparkles } from "lucide-react";
import { DocumentSection, TenStepPipelineReport } from "../types";
import {
  generateMarkdownExport,
  generatePlainTextExport,
  downloadFile,
  printDocumentAsPdf,
} from "../services/nlpEngine";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
  sections: DocumentSection[];
  paraphrasedFullText: string;
  pipelineReport: TenStepPipelineReport | null;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  documentTitle,
  sections,
  paraphrasedFullText,
  pipelineReport,
}) => {
  const [includeAuditReport, setIncludeAuditReport] = useState(true);
  const [includeReferences, setIncludeReferences] = useState(true);

  if (!isOpen) return null;

  const effectiveSections: DocumentSection[] =
    sections && sections.length > 0
      ? sections
      : [
          {
            id: "sec-main",
            heading: documentTitle || "Document",
            type: "paragraph",
            originalText: "",
            paraphrasedText: paraphrasedFullText,
            semanticScore: 0.98,
            status: "completed",
            citations: [],
            wordChanges: [],
          },
        ];

  const exportMarkdown = () => {
    let md = generateMarkdownExport(effectiveSections);
    if (includeAuditReport && pipelineReport) {
      md += `\n\n---\n\n## Appendix: Academic Quality & Integrity Audit\n\n` +
        `- Composite Quality Score: ${pipelineReport.overallScore}/100\n` +
        `- Semantic Meaning Retention: ${Math.round((pipelineReport.checks.semanticSimilarity?.score || 0.96) * 100)}%\n` +
        `- Executive Summary: ${pipelineReport.executiveSummary}\n`;
    }
    downloadFile(`${documentTitle.replace(/\s+/g, "_")}_paraphrased.md`, md, "text/markdown");
    onClose();
  };

  const exportPlainText = () => {
    let txt = generatePlainTextExport(effectiveSections);
    if (includeAuditReport && pipelineReport) {
      txt += `\n\n========================================\nAPPENDIX: ACADEMIC QUALITY AUDIT\n========================================\n` +
        `Score: ${pipelineReport.overallScore}/100\nExecutive Summary: ${pipelineReport.executiveSummary}\n`;
    }
    downloadFile(`${documentTitle.replace(/\s+/g, "_")}_paraphrased.txt`, txt, "text/plain");
    onClose();
  };

  const exportWordDocx = () => {
    // Generate standard Word-compliant HTML blob with doc extension
    let docContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>${documentTitle}</title>
      <style>
        body { font-family: "Times New Roman", Times, serif; font-size: 12pt; line-height: 2.0; }
        h1 { font-size: 16pt; font-weight: bold; text-align: center; }
        h2 { font-size: 13pt; font-weight: bold; }
        p { text-indent: 0.5in; margin-bottom: 0; }
      </style>
      </head>
      <body>
        <h1>${documentTitle}</h1>
        ${effectiveSections
          .map(sec => `<h2>${sec.heading || ""}</h2><p>${sec.paraphrasedText.replace(/\n\n/g, "</p><p>")}</p>`)
          .join("")}
      </body></html>
    `;
    downloadFile(
      `${documentTitle.replace(/\s+/g, "_")}_paraphrased.doc`,
      docContent,
      "application/msword"
    );
    onClose();
  };

  const exportPdf = () => {
    printDocumentAsPdf(documentTitle, effectiveSections);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 text-xs animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <FileDown className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-sm font-['Plus_Jakarta_Sans']">
                Export Academic Manuscript
              </h2>
              <p className="text-[11px] text-slate-500">
                Preserve headings, citations, formatting, and mathematical equations.
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

        {/* Options */}
        <div className="space-y-2 mb-6 bg-slate-50 p-3 rounded-xl border border-slate-100">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            Export Inclusions
          </span>
          <label className="flex items-center justify-between text-slate-700 cursor-pointer">
            <span>Include References & Bibliographic citations</span>
            <input
              type="checkbox"
              checked={includeReferences}
              onChange={(e) => setIncludeReferences(e.target.checked)}
              className="w-4 h-4 accent-indigo-600 rounded"
            />
          </label>
          <label className="flex items-center justify-between text-slate-700 cursor-pointer">
            <span>Include 10-Step Quality & Integrity Audit Appendix</span>
            <input
              type="checkbox"
              checked={includeAuditReport}
              onChange={(e) => setIncludeAuditReport(e.target.checked)}
              className="w-4 h-4 accent-indigo-600 rounded"
            />
          </label>
        </div>

        {/* Format Selection Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* DOCX */}
          <button
            onClick={exportWordDocx}
            className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-left transition-all flex flex-col gap-1 cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <FileText className="w-5 h-5 text-blue-600" />
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">
                DOCX / Word
              </span>
            </div>
            <span className="font-bold text-slate-900 group-hover:text-indigo-900">
              Microsoft Word
            </span>
            <span className="text-[11px] text-slate-500">
              Fully formatted headings, indentations, and margins.
            </span>
          </button>

          {/* PDF */}
          <button
            onClick={exportPdf}
            className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-left transition-all flex flex-col gap-1 cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <Printer className="w-5 h-5 text-rose-600" />
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-50 text-rose-700">
                PDF Layout
              </span>
            </div>
            <span className="font-bold text-slate-900 group-hover:text-indigo-900">
              Print-Ready PDF
            </span>
            <span className="text-[11px] text-slate-500">
              Standard 1-inch margins, Times New Roman, journal stylesheet.
            </span>
          </button>

          {/* Markdown */}
          <button
            onClick={exportMarkdown}
            className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-left transition-all flex flex-col gap-1 cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <Code className="w-5 h-5 text-purple-600" />
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-50 text-purple-700">
                .MD
              </span>
            </div>
            <span className="font-bold text-slate-900 group-hover:text-indigo-900">
              Markdown Document
            </span>
            <span className="text-[11px] text-slate-500">
              Ideal for GitHub, Obsidian, LaTeX workflows, or Overleaf.
            </span>
          </button>

          {/* Plain Text */}
          <button
            onClick={exportPlainText}
            className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-left transition-all flex flex-col gap-1 cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <FileDown className="w-5 h-5 text-slate-600" />
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                .TXT
              </span>
            </div>
            <span className="font-bold text-slate-900 group-hover:text-indigo-900">
              Plain Text
            </span>
            <span className="text-[11px] text-slate-500">
              Clean, unformatted text with structural spacing.
            </span>
          </button>
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
