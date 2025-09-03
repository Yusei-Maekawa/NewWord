@echo off
echo ========================================
echo 動的カテゴリ管理機能の動作確認手順
echo ========================================
echo.

echo 1. データベースの準備
echo    - XAMPPコントロールパネルでMySQLを起動
echo    - phpMyAdmin (http://localhost/phpmyadmin) を開く
echo    - database_update.sql の内容を実行（categoriesテーブル作成）

echo.
echo 2. APIサーバーの起動
echo    実行中...
start cmd /k "cd /d %~dp0 && echo APIサーバーを起動中... && node server.js"

echo.
echo 3. Reactアプリの起動
timeout /t 3 /nobreak > nul
start cmd /k "cd /d %~dp0 && echo Reactアプリを起動中... && npm start"

echo.
echo ========================================
echo 動的カテゴリ管理機能の確認項目:
echo ========================================
echo 1. 「⚙️ カテゴリ管理」ボタンをクリック
echo 2. 新しいカテゴリ名を入力して追加（例: プログラミング）
echo 3. 追加されたカテゴリが一覧に表示されるか確認
echo 4. カテゴリ名の編集機能が動作するか確認
echo 5. 語句追加フォームで新しいカテゴリが選択できるか確認
echo 6. 新しいカテゴリで語句を追加してDBに保存されるか確認
echo 7. phpMyAdminで以下を確認:
echo    - categoriesテーブルに新しいカテゴリが登録されているか
echo    - termsテーブルに新しいカテゴリの語句が保存されているか
echo.
echo 【重要】デフォルトカテゴリは削除できないようになっています
echo 【重要】使用中のカテゴリは削除できないようになっています
echo.

echo ブラウザで http://localhost:3000 を開いて確認してください
echo.

pause
