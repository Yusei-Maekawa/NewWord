# 開発記録 - 学習用語句振り返りアプリ

## 📝 最新の更新

### 2025-11-02: カテゴリお気に入り機能の完全実装

**実装内容**
- ✅ `useCategoriesFirestore`カスタムフック実装
  - Firestoreでカテゴリデータを永続化
  - リアルタイム同期機能
  - お気に入り状態の永続化
- ✅ 親子カテゴリ連動機能
  - 親カテゴリをお気に入りにすると子カテゴリも自動更新
  - Firestoreバッチ書き込みで効率的に処理
- ✅ 循環参照対策
  - 階層構造の無限ループ防止（最大10階層制限）
  - 処理済みカテゴリのトラッキング
  - IDが`undefined`の場合のフォールバック処理
- ✅ データ整合性チェック
  - 不正データの自動検出・再初期化
  - `display_order`ソート処理
- ✅ デバッグツール追加
  - `window.debugFirestore.debugCategories()` - カテゴリデータ確認
  - `window.debugFirestore.clearCategories()` - データクリア・再初期化
  - `window.debugFirestore.checkCategoryFavorite(key)` - お気に入り状態確認
- ✅ UI改善
  - お気に入りボタンをカテゴリボタンの外に配置（HTMLバリデーション対応）
  - ボタンネストエラーの修正

**技術的な課題と解決策**
1. **循環参照によるスタックオーバーフロー**
   - 原因: インデックスベースの親子関係設定で循環参照が発生
   - 解決: keyベースのマッピングに変更 + 循環参照チェック追加
2. **カテゴリIDが`undefined`になる問題**
   - 原因: 既存Firestoreデータに`id`フィールドが存在しない
   - 解決: フォールバック処理追加 + 自動修復機能実装
3. **HTMLバリデーションエラー**
   - 原因: お気に入りボタンがカテゴリボタンの中にネスト
   - 解決: お気に入りボタンを独立させて配置

**ファイル変更**
- `src/hooks/useCategoriesFirestore.ts` - 新規作成（230行以上）
- `src/components/CategoryNav.tsx` - 循環参照チェック追加、UI修正
- `src/App.tsx` - カテゴリ管理をFirestore対応に変更
- `src/utils/debugFirestore.ts` - 新規作成（デバッグツール）
- `README.md` - 最新機能の説明を追加

---

## プロジェクト概要
- **開始日**: 2024年8月頃
- **目的**: 資格試験の学習用語句を効率的に管理・復習するためのWebアプリケーション
- **開発者**: Yusei Maekawa

## 技術スタックの変遷

### 初期構成 (2025年8月)
- **フロントエンド**: React (Create React App)
- **バックエンド**: Express.js
- **データベース**: XAMPP (MySQL)
- **開発環境**: ローカル環境

### 現在の構成 (2025年9月)
- **フロントエンド**: React + TypeScript
- **バックエンド**: Express.js
- **データベース**: Docker MySQL 8.0
- **開発環境**: Docker Compose
- **将来予定**: Firebase移行予定

## 主要な開発マイルストーン

### Phase 1: 基本機能実装 (2025年8月)
- ✅ プロジェクト初期セットアップ
- ✅ 基本的なReactコンポーネント作成
- ✅ Express.js APIサーバー構築
- ✅ XAMPP MySQL接続

### Phase 2: データベース設計・改善 (2025年9月)
- ✅ カテゴリ管理機能実装
- ✅ 用語管理機能実装
- ✅ 階層カテゴリ構造対応
- ✅ CSV インポート機能

### Phase 3: インフラ改善 (2025年9月)
- ✅ XAMPP → Docker移行
- ✅ データベース文字化け問題解決
- ✅ 自動バックアップシステム構築
- ✅ 開発環境の安定化

### Phase 4: プロジェクト構造化 (現在)
- ✅ ブランチ戦略実装
  - `feature/study-time-schedule` - 勉強時間記録とスケジュール
  - `feature/term-management` - 語句追加と一覧機能
  - `feature/term-learning` - 語句学習機能
- ✅ ドキュメント整備
- 🔄 Firebase移行検討中

## 重要な技術的決定と理由

### 1. XAMPP から Docker への移行
**決定日**: 2024年9月3日
**理由**: 
- XAMPP でのデータベース破損問題の頻発
- 権限問題による不安定性
- 開発環境の一貫性確保

