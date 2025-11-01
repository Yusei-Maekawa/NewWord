/**
 * src/hooks/useTermsFirestore.ts
 *
 * 日本語:
 * Firestore を使用した語句データ管理カスタムフック。
 * - useTerms の Firestore 版で、リアルタイム同期機能付き
 * - CRUD 操作はすべて Firestore に対して実行
 * - リアルタイムリスナーで自動的にデータを同期
 *
 * English:
 * Custom hook for managing term data using Firestore.
 * - Firestore version of useTerms with real-time sync
 * - All CRUD operations are executed against Firestore
 * - Automatic data sync via real-time listener
 *
 * Export / TOC:
 * - useTermsFirestore: main hook function
 * - convertFirestoreToTerm: helper to convert Firestore doc to Term type
 *
 * 変数・関数の詳細 (Variables / Functions):
 *
 * useTermsFirestore (exported function)
 * - 日本語: Firestore からリアルタイムで語句データを取得・管理するカスタムフック。
 *           CRUD 操作とカテゴリ別フィルタリング、検索機能を提供します。
 * - English: Custom hook to fetch and manage term data from Firestore in real-time.
 *            Provides CRUD operations, category filtering, and search functionality.
 * - Returns: { terms, loading, error, addTerm, updateTerm, deleteTerm, getTermsByCategory, searchTerms }
 * - Usage: const { terms, addTerm } = useTermsFirestore();
 *
 * convertFirestoreToTerm (helper function)
 * - 日本語: Firestore ドキュメントを Term 型に変換するヘルパー関数。
 * - English: Helper function to convert Firestore document to Term type.
 * - Inputs: doc (QueryDocumentSnapshot)
 * - Returns: Term
 */

import { useState, useEffect } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../firebaseClient';
import { Term } from '../types';

/**
 * Firestore ドキュメントを Term 型に変換
 * Japanese: Firestore のドキュメントスナップショットを Term インターフェースに変換します。
 * English: Converts a Firestore document snapshot to a Term interface.
 */
const convertFirestoreToTerm = (docData: any, docId: string): Term => {
  return {
    id: docId,  // Firestore のドキュメント ID をそのまま使用
    category: docData.categoryId || docData.category || 'uncategorized',
    term: docData.word || docData.term || '',
    meaning: docData.meaning || '',
    example: docData.example || '',
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

  /**
   * Firestore リアルタイムリスナーをセットアップ
   * Japanese: コンポーネントマウント時に Firestore の terms コレクションにリスナーを設定します。
   * English: Sets up a Firestore listener on the terms collection when component mounts.
   */
  useEffect(() => {
    const termsRef = collection(db, 'terms');
    const q = query(termsRef, orderBy('created_at', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedTerms: Term[] = [];
        snapshot.forEach((doc) => {
          fetchedTerms.push(convertFirestoreToTerm(doc.data(), doc.id));
        });
        setTerms(fetchedTerms);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Firestore listener error:', err);
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
      await addDoc(collection(db, 'terms'), {
        word: termData.term,
        meaning: termData.meaning,
        example: termData.example || '',
        categoryId: termData.category,
        created_at: Timestamp.now()
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
        updated_at: Timestamp.now()
      });
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
      await deleteDoc(doc(db, 'terms', id));  // 文字列 ID をそのまま使用
    } catch (err: any) {
      console.error('Failed to delete term:', err);
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
    getTermsByCategory,
    searchTerms
  };
};
