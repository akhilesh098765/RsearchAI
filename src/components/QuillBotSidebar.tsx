import React from "react";
import {
  RefreshCw,
  SpellCheck,
  ShieldAlert,
  Cpu,
  AlignLeft,
  PenTool,
  Languages,
  Quote,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Keyboard,
  CheckCircle2,
} from "lucide-react";
import { QuillBotTab } from "../types";

interface QuillBotSidebarProps {
  activeTab: QuillBotTab;
  onTabChange: (tab: QuillBotTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

interface NavItem {
  id: QuillBotTab;
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: "paraphraser",
    label: "Paraphraser",
    icon: RefreshCw,
  },
  {
    id: "grammar-checker",
    label: "Grammar Checker",
    icon: SpellCheck,
  },
  {
    id: "plagiarism-checker",
    label: "Plagiarism Checker",
    icon: ShieldAlert,
  },
  {
    id: "ai-detector",
    label: "AI Detector",
    icon: Cpu,
  },
  {
    id: "summarizer",
    label: "Summarizer",
    icon: AlignLeft,
  },
  {
    id: "cowriter",
    label: "Co-Writer",
    icon: PenTool,
  },
  {
    id: "translator",
    label: "Translator",
    icon: Languages,
  },
  {
    id: "citation-generator",
    label: "Citation Generator",
    icon: Quote,
  },
];

export const QuillBotSidebar: React.FC<QuillBotSidebarProps> = ({
  activeTab,
  onTabChange,
  isCollapsed,
  onToggleCollapse,
  isDarkMode,
  onToggleDarkMode,
}) => {
  return (
    <aside
      className={`relative flex flex-col border-r transition-all duration-300 z-30 shrink-0 ${
        isDarkMode
          ? "bg-slate-900 border-slate-800 text-slate-200"
          : "bg-white border-slate-200 text-slate-700"
      } ${isCollapsed ? "w-18" : "w-64"}`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-4 border-b border-inherit justify-between">
        <div
          className="flex items-center gap-3 overflow-hidden cursor-pointer"
          onClick={() => onTabChange("paraphraser")}
        >
          {/* Logo Badge */}
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs shrink-0">
            <svg
              className="w-5 h-5 text-white fill-current"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M21.71 2.29a1 1 0 0 0-1.09-.21L2.62 9.08a1 1 0 0 0-.12 1.83l6.5 3.25 3.25 6.5a1 1 0 0 0 1.83-.12l7-18a1 1 0 0 0-.37-1.25zM13.5 17.5l-2.07-4.14 5.21-5.21a.75.75 0 0 0-1.06-1.06l-5.21 5.21L6.23 10.15l13.62-5.3-6.35 12.65z" />
            </svg>
          </div>
          {!isCollapsed && (
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-lg tracking-tight text-emerald-600">
                AI <span className={isDarkMode ? "text-white" : "text-slate-900"}>Paraphraser</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
                FREE
              </span>
            </div>
          )}
        </div>

        <button
          onClick={onToggleCollapse}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-600 transition-colors ${
            isDarkMode ? "hover:bg-slate-800" : "hover:bg-slate-100"
          }`}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Feature Links - Completely Free & Clean */}
      <div className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 cursor-pointer ${
                isActive
                  ? isDarkMode
                    ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 font-semibold shadow-xs"
                    : "bg-emerald-50 text-emerald-700 font-semibold shadow-2xs border border-emerald-200/60"
                  : isDarkMode
                  ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800/70"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
              } ${isCollapsed ? "justify-center px-0" : ""}`}
            >
              <Icon
                className={`w-4.5 h-4.5 shrink-0 transition-transform ${
                  isActive ? "text-emerald-600 scale-105" : "text-slate-400"
                }`}
              />
              {!isCollapsed && (
                <span className="flex-1 text-left truncate">{item.label}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Free Plan Status & Theme Controls */}
      <div className="p-3 border-t border-inherit space-y-2">
        {/* 100% Free Info Box */}
        {!isCollapsed && (
          <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/60">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-xs text-emerald-900 dark:text-emerald-300">
                100% Free & Unlimited
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
              All 9 writing modes, unlimited words, and all tools completely unlocked.
            </p>
          </div>
        )}

        {/* Theme & Shortcuts Toggles */}
        <div className={`flex items-center gap-2 ${isCollapsed ? "flex-col" : "justify-between"}`}>
          <button
            onClick={onToggleDarkMode}
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              isDarkMode
                ? "bg-slate-800 text-amber-300 hover:bg-slate-700"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {!isCollapsed && (
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <Keyboard className="w-3.5 h-3.5" />
              <span>Ctrl+Enter to Run</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
