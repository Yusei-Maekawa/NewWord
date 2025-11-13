# 🚀 機能拡張ロードマップ

## 📅 作成日: 2025年11月1日

このドキュメントでは、アプリケーションの機能拡張計画と実装手順をまとめています。

---

## 🎯 開発優先順位

### 🚨 フェーズ1: 現在の懸念点解消（優先度: 高）

#### 1. ✅ お気に入り機能の永続化 - 実装済み
**実装内容:**
- ✅ `Term`型に`isFavorite`プロパティを追加
- ✅ `useTermsFirestore`フックに`toggleFavorite`関数を追加
- ✅ Firestoreへの自動保存機能実装

**次のステップ:**
- [ ] UIコンポーネント（TermsList.tsx）にお気に入りボタンを追加
- [ ] お気に入りフィルター機能を実装

#### 2. 🎬 一覧画面での画像表示
**実装内容:**
- ✅ `Term`型に`imageUrl`プロパティを追加
- ✅ Firestoreからの画像URL取得対応

**次のステップ:**
- [ ] 画像アップロード機能の実装（Firebase Storage使用）
- [ ] TermsList.tsxでサムネイル表示
- [ ] 画像モーダルでの拡大表示

---

### 🎨 フェーズ2: UI/UX改善（優先度: 中）

#### 3. デザインライブラリの導入

**推奨: Material-UI (MUI)**

```bash
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material
```

**導入メリット:**
- 🎨 洗練されたデザイン
- 📱 レスポンシブ対応が簡単
- 🌙 ダークモード標準搭載
- 🔧 豊富なコンポーネント

**実装計画:**
1. MUIテーマの設定
2. 既存コンポーネントをMUIで置き換え（Card, Button, Modal等）
3. カラーパレットとタイポグラフィの統一

---

### ✨ フェーズ3: 新機能実装（優先度: 中〜低）

#### 4. 🥇 デッキ共有機能

**概要:**
カードのまとまり（デッキ）を作成・公開・コピーできる機能

**実装計画:**

##### 4.1 Firestoreデータ構造
```typescript
// decks コレクション
interface Deck {
  id: string;
  title: string;
  description: string;
  tags: string[];
  coverImage?: string;
  themeColor?: string;
  isPublic: boolean;
  authorId: string;
  authorName: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  termCount: number;
}

// deck_terms サブコレクション
interface DeckTerm {
  termId: string;
  deckId: string;
  addedAt: Timestamp;
}
```

##### 4.2 機能一覧
- [ ] デッキ作成・編集フォーム
- [ ] デッキ一覧表示（自分のデッキ）
- [ ] 公開デッキ一覧（他ユーザーのデッキ）
- [ ] デッキ詳細ページ（カード一覧表示）
- [ ] デッキコピー機能
- [ ] 公開URL/QRコード生成
- [ ] デッキ表紙画像アップロード
- [ ] テーマカラー選択

##### 4.3 UI/UX演出
- ✨ 「デッキをインポートしました！」モーダル
- 🎨 デッキ表紙のグラデーション背景
- 📊 デッキ統計情報（語句数、カテゴリ分布）

---

#### 5. 🥈 学習進捗サマリー

**概要:**
学習活動を可視化し、モチベーション維持を支援

**実装計画:**

##### 5.1 Firestoreデータ構造
```typescript
// study_logs コレクション（既存拡張）
interface StudyLog {
  id: string;
  userId: string;
  date: string;  // YYYY-MM-DD
  category: string;
  studyDuration: number;  // 分数
  termsStudied: string[];  // 学習した語句のID配列
  quizResults?: {
    correct: number;
    incorrect: number;
  };
  createdAt: Timestamp;
}
```

##### 5.2 機能一覧
- [ ] ヒートマップ（GitHub草マップ風）
  - 日別学習語句数を色の濃淡で表示
  - クリックで詳細表示
- [ ] 週次レポート
  - 今週の学習語句一覧
  - 苦手TOP5（正答率が低い語句）
  - 学習時間グラフ
- [ ] アチーブメント機能
  - 7日連続学習
  - 累計100語句学習
  - 特定カテゴリ制覇
- [ ] 月次サマリー
  - カテゴリ別学習時間円グラフ
  - 学習傾向分析

##### 5.3 UI/UX演出
- 🎉 アチーブメント達成時のアニメーション
- 📊 インタラクティブなグラフ（recharts使用）
- 🌟 連続学習のストリーク表示

---

#### 6. 🥉 理解度・自信度マーク

**概要:**
各カードの習熟度を管理し、学習効率を向上

**実装計画:**

##### 6.1 Termインターフェース拡張
```typescript
interface Term {
  // 既存プロパティ...
  understandingLevel?: number;  // 1-5 の理解度
  confidenceLevel?: number;     // 1-5 の自信度
  lastReviewedAt?: string;      // 最終復習日時
  reviewCount?: number;          // 復習回数
  correctCount?: number;         // 正解回数
  incorrectCount?: number;       // 不正解回数
}
```

##### 6.2 機能一覧
- [ ] 理解度入力UI（★1〜5）
- [ ] 自信度入力UI（「覚えた」「まだ」ボタン）
- [ ] 理解度別フィルター・ソート
- [ ] クイズ結果による自動更新
- [ ] 理解度別色分け表示
  - 緑: 理解度高い（4-5）
  - 黄: 理解度中程度（2-3）
  - 赤: 理解度低い（1）
- [ ] デッキコンプリート演出（理解度100%達成時）

##### 6.3 UI/UX演出
- 🎯 理解度メーターアニメーション
- ✨ コンプリート時の紙吹雪エフェクト
- 📈 理解度推移グラフ

---

## 🛠️ 技術スタック（追加予定）

### フロントエンド
- **UI Library**: Material-UI (MUI)
- **Chart Library**: recharts または Chart.js
- **Animation**: Framer Motion
- **QR Code**: qrcode.react
- **Image Upload**: react-dropzone + Firebase Storage

### バックエンド
- **Database**: Firebase Firestore
- **Storage**: Firebase Storage（画像保存）
- **Authentication**: Firebase Authentication（将来的に）

---

## 📋 実装チェックリスト

### フェーズ1: 懸念点解消
- [x] types.tsにisFavorite, imageUrlを追加
- [x] useTermsFirestore.tsにtoggleFavorite関数を追加
- [×] UIにお気に入りボタン追加
- [×] 画像アップロード機能実装
- [ ] 一覧画面での画像表示

### フェーズ2: UI/UX改善
- [ ] Material-UIインストール
- [ ] MUIテーマ設定
- [ ] 主要コンポーネントのMUI化
- [ ] レスポンシブデザイン最適化

### フェーズ3: 新機能
- [ ] デッキ共有機能実装
- [ ] 学習進捗サマリー実装
- [ ] 理解度・自信度マーク実装

---

## 🚀 次のアクション

### 今すぐできること:

1. **お気に入りボタンの実装**
```tsx
// TermsList.tsx に追加
import { IconButton } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

<IconButton onClick={() => toggleFavorite(term.id)}>
  {term.isFavorite ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
</IconButton>
```

2. **Material-UIのインストール**
```bash
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material
```

3. **画像アップロード機能の設計**
   - Firebase Storageセットアップ
   - react-dropzoneで画像選択UI
   - サムネイル生成処理

---

## 📚 参考リソース

- [Material-UI公式ドキュメント](https://mui.com/)
- [Firebase Storage](https://firebase.google.com/docs/storage)
- [recharts](https://recharts.org/)
- [Framer Motion](https://www.framer.com/motion/)

---

**最終更新**: 2025年11月1日
