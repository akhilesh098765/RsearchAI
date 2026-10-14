import * as Diff from "diff";
import { CitationItem, DocumentSection, ParaphraseMode } from "../types";

// Syllable counter approximation
export function countSyllables(word: string): number {
  const clean = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!clean) return 0;
  if (clean.length <= 3) return 1;

  const stripped = clean
    .replace(/(?:[^laeiouy]|ed|es|e)$/, "")
    .replace(/^y/, "");
  
  const matches = stripped.match(/[aeiouy]{1,2}/g);
  return matches ? Math.max(1, matches.length) : 1;
}

// Readability statistics
export function calculateReadabilityMetrics(text: string) {
  const words = text.match(/\b[a-zA-Z0-9'-]+\b/g) || [];
  const sentences = text.match(/[^.!?]+[.!?]+|\s*[^.!?]+$/g) || [];
  
  const totalWords = words.length;
  const totalSentences = Math.max(1, sentences.length);
  const totalChars = words.reduce((acc, w) => acc + w.length, 0);
  
  let totalSyllables = 0;
  let complexWordsCount = 0;
  
  words.forEach(w => {
    const syl = countSyllables(w);
    totalSyllables += syl;
    if (syl >= 3) complexWordsCount++;
  });

  const avgWordsPerSentence = totalWords / totalSentences;
  const avgSyllablesPerWord = totalWords > 0 ? totalSyllables / totalWords : 0;

  // Flesch Reading Ease: 206.835 - (1.015 * ASL) - (84.6 * ASW)
  const readingEase = Math.round(
    Math.max(0, Math.min(100, 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord)))
  );

  // Flesch-Kincaid Grade Level: (0.39 * ASL) + (11.8 * ASW) - 15.59
  const gradeLevel = Math.max(
    1,
    Math.round(((0.39 * avgWordsPerSentence) + (11.8 * avgSyllablesPerWord) - 15.59) * 10) / 10
  );

  // Gunning Fog Index: 0.4 * ((words / sentences) + 100 * (complex words / words))
  const gunningFog = totalWords > 0
    ? Math.round(0.4 * (avgWordsPerSentence + 100 * (complexWordsCount / totalWords)) * 10) / 10
    : 12.0;

  // Type-Token Ratio (Vocabulary Diversity)
  const uniqueWords = new Set(words.map(w => w.toLowerCase()));
  const typeTokenRatio = totalWords > 0 ? Math.round((uniqueWords.size / totalWords) * 100) / 100 : 1;

  // Passive voice detector heuristic
  const passiveMatches = text.match(/\b(is|are|was|were|be|been|being)\s+([a-z]+ed|[a-z]+en|shown|found|evaluated|analyzed|observed|conducted|proved)\b/gi) || [];
  const passiveRatio = totalSentences > 0 ? Math.min(100, Math.round((passiveMatches.length / totalSentences) * 100)) : 0;

  return {
    totalWords,
    totalSentences,
    totalChars,
    avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
    readingEase,
    gradeLevel,
    gunningFog,
    typeTokenRatio,
    passiveRatio,
    academicGradeDescription: getGradeDescription(gradeLevel),
  };
}

function getGradeDescription(grade: number): string {
  if (grade >= 16) return "Post-Graduate / Peer-Reviewed Manuscript (Grade 16+)";
  if (grade >= 13) return "Undergraduate / Scholarly Academic (Grade 13-15)";
  if (grade >= 10) return "High School Senior / Advanced Technical (Grade 10-12)";
  return "General Readability (Grade < 10)";
}

// -------------------------------------------------------------------
// Citation Extraction and Verification
// -------------------------------------------------------------------
export function extractCitations(text: string): CitationItem[] {
  const citations: CitationItem[] = [];
  const seen = new Set<string>();

  // Patterns for APA, IEEE, MLA, Chicago, Vancouver
  const patterns: Array<{ regex: RegExp; format: CitationItem["format"] }> = [
    {
      // APA e.g. (Smith et al., 2024), (Vaswani & Jones, 2021), (Teece, 2007, p. 45)
      regex: /\(([A-Z][a-zA-Z\s.-]+(?:et al\.|& [A-Z][a-zA-Z\s.-]+)?,\s*\d{4}[a-z]?(?:,\s*p\.\s*\d+)?)\)/g,
      format: "APA",
    },
    {
      // IEEE e.g. [1], [2], [14]-[16]
      regex: /\[(\d+(?:[–-]\d+)?(?:,\s*\d+)*)\]/g,
      format: "IEEE",
    },
    {
      // MLA e.g. (Smith 45), (Johnson and Williams 128)
      regex: /\(([A-Z][a-zA-Z]+(?:\s+and\s+[A-Z][a-zA-Z]+)?\s+\d{1,4})\)/g,
      format: "MLA",
    },
    {
      // Vancouver e.g. (1), (2-4)
      regex: /\((\d{1,3}(?:[–-]\d{1,3})?)\)/g,
      format: "Vancouver",
    }
  ];

  patterns.forEach(({ regex, format }) => {
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      const fullMatch = match[0];
      if (!seen.has(fullMatch)) {
        seen.add(fullMatch);

        // Find surrounding sentence as attached claim
        const index = match.index;
        const start = Math.max(0, text.lastIndexOf(".", index) + 1);
        const end = text.indexOf(".", index) !== -1 ? text.indexOf(".", index) + 1 : text.length;
        const claim = text.slice(start, end).trim();

        citations.push({
          id: `cit-${citations.length + 1}`,
          citation: fullMatch,
          format,
          attachedClaim: claim.length > 120 ? claim.slice(0, 120) + "..." : claim,
          preserved: true,
        });
      }
    }
  });

  return citations;
}

