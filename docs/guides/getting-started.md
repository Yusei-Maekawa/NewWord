# 📱 アプリケーション起動ガイド

## 🚀 クイックスタート

### 推奨環境（Docker）

```bash
# 1. Docker環境起動
docker-compose up -d

# 2. APIサーバー起動
node server.js

# 3. Reactアプリ起動
npm start

# 4. ブラウザでアクセス
# http://localhost:3000
```

### 従来環境（XAMPP）

```bash
# 1. XAMPPでMySQL・Apache起動

# 2. APIサーバー起動
node server.js

# 3. Reactアプリ起動
npm start

# 4. ブラウザでアクセス
# http://localhost:3000
```

## 📋 詳細な起動手順

### 1. 環境の選択

| 環境 | 推奨度 | データ安全性 | 設定難易度 |
|------|--------|--------------|------------|
| **Docker** | ⭐⭐⭐⭐⭐ | 🛡️ 高 | 📗 簡単 |
| **XAMPP** | ⭐⭐⭐ | ⚠️ 中 | 📙 普通 |

### 2. 初回セットアップ

#### Docker環境（推奨）
📖 **詳細**: [Docker環境セットアップガイド](../setup/docker-setup.md)

1. Docker Desktopのインストール確認
2. `docker-compose up -d` でコンテナ起動
3. データベース初期化（初回のみ）
4. アプリケーション起動

#### XAMPP環境
📖 **詳細**: [XAMPP環境セットアップガイド](../setup/xampp-setup.md)

1. XAMPPのインストール確認
2. MySQL・Apache起動
3. phpMyAdminでデータベース作成
4. アプリケーション起動

### 3. アプリケーション起動

```bash
# APIサーバー起動（ポート4000）
node server.js
# "Server running on port 4000" が表示されればOK

# Reactアプリ起動（ポート3000）- 別ターミナル
npm start
# ブラウザが自動で開く
```

### 4. 動作確認

1. **フロントエンド**: `http://localhost:3000`
2. **API**: `http://localhost:4000/api/terms`
3. **phpMyAdmin**: `http://localhost/phpmyadmin` (XAMPP使用時)

## 🔧 開発用コマンド

### 環境確認

```bash
# Node.jsバージョン確認
node --version

# npm依存関係確認
npm list

# Dockerバージョン確認
docker --version
docker-compose --version
```

### 開発用起動

```bash
# 開発モード（ホットリロード）
npm run dev

# ビルド
npm run build

# テスト実行
npm test
```

### データベース操作

```bash
# バックアップ実行
.\scripts\backup_mysql.ps1

# Docker MySQL接続
docker-compose exec mysql mysql -u root -p

# XAMPP MySQL接続
"C:\xampp\mysql\bin\mysql.exe" -u root -p
```

## 🚨 トラブルシューティング

### よくあるエラー

#### ポート競合エラー
```
Error: listen EADDRINUSE :::3000
```
**解決**: 他のアプリケーションがポート3000を使用中
```bash
# ポート使用状況確認
netstat -ano | findstr :3000

# プロセス終了
taskkill /PID [プロセスID] /F
```

#### データベース接続エラー
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```
**解決**: MySQL/Docker MySQLが起動していない
```bash
# Docker環境の場合
docker-compose up -d

# XAMPP環境の場合
# XAMPPコントロールパネルでMySQL起動
```

#### npm依存関係エラー
```
Module not found
```
**解決**: 依存関係の再インストール
```bash
# node_modulesを削除
rm -rf node_modules package-lock.json

# 再インストール
npm install
```

## 📱 ブラウザでの確認項目

### フロントエンド機能
- [ ] 用語一覧の表示
- [ ] 用語の追加・編集・削除
- [ ] カテゴリ管理
- [ ] 検索機能

### API動作確認
- [ ] GET `/api/terms` - 用語一覧取得
- [ ] POST `/api/terms` - 用語追加
- [ ] PUT `/api/terms/:id` - 用語更新
- [ ] DELETE `/api/terms/:id` - 用語削除

## 📚 関連ドキュメント

- 🐳 [Docker環境セットアップ](../setup/docker-setup.md)
- 💻 [XAMPP環境セットアップ](../setup/xampp-setup.md)
- 🛡️ [データ保護システム](../DATA_PROTECTION_CHECKLIST.md)
- 📁 [プロジェクト構造](../DIRECTORY_STRUCTURE.md)
