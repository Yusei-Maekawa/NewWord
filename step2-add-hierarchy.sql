-- 階層構造フィールドを追加（存在しない場合のみ）
USE studying_everything;

-- parent_idカラムを追加
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS parent_id INT DEFAULT NULL COMMENT '親カテゴリのID';

-- is_favoriteカラムを追加
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT FALSE COMMENT 'お気に入りカテゴリかどうか';

-- display_orderカラムを追加
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0 COMMENT '表示順序';

-- 外部キー制約を追加（エラーが出ても無視してOK）
ALTER TABLE categories 
ADD CONSTRAINT fk_parent_category 
FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE;

-- 確認
DESCRIBE categories;
