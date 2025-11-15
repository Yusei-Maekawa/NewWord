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

### 🚀 セットアップガイド
- [アプリケーション起動ガイド](docs/guides/getting-started.md) - 基本的な起動手順
- [Docker環境セットアップ](docs/setup/docker-setup.md) - 推奨環境の構築
- [XAMPP環境セットアップ](docs/setup/xampp-setup.md) - 従来環境の構築

### 🔧 開発者向け
- [開発ガイド](docs/guides/development.md) - 開発環境・ワークフロー
- [プロジェクト構造](docs/DIRECTORY_STRUCTURE.md) - ファイル構成の詳細

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

## 🎯 主な機能

### ✅ 実装済み機能

- ✅ **用語管理**: 追加・編集・削除・検索
- ✅ **カテゴリ管理**: 階層構造・お気に入り機能（Firestore永続化）
- ✅ **お気に入り機能**: 用語・カテゴリのお気に入り登録（再読み込み後も保持）
- ✅ **親子連動**: 親カテゴリをお気に入りにすると子カテゴリも自動でお気に入りに
- ✅ **リッチテキスト**: 色・サイズ指定可能（WYSIWYGエディタ）
- ✅ **学習ログ管理**: 学習時間の記録・統計・ストリーク計算
- ✅ **スケジュール機能**: 日付別・カテゴリ別の学習履歴表示
- ✅ **データ保護**: Firestore + 自動バックアップ体制
- ✅ **環境選択**: Firestore（デフォルト）/MySQL切り替え可能

### 🚧 開発中（MVP機能）

- 🔲 **統計グラフ可視化**: 学習時間の推移グラフ、ヒートマップカレンダー
- 🔲 **語句学習機能**: フラッシュカード、間隔反復学習（SM-2アルゴリズム）
- 🔲 **Vercelデプロイ**: 本番環境への自動デプロイ

詳細は [MVP機能設計ドキュメント](docs/MVP_FEATURES_DESIGN.md) を参照してください。

### 📝 最新の更新（2025-11-13）

**スケジュール機能（学習ログ管理）の実装**
- ✅ `useStudyLogs`カスタムフック実装（Firestore連携）
- ✅ 学習時間の記録・保存・削除機能
- ✅ 日付別・カテゴリ別の学習時間集計
- ✅ 学習ストリーク（連続学習日数）の計算
- ✅ 週次・月次の学習時間統計
- ✅ リアルタイムでの学習ログ同期
- ✅ `StudyLog`型にid, createdAt, updatedAtフィールドを追加
- ✅ MVP機能設計ドキュメント作成（docs/MVP_FEATURES_DESIGN.md）

### 📝 過去の更新（2025-11-02）

**カテゴリお気に入り機能の完全実装**
- ✅ `useCategoriesFirestore`フック実装（Firestore永続化）
- ✅ 親カテゴリのお気に入り登録で子カテゴリも連動
- ✅ 循環参照チェック機能追加（最大10階層）
- ✅ 不正データの自動修復機能
- ✅ デバッグツール追加（`window.debugFirestore`）
- ✅ ボタンネストエラー修正（HTMLバリデーション対応）

## 🏗️ コンポーネント設計

### React コンポーネント構成

```
src/components/
├── AddTermForm.tsx        # 用語追加フォーム
├── CategoryManager.tsx    # カテゴリ管理
├── CategoryNav.tsx        # カテゴリナビゲーション
├── CsvImportForm.tsx      # CSV インポート
├── EditTermModal.tsx      # 用語編集モーダル
├── Header.tsx             # ヘッダー
├── Notification.tsx       # 通知システム
├── ScheduleList.tsx       # スケジュール一覧
├── SchedulePage.tsx       # スケジュールページ
├── StudyLogCalendar.tsx   # 学習ログカレンダー
├── StudySection.tsx       # 学習セクション
├── StudyTimeInput.tsx     # 学習時間入力
├── TermsList.tsx          # 用語一覧表示
└── TermsList_fixed.tsx    # 修正版用語一覧
```

### 主要コンポーネントの役割

- **AddTermForm**: 新規用語の追加・リッチテキスト対応
- **TermsList**: 用語一覧表示・検索・フィルタリング
- **CategoryManager**: カテゴリの階層管理・色設定
- **EditTermModal**: 用語の編集・削除機能
- **StudySection**: 学習モード・復習機能
- **StudyTimeInput**: 学習時間の記録（ストップウォッチ・手動入力）
- **SchedulePage**: 学習スケジュール・統計表示

