/**
 * src/types.ts
 *
 * ======================================================================== 
 * @author Yusei Maekawa
 * @version 0.3.0
 * @since 2025-08-01
 * @updated 2025-11-02
 *
 * 📖 ファイル概要 / File Overview
 * ============================================================================
 *
 * 【日本語】
 * アプリケーション全体で使用されるTypeScript型定義ファイル。
 * 語句データ（Term）、学習セッション（StudySession）、学習ログ（StudyLog）など、
 * 主要なデータ構造の型定義を提供します。すべてのコンポーネントとフックで
 * 型安全性を保証するために使用されます。
 *
 * 【English】
 * TypeScript type definition file used throughout the application.
 * Provides type definitions for main data structures such as Terms,
 * Study Sessions, and Study Logs. Used to ensure type safety across
 * all components and hooks.
 *
 * ============================================================================
 * 📦 型定義リスト / Type Definition List
 * ============================================================================
 *
 * 1. StudyLog - 学習ログ
 *    - 日本語: ユーザーの学習活動を記録するためのデータ構造
 *    - English: Data structure for recording user study activities
 *    - プロパティ:
 *      - date: string - 学習日付（YYYY-MM-DD形式）
 *      - category: string - 学習したカテゴリ
 *      - amount: number - 学習時間（分数）
 *
 * 2. Term - 語句データ
 *    - 日本語: 学習対象となる単語・用語の情報を格納するデータ構造
 *    - English: Data structure storing information about words/terms to be learned
 *    - プロパティ:
 *      - id: string - 語句の一意の識別子（Firestore document ID）
 *      - category: CategoryKey - 語句が属するカテゴリ
 *      - term: string - 語句（英単語や専門用語）
 *      - meaning: string - 語句の意味・説明
 *      - example?: string - 使用例・例文（オプション）
 *      - imageUrl?: string - カードに添付された画像のURL（オプション）
 *      - isFavorite?: boolean - お気に入り登録フラグ（オプション）
 *      - createdAt: string - 作成日時（ISO 8601形式）
 *      - updatedAt?: string - 更新日時（オプション、ISO 8601形式）
 *
 * 3. StudySession - 学習セッション
 *    - 日本語: 学習中の状態を管理するためのデータ構造
 *    - English: Data structure for managing study session state
 *    - プロパティ:
 *      - terms: Term[] - 学習対象の語句配列
 *      - currentIndex: number - 現在学習中の語句のインデックス
 *      - totalTerms: number - 総語句数
 *      - isActive: boolean - セッションがアクティブかどうか
 *      - showAnswer: boolean - 答えを表示するかどうか
 *
 * ============================================================================
 * 🔗 依存関係 / Dependencies
 * ============================================================================
 *
 * インポート:
 * - CategoryKey from './data/categories' - カテゴリキーの型定義
 *
 * 使用箇所:
 * - すべてのReactコンポーネント
 * - すべてのカスタムフック (useTermsFirestore, useTerms, etc.)
 * - App.tsx (メインアプリケーション)
 *
 * ============================================================================
 * 📝 使用例 / Usage Examples
 * ============================================================================
 *
 * // 学習ログの作成
 * const studyLog: StudyLog = {
 *   date: "2025-11-02",
 *   category: "english",
 *   amount: 60
 * };
 *
 * // 語句データの作成
 * const term: Term = {
 *   id: "abc123",
 *   category: "english",
 *   term: "resilient",
 *   meaning: "回復力のある、弾力性のある",
 *   example: "The economy proved to be resilient during the crisis.",
 *   imageUrl: "https://example.com/image.jpg",
 *   isFavorite: true,
 *   createdAt: "2025-11-02T10:00:00Z"
 * };
 *
 * // 学習セッションの作成
 * const session: StudySession = {
 *   terms: [term1, term2, term3],
 *   currentIndex: 0,
 *   totalTerms: 3,
 *   isActive: true,
 *   showAnswer: false
 * };
 *
 * ============================================================================
 */

/**
 * 学習ログの型定義
 * ユーザーの学習活動を記録するためのデータ構造
 *
 * @interface StudyLog
 * @property {string} id - 学習ログの一意の識別子（Firestore document ID）
 * @property {string} date - 学習日付（YYYY-MM-DD形式）
 * @property {string} category - 学習したカテゴリ
 * @property {number} amount - 学習時間（分数）
 * @property {number} [termsCount] - その日に追加した語句数（オプション）
 * @property {string} createdAt - 作成日時（ISO 8601形式）
 * @property {string} updatedAt - 更新日時（ISO 8601形式）
 *
 * @example
 * ```typescript
 * const studyLog: StudyLog = {
 *   id: "abc123",
 *   date: "2025-09-01",
 *   category: "programming",
 *   amount: 60,
 *   termsCount: 5,
 *   createdAt: "2025-09-01T10:00:00Z",
 *   updatedAt: "2025-09-01T10:00:00Z"
 * };
 * ```
 */
export interface StudyLog {
  id: string; // Firestore document ID
  date: string; // YYYY-MM-DD
  category: string;
  amount: number; // 分数
  termsCount?: number; // その日に追加した語句数
  createdAt: string; // ISO 8601形式
  updatedAt: string; // ISO 8601形式
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
  id: string;  // Firestore document ID (string)
  category: CategoryKey;
  term: string;
  meaning: string;
  example?: string;
  imageUrl?: string;  // カードに添付された画像のURL
  isFavorite?: boolean;  // お気に入り登録フラグ
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
