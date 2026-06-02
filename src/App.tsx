/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { UserProgress } from "./types";
import Dashboard from "./components/Dashboard";
import LectureViewer from "./components/LectureViewer";
import { LECTURES } from "./data/lectures";
import { 
  BookOpen, 
  Compass,
  CheckCircle2
} from "lucide-react";

const LOCAL_STORAGE_KEY = "csharp_handbook_progress_v3";

const initialProgress: UserProgress = {
  completedLectures: {
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: []
  },
  quizHighScores: {}
};

export default function App() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "lectures">("dashboard");
  const [progress, setProgress] = useState<UserProgress>(initialProgress);
  const [activeLectureId, setActiveLectureId] = useState<number>(1);

  // Load progress on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        
        // Ensure all 6 lectures are safely initialized in progress
        const completed: Record<number, number[]> = {};
        for (let i = 1; i <= 6; i++) {
          completed[i] = parsed.completedLectures?.[i] || [];
        }

        const cleaned: UserProgress = {
          completedLectures: completed,
          quizHighScores: parsed.quizHighScores || initialProgress.quizHighScores
        };
        setProgress(cleaned);
      }
    } catch (e) {
      console.error("Ошибка чтения прогресса из localStorage", e);
    }
  }, []);

  // Save progress helper
  const saveProgress = (updated: UserProgress) => {
    setProgress(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Ошибка записи прогресса в localStorage", e);
    }
  };

  const handleMarkPageCompleted = (lectureId: number, pageIndex: number) => {
    const lectureCompletedList = progress.completedLectures[lectureId] || [];
    if (lectureCompletedList.includes(pageIndex)) {
      return; // Already completed
    }
    const updatedList = [...lectureCompletedList, pageIndex];

    const updated = {
      ...progress,
      completedLectures: {
        ...progress.completedLectures,
        [lectureId]: updatedList
      }
    };
    saveProgress(updated);
  };

  const handleSaveQuizScore = (lectureId: number, score: number) => {
    const currentHighScore = progress.quizHighScores[lectureId] || 0;
    const newHighScore = Math.max(currentHighScore, score);

    const updated = {
      ...progress,
      quizHighScores: {
        ...progress.quizHighScores,
        [lectureId]: newHighScore
      }
    };
    saveProgress(updated);
  };

  const handleResetProgress = () => {
    if (window.confirm("Вы действительно хотите сбросить весь прогресс чтения и результаты тестирования?")) {
      saveProgress(initialProgress);
      setActiveTab("dashboard");
      setActiveLectureId(1);
    }
  };

  // Progress metrics
  const totalLecturesCount = LECTURES.length;
  const totalPagesCount = totalLecturesCount * 10;
  
  let completedPagesCount = 0;
  (Object.values(progress.completedLectures) as number[][]).forEach(pages => {
    completedPagesCount += pages.length;
  });

  let passedTestsCount = 0;
  LECTURES.forEach(lec => {
    const score = progress.quizHighScores[lec.id];
    if (score !== undefined && score >= 15) {
      passedTestsCount++;
    }
  });

  const readingRatio = completedPagesCount / totalPagesCount;
  const testRatio = passedTestsCount / totalLecturesCount;
  const courseCompletionPercent = Math.round((readingRatio * 50) + (testRatio * 50));

  return (
    <div className="min-h-screen bg-[#FAF9F5] flex flex-col font-sans select-none antialiased text-[#1C1B18]" id="main-application-view">
      
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-[#FAF9F5]/90 backdrop-blur-md border-b border-[#E4E1D8] px-4 md:px-8 py-3.5 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Current Completion Progress Badge on the LEFT (Surgical Swap) */}
          <div className="flex items-center gap-3">
            {/* Visual Circular gauge */}
            <div className="relative w-9 h-9">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-[#EFECE3]"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#A14E36] transition-all duration-500"
                  strokeWidth="3.5"
                  strokeDasharray={`${courseCompletionPercent}, 100`}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-mono text-[9px] font-bold text-[#1C1B18]">
                {courseCompletionPercent}%
              </div>
            </div>
            
            <div className="text-left hidden sm:block space-y-0.5">
              <span className="text-[10px] text-zinc-500 font-mono uppercase block">Прогресс освоения</span>
              <span className="text-xs font-bold text-zinc-800">Пройдено: {courseCompletionPercent}%</span>
            </div>
          </div>

          {/* Header Navigation tabs in the MIDDLE */}
          <nav className="hidden md:flex items-center gap-1.5" id="main-navigation-bar">
            {[
              { id: "dashboard", label: "Главная", icon: Compass },
              { id: "lectures", label: "Программа Лекций", icon: BookOpen }
            ].map((tab) => {
              const IconComp = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  id={`nav-link-${tab.id}`}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition flex items-center gap-2 border ${
                    isActive
                      ? 'bg-[#EFECE3] border-[#DFDACF] text-zinc-900 shadow-sm font-bold'
                      : 'bg-[#F5F2EB] border-[#E8E4D9] text-zinc-500 hover:bg-[#EFECE3]/70 hover:text-zinc-800'
                  }`}
                >
                  <IconComp className="w-4 h-4 text-zinc-500" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Logo Brand click navigates to dashboard on the RIGHT */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer text-right"
            onClick={() => setActiveTab("dashboard")}
            id="branding-logo-action"
          >
            <div className="space-y-0.5 text-right hidden lg:block">
              <h1 className="text-sm font-bold tracking-tight text-[#1C1B18] font-display flex items-center justify-end gap-1.5">
                <span className="text-[9px] font-mono text-[#A14E36] bg-[#A14E36]/10 px-1.5 py-0.5 rounded border border-[#A14E36]/20">Справочник</span>
                C# Handbook
              </h1>
              <p className="text-[10px] text-zinc-500 font-mono">Простой интерактивный учебник по C# &amp; .NET</p>
            </div>
            
            <div className="space-y-0.5 text-right lg:hidden">
              <h1 className="text-sm font-bold tracking-tight text-[#1C1B18] font-display">C# Handbook</h1>
              <p className="text-[9px] text-zinc-500 font-mono">Справочник по C# &amp; .NET</p>
            </div>

            <div className="w-9 h-9 bg-[#24221F] border border-[#24221F] rounded-lg flex items-center justify-center text-[#FAF9F5] font-mono font-black text-sm shadow-sm shrink-0">
              C#
            </div>
          </div>

        </div>
      </header>

      {/* Mobile Navigation bar - now at the bottom, swapped from top! */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-40 bg-[#FAF9F5]/95 backdrop-blur-md rounded-2xl border border-[#DFDACF] p-1.5 flex items-center justify-around gap-1 shadow-lg h-14">
        {[
          { id: "dashboard", label: "Главная", icon: Compass },
          { id: "lectures", label: "Лекции", icon: BookOpen }
        ].map((tab) => {
          const IconComp = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              id={`mobile-nav-link-${tab.id}`}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-1.5 px-2 rounded-xl text-[10px] font-semibold text-center flex flex-col items-center gap-1 transition ${
                isActive
                  ? 'text-[#A14E36] bg-[#A14E36]/10 font-bold'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <IconComp className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Container Wrapper */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8">
        
        {activeTab === "dashboard" && (
          <Dashboard
            progress={progress}
            onNavigate={(tab) => {
              if (tab === "lectures") {
                setActiveTab("lectures");
              }
            }}
            onResetProgress={handleResetProgress}
            onSelectLecture={(id) => {
              setActiveLectureId(id);
              setActiveTab("lectures");
            }}
          />
        )}

        {activeTab === "lectures" && (
          <LectureViewer
            progress={progress}
            activeLectureId={activeLectureId}
            onSelectLecture={(id) => setActiveLectureId(id)}
            onMarkPageCompleted={handleMarkPageCompleted}
            onSaveQuizScore={handleSaveQuizScore}
          />
        )}

      </main>

      {/* Clean Footer */}
      <footer className="bg-white border-t border-[#E4E1D8] py-6 text-center text-zinc-500 text-xs font-mono mt-auto mb-16 md:mb-0">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 C# Handbook. Интерактивный справочник по языку C# &amp; .NET.</p>
          <p className="text-[10px] text-zinc-400">Свободно от суеты, создано с заботой о чистоте кода.</p>
        </div>
      </footer>

    </div>
  );
}
