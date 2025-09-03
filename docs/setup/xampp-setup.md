# 💻 XAMPP環境セットアップガイド

## 概要

従来のXAMPP環境での起動手順です。データ保護のため、Docker環境の併用を強く推奨します。

## 前提条件

- XAMPPがインストールされていること
- ApacheとMySQLが利用可能であること

## セットアップ手順

### 1. XAMPPの起動

1. XAMPPコントロールパネルを**管理者権限**で起動
2. MySQLの「Start」ボタンをクリック
3. Apacheの「Start」ボタンをクリック
4. 両方とも緑色の「Running」になることを確認

### 2. データベースの作成

1. ブラウザで `http://localhost/phpmyadmin` を開く
2. 「データベース」タブをクリック
3. データベース名「study_app」を入力して「作成」

### 3. テーブルの作成

phpMyAdminのSQLタブで以下を順番に実行：

#### 3.1 termsテーブルの作成
```sql
CREATE TABLE IF NOT EXISTS terms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  word VARCHAR(255) NOT NULL,
  meaning TEXT,
  example TEXT,
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_category ON terms(category);
CREATE INDEX idx_word ON terms(word);
```

#### 3.2 categoriesテーブルの作成
```sql
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_key VARCHAR(100) NOT NULL UNIQUE,
  category_name VARCHAR(200) NOT NULL,
  category_icon VARCHAR(10) DEFAULT '📝',
  category_color VARCHAR(7) DEFAULT '#6c757d',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO categories (category_key, category_name, category_icon, category_color, is_default) VALUES 
('english', '英語', '🇺🇸', '#007bff', TRUE),
('applied', '応用情報', '💻', '#28a745', TRUE),
('advanced', '高度情報', '🔧', '#dc3545', TRUE),
('gkentei', 'G検定', '🤖', '#ffc107', TRUE),
('ycne', 'YCNE', '🌐', '#6c757d', TRUE)
ON DUPLICATE KEY UPDATE 
  category_name = VALUES(category_name);
```

#### 3.3 階層構造の追加
```sql
ALTER TABLE categories 
ADD COLUMN parent_id INT DEFAULT NULL COMMENT '親カテゴリのID（NULLの場合はルートカテゴリ）',
ADD COLUMN is_favorite BOOLEAN DEFAULT FALSE COMMENT 'お気に入りカテゴリかどうか',
ADD COLUMN display_order INT DEFAULT 0 COMMENT '表示順序',
DROP COLUMN is_default;

ALTER TABLE categories 
ADD CONSTRAINT fk_parent_category 
FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE CASCADE;
```

### 4. アプリケーションの起動

```bash
# APIサーバーを起動
node server.js

# Reactアプリを起動（別ターミナル）
npm start
```

### 5. 動作確認

1. ブラウザで `http://localhost:3000` を開く
2. APIエンドポイント `http://localhost:4000/api/terms` で空配列が返ることを確認

## XAMPP管理コマンド

### サービス管理

```bash
# XAMPPコントロールパネルを管理者権限で起動
Start-Process "C:\xampp\xampp-control.exe" -Verb runAs

# サービス状態確認
Get-Service | Where-Object {$_.Name -like "*mysql*"}
```

### データベース操作

```bash
# MySQLコマンドライン接続
"C:\xampp\mysql\bin\mysql.exe" -u root -p

# データベースバックアップ
.\scripts\backup_mysql.ps1

# 手動バックアップ
"C:\xampp\mysql\bin\mysqldump.exe" -u root -p --all-databases > backup.sql
```

## 注意事項

### ⚠️ データ保護の重要性

XAMPP環境では以下のリスクがあります：

1. **権限問題によるデータ破損**
2. **予期しないサービス停止**
3. **設定ファイルの競合**

### 🛡️ 推奨対策

1. **Docker環境の併用**（最重要）
2. **定期的な自動バックアップ**
3. **複数環境でのデータ同期**

## トラブルシューティング

### MySQLが起動しない

```bash
# エラーログの確認
Get-Content "C:\xampp\mysql\data\mysql_error.log" -Tail 20

# データディレクトリの権限修正
icacls "C:\xampp\mysql\data" /grant "Everyone:(OI)(CI)F" /T
```

### phpMyAdminにアクセスできない

1. Apacheが起動しているか確認
2. ファイアウォール設定の確認
3. `http://localhost/phpmyadmin` のURLを確認

### データベース接続エラー

```javascript
// server.jsの接続設定確認
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: '', // XAMPPデフォルトは空パスワード
  database: 'studying_app',
  port: 3306
};
```

## 関連ドキュメント

- [Docker環境セットアップ](docker-setup.md) 【推奨】
- [データ保護システム](../DATA_PROTECTION_CHECKLIST.md)
- [データベースバックアップガイド](../README_DB_BACKUP.md)
