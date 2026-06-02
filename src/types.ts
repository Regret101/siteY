/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface LecturePage {
  title: string;
  subtitle: string;
  content: string;
  codeSnippet?: string;
  tip?: string;
  reviewQuestion?: string;
  reviewAnswers?: string[];
  correctAnswerIndex?: number;
}

export interface Lecture {
  id: number;
  title: string;
  description: string;
  difficulty: "Начинающий" | "Средний" | "Продвинутый";
  estimatedTime: string;
  pages: LecturePage[];
}

export interface QuizQuestion {
  id: number;
  category: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface UserProgress {
  completedLectures: Record<number, number[]>; // lectureId -> array of completed page indices
  quizHighScores: Record<number, number>; // lectureId -> high score of the 30-question test
}
