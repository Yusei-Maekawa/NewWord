/**
 * scripts/mysql_to_firestore.js
 *
 * Japanese:
 * MySQL から Firestore へデータを移行する簡易スクリプトです（小規模向け）。
 * 前提:
 * - サービスアカウント JSON を `./secrets/serviceAccountKey.json` に配置していること
 * - 管理者権限で Firestore へ書き込みできること
 * 実行:
 * - node scripts/mysql_to_firestore.js
 *
 * エクスポート / 目次:
 * - 依存: mysql2/promise, ../server/firebaseAdmin
 * - 関数: migrate() - メイン処理。MySQL から categories と terms を読み出して Firestore にバッチ書き込みする
 * - 重要変数:
 *   - DB 接続は環境変数でオーバーライド可能: DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
 *   - バッチサイズ: terms は 400 件ずつコミット（Firestore バッチ上限に対応）
 *
 * English:
 * Simple MySQL -> Firestore migration script (for small datasets).
 * Preconditions:
 * - Place the service account JSON at `./secrets/serviceAccountKey.json`.
 * - Ensure the service account has permissions to write to Firestore.
 * Usage:
 * - node scripts/mysql_to_firestore.js
 *
 * Exports / TOC:
 * - deps: mysql2/promise, ../server/firebaseAdmin
 * - function: migrate() - main migration flow. Reads categories and terms from MySQL and writes them to Firestore using batches.
 * - config:
 *   - DB connection can be overridden via env vars: DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
 *   - batch size for terms: 400 (to avoid Firestore batch limits)
 *
 * 関数の詳細 (Function Details):
 *
 * migrate() (async function)
 * - 日本語: MySQL データベースから categories と terms を読み取り、Firestore にバッチ書き込みする非同期関数。
 *           categories は1バッチで、terms は400件ごとにバッチ処理します（Firestore の500件制限に対応）。
 * - English: Async function that reads categories and terms from MySQL and writes them to Firestore in batches.
 *            Categories are written in a single batch; terms are written in chunks of 400 (respecting Firestore's 500-doc batch limit).
 * - Inputs: なし (環境変数でDB接続をオーバーライド可能)
 * - Outputs: Promise<void> (コンソールに "Migration finished" を出力)
 * - Errors: DB接続失敗や Firestore 未初期化の場合は process.exit(1) で終了
 * - Usage: node scripts/mysql_to_firestore.js
 *
 * 環境変数 (Environment Variables):
 * - DB_HOST: MySQL ホスト (デフォルト: localhost)
 * - DB_PORT: MySQL ポート (デフォルト: 3307)
 * - DB_USER: MySQL ユーザー (デフォルト: root)
 * - DB_PASSWORD: MySQL パスワード (デフォルト: rootpassword)
 * - DB_NAME: MySQL データベース名 (デフォルト: studying_app)
 */
const mysql = require('mysql2/promise');
const { db, admin } = require('../server/firebaseAdmin');

async function migrate() {
  if (!db) {
    console.error('Firestore not initialized. Place service account at ./secrets/serviceAccountKey.json');
    process.exit(1);
  }

  // Connection config: allow overrides via environment variables for flexibility
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3307,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'rootpassword',
    database: process.env.DB_NAME || 'studying_app',
    charset: 'utf8mb4'
  });
  try {
    const [cats] = await conn.query('SELECT * FROM categories');
    const batchC = db.batch();
    cats.forEach(c => {
      const ref = db.collection('categories').doc(String(c.id));
      batchC.set(ref, {
        category_key: c.category_key,
        category_name: c.category_name,
        category_icon: c.category_icon,
        category_color: c.category_color,
        parent_id: c.parent_id || null,
        display_order: c.display_order || 0,
        is_favorite: !!c.is_favorite,
        created_at: c.created_at ? admin.firestore.Timestamp.fromDate(new Date(c.created_at)) : admin.firestore.FieldValue.serverTimestamp()
      });
    });
    await batchC.commit();

    const [terms] = await conn.query('SELECT * FROM terms');
    for (let i = 0; i < terms.length; i += 400) {
      const batch = db.batch();
      terms.slice(i, i + 400).forEach(t => {
        const ref = db.collection('terms').doc(String(t.id));
        batch.set(ref, {
          word: t.word,
          meaning: t.meaning,
          example: t.example,
          categoryId: String(t.category_id || t.category),
          created_at: t.created_at ? admin.firestore.Timestamp.fromDate(new Date(t.created_at)) : admin.firestore.FieldValue.serverTimestamp()
        });
      });
      await batch.commit();
    }
    console.log('Migration finished');
  } finally {
    await conn.end();
  }
}

migrate().catch(err => { console.error(err); process.exit(1); });
