/**
 * @fileoverview TypeScript型定義ファイル
 *
 * このファイルは、アプリケーション全体で使用されるTypeScriptの型定義をまとめたものです。
 * 語句データ、学習セッション、学習ログなどの主要なデータ構造を定義しています。
 *
 * @author Yusei Maekawa
 * @version 1.0.0
 * @since 2025-08-01
 */

/**
 * 学習ログの型定義
 * ユーザーの学習活動を記録するためのデータ構造
 *
 * @interface StudyLog
 * @property {string} date - 学習日付（YYYY-MM-DD形式）
 * @property {string} category - 学習したカテゴリ
 * @property {number} amount - 学習時間（分数）
 *
 * @example
 * ```typescript
 * const studyLog: StudyLog = {
 *   date: "2025-09-01",
 *   category: "programming",
 *   amount: 60
 * };
 * ```
 */
export interface StudyLog {
  date: string; // YYYY-MM-DD
  category: string;
  amount: number; // 分数
}

import { CategoryKey } from './data/categories';

/**
 * 語句データの型定義
 * 学習対象となる単語・用語の情報を格納するデータ構造
 *
 * @interface Term
 * @property {number} id - 語句の一意の識別子
 * @property {CategoryKey} category - 語句が属するカテゴリ
 * @property {string} term - 語句（英単語や専門用語）
 * @property {string} meaning - 語句の意味・説明
 * @property {string} [example] - 使用例・例文（オプション）
 * @property {string} createdAt - 作成日時（ISO 8601形式）
 * @property {string} [updatedAt] - 更新日時（オプション、ISO 8601形式）
 *
 * @example
 * ```typescript
 * const term: Term = {
 *   id: 1,
 *   category: "programming",
 *   term: "closure",
 *   meaning: "関数とその関数が定義されたスコープへの参照",
 *   example: "JavaScriptのクロージャーは変数のスコープを保持する",
 *   createdAt: "2025-09-01T10:00:00Z"
 * };
 * ```
 */
export interface Term {
  id: number;
  category: CategoryKey;
  term: string;
  meaning: string;
  example?: string;
  createdAt: string;
  updatedAt?: string;
}

/**
 * 学習セッションの型定義
 * 学習中の状態を管理するためのデータ構造
 *
 * @interface StudySession
 * @property {Term[]} terms - 学習対象の語句配列
 * @property {number} currentIndex - 現在学習中の語句のインデックス
 * @property {number} totalTerms - 総語句数
 * @property {boolean} isActive - セッションがアクティブかどうか
 * @property {boolean} showAnswer - 答えを表示するかどうか
 *
 * @example
 * ```typescript
 * const session: StudySession = {
 *   terms: [term1, term2, term3],
 *   currentIndex: 1,
 *   totalTerms: 3,
 *   isActive: true,
 *   showAnswer: false
 * };
 * ```
 */
export interface StudySession {
  terms: Term[];
  currentIndex: number;
  totalTerms: number;
  isActive: boolean;
  showAnswer: boolean;
}
