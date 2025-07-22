// 学習記録（スケジュール用）
export interface StudyLog {
  date: string; // YYYY-MM-DD
  category: string;
  amount: number; // 分数
}
import { CategoryKey } from './data/categories';

export interface Term {
  id: number;
  category: CategoryKey;
  term: string;
  meaning: string;
  example?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface StudySession {
  terms: Term[];
  currentIndex: number;
  totalTerms: number;
  isActive: boolean;
  showAnswer: boolean;
}
