/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { UserProgress } from "../types";
import { LECTURES } from "../data/lectures";
import { 
  BookOpen, 
  Award, 
  CheckCircle, 
  TrendingUp, 
  HelpCircle, 
  Trash2,
  Lock,
  Compass,
  FileText
} from "lucide-react";

interface DashboardProps {
  progress: UserProgress;
  onNavigate: (tab: "lectures") => void;
  onResetProgress: () => void;
  onSelectLecture: (id: number) => void;
}

export default function Dashboard({ 
  progress, 
  onNavigate, 
  onResetProgress, 
  onSelectLecture
}: DashboardProps) {
  
  // Total stats calculations
  const totalLecturesCount = LECTURES.length;
  const totalPagesCount = totalLecturesCount * 10;
  
  // Completed pages count across all 6 lectures
  let completedPagesCount = 0;
  Object.values(progress.completedLectures).forEach(pages => {
    completedPagesCount += pages.length;
  });
  
  const lecturesProgressPercent = Math.round((completedPagesCount / totalPagesCount) * 100);

  // Completed tests evaluation
  let passedTestsCount = 0;
  let totalTestsTaken = 0;
  let totalCorrectAnswers = 0;

  LECTURES.forEach(lec => {
    const score = progress.quizHighScores[lec.id];
    if (score !== undefined) {
      totalTestsTaken++;
      totalCorrectAnswers += score;
      if (score >= 15) {
        passedTestsCount++;
      }
    }
  });

  const testPassRatePercent = totalLecturesCount > 0 
    ? Math.round((passedTestsCount / totalLecturesCount) * 100) 
    : 0;

  // Comprehensive knowledge indicator (50% reading progress, 50% test passing progress)
  const masteryIndex = Math.round((lecturesProgressPercent * 0.5) + (testPassRatePercent * 0.5));

  const getMasteryLevel = (index: number) => {
    if (index === 0) return { label: "К чтению справочника не приступали", color: "text-[#7C7A70]" };
    if (index < 25) return { label: "Начальное ознакомление", color: "text-[#B25D41]" };
    if (index < 60) return { label: "Базовые знания синтаксиса", color: "text-[#B27D41]" };
    if (index < 85) return { label: "Уверенное понимание концепций", color: "text-[#3F6675]" };
    return { label: "Превосходное владение языком C#!", color: "text-[#4F6E55]" };
  };

  const levelInfo = getMasteryLevel(masteryIndex);

  return (
    <div className="space-y-8 animate-fade-in text-zinc-800" id="dashboard-tab-panel">
      
      {/* Visual Header Banner - Styled in Elegant Linen Card */}
      <div className="bg-[#F1EDE2] rounded-2xl p-6 md:p-8 border border-[#D9D3C3] relative overflow-hidden shadow-sm">
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono tracking-wider text-[#A14E36] uppercase rounded-full bg-[#A14E36]/10 border border-[#A14E36]/20">
            интерактивный справочный ресурс
          </span>
          <h1 className="text-3xl md:text-4xl font-sans font-black tracking-tight text-[#1C1B18]">
            Изучение объектно-ориентированного языка C#
          </h1>
          <p className="text-sm text-zinc-650 leading-relaxed font-sans font-normal">
            Простой, интерактивный веб-учебник по языку C# и платформе .NET для быстрой подготовки. Включает в себя 6 подробных иллюстрированных лекций (по 10 содержательных страниц каждая) и закрепительные тестовые опросы по 30 вопросов к каждой теме лекции.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              id="dashboard-start-lectures-btn"
              onClick={() => onNavigate("lectures")}
              className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg bg-[#A14E36] hover:bg-[#853C28] active:scale-95 transition text-white shadow-sm cursor-pointer"
            >
              Изучать лекции
            </button>
          </div>
        </div>
      </div>

      {/* Progress Cards Layout - Swapped all controls around! (Passed quizzes count is now first, Mastery is last) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Passed quizzes count (Formerly 3rd, now 1st!) */}
        <div className="bg-white rounded-2xl p-6 border border-[#E4E1D8] flex flex-col justify-between space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#EFECE3] pb-3">
            <h3 className="text-xs font-mono tracking-wider text-zinc-500 uppercase">
              Тестовые зачеты (сдано)
            </h3>
            <Award className="w-4 h-4 text-[#4F6E55]" />
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-mono font-bold text-[#1C1B18]">
              {passedTestsCount} <span className="text-sm font-normal text-zinc-400">/ {totalLecturesCount} сдано</span>
            </div>
            <p className="text-xs text-zinc-500 leading-snug">
              Пройдено {testPassRatePercent}% тестов (порог — не менее 15 из 30 верных).
            </p>
          </div>
          <div className="w-full bg-[#FAF9F5] rounded-full h-1.5">
            <div 
              style={{ width: `${testPassRatePercent}%` }}
              className="bg-[#4F6E55] rounded-full h-1.5 transition-all duration-500"
            />
          </div>
        </div>

        {/* Lectures Completed Card (Remains in middle or slightly adjusted style) */}
        <div className="bg-white rounded-2xl p-6 border border-[#E4E1D8] flex flex-col justify-between space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#EFECE3] pb-3">
            <h3 className="text-xs font-mono tracking-wider text-zinc-500 uppercase">
              Прочитанные лекции
            </h3>
            <BookOpen className="w-4 h-4 text-[#A14E36]" />
          </div>
          <div className="space-y-1">
            <div className="text-3xl font-mono font-bold text-[#1C1B18]">
              {completedPagesCount} <span className="text-sm font-normal text-zinc-400">/ {totalPagesCount} стр</span>
            </div>
            <p className="text-xs text-zinc-500 leading-snug">
              Прочитано {lecturesProgressPercent}% теории из представленного курса.
            </p>
          </div>
          <div className="w-full bg-[#FAF9F5] rounded-full h-1.5">
            <div 
              style={{ width: `${lecturesProgressPercent}%` }}
              className="bg-[#A14E36] rounded-full h-1.5 transition-all duration-500"
            />
          </div>
        </div>

        {/* Mastery Index Card (Formerly 1st, now 3rd!) */}
        <div className="bg-white rounded-2xl p-6 border border-[#E4E1D8] flex flex-col justify-between space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-[#EFECE3] pb-3">
            <div className="space-y-0.5">
              <h3 className="text-xs font-mono tracking-wider text-zinc-500 uppercase">
                Общий показатель прогресса
              </h3>
              <p className="text-[10px] text-zinc-400">
                Консолидированное усвоение материала
              </p>
            </div>
            <TrendingUp className="w-4 h-4 text-[#A14E36]" />
          </div>
          
          <div className="flex items-end gap-5 py-1">
            <div className="text-4xl md:text-5xl font-mono font-bold tracking-tight text-[#1C1B18]">
              {masteryIndex}%
            </div>
            <div className="space-y-0.5 pb-1">
              <span className={`text-[11px] font-bold ${levelInfo.color}`}>
                {levelInfo.label}
              </span>
              <p className="text-[10px] text-zinc-400">
                Веса: 50% теория / 50% тесты
              </p>
            </div>
          </div>

          <div className="w-full bg-[#FAF9F5] rounded-full h-1.5">
            <div 
              style={{ width: `${masteryIndex}%` }}
              className="bg-[#A14E36] rounded-full h-1.5 transition-all duration-500"
            />
          </div>
        </div>

      </div>

      {/* Lectures List Overview - Columns Swapped radically! */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Action Board & Reset Progress (Swapped from right side!) */}
        <div className="space-y-6 lg:col-span-1">
          <div className="bg-white border border-[#E4E1D8] p-6 rounded-2xl space-y-5 shadow-sm">
            <h3 className="text-sm font-bold tracking-tight text-[#1C1B18] border-b border-[#EFECE3] pb-3 flex items-center justify-between">
              <span>Сдача зачетов</span>
              <FileText className="w-4 h-4 text-[#A14E36]" />
            </h3>

            <div className="space-y-3">
              {LECTURES.map(l => {
                const score = progress.quizHighScores[l.id];
                const hasTaken = score !== undefined;
                return (
                  <div key={l.id} className="flex items-center justify-between p-2.5 bg-[#FAF9F5] hover:bg-[#F3EFE4] rounded-xl border border-[#EFECE3] text-xs transition">
                    <span className="text-[#1C1B18] font-normal truncate pr-2 max-w-[150px]">{l.title}</span>
                    <div>
                      {hasTaken ? (
                        <span className={`font-mono text-[11px] font-bold ${score >= 15 ? 'text-[#3E7D52]' : 'text-[#B25D41]'}`}>
                          {score}/30 ({score >= 15 ? 'Зачет' : 'Незачет'})
                        </span>
                      ) : (
                        <span className="text-zinc-400 text-[10px] font-mono">Не проходился</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reset Progress Section */}
          <div className="p-5 bg-[#FDF6F5] border border-[#E7D0CD] rounded-2xl space-y-3 flex flex-col justify-between shadow-sm">
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-[#A13A2C] flex items-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5 text-[#A13A2C]" />
                Сброс прогресса
              </h4>
              <p className="text-[11px] text-zinc-500 leading-relaxed font-sans font-light">
                Вы можете начать изучение страниц лекционного материала и сдачу тестов заново. Вся накопленная статистика по прочитанным страницам и результатам тестов будет удалена.
              </p>
            </div>
            <button
              id="reset-progress-action-btn"
              onClick={onResetProgress}
              className="text-left text-xs font-mono text-[#A13A2C] hover:text-[#7D1D12] font-semibold hover:underline bg-transparent border-none p-0 cursor-pointer"
            >
              Сбросить все данные
            </button>
          </div>
        </div>

        {/* Right Column: 6 Lectures cards (Swapped from left side!) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold tracking-tight text-[#1C1B18] flex items-center gap-2">
              <Compass className="w-4.5 h-4.5 text-zinc-400" />
              Программа лекций ({totalLecturesCount} модулей)
            </h2>
            <button 
              id="dashboard-view-all-lectures-link"
              onClick={() => onNavigate("lectures")}
              className="text-xs text-[#A14E36] hover:text-[#853C28] hover:underline font-bold font-mono cursor-pointer"
            >
              Смотреть все
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {LECTURES.map((lec) => {
              const pagesCom = progress.completedLectures[lec.id]?.length || 0;
              const pPercent = Math.round((pagesCom / 10) * 100);
              const isReadCompleted = pagesCom === 10;
              const testScore = progress.quizHighScores[lec.id];
              const testPassed = testScore !== undefined && testScore >= 15;
              
              return (
                <div 
                  key={lec.id} 
                  id={`dashboard-lecture-card-${lec.id}`}
                  className="bg-white hover:bg-[#FDFBF7] border border-[#E4E1D8] p-5 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 cursor-pointer flex flex-col justify-between space-y-4"
                  onClick={() => onSelectLecture(lec.id)}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono bg-[#EFECE3] text-zinc-600 px-2 py-0.5 rounded border border-[#DFDACF]">
                        Лекция {lec.id}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {isReadCompleted && (
                          <span className="text-[9px] font-mono bg-[#E8F2EC] text-[#296E49] border border-[#D1E6DA] px-1.5 py-0.5 rounded">
                            Изучено
                          </span>
                        )}
                        {testScore !== undefined && (
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                            testPassed 
                              ? "bg-[#E8F2EC] text-[#296E49] border-[#D1E6DA]" 
                              : "bg-[#FCEFEA] text-[#A14E36] border-[#F5DBD0]"
                          }`}>
                            Тест: {testScore}/30
                          </span>
                        )}
                      </div>
                    </div>
                    <h4 className="text-sm font-bold text-[#1C1B18] line-clamp-1 font-sans">
                      {lec.title}
                    </h4>
                    <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed font-sans font-normal">
                      {lec.description}
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-1.5 border-t border-[#EFECE3]">
                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                      <span>Чтение: {pagesCom}/10 стр</span>
                      <span>{pPercent}%</span>
                    </div>
                    <div className="w-full bg-[#FAF9F5] rounded-full h-1">
                      <div 
                        style={{ width: `${pPercent}%` }}
                        className="bg-[#A14E36] rounded-full h-1"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
