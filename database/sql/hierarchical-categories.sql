-- 階層型カテゴリシステムとお気に入り機能の実装
-- XAMPPのphpMyAdminで実行してください

-- 1. categoriesテーブルに階層とお気に入り機能を追加
ALTER TABLE categories 
ADD COLUMN parent_id INT DEFAULT NULL COMMENT '親カテゴリのID（NULLの場合はルートカテゴリ）',
ADD COLUMN is_favorite BOOLEAN DEFAULT FALSE COMMENT 'お気に入りカテゴリかどうか',
ADD COLUMN display_order INT DEFAULT 0 COMMENT '表示順序',
DROP COLUMN is_default;

-- 2. 外部キー制約を追加（親子関係）
ALTER TABLE categories 
ADD CONSTRAINT fk_parent_category 
FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE;

-- 3. 既存のデフォルトカテゴリを階層構造に変更

-- 英語カテゴリの子カテゴリを作成
UPDATE categories SET is_favorite = TRUE, display_order = 1 WHERE category_key = 'english';

INSERT INTO categories (category_key, category_name, category_icon, category_color, parent_id, display_order) VALUES
('english_words', '単語', '📝', '#007bff', (SELECT id FROM (SELECT id FROM categories WHERE category_key = 'english') AS temp), 1),
('english_grammar', '文法', '📚', '#007bff', (SELECT id FROM (SELECT id FROM categories WHERE category_key = 'english') AS temp), 2),
('english_usage', '用法', '💬', '#007bff', (SELECT id FROM (SELECT id FROM categories WHERE category_key = 'english') AS temp), 3);

-- 応用情報カテゴリの子カテゴリを作成
UPDATE categories SET is_favorite = TRUE, display_order = 2 WHERE category_key = 'applied';

INSERT INTO categories (category_key, category_name, category_icon, category_color, parent_id, display_order) VALUES
('applied_technology', 'テクノロジ', '💻', '#28a745', (SELECT id FROM (SELECT id FROM categories WHERE category_key = 'applied') AS temp), 1),
('applied_management', 'マネジメント', '📊', '#28a745', (SELECT id FROM (SELECT id FROM categories WHERE category_key = 'applied') AS temp), 2),
('applied_strategy', 'ストラテジ', '🎯', '#28a745', (SELECT id FROM (SELECT id FROM categories WHERE category_key = 'applied') AS temp), 3);

-- テクノロジの子カテゴリを作成
INSERT INTO categories (category_key, category_name, category_icon, category_color, parent_id, display_order) VALUES
('tech_security', 'セキュリティ', '🔒', '#28a745', (SELECT id FROM (SELECT id FROM categories WHERE category_key = 'applied_technology') AS temp), 1),
('tech_database', 'データベース', '🗄️', '#28a745', (SELECT id FROM (SELECT id FROM categories WHERE category_key = 'applied_technology') AS temp), 2),
('tech_network', 'ネットワーク', '🌐', '#28a745', (SELECT id FROM (SELECT id FROM categories WHERE category_key = 'applied_technology') AS temp), 3);

-- 他のカテゴリも階層対応
UPDATE categories SET display_order = 3 WHERE category_key = 'advanced';
UPDATE categories SET display_order = 4 WHERE category_key = 'gkentei';
UPDATE categories SET display_order = 5 WHERE category_key = 'ycne';

-- 4. 確認クエリ
SELECT 
  c1.id,
  c1.category_name AS category,
  c2.category_name AS parent,
  c1.is_favorite,
  c1.display_order,
  c1.category_icon
FROM categories c1
LEFT JOIN categories c2 ON c1.parent_id = c2.id
ORDER BY 
  c1.is_favorite DESC,
  COALESCE(c2.display_order, c1.display_order),
  c1.display_order;
