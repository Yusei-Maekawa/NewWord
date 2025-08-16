/**
 * データベース更新スクリプト - 動的カテゴリ管理対応
 * ユーザーが自由にカテゴリを追加・編集・削除できるようにデータベースを拡張
 * 
 * 実行方法:
 * 1. XAMPPでMySQLを起動
 * 2. phpMyAdmin (http://localhost/phpmyadmin) にアクセス
 * 3. study_app データベースを選択
 * 4. 「SQL」タブを開く
 * 5. 以下のSQLを貼り付けて実行
 */

-- 1. categoryカラムの文字数制限を拡張（VARCHAR(50) → VARCHAR(100)）
ALTER TABLE terms MODIFY COLUMN category VARCHAR(100);

-- 2. カテゴリマスターテーブルを作成（動的カテゴリ管理用）
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_key VARCHAR(100) NOT NULL UNIQUE COMMENT 'カテゴリの一意キー',
  category_name VARCHAR(200) NOT NULL COMMENT 'カテゴリの表示名',
  category_icon VARCHAR(10) DEFAULT '📝' COMMENT 'カテゴリのアイコン（絵文字）',
  category_color VARCHAR(7) DEFAULT '#6c757d' COMMENT 'カテゴリの色（HEXコード）',
  is_default BOOLEAN DEFAULT FALSE COMMENT 'デフォルトカテゴリかどうか',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. デフォルトカテゴリを挿入
INSERT INTO categories (category_key, category_name, category_icon, category_color, is_default) VALUES 
('english', '英語', '🇺🇸', '#007bff', TRUE),
('applied', '応用情報', '💻', '#28a745', TRUE),
('advanced', '高度情報', '🔧', '#dc3545', TRUE),
('gkentei', 'G検定', '🤖', '#ffc107', TRUE),
('ycne', 'YCNE', '🌐', '#6c757d', TRUE)
ON DUPLICATE KEY UPDATE 
  category_name = VALUES(category_name),
  category_icon = VALUES(category_icon),
  category_color = VALUES(category_color);

-- 4. 現在のテーブル構造を確認
DESCRIBE terms;
DESCRIBE categories;

-- 5. 既存データの確認
SELECT DISTINCT category, COUNT(*) as count FROM terms GROUP BY category;
SELECT * FROM categories ORDER BY created_at;

-- 6. 新しいカテゴリでテストデータを挿入（動作確認用）
-- 先にカテゴリを追加
INSERT INTO categories (category_key, category_name, category_icon, category_color) VALUES 
('security', '情報セキュリティ', '🔒', '#9b59b6'),
('cloud', 'クラウド', '☁️', '#17a2b8'),
('database', 'データベース', '🗄️', '#fd7e14')
ON DUPLICATE KEY UPDATE 
  category_name = VALUES(category_name),
  category_icon = VALUES(category_icon),
  category_color = VALUES(category_color);

-- 次に語句データを追加
INSERT INTO terms (word, meaning, example, category) VALUES 
('暗号化', 'データを第三者に読み取られないよう変換する技術', 'AES暗号化を使用してデータを保護する', 'security'),
('クラウドコンピューティング', 'インターネット経由でコンピューティングリソースを利用するサービス', 'AWS、Azure、GCPなどがクラウドサービスの代表例', 'cloud'),
('正規化', 'データベース設計において冗長性を排除し整合性を保つ手法', '第1正規形、第2正規形、第3正規形がある', 'database');

-- 7. 挿入されたデータの確認
SELECT t.*, c.category_name, c.category_icon, c.category_color 
FROM terms t 
LEFT JOIN categories c ON t.category = c.category_key 
WHERE t.category IN ('security', 'cloud', 'database') 
ORDER BY t.created_at DESC;

/**
 * 実行後の確認項目:
 * 
 * 1. DESCRIBE terms; で category が VARCHAR(100) になっているか
 * 2. DESCRIBE categories; で新しいテーブルが作成されているか
 * 3. SELECT * FROM categories; でデフォルトカテゴリが登録されているか
 * 4. 新しいカテゴリのデータが正常に挿入されているか
 * 5. JOINクエリでカテゴリ情報が正しく取得できるか
 * 
 * API側で必要な変更:
 * - GET /api/categories エンドポイントの追加
 * - POST /api/categories エンドポイントの追加（カテゴリ追加）
 * - PUT /api/categories/:id エンドポイントの追加（カテゴリ編集）
 * - DELETE /api/categories/:id エンドポイントの追加（カテゴリ削除）
 * - GET /api/terms でカテゴリ情報もJOINして取得
 */
