
/**
 * @fileoverview 学習用語句管理APIサーバー
 *
 * このファイルは、Express.jsを使用したREST APIサーバーを定義します。
 * MySQLデータベースとの連携により、語句データのCRUD操作を提供します。
 *
 * @author Yusei Maekawa
 * @version 1.0.0
 * @since 2025-08-01
 */

/**
 * @description サーバー起動時の処理フロー
 * 1. Expressアプリケーションの初期化
 * 2. CORS設定（クロスオリジン対応）
 * 3. JSONパーサーミドルウェアの設定
 * 4. MySQLデータベース接続の確立
 * 5. APIルーティングの定義
 * 6. サーバーの起動（ポート4000）
 */

// 必要なモジュールを読み込み
const express = require('express'); // Webサーバー/ルーティング用
const mysql = require('mysql2');    // MySQL接続用
const cors = require('cors');       // CORS（他ドメインからのアクセス許可）

const app = express();

// CORSを有効化（Reactなど別ポートからのリクエストを許可）
app.use(cors());
// JSON形式のリクエストボディをパース
app.use(express.json());

// MySQL接続設定（環境変数で上書き可能）
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || process.env.MYSQL_PORT || '3306', 10);
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'study_app';

const db = mysql.createConnection({
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  connectTimeout: 10000
});

// 接続の確認ログ
db.connect((err) => {
  if (err) {
    console.error(`MySQL接続に失敗しました (${DB_HOST}:${DB_PORT}, user=${DB_USER}):`, err.message || err);
    console.error('必要なら MySQL を起動するか、環境変数で接続先を指定してください: DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME');
  } else {
    console.log(`MySQLに接続しました: ${DB_HOST}:${DB_PORT} (DB=${DB_NAME}, user=${DB_USER})`);
  }
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
// ボディ例: { term: 'test', meaning: '意味', example: '例文', category: '英語' }
app.post('/api/terms', (req, res) => {
  // リクエストボディから値を取得（termまたはwordの両方に対応）
  const { term, word, meaning, example, category } = req.body;
  const termValue = term || word; // termがあればterm、なければword

  console.log('用語追加リクエスト:', { term: termValue, meaning, example, category });

  // MySQLにINSERT文を発行（データベースのwordカラムに保存）
  db.query(
    'INSERT INTO terms (word, meaning, example, category) VALUES (?, ?, ?, ?)',
    [termValue, meaning, example, category],
    (err, result) => {
      if (err) {
        console.error('用語追加エラー:', err);
        return res.status(500).json({ error: err });
      }
      console.log(`用語追加成功 - ID: ${result.insertId}`);
      res.json({ id: result.insertId });
    }
  );
});

// 語句を編集するAPI（PUTリクエスト）
// 例: http://localhost:4000/api/terms/1
// ボディ例: { term: 'updated', meaning: '更新された意味', example: '例文', category: '英語' }
app.put('/api/terms/:id', (req, res) => {
  const { id } = req.params;
  const { term, word, meaning, example, category } = req.body;
  const termValue = term || word; // termがあればterm、なければword
  
  console.log('編集リクエスト - ID: %s, データ:', id, { term: termValue, meaning, example, category });
  
  db.query(
    'UPDATE terms SET word = ?, meaning = ?, example = ?, category = ? WHERE id = ?',
    [termValue, meaning, example, category, id],
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

// カテゴリ一覧を取得するAPI（階層構造対応）
// 例: http://localhost:4000/api/categories
app.get('/api/categories', (req, res) => {
  console.log('階層型カテゴリ一覧取得リクエスト');
  
  // 階層構造を考慮してカテゴリを取得
  const query = `
    SELECT 
      c.*,
      parent.category_name as parent_name,
      parent.category_icon as parent_icon,
      (SELECT COUNT(*) FROM categories child WHERE child.parent_id = c.id) as child_count
    FROM categories c
    LEFT JOIN categories parent ON c.parent_id = parent.id
    ORDER BY 
      c.is_favorite DESC,
      COALESCE(parent.display_order, c.display_order),
      c.display_order,
      c.created_at ASC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('カテゴリ取得エラー:', err);
      return res.status(500).json({ error: err });
    }
    
    // 再帰的にカテゴリの階層パスを取得する関数
    function getCategoryPath(categoryId, categories, path = []) {
      const category = categories.find(c => c.id === categoryId);
      if (!category) return path;
      
      path.unshift(category);
      if (category.parent_id) {
        return getCategoryPath(category.parent_id, categories, path);
      }
      return path;
    }
    
    // 各カテゴリに階層パスとパンくずリストを追加
    const categoriesWithPath = results.map(category => {
      const path = getCategoryPath(category.id, results);
      const breadcrumb = path.map(p => p.category_name).join(' / ');
      
      console.log(`カテゴリ ${category.category_name} のパス:`, path.map(p => p.category_name));
      
      return {
        ...category,
        breadcrumb,
        path: path.map(p => ({
          id: p.id,
          name: p.category_name,
          icon: p.category_icon,
          color: p.category_color
        }))
      };
    });
    
    console.log(`階層型カテゴリ取得成功: ${categoriesWithPath.length}件`);
    res.json(categoriesWithPath);
  });
});

// カテゴリを新規追加するAPI（階層構造対応）
// 例: http://localhost:4000/api/categories
// ボディ例: { category_name: 'プログラミング', category_icon: '⌨️', category_color: '#343a40', parent_id: 1, is_favorite: false }
app.post('/api/categories', (req, res) => {
  const { 
    category_name, 
    category_icon = '📝', 
    category_color = '#6c757d',
    parent_id = null,
    is_favorite = false,
    display_order = 0
  } = req.body;
  
  console.log('カテゴリ追加リクエスト受信:', {
    category_name,
    category_icon,
    category_color,
    parent_id,
    is_favorite,
    display_order
  });
  
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
      
      // カテゴリを挿入（階層構造対応）
      db.query(
        'INSERT INTO categories (category_key, category_name, category_icon, category_color, parent_id, is_favorite, display_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [category_key, category_name.trim(), category_icon, category_color, parent_id, is_favorite, display_order],
        (err, result) => {
          if (err) {
            console.error('カテゴリ追加エラー:', err);
            return res.status(500).json({ error: err });
          }
          console.log(`カテゴリ追加成功 - ID: ${result.insertId}, parent_id: ${parent_id}`);
          res.json({ 
            id: result.insertId, 
            category_key,
            category_name: category_name.trim(),
            category_icon,
            category_color,
            parent_id,
            message: 'カテゴリを追加しました'
          });
        }
      );
    }
  );
});

// デバッグ用: カテゴリの階層構造を確認するAPI
app.get('/api/debug/categories', (req, res) => {
  const query = `
    SELECT 
      c.id,
      c.category_name,
      c.category_key,
      c.parent_id,
      parent.category_name as parent_name,
      c.is_favorite,
      c.display_order,
      c.created_at
    FROM categories c
    LEFT JOIN categories parent ON c.parent_id = parent.id
    ORDER BY c.parent_id, c.display_order, c.created_at
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err });
    }
    
    console.log('デバッグ: 現在のカテゴリ階層構造');
    results.forEach(cat => {
      console.log(`ID: ${cat.id}, 名前: ${cat.category_name}, 親ID: ${cat.parent_id || 'なし'}, 親名: ${cat.parent_name || 'なし'}`);
    });
    
    res.json(results);
  });
});

