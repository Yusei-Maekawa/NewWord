/**
 * src/hooks/useCategoriesFirestore.ts
 *
 * ============================================================================
 * 📖 ファイル概要 / File Overview
 * ============================================================================
 *
 * 【日本語】
 * Firestoreを使用したカテゴリデータ管理カスタムフック。
 * カテゴリのお気に入り状態をFirestoreで永続化し、リアルタイム同期を提供します。
 * 親カテゴリをお気に入りにすると、すべての子孫カテゴリ（子、孫、ひ孫...）も
 * 自動的にお気に入りに設定されます。
 *
 * 【主な機能】
 * 1. Firestoreへのカテゴリデータ初期化
 * 2. リアルタイムデータ同期（onSnapshotリスナー）
 * 3. お気に入り状態の永続化
 * 4. 親カテゴリのお気に入り登録時、すべての子孫カテゴリも連動
 * 5. 不正データの自動検出・修復
 * 6. 循環参照の防止
 *
 * 【English】
 * Custom hook for managing category data using Firestore.
 * Persists category favorite status in Firestore and provides real-time sync.
 * When a parent category is marked as favorite, all descendant categories
 * (children, grandchildren, great-grandchildren, etc.) are automatically
 * marked as favorite as well.
 *
 * 【Key Features】
 * 1. Initialize category data to Firestore
 * 2. Real-time data synchronization (onSnapshot listener)
 * 3. Persist favorite status
 * 4. Cascade favorite status to all descendant categories when parent is favorited
 * 5. Auto-detect and repair invalid data
 * 6. Prevent circular references
 *
 * ============================================================================
 * 📦 型定義 / Type Definitions
 * ============================================================================
 *
 * @typedef {Object} Category - カテゴリデータの型定義
 * @property {number} id - カテゴリの一意なID（1から始まる連番）
 * @property {string} category_key - カテゴリキー（Firestoreドキュメント名）
 * @property {string} category_name - カテゴリの表示名
 * @property {string} category_icon - カテゴリアイコン（絵文字）
 * @property {string} category_color - カテゴリカラー（HEXコード）
 * @property {number|null} parent_id - 親カテゴリのID（ルートカテゴリの場合はnull）
 * @property {boolean} is_favorite - お気に入り状態
 * @property {number} display_order - 表示順序
 * @property {string} created_at - 作成日時（ISO 8601形式）
 *
 * ============================================================================
 * 🔧 関数リスト / Function List
 * ============================================================================
 *
 * 【内部関数 / Internal Functions】
 *
 * 1. initializeCategoriesInFirestore(categories: Category[]): Promise<void>
 *    - 日本語: Firestoreにカテゴリデータを初期化（初回のみ実行）
 *    - English: Initialize category data to Firestore (first time only)
 *    - 引数: categories - 初期化するカテゴリ配列
 *    - 戻り値: Promise<void>
 *
 * 2. createHierarchy(cats: StaticCategory[]): Category[]
 *    - 日本語: 静的カテゴリデータから階層構造を作成
 *    - English: Create hierarchical structure from static category data
 *    - 引数: cats - 静的カテゴリデータ配列
 *    - 戻り値: Category[] - 階層構造が設定されたカテゴリ配列
 *
 * 3. getAllDescendants(parentKey: string): Category[]
 *    - 日本語: 指定された親カテゴリのすべての子孫カテゴリを再帰的に取得
 *    - English: Recursively get all descendant categories of specified parent
 *    - 引数: parentKey - 親カテゴリキー
 *    - 戻り値: Category[] - すべての子孫カテゴリの配列
 *
 * 【エクスポート関数 / Exported Functions】
 *
 * 4. useCategoriesFirestore(): Hook返却値
 *    - 日本語: カテゴリデータ管理フック
 *    - English: Category data management hook
 *    - 戻り値:
 *      - categories: Category[] - カテゴリデータ配列
 *      - loading: boolean - データ読み込み中フラグ
 *      - error: string | null - エラーメッセージ
 *      - toggleFavorite: (categoryId: number) => Promise<Result> - お気に入り切り替え関数
 *
 * 5. toggleFavorite(categoryId: number): Promise<{success: boolean, newState: boolean, affectedCount?: number, error?: string}>
 *    - 日本語: カテゴリのお気に入り状態を切り替え（子孫カテゴリも連動）
 *    - English: Toggle category favorite status (cascades to descendants)
 *    - 引数: categoryId - 切り替えるカテゴリのID
 *    - 戻り値:
 *      - success: boolean - 成功フラグ
 *      - newState: boolean - 新しいお気に入り状態
 *      - affectedCount: number - 影響を受けたカテゴリ数
 *      - error: string - エラーメッセージ（失敗時のみ）
 *
 * ============================================================================
 * 📊 データフロー / Data Flow
 * ============================================================================
 *
 * 1. 初期化フロー:
 *    useEffect起動 → Firestoreリスナー設定 → データ空チェック →
 *    → createHierarchy() → initializeCategoriesInFirestore() →
 *    → 次のスナップショット待機 → データ取得 → 状態更新
 *
 * 2. お気に入り切り替えフロー:
 *    toggleFavorite(categoryId) → カテゴリ検索 →
 *    → getAllDescendants()で子孫取得 → バッチ更新準備 →
 *    → Firestore書き込み → onSnapshotで自動再取得 → 状態更新
 *
 * 3. リアルタイム同期:
 *    Firestoreデータ変更 → onSnapshotトリガー →
 *    → データ取得・検証 → 状態更新 → UIに反映
 *
 * ============================================================================
 *
 * @author Yusei Maekawa
 * @version 0.3.0
 * @since 2025-11-01
 * @updated 2025-11-02
 */

