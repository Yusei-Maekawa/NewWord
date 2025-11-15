# MVP機能設計ドキュメント

## 📝 概要

NewWordアプリケーションのMVP（Minimum Viable Product）機能の設計ドキュメント。
以下の3つの主要機能を実装し、Vercelへデプロイします。

## 🎯 MVP機能リスト

### 1. スケジュール機能（ログ機能・統計機能）
**ブランチ**: `feature/term-schedule-management`

#### 機能要件
- ✅ 既存: 日付ごとの学習サマリー表示
- ✅ 既存: カテゴリ別の語句数・学習時間集計
- ✅ 既存: ログ削除機能
- 🔲 **新規**: Firestoreへの学習ログ保存
- 🔲 **新規**: リアルタイムでのログ同期
- 🔲 **新規**: 週次・月次の統計表示
- 🔲 **新規**: 学習目標設定機能
- 🔲 **新規**: 達成率の可視化

#### データ構造（Firestore）

**コレクション**: `studyLogs`
```typescript
{
  id: string;              // ドキュメントID（自動生成）
  userId?: string;         // ユーザーID（将来の認証機能用、現在はnull）
  date: string;            // 学習日付（YYYY-MM-DD形式）
  category: CategoryKey;   // 学習カテゴリ
  amount: number;          // 学習時間（分数）
  termsCount?: number;     // その日に追加した語句数
  createdAt: Timestamp;    // 作成日時
  updatedAt: Timestamp;    // 更新日時
}
```

#### 実装ステップ
1. ✅ ブランチ作成: `feature/term-schedule-management`
2. 🔲 `hooks/useStudyLogs.ts` の作成（Firestoreとの連携）
3. 🔲 `StudyTimeInput` コンポーネントにFirestore保存機能を追加
4. 🔲 週次・月次統計コンポーネントの作成
5. 🔲 学習目標設定UIの追加
6. 🔲 テストとデバッグ
7. 🔲 READMEに機能説明を追記

---

### 2. 統計情報のグラフ可視化
**ブランチ**: `feature/statistics-management`

#### 機能要件
- 🔲 学習時間の推移グラフ（折れ線グラフ）
- 🔲 カテゴリ別学習時間の円グラフ
- 🔲 語句追加数の推移グラフ（棒グラフ）
- 🔲 GitHub草マップ風のヒートマップカレンダー
- 🔲 学習ストリーク（連続学習日数）の表示

#### 使用ライブラリ
- `recharts` または `chart.js` または `nivo`（検討中）
- Material-UIとの統合性を考慮

#### 実装ステップ
1. 🔲 グラフライブラリの選定とインストール
2. 🔲 ブランチ作成: `feature/statistics-management`
3. 🔲 `components/StatisticsCharts/` ディレクトリ作成
4. 🔲 折れ線グラフコンポーネント作成
5. 🔲 円グラフコンポーネント作成
6. 🔲 ヒートマップカレンダーコンポーネント作成
7. 🔲 統計ダッシュボードページの作成
8. 🔲 テストとデバッグ
9. 🔲 READMEに機能説明を追記

---

### 3. 語句学習機能
**ブランチ**: `feature/studying-management`

#### 機能要件
- 🔲 フラッシュカード形式の学習UI
- 🔲 「わかった」「わからない」のボタン
- 🔲 間違えた語句の再出題機能
- 🔲 学習進捗の保存（Firestore）
- 🔲 復習スケジュールの自動生成（間隔反復学習）
- 🔲 学習セッション終了時のサマリー表示

#### データ構造（Firestore）

**コレクション**: `studyProgress`
```typescript
{
  id: string;              // ドキュメントID（自動生成）
  userId?: string;         // ユーザーID（将来の認証機能用）
  termId: string;          // 語句ID（terms コレクションへの参照）
  lastStudied: Timestamp;  // 最後に学習した日時
  correctCount: number;    // 正解回数
  incorrectCount: number;  // 不正解回数
  nextReview: Timestamp;   // 次回復習予定日時
  interval: number;        // 復習間隔（日数）
  easeFactor: number;      // 難易度係数（SM-2アルゴリズム用）
  createdAt: Timestamp;    // 作成日時
  updatedAt: Timestamp;    // 更新日時
}
```