export function verifyCitationsPreserved(original: string, paraphrased: string): {
  originalCitations: CitationItem[];
  missingCitations: string[];
  retentionRate: number;
} {
  const originalCitations = extractCitations(original);
  if (originalCitations.length === 0) {
    return { originalCitations: [], missingCitations: [], retentionRate: 100 };
  }

  const missing: string[] = [];
  originalCitations.forEach(cit => {
    if (!paraphrased.includes(cit.citation)) {
      cit.preserved = false;
      missing.push(cit.citation);
    }
  });

  const preservedCount = originalCitations.length - missing.length;
  const retentionRate = Math.round((preservedCount / originalCitations.length) * 100);

  return {
    originalCitations,
    missingCitations: missing,
    retentionRate,
  };
}

// -------------------------------------------------------------------
// Diff & Word Changes
// -------------------------------------------------------------------
export interface DiffSegment {
  value: string;
  added?: boolean;
  removed?: boolean;
}

export function computeWordDiff(original: string, paraphrased: string): DiffSegment[] {
  return Diff.diffWordsWithSpace(original, paraphrased);
}

// -------------------------------------------------------------------
// Document Parser
// -------------------------------------------------------------------
export function parseDocumentStructure(rawText: string): DocumentSection[] {
  const sections: DocumentSection[] = [];
  const lines = rawText.split(/\r?\n/);
  
  let currentHeading = "Preamble";
  let currentParagraphs: string[] = [];
  let sectionIndex = 0;

  function flushCurrent() {
    if (currentParagraphs.length > 0) {
      const text = currentParagraphs.join("\n\n").trim();
      if (text) {
        const isRef = /references|bibliography/i.test(currentHeading);
        const isAbstract = /abstract/i.test(currentHeading);
        const isTable = text.startsWith("|") || text.toLowerCase().includes("table 1");
        
        sections.push({
          id: `sec-${sectionIndex++}`,
          heading: currentHeading,
          type: isRef ? "reference" : isAbstract ? "abstract" : isTable ? "table" : "paragraph",
          originalText: text,
          paraphrasedText: text,
          semanticScore: 1.0,
          status: "idle",
          citations: extractCitations(text),
          wordChanges: [],
        });
      }
      currentParagraphs = [];
    }
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      // Empty line indicates paragraph break
      continue;
    }

    // Check if line looks like a title or section heading:
    // e.g., "1. Introduction", "## Methodology", "Title: ...", "Abstract"
    const headingMatch = trimmed.match(/^(?:#+\s*|\d+[\.\)]\s+|Title:\s*|Abstract$|References$|Conclusion$)([A-Za-z0-9\s:,-]+)$/i);
    
    if (headingMatch && trimmed.length < 90 && !trimmed.endsWith(".")) {
      flushCurrent();
      currentHeading = trimmed.replace(/^#+\s*/, "");
    } else {
      currentParagraphs.push(trimmed);
    }
  }

  flushCurrent();

  // If no sections were identified, treat full text as a single section
  if (sections.length === 0 && rawText.trim()) {
    sections.push({
      id: "sec-0",
      heading: "Document Body",
      type: "paragraph",
      originalText: rawText.trim(),
      paraphrasedText: rawText.trim(),
      semanticScore: 1.0,
      status: "idle",
      citations: extractCitations(rawText),
      wordChanges: [],
    });
  }

  return sections;
}

export const parseDocumentSections = parseDocumentStructure;

// -------------------------------------------------------------------
// Export Generators
// -------------------------------------------------------------------
export function generateMarkdownExport(sections: DocumentSection[]): string {
  return sections
    .map(sec => {
      const headingPrefix = sec.heading ? `## ${sec.heading}\n\n` : "";
      return `${headingPrefix}${sec.paraphrasedText}`;
    })
    .join("\n\n---\n\n");
}

export function generatePlainTextExport(sections: DocumentSection[]): string {
  return sections
    .map(sec => {
      const headingPrefix = sec.heading ? `${sec.heading.toUpperCase()}\n${"=".repeat(sec.heading.length)}\n\n` : "";
      return `${headingPrefix}${sec.paraphrasedText}`;
    })
    .join("\n\n\n");
}

export function downloadFile(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function printDocumentAsPdf(title: string, sections: DocumentSection[]) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <title>${title} - Paraphrased Academic Document</title>
  <style>
    body {
      font-family: "Times New Roman", Times, serif;
      line-height: 1.75;
      font-size: 12pt;
      color: #111;
      max-width: 8.5in;
      margin: 1in auto;
      padding: 0 0.5in;
    }
    h1 {
      font-size: 18pt;
      text-align: center;
      margin-bottom: 24pt;
      font-weight: bold;
    }
    h2 {
      font-size: 14pt;
      margin-top: 20pt;
      margin-bottom: 8pt;
      border-bottom: 1px solid #ccc;
      padding-bottom: 4pt;
    }
    p {
      text-indent: 0.5in;
      margin-bottom: 12pt;
      text-align: justify;
    }
    .abstract {
      font-style: italic;
      padding: 0 0.5in;
      margin-bottom: 20pt;
    }
    .reference {
      text-indent: -0.5in;
      padding-left: 0.5in;
      font-size: 10pt;
      margin-bottom: 6pt;
    }
    .footer-note {
      margin-top: 40pt;
      font-size: 9pt;
      color: #666;
      border-top: 1px solid #ddd;
      padding-top: 8pt;
      text-align: center;
    }
    @media print {
      body { margin: 0.75in; }
    }
  </style>
</head>
<body>
  <h1>${title}</h1>
  ${sections
    .map(sec => {
      const heading = sec.heading ? `<h2>${sec.heading}</h2>` : "";
      const isAbstract = sec.type === "abstract";
      const isRef = sec.type === "reference";
      const className = isAbstract ? "abstract" : isRef ? "reference" : "";
      
      const paragraphs = sec.paraphrasedText
        .split("\n\n")
        .map(p => `<p class="${className}">${p.replace(/\n/g, "<br>")}</p>`)
        .join("");

      return `<section>${heading}${paragraphs}</section>`;
    })
    .join("")}
  <div class="footer-note">
    Document produced with Academic Paraphrasing and Writing Assistant. Citations and academic attribution preserved.
  </div>
  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>`;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
