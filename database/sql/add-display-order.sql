-- display_orderカラムを追加
USE studying_everything;

-- 3. display_orderカラムを追加
ALTER TABLE categories 
ADD COLUMN display_order INT DEFAULT 0 COMMENT '表示順序';

-- 確認
DESCRIBE categories;