// カテゴリを編集するAPI（階層構造対応）
// 例: http://localhost:4000/api/categories/1
// ボディ例: { category_name: '更新後の名前', category_icon: '🆕', category_color: '#ff0000', parent_id: 2, is_favorite: true }
app.put('/api/categories/:id', (req, res) => {
  const { id } = req.params;
  const { category_name, category_icon, category_color, parent_id, is_favorite, display_order } = req.body;
  
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
      
      // カテゴリを更新（階層構造対応）
      db.query(
        'UPDATE categories SET category_name = ?, category_icon = ?, category_color = ?, parent_id = ?, is_favorite = ?, display_order = ? WHERE id = ?',
        [
          category_name.trim(), 
          category_icon || '📝', 
          category_color || '#6c757d', 
          parent_id, 
          is_favorite !== undefined ? is_favorite : false,
          display_order !== undefined ? display_order : 0,
          id
        ],
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

// お気に入り状態を切り替えるAPI（配下すべてのカテゴリを含む）
// 例: http://localhost:4000/api/categories/1/favorite
app.put('/api/categories/:id/favorite', (req, res) => {
  const { id } = req.params;
  const { is_favorite } = req.body;
  
  console.log(`お気に入り切り替えリクエスト - ID: ${id}, お気に入り: ${is_favorite}`);
  
  // 再帰的に子カテゴリのIDを取得する関数
  const getAllChildIds = (parentId, callback) => {
    const childIds = [];
    
    const getChildren = (currentParentId) => {
      return new Promise((resolve, reject) => {
        db.query(
          'SELECT id FROM categories WHERE parent_id = ?',
          [currentParentId],
          async (err, children) => {
            if (err) return reject(err);
            
            for (const child of children) {
              childIds.push(child.id);
              // 再帰的に孫カテゴリも取得
              await getChildren(child.id);
            }
            resolve();
          }
        );
      });
    };
    
    getChildren(parentId)
      .then(() => callback(null, childIds))
      .catch(callback);
  };
  
  // 指定されたカテゴリとその配下すべてを更新
  getAllChildIds(id, (err, childIds) => {
    if (err) {
      console.error('子カテゴリ取得エラー:', err);
      return res.status(500).json({ error: err });
    }
    
    // 自分自身 + 配下すべてのIDを含む配列
    const allIds = [parseInt(id), ...childIds];
    console.log(`更新対象カテゴリID一覧: [${allIds.join(', ')}]`);
    
    if (allIds.length === 0) {
      return res.status(404).json({ error: 'カテゴリが見つかりません' });
    }
    
    // すべてのカテゴリを一括更新
    const placeholders = allIds.map(() => '?').join(',');
    const values = [is_favorite, ...allIds];
    console.log(`SQL実行: UPDATE categories SET is_favorite = ${is_favorite} WHERE id IN (${allIds.join(', ')})`);
    
    db.query(
      `UPDATE categories SET is_favorite = ? WHERE id IN (${placeholders})`,
      values,
      (err, result) => {
        if (err) {
          console.error('お気に入り一括更新エラー:', err);
          return res.status(500).json({ error: err });
        }
        
        console.log(`お気に入り一括更新成功 - 対象ID: [${allIds.join(', ')}], 更新件数: ${result.affectedRows}`);
        res.json({ 
          message: is_favorite 
            ? `お気に入りに追加しました（${result.affectedRows}件）` 
            : `お気に入りから削除しました（${result.affectedRows}件）`,
          is_favorite,
          updated_count: result.affectedRows,
          updated_ids: allIds
        });
      }
    );
  });
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