**影響**: 
- 開発環境の安定化
- チーム開発での環境統一が可能
- デプロイ環境との一貫性向上

### 2. TypeScript導入
**理由**: 
- 型安全性の向上
- 開発効率の向上
- 保守性の向上

### 3. ブランチ戦略の採用
**理由**: 
- 機能別の並行開発
- リリース管理の改善
- コードレビューの効率化

## 解決した主要な問題

### 1. データベース文字化け問題
**問題**: XAMPP MySQL で日本語データが文字化け
**原因**: latin1 文字コードの使用
**解決**: Docker MySQL (UTF-8) への移行

### 2. XAMPP データベース破損
**問題**: 定期的なデータベースファイル破損
**原因**: 権限不足による不正なシャットダウン
**解決**: 
- 管理者権限での実行
- Docker環境への移行
- 自動バックアップシステム構築

### 3. 開発環境の不一致
**問題**: ローカル環境の差異による動作不一致
**解決**: Docker Compose による環境統一

## データベース設計

### テーブル構造

#### categories テーブル
```sql
CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  category_key VARCHAR(100) NOT NULL UNIQUE,
  category_name VARCHAR(200) NOT NULL,
  category_icon VARCHAR(10) DEFAULT '📝',
  category_color VARCHAR(7) DEFAULT '#6c757d',
  parent_id INT DEFAULT NULL,
  is_favorite BOOLEAN DEFAULT FALSE,
  display_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### terms テーブル
```sql
CREATE TABLE terms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  word VARCHAR(255) NOT NULL,
  meaning TEXT,
  example TEXT,
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## API設計

### エンドポイント一覧
- `GET /api/terms` - 用語一覧取得
- `POST /api/terms` - 用語追加
- `PUT /api/terms/:id` - 用語更新
- `DELETE /api/terms/:id` - 用語削除
- `GET /api/categories` - カテゴリ一覧取得
- `POST /api/categories` - カテゴリ追加

## バックアップ戦略

### 自動バックアップシステム
- **スクリプト**: `scripts/backup_mysql.ps1`
- **実行頻度**: 毎日自動実行（Windows Task Scheduler）
- **保存場所**: `C:\backups\`
- **世代管理**: 7世代保持
- **圧縮**: 7-Zip による自動圧縮

## 今後の開発計画

### 短期計画 (1-2週間)
- [ ] Firebase移行
- [ ] 語句追加機能の完成
- [ ] 語句一覧表示の改善

### 中期計画 (1ヶ月)
- [ ] 学習機能の実装
- [ ] スケジュール管理機能
- [ ] ユーザー認証機能

### 長期計画 (2-3ヶ月)
- [ ] プロダクションデプロイ
- [ ] パフォーマンス最適化
- [ ] PWA対応

## 学習・習得した技術

### 技術スキル
- React + TypeScript
- Express.js
- MySQL
- Docker / Docker Compose
- Git ブランチ戦略
- PowerShell スクリプト作成

### 開発プロセス
- アジャイル開発手法
- 継続的インテグレーション
- ドキュメンテーション
- バックアップ戦略

## トラブルシューティング履歴

### XAMPP関連問題
- **文字化け**: UTF-8設定の重要性を学習
- **権限問題**: Windows UAC とアプリケーション実行権限の理解
- **データ破損**: 適切なシャットダウンプロセスの重要性

### Docker関連問題
- **ポート競合**: 複数サービス間のポート管理
- **ボリューム管理**: データ永続化の設計
- **ネットワーク設定**: サービス間通信の設定

## 参考資料・学習リソース

### 公式ドキュメント
- [React Documentation](https://reactjs.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/)
- [Docker Documentation](https://docs.docker.com/)

### 学習記事
- [Zenn記事: XAMPPバックアップ方法](https://zenn.dev/mof_moriko/articles/1ad174cbd123ae)

## 振り返りと学び

### 良かった点
- Docker移行により開発環境が安定化
- 適切なドキュメンテーションにより、開発継続性が向上
- バックアップシステムにより、データ損失リスクを軽減

### 改善点
- 初期の技術選択でより将来性のある技術を選ぶべきだった
- テスト自動化の導入が遅れた
- ユーザビリティテストの実施不足

### 次回プロジェクトに活かす点
- 初期段階でのインフラ設計の重要性
- 継続的なバックアップとバージョン管理の重要性
- ユーザーフィードバックの早期収集

---

**最終更新**: 2025年9月10日
**次回更新予定**: Firebase移行完了後