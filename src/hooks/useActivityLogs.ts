/**
 * src/hooks/useActivityLogs.ts
 *
 * ============================================================================
 * 📖 ファイル概要 / File Overview
 * ============================================================================
 *
 * 【日本語】
 * 行動履歴管理カスタムフック。
 * ユーザーの学習行動（語句追加・学習・復習）を記録し、
 * カレンダー表示や統計データの取得を提供します。
 * 
 * 【主な機能】
 * 1. 行動ログの作成・取得
 * 2. 日別サマリーの自動生成・更新
 * 3. 期間指定での行動ログ取得
 * 4. カテゴリ別・日別の統計データ取得
 *
 * 【English】
 * Custom hook for managing activity logs.
 * Records user learning activities (term addition, study, review)
 * and provides calendar display and statistics data.
 *
 * 【Key Features】
 * 1. Create and fetch activity logs
 * 2. Auto-generate and update daily summaries
 * 3. Fetch logs by date range
 * 4. Get statistics by category and date
 *
 * ============================================================================
 * 🔧 関数リスト / Function List
 * ============================================================================
 *
 * 【エクスポート関数 / Exported Functions】
 *
 * 1. useActivityLogs(): Hook返却値
 *    - activityLogs: ActivityLog[] - 行動ログ配列
 *    - loading: boolean - データ読み込み中フラグ
 *    - error: string | null - エラーメッセージ
 *    - logActivity: (type, category, data) => Promise<string> - 行動ログ作成
 *    - fetchLogs: (startDate, endDate) => Promise<ActivityLog[]> - ログ取得
 *    - fetchLogsByDate: (date) => Promise<ActivityLog[]> - 特定日のログ取得
 *
 * ============================================================================
 * 📊 データフロー / Data Flow
 * ============================================================================
 *
 * 1. 行動ログ作成フロー:
 *    logActivity() → Firestore addDoc() → updateDailySummary()
 *
 * 2. サマリー更新フロー:
 *    updateDailySummary() → Firestore getDoc() → 集計計算 → setDoc()
 *
 * ============================================================================
 * 🔗 依存関係 / Dependencies
 * ============================================================================
 *
 * Firebase:
 * - collection, addDoc, doc, getDoc, setDoc, query, where, orderBy, getDocs, Timestamp
 *
 * 内部:
 * - db from '../firebaseClient' - Firestoreインスタンス
 * - ActivityLog, DailySummary from '../types' - 型定義
 *
 * ============================================================================
 *
 * @author Yusei Maekawa
 * @version 1.0.0
 * @since 2025-11-15
 * @updated 2025-11-15
 */

