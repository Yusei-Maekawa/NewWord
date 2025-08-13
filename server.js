
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

// サーバーを4000番ポートで起動
app.listen(4000, () => console.log('API server running on port 4000'));