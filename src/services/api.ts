import {
  AcademicDomain,
  ParaphraseMode,
  QualityControls,
  TenStepPipelineReport,
  WordSuggestion,
  GrammarIssue,
  GrammarStats,
  SummarizeResult,
  AiDetectorResult,
  PlagiarismResult,
  CitationResult,
  CowriterResult,
} from "../types";

export interface ParaphraseResponse {
  success: boolean;
  mode: ParaphraseMode;
  domain: AcademicDomain;
  fallbackUsed?: boolean;
  data: {
    paraphrasedText: string;
    semanticSimilarityScore: number;
    semanticEvaluation: {
      meaningPreserved: boolean;
      possibleMeaningChange: boolean;
      missingInfo: string[];
      addedInfo: string[];
      contradictionWarning: string | null;
    };
    citationsPreserved: Array<{
      citation: string;
      format: string;
      preserved: boolean;
      attachedClaim?: string;
    }>;
    wordChanges: WordSuggestion[];
    qualityAudit: {
      grammarIssues: string[];
      spellingIssues: string[];
      readabilityGrade: string;
      vocabularyDiversityScore: number;
      sentenceComplexity: string;
      repeatedTerms: string[];
      verificationRequired: string[];
      originalityAdvice: string[];
    };
  };
}

export interface SuggestionResponse {
  success: boolean;
  fallbackUsed?: boolean;
  data: {
    isTechnicalTerm: boolean;
    technicalTermWarning?: string | null;
    suggestions: WordSuggestion[];
  };
}

export interface RestructureResponse {
  success: boolean;
  fallbackUsed?: boolean;
  data: {
    rewrittenSentence: string;
    factualPreserved: boolean;
    explanation: string;
    alternatives: string[];
    syntacticNotes?: string;
  };
}

export async function requestParaphrase(params: {
  text: string;
  mode: ParaphraseMode;
  domain: AcademicDomain;
  controls: QualityControls;
  sourceLanguage?: string;
  targetLanguage?: string;
  preserveCitations?: boolean;
  freezeWords?: string[];
  synonymLevel?: number;
}): Promise<ParaphraseResponse> {
  const res = await fetch("/api/paraphrase", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${res.status}: Failed to paraphrase`);
  }

  return res.json();
}

export async function requestSuggestions(params: {
  selectedText: string;
  sentenceContext?: string;
  domain: AcademicDomain;
  mode: ParaphraseMode;
}): Promise<SuggestionResponse> {
  const res = await fetch("/api/suggestions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: Failed to load word suggestions`);
  }

  return res.json();
}

export async function requestRestructure(params: {
  sentence: string;
  transformation: string;
  domain: AcademicDomain;
}): Promise<RestructureResponse> {
  const res = await fetch("/api/restructure", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: Failed to restructure sentence`);
  }

  return res.json();
}

export async function requestQualityPipeline(params: {
  originalText: string;
  paraphrasedText: string;
  domain: AcademicDomain;
}): Promise<{ success: boolean; data: TenStepPipelineReport }> {
  const res = await fetch("/api/quality-pipeline", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: Failed to run 10-step quality pipeline`);
  }

  return res.json();
}

export interface ExtractFileResponse {
  success: boolean;
  fileName: string;
  text: string;
  wordCount: number;
}

export async function requestExtractFile(params: {
  fileName: string;
  fileType?: string;
  base64Data?: string;
  textContent?: string;
}): Promise<ExtractFileResponse> {
  const res = await fetch("/api/extract-file", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  return res.json();
}

// ----------------------------------------------------
// QuillBot Feature Suite Client Handlers
// ----------------------------------------------------

export interface GrammarCheckResponse {
  success: boolean;
  fallbackUsed?: boolean;
  data: {
    correctedText: string;
    issues: GrammarIssue[];
    stats: GrammarStats;
  };
}

export async function requestGrammarCheck(text: string): Promise<GrammarCheckResponse> {
  const res = await fetch("/api/grammar-check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Grammar check request failed");
  }
  return res.json();
}

export async function requestSummarize(params: {
  text: string;
  mode: "paragraph" | "key_sentences";
  length: "short" | "medium" | "long";
}): Promise<{ success: boolean; data: SummarizeResult }> {
  const res = await fetch("/api/summarize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Summarize request failed");
  }
  return res.json();
}

export async function requestAiDetector(text: string): Promise<{ success: boolean; data: AiDetectorResult }> {
  const res = await fetch("/api/ai-detector", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "AI Detector request failed");
  }
  return res.json();
}

export async function requestPlagiarismCheck(text: string): Promise<{ success: boolean; data: PlagiarismResult }> {
  const res = await fetch("/api/plagiarism-check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Plagiarism scanner request failed");
  }
  return res.json();
}

export async function requestTranslate(params: {
  text: string;
  sourceLang: string;
  targetLang: string;
}): Promise<{ success: boolean; data: { translatedText: string; detectedSourceLang: string } }> {
  const res = await fetch("/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Translation request failed");
  }
  return res.json();
}

export async function requestCitation(params: {
  style: string;
  sourceType: string;
  details: Record<string, any>;
}): Promise<{ success: boolean; data: CitationResult }> {
  const res = await fetch("/api/citation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Citation generation failed");
  }
  return res.json();
}

export async function requestCowriter(params: {
  prompt: string;
  currentDocument: string;
  action: "continue" | "expand" | "counterargument" | "outline";
}): Promise<{ success: boolean; data: CowriterResult }> {
  const res = await fetch("/api/cowriter/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Co-writer request failed");
  }
  return res.json();
}