### カスタムフック

```
src/hooks/
├── useTermsFirestore.ts       # 語句データ管理（Firestore）
├── useCategoriesFirestore.ts  # カテゴリ管理（Firestore）
├── useStudyLogs.ts            # 学習ログ管理（Firestore）
├── useTerms.ts                # 語句データ管理（MySQL・レガシー）
└── useStudySession.ts         # 学習セッション管理
```

### Firestoreデータ構造

```typescript
// コレクション: terms（語句データ）
{
  id: string,              // ドキュメントID（自動生成）
  category: CategoryKey,   // カテゴリキー
  term: string,            // 語句
  meaning: string,         // 意味・説明
  example?: string,        // 使用例（オプション）
  imageUrl?: string,       // 画像URL（オプション）
  isFavorite?: boolean,    // お気に入りフラグ
  createdAt: Timestamp,    // 作成日時
  updatedAt?: Timestamp    // 更新日時
}

// コレクション: categories（カテゴリマスタ）
{
  id: string,              // ドキュメントID
  key: string,             // カテゴリキー
  name: string,            // 表示名
  icon: string,            // アイコン（絵文字）
  color: string,           // カラーコード
  parentId?: string,       // 親カテゴリID（階層構造用）
  isFavorite: boolean,     // お気に入りフラグ
  displayOrder: number     // 表示順序
}

// コレクション: studyLogs（学習ログ）
{
  id: string,              // ドキュメントID（自動生成）
  date: string,            // 学習日付（YYYY-MM-DD）
  category: string,        // カテゴリキー
  amount: number,          // 学習時間（分数）
  termsCount?: number,     // 追加した語句数（オプション）
  createdAt: Timestamp,    // 作成日時
  updatedAt: Timestamp     // 更新日時
}
```

## 🛠️ 技術スタック

| 分野 | 技術 |
|------|------|
| **フロントエンド** | React, TypeScript, CSS3 |
| **バックエンド** | Firebase (Firestore) / Node.js + Express + MySQL ※切り替え可能 |
| **インフラ** | Docker, Docker Compose |
| **開発ツール** | npm, Git, VS Code |

### 🔀 バックエンドモードの切り替え

このアプリケーションは2つのバックエンドモードをサポートしています：

1. **Firestoreモード（デフォルト、推奨）** - サーバーレス、リアルタイム同期
2. **MySQLモード** - 従来のExpress + MySQL構成

`.env`ファイルで切り替え可能：

```bash
# Firestoreを使用（デフォルト）
REACT_APP_BACKEND_MODE=firestore

# MySQLを使用
REACT_APP_BACKEND_MODE=mysql
```

**Firestoreモードの利点：**
- ✅ サーバー不要（サーバーレス）
- ✅ リアルタイム同期
- ✅ 自動スケーリング
- ✅ 無料枠が充実

**MySQLモードの利点：**
- ✅ ローカル完結
- ✅ SQL直接操作可能
- ✅ Docker環境で完全制御


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

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

---

## �📚 機能

### 🎯 語句管理
- **追加**: 新しい語句を4つのカテゴリに分けて追加
- **編集**: 既存の語句をモーダルで編集・更新
- **削除**: 不要な語句を削除（確認ダイアログ付き）
- **検索**: 語句、意味、例文から リアルタイム検索

### � 学習機能
- **ランダム表示**: カテゴリ別または全体からランダムに語句を出題
- **フラッシュカード**: 語句→意味の学習フロー
- **進捗表示**: 現在の学習進捗をリアルタイム表示
- **キーボードショートカット**: スペース/Enterキーで学習進行

### 💾 データ管理
- **自動保存**: ブラウザのローカルストレージに自動保存
- **初期データ**: 初回起動時にサンプルデータを自動読み込み
- **レスポンシブ**: モバイル・タブレット対応


## 🎯 使用方法

### 基本的な使い方
1. アプリ起動後、自動的にサンプルデータが読み込まれます
2. 「新しい語句を追加」で語句を追加
3. カテゴリボタンで表示を絞り込み
4. 「語句学習」でランダム学習開始
5. スペースキー/Enterキーで学習を進行

### キーボードショートカット
- `Ctrl+N` (Cmd+N): 新しい語句の入力フォームにフォーカス
- `Space` / `Enter`: 学習中の答え表示/次の語句
- `Escape`: 学習セッション終了

## 🔧 開発

### カスタムフック
- **useTerms**: 語句の CRUD 操作とローカルストレージ管理
- **useStudySession**: 学習セッションの状態管理

