-- データベースとテーブルを作成
-- 既存のstudy_appデータベースを使用
USE study_app;

-- まず現在のテーブル構造を確認
DESCRIBE categories;

-- 既存のcategoriesテーブルに階層構造カラムを追加
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS parent_id INT DEFAULT NULL COMMENT '親カテゴリのID',
ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT FALSE COMMENT 'お気に入りカテゴリかどうか',
ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0 COMMENT '表示順序';

-- 外部キー制約を追加（エラーが出ても無視してOK）
ALTER TABLE categories 
ADD CONSTRAINT fk_parent_category 
FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE;

-- テーブル構造の再確認
DESCRIBE categories;

-- 既存カテゴリのdisplay_orderを設定
UPDATE categories SET is_favorite = TRUE, display_order = 1 WHERE category_key = 'english';
UPDATE categories SET is_favorite = TRUE, display_order = 2 WHERE category_key = 'applied';  
UPDATE categories SET display_order = 3 WHERE category_key = 'advanced';
UPDATE categories SET display_order = 4 WHERE category_key = 'gkentei';
UPDATE categories SET display_order = 5 WHERE category_key = 'ycne';

-- 基本カテゴリを追加（存在しない場合のみ）
INSERT IGNORE INTO categories (category_key, category_name, category_icon, category_color, is_favorite, display_order) VALUES
('english', '英語', '🇬🇧', '#007bff', TRUE, 1),
('applied', '応用情報', '💻', '#28a745', TRUE, 2),
('advanced', '高度区分', '🎯', '#dc3545', FALSE, 3),
('gkentei', 'G検定', '🤖', '#ffc107', FALSE, 4),
('ycne', 'YCNE', '🌐', '#17a2b8', FALSE, 5);

-- 現在のカテゴリ一覧を確認
SELECT 
  id,
  category_name,
  category_key,
  category_icon,
  category_color,
  parent_id,
  is_favorite,
  display_order,
  created_at
FROM categories
ORDER BY display_order, created_at;
