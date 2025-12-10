/**
 * scripts/check_term_fields.js
 * 
 * Termsデータのフィールド構造を詳細確認
 */

const admin = require('firebase-admin');
const path = require('path');

try {
  const serviceAccount = require(path.resolve(__dirname, '../secrets/serviceAccountKey.json'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (error) {
  console.error('❌ Firebase Admin初期化失敗:', error.message);
  process.exit(1);
}

const db = admin.firestore();

async function checkFields() {
  console.log('🔍 Termsデータのフィールド詳細確認\n');
  
  const termsSnapshot = await db.collection('terms').limit(3).get();
  
  termsSnapshot.forEach((doc, i) => {
    const data = doc.data();
    console.log(`=== Term #${i+1}: ${doc.id} ===`);
    console.log('すべてのフィールド:');
    Object.keys(data).forEach(key => {
      const value = data[key];
      const type = typeof value;
      const isTimestamp = value && value.toDate ? 'Timestamp' : type;
      console.log(`  ${key}: ${isTimestamp} = ${value}`);
    });
    console.log('');
  });
  
  process.exit(0);
}

checkFields().catch(err => {
  console.error('エラー:', err);
  process.exit(1);
});
