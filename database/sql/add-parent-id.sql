-- 階層構造フィールドを一つずつ追加
USE studying_everything;

-- 1. parent_idカラムを追加
ALTER TABLE categories 
ADD COLUMN parent_id INT DEFAULT NULL COMMENT '親カテゴリのID';

-- 確認
DESCRIBE categories;
