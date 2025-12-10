/**
 * scripts/check_firestore_data.js
 *
 * Firestoreのデータを確認するスクリプト
 * 実行: node scripts/check_firestore_data.js
 */

const admin = require('firebase-admin');
const path = require('path');

// Firebase Admin初期化
try {
  const serviceAccount = require(path.resolve(__dirname, '../secrets/serviceAccountKey.json'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('✅ Firebase Admin初期化成功\n');
} catch (error) {
  console.error('❌ Firebase Admin初期化失敗:', error.message);
  process.exit(1);
}

const db = admin.firestore();

/**
 * Firestoreのデータを確認
 */
async function checkFirestoreData() {
  try {
    console.log('🔍 Firestoreデータ確認開始...\n');

    // 1. カテゴリデータの確認
    console.log('📁 カテゴリデータ:');
    const categoriesSnapshot = await db.collection('categories').get();
    console.log(`  件数: ${categoriesSnapshot.size}件`);
    
    if (categoriesSnapshot.size > 0) {
      console.log('  データ一覧:');
      categoriesSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`    - ${data.category_name} (${doc.id})`);
      });
    } else {
      console.log('  ⚠️ データが存在しません');
    }
    console.log('');

    // 2. 用語データの確認
    console.log('📝 用語データ:');
    const termsSnapshot = await db.collection('terms').get();
    console.log(`  件数: ${termsSnapshot.size}件`);
    
    if (termsSnapshot.size > 0) {
      console.log('  データ一覧:');
      termsSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`    - ${data.term} (カテゴリ: ${data.category})`);
      });
    } else {
      console.log('  ⚠️ データが存在しません');
    }
    console.log('');

    // 3. Firebase設定の確認
    console.log('⚙️ Firebase設定:');
    console.log(`  Project ID: ${admin.app().options.projectId}`);
    console.log('');

    // 4. セキュリティルールの確認メッセージ
    console.log('🔐 セキュリティルール確認:');
    console.log('  Firebaseコンソールで以下を確認してください:');
    console.log('  1. https://console.firebase.google.com/');
    console.log('  2. プロジェクト: newword-f6f1e');
    console.log('  3. Firestore Database → ルール');
    console.log('  4. ルールが正しくデプロイされているか確認');
    console.log('');

    console.log('✅ データ確認完了');

  } catch (error) {
    console.error('❌ エラー:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// スクリプト実行
checkFirestoreData();
