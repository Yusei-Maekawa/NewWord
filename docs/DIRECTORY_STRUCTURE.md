# 📁 プロジェクト構造 (整理後)

## ルートディレクトリ
```
StudyingEverything/
├── .env                    # 環境変数（Docker用）
├── .gitignore             # Git除外設定
├── docker-compose.yml     # Docker構成
├── package.json           # Node.js依存関係
├── package-lock.json      # 依存関係ロック
├── server.js              # APIサーバー
├── tsconfig.json          # TypeScript設定
└── README.md              # メインドキュメント
```

## ディレクトリ構造

### 🖥️ **src/** - React アプリケーション
```
src/
├── App.tsx                # メインアプリコンポーネント
├── index.tsx              # エントリーポイント
├── SimpleApp.tsx          # シンプル版アプリ
├── types.ts               # TypeScript型定義
├── components/            # UIコンポーネント
├── data/                  # 静的データ
├── hooks/                 # カスタムフック
├── styles/                # CSSスタイル
└── utils/                 # ユーティリティ関数
```

### 🌐 **public/** - 静的ファイル
```
public/
├── index.html             # メインHTML
└── test.html              # テスト用HTML
```

### 🛢️ **database/** - データベース関連
```
database/
├── sql/                   # SQLスクリプト
│   ├── create-categories-table.sql
│   ├── create-terms-table.sql
│   ├── hierarchical-categories.sql
│   ├── add-display-order.sql
│   ├── add-foreign-key.sql
│   ├── add-is-favorite.sql
│   ├── add-parent-id.sql
│   ├── check-mysql-settings.sql
│   ├── database_update.sql
│   ├── mysql-optimize.sql
│   ├── step1-check-database.sql
│   ├── step2-add-hierarchy.sql
│   └── update-database.sql
└── debug/                 # デバッグ用ファイル
    ├── debug-categories.js
    ├── debug-hierarchy.sql
    └── debug-images.js
```

### 🐳 **Docker関連**
```
mysql-conf/
└── my.cnf                 # MySQL設定

mysql-init/
├── 01-create-categories.sql
├── 02-hierarchical-categories.sql
└── 03-create-terms.sql
```

### 🤖 **batch-scripts/** - バッチファイル
```
batch-scripts/
├── fix-database.bat
├── fix-react-app.bat
├── reset-and-start.bat
├── setup-hierarchical-categories.bat
├── start-frontend.bat
├── start-react.bat
├── start-server.bat
├── debug-test.bat
└── test-new-categories.bat
```

### 🧪 **tests/** - テストファイル
```
tests/
├── browser-test.html
└── test_favorite_api.js
```

### 📝 **docs/** - ドキュメント
```
docs/
├── backup_scheduler.md
├── docker_setup.md
├── DATA_PROTECTION_CHECKLIST.md
├── DIRECTORY_STRUCTURE.md
├── README_DB_BACKUP.md
└── RELEASE_CHECKLIST.md
```

### ⚙️ **scripts/** - 自動化スクリプト
```
scripts/
└── backup_mysql.ps1      # 自動バックアップ
```

### 📦 **その他**
```
backup/                    # 旧バックアップファイル
build/                     # ビルド済みファイル
node_modules/              # Node.js依存関係
```

## 📊 整理のメリット

### ✅ **改善点**
- **可読性向上**: 関連ファイルがグループ化
- **保守性向上**: 目的別にファイルが整理
- **開発効率**: 必要なファイルを素早く発見
- **新規参加者**: プロジェクト構造が理解しやすい

### 🎯 **ファイル分類**
- **データベース**: `database/` フォルダに集約
- **バッチ処理**: `batch-scripts/` フォルダに集約  
- **テスト**: `tests/` フォルダに集約
- **ドキュメント**: `docs/` フォルダに集約
- **自動化**: `scripts/` フォルダに集約

これで、プロジェクトがずっと整理され、管理しやすくなりました！ 🎉
