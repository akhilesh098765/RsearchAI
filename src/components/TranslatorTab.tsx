import React, { useState } from "react";
import {
  Languages,
  ArrowLeftRight,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Sparkles,
  Trash2,
} from "lucide-react";
import { requestTranslate } from "../services/api";

const LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Chinese (Simplified)",
  "Japanese",
  "Korean",
  "Hindi",
  "Arabic",
  "Russian",
  "Portuguese",
  "Italian",
  "Dutch",
  "Turkish",
  "Polish",
  "Swedish",
  "Indonesian",
  "Vietnamese",
  "Bengali",
  "Urdu",
];

const SAMPLE_TRANSLATION = `Machine learning models have transformed automated natural language understanding. Attention mechanisms allow dynamic weighting of context across distant tokens.`;

export const TranslatorTab: React.FC = () => {
  const [sourceLang, setSourceLang] = useState<string>("auto");
  const [targetLang, setTargetLang] = useState<string>("Spanish");
  const [inputText, setInputText] = useState<string>(SAMPLE_TRANSLATION);
  const [translatedText, setTranslatedText] = useState<string>("");
  const [detectedLang, setDetectedLang] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    setIsLoading(true);
    try {
      const res = await requestTranslate({
        text: inputText,
        sourceLang,
        targetLang,
      });
      if (res.data) {
        setTranslatedText(res.data.translatedText);
        setDetectedLang(res.data.detectedSourceLang || "English");
      }
    } catch (err) {
      console.error("Translation error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwap = () => {
    if (sourceLang !== "auto") {
      const temp = sourceLang;
      setSourceLang(targetLang);
      setTargetLang(temp);
      setInputText(translatedText);
      setTranslatedText(inputText);
    }
  };

  const handleCopy = () => {
    if (!translatedText) return;
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleAudio = () => {
    if (!translatedText) return;
    if ("speechSynthesis" in window) {
      if (isPlayingAudio) {
        window.speechSynthesis.cancel();
        setIsPlayingAudio(false);
      } else {
        const utterance = new SpeechSynthesisUtterance(translatedText);
        utterance.rate = 0.95;
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        setIsPlayingAudio(true);
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-4">
      {/* Top Header & Language Selectors */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <Languages className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-base text-slate-900 dark:text-white">
              AI Translator
            </h2>
            <p className="text-xs text-slate-500">
              Accurate translation across 30+ languages preserving nuances and tone. 100% Free.
            </p>
          </div>
        </div>

        {/* Language Selectors Bar */}
        <div className="flex items-center gap-2">
          {/* Source Lang */}
          <select
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-hidden"
          >
            <option value="auto">
              Auto Detect {detectedLang ? `(${detectedLang})` : ""}
            </option>
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>

          {/* Swap Button */}
          <button
            onClick={handleSwap}
            disabled={sourceLang === "auto"}
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 cursor-pointer"
            title="Swap Languages"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>

          {/* Target Lang */}
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-hidden"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>
                {lang}
              </option>
            ))}
          </select>

          <button
            onClick={handleTranslate}
            disabled={isLoading || !inputText.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
            <span>{isLoading ? "Translating..." : "Translate"}</span>
          </button>
        </div>
      </div>

      {/* Dual Box Translation View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
        {/* Source Text Box */}
        <div className="flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between text-xs text-slate-500">
            <span>{sourceLang === "auto" ? "Source (Auto Detect)" : sourceLang}</span>
            <div className="flex items-center gap-2">
              <span>{inputText.trim().split(/\s+/).filter(Boolean).length} words</span>
              <button
                onClick={() => {
                  setInputText("");
                  setTranslatedText("");
                }}
                className="hover:text-red-500 p-1 rounded"
                title="Clear"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex-1 p-4 min-h-[360px]">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type or paste text to translate..."
              className="w-full h-full min-h-[340px] resize-none bg-transparent outline-hidden text-slate-800 dark:text-slate-100 leading-relaxed font-normal text-sm sm:text-base selection:bg-blue-100"
            />
          </div>
        </div>

        {/* Translated Output Box */}
        <div className="flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              Translation ({targetLang})
            </span>
            {translatedText && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleAudio}
                  className="p-1 hover:text-slate-900 dark:hover:text-white"
                  title="Listen to pronunciation"
                >
                  {isPlayingAudio ? (
                    <VolumeX className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Volume2 className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  onClick={handleCopy}
                  className="p-1 hover:text-slate-900 dark:hover:text-white"
                  title="Copy translation"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 p-5 overflow-y-auto min-h-[360px]">
            {!translatedText ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 py-16">
                <Languages className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
                <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">
                  Translation will appear here
                </p>
                <p className="text-xs max-w-xs mt-1">
                  Click "Translate" above to convert text instantly with natural phrasing.
                </p>
              </div>
            ) : (
              <p className="text-sm sm:text-base text-slate-800 dark:text-slate-100 leading-relaxed font-normal">
                {translatedText}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
