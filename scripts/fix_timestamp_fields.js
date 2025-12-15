/**
 * scripts/fix_timestamp_fields.js
 * 
 * createdAt/updatedAt (文字列) を created_at/updated_at (Timestamp) に変換
 */

const admin = require('firebase-admin');
const path = require('path');

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

async function fixTimestampFields() {
  console.log('🔧 Timestamp フィールドの修正開始...\n');

  const termsSnapshot = await db.collection('terms').get();
  console.log(`📊 対象ドキュメント数: ${termsSnapshot.size}件\n`);

  let updatedCount = 0;
  const batch = db.batch();
  let batchCount = 0;

  for (const doc of termsSnapshot.docs) {
    const data = doc.data();
    const updates = {};
    let needsUpdate = false;

    // createdAt (文字列) → created_at (Timestamp) に変換
    if (data.createdAt && typeof data.createdAt === 'string') {
      try {
        const date = new Date(data.createdAt);
        updates.created_at = admin.firestore.Timestamp.fromDate(date);
        needsUpdate = true;
        console.log(`  📅 [${doc.id}] created_at を Timestamp に変換: ${data.createdAt}`);
      } catch (e) {
        console.error(`  ❌ [${doc.id}] 日付変換エラー:`, e.message);
      }
    }

    // updatedAt (文字列) → updated_at (Timestamp) に変換
    if (data.updatedAt && typeof data.updatedAt === 'string') {
      try {
        const date = new Date(data.updatedAt);
        updates.updated_at = admin.firestore.Timestamp.fromDate(date);
        needsUpdate = true;
        console.log(`  📅 [${doc.id}] updated_at を Timestamp に変換: ${data.updatedAt}`);
      } catch (e) {
        console.error(`  ❌ [${doc.id}] 日付変換エラー:`, e.message);
      }
    }

    // created_at がない場合は createdAt から作成
    if (!data.created_at && data.createdAt) {
      try {
        const date = new Date(data.createdAt);
        updates.created_at = admin.firestore.Timestamp.fromDate(date);
        needsUpdate = true;
      } catch (e) {
        console.error(`  ❌ [${doc.id}] created_at 作成エラー:`, e.message);
      }
    }

    if (needsUpdate) {
      batch.update(doc.ref, updates);
      batchCount++;
      updatedCount++;

      if (batchCount >= 450) {
        console.log('\n  ⏳ バッチをコミット中...');
        await batch.commit();
        console.log('  ✅ コミット完了\n');
        batchCount = 0;
      }
    }
  }

  if (batchCount > 0) {
    console.log('\n  ⏳ 最終バッチをコミット中...');
    await batch.commit();
    console.log('  ✅ コミット完了\n');
  }

  console.log('\n📊 修正結果:');
  console.log(`  ✅ 更新: ${updatedCount}件`);
  console.log(`  📦 合計: ${termsSnapshot.size}件\n`);
}

async function main() {
  try {
    await fixTimestampFields();
    console.log('✅ すべての処理が完了しました\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ エラーが発生しました:', error);
    process.exit(1);
  }
}

main();
