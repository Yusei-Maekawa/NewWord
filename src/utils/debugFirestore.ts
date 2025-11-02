/**
 * src/utils/debugFirestore.ts
 *
 * ============================================================================
 * 📖 ファイル概要 / File Overview
 * ============================================================================
 *
 * 【日本語】
 * Firestoreのデバッグユーティリティ関数群。
 * ブラウザのコンソールから直接呼び出して、Firestoreのデータを確認・操作できます。
 *
 * 【主な機能】
 * 1. カテゴリデータのコンソール表示
 * 2. カテゴリデータの一括削除（初期化用）
 * 3. 特定カテゴリのお気に入り状態確認
 *
 * 【English】
 * Debug utility functions for Firestore.
 * Can be called directly from the browser console to inspect and manipulate
 * Firestore data.
 *
 * 【Key Features】
 * 1. Display category data in console
 * 2. Bulk delete category data (for reinitialization)
 * 3. Check favorite status of specific categories
 *
 * ============================================================================
 * 🔧 関数リスト / Function List
 * ============================================================================
 *
 * 1. debugCategories(): Promise<void>
 *    - 日本語: カテゴリデータをコンソールに表示
 *    - English: Display category data in console
 *
 * 2. clearCategories(): Promise<void>
 *    - 日本語: カテゴリデータを全削除（再初期化トリガー）
 *    - English: Delete all category data (triggers reinitialization)
 *
 * 3. checkCategoryFavorite(categoryKey: string): Promise<void>
 *    - 日本語: 特定カテゴリのお気に入り状態を確認
 *    - English: Check favorite status of specific category
 *
 * ============================================================================
 * 🔗 依存関係 / Dependencies
 * ============================================================================
 *
 * Firebase:
 * - collection, getDocs, deleteDoc, doc
 *
 * 内部:
 * - db from '../firebaseClient'
 *
 * ============================================================================
 *
 * @author Yusei Maekawa
 * @version 1.0.0
 * @since 2025-11-01
 * @updated 2025-11-02
 */

import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseClient';

/**
 * Firestoreのカテゴリデータをコンソールに表示
 */
export const debugCategories = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'categories'));
    console.log('📊 Firestore カテゴリデータ:');
    console.log('合計:', querySnapshot.size, '件');
    
    const categories: any[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      categories.push({
        ドキュメントID: doc.id,
        ...data
      });
    });
    
    // 親カテゴリ
    const parents = categories.filter(c => c.parent_id === null);
    console.log('\n🌳 親カテゴリ:', parents.length, '件');
    console.table(parents);
    
    // 子カテゴリ
    const children = categories.filter(c => c.parent_id !== null);
    console.log('\n🌿 子カテゴリ:', children.length, '件');
    console.table(children);
    
    // お気に入り
    const favorites = categories.filter(c => c.is_favorite);
    console.log('\n⭐ お気に入り:', favorites.length, '件');
    console.table(favorites);
    
    return categories;
  } catch (error) {
    console.error('❌ デバッグエラー:', error);
  }
};

/**
 * Firestoreのカテゴリデータをクリア（再初期化のため）
 */
export const clearCategories = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'categories'));
    console.log('🗑️ カテゴリデータをクリアします...', querySnapshot.size, '件');
    
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    console.log('✅ カテゴリデータをクリアしました。');
    console.log('💡 ページをリロードすると、カテゴリデータが再初期化されます。');
  } catch (error) {
    console.error('❌ クリアエラー:', error);
  }
};

/**
 * 特定のカテゴリのお気に入り状態を確認
 */
export const checkCategoryFavorite = async (categoryKey: string) => {
  try {
    const docRef = doc(db, 'categories', categoryKey);
    const docSnap = await getDocs(collection(db, 'categories'));
    
    docSnap.forEach((doc) => {
      if (doc.id === categoryKey) {
        console.log(`📌 ${categoryKey}:`, doc.data());
      }
    });
  } catch (error) {
    console.error('❌ チェックエラー:', error);
  }
};

// グローバルに公開（開発用）
if (typeof window !== 'undefined') {
  (window as any).debugFirestore = {
    debugCategories,
    clearCategories,
    checkCategoryFavorite
  };
  console.log('🔧 Firestoreデバッグツールが利用可能です:');
  console.log('  window.debugFirestore.debugCategories() - カテゴリデータを表示');
  console.log('  window.debugFirestore.clearCategories() - カテゴリデータをクリア');
  console.log('  window.debugFirestore.checkCategoryFavorite("category_key") - お気に入り状態を確認');
}
