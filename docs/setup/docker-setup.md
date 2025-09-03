# 🚀 Docker環境セットアップガイド

## 概要

XAMPPの代わりにDockerを使用することで、より安定したデータベース環境を実現できます。

## 前提条件

- Docker Desktopがインストールされていること
- Docker Composeが利用可能であること

## セットアップ手順

### 1. 環境変数の確認

`.envファイル`が既に作成されています：
```bash
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_USER_PASSWORD=apppassword
MYSQL_DATABASE=studying_app
```

### 2. Dockerコンテナを起動

```bash
docker-compose up -d
```

**重要**: Docker MySQLはポート3307で起動します（XAMPPと共存可能）

### 3. 起動状況の確認

```bash
# コンテナの状態確認
docker-compose ps

# ログの確認（初回は数分かかります）
docker-compose logs mysql
```

### 4. データベースの初期化（初回のみ）

```bash
# データベース作成
docker-compose exec mysql mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS studying_app;"

# テーブル作成（順番重要）
docker-compose exec mysql mysql -u root -p studying_app < mysql-init/03-create-terms.sql
docker-compose exec mysql mysql -u root -p studying_app < mysql-init/01-create-categories.sql
docker-compose exec mysql mysql -u root -p studying_app < mysql-init/02-hierarchical-categories.sql
```

**パスワード**: `.env`ファイルの`MYSQL_ROOT_PASSWORD`（デフォルト: `rootpassword`）

### 5. アプリケーションの起動

```bash
# APIサーバーを起動
node server.js

# Reactアプリを起動（別ターミナル）
npm start
```

## Docker管理コマンド

### 基本操作

```bash
# コンテナの停止
docker-compose down

# コンテナの再起動
docker-compose restart

# データベースの再構築（データは保持）
docker-compose up -d --build mysql

# ログの確認
docker-compose logs mysql

# MySQLコンテナに入る
docker-compose exec mysql mysql -u root -p
```

### データ管理

```bash
# バックアップの実行
.\scripts\backup_mysql.ps1

# XAMPPからDockerへのデータ移行
docker-compose exec mysql mysql -u root -p studying_app < C:\backups\all_db_YYYYMMDD_HHMMSS.sql

# データベースの確認
docker-compose exec mysql mysql -u root -p studying_app -e "SHOW TABLES;"
```

## Docker環境の利点

- ✅ XAMPPの権限問題によるデータベース破損を防ぐ
- ✅ 環境の一貫性（他のマシンでも同じ環境を再現可能）
- ✅ 自動バックアップとリストアが容易
- ✅ バージョン管理がしやすい
- ✅ XAMPPと同時使用可能（ポート分離）

## トラブルシューティング

### ポート競合エラー

```
Error: ports are not available: exposing port TCP 0.0.0.0:3306
```

**解決方法**: XAMPPのMySQLを停止するか、docker-compose.ymlでポートを変更（現在は3307に設定済み）

### コンテナが起動しない

```bash
# コンテナのログを確認
docker-compose logs mysql

# コンテナを完全に削除して再作成
docker-compose down -v
docker-compose up -d
```

### データが見つからない

```bash
# データベースの存在確認
docker-compose exec mysql mysql -u root -p -e "SHOW DATABASES;"

# テーブルの存在確認
docker-compose exec mysql mysql -u root -p studying_app -e "SHOW TABLES;"
```

## 関連ドキュメント

- [データ保護システム](../DATA_PROTECTION_CHECKLIST.md)
- [データベースバックアップガイド](../README_DB_BACKUP.md)
- [プロジェクト構造](../DIRECTORY_STRUCTURE.md)
