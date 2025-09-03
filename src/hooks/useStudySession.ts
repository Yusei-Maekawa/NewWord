/**
 * @fileoverview 学習セッション管理カスタムフック
 *
 * このフックは、フラッシュカード形式の学習セッションを管理します。
 * 語句のシャッフル、進捗管理、セッション制御を提供します。
 *
 * @author Yusei Maekawa
 * @version 1.0.0
 * @since 2025-08-01
 */

/**
 * @typedef {Object} UseStudySessionReturn
 * @property {StudySession} session - 現在の学習セッション状態
 * @property {(terms: Term[]) => boolean} startSession - 学習セッション開始関数
 * @property {() => void} showAnswer - 答えを表示する関数
 * @property {() => void} nextTerm - 次の語句へ移動する関数
 * @property {() => void} endSession - 学習セッション終了関数
 * @property {() => Term | null} getCurrentTerm - 現在の学習語句を取得する関数
 * @property {() => {current: number, total: number, percentage: number}} getProgress - 学習進捗を取得する関数
 * @property {() => boolean} isSessionComplete - セッション完了判定関数
 */

import { useState, useCallback } from 'react';
import { Term, StudySession } from '../types';

/**
 * 学習セッション管理カスタムフック
 *
 * 主な機能：
 * - 学習セッションの開始・終了管理
 * - 語句のランダムシャッフル
 * - 学習進捗の追跡
 * - 答えの表示/非表示制御
 * - 次の語句への移動
 *
 * @returns {UseStudySessionReturn} 学習セッション管理用の状態と関数群
 *
 * @example
 * ```typescript
 * const {
 *   session,
 *   startSession,
 *   showAnswer,
 *   nextTerm,
 *   getCurrentTerm,
 *   getProgress
 * } = useStudySession();
 *
 * // 学習セッションを開始
 * const success = startSession(filteredTerms);
 * if (success) {
 *   console.log('学習を開始しました');
 * }
 *
 * // 現在の語句を取得
 * const currentTerm = getCurrentTerm();
 *
 * // 進捗を取得
 * const progress = getProgress();
 * console.log(`${progress.current}/${progress.total} (${progress.percentage}%)`);
 * ```
 */
export const useStudySession = () => {
  /**
   * 学習セッションの状態
   * @type {[StudySession, React.Dispatch<React.SetStateAction<StudySession>>]}
   */
  const [session, setSession] = useState<StudySession>({
    terms: [],
    currentIndex: 0,
    totalTerms: 0,
    isActive: false,
    showAnswer: false
  });

  /**
   * 配列をシャッフルするヘルパー関数
   * Fisher-Yatesアルゴリズムを使用した効率的なシャッフル
   *
   * @param {Term[]} array - シャッフル対象の語句配列
   * @returns {Term[]} シャッフルされた新しい配列
   */
  const shuffleArray = (array: Term[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  /**
   * 学習セッションを開始する関数
   * 語句をシャッフルしてセッションを開始します
   *
   * @param {Term[]} terms - 学習対象の語句配列
   * @returns {boolean} セッション開始が成功したかどうか
   */
  const startSession = useCallback((terms: Term[]) => {
    if (terms.length === 0) return false;

    const shuffledTerms = shuffleArray(terms);
    setSession({
      terms: shuffledTerms,
      currentIndex: 0,
      totalTerms: shuffledTerms.length,
      isActive: true,
      showAnswer: false
    });
    return true;
  }, []);

  /**
   * 答えを表示する関数
   * 現在の語句の答えを表示状態にします
   */
  const showAnswer = useCallback(() => {
    setSession(prev => ({ ...prev, showAnswer: true }));
  }, []);

  /**
   * 次の語句へ移動する関数
   * インデックスを進め、答えを非表示にします
   */
  const nextTerm = useCallback(() => {
    setSession(prev => ({
      ...prev,
      currentIndex: prev.currentIndex + 1,
      showAnswer: false
    }));
  }, []);

  /**
   * 学習セッションを終了する関数
   * セッション状態を初期化します
   */
  const endSession = useCallback(() => {
    setSession({
      terms: [],
      currentIndex: 0,
      totalTerms: 0,
      isActive: false,
      showAnswer: false
    });
  }, []);

  const getCurrentTerm = () => {
    if (!session.isActive || session.currentIndex >= session.terms.length) {
      return null;
    }
    return session.terms[session.currentIndex];
  };

  const getProgress = () => {
    if (!session.isActive) return { current: 0, total: 0, percentage: 0 };
    
    return {
      current: session.currentIndex + 1,
      total: session.totalTerms,
      percentage: Math.round(((session.currentIndex + 1) / session.totalTerms) * 100)
    };
  };

  const isSessionComplete = () => {
    return session.isActive && session.currentIndex >= session.terms.length;
  };

  return {
    session,
    startSession,
    showAnswer,
    nextTerm,
    endSession,
    getCurrentTerm,
    getProgress,
    isSessionComplete
  };
};
