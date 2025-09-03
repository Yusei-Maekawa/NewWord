-- 階層カテゴリの問題をデバッグするためのSQLスクリプト

USE studying_everything;

-- 1. 現在のカテゴリテーブル構造を確認
DESCRIBE categories;

-- 2. 現在のすべてのカテゴリを表示（階層構造を確認）
SELECT 
  c1.id,
  c1.category_name AS カテゴリ名,
  c1.category_key AS キー,
  c1.parent_id AS 親ID,
  c2.category_name AS 親カテゴリ名,
  c1.is_favorite AS お気に入り,
  c1.display_order AS 表示順,
  c1.created_at AS 作成日時
FROM categories c1
LEFT JOIN categories c2 ON c1.parent_id = c2.id
ORDER BY 
  c1.parent_id IS NULL DESC,  -- ルートカテゴリを最初に
  c1.parent_id,               -- 親IDでグループ化
  c1.display_order,           -- 表示順
  c1.created_at;              -- 作成日順

-- 3. 階層構造のテスト用カテゴリを追加
-- まずテストデータをクリーンアップ
DELETE FROM categories WHERE category_key LIKE 'debug_%';

-- テスト用のルートカテゴリを追加
INSERT INTO categories (category_key, category_name, category_icon, category_color, parent_id, is_favorite, display_order)
VALUES ('debug_root', 'デバッグルート', '🧪', '#28a745', NULL, FALSE, 900);

-- 上記で追加されたルートカテゴリのIDを取得して子カテゴリを追加
SET @root_id = LAST_INSERT_ID();

INSERT INTO categories (category_key, category_name, category_icon, category_color, parent_id, is_favorite, display_order)
VALUES 
  ('debug_child1', 'デバッグ子1', '🔹', '#17a2b8', @root_id, FALSE, 901),
  ('debug_child2', 'デバッグ子2', '🔸', '#ffc107', @root_id, FALSE, 902);

-- 子カテゴリの下にさらに子カテゴリを追加
SET @child1_id = (SELECT id FROM categories WHERE category_key = 'debug_child1');

INSERT INTO categories (category_key, category_name, category_icon, category_color, parent_id, is_favorite, display_order)
VALUES ('debug_grandchild', 'デバッグ孫', '🔺', '#dc3545', @child1_id, FALSE, 903);

-- 4. テスト結果を確認
SELECT 
  '=== デバッグ: 階層構造テスト ===' AS タイトル;

SELECT 
  CASE 
    WHEN c1.parent_id IS NULL THEN CONCAT('ROOT: ', c1.category_name)
    WHEN c2.parent_id IS NULL THEN CONCAT('  ├─ ', c1.category_name, ' (親: ', c2.category_name, ')')
    ELSE CONCAT('    └─ ', c1.category_name, ' (親: ', c2.category_name, ')')
  END AS 階層表示,
  c1.id AS ID,
  c1.parent_id AS 親ID
FROM categories c1
LEFT JOIN categories c2 ON c1.parent_id = c2.id
WHERE c1.category_key LIKE 'debug_%'
ORDER BY 
  COALESCE(c2.parent_id, c1.id),  -- ルートでソート
  c1.parent_id,                   -- 親IDでソート
  c1.display_order;               -- 表示順でソート

-- 5. 問題の確認：親カテゴリに子カテゴリが正しく紐づいているか
SELECT 
  '=== 親子関係の確認 ===' AS タイトル;

SELECT 
  parent.category_name AS 親カテゴリ,
  GROUP_CONCAT(child.category_name ORDER BY child.display_order SEPARATOR ', ') AS 子カテゴリ一覧,
  COUNT(child.id) AS 子カテゴリ数
FROM categories parent
LEFT JOIN categories child ON parent.id = child.parent_id
WHERE parent.category_key LIKE 'debug_%' AND parent.parent_id IS NULL
GROUP BY parent.id, parent.category_name;
