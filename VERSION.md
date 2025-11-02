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

#### 📝 Documentation（ドキュメント）
- Material-UI移行計画書（MUI_MIGRATION_PLAN.md）を作成
- 6週間のフェーズ別移行計画を策定
- コンポーネントごとの移行手順とコード例を記載

---

### [0.3.0] - 2025-11-02

#### 🎉 Added（追加機能）
- **再帰的お気に入り機能の実装**
  - 親カテゴリをお気に入りにすると、すべての子孫カテゴリ（子・孫・ひ孫...）が自動的にお気に入りに設定されるように改善
  - `useCategoriesFirestore.ts`に`getAllDescendants()`関数を追加
  - 無限深度対応（安全制限: 10階層）

- **包括的ドキュメントヘッダーの追加**
  - 全26ファイルに日英バイリンガルのドキュメントヘッダーを追加
  - @author, @version, @since, @updated メタデータを統一
  - ファイル概要、型定義、関数リスト、データフロー、依存関係を明記

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

#### 🔧 Technical
- React 18 + TypeScript
- Firebase設定（Firestore, Authentication, Storage）
- MySQL連携機能
- Docker対応（開発環境）

---

## 📋 今後の予定（Roadmap）

### 🎯 v0.4.0（次期バージョン）
- [ ] 一覧画面での画像表示の改善
- [ ] Material-UI等のデザインライブラリ導入
- [ ] パフォーマンス最適化

### 🚀 v0.5.0
- [ ] デッキ共有機能の実装
- [ ] 公開URL/QRコード生成
- [ ] デッキのコピー機能

### 🎓 v0.6.0
- [ ] 学習進捗サマリー機能（ヒートマップ）
- [ ] 週次レポート
- [ ] アチーブメント機能

### 🌟 v0.7.0
- [ ] 理解度・自信度マーク機能
- [ ] クイズ機能の強化
- [ ] フィルタ・ソート機能の拡張

### 🎊 v1.0.0（安定版リリース）
- すべての主要機能が実装され、十分にテストされた状態
- 本番環境への公開準備完了
- ユーザーマニュアルの完成

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
