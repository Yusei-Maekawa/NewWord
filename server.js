
// 必要なモジュールを読み込み
const express = require('express'); // Webサーバー/ルーティング用
const mysql = require('mysql2');    // MySQL接続用
const cors = require('cors');       // CORS（他ドメインからのアクセス許可）

const app = express();

// CORSを有効化（Reactなど別ポートからのリクエストを許可）
app.use(cors());
// JSON形式のリクエストボディをパース
app.use(express.json());

// MySQLデータベースに接続するための設定
const db = mysql.createConnection({
  host: 'localhost',      // サーバー名（ローカル）
  user: 'root',           // ユーザー名（XAMPPのデフォルト）
  password: '',           // パスワード（XAMPPのデフォルトは空）
  database: 'study_app'   // 使用するデータベース名
});

// 語句一覧を取得するAPI（GETリクエスト）
// 例: http://localhost:4000/api/terms
app.get('/api/terms', (req, res) => {
  // MySQLのtermsテーブルから全件取得
  db.query('SELECT * FROM terms', (err, results) => {
    if (err) return res.status(500).json({ error: err }); // エラー時は500で返す
    res.json(results); // 取得した語句リストをJSONで返す
  });
});

// 語句を新規追加するAPI（POSTリクエスト）
// 例: http://localhost:4000/api/terms
// ボディ例: { word: 'test', meaning: '意味', example: '例文', category: '英語' }
app.post('/api/terms', (req, res) => {
  // リクエストボディから値を取得
  const { word, meaning, example, category } = req.body;
  // MySQLにINSERT文を発行
  db.query(
    'INSERT INTO terms (word, meaning, example, category) VALUES (?, ?, ?, ?)',
    [word, meaning, example, category],
    (err, result) => {
      if (err) return res.status(500).json({ error: err }); // エラー時
      // 追加したレコードのIDを返す
      res.json({ id: result.insertId });
    }
  );
});

// 語句を編集するAPI（PUTリクエスト）
// 例: http://localhost:4000/api/terms/1
// ボディ例: { word: 'updated', meaning: '更新された意味', example: '例文', category: '英語' }
app.put('/api/terms/:id', (req, res) => {
  const { id } = req.params;
  const { word, meaning, example, category } = req.body;
  console.log(`編集リクエスト - ID: ${id}, データ:`, req.body); // デバッグ用
  
  db.query(
    'UPDATE terms SET word = ?, meaning = ?, example = ?, category = ? WHERE id = ?',
    [word, meaning, example, category, id],
    (err, result) => {
      if (err) {
        console.error('編集エラー:', err);
        return res.status(500).json({ error: err });
      }
      console.log(`編集成功 - ID: ${id}, 影響行数: ${result.affectedRows}`);
      res.json({ message: '語句を更新しました', affectedRows: result.affectedRows });
    }
  );
});

// 語句を削除するAPI（DELETEリクエスト）
// 例: http://localhost:4000/api/terms/1
app.delete('/api/terms/:id', (req, res) => {
  const { id } = req.params;
  console.log(`削除リクエスト - ID: ${id}`); // デバッグ用
  
  db.query(
    'DELETE FROM terms WHERE id = ?',
    [id],
    (err, result) => {
      if (err) {
        console.error('削除エラー:', err);
        return res.status(500).json({ error: err });
      }
      console.log(`削除成功 - ID: ${id}, 影響行数: ${result.affectedRows}`);
      res.json({ message: '語句を削除しました', affectedRows: result.affectedRows });
    }
  );
});

// ========================================
// カテゴリ管理API（動的カテゴリ対応）
// ========================================

// カテゴリ一覧を取得するAPI（GETリクエスト）
// 例: http://localhost:4000/api/categories
app.get('/api/categories', (req, res) => {
  console.log('カテゴリ一覧取得リクエスト');
  db.query('SELECT * FROM categories ORDER BY is_default DESC, created_at ASC', (err, results) => {
    if (err) {
      console.error('カテゴリ取得エラー:', err);
      return res.status(500).json({ error: err });
    }
    console.log(`カテゴリ取得成功: ${results.length}件`);
    res.json(results);
  });
});

