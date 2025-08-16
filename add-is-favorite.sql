-- is_favoriteカラムを追加
USE studying_everything;

-- 2. is_favoriteカラムを追加
ALTER TABLE categories 
ADD COLUMN is_favorite BOOLEAN DEFAULT FALSE COMMENT 'お気に入りカテゴリかどうか';

-- 確認
DESCRIBE categories;
