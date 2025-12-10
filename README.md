# 🎓 学習用語句振り返りアプリ (React版)

[![Version](https://img.shields.io/badge/version-0.3.0-blue.svg)](./VERSION.md)
[![Development Stage](https://img.shields.io/badge/stage-alpha-orange.svg)](./VERSION.md)
[![License](https://img.shields.io/badge/license-ISC-green.svg)](./package.json)

資格試験の学習用語句を効率的に管理・復習するためのReact Webアプリケーションです。

> **現在のバージョン**: `0.3.0` - Alpha Release (開発段階)  
> 詳細な変更履歴は[VERSION.md](./VERSION.md)をご覧ください。

## 📊 開発背景

これからいろいろな資格に挑戦していきたいことから、自分の学習記録を残しておくと楽しく勉強できると思い開発に至った。
また、学習した用語をいつでも振り返ることができるようにすることで、知識の定着を図りたいと考えています。
その後の話ではあるが、勉強は「人に教えることでも成長する」と言われているため、自分の作ったカードを他の人にも共有できるようにしたいという思いもあります。

## このアプリの将来像
📚 個人学習と複数人学習の両立を目指して

学習には 一人で集中して積み上げる時間 と、
他者に共有したり教え合うことで深く理解する時間 のどちらも重要だと考えています。

しかし実際の学習ツールは、

「個人の記録」に特化したもの

「他者との共有」に特化したもの
のどちらかに偏りがちで、両者を自然に行き来できる仕組みはあまり多くありません。

NewWord ではこのギャップを埋めたいという思いがあります。

まずは、
自分の学習ログや語句カードをしっかり蓄積できる “個人の学びの土台” を作りつつ、
将来的には、
自分が作ったカードを他の人にも共有し、学びを広げられる “軽いコミュニティ性” を取り入れたいと考えています。

「一人で学び、そして誰かに伝えることでさらに成長する」
この両方を支えられるような学習体験を実現するために、NewWord を開発しています。

## 🚀 クイックスタート

```bash
# 1. Docker環境起動（推奨）
docker-compose up -d

# 2. APIサーバー起動
node server.js

# 3. Reactアプリ起動
npm start

# 4. ブラウザでアクセス
# http://localhost:3000
```

📖 **詳細な手順**: [アプリケーション起動ガイド](docs/guides/getting-started.md)

## 📁 プロジェクト構造

```
StudyingEverything/
├── 🖥️ src/                   # React アプリケーション
│   ├── components/           # UIコンポーネント
│   ├── hooks/               # カスタムフック (useTermsFirestore, useTerms)
│   ├── data/                # 静的データ・設定ファイル
│   ├── styles/              # CSSスタイルシート
│   ├── utils/               # ユーティリティ関数・ヘルパー
│   └── types.ts             # TypeScript型定義
├── � docs/                  # ドキュメント
│   ├── guides/              # 使用ガイド（起動・開発手順）
│   ├── setup/               # 環境セットアップガイド
│   ├── TROUBLESHOOTING.md   # トラブルシューティング
│   ├── DIRECTORY_STRUCTURE.md # プロジェクト構造詳細
│   └── DATA_PROTECTION_CHECKLIST.md # データ保護システム
├── ⚙️ config/                # 設定ファイル
│   └── firestore.rules      # Firestoreセキュリティルール
├── 🤖 batch-scripts/         # 自動化バッチファイル（起動・修正）
├── ⚙️ scripts/               # 自動化スクリプト（バックアップ等）
├── 🧪 tests/                 # テストファイル（API・ブラウザテスト）
├── �️ database/              # データベース関連ファイル（レガシー）
│   ├── sql/                 # SQLスクリプト（テーブル作成・更新）
│   └── debug/               # デバッグ用ファイル
├── 🐳 mysql-conf/           # MySQL設定ファイル（レガシー）
├── 🐳 mysql-init/           # Docker MySQL初期化スクリプト（レガシー）
├── 📦 build/                # ビルド済みファイル
├── 📁 backup/               # 旧バージョンのバックアップ
├── 🐳 docker-compose.yml    # Docker設定
├── 🔥 firebase.json         # Firebase Hosting設定
├── 📄 server.js             # Node.js APIサーバー（レガシー）
├── 📄 package.json          # npm依存関係・スクリプト
└── 📄 tsconfig.json         # TypeScript設定
```

### 📂 各ディレクトリの詳細

| ディレクトリ | 説明 | 主要ファイル |
|-------------|------|-------------|
| **src/** | Reactアプリのソースコード | App.tsx, index.tsx, types.ts, hooks/ |
| **docs/** | プロジェクトドキュメント | セットアップ・開発・運用・トラブルシューティング |
| **config/** | 設定ファイル | firestore.rules（Firestoreセキュリティルール） |
| **batch-scripts/** | Windows用自動化スクリプト | 起動・修正・テスト用.batファイル |
| **scripts/** | 自動化スクリプト | MySQL自動バックアップ、Firebase移行等 |
| **tests/** | テスト・検証ファイル | API動作テスト、ブラウザテスト |
| **database/** | データベース関連（レガシー） | SQLスクリプト、デバッグツール ※MySQL時代の遺産 |
| **mysql-conf/** | MySQL設定（レガシー） | Docker用設定ファイル ※現在はFirestore使用 |
| **mysql-init/** | DB初期化（レガシー） | Docker起動時の初期SQL ※現在はFirestore使用 |
| **build/** | 本番用ビルド | React本番ビルド成果物 |
| **backup/** | 旧バージョン保管 | 以前のバニラJS版等 |

📋 **詳細構成**: [プロジェクト構造](docs/DIRECTORY_STRUCTURE.md)

## 🛡️ データ保護システム

### 3重保護体制で絶対にデータを失いません

| 保護レベル | 説明 | 状態 |
|------------|------|------|
| **自動バックアップ** | 毎日自動実行・7世代管理 | ✅ 稼働中 |
| **Docker MySQL** | 安定コンテナ環境（ポート3307） | ✅ 稼働中 |
| **XAMPP MySQL** | 緊急時の保険（ポート3306） | ✅ 併用可能 |

📋 **詳細**: [データ保護チェックリスト](docs/DATA_PROTECTION_CHECKLIST.md)

## 📖 ドキュメント

### 📦 バージョン管理
- [VERSION.md](./VERSION.md) - **バージョン履歴と変更ログ**
  - セマンティックバージョニング採用
  - リリースノート・機能追加履歴
  - 今後のロードマップ


### 🚀 セットアップガイド　(現在、セットアップ途中での不具合があり)
- [アプリケーション起動ガイド](docs/guides/getting-started.md) - 基本的な起動手順
- [Docker環境セットアップ](docs/setup/docker-setup.md) - 推奨環境の構築
- [XAMPP環境セットアップ](docs/setup/xampp-setup.md) - 従来環境の構築

### 🔧 開発者向け
- [開発ガイド](docs/guides/development.md) - 開発環境・ワークフロー
- [プロジェクト構造](docs/DIRECTORY_STRUCTURE.md) - ファイル構成の詳細
- [トラブルシューティング](docs/TROUBLESHOOTING.md) - よくある問題と解決方法

### 🛡️ 運用・保守
- [データ保護システム](docs/DATA_PROTECTION_CHECKLIST.md) - バックアップ・復旧手順
- [データベースバックアップ](docs/README_DB_BACKUP.md) - バックアップの詳細
- [リリースチェックリスト](docs/RELEASE_CHECKLIST.md) - デプロイ前確認事項
- [バグ修正履歴](docs/BUG_FIXES.md) - 🐛 バグ修正の記録と学び

## 📚 開発ドキュメント

- **[📖 開発記録](DEVELOPMENT_LOG.md)** - プロジェクトの開発履歴と技術的決定
- **[📋 データ保護チェックリスト](docs/DATA_PROTECTION_CHECKLIST.md)** - データバックアップ手順
- **[⚙️ データベースバックアップ](docs/README_DB_BACKUP.md)** - DB復旧手順
- **[🚀 リリースチェックリスト](docs/RELEASE_CHECKLIST.md)** - リリース手順




## 🤝 コントリビューション

プロジェクトへの貢献を歓迎します！

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/AmazingFeature`)
3. 変更をコミット (`git commit -m 'Add some AmazingFeature'`)
4. ブランチをプッシュ (`git push origin feature/AmazingFeature`)
5. プルリクエストを作成

## 📞 サポート

- **Issues**: [GitHub Issues](https://github.com/Yusei-Maekawa/English-Studying/issues)
- **Documentation**: [docs/](docs/) フォルダ内の各種ガイド



