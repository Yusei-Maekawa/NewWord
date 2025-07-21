@echo off
chcp 65001
echo ========================================
echo    React アプリケーション修復ツール
echo ========================================
echo.

cd /d "%~dp0"

echo 1. npm キャッシュをクリアしています...
npm cache clean --force
echo    ✓ 完了
echo.

echo 2. node_modules フォルダを削除しています...
if exist "node_modules" rmdir /s /q "node_modules"
echo    ✓ 完了
echo.

echo 3. package-lock.json を削除しています...
if exist "package-lock.json" del "package-lock.json"
echo    ✓ 完了
echo.

echo 4. 依存関係を再インストールしています...
npm install
echo    ✓ 完了
echo.

echo 5. 開発サーバーを起動しています...
echo    ブラウザで http://localhost:3000 を開いてください
echo.
npm start

pause