### TypeScript対応
- 完全な型安全性
- インターフェースによる厳密な型定義
- コンパイル時エラー検出

## 📱 レスポンシブ対応

- **デスクトップ**: フル機能
- **タブレット**: 適応レイアウト
- **モバイル**: シングルカラムレイアウト

## 🚀 今後の予定

### 🎯 最重要（次のアップデート）

- [x] **意味・説明欄のリッチテキスト対応**
  - 太字、色変更、下線などの装飾機能
  - マークダウン記法やリッチエディタの導入
  - 重要な部分を強調表示できる機能

- [x] **語句一覧の視認性向上**
  - カード型レイアウトの改善
  - カテゴリ別の色分け強化
  - グリッド表示/リスト表示の切り替え

### 🔥 学習機能の強化
- [ ] **間違えた語句の重点復習**
  - 正答率の記録・表示
  - 苦手語句の自動抽出
  - 復習優先度の自動設定
  - 間違い回数に応じた出題頻度調整

- [ ] **学習統計・進捗グラフ**
  - 日別・週別・月別の学習時間グラフ
  - カテゴリ別習得率の円グラフ
  - 学習継続日数（ストリーク）表示
  - 目標設定と達成率の可視化

- [ ] **スケジュール管理の改善**
  - 復習スケジュールの自動生成
  - リマインダー機能
  - 学習計画のテンプレート
  - 進捗に応じたスケジュール調整

### 🎨 UI/UX改善
- [ ] ダークモード対応
- [ ] より詳細な検索フィルター（難易度、習得率など）
- [ ] モバイル最適化の強化
- [ ] キーボードショートカットの拡充

---

### 💡 実装アイデア・メモ

#### 意味・説明欄のリッチテキスト化
```tsx
// 例：マークダウン記法対応
meaning: "**重要**な概念です。`コード`や*斜体*も使える"

// 例：色指定対応
meaning: "[red]重要[/red]な概念で、[blue]青色[/blue]で強調したい部分"

// 使用可能な色：
// [red]赤色[/red], [blue]青色[/blue], [green]緑色[/green]
// [orange]オレンジ[/orange], [purple]紫色[/purple], [pink]ピンク[/pink], [gray]グレー[/gray]
```

#### 語句一覧の改善案
- カード型レイアウト（現在のリスト型から変更）
- カテゴリ別アイコン（📚英語、💻応用情報など）
- 習得率バッジ（🔥完璧、⚡要復習、❓未学習）
- ソート機能（追加日、習得率、カテゴリ順）

#### 学習統計の実装例
```tsx
interface StudyStats {
  totalStudyTime: number;
  streakDays: number;
  categoryProgress: { [key: string]: number };
  weakTerms: Term[];
}
```

## 📄 以前のバージョン

バニラJavaScriptで作成された以前のバージョンは `backup/` フォルダに保存されています。

---

## 🔧 トラブルシューティング

よくある問題と解決方法については、専用のドキュメントをご覧ください：

📖 **[トラブルシューティングガイド](docs/TROUBLESHOOTING.md)**

主な内容：
- 画面上で語句追加できるが、DBに反映されない
- APIエラーが画面に表示されない
- サーバーが起動しない・接続できない
- CORSエラーの解決方法
- 新しいカテゴリが保存されない問題
- その他よくある問題と解決方法

---

## 📄 ドキュメント一覧

### 🚀 セットアップガイド
- [アプリケーション起動ガイド](docs/guides/getting-started.md) - 基本的な起動手順
- [Docker環境セットアップ](docs/setup/docker-setup.md) - 推奨環境の構築
- [XAMPP環境セットアップ](docs/setup/xampp-setup.md) - 従来環境の構築

### 🔧 開発者向け
- [開発ガイド](docs/guides/development.md) - 開発環境・ワークフロー
- [プロジェクト構造](docs/DIRECTORY_STRUCTURE.md) - ファイル構成の詳細
- [トラブルシューティング](docs/TROUBLESHOOTING.md) - よくある問題と解決方法

### 🛡️ 運用・保守
- [データ保護システム](docs/DATA_PROTECTION_CHECKLIST.md) - バックアップ・復旧手順
- [リリースチェックリスト](docs/RELEASE_CHECKLIST.md) - デプロイ前の確認事項

### 📦 バージョン管理
- [VERSION.md](./VERSION.md) - **バージョン履歴と変更ログ**
  - セマンティックバージョニング採用
  - リリースノート・機能追加履歴
  - 今後のロードマップ



