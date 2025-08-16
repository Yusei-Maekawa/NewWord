@echo off
echo ========================================
echo 階層型カテゴリシステム + お気に入り機能
echo データベース更新スクリプト
echo ========================================
echo.

echo 📋 実行内容:
echo 1. categoriesテーブルに階層構造フィールドを追加
echo 2. is_defaultをis_favoriteに変更
echo 3. 親子関係とお気に入り機能を実装
echo 4. 既存のデフォルトカテゴリをお気に入りに変換
echo.

echo ⚠️  注意: この操作は既存のデータベース構造を変更します
pause

echo.
echo 🔄 SQLコマンドを実行中...
echo.

:: SQLコマンドを実行
mysql -u root study_app --execute="
-- 1. categoriesテーブルに階層構造フィールドを追加
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS parent_id INT DEFAULT NULL COMMENT '親カテゴリのID',
ADD COLUMN IF NOT EXISTS is_favorite BOOLEAN DEFAULT FALSE COMMENT 'お気に入りカテゴリかどうか',
ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0 COMMENT '表示順序';

-- 2. is_defaultカラムが存在する場合は削除
ALTER TABLE categories DROP COLUMN IF EXISTS is_default;

-- 3. 外部キー制約を追加
ALTER TABLE categories 
ADD CONSTRAINT IF NOT EXISTS fk_parent_category 
FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE;

-- 4. 既存カテゴリをお気に入りに設定（デフォルトカテゴリの代替）
UPDATE categories SET is_favorite = TRUE, display_order = 1 WHERE category_key = 'english';
UPDATE categories SET is_favorite = TRUE, display_order = 2 WHERE category_key = 'applied';
UPDATE categories SET display_order = 3 WHERE category_key = 'advanced';
UPDATE categories SET display_order = 4 WHERE category_key = 'gkentei';
UPDATE categories SET display_order = 5 WHERE category_key = 'ycne';

-- 5. 確認クエリ
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
"

if %errorlevel% equ 0 (
    echo.
    echo ✅ データベース更新完了！
    echo.
    echo 🎉 新機能:
    echo   - ⭐ お気に入りカテゴリ機能
    echo   - 📁 階層型カテゴリシステム
    echo   - 🔄 動的カテゴリ管理
    echo.
    echo 🚀 アプリケーションを起動しますか？ (Y/N)
    set /p choice=
    if /i "%choice%"=="Y" (
        echo.
        echo 🔥 APIサーバーを起動中...
        start cmd /k "cd /d %~dp0 && echo APIサーバー起動中... && node server.js"
        timeout /t 2 /nobreak > nul
        echo 🌐 Reactアプリを起動中...
        start cmd /k "cd /d %~dp0 && echo Reactアプリ起動中... && npm start"
        echo.
        echo 📱 ブラウザで http://localhost:3000 を開いてカテゴリ管理をお試しください！
    )
) else (
    echo.
    echo ❌ データベース更新に失敗しました
    echo.
    echo 🔧 手動で実行する場合:
    echo 1. XAMPPでMySQLを起動
    echo 2. phpMyAdmin (http://localhost/phpmyadmin) を開く
    echo 3. study_app データベースを選択
    echo 4. hierarchical-categories.sql の内容を実行
)

echo.
pause