#### 実装ステップ
1. 🔲 ブランチ作成: `feature/studying-management`
2. 🔲 `hooks/useStudyProgress.ts` の作成
3. 🔲 フラッシュカードUIコンポーネントの作成
4. 🔲 SM-2アルゴリズムの実装（間隔反復学習）
5. 🔲 学習セッション管理機能の実装
6. 🔲 サマリー画面の作成
7. 🔲 テストとデバッグ
8. 🔲 READMEに機能説明を追記

---

## 📊 Firestoreデータベース構造全体

```
newword-f6f1e (Firebaseプロジェクト)
├── categories (コレクション) - カテゴリマスタ
│   └── {categoryId} (ドキュメント)
│       ├── key: string
│       ├── name: string
│       ├── icon: string
│       ├── color: string
│       └── displayOrder: number
│
├── terms (コレクション) - 語句データ
│   └── {termId} (ドキュメント)
│       ├── category: string
│       ├── term: string
│       ├── meaning: string
│       ├── example?: string
│       ├── imageUrl?: string
│       ├── isFavorite?: boolean
│       ├── createdAt: Timestamp
│       └── updatedAt?: Timestamp
│
├── studyLogs (コレクション) - 学習ログ
│   └── {logId} (ドキュメント)
│       ├── userId?: string
│       ├── date: string (YYYY-MM-DD)
│       ├── category: string
│       ├── amount: number (分数)
│       ├── termsCount?: number
│       ├── createdAt: Timestamp
│       └── updatedAt: Timestamp
│
└── studyProgress (コレクション) - 学習進捗
    └── {progressId} (ドキュメント)
        ├── userId?: string
        ├── termId: string
        ├── lastStudied: Timestamp
        ├── correctCount: number
        ├── incorrectCount: number
        ├── nextReview: Timestamp
        ├── interval: number (日数)
        ├── easeFactor: number
        ├── createdAt: Timestamp
        └── updatedAt: Timestamp
```

---

## 🚀 デプロイ計画（Vercel）

### 事前準備
1. ✅ Firebase設定の確認（`firebaseClient.ts`）
2. 🔲 環境変数の設定（`.env.production`）
3. 🔲 `vercel.json` の作成
4. 🔲 ビルドコマンドの確認（`npm run build`）

### デプロイ手順
1. 🔲 Vercelアカウントの作成
2. 🔲 GitHubリポジトリとの連携
3. 🔲 環境変数の設定（Firebase設定）
4. 🔲 初回デプロイ
5. 🔲 カスタムドメインの設定（オプション）

---

## 📅 実装スケジュール

### フェーズ1: スケジュール機能（1-2日）
- Day 1: Firestore連携、基本機能実装
- Day 2: 統計表示、目標設定機能

### フェーズ2: 統計グラフ可視化（1-2日）
- Day 1: グラフライブラリ選定、基本グラフ実装
- Day 2: ヒートマップカレンダー、ダッシュボード統合

### フェーズ3: 語句学習機能（2-3日）
- Day 1: フラッシュカードUI実装
- Day 2: SM-2アルゴリズム実装、進捗保存
- Day 3: テストと調整

### フェーズ4: 統合テストとデプロイ（1日）
- Day 1: 全体テスト、Vercelデプロイ

**総予定期間**: 5-8日

---

## 📝 開発ガイドライン

### ブランチ戦略
- メインブランチ: `main`
- 機能ブランチ: `feature/[feature-name]`
- マージ: プルリクエスト経由で `main` へマージ

### コミットメッセージ
```
feat: 新機能追加
fix: バグ修正
docs: ドキュメント更新
style: コードスタイル変更（機能に影響なし）
refactor: リファクタリング
test: テスト追加
chore: ビルド・設定変更
```

### コードレビュー
- 全ての機能実装後、セルフレビューを実施
- テストを通してから `main` へマージ

---
**作成日**: 2025-11-13
**作成者**: Yusei Maekawa  
**バージョン**: 1.0.0
