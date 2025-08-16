@echo off
echo ========================================
echo カテゴリ取得エラーのデバッグ
echo ========================================
echo.

echo 1. デバッグスクリプトでデータベース状態を確認
echo 実行中...
node debug-categories.js
echo.

echo 2. APIサーバーを起動（デバッグ出力付き）
echo 実行中...
start cmd /k "cd /d %~dp0 && echo APIサーバーを起動中... && node server.js"

echo.
echo 3. Reactアプリを起動
timeout /t 3 /nobreak > nul
start cmd /k "cd /d %~dp0 && echo Reactアプリを起動中... && npm start"

echo.
echo ========================================
echo エラー確認手順:
echo ========================================
echo 1. ブラウザで http://localhost:3000 を開く
echo 2. F12 でデベロッパーツールを開く
echo 3. Console タブでエラーメッセージを確認
echo 4. Network タブで /api/categories のリクエスト状況を確認
echo.
echo ★ もしcategoriesテーブルが見つからない場合:
echo   1. XAMPPのMySQLを起動
echo   2. phpMyAdmin (http://localhost/phpmyadmin) を開く
echo   3. study_app データベースを選択
echo   4. database_update.sql の内容を実行
echo.

pause
