/**
 * Firebase接続テストユーティリティ
 * ブラウザコンソールから window.testFirebase() を実行して接続確認
 */

import { db } from '../firebaseClient';
import { collection, getDocs, addDoc } from 'firebase/firestore';

export const testFirebaseConnection = async () => {
  console.log('🔥 Firebase接続テスト開始...');
  
  try {
    // 1. Firestore接続確認
    console.log('✓ Firestore初期化成功');
    console.log('  - Project ID:', db.app.options.projectId);
    console.log('  - Auth Domain:', db.app.options.authDomain);
    
    // 2. termsコレクションの読み取りテスト
    console.log('\n📖 termsコレクション読み取りテスト...');
    const termsSnapshot = await getDocs(collection(db, 'terms'));
    console.log(`✓ 読み取り成功: ${termsSnapshot.size}件のデータ`);
    
    if (termsSnapshot.size > 0) {
      const firstTerm = termsSnapshot.docs[0].data();
      console.log('  - 最初のデータ例:', firstTerm);
    } else {
      console.log('⚠️ termsコレクションにデータがありません');
    }
    
    // 3. categoriesコレクションの読み取りテスト
    console.log('\n📂 categoriesコレクション読み取りテスト...');
    const categoriesSnapshot = await getDocs(collection(db, 'categories'));
    console.log(`✓ 読み取り成功: ${categoriesSnapshot.size}件のカテゴリ`);
    
    if (categoriesSnapshot.size > 0) {
      const firstCategory = categoriesSnapshot.docs[0].data();
      console.log('  - 最初のカテゴリ例:', firstCategory);
    } else {
      console.log('⚠️ categoriesコレクションにデータがありません');
    }
    
    // 4. 書き込みテスト（テストデータ追加）
    console.log('\n✍️ 書き込みテスト...');
    const testDoc = await addDoc(collection(db, 'terms'), {
      term: 'Firebase接続テスト',
      meaning: 'このデータは接続テスト用です。削除してOKです。',
      example: 'テスト実行時刻: ' + new Date().toLocaleString('ja-JP'),
      category: 'test',
      created_at: new Date(),
      updated_at: new Date()
    });
    console.log(`✓ 書き込み成功: ドキュメントID = ${testDoc.id}`);
    
    console.log('\n✅ すべてのテスト完了！Firebaseは正常に接続されています。');
    
    return {
      success: true,
      termsCount: termsSnapshot.size,
      categoriesCount: categoriesSnapshot.size,
      testDocId: testDoc.id
    };
    
  } catch (error: any) {
    console.error('❌ Firebase接続エラー:', error);
    console.error('  - エラーコード:', error.code);
    console.error('  - エラーメッセージ:', error.message);
    
    if (error.code === 'permission-denied') {
      console.error('\n🔒 権限エラー: Firestoreセキュリティルールを確認してください');
      console.error('   Firebase Console → Firestore Database → ルール');
    } else if (error.code === 'unavailable') {
      console.error('\n🌐 ネットワークエラー: インターネット接続を確認してください');
    }
    
    return {
      success: false,
      error: error.message,
      code: error.code
    };
  }
};

// グローバルに公開（ブラウザコンソールから実行可能）
if (typeof window !== 'undefined') {
  (window as any).testFirebase = testFirebaseConnection;
  console.log('💡 Tip: ブラウザコンソールで window.testFirebase() を実行してFirebase接続をテストできます');
}
