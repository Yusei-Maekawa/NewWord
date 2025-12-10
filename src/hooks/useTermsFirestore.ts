/**
 * src/hooks/useTermsFirestore.ts
 *
 * ============================================================================
 * 📖 ファイル概要 / File Overview
 * ============================================================================
 *
 * 【日本語】
 * Firestoreを使用した語句データ管理カスタムフック。
 * useTermsのFirestore版で、リアルタイム同期機能を提供します。
 * すべてのCRUD操作（作成、読取、更新、削除）をFirestoreに対して実行し、
 * onSnapshotリスナーで自動的にデータを同期します。
 *
 * 【主な機能】
 * 1. 語句データのリアルタイム取得・同期
 * 2. 語句の追加・編集・削除
 * 3. カテゴリ別フィルタリング
 * 4. 語句検索（term, meaning, exampleから）
 * 5. お気に入り機能（toggleFavorite）
 * 6. 作成日時の自動記録
 *
 * 【English】
 * Custom hook for managing term data using Firestore.
 * Firestore version of useTerms with real-time synchronization.
 * Executes all CRUD operations (Create, Read, Update, Delete) against Firestore
 * and automatically syncs data via onSnapshot listener.
 *
 * 【Key Features】
 * 1. Real-time fetch and sync of term data
 * 2. Add, edit, and delete terms
 * 3. Filter by category
 * 4. Search terms (from term, meaning, example fields)
 * 5. Favorite functionality (toggleFavorite)
 * 6. Automatic creation timestamp recording
 *
 * ============================================================================
 * 🔧 関数リスト / Function List
 * ============================================================================
 *
 * 【エクスポート関数 / Exported Functions】
 *
 * 1. useTermsFirestore(): Hook返却値
 *    - 日本語: Firestoreから語句データを取得・管理するメインフック
 *    - English: Main hook to fetch and manage term data from Firestore
 *    - 戻り値 / Returns:
 *      - terms: Term[] - 語句データ配列
 *      - loading: boolean - データ読み込み中フラグ
 *      - error: string | null - エラーメッセージ
 *      - addTerm: (term) => Promise<void> - 語句追加関数
 *      - updateTerm: (id, term) => Promise<void> - 語句更新関数
 *      - deleteTerm: (id) => Promise<void> - 語句削除関数
 *      - toggleFavorite: (id) => Promise<void> - お気に入り切り替え関数
 *      - getTermsByCategory: (category) => Term[] - カテゴリ別取得関数
 *      - searchTerms: (query) => Term[] - 語句検索関数
 *
 * 2. addTerm(termData: Omit<Term, 'id' | 'createdAt'>): Promise<void>
 *    - 日本語: 新しい語句をFirestoreに追加
 *    - English: Add new term to Firestore
 *    - 引数: termData - 語句データ（idとcreatedAtを除く）
 *
 * 3. updateTerm(id: string, termData: Partial<Term>): Promise<void>
 *    - 日本語: 既存の語句を更新
 *    - English: Update existing term
 *    - 引数: id - 語句ID、termData - 更新するデータ
 *
 * 4. deleteTerm(id: string): Promise<void>
 *    - 日本語: 語句を削除
 *    - English: Delete term
 *    - 引数: id - 削除する語句のID
 *
 * 5. toggleFavorite(id: string): Promise<void>
 *    - 日本語: 語句のお気に入り状態を切り替え
 *    - English: Toggle term's favorite status
 *    - 引数: id - 語句ID
 *
 * 6. getTermsByCategory(category: string): Term[]
 *    - 日本語: 指定カテゴリの語句を取得
 *    - English: Get terms by category
 *    - 引数: category - カテゴリキー
 *    - 戻り値: 該当カテゴリの語句配列
 *
 * 7. searchTerms(query: string): Term[]
 *    - 日本語: 語句を検索（term, meaning, exampleから部分一致）
 *    - English: Search terms (partial match from term, meaning, example)
 *    - 引数: query - 検索クエリ
 *    - 戻り値: 検索結果の語句配列
 *
 * 【内部関数 / Internal Functions】
 *
 * 8. convertFirestoreToTerm(docData: any, docId: string): Term
 *    - 日本語: Firestoreドキュメントスナップショットをterm型に変換
 *    - English: Convert Firestore document snapshot to Term type
 *    - 引数: docData - Firestoreドキュメントデータ、docId - ドキュメントID
 *    - 戻り値: Term型オブジェクト
 *
 * ============================================================================
 * 📊 データフロー / Data Flow
 * ============================================================================
 *
 * 1. 初期化フロー:
 *    useEffect起動 → Firestoreリスナー設定 → onSnapshot →
 *    → データ取得 → convertFirestoreToTerm() → 状態更新
 *
 * 2. 追加フロー:
 *    addTerm() → Firestore addDoc() → onSnapshotで自動再取得 → 状態更新
 *
 * 3. 更新フロー:
 *    updateTerm() → Firestore updateDoc() → onSnapshotで自動再取得 → 状態更新
 *
 * 4. 削除フロー:
 *    deleteTerm() → Firestore deleteDoc() → onSnapshotで自動再取得 → 状態更新
 *
 * 5. お気に入りフロー:
 *    toggleFavorite() → isFavorite反転 → Firestore updateDoc() →
 *    → onSnapshotで自動再取得 → 状態更新
 *
 * ============================================================================
 * 🔗 依存関係 / Dependencies
 * ============================================================================
 *
 * Firebase:
 * - collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, Timestamp
 *
 * 内部:
 * - db from '../firebaseClient' - Firestoreインスタンス
 * - Term from '../types' - Term型定義
 *
 * ============================================================================
 *
 * @author Yusei Maekawa
 * @version 0.3.0
 * @since 2025-11-01
 * @updated 2025-11-02
 */

import { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../firebaseClient';
import { Term } from '../types';
import { CategoryKey } from '../data/categories';
import { useActivityLogs } from './useActivityLogs';
import { getJSTTimestamp } from '../utils/dateUtils';

/**
 * Firestore ドキュメントを Term 型に変換
 * Japanese: Firestore のドキュメントスナップショットを Term インターフェースに変換します。
 * English: Converts a Firestore document snapshot to a Term interface.
 */
const convertFirestoreToTerm = (docData: any, docId: string): Term => {
  return {
    id: docId,  // Firestore のドキュメント ID をそのまま使用
    category: (docData.categoryId || docData.category || 'uncategorized') as CategoryKey,
    term: docData.word || docData.term || '',
    meaning: docData.meaning || '',
    example: docData.example || '',
    imageUrl: docData.imageUrl || docData.image_url,  // 画像URL
    isFavorite: docData.isFavorite || docData.is_favorite || false,  // お気に入りフラグ
    createdAt: docData.created_at?.toDate?.()?.toISOString() || new Date().toISOString(),
    updatedAt: docData.updated_at?.toDate?.()?.toISOString()
  };
};

/**
 * Firestore を使用した語句データ管理フック
 * Japanese: Firestore からリアルタイムで語句を取得し、CRUD 操作を提供します。
 * English: Fetches terms from Firestore in real-time and provides CRUD operations.
 */
export const useTermsFirestore = () => {
  const [terms, setTerms] = useState<Term[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { logActivity } = useActivityLogs(); // 行動ログシステムを統合

  /**
   * Firestore リアルタイムリスナーをセットアップ
   * Japanese: コンポーネントマウント時に Firestore の terms コレクションにリスナーを設定します。
   * English: Sets up a Firestore listener on the terms collection when component mounts.
   */
  useEffect(() => {
    console.log('🔥 useTermsFirestore: Firestore リスナー開始...');
    const termsRef = collection(db, 'terms');
    const q = query(termsRef, orderBy('created_at', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        console.log(`🔥 useTermsFirestore: データ取得成功 - ${snapshot.size}件`);
        const fetchedTerms: Term[] = [];
        snapshot.forEach((doc) => {
          const termData = convertFirestoreToTerm(doc.data(), doc.id);
          console.log('📝 取得した用語:', termData.term, '(', termData.category, ')');
          fetchedTerms.push(termData);
        });
        console.log('✅ useTermsFirestore: 合計', fetchedTerms.length, '件の用語をセット');
        setTerms(fetchedTerms);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('❌ Firestore listener error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  /**
   * 新しい語句を追加
   * Japanese: Firestore の terms コレクションに新しいドキュメントを追加します。
   * English: Adds a new document to the Firestore terms collection.
   */
  const addTerm = async (termData: Omit<Term, 'id' | 'createdAt'>) => {
    try {
      const docRef = await addDoc(collection(db, 'terms'), {
        word: termData.term,
        meaning: termData.meaning,
        example: termData.example || '',
        categoryId: termData.category,
        created_at: getJSTTimestamp()  // 日本時間で保存
      });
      
      // 行動ログを記録: 語句追加アクティビティ
      await logActivity('add_term', termData.category, {
        termId: docRef.id,
        term: termData.term
      });
    } catch (err: any) {
      console.error('Failed to add term:', err);
      setError(err.message);
    }
  };

  /**
   * 既存の語句を更新
   * Japanese: 指定された ID の語句ドキュメントを更新します。
   * English: Updates the term document with the specified ID.
   */
  const updateTerm = async (id: string, termData: Omit<Term, 'id' | 'createdAt'>) => {
    try {
      const termRef = doc(db, 'terms', id);  // 文字列 ID をそのまま使用
      await updateDoc(termRef, {
        word: termData.term,
        meaning: termData.meaning,
        example: termData.example || '',
        categoryId: termData.category,
        updated_at: getJSTTimestamp()  // 日本時間で保存
      });
      // 行動ログを記録: 語句更新
      try {
        await logActivity('update_term', termData.category, {
          termId: id,
          term: termData.term
        });
      } catch (logErr) {
        console.warn('Failed to log update_term activity:', logErr);
      }
    } catch (err: any) {
      console.error('Failed to update term:', err);
      setError(err.message);
    }
  };

  /**
   * 語句を削除
   * Japanese: 指定された ID の語句ドキュメントを削除します。
   * English: Deletes the term document with the specified ID.
   */
  const deleteTerm = async (id: string) => {
    try {
      // 先にローカルのterms配列から語句情報を探す（ログ用）
      const termToDelete = terms.find(t => t.id === id);
      const categoryKey = termToDelete?.category || 'all';
      const termName = termToDelete?.term || '';

      await deleteDoc(doc(db, 'terms', id));  // 文字列 ID をそのまま使用

      // 行動ログを記録: 語句削除
      try {
        await logActivity('delete_term', categoryKey, {
          termId: id,
          term: termName
        });
      } catch (logErr) {
        console.warn('Failed to log delete_term activity:', logErr);
      }
    } catch (err: any) {
      console.error('Failed to delete term:', err);
      setError(err.message);
    }
  };

  /**
   * お気に入りをトグル
   * Japanese: 指定された ID の語句のお気に入り状態を切り替えます。
   * English: Toggles the favorite status of the term with the specified ID.
   */
  const toggleFavorite = async (id: string) => {
    try {
      const term = terms.find(t => t.id === id);
      if (!term) return;

      await updateDoc(doc(db, 'terms', id), {
        isFavorite: !term.isFavorite,
        updated_at: getJSTTimestamp()  // 日本時間で保存
      });
      // 行動ログを記録: お気に入り切替
      try {
        await logActivity('toggle_favorite', term.category, {
          termId: id,
          isFavorite: !term.isFavorite
        });
      } catch (logErr) {
        console.warn('Failed to log toggle_favorite activity:', logErr);
      }
    } catch (err: any) {
      console.error('Failed to toggle favorite:', err);
      setError(err.message);
    }
  };

  /**
   * カテゴリ別に語句を取得
   * Japanese: 指定されたカテゴリの語句のみをフィルタリングして返します。
   * English: Filters and returns terms belonging to the specified category.
   */
  const getTermsByCategory = (category: string): Term[] => {
    if (category === 'all') return terms;
    return terms.filter(term => term.category === category);
  };

  /**
   * 語句を検索
   * Japanese: クエリ文字列でterm, meaning, exampleを検索し、結果を返します。
   * English: Searches term, meaning, and example fields with the query string and returns results.
   */
  const searchTerms = (query: string, category: string = 'all'): Term[] => {
    const filteredTerms = getTermsByCategory(category);
    if (!query) return filteredTerms;

    const lowerQuery = query.toLowerCase();
    return filteredTerms.filter(term =>
      term.term.toLowerCase().includes(lowerQuery) ||
      term.meaning.toLowerCase().includes(lowerQuery) ||
      (term.example && term.example.toLowerCase().includes(lowerQuery))
    );
  };

  return {
    terms,
    loading,
    error,
    addTerm,
    updateTerm,
    deleteTerm,
    toggleFavorite,
    getTermsByCategory,
    searchTerms
  };
};
