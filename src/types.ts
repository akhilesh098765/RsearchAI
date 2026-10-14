export type ParaphraseMode =
  | "standard"
  | "fluency"
  | "formal"
  | "academic"
  | "simple"
  | "creative"
  | "expand"
  | "shorten"
  | "custom"
  | "research"
  | "technical"
  | "concise";

export type QuillBotTab =
  | "paraphraser"
  | "grammar-checker"
  | "plagiarism-checker"
  | "ai-detector"
  | "summarizer"
  | "cowriter"
  | "translator"
  | "citation-generator";

export type AcademicDomain =
  | "Computer Science"
  | "Artificial Intelligence"
  | "Machine Learning"
  | "Cybersecurity"
  | "Information Technology"
  | "Engineering"
  | "Management"
  | "Business"
  | "Medical Research"
  | "Biotechnology"
  | "Physics"
  | "Chemistry"
  | "Mathematics"
  | "Social Sciences"
  | "Education"
  | "Law"
  | "Humanities"
  | "General Academic";

export type SupportedLanguage =
  | "English"
  | "Hindi"
  | "Urdu"
  | "Spanish"
  | "French"
  | "German"
  | "Arabic";

export interface QualityControls {
  creativity: number; // 0 to 100
  vocabulary: number; // 0 to 100 (Simple -> Advanced)
  restructuring: number; // 0 to 100 (Low -> High)
  formality: number; // 0 to 100 (Casual -> Academic)
  conciseness: number; // 0 to 100 (Detailed -> Concise)
  meaningPreservation: number; // 0 to 100 (Strict -> Flexible, default 95)
}

export interface WordSuggestion {
  id?: string;
  originalWord: string;
  replacement: string;
  suggestedReplacement?: string;
  partOfSpeech: string;
  meaningCompatibility: number; // 0.0 - 1.0
  formalityLevel: "Casual" | "Standard" | "Formal" | "Scholarly" | string;
  academicSuitability: "High" | "Medium" | "Low" | string;
  exampleSentence: string;
  reason: string;
  isTechnicalTerm?: boolean;
  status?: "pending" | "accepted" | "rejected";
}

export interface CitationItem {
  id: string;
  citation: string;
  format: "APA" | "IEEE" | "MLA" | "Chicago" | "Harvard" | "Vancouver" | "Other";
  attachedClaim: string;
  preserved: boolean;
  notes?: string;
}

export interface QualityAuditReport {
  grammarIssues: string[];
  spellingIssues: string[];
  readabilityGrade: string;
  vocabularyDiversityScore: number;
  sentenceComplexity: string;
  repeatedTerms: string[];
  verificationRequired: string[];
  originalityAdvice: string[];
}

export interface SemanticEvaluation {
  meaningPreserved: boolean;
  possibleMeaningChange: boolean;
  missingInfo: string[];
  addedInfo: string[];
  contradictionWarning: string | null;
}

export interface StepCheckResult {
  status: string;
  score?: number;
  [key: string]: any;
}

export interface TenStepPipelineReport {
  overallScore: number;
  pipelinePassed: boolean;
  checks: {
    grammar: { status: string; issues: string[]; score: number };
    spelling: { status: string; errors: string[]; score: number };
    semanticSimilarity: { status: string; score: number; explanation: string; meaningPreserved: boolean };
    citationPreservation: { status: string; citationsFound: number; preservedCount: number; notes: string };
    terminologyConsistency: { status: string; preservedTerms: string[]; flaggedAlterations?: string[] };
    repetitionAnalysis: { status: string; overusedPhrases: string[]; diversityIndex: number };
    readability: { fleschKincaidGrade: string; gunningFogIndex?: string; readingEase: number; targetAudience?: string };
    sentenceQuality: { passiveVoicePercentage: number; avgSentenceLength: number; cadenceVariance?: string };
    factualConsistency: { status: string; unsupportedInventionsFound: boolean; verificationRequiredList: string[] };
    originalityAttribution: { status: string; advice: string[]; sectionsNeedingOwnSynthesis?: string[] };
  };
  executiveSummary: string;
}

export interface DocumentSection {
  id: string;
  heading?: string;
  type: "title" | "abstract" | "heading" | "paragraph" | "table" | "reference" | "equation";
  originalText: string;
  paraphrasedText: string;
  semanticScore: number;
  status: "idle" | "paraphrasing" | "completed" | "error";
  citations: CitationItem[];
  wordChanges: WordSuggestion[];
}

export interface VersionRecord {
  id: string;
  versionNumber?: number;
  label: string;
  timestamp: string;
  text: string;
  mode: ParaphraseMode | "original";
  domain: AcademicDomain;
  semanticScore?: number;
  wordCount: number;
  changesCount: number;
}

export type ViewTab =
  | "paraphraser"
  | "word-suggestions"
  | "sentence-rewriter"
  | "document-analyzer"
  | "citation-assistant"
  | "quality-pipeline"
  | "readability"
  | "versions";

// Grammar Checker Interfaces
export interface GrammarIssue {
  id: string;
  originalText: string;
  suggestedText: string;
  ruleCategory: "spelling" | "grammar" | "punctuation" | "clarity" | "style" | string;
  explanation: string;
  offsetStart?: number;
  offsetEnd?: number;
}

export interface GrammarStats {
  spellingCount: number;
  grammarCount: number;
  punctuationCount: number;
  styleCount: number;
  overallAccuracy: number;
}

// Summarizer Interfaces
export type SummarizeMode = "paragraph" | "key_sentences";
export type SummarizeLength = "short" | "medium" | "long";

export interface SummarizeResult {
  summary: string;
  keyPoints: string[];
  keyTopics: string[];
  originalWordCount: number;
  summaryWordCount: number;
  reductionPercentage: number;
}

// AI Detector Interfaces
export interface AiDetectorSentence {
  text: string;
  aiScore: number;
  classification: "ai" | "human" | "mixed";
  reason?: string;
}

export interface AiDetectorResult {
  aiProbability: number;
  humanProbability: number;
  assessment: string;
  sentences: AiDetectorSentence[];
  metrics: {
    perplexity: string;
    burstiness: string;
    cadenceVariance?: string;
  };
}

// Plagiarism Scanner Interfaces
export interface PlagiarismMatch {
  matchedText: string;
  sourceTitle: string;
  sourceUrl?: string;
  similarityPercent: number;
  citationRecommendation?: string;
}

export interface PlagiarismResult {
  similarityScore: number;
  uniquenessScore: number;
  matches: PlagiarismMatch[];
  summary: string;
}

// Citation Generator Interfaces
export type CitationStyle = "APA" | "MLA" | "Chicago" | "Harvard";
export type CitationSourceType = "website" | "journal" | "book" | "video" | "report";

export interface CitationResult {
  inTextCitation: string;
  fullCitation: string;
  bibtex?: string;
}

// Co-Writer Interfaces
export interface CowriterResult {
  generatedText: string;
  suggestedHeadings?: string[];
  researchPoints?: string[];
}