import { useState } from 'react';
import {
  collection,
  addDoc,
  doc,
  getDoc,
  setDoc,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebaseClient';
import { ActivityLog, ActivityData, DailySummary, CategorySummary } from '../types';

/**
 * Firestore ActivityLog型（内部使用）
 */
interface FirestoreActivityLog {
  type: 'add_term' | 'study' | 'review';
  date: string;
  timestamp: Timestamp;
  category: string;
  data: ActivityData;
  createdAt: Timestamp;
}

/**
 * Firestore DailySummary型（内部使用）
 */
interface FirestoreDailySummary {
  date: string;
  totalStudyTime: number;
  termsAdded: number;
  termsReviewed: number;
  correctRate: number;
  byCategory: {
    [categoryKey: string]: CategorySummary;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Firestore ドキュメントを ActivityLog 型に変換
 */
const convertFirestoreToActivityLog = (docData: any, docId: string): ActivityLog => {
  return {
    id: docId,
    type: docData.type,
    date: docData.date,
    timestamp: docData.timestamp?.toDate?.()?.toISOString() || new Date().toISOString(),
    category: docData.category,
    data: docData.data,
    createdAt: docData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
  };
};

/**
 * Firestore ドキュメントを DailySummary 型に変換
 */
const convertFirestoreToDailySummary = (docData: any, docId: string): DailySummary => {
  return {
    id: docId,
    date: docData.date,
    totalStudyTime: docData.totalStudyTime || 0,
    termsAdded: docData.termsAdded || 0,
    termsReviewed: docData.termsReviewed || 0,
    correctRate: docData.correctRate || 0,
    byCategory: docData.byCategory || {},
    createdAt: docData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    updatedAt: docData.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
  };
};

/**
 * useActivityLogs - 行動履歴管理フック
 */
export const useActivityLogs = () => {
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * 行動ログを作成し、日別サマリーを更新
   * 
   * @param type - 行動の種類
   * @param category - カテゴリキー
   * @param data - 行動データ
   * @returns 作成されたログのID
   */
  const logActivity = async (
    type: 'add_term' | 'study' | 'review',
    category: string,
    data: ActivityData
  ): Promise<string> => {
    try {
      console.log('📊 logActivity開始:', { type, category, data });
      const now = new Date();
      const date = now.toISOString().split('T')[0];
      const timestamp = Timestamp.now();

      const activityLog: FirestoreActivityLog = {
        type,
        date,
        timestamp,
        category,
        data,
        createdAt: timestamp
      };

      console.log('📝 FirestoreへactivityLog保存中...', activityLog);
      // Firestoreに行動ログを保存
      const docRef = await addDoc(collection(db, 'activityLogs'), activityLog);
      console.log('✅ activityLog保存完了:', docRef.id);

      console.log('📊 dailySummary更新中...');
      // 日別サマリーを更新
      await updateDailySummary(date, type, category, data);
      console.log('✅ dailySummary更新完了');

      return docRef.id;
    } catch (err) {
      console.error('❌ 行動ログ作成エラー:', err);
      const errorMessage = err instanceof Error ? err.message : '行動ログの作成に失敗しました';
      setError(errorMessage);
      throw err;
    }
  };

  /**
   * 日別サマリーを更新
   * 
   * @param date - 日付（YYYY-MM-DD）
   * @param type - 行動の種類
   * @param category - カテゴリキー
   * @param data - 行動データ
   */
  const updateDailySummary = async (
    date: string,
    type: 'add_term' | 'study' | 'review',
    category: string,
    data: ActivityData
  ) => {
    try {
      const summaryRef = doc(db, 'dailySummaries', date);
      const summarySnap = await getDoc(summaryRef);

      let summaryData: FirestoreDailySummary;

      if (summarySnap.exists()) {
        // 既存のサマリーを更新
        const existing = summarySnap.data() as FirestoreDailySummary;
        const categorySummary = existing.byCategory[category] || {
          studyTime: 0,
          termsAdded: 0,
          termsReviewed: 0,
          correctCount: 0,
          incorrectCount: 0
        };

        // 行動の種類に応じて集計を更新
        if (type === 'add_term') {
          categorySummary.termsAdded += 1;
          existing.termsAdded += 1;
        } else if (type === 'study') {
          const studyData = data as { duration: number };
          categorySummary.studyTime += studyData.duration;
          existing.totalStudyTime += studyData.duration;
        } else if (type === 'review') {
          const reviewData = data as { termId: string; term: string; isCorrect: boolean };
          categorySummary.termsReviewed += 1;
          existing.termsReviewed += 1;
          
          if (reviewData.isCorrect) {
            categorySummary.correctCount += 1;
          } else {
            categorySummary.incorrectCount += 1;
          }

          // 正解率を再計算
          const totalReviewed = categorySummary.correctCount + categorySummary.incorrectCount;
          if (totalReviewed > 0) {
            existing.correctRate = Math.round((categorySummary.correctCount / totalReviewed) * 100);
          }
        }

        existing.byCategory[category] = categorySummary;
        existing.updatedAt = Timestamp.now();
        summaryData = existing;
      } else {
        // 新規サマリーを作成
        const categorySummary: CategorySummary = {
          studyTime: type === 'study' ? (data as { duration: number }).duration : 0,
          termsAdded: type === 'add_term' ? 1 : 0,
          termsReviewed: type === 'review' ? 1 : 0,
          correctCount: type === 'review' && (data as { isCorrect: boolean }).isCorrect ? 1 : 0,
          incorrectCount: type === 'review' && !(data as { isCorrect: boolean }).isCorrect ? 1 : 0
        };

        summaryData = {
          date,
          totalStudyTime: type === 'study' ? (data as { duration: number }).duration : 0,
          termsAdded: type === 'add_term' ? 1 : 0,
          termsReviewed: type === 'review' ? 1 : 0,
          correctRate: type === 'review' 
            ? ((data as { isCorrect: boolean }).isCorrect ? 100 : 0)
            : 0,
          byCategory: { [category]: categorySummary },
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };
      }

      await setDoc(summaryRef, summaryData);
    } catch (err) {
      console.error('日別サマリー更新エラー:', err);
      throw err;
    }
  };

  /**
   * 指定期間の行動ログを取得
   * 
   * @param startDate - 開始日（YYYY-MM-DD）
   * @param endDate - 終了日（YYYY-MM-DD）
   * @returns 行動ログ配列
   */
  const fetchLogs = async (startDate: string, endDate: string): Promise<ActivityLog[]> => {
    try {
      setLoading(true);
      const logsRef = collection(db, 'activityLogs');
      const q = query(
        logsRef,
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date', 'desc'),
        orderBy('timestamp', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const logs = querySnapshot.docs.map(doc =>
        convertFirestoreToActivityLog(doc.data(), doc.id)
      );

      setActivityLogs(logs);
      setError(null);
      return logs;
    } catch (err) {
      console.error('行動ログ取得エラー:', err);
      const errorMessage = err instanceof Error ? err.message : '行動ログの取得に失敗しました';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * 特定日の行動ログを取得
   * 
   * @param date - 日付（YYYY-MM-DD）
   * @returns 行動ログ配列
   */
  const fetchLogsByDate = async (date: string): Promise<ActivityLog[]> => {
    try {
      setLoading(true);
      const logsRef = collection(db, 'activityLogs');
      const q = query(
        logsRef,
        where('date', '==', date),
        orderBy('timestamp', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const logs = querySnapshot.docs.map(doc =>
        convertFirestoreToActivityLog(doc.data(), doc.id)
      );

      setError(null);
      return logs;
    } catch (err) {
      console.error('行動ログ取得エラー:', err);
      const errorMessage = err instanceof Error ? err.message : '行動ログの取得に失敗しました';
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * 日別サマリーを取得
   * 
   * @param date - 日付（YYYY-MM-DD）
   * @returns 日別サマリー（存在しない場合はnull）
   */
  const fetchDailySummary = async (date: string): Promise<DailySummary | null> => {
    try {
      const summaryRef = doc(db, 'dailySummaries', date);
      const summarySnap = await getDoc(summaryRef);

      if (summarySnap.exists()) {
        return convertFirestoreToDailySummary(summarySnap.data(), summarySnap.id);
      }
      return null;
    } catch (err) {
      console.error('日別サマリー取得エラー:', err);
      return null;
    }
  };

  return {
    activityLogs,
    loading,
    error,
    logActivity,
    fetchLogs,
    fetchLogsByDate,
    fetchDailySummary
  };
};
