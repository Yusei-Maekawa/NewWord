/**
 * server/firebaseAdmin.js
 *
 * Japanese:
 * このファイルは Firebase Admin SDK を初期化して、サーバー側で使う共通オブジェクトをエクスポートします。
 * - 期待する配置: サービスアカウント JSON を `secrets/serviceAccountKey.json` に置く（このファイルは `.gitignore` に含めてください）
 * - エクスポート:
 *   - `admin` - 初期化された firebase-admin モジュール（または require したままのオブジェクト）
 *   - `db` - Firestore のインスタンス (初期化失敗時は `null`)
 *   - `bucket` - Storage のバケットインスタンス (存在しない環境では `null`)
 *   - `initialized` - 初期化が成功したかの boolean フラグ
 *
 * English:
 * This module initializes the Firebase Admin SDK and exports common server-side objects.
 * - Expectation: place the service account JSON at `secrets/serviceAccountKey.json` (keep it gitignored).
 * - Exports:
 *   - `admin` - the firebase-admin module (initialized or the raw module)
 *   - `db` - Firestore instance (or `null` if initialization failed)
 *   - `bucket` - Storage bucket instance (or `null` if not available)
 *   - `initialized` - boolean flag, true if initialization succeeded
 *
 * Notes / 備考:
 * - このモジュールはサービスアカウントが無い場合に例外を投げず、`initialized=false` の状態で終了します。
 *   呼び出し側は `initialized` をチェックして、適切にハンドリングしてください。
 */

const admin = require('firebase-admin');
const path = require('path');

// Expect service account JSON at ./secrets/serviceAccountKey.json (gitignored)
const keyPath = path.join(__dirname, '..', 'secrets', 'serviceAccountKey.json');

// Exports summary / エクスポートの一覧 (目次)
// - admin: firebase-admin module (object)
// - db: Firestore instance (admin.firestore()) or null
// - bucket: Storage bucket instance or null
// - initialized: boolean indicating whether initialization succeeded
//
// 変数の詳細 (Variables Details):
//
// admin (exported const)
// - 日本語: firebase-admin モジュール。サーバー側で Firebase サービスにアクセスするための基本オブジェクト。
// - English: The firebase-admin module. Base object for accessing Firebase services on the server side.
// - Type: object (firebase-admin module)
// - Usage: admin.firestore(), admin.storage(), admin.auth()
//
// db (exported let)
// - 日本語: Firestore のサーバー側インスタンス。初期化成功時は admin.firestore()、失敗時は null。
// - English: Server-side Firestore instance. Set to admin.firestore() on success, null on failure.
// - Type: Firestore | null
// - Usage: db.collection('collectionName').doc('docId').set({...})
//
// bucket (exported let)
// - 日本語: Firebase Storage のバケットインスタンス。初期化成功時は admin.storage().bucket()、失敗時は null。
// - English: Firebase Storage bucket instance. Set to admin.storage().bucket() on success, null on failure.
// - Type: Bucket | null
// - Usage: bucket.file('path/to/file').save(data)
//
// initialized (exported let)
// - 日本語: 初期化が成功したかどうかを示す boolean フラグ。true なら db/bucket が使用可能。
// - English: Boolean flag indicating whether initialization succeeded. If true, db/bucket are available.
// - Type: boolean
// - Usage: if (!initialized) { console.error('Firebase not initialized'); }

let db = null;
let bucket = null;
let initialized = false;

try {
  const serviceAccount = require(keyPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: `${serviceAccount.project_id}.appspot.com`
  });
  // Only call service methods after successful initialization
  db = admin.firestore();
  if (admin.storage) {
    try {
      bucket = admin.storage().bucket();
    } catch (e) {
      // storage might not be available in some environments
      bucket = null;
    }
  }
  initialized = true;
} catch (err) {
  // Intentionally do not throw; script callers must ensure the service account exists
  console.warn('firebaseAdmin: service account not found or failed to initialize at', keyPath);
}

module.exports = { admin, db, bucket, initialized };
