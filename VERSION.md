# バージョン履歴 / Version History

このプロジェクトは[セマンティックバージョニング（Semantic Versioning）](https://semver.org/)を採用しています。

## セマンティックバージョニングについて

バージョン番号は `MAJOR.MINOR.PATCH` の形式で管理されます:

- **MAJOR**: 互換性のない大きな変更（1.0.0以降）
- **MINOR**: 後方互換性のある機能追加
- **PATCH**: 後方互換性のあるバグ修正

### 開発段階（0.x.x）について

現在は開発段階のため、バージョン `0.x.x` を使用しています:
- **0.MINOR.PATCH** 形式
- `0.1.0` から開始
- いつでも破壊的変更が発生する可能性があります
- 安定版リリース時に `1.0.0` に移行予定

---

## 📦 リリース履歴

### [0.4.0] - 開発中 🚧

#### 🎨 Added（追加機能）
- **Notion風エディタの完全実装**
  - contentEditableベースのリッチテキストエディタ（NotionEditor.tsx）
  - フローティングツールバー（選択テキスト上に自動表示）
  - 12色プリセット + カスタムカラーピッカー + カラー履歴（LocalStorage、最大10色）
  - フォーマット保持（色変更時も太字・斜体・下線を保持）
  - 1行選択制限（複数行選択時はツールバー非表示）
  - カスタムUndo/Redo（Enterキー区切り、最大50世代）
  - プレースホルダーパターンで画像Base64保護

- **Material-UI v5導入**
  - @mui/material, @emotion/react, @emotion/styled, @mui/icons-materialをインストール
  - カスタムテーマ設定（src/theme/theme.ts）を作成
  - カラーパレット（Primary: Blue, Secondary: Orange）
  - タイポグラフィ（日本語フォント対応）
  - コンポーネント共通スタイル

- **Phase 1: Foundation Setup（完了）**
  - ThemeProviderとCssBaselineをApp.tsxに適用
  - 全体的なMUIテーマの基礎確立

- **Phase 2: Common Components Migration（完了）**
  - Header: AppBar, Toolbar, Typographyを使用
  - Notification: Snackbar, Alertを使用
  - モダンなUI/UXデザインに刷新

- **WYSIWYGエディタの実装（2025-11-03）**
  - contentEditableを使用したWYSIWYGエディタコンポーネント作成
  - カスタムタグ（[red][/red]等）をHTMLに変換して表示
  - フローティングツールバーで選択範囲に書式適用
  - 12色プリセット + カスタムRGBカラー対応
  - カラーピッカーダイアログの実装
  - 色ボタン展開式UI（基本4色+展開8色）

#### 🐛 Fixed（バグ修正）
- 画像Base64が編集画面に文字列表示される問題を修正
- フォーマット適用時に既存フォーマットが失われる問題を修正
- 複数行選択時にタグが見える問題を修正（1行のみ選択可能に）
- 行末文字選択時に改行が消える問題を修正
- sanitizeHtml未定義エラーを修正

#### 📝 Documentation
- Firebase導入完全ガイド（はてなブログ記事）作成
- エンコード方式選定理由をBUG_FIXES.mdに追記
- Base64採用理由と他の選択肢の比較を詳細にドキュメント化

---

### [0.3.0] - 2025-11-02

#### 🎉 Added（追加機能）
- **再帰的お気に入り機能の実装**
  - 親カテゴリをお気に入りにすると、すべての子孫カテゴリ（子・孫・ひ孫...）が自動的にお気に入りに設定されるように改善
  - `useCategoriesFirestore.ts`に`getAllDescendants()`関数を追加
  - 無限深度対応（安全制限: 10階層）

#### 🐛 Fixed（バグ修正）
- **変数名エラーの修正**
  - `useCategoriesFirestore.ts`の`toggleFavorite`関数の変数名を修正
    - `targetCategory.name` → `targetCategory.category_name`
    - `parentKey: string` → `parentId: number`
    - `c.parent_id === parentKey` → `c.parent_id === parentId`
  - `setError(Error)` → `setError(errorMessage: string)`の型修正

#### 📝 Documentation（ドキュメント）
- セマンティックバージョニングを採用したバージョン管理ファイル（VERSION.md）を作成
- 各ファイルのドキュメントヘッダーを統一フォーマットに更新

-----
## 開発系
#### 包括的ドキュメントヘッダーの追加　(コード関連)
  - 全26ファイルに日英バイリンガルのドキュメントヘッダーを追加
  - @author, @version, @since, @updated メタデータを統一
  - ファイル概要、型定義、関数リスト、データフロー、依存関係を明記

---

### [0.2.0] - 2025-11-01

#### 🎉 Added（追加機能）
- **Firestoreカテゴリ管理の実装**
  - `useCategoriesFirestore.ts`フックを新規作成
  - カテゴリのお気に入り状態をFirestoreで永続化
  - リアルタイムデータ同期（onSnapshotリスナー）
  - 循環参照チェック機能

- **Firestore用語句管理の実装**
  - `useTermsFirestore.ts`フックを新規作成
  - 語句のCRUD操作をFirestoreに対応
  - お気に入り機能の実装

- **デバッグツールの追加**
  - `debugFirestore.ts`ユーティリティを作成
  - ブラウザコンソールからカテゴリデータを確認・操作可能
  
---

## 開発系
#### 🔧 Changed（変更）
- バックエンドモードの切り替え機能追加（MySQL ⇔ Firestore）
- 環境変数`REACT_APP_BACKEND_MODE`でバックエンドを選択可能

#### 📝 Documentation（ドキュメント）
- `DEVELOPMENT_LOG.md`に開発ログを記録
- `FEATURE_ROADMAP.md`に機能ロードマップを追加

---

### [0.1.0] - 2025-08-01

#### 🎉 Added（追加機能）
- **基本機能の実装**
  - 語句の追加・編集・削除機能
  - カテゴリ別フィルタリング
  - 検索機能（語句、意味、例文から検索）
  - リッチテキストエディタ（色、サイズ変更対応）
  - 画像アップロード機能

- **学習機能の実装**
  - 学習セクションの実装
  - 学習時間記録（ストップウォッチ/手動入力）
  - 学習ログカレンダー表示

- **カテゴリ管理の実装**
  - 階層構造のカテゴリ表示（親→子→孫）
  - カテゴリの追加・編集・削除
  - カテゴリアイコン・カラーのカスタマイズ

- **データ管理機能**
  - CSVインポート機能
  - MySQLデータベース連携
  - ローカルストレージによるデータ保存

#### 🎨 UI/UX
- レスポンシブデザイン対応
- カード形式の語句表示
- モーダルによる詳細表示・編集
- 通知システムの実装

## 技術系
- React 18 + TypeScript
- Firebase設定（Firestore, Authentication, Storage）
- MySQL連携機能
- Docker対応（開発環境）

---

## 📋 今後の予定（Roadmap）

### 🎯 v0.4.0（開発中 - 個人機能の完成）
- [x] 一覧画面での画像表示の改善
- [x] Material-UI等のデザインライブラリ導入
- [x] 学習時間記録機能（Firestore連携）
- [ ] **行動履歴機能**（旧:スケジュール機能）
  - [ ] 語句追加履歴の記録
  - [ ] 語句学習（復習）履歴の記録
  - [ ] カレンダー形式での表示
  - [ ] 日別サマリー表示
  - [ ] 週次・月次統計
- [ ] **単語復習機能**（MVC完成予定）
  - [ ] フラッシュカードUI
  - [ ] 「わかった」「わからない」ボタン
  - [ ] 間違えた語句の再出題
  - [ ] 学習進捗の保存
  - [ ] 復習スケジュール（間隔反復学習）
- [ ] パフォーマンス最適化

**注**: SNS機能（タイムライン・いいね等）は v1.0.0以降に延期

### 🚀 v1.0.0（共有機能）
- [ ] **デッキ共有機能**の実装
  - [ ] 公開URL生成
  - [ ] QRコード生成
  - [ ] デッキのコピー機能（他人のデッキを自分用にコピー）
- [ ] **Vercelデプロイ**
  - [ ] vercel.json作成
  - [ ] 環境変数設定
  - [ ] 初回デプロイ
  - [ ] カスタムドメイン設定（オプション）

### 🎓 v1.1.0
- [ ] 学習進捗サマリー機能（ヒートマップ）
- [ ] 週次レポート
- [ ] アチーブメント機能

### 🌟 v1.2.0
- [ ] 理解度・自信度マーク機能
- [ ] クイズ機能の強化
- [ ] フィルタ・ソート機能の拡張


---

## 🔗 関連リンク

- [プロジェクトREADME](./README.md)
- [開発ログ](./docs/DEVELOPMENT_LOG.md)
- [機能ロードマップ](./docs/FEATURE_ROADMAP.md)
- [トラブルシューティング](./docs/TROUBLESHOOTING.md)

---

## 📝 変更履歴の記載ルール

### カテゴリ
- **Added**: 新機能の追加
- **Changed**: 既存機能の変更
- **Deprecated**: 非推奨となる機能
- **Removed**: 削除された機能
- **Fixed**: バグ修正
- **Security**: セキュリティ関連の修正

### コミットメッセージ規約
- `feat:` 新機能
- `fix:` バグ修正
- `docs:` ドキュメント変更
- `style:` コードスタイル変更（動作に影響なし）
- `refactor:` リファクタリング
- `perf:` パフォーマンス改善
- `test:` テスト追加・修正
- `chore:` ビルドプロセスやツール変更

---

**現在のバージョン: 0.3.0**  
**最終更新日: 2025-11-02**
