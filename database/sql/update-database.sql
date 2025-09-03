-- 階層カテゴリ機能のためのデータベース更新
-- 実行前にXAMPPでMySQLを起動してください

USE studying_everything;

-- まず、現在のテーブル構造を確認
DESCRIBE categories;

-- 1. categoriesテーブルに階層構造フィールドを追加
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS parent_id INT DEFAULT NULL COMMENT '親カテゴリのID',
ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT FALSE COMMENT 'お気に入りカテゴリかどうか',
ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0 COMMENT '表示順序';

-- 2. is_defaultカラムが存在する場合は削除
-- ALTER TABLE categories DROP COLUMN IF EXISTS is_default;

-- 3. 外部キー制約を追加（既に存在する場合はスキップされる）
-- 既存の制約をチェック
SELECT 
  CONSTRAINT_NAME, 
  COLUMN_NAME, 
  REFERENCED_TABLE_NAME, 
  REFERENCED_COLUMN_NAME 
FROM information_schema.KEY_COLUMN_USAGE 
WHERE TABLE_NAME = 'categories' 
  AND TABLE_SCHEMA = 'studying_everything'
  AND REFERENCED_TABLE_NAME IS NOT NULL;

-- 外部キー制約を追加（存在しない場合のみ）
SET @constraint_exists = (SELECT COUNT(*) FROM information_schema.KEY_COLUMN_USAGE 
                         WHERE TABLE_NAME = 'categories' 
                           AND COLUMN_NAME = 'parent_id' 
                           AND CONSTRAINT_NAME = 'fk_parent_category'
                           AND TABLE_SCHEMA = 'studying_everything');

SET @sql = IF(@constraint_exists = 0, 
  'ALTER TABLE categories ADD CONSTRAINT fk_parent_category FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE;',
  'SELECT "外部キー制約は既に存在します" as message;');

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 4. 既存カテゴリをお気に入りに設定（デフォルトカテゴリの代替）
UPDATE categories SET is_favorite = TRUE, display_order = 1 WHERE category_key = 'english';
UPDATE categories SET is_favorite = TRUE, display_order = 2 WHERE category_key = 'applied';
UPDATE categories SET display_order = 3 WHERE category_key = 'advanced';
UPDATE categories SET display_order = 4 WHERE category_key = 'gkentei';
UPDATE categories SET display_order = 5 WHERE category_key = 'ycne';

-- 5. 現在のテーブル構造を再確認
DESCRIBE categories;

-- 6. 確認クエリ - 階層構造の表示
SELECT 
  c1.id,
  c1.category_name AS category,
  c1.category_key,
  c2.category_name AS parent,
  c1.parent_id,
  c1.is_favorite,
  c1.display_order,
  c1.category_icon,
  c1.created_at
FROM categories c1
LEFT JOIN categories c2 ON c1.parent_id = c2.id
ORDER BY 
  c1.is_favorite DESC,
  COALESCE(c2.display_order, c1.display_order),
  c1.display_order,
  c1.created_at;

-- 7. 階層構造のテスト用カテゴリデータを挿入（既存の場合はスキップ）
INSERT IGNORE INTO categories (category_key, category_name, category_icon, category_color, parent_id, is_favorite, display_order)
VALUES 
  ('test_root', 'テストルート', '🧪', '#28a745', NULL, FALSE, 100),
  ('test_child1', 'テスト子1', '🔹', '#17a2b8', (SELECT id FROM categories WHERE category_key = 'test_root'), FALSE, 101),
  ('test_child2', 'テスト子2', '🔸', '#ffc107', (SELECT id FROM categories WHERE category_key = 'test_root'), FALSE, 102);

-- 8. 階層構造テストの確認
SELECT 
  'テスト結果: 階層構造' as title,
  c1.category_name AS child_category,
  c2.category_name AS parent_category,
  CASE WHEN c1.parent_id IS NOT NULL THEN '✅ 正常' ELSE '❌ 問題あり' END as status
FROM categories c1
LEFT JOIN categories c2 ON c1.parent_id = c2.id
WHERE c1.category_key LIKE 'test_%'
ORDER BY c1.display_order;
