/**
 * Simple MySQL -> Firestore migration script (small datasets)
 * Requirements:
 * - Place service account JSON at ./secrets/serviceAccountKey.json
 * - Run: node scripts/mysql_to_firestore.js
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
