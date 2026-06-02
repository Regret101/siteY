/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Lecture, LecturePage, UserProgress } from "../types";
import { LECTURES } from "../data/lectures";
import { LECTURE_QUIZZES } from "../data/quizzes";
import { 
  BookOpen, 
  CheckCircle, 
  ChevronRight, 
  ChevronLeft, 
  Award, 
  Lightbulb, 
  HelpCircle,
  Clock,
  Compass,
  FileText,
  RotateCcw,
  Check,
  X,
  Play
} from "lucide-react";

interface LectureViewerProps {
  progress: UserProgress;
  activeLectureId: number;
  onSelectLecture: (id: number) => void;
  onMarkPageCompleted: (lectureId: number, pageIndex: number) => void;
  onSaveQuizScore: (lectureId: number, score: number) => void;
}

export default function LectureViewer({
  progress,
  activeLectureId,
  onSelectLecture,
  onMarkPageCompleted,
  onSaveQuizScore
}: LectureViewerProps) {
  
  // Selection of Mode: "theory" versus "test"
  const [activeMode, setActiveMode] = useState<"theory" | "test">("theory");
  
  // Theory reading state
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [pageCheckState, setPageCheckState] = useState<{ selectedOption: number | null }>({
    selectedOption: null
  });

  // Test state
  const [testStarted, setTestStarted] = useState<boolean>(false);
  const [testCompleted, setTestCompleted] = useState<boolean>(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({}); // question index -> chosen choice index
  const [selectedChoiceIdx, setSelectedChoiceIdx] = useState<number | null>(null);
  const [questionAnswered, setQuestionAnswered] = useState<boolean>(false);
  const [timeSpent, setTimeSpent] = useState<number>(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

  const activeLecture = LECTURES.find(l => l.id === activeLectureId) || LECTURES[0];
  const currentPage: LecturePage = activeLecture.pages[currentPageIndex] || activeLecture.pages[0];
  const currentQuizQuestions = LECTURE_QUIZZES[activeLecture.id] || [];

  // Reset quiz state when active lecture or mode changes
  useEffect(() => {
    setPageCheckState({ selectedOption: null });
    // If switching lecture, stop any active test and reset states
    setTestStarted(false);
    setTestCompleted(false);
    setCurrentQuestionIdx(0);
    setUserAnswers({});
    setSelectedChoiceIdx(null);
    setQuestionAnswered(false);
    setTimeSpent(0);
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  }, [activeLectureId, activeMode]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [timerInterval]);

  // Automatically mark pages as read when they are viewed or navigated to
  useEffect(() => {
    if (activeMode === "theory") {
      onMarkPageCompleted(activeLecture.id, currentPageIndex);
    }
  }, [activeLecture.id, currentPageIndex, activeMode, onMarkPageCompleted]);

  const handlePageChange = (index: number) => {
    setCurrentPageIndex(index);
    setPageCheckState({ selectedOption: null });
  };

  const handleNextPage = () => {
    if (currentPageIndex < 9) {
      handlePageChange(currentPageIndex + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      handlePageChange(currentPageIndex - 1);
    }
  };

  const completedPages = progress.completedLectures[activeLecture.id] || [];
  const isCurrentPageCompleted = completedPages.includes(currentPageIndex);

  // Test functionality
  const startTest = () => {
    setTestStarted(true);
    setTestCompleted(false);
    setCurrentQuestionIdx(0);
    setUserAnswers({});
    setSelectedChoiceIdx(null);
    setQuestionAnswered(false);
    setTimeSpent(0);
    
    const interval = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);
    setTimerInterval(interval);
  };

  const handleChoiceSelect = (choiceIdx: number) => {
    if (questionAnswered) return;
    setSelectedChoiceIdx(choiceIdx);
  };

  const submitQuestionAnswer = () => {
    if (selectedChoiceIdx === null || questionAnswered) return;
    
    // Save answer
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestionIdx]: selectedChoiceIdx
    }));
    setQuestionAnswered(true);
  };

  const nextQuestion = () => {
    if (currentQuestionIdx < currentQuizQuestions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setSelectedChoiceIdx(null);
      setQuestionAnswered(false);
    } else {
      // End test
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }
      setTestCompleted(true);
      
      // Calculate final correct count
      let correctCount = 0;
      currentQuizQuestions.forEach((q, idx) => {
        if (userAnswers[idx] === q.correctIndex || (idx === currentQuestionIdx && selectedChoiceIdx === q.correctIndex)) {
          correctCount++;
        }
      });
      
      // Save results
      onSaveQuizScore(activeLecture.id, correctCount);
    }
  };

  // Stats for the active test
  let correctCount = 0;
  if (testCompleted) {
    currentQuizQuestions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctIndex) {
        correctCount++;
      }
    });
  }

  const percentage = Math.round((correctCount / currentQuizQuestions.length) * 100);
  const highScore = progress.quizHighScores[activeLecture.id] || 0;

  return (
    <div id="lecture-viewer-panel" className="grid grid-cols-1 lg:grid-cols-4 gap-8 animate-fade-in text-zinc-800">
      
      {/* Main Panel Content (Theory Reader vs. Test Simulator) - Swapped and now First (Left Side) */}
      <div className="lg:col-span-3 order-1 lg:order-none">

        {activeMode === "theory" ? (
          /* ================== MODE: THEORY ================== */
          <div className="bg-white border border-[#E4E1D8] shadow-sm rounded-2xl p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EFECE3] pb-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 font-mono">
                  <span>Справочник по C#</span>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-300" />
                  <span className="text-zinc-500">Лекция {activeLecture.id}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-300" />
                  <span className="text-[#A14E36] font-bold font-sans">Страница {currentPageIndex + 1} из 10</span>
                </div>
                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-[#1C1B18] font-sans mt-1">
                  {currentPage.title}
                </h2>
                <p className="text-xs font-semibold text-zinc-400">
                  {currentPage.subtitle}
                </p>
              </div>

              {/* Page Complete checkmark badge */}
              <div>
                {isCurrentPageCompleted ? (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#E8F2EC] text-[#296E49] rounded-full border border-[#D1E6DA] text-xs font-medium">
                    <CheckCircle className="w-3.5 h-3.5 text-[#296E49]" />
                    Прочитано
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FAF9F5] text-zinc-400 rounded-full border border-[#E4E1D8] text-xs font-medium">
                    <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
                    Не прочитано
                  </div>
                )}
              </div>
            </div>

            {/* Reading Material */}
            <div className="prose prose-zinc max-w-none">
              {currentPage.content.split('\n\n').map((para, index) => (
                <p key={index} className="text-[#33312C] text-sm leading-relaxed mb-4 font-sans font-normal">
                  {para}
                </p>
              ))}
            </div>

            {/* Code Snippet Box - Styled as Elegant Slate-Espresso terminal */}
            {currentPage.codeSnippet && (
              <div className="space-y-2 pt-1">
                <span className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase block">
                  Пример кода на C#:
                </span>
                <div className="bg-[#191816] rounded-xl p-4 border border-[#2D2A26] shadow-inner relative select-text">
                  <span className="absolute right-3 top-2 text-[9px] font-mono text-zinc-500 uppercase">
                    csharp
                  </span>
                  <pre className="text-[#E6DFD3] text-xs font-mono leading-relaxed overflow-x-auto whitespace-pre">
                    <code>{currentPage.codeSnippet}</code>
                  </pre>
                </div>
              </div>
            )}

            {/* Quick Tip Widget */}
            {currentPage.tip && (
              <div className="bg-[#FAF9F5] border border-[#E9E4D4] rounded-xl p-4 flex gap-3 text-zinc-700 shadow-sm">
                <Lightbulb className="w-5 h-5 text-[#A14E36] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-[#1C1B18]">Полезный совет:</h4>
                  <p className="text-xs text-zinc-500 leading-relaxed font-sans font-normal">
                    {currentPage.tip}
                  </p>
                </div>
              </div>
            )}

            {/* Simple Self-review inline checking of current page study progress */}
            {currentPage.reviewQuestion && (
              <div className="bg-[#FAF9F5] border border-[#E4E1D8] rounded-xl p-5 space-y-4 shadow-sm">
                <div className="flex items-center gap-2 border-b border-[#EFECE3] pb-2">
                  <HelpCircle className="w-4 h-4 text-zinc-400" />
                  <h4 className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 uppercase">
                    Вопрос для быстрого самоконтроля
                  </h4>
                </div>
                <p className="text-xs font-bold text-[#1C1B18] leading-snug font-sans">
                  {currentPage.reviewQuestion}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {currentPage.reviewAnswers?.map((ans, optIdx) => (
                    <button
                      key={optIdx}
                      onClick={() => setPageCheckState({ selectedOption: optIdx })}
                      className={`text-left p-2.5 rounded-lg text-xs transition border ${
                        pageCheckState.selectedOption === optIdx
                          ? 'bg-[#24221F] text-[#FAF9F5] border-[#24221F] font-bold shadow'
                          : 'bg-white border-[#E4E1D8] text-zinc-700 hover:bg-[#FAF9F5] cursor-pointer'
                      }`}
                    >
                      {ans}
                    </button>
                  ))}
                </div>
                {pageCheckState.selectedOption !== null && (
                  <div className="pt-1 flex justify-between items-center text-xs">
                    <span className={`font-semibold font-mono text-[11px] ${
                      pageCheckState.selectedOption === currentPage.correctAnswerIndex
                        ? 'text-[#296E49]'
                        : 'text-[#A13A2C]'
                    }`}>
                      {pageCheckState.selectedOption === currentPage.correctAnswerIndex
                        ? '✓ Правильно! Вы отлично усвоили этот фрагмент.'
                        : '✗ Неверно, попробуйте перечитать текст страницы.'}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Navigation footer layout - Swapped so Indicator is First (Left) and Buttons are Second (Right) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t border-[#EFECE3] bg-transparent">
              
              {/* Swapped order: auto-read status indicator is now on the LEFT */}
              <div
                id="lecture-auto-read-indicator"
                className="px-5 py-2.5 rounded-lg text-xs tracking-wider uppercase font-extrabold bg-[#E8F2EC] text-[#296E49] border border-[#D1E6DA] flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4 text-[#296E49]" />
                Страница изучена
              </div>

              {/* Swapped order: navigation page steps indicators are now on the RIGHT */}
              <div className="flex items-center gap-2 justify-end">
                <button
                  id="lecture-prev-page-btn"
                  onClick={handlePrevPage}
                  disabled={currentPageIndex === 0}
                  className="px-4 py-2 bg-white border border-[#E2DFD5] hover:bg-[#F2EFE6] disabled:opacity-30 disabled:hover:bg-white rounded-lg text-zinc-700 transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer shadow-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Назад
                </button>
                
                <button
                  id="lecture-next-page-btn"
                  onClick={handleNextPage}
                  disabled={currentPageIndex === 9}
                  className="px-4 py-2 bg-white border border-[#E2DFD5] hover:bg-[#F2EFE6] disabled:opacity-30 disabled:hover:bg-white rounded-lg text-zinc-700 transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer shadow-sm"
                >
                  Вперед
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>

            {/* Prompt to take the test when all 10 pages are read */}
            {completedPages.length === 10 && (
              <div className="bg-[#FAF9F5] border border-[#A14E36]/20 bg-[#FAF9F5] rounded-2xl p-5 mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-bounce-subtle shadow-sm">
                <div className="space-y-1">
                  <h4 className="text-xs font-mono font-bold tracking-wider text-[#A14E36] uppercase flex items-center gap-1">
                    <Award className="w-4 h-4 text-[#A14E36]" />
                    Лекция изучена полностью!
                  </h4>
                  <p className="text-xs text-zinc-500">
                    Все 10 страниц теории прочитаны. Теперь вы готовы пройти закрепительный тест на 30 вопросов.
                  </p>
                </div>
                <button
                  onClick={() => setActiveMode("test")}
                  className="px-4 py-2 bg-[#A14E36] text-white text-xs font-bold tracking-wider rounded-lg hover:bg-[#853C28] transition shadow-sm cursor-pointer uppercase font-mono"
                >
                  Перейти к тесту лекции
                </button>
              </div>
            )}

          </div>
        ) : (
          /* ================== MODE: TEST ================== */
          <div className="bg-white border border-[#E4E1D8] shadow-sm rounded-2xl p-6 space-y-5">
            
            {/* Header / Intro section */}
            {!testStarted && !testCompleted ? (
              <div id="test-invitation-container" className="py-6 text-center space-y-6 max-w-xl mx-auto animate-fade-in">
                <div className="w-16 h-16 bg-[#F1EDE2] border border-[#D9D3C3] rounded-2xl flex items-center justify-center text-[#A14E36] mx-auto shadow-sm">
                  <FileText className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-[#1C1B18] font-sans">
                    Тест по теме: {activeLecture.title}
                  </h3>
                  <p className="text-xs text-zinc-500 leading-relaxed font-sans max-w-md mx-auto">
                    Каждая лекция содержит закрепительный тест объёмом ровно в **30 подробных вопросов** для всесторонней проверки понимания синтаксиса, типов и фич языка C#.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto">
                  <div className="bg-[#FAF9F5] p-4 rounded-xl border border-[#E4E1D8]">
                    <span className="text-[10px] text-zinc-400 font-mono block uppercase">Лучший результат</span>
                    <span className="text-lg font-bold text-zinc-700 mt-0.5 block font-mono">
                      {highScore > 0 ? `${highScore} / 30` : "Не сдавался"}
                    </span>
                  </div>
                  <div className="bg-[#FAF9F5] p-4 rounded-xl border border-[#E4E1D8]">
                    <span className="text-[10px] text-zinc-400 font-mono block uppercase">Условие сдачи</span>
                    <span className="text-xs font-bold text-[#3E7D52] mt-1 block">
                      &gt;= 15 верных (50%)
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    id="start-lecture-quiz-btn"
                    onClick={startTest}
                    className="px-8 py-3 bg-[#24221F] hover:bg-[#3E3C38] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition inline-flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Начать тест к лекции
                  </button>
                </div>
              </div>
            ) : testStarted && !testCompleted ? (
              /* Active trivia layout */
              <div id="active-quiz-panel" className="space-y-6 animate-fade-in">
                
                {/* Meta stats bar */}
                <div className="flex items-center justify-between border-b border-[#EFECE3] pb-3 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-zinc-400 font-mono text-[10px]">Текущие вопросы:</span>
                    <p className="font-bold text-[#1C1B18]">
                      Вопрос {currentQuestionIdx + 1} из {currentQuizQuestions.length}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 bg-[#FAF9F5] px-3 py-1.5 rounded-lg border border-[#E4E1D8] text-zinc-750 font-mono text-xs">
                    <Clock className="w-3.5 h-3.5 text-[#A14E36] animate-pulse" />
                    <span>
                      {Math.floor(timeSpent / 60).toString().padStart(2, "0")}:
                      {(timeSpent % 60).toString().padStart(2, "0")}
                    </span>
                  </div>
                </div>

                {/* Progress bar container */}
                <div className="w-full bg-[#FAF9F5] rounded-full h-1.5 border border-[#E4E1D8]">
                  <div 
                    style={{ width: `${((currentQuestionIdx) / currentQuizQuestions.length) * 100}%` }}
                    className="bg-[#A14E36] h-1.5 rounded-full transition-all duration-300"
                  />
                </div>

                {/* Question core text body */}
                <div className="space-y-4">
                  <span className="text-[9px] font-mono tracking-widest text-[#A14E36] bg-[#A14E36]/10 border border-[#A14E36]/20 px-2 py-0.5 rounded uppercase">
                    Тема: {currentQuizQuestions[currentQuestionIdx].category}
                  </span>
                  <p className="text-[#1C1B18] text-sm md:text-base font-bold leading-relaxed font-sans">
                    {currentQuizQuestions[currentQuestionIdx].question}
                  </p>
                </div>

                {/* Question Answers choices stack */}
                <div className="space-y-2">
                  {currentQuizQuestions[currentQuestionIdx].options.map((option, idx) => {
                    const isSelected = selectedChoiceIdx === idx;
                    const isAnswered = questionAnswered;
                    const isCorrectOption = idx === currentQuizQuestions[currentQuestionIdx].correctIndex;
                    const wasChosenByMe = selectedChoiceIdx === idx;

                    let choiceClassName = "bg-[#FAF9F5] border-[#E4E1D8] text-zinc-750 hover:bg-[#F2EFE6]";
                    
                    if (isSelected) {
                      choiceClassName = "bg-[#24221F] border-[#24221F] text-[#FAF9F5] font-bold";
                    }

                    // Grading feedback
                    if (isAnswered) {
                      if (isCorrectOption) {
                        choiceClassName = "bg-[#E8F2EC] border-[#296E49] text-[#296E49] font-bold";
                      } else if (wasChosenByMe) {
                        choiceClassName = "bg-[#FDF6F5] border-[#A13A2C] text-[#A13A2C] font-semibold";
                      } else {
                        choiceClassName = "bg-[#FAF9F5]/40 border-[#EFECE3] text-zinc-400 opacity-60";
                      }
                    }

                    return (
                      <button
                        key={idx}
                        id={`test-choice-btn-${idx}`}
                        disabled={isAnswered}
                        onClick={() => handleChoiceSelect(idx)}
                        className={`w-full text-left p-3.5 rounded-xl border text-xs leading-relaxed transition-all flex items-center justify-between gap-3 ${choiceClassName} ${!isAnswered ? 'cursor-pointer' : "cursor-default"}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-5 h-5 rounded-full border flex items-center justify-center font-mono text-[10px] ${
                            isSelected && !isAnswered ? "border-[#FAF9F5] text-[#FAF9F5]" : "border-zinc-350 text-zinc-400"
                          }`}>
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span>{option}</span>
                        </div>
                        
                        {isAnswered && isCorrectOption && (
                          <Check className="w-4.5 h-4.5 text-[#296E49] shrink-0" />
                        )}
                        {isAnswered && wasChosenByMe && !isCorrectOption && (
                          <X className="w-4.5 h-4.5 text-[#A13A2C] shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Feedback explanation for current question */}
                {questionAnswered && (
                  <div className="bg-[#FAF9F5] border border-[#DFDACF] p-4 rounded-xl space-y-2 animate-fade-in">
                    <span className="text-[10px] text-zinc-400 font-mono block uppercase">Объяснение:</span>
                    <p className="text-xs text-zinc-650 font-sans leading-relaxed">
                      {currentQuizQuestions[currentQuestionIdx].explanation}
                    </p>
                  </div>
                )}

                {/* Submitting next action bar */}
                <div className="flex justify-end pt-3">
                  {!questionAnswered ? (
                    <button
                      id="submit-answer-action-btn"
                      disabled={selectedChoiceIdx === null}
                      onClick={submitQuestionAnswer}
                      className="px-6 py-2.5 bg-[#24221F] hover:bg-[#3E3C38] disabled:opacity-30 disabled:hover:bg-[#24221F] text-[#FAF9F5] text-xs font-bold uppercase tracking-wider rounded-lg transition cursor-pointer"
                    >
                      Ответить
                    </button>
                  ) : (
                    <button
                      id="next-question-action-btn"
                      onClick={nextQuestion}
                      className="px-6 py-2.5 bg-[#A14E36] hover:bg-[#853C28] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition flex items-center gap-1 cursor-pointer"
                    >
                      {currentQuestionIdx === currentQuizQuestions.length - 1 ? "Завершить тест" : "Следующий вопрос"}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>

              </div>
            ) : (
              /* ================== MODE: TEST COMPLETED RESULTS REVIEW ================== */
              <div id="test-results-container" className="space-y-6 animate-fade-in">
                
                {/* Visual scorecard banner */}
                <div className="bg-white border border-[#E4E1D8] rounded-2xl p-6 text-center space-y-4 shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-[#FAF9F5] border border-[#E4E1D8] flex items-center justify-center text-[#A14E36] mx-auto">
                    <Award className="w-6 h-6 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest block font-bold">Тестирование успешно завершено!</span>
                    <h3 className="text-xl font-bold text-[#1C1B18] font-sans">
                      Ваш результат по лекции {activeLecture.id}
                    </h3>
                  </div>

                  <div className="grid grid-cols-3 gap-3 max-w-md mx-auto py-2">
                    <div className="bg-[#FAF9F5] p-3 rounded-lg border border-[#E4E1D8]">
                      <span className="text-[9px] text-zinc-400 font-mono block uppercase">Верные ответы</span>
                      <span className="text-sm font-bold text-[#1C1B18] font-mono">{correctCount} из 30</span>
                    </div>
                    <div className="bg-[#FAF9F5] p-3 rounded-lg border border-[#E4E1D8]">
                      <span className="text-[9px] text-zinc-400 font-mono block uppercase">Результат</span>
                      <span className="text-sm font-bold text-[#296E49] font-mono">{percentage}%</span>
                    </div>
                    <div className="bg-[#FAF9F5] p-3 rounded-lg border border-[#E4E1D8]">
                      <span className="text-[9px] text-zinc-400 font-mono block uppercase">Статус зачета</span>
                      <span className={`text-sm font-bold ${percentage >= 50 ? 'text-[#3E7D52]' : 'text-[#B25D41]'}`}>
                        {percentage >= 50 ? 'Зачет' : 'Незачет'}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
                    {percentage >= 50 
                      ? "Поздравляем! Вы продемонстрировали хорошее владение материалом лекции." 
                      : "Порог прохождения — 50%. Рекомендуем перечитать страницы теории и сдать эту тему повторно."}
                  </p>

                  <div className="pt-2 border-t border-[#EFECE3] w-full flex justify-center">
                    <button
                      id="exam-restart-test-btn"
                      onClick={startTest}
                      className="px-6 py-2.5 bg-[#24221F] hover:bg-[#3E3C38] text-white text-xs font-bold uppercase tracking-wider rounded-lg transition inline-flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Пройти тест заново
                    </button>
                  </div>
                </div>

                {/* Staggered answer ledger reviewer */}
                <div className="space-y-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-500 border-b border-[#EFECE3] pb-2">
                    Подробный разбор ваших ответов:
                  </h4>
                  
                  <div className="space-y-4">
                    {currentQuizQuestions.map((q, qIdx) => {
                      const myChoice = userAnswers[qIdx];
                      const isCorrect = myChoice === q.correctIndex;
                      
                      return (
                        <div 
                          key={q.id} 
                          className={`bg-white border rounded-xl p-4 md:p-5 space-y-4 shadow-sm transition ${
                            isCorrect 
                              ? "border-[#D1E6DA]" 
                              : "border-[#E7D0CD]"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <span className="text-[10px] font-mono text-zinc-400">Вопрос {qIdx + 1}</span>
                            <span className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded ${
                              isCorrect 
                                ? "bg-[#E8F2EC] text-[#296E49] border border-[#D1E6DA]" 
                                : "bg-[#FDF6F5] text-[#A13A2C] border border-[#E7D0CD]"
                            }`}>
                              {isCorrect ? "Верно" : "Неверно"}
                            </span>
                          </div>

                          <div className="space-y-3">
                            <p className="text-[#1C1B18] text-xs font-bold leading-relaxed">
                              {q.question}
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {q.options.map((option, oIdx) => {
                                const isCorrectOption = oIdx === q.correctIndex;
                                const wasChosenByMe = oIdx === myChoice;

                                let choiceStyle = "bg-[#FAF9F5]/40 border-[#EFECE3] text-zinc-400 opacity-70";
                                if (isCorrectOption) {
                                  choiceStyle = "bg-[#E8F2EC] border-[#D1E6DA] text-[#296E49] font-semibold";
                                } else if (wasChosenByMe) {
                                  choiceStyle = "bg-[#FDF6F5] border-[#E7D0CD] text-[#A13A2C]";
                                }

                                return (
                                  <div 
                                    key={oIdx} 
                                    className={`p-2.5 rounded-lg border text-[11px] leading-relaxed flex items-center justify-between gap-2 ${choiceStyle}`}
                                  >
                                    <span>{option}</span>
                                    <span className="text-[9px] font-mono uppercase tracking-wider shrink-0 font-bold">
                                      {isCorrectOption && "✓ Верно"}
                                      {wasChosenByMe && !isCorrectOption && "✗ Ваш выбор"}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Educational explanation */}
                            <div className="bg-[#FAF9F5] p-3 rounded-lg border border-[#E2DFD5] space-y-1">
                              <span className="text-[9px] text-[#A14E36] font-semibold font-mono block uppercase">Разбор темы (объяснение):</span>
                              <p className="text-xs text-zinc-550 leading-relaxed font-sans font-normal">
                                {q.explanation}
                              </p>
                            </div>

                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

      </div>

      {/* Sidebar: Lecture selector and local actions - Swapped and now Second (Right Side) */}
      <div className="space-y-6 lg:col-span-1 order-2 lg:order-none">
        
        {/* Lecture selector list */}
        <div className="bg-white border border-[#E4E1D8] shadow-sm rounded-xl p-4 space-y-3">
          <h3 className="text-xs font-mono font-bold tracking-wider text-zinc-500 uppercase flex items-center gap-1.5 px-1">
            <Compass className="w-3.5 h-3.5 text-zinc-400" />
            Выберите лекцию
          </h3>
          <div className="space-y-1">
            {LECTURES.map((lec) => {
              const count = progress.completedLectures[lec.id]?.length || 0;
              const isLecDone = count === 10;
              const isActive = lec.id === activeLecture.id;
              const testScore = progress.quizHighScores[lec.id];
              
              return (
                <button
                  key={lec.id}
                  id={`lecture-select-btn-${lec.id}`}
                  onClick={() => {
                    onSelectLecture(lec.id);
                    setCurrentPageIndex(0);
                    setActiveMode("theory");
                  }}
                  className={`w-full text-left p-2.5 rounded-lg text-xs leading-snug flex flex-col gap-1 border transition ${
                    isActive 
                      ? 'bg-[#EFECE3] border-[#D9D3C3] text-[#1C1B18] font-bold' 
                      : 'bg-white hover:bg-[#FAF9F5] border-[#E4E1D8] text-zinc-600'
                  }`}
                >
                  <div className="flex items-center justify-between w-full gap-2">
                    <span className="font-mono text-[9px] text-zinc-400">Лекция {lec.id}</span>
                    {isLecDone ? (
                      <CheckCircle className="w-3.5 h-3.5 text-[#296E49] shrink-0" />
                    ) : (
                      <span className="text-[9px] font-mono text-zinc-450">{count}/10 стр</span>
                    )}
                  </div>
                  <h4 className={`truncate w-full font-sans ${isActive ? 'text-[#1C1B18] font-bold' : 'text-zinc-700 font-semibold'}`}>{lec.title}</h4>
                  {testScore !== undefined && (
                    <div className="mt-1 flex items-center justify-between w-full border-t border-[#E4E1D8]/50 pt-1 text-[9px] font-mono">
                      <span className="text-zinc-400">Тест (30 вопр.):</span>
                      <span className={testScore >= 15 ? "text-[#3E7D52] font-semibold" : "text-[#B25D41]"}>
                        {testScore}/30 ({Math.round((testScore / 30) * 100)}%)
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="bg-white border border-[#E4E1D8] shadow-sm rounded-xl p-3 space-y-1.5">
          <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-450 px-1">Режим работы</span>
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => setActiveMode("theory")}
              className={`py-1.5 px-2.5 rounded-md text-[11px] font-semibold flex items-center justify-center gap-1.5 transition ${
                activeMode === "theory"
                  ? "bg-[#24221F] text-[#FAF9F5] font-bold"
                  : "bg-[#FAF9F5] text-zinc-500 hover:text-zinc-850 border border-[#E4E1D8]/60"
              }`}
            >
              <BookOpen className="w-3 h-3" />
              Теория
            </button>
            <button
              onClick={() => setActiveMode("test")}
              className={`py-1.5 px-2.5 rounded-md text-[11px] font-semibold flex items-center justify-center gap-1.5 transition ${
                activeMode === "test"
                  ? "bg-[#24221F] text-[#FAF9F5] font-bold"
                  : "bg-[#FAF9F5] text-zinc-500 hover:text-zinc-850 border border-[#E4E1D8]/60"
              }`}
            >
              <FileText className="w-3 h-3" />
              Тест
            </button>
          </div>
        </div>

        {/* Selected lecture: Subpages navigation (only shown in theory mode) */}
        {activeMode === "theory" && (
          <div className="bg-white border border-[#E4E1D8] shadow-sm rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between border-b border-[#EFECE3] pb-2 mb-2">
              <h3 className="text-xs font-mono font-bold tracking-wider text-zinc-500 uppercase">
                Страницы лекции
              </h3>
              <span className="text-[10px] font-mono bg-[#EFECE3] text-zinc-600 px-1.5 py-0.5 rounded border border-[#DFDACF]">
                {currentPageIndex + 1} / 10
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {Array.from({ length: 10 }).map((_, i) => {
                const isPageCom = completedPages.includes(i);
                const isSelected = i === currentPageIndex;
                return (
                  <button
                    key={i}
                    id={`lecture-page-tab-${i}`}
                    onClick={() => handlePageChange(i)}
                    className={`text-[11px] font-mono p-2 rounded-lg text-left transition border ${
                      isSelected
                        ? 'bg-[#A14E36]/10 border-[#A14E36]/30 text-[#A14E36] font-bold shadow-sm'
                        : isPageCom
                        ? 'bg-[#E8F2EC] border-[#D1E6DA] text-[#296E49]'
                        : 'bg-[#FAF9F5] border-[#E4E1D8] text-zinc-500 hover:bg-[#F2EFE6]'
                    } flex items-center justify-between`}
                  >
                    <span>Стр {i + 1}</span>
                    {isPageCom && <span className="w-1.5 h-1.5 rounded-full bg-[#296E49]" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Selected Lecture metadata */}
        <div className="bg-[#FAF9F5] text-zinc-650 rounded-xl p-4 space-y-3.5 border border-[#E4E1D8]">
          <div className="space-y-1">
            <h4 className="text-[10px] text-zinc-400 font-mono tracking-wider uppercase">О лекции</h4>
            <div className="text-xs font-bold text-[#1C1B18] leading-snug">{activeLecture.title}</div>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
            <div className="space-y-0.5">
              <span className="text-zinc-400 text-[9px] font-mono uppercase block">Сложность</span>
              <span className="font-bold text-zinc-700">{activeLecture.difficulty}</span>
            </div>
            <div className="space-y-0.5">
              <span className="text-zinc-400 text-[9px] font-mono uppercase block">Время чтения</span>
              <span className="font-bold text-zinc-700 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                {activeLecture.estimatedTime}
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
