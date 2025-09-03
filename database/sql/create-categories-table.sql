-- categoriesテーブル作成（簡潔版）
-- XAMPPのphpMyAdminで実行してください

-- 1. 既存のcategoryカラムを拡張
ALTER TABLE terms MODIFY COLUMN category VARCHAR(100);

-- 2. categoriesテーブルを作成
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_key VARCHAR(100) NOT NULL UNIQUE,
  category_name VARCHAR(200) NOT NULL,
  category_icon VARCHAR(10) DEFAULT '📝',
  category_color VARCHAR(7) DEFAULT '#6c757d',
  is_default BOOLEAN DEFAULT FALSE,
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
  category_name = VALUES(category_name);

-- 4. 確認
SELECT * FROM categories;
