@echo off
echo Resetting React development environment...
echo.

echo Step 1: Clearing npm cache...
npm cache clean --force

echo.
echo Step 2: Removing node_modules and package-lock.json...
rmdir /s /q node_modules 2>nul
del package-lock.json 2>nul

echo.
echo Step 3: Reinstalling dependencies...
npm install

echo.
echo Step 4: Starting development server...
npm start

pause
