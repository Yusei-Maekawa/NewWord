/**
 * @fileoverview 語句データ管理カスタムフック
 *
 * このフックは、語句データのCRUD操作と状態管理を提供します。
 * ローカルストレージを使用した永続化機能も備えています。
 *
 * @author Yusei Maekawa
 * @version 1.0.0
 * @since 2025-08-01
 */

/**
 * @typedef {Object} UseTermsReturn
 * @property {Term[]} terms - 語句データの配列
 * @property {(termData: Omit<Term, 'id' | 'createdAt'>) => void} addTerm - 語句追加関数
 * @property {(id: number, termData: Omit<Term, 'id' | 'createdAt'>) => void} updateTerm - 語句更新関数
 * @property {(id: number) => void} deleteTerm - 語句削除関数
 * @property {(category: string) => Term[]} getTermsByCategory - カテゴリ別語句取得関数
 */

import { useState, useEffect } from 'react';
import { Term } from '../types';

/**
 * ローカルストレージのキー定数
 * @constant {string}
 */
const STORAGE_KEY = 'studyTerms';

/**
 * 語句データ管理カスタムフック
 *
 * 主な機能：
 * - 語句データのCRUD操作
 * - ローカルストレージによる永続化
 * - カテゴリ別フィルタリング
 * - 自動ID生成とタイムスタンプ管理
 *
 * @returns {UseTermsReturn} 語句管理用の状態と関数群
 *
 * @example
 * ```typescript
 * const { terms, addTerm, updateTerm, deleteTerm } = useTerms();
 *
 * // 新しい語句を追加
 * addTerm({
 *   category: 'programming',
 *   term: 'closure',
 *   meaning: '関数とその関数が定義されたスコープへの参照',
 *   example: 'JavaScriptのクロージャーは変数のスコープを保持する'
 * });
 *
 * // 語句を更新
 * updateTerm(123, {
 *   term: 'updated term',
 *   meaning: 'updated meaning'
 * });
 *
 * // 語句を削除
 * deleteTerm(123);
 * ```
 */
export const useTerms = () => {
  /**
   * 語句データの状態
   * @type {[Term[], React.Dispatch<React.SetStateAction<Term[]>>]}
   */
  const [terms, setTerms] = useState<Term[]>([]);

  /**
   * ローカルストレージからデータを読み込み
   * コンポーネントマウント時に一度だけ実行される
   */
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setTerms(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to parse saved terms:', error);
      }
    }
  }, []);

  /**
   * データが変更されたらローカルストレージに保存
   * terms状態が変更されるたびに実行される
   */
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(terms));
  }, [terms]);

  /**
   * 新しい語句を追加する関数
   *
   * @param {Omit<Term, 'id' | 'createdAt'>} termData - 追加する語句データ（idとcreatedAtは自動生成）
   */
  const addTerm = (termData: Omit<Term, 'id' | 'createdAt'>) => {
    const newTerm: Term = {
      ...termData,
      id: Date.now(),  // タイムスタンプをIDとして使用
      createdAt: new Date().toISOString(),
    };
    setTerms(prev => [...prev, newTerm]);
  };

  /**
   * 既存の語句を更新する関数
   *
   * @param {number} id - 更新対象の語句ID
   * @param {Omit<Term, 'id' | 'createdAt'>} termData - 更新データ
   */
  const updateTerm = (id: number, termData: Omit<Term, 'id' | 'createdAt'>) => {
    setTerms(prev => prev.map(term =>
      term.id === id
        ? { ...term, ...termData, updatedAt: new Date().toISOString() }
        : term
    ));
  };

  /**
   * 語句を削除する関数
   *
   * @param {number} id - 削除対象の語句ID
   */
  const deleteTerm = (id: number) => {
    setTerms(prev => prev.filter(term => term.id !== id));
  };

  /**
   * カテゴリ別に語句を取得する関数
   *
   * @param {string} category - カテゴリキー（'all'の場合は全件取得）
   * @returns {Term[]} フィルタリングされた語句配列
   */
  const getTermsByCategory = (category: string) => {
    if (category === 'all') return terms;
    return terms.filter(term => term.category === category);
  };

  const searchTerms = (query: string, category: string = 'all') => {
    const filteredTerms = getTermsByCategory(category);
    if (!query) return filteredTerms;
    
    return filteredTerms.filter(term =>
      term.term.toLowerCase().includes(query.toLowerCase()) ||
      term.meaning.toLowerCase().includes(query.toLowerCase()) ||
      (term.example && term.example.toLowerCase().includes(query.toLowerCase()))
    );
  };

  return {
    terms,
    addTerm,
    updateTerm,
    deleteTerm,
    getTermsByCategory,
    searchTerms,
    setTerms
  };
};
