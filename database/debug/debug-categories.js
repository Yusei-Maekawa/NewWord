// カテゴリ取得のデバッグスクリプト
const mysql = require('mysql2');

// MySQLデータベースに接続
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'study_app'
});

console.log('=== カテゴリ取得デバッグ ===');

// 1. データベース接続テスト
db.connect((err) => {
  if (err) {
    console.error('❌ データベース接続エラー:', err);
    return;
  }
  console.log('✅ データベース接続成功');

  // 2. categoriesテーブルの存在確認
  db.query('SHOW TABLES LIKE "categories"', (err, results) => {
    if (err) {
      console.error('❌ テーブル確認エラー:', err);
      return;
    }
    
    if (results.length === 0) {
      console.error('❌ categoriesテーブルが見つかりません');
      console.log('📋 対処法: database_update.sql を実行してください');
      process.exit(1);
    }
    
    console.log('✅ categoriesテーブルが存在します');

    // 3. カテゴリデータの確認
    db.query('SELECT * FROM categories ORDER BY is_default DESC, created_at ASC', (err, results) => {
      if (err) {
        console.error('❌ カテゴリ取得エラー:', err);
        return;
      }
      
      console.log(`✅ カテゴリ取得成功: ${results.length}件`);
      console.log('📊 取得されたカテゴリ:');
      results.forEach((category, index) => {
        console.log(`  ${index + 1}. ${category.category_name} (${category.category_key})`);
      });
      
      db.end();
    });
  });
});
