@echo off
chcp 65001
title React アプリ起動ツール

echo ========================================
echo     React アプリ起動ツール
echo ========================================
echo.

:: 現在のディレクトリをプロジェクトフォルダに変更
cd /d "%~dp0"
echo 現在のディレクトリ: %cd%
echo.

:: Node.jsとnpmのバージョンを確認
echo Node.js バージョン確認:
node --version
echo.
echo npm バージョン確認:
npm --version
echo.

:: package.jsonの存在確認
if not exist "package.json" (
    echo ❌ エラー: package.json が見つかりません
    pause
    exit /b 1
)
echo ✅ package.json を確認しました
echo.

:: node_modulesの存在確認
if not exist "node_modules" (
    echo ⚠️  node_modules が存在しません。npm install を実行します...
    npm install
    echo.
)

echo 開発サーバーを起動しています...
echo ブラウザで以下のURLを開いてください:
echo ➡️  http://localhost:3000
echo.
echo 注意: この窓は閉じないでください！
echo Ctrl+C で停止できます
echo.
echo ========================================
echo.

start http://localhost:3000
npm start

echo.
echo サーバーが停止しました
pause