// カテゴリを新規追加するAPI（POSTリクエスト）
// 例: http://localhost:4000/api/categories
// ボディ例: { category_name: 'プログラミング', category_icon: '⌨️', category_color: '#343a40' }
app.post('/api/categories', (req, res) => {
  const { category_name, category_icon = '📝', category_color = '#6c757d' } = req.body;
  
  // カテゴリ名が空の場合はエラー
  if (!category_name || !category_name.trim()) {
    return res.status(400).json({ error: 'カテゴリ名は必須です' });
  }
  
  // カテゴリキーを自動生成（日本語→ローマ字変換 + 小文字 + アンダースコア）
  const category_key = category_name.trim()
    .toLowerCase()
    .replace(/\s+/g, '_')  // スペースをアンダースコアに
    .replace(/[^\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g, '') // 英数字・ひらがな・カタカナ・漢字のみ
    .substring(0, 50); // 最大50文字
  
  console.log(`カテゴリ追加リクエスト - 名前: ${category_name}, キー: ${category_key}`);
  
  // 重複チェック
  db.query(
    'SELECT id FROM categories WHERE category_key = ? OR category_name = ?',
    [category_key, category_name.trim()],
    (err, existing) => {
      if (err) {
        console.error('重複チェックエラー:', err);
        return res.status(500).json({ error: err });
      }
      
      if (existing.length > 0) {
        return res.status(400).json({ error: 'そのカテゴリは既に存在します' });
      }
      
      // カテゴリを挿入
      db.query(
        'INSERT INTO categories (category_key, category_name, category_icon, category_color) VALUES (?, ?, ?, ?)',
        [category_key, category_name.trim(), category_icon, category_color],
        (err, result) => {
          if (err) {
            console.error('カテゴリ追加エラー:', err);
            return res.status(500).json({ error: err });
          }
          console.log(`カテゴリ追加成功 - ID: ${result.insertId}`);
          res.json({ 
            id: result.insertId, 
            category_key,
            category_name: category_name.trim(),
            category_icon,
            category_color,
            message: 'カテゴリを追加しました'
          });
        }
      );
    }
  );
});

// カテゴリを編集するAPI（PUTリクエスト）
// 例: http://localhost:4000/api/categories/1
// ボディ例: { category_name: '更新後の名前', category_icon: '🆕', category_color: '#ff0000' }
app.put('/api/categories/:id', (req, res) => {
  const { id } = req.params;
  const { category_name, category_icon, category_color } = req.body;
  
  if (!category_name || !category_name.trim()) {
    return res.status(400).json({ error: 'カテゴリ名は必須です' });
  }
  
  console.log(`カテゴリ編集リクエスト - ID: ${id}, 新しい名前: ${category_name}`);
  
  // 同じ名前のカテゴリが他に存在しないかチェック
  db.query(
    'SELECT id FROM categories WHERE category_name = ? AND id != ?',
    [category_name.trim(), id],
    (err, existing) => {
      if (err) {
        console.error('重複チェックエラー:', err);
        return res.status(500).json({ error: err });
      }
      
      if (existing.length > 0) {
        return res.status(400).json({ error: 'その名前のカテゴリは既に存在します' });
      }
      
      // カテゴリを更新
      db.query(
        'UPDATE categories SET category_name = ?, category_icon = ?, category_color = ? WHERE id = ?',
        [category_name.trim(), category_icon || '📝', category_color || '#6c757d', id],
        (err, result) => {
          if (err) {
            console.error('カテゴリ編集エラー:', err);
            return res.status(500).json({ error: err });
          }
          
          if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'カテゴリが見つかりません' });
          }
          
          console.log(`カテゴリ編集成功 - ID: ${id}`);
          res.json({ message: 'カテゴリを更新しました', affectedRows: result.affectedRows });
        }
      );
    }
  );
});

// カテゴリを削除するAPI（DELETEリクエスト）
// 例: http://localhost:4000/api/categories/1
app.delete('/api/categories/:id', (req, res) => {
  const { id } = req.params;
  console.log(`カテゴリ削除リクエスト - ID: ${id}`);
  
  // カテゴリの存在確認
  db.query(
    'SELECT category_name FROM categories WHERE id = ?',
    [id],
    (err, category) => {
      if (err) {
        console.error('カテゴリ確認エラー:', err);
        return res.status(500).json({ error: err });
      }
      
      if (category.length === 0) {
        return res.status(404).json({ error: 'カテゴリが見つかりません' });
      }
      
      // そのカテゴリを使用している語句があるかチェック
      db.query(
        'SELECT COUNT(*) as count FROM terms t JOIN categories c ON t.category = c.category_key WHERE c.id = ?',
        [id],
        (err, countResult) => {
          if (err) {
            console.error('使用チェックエラー:', err);
            return res.status(500).json({ error: err });
          }
          
          if (countResult[0].count > 0) {
            return res.status(400).json({ 
              error: `このカテゴリは${countResult[0].count}件の語句で使用されているため削除できません` 
            });
          }
          
          // カテゴリを削除
          db.query(
            'DELETE FROM categories WHERE id = ?',
            [id],
            (err, result) => {
              if (err) {
                console.error('カテゴリ削除エラー:', err);
                return res.status(500).json({ error: err });
              }
              console.log(`カテゴリ削除成功 - ID: ${id}`);
              res.json({ message: 'カテゴリを削除しました', affectedRows: result.affectedRows });
            }
          );
        }
      );
    }
  );
});

// サーバーを4000番ポートで起動
app.listen(4000, () => console.log('API server running on port 4000'));

/**
 * 新しく追加されたAPIエンドポイント:
 * 
 * GET    /api/categories      - カテゴリ一覧取得
 * POST   /api/categories      - カテゴリ追加
 * PUT    /api/categories/:id  - カテゴリ編集
 * DELETE /api/categories/:id  - カテゴリ削除
 * 
 * 使用例:
 * 
 * // カテゴリ一覧取得
 * fetch('http://localhost:4000/api/categories')
 * 
 * // カテゴリ追加
 * fetch('http://localhost:4000/api/categories', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     category_name: 'プログラミング',
 *     category_icon: '⌨️',
 *     category_color: '#343a40'
 *   })
 * })
 * 
 * // カテゴリ編集
 * fetch('http://localhost:4000/api/categories/6', {
 *   method: 'PUT',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     category_name: '更新後の名前',
 *     category_icon: '🆕',
 *     category_color: '#ff0000'
 *   })
 * })
 * 
 * // カテゴリ削除
 * fetch('http://localhost:4000/api/categories/6', { method: 'DELETE' })
 */