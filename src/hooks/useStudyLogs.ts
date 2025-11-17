/**
 * src/hooks/useStudyLogs.ts
 *
 * ============================================================================
 * 📖 ファイル概要 / File Overview
 * ============================================================================
 *
 * 【日本語】
 * Firestoreを使用した学習ログ管理カスタムフック。
 * 学習時間の記録、集計、統計データの取得を提供します。
 * リアルタイム同期により、複数デバイス間でのデータ同期を実現します。
 *
 * 【主な機能】
 * 1. 学習ログのリアルタイム取得・同期
 * 2. 学習ログの追加・編集・削除
 * 3. 日付・カテゴリ別の統計データ取得
 * 4. 週次・月次の学習時間集計
 * 5. 学習ストリーク（連続学習日数）の計算
 *
 * 【English】
 * Custom hook for managing study logs using Firestore.
 * Provides recording, aggregation, and statistics of study time.
 * Real-time synchronization enables data sync across multiple devices.
 *
 * 【Key Features】
 * 1. Real-time fetch and sync of study logs
 * 2. Add, edit, and delete study logs
 * 3. Get statistics by date and category
 * 4. Weekly/monthly study time aggregation
 * 5. Calculate study streak (consecutive study days)
 *
 * ============================================================================
 * 🔧 関数リスト / Function List
 * ============================================================================
 *
 * 【エクスポート関数 / Exported Functions】
 *
 * 1. useStudyLogs(): Hook返却値
 *    - 日本語: Firestoreから学習ログを取得・管理するメインフック
 *    - English: Main hook to fetch and manage study logs from Firestore
 *    - 戻り値 / Returns:
 *      - studyLogs: StudyLog[] - 学習ログ配列
 *      - loading: boolean - データ読み込み中フラグ
 *      - error: string | null - エラーメッセージ
 *      - addStudyLog: (log) => Promise<void> - 学習ログ追加関数
 *      - updateStudyLog: (id, log) => Promise<void> - 学習ログ更新関数
 *      - deleteStudyLog: (id) => Promise<void> - 学習ログ削除関数
 *      - getLogsByDateRange: (startDate, endDate) => StudyLog[] - 期間指定取得
 *      - getTotalStudyTime: (category?) => number - 総学習時間取得
 *      - getStudyStreak: () => number - 連続学習日数取得
 *
 * ============================================================================
 * 📊 データ構造 / Data Structure (Firestore)
 * ============================================================================
 *
 * コレクション名: studyLogs
 *
 * {
 *   id: string;              // ドキュメントID（自動生成）
 *   userId?: string;         // ユーザーID（将来の認証機能用、現在はnull）
 *   date: string;            // 学習日付（YYYY-MM-DD形式）
 *   category: string;        // 学習カテゴリ
 *   amount: number;          // 学習時間（分数）
 *   termsCount?: number;     // その日に追加した語句数
 *   createdAt: Timestamp;    // 作成日時
 *   updatedAt: Timestamp;    // 更新日時
 * }
 *
 * ============================================================================
 * 🔗 依存関係 / Dependencies
 * ============================================================================
 *
 * Firebase:
 * - collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, where, Timestamp
 *
 * 内部:
 * - db from '../firebaseClient' - Firestoreインスタンス
 * - StudyLog from '../types' - StudyLog型定義
 *
 * ============================================================================
 *
 * @author Yusei Maekawa
 * @version 1.0.0
 * @since 2025-11-13
 * @updated 2025-11-13
 */

import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  where,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebaseClient';
import { StudyLog } from '../types';

/**
 * Firestore StudyLog型（内部使用）
 * Firestoreに保存される形式（createdAt, updatedAtがTimestamp）
 */
interface FirestoreStudyLog {
  userId?: string;
  date: string;
  category: string;
  amount: number;
  termsCount?: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Firestore ドキュメントを StudyLog 型に変換
 * 
 * @param docData - Firestoreドキュメントデータ
 * @param docId - ドキュメントID
 * @returns StudyLog型オブジェクト
 */
const convertFirestoreToStudyLog = (docData: any, docId: string): StudyLog => {
  return {
    id: docId,
    date: docData.date || '',
    category: docData.category || '',
    amount: docData.amount || 0,
    termsCount: docData.termsCount,
    createdAt: docData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    updatedAt: docData.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
  };
};

/**
 * useStudyLogs - 学習ログ管理フック
 * 
 * Firestoreから学習ログを取得し、CRUD操作を提供します。
 * リアルタイムリスナーにより、データの自動同期を実現します。
 * 
 * @returns 学習ログデータと操作関数
 */
export const useStudyLogs = () => {
  const [studyLogs, setStudyLogs] = useState<StudyLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Firestoreからリアルタイムで学習ログを取得
  useEffect(() => {
    const q = query(
      collection(db, 'studyLogs'),
      orderBy('date', 'desc')  // 日付の降順でソート
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const logs: StudyLog[] = [];
        snapshot.forEach((doc) => {
          logs.push(convertFirestoreToStudyLog(doc.data(), doc.id));
        });
        setStudyLogs(logs);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching study logs:', err);
        setError('学習ログの取得に失敗しました。');
        setLoading(false);
      }
    );

    // クリーンアップ（コンポーネントアンマウント時にリスナー解除）
    return () => unsubscribe();
  }, []);

