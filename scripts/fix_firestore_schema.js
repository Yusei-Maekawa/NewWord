/**
 * scripts/fix_firestore_schema.js
 *
 * 日本語:
 * Firestoreのデータスキーマを統一形式に修正するスクリプト。
 * - Terms: `term` → `word`, `category` → `categoryId` に変換
 * - Terms: `isFavorite` → `is_favorite` に変換（オプション）
 * - 既存データを壊さずに、フィールド名を統一
 *
 * English:
 * Script to fix Firestore data schema to unified format.
 * - Terms: Convert `term` → `word`, `category` → `categoryId`
 * - Terms: Convert `isFavorite` → `is_favorite` (optional)
 * - Unify field names without breaking existing data
 *
 * 実行: node scripts/fix_firestore_schema.js
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
 * Termsコレクションのスキーマを修正
 */
async function fixTermsSchema() {
  console.log('🔧 Termsコレクションのスキーマ修正開始...\n');

  const termsSnapshot = await db.collection('terms').get();
  console.log(`📊 対象ドキュメント数: ${termsSnapshot.size}件\n`);

  let updatedCount = 0;
  let skippedCount = 0;

  const batch = db.batch();
  let batchCount = 0;

  for (const doc of termsSnapshot.docs) {
    const data = doc.data();
    const updates = {};
    let needsUpdate = false;

    // 1. term → word への変換（wordがない場合のみ）
    if (data.term && !data.word) {
      updates.word = data.term;
      needsUpdate = true;
      console.log(`  📝 [${doc.id}] term → word: "${data.term}"`);
    }

    // 2. category → categoryId への変換（categoryIdがない場合のみ）
    if (data.category && !data.categoryId) {
      updates.categoryId = data.category;
      needsUpdate = true;
      console.log(`  📂 [${doc.id}] category → categoryId: "${data.category}"`);
    }

    // 3. isFavorite がある場合は維持（is_favoriteに統一する必要があれば以下のコメントを外す）
    // if (data.isFavorite !== undefined && data.is_favorite === undefined) {
    //   updates.is_favorite = data.isFavorite;
    //   needsUpdate = true;
    // }

    // 4. 古いフィールドを削除（オプション: 慎重に行う）
    // if (data.term && data.word) {
    //   updates.term = admin.firestore.FieldValue.delete();
    //   needsUpdate = true;
    // }
    // if (data.category && data.categoryId) {
    //   updates.category = admin.firestore.FieldValue.delete();
    //   needsUpdate = true;
    // }

    if (needsUpdate) {
      batch.update(doc.ref, updates);
      batchCount++;
      updatedCount++;

      // Firestoreのバッチ制限（500件）に対応
      if (batchCount >= 450) {
        console.log('\n  ⏳ バッチをコミット中...');
        await batch.commit();
        console.log('  ✅ コミット完了\n');
        batchCount = 0;
      }
    } else {
      skippedCount++;
    }
  }

  // 残りのバッチをコミット
  if (batchCount > 0) {
    console.log('\n  ⏳ 最終バッチをコミット中...');
    await batch.commit();
    console.log('  ✅ コミット完了\n');
  }

  console.log('\n📊 修正結果:');
  console.log(`  ✅ 更新: ${updatedCount}件`);
  console.log(`  ⏭️  スキップ（既に正しい形式）: ${skippedCount}件`);
  console.log(`  📦 合計: ${termsSnapshot.size}件\n`);
}

/**
 * Categoriesコレクションの確認（必要に応じて修正）
 */
async function checkCategoriesSchema() {
  console.log('🔍 Categoriesコレクションの確認...\n');

  const categoriesSnapshot = await db.collection('categories').get();
  console.log(`📊 カテゴリ数: ${categoriesSnapshot.size}件`);

  let issueCount = 0;

  categoriesSnapshot.forEach((doc) => {
    const data = doc.data();
    
    // 必須フィールドの確認
    const requiredFields = ['category_key', 'category_name', 'id'];
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      console.log(`  ⚠️  [${doc.id}] 不足フィールド: ${missingFields.join(', ')}`);
      issueCount++;
    }
  });

  if (issueCount === 0) {
    console.log('  ✅ すべてのカテゴリが正しい形式です\n');
  } else {
    console.log(`\n  ⚠️  ${issueCount}件のカテゴリに問題があります\n`);
  }
}

/**
 * メイン処理
 */
async function main() {
  try {
    console.log('='.repeat(60));
    console.log('🚀 Firestoreスキーマ修正スクリプト');
    console.log('='.repeat(60) + '\n');

    // 1. Terms修正
    await fixTermsSchema();

    // 2. Categories確認
    await checkCategoriesSchema();

    console.log('='.repeat(60));
    console.log('✅ すべての処理が完了しました');
    console.log('='.repeat(60) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ エラーが発生しました:', error);
    process.exit(1);
  }
}

main();
