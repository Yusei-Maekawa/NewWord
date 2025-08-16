-- 外部キー制約を追加
USE studying_everything;

-- 4. 外部キー制約を追加
ALTER TABLE categories 
ADD CONSTRAINT fk_parent_category 
FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE;

-- 最終確認
DESCRIBE categories;

-- テスト用データを追加
SELECT 
  id,
  category_name,
  category_key,
  parent_id,
  is_favorite,
  display_order
FROM categories
ORDER BY parent_id, display_order, created_at;