  /**
   * 新しい学習ログを追加
   * 
   * @param logData - 学習ログデータ（idを除く）
   */
  const addStudyLog = async (logData: Omit<StudyLog, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const now = Timestamp.now();
      const newLog: Omit<FirestoreStudyLog, 'userId'> = {
        date: logData.date,
        category: logData.category,
        amount: logData.amount,
        termsCount: logData.termsCount || 0, // デフォルト値を0に設定
        createdAt: now,
        updatedAt: now,
      };

      await addDoc(collection(db, 'studyLogs'), newLog);
    } catch (err) {
      console.error('Error adding study log:', err);
      setError('学習ログの追加に失敗しました。');
      throw err;
    }
  };

  /**
   * 学習ログを更新
   * 
   * @param id - 更新する学習ログのID
   * @param logData - 更新するデータ（部分更新可能）
   */
  const updateStudyLog = async (id: string, logData: Partial<Omit<StudyLog, 'id' | 'createdAt' | 'updatedAt'>>) => {
    try {
      const docRef = doc(db, 'studyLogs', id);
      await updateDoc(docRef, {
        ...logData,
        updatedAt: Timestamp.now(),
      });
    } catch (err) {
      console.error('Error updating study log:', err);
      setError('学習ログの更新に失敗しました。');
      throw err;
    }
  };

  /**
   * 学習ログを削除
   * 
   * @param id - 削除する学習ログのID
   */
  const deleteStudyLog = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'studyLogs', id));
    } catch (err) {
      console.error('Error deleting study log:', err);
      setError('学習ログの削除に失敗しました。');
      throw err;
    }
  };

  /**
   * 日付範囲を指定して学習ログを取得
   * 
   * @param startDate - 開始日（YYYY-MM-DD形式）
   * @param endDate - 終了日（YYYY-MM-DD形式）
   * @returns 指定期間内の学習ログ配列
   */
  const getLogsByDateRange = (startDate: string, endDate: string): StudyLog[] => {
    return studyLogs.filter(log => 
      log.date >= startDate && log.date <= endDate
    );
  };

  /**
   * 総学習時間を取得
   * 
   * @param category - カテゴリ指定（オプション）。指定しない場合は全カテゴリの合計
   * @returns 総学習時間（分数）
   */
  const getTotalStudyTime = (category?: string): number => {
    const filteredLogs = category 
      ? studyLogs.filter(log => log.category === category)
      : studyLogs;
    
    return filteredLogs.reduce((total, log) => total + log.amount, 0);
  };

  /**
   * 学習ストリーク（連続学習日数）を取得
   * 
   * @returns 連続学習日数
   */
  const getStudyStreak = (): number => {
    if (studyLogs.length === 0) return 0;

    // 日付でユニークにして降順ソート
    const uniqueDates = Array.from(new Set(studyLogs.map(log => log.date)))
      .sort((a, b) => b.localeCompare(a));

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < uniqueDates.length; i++) {
      const logDate = new Date(uniqueDates[i]);
      logDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      expectedDate.setHours(0, 0, 0, 0);

      if (logDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  /**
   * カテゴリ別の学習時間を取得
   * 
   * @returns カテゴリごとの学習時間マップ { カテゴリ名: 学習時間（分） }
   */
  const getStudyTimeByCategory = (): { [category: string]: number } => {
    const categoryTimes: { [category: string]: number } = {};
    
    studyLogs.forEach(log => {
      if (!categoryTimes[log.category]) {
        categoryTimes[log.category] = 0;
      }
      categoryTimes[log.category] += log.amount;
    });

    return categoryTimes;
  };

  /**
   * 週次の学習時間を取得（過去7日間）
   * 
   * @returns 週次学習時間（分数）
   */
  const getWeeklyStudyTime = (): number => {
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);

    const startDate = sevenDaysAgo.toISOString().split('T')[0];
    const endDate = today.toISOString().split('T')[0];

    return getLogsByDateRange(startDate, endDate)
      .reduce((total, log) => total + log.amount, 0);
  };

  /**
   * 月次の学習時間を取得（過去30日間）
   * 
   * @returns 月次学習時間（分数）
   */
  const getMonthlyStudyTime = (): number => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const startDate = thirtyDaysAgo.toISOString().split('T')[0];
    const endDate = today.toISOString().split('T')[0];

    return getLogsByDateRange(startDate, endDate)
      .reduce((total, log) => total + log.amount, 0);
  };

  return {
    studyLogs,
    loading,
    error,
    addStudyLog,
    updateStudyLog,
    deleteStudyLog,
    getLogsByDateRange,
    getTotalStudyTime,
    getStudyStreak,
    getStudyTimeByCategory,
    getWeeklyStudyTime,
    getMonthlyStudyTime,
  };
};
