@echo off
echo ========================================
echo データベース更新: categoriesテーブル作成
echo ========================================
echo.

echo ❌ 問題: categoriesテーブルが存在しません
echo ✅ 解決: database_update.sql を実行してテーブルを作成します
echo.

echo 手順:
echo 1. XAMPPコントロールパネルでMySQLを起動
echo 2. phpMyAdmin (http://localhost/phpmyadmin) を開く
echo 3. study_app データベースを選択
echo 4. 以下のSQLを実行

echo.
echo ========================================
echo 実行するSQL:
echo ========================================
type database_update.sql

echo.
echo ========================================
echo 自動実行を試行中...
echo ========================================

echo MySQL接続をテスト中...
mysql -u root -p -e "USE study_app; SHOW TABLES LIKE 'categories';" 2>nul
if %errorlevel% equ 0 (
    echo ✅ MySQL接続成功
    echo database_update.sqlを実行中...
    mysql -u root -p study_app < database_update.sql
    if %errorlevel% equ 0 (
        echo ✅ データベース更新完了
        echo.
        echo 確認中...
        node debug-categories.js
        echo.
        echo 🎉 categoriesテーブルが作成されました！
        echo 🚀 アプリを起動します...
        echo.
        start cmd /k "cd /d %~dp0 && echo APIサーバーを起動中... && node server.js"
        timeout /t 2 /nobreak > nul
        start cmd /k "cd /d %~dp0 && echo Reactアプリを起動中... && npm start"
    ) else (
        echo ❌ データベース更新に失敗しました
        goto manual
    )
) else (
    echo ❌ MySQL自動接続に失敗しました
    goto manual
)

goto end

:manual
echo.
echo ========================================
echo 手動実行が必要です
echo ========================================
echo 1. XAMPPでMySQLを起動
echo 2. phpMyAdmin (http://localhost/phpmyadmin) を開く
echo 3. study_app データベースを選択
echo 4. database_update.sql の内容をコピー&ペーストして実行
echo.
echo その後、test-new-categories.bat を実行してください
echo.

:end
pause