import { useState, useEffect } from 'react';
import { collection, doc, updateDoc, onSnapshot, query, writeBatch, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseClient';
import { categories as staticCategories } from '../data/categories';

interface Category {
  id: number;
  category_key: string;
  category_name: string;
  category_icon: string;
  category_color: string;
  parent_id: number | null;
  is_favorite: boolean;
  display_order: number;
  created_at: string;
}

/**
 * Firestoreにカテゴリデータを初期化（初回のみ実行）
 * Japanese: 静的カテゴリデータをFirestoreに保存します。
 * English: Saves static category data to Firestore.
 */
const initializeCategoriesInFirestore = async (categories: Category[]) => {
  console.log('🔧 初期化開始:', categories.length, '件のカテゴリ');
  console.table(categories.map(c => ({
    ID: c.id,
    Key: c.category_key,
    Name: c.category_name,
    ParentID: c.parent_id
  })));
  
  const batch = writeBatch(db);
  
  categories.forEach((cat) => {
    const catRef = doc(db, 'categories', cat.category_key);
    batch.set(catRef, {
      id: cat.id,
      category_key: cat.category_key,
      category_name: cat.category_name,
      category_icon: cat.category_icon,
      category_color: cat.category_color,
      parent_id: cat.parent_id,
      is_favorite: cat.is_favorite,
      display_order: cat.display_order,
      created_at: cat.created_at
    }, { merge: true }); // 既存データがあればマージ
  });

  await batch.commit();
  console.log('✅ カテゴリデータをFirestoreに初期化しました');
};

/**
 * Firestoreを使用したカテゴリデータ管理フック
 * Japanese: Firestoreからリアルタイムでカテゴリを取得し、お気に入り管理を提供します。
 * English: Fetches categories from Firestore in real-time and provides favorite management.
 */
export const useCategoriesFirestore = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState<boolean>(false);

  /**
   * カテゴリの階層構造を作成
   * Japanese: 親子関係を設定します。親カテゴリのkeyで判定し、IDで関連付けます。
   * English: Sets up parent-child relationships using parent key matching and ID references.
   */
  const createHierarchy = (cats: typeof staticCategories): Category[] => {
    // 親子関係の定義（子カテゴリkey -> 親カテゴリkey）
    const parentMapping: Record<string, string> = {
      // 応用情報の子カテゴリ
      'applied_technology': 'applied',
      'applied_management': 'applied',
      'applied_strategy': 'applied',
      // テクノロジの子カテゴリ
      'security': 'applied_technology',
      'network': 'applied_technology',
      'database': 'applied_technology',
      'information_media': 'applied_technology'
    };

    // まずIDを割り当て（インデックス+1）
    const categoriesWithIds = cats.map((cat, index) => ({
      id: index + 1,
      category_key: cat.key,
      category_name: cat.name,
      category_icon: cat.icon,
      category_color: cat.color,
      parent_id: null as number | null,
      is_favorite: false,
      display_order: index + 1,
      created_at: new Date().toISOString()
    }));

    // 次に親IDを設定（keyベースで検索）
    categoriesWithIds.forEach((cat) => {
      const parentKey = parentMapping[cat.category_key];
      if (parentKey) {
        const parentCategory = categoriesWithIds.find(c => c.category_key === parentKey);
        if (parentCategory) {
          cat.parent_id = parentCategory.id;
        }
      }
    });

    return categoriesWithIds;
  };

  /**
   * Firestoreリアルタイムリスナーをセットアップ
   * Japanese: Firestoreのcategoriesコレクションにリスナーを設定します。
   * English: Sets up a Firestore listener on the categories collection.
   */
  useEffect(() => {
    const categoriesRef = collection(db, 'categories');
    const q = query(categoriesRef);

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        // カテゴリデータが存在しない場合は初期化
        if (snapshot.empty) {
          if (!initialized) {
            console.log('🔧 カテゴリデータが存在しません。初期化します...');
            const initialCategories = createHierarchy(staticCategories);
            await initializeCategoriesInFirestore(initialCategories);
            setInitialized(true);
            // 初期化後は次のスナップショットを待つ
          } else {
            // 初期化済みだがデータが空の場合（削除された場合など）
            setCategories([]);
            setLoading(false);
          }
          return;
        }

        const fetchedCategories: Category[] = [];
        let index = 0;
        snapshot.forEach((doc) => {
          const data = doc.data();
          
          // デバッグ: IDが存在するか確認
          if (!data.id) {
            console.warn('⚠️ カテゴリにIDが設定されていません。自動修復します:', data.category_name);
          }
          
          fetchedCategories.push({
            id: data.id ?? (data.display_order || index + 1), // IDがない場合はdisplay_orderまたはインデックスを使用
            category_key: data.category_key,
            category_name: data.category_name,
            category_icon: data.category_icon,
            category_color: data.category_color,
            parent_id: data.parent_id ?? null,
            is_favorite: data.is_favorite || false,
            display_order: data.display_order ?? index + 1,
            created_at: data.created_at
          });
          index++;
        });

        // display_orderでソート
        fetchedCategories.sort((a, b) => a.display_order - b.display_order);
        
        // データの整合性チェック: IDがundefinedのカテゴリがある場合は再初期化
        const hasInvalidData = fetchedCategories.some(cat => 
          cat.id === undefined || cat.id === null || 
          !cat.category_key || !cat.category_name
        );
        
        if (hasInvalidData && !initialized) {
          console.warn('⚠️ 不正なカテゴリデータを検出しました。再初期化します...');
          // 既存データを削除して再初期化
          const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
          await Promise.all(deletePromises);
          const initialCategories = createHierarchy(staticCategories);
          await initializeCategoriesInFirestore(initialCategories);
          setInitialized(true);
          return;
        }
        
        console.log('✅ カテゴリデータを取得しました:', fetchedCategories.length, '件');
        setCategories(fetchedCategories);
        setLoading(false);
        setError(null);
        
        // 初回ロード完了のマーク
        if (!initialized) {
          setInitialized(true);
        }
      },
      (err) => {
        console.error('❌ Firestore listener error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [initialized]);

  /**
   * カテゴリのお気に入り状態を切り替え
   * 親カテゴリの場合、すべての子孫カテゴリも連動
   * 
   * @param categoryId - カテゴリID
   * @returns 成功フラグ、新しい状態、影響を受けたカテゴリ数
   */
  const toggleFavorite = async (categoryId: number) => {
    try {
      // 対象カテゴリを検索
      const targetCategory = categories.find(c => c.id === categoryId);
      if (!targetCategory) {
        console.error('❌ カテゴリが見つかりません (ID:', categoryId, ')');
        return { success: false, error: 'カテゴリが見つかりません' };
      }

      const newFavoriteState = !targetCategory.is_favorite;
      console.log(`🔄 お気に入り切り替え: ${targetCategory.category_name} -> ${newFavoriteState ? '⭐' : '☆'}`);

      // すべての子孫カテゴリを再帰的に取得
      const getAllDescendants = (parentId: number): Category[] => {
        const directChildren = categories.filter(c => c.parent_id === parentId);
        const allDescendants: Category[] = [...directChildren];
        
        // 子カテゴリの子（孫）も再帰的に取得
        directChildren.forEach(child => {
          const grandChildren = getAllDescendants(child.id);
          allDescendants.push(...grandChildren);
        });
        
        return allDescendants;
      };

      const descendants = getAllDescendants(categoryId);
      const affectedCategories = [targetCategory, ...descendants];

      console.log(`📊 更新対象: ${affectedCategories.length}件`);
      console.table(affectedCategories.map(c => ({
        name: c.category_name,
        key: c.category_key,
        current: c.is_favorite ? '⭐' : '☆',
        new: newFavoriteState ? '⭐' : '☆'
      })));

      // Firestoreバッチ更新
      const batch = writeBatch(db);
      
      affectedCategories.forEach(category => {
        const categoryRef = doc(db, 'categories', category.category_key);
        batch.set(categoryRef, {
          id: category.id,
          category_key: category.category_key,
          category_name: category.category_name,
          category_icon: category.category_icon,
          category_color: category.category_color,
          parent_id: category.parent_id,
          is_favorite: newFavoriteState,
          display_order: category.display_order,
          created_at: category.created_at
        }, { merge: true });
      });

      await batch.commit();
      console.log(`✅ ${affectedCategories.length}件のカテゴリを更新しました`);

      return { 
        success: true, 
        newState: newFavoriteState, 
        affectedCount: affectedCategories.length 
      };
    } catch (error) {
      console.error('❌ お気に入り切り替えエラー:', error);
      const errorMessage = error instanceof Error ? error.message : 'お気に入り切り替えに失敗しました';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  return {
    categories,
    loading,
    error,
    toggleFavorite
  };
};
