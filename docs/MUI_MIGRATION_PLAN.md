# Material-UI (MUI) 導入計画

## 📅 作成日: 2025年11月2日
## 🎯 目標バージョン: v0.4.0

---

## 📋 概要

現在のプレーンCSSから、Material-UI (MUI) v5を導入し、モダンで統一感のあるUIを実現します。

---

## 🎯 導入目的

1. **デザインの統一性** - 一貫したデザインシステム
2. **開発効率の向上** - 再利用可能なコンポーネント
3. **レスポンシブ対応** - モバイル・タブレット対応が容易
4. **アクセシビリティ** - WCAG 2.1準拠
5. **ダークモード対応** - テーマ切り替え機能

---

## 📦 インストールするパッケージ

```bash
# MUIコアライブラリ
npm install @mui/material @emotion/react @emotion/styled

# アイコンライブラリ
npm install @mui/icons-material

# 日付ピッカー（将来的に使用予定）
npm install @mui/x-date-pickers

# 追加ユーティリティ
npm install @mui/lab
```

---

## 🗂️ プロジェクト構成変更

### 新規作成ファイル

```
src/
├── theme/
│   ├── theme.ts           # MUIテーマ設定（カラー、フォント等）
│   ├── lightTheme.ts      # ライトモード設定
│   ├── darkTheme.ts       # ダークモード設定（将来）
│   └── typography.ts      # タイポグラフィ設定
├── styles/
│   ├── muiCustomStyles.ts # MUIコンポーネントのカスタムスタイル
│   └── transitions.ts     # アニメーション設定
└── App.tsx                # ThemeProviderでラップ
```

---

## 🎨 テーマ設定

### カラーパレット

```typescript
// src/theme/theme.ts
import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',      // ブルー（メインカラー）
      light: '#64b5f6',
      dark: '#1976d2',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#ff9800',      // オレンジ（アクセントカラー）
      light: '#ffb74d',
      dark: '#f57c00',
      contrastText: '#000000',
    },
    success: {
      main: '#4caf50',      // グリーン（成功メッセージ）
    },
    error: {
      main: '#f44336',      // レッド（エラーメッセージ）
    },
    background: {
      default: '#f5f5f5',   // 背景色
      paper: '#ffffff',     // カード背景
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Noto Sans JP"',     // 日本語フォント
    ].join(','),
    h1: { fontSize: '2.5rem', fontWeight: 700 },
    h2: { fontSize: '2rem', fontWeight: 600 },
    h3: { fontSize: '1.75rem', fontWeight: 600 },
    h4: { fontSize: '1.5rem', fontWeight: 500 },
    body1: { fontSize: '1rem', lineHeight: 1.6 },
    body2: { fontSize: '0.875rem', lineHeight: 1.5 },
  },
  spacing: 8, // 基本スペーシング単位（8px）
});
```

---

## 🔄 段階的移行計画

### Phase 1: 基盤構築（Week 1）

- [ ] MUIパッケージのインストール
- [ ] テーマ設定ファイル作成
- [ ] `App.tsx`に`ThemeProvider`を追加
- [ ] グローバルCSSの整理

**影響範囲**: 全体の基盤のみ、既存UIに影響なし

### Phase 2: 共通コンポーネント移行（Week 2）

#### 優先度: 高

- [ ] **Header.tsx** → MUI `AppBar`, `Toolbar`
- [ ] **Notification.tsx** → MUI `Snackbar`, `Alert`
- [ ] **Button系** → MUI `Button`, `IconButton`

#### 優先度: 中

- [ ] **Modal系** → MUI `Dialog`, `DialogTitle`, `DialogContent`
- [ ] **Form系** → MUI `TextField`, `Select`, `Checkbox`

**コード例**:
```tsx
// Before (プレーンHTML)
<button className="btn btn-primary" onClick={handleClick}>
  保存
</button>

// After (MUI)
import { Button } from '@mui/material';
<Button variant="contained" color="primary" onClick={handleClick}>
  保存
</Button>
```

### Phase 3: メインコンポーネント移行（Week 3-4）

- [ ] **CategoryNav.tsx** → MUI `List`, `ListItem`, `Collapse`, `Chip`
- [ ] **TermsList.tsx** → MUI `Card`, `CardContent`, `CardActions`, `Grid`
- [ ] **AddTermForm.tsx** → MUI `Paper`, `TextField`, `Autocomplete`

**コード例**:
```tsx
// カテゴリボタン → MUI Chip
<Chip
  icon={<span>{category.category_icon}</span>}
  label={category.category_name}
  onClick={() => setActiveCategory(category.category_key)}
  color={isActive ? 'primary' : 'default'}
  variant={isActive ? 'filled' : 'outlined'}
  sx={{ backgroundColor: category.category_color }}
/>
```

### Phase 4: 詳細コンポーネント移行（Week 5-6）

- [ ] **StudySection.tsx** → MUI `Stepper`, `Step`, `StepLabel`
- [ ] **SchedulePage.tsx** → MUI `Timeline`, `TimelineItem`
- [ ] **EditTermModal.tsx** → MUI `Dialog` + Rich Editor統合

---

## 🎨 カスタムスタイリング方法

### 方法1: `sx` prop（推奨）

```tsx
<Button
  sx={{
    backgroundColor: 'primary.main',
    '&:hover': { backgroundColor: 'primary.dark' },
    borderRadius: 2,
    px: 3,
    py: 1.5,
  }}
>
  ボタン
</Button>
```

### 方法2: `styled` API

```tsx
import { styled } from '@mui/material/styles';
import { Button } from '@mui/material';

const CustomButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  borderRadius: theme.spacing(2),
  padding: theme.spacing(1.5, 3),
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
}));
```

---

## 📊 移行前後の比較

### ファイルサイズ

| 項目 | 移行前 | 移行後 | 備考 |
|-----|--------|--------|------|
| Bundle Size | ~500KB | ~800KB | MUI追加で約300KB増加 |
| CSS Size | ~50KB | ~10KB | カスタムCSS大幅削減 |

### 開発効率

| 項目 | 移行前 | 移行後 |
|-----|--------|--------|
| 新規コンポーネント作成 | 30分 | 10分 |
| レスポンシブ対応 | 手動実装 | 自動対応 |
| テーマ変更 | 全CSS修正 | theme.ts変更のみ |

---

## ⚠️ 注意事項

### 既存CSSとの共存

移行期間中は、MUIと既存CSSが共存します：

```tsx
// 移行前のコンポーネント
<div className="term-card">  {/* 既存CSS */}
  <h3 className="term-title">{term.term}</h3>
</div>

// 移行後のコンポーネント
<Card sx={{ mb: 2 }}>  {/* MUI */}
  <CardContent>
    <Typography variant="h6">{term.term}</Typography>
  </CardContent>
</Card>
```

### パフォーマンス対策

- **コード分割**: `React.lazy()`でMUIコンポーネントを遅延読み込み
- **Tree Shaking**: 使用するコンポーネントのみインポート
- **SSR対応**: 将来的にNext.js移行を検討

---

## 🧪 テスト計画

### 1. ビジュアルリグレッションテスト

- [ ] 移行前のスクリーンショット取得
- [ ] 移行後の比較テスト
- [ ] レスポンシブデザイン確認（モバイル、タブレット、デスクトップ）

### 2. 機能テスト

- [ ] 全ボタンのクリック動作確認
- [ ] フォーム入力・送信テスト
- [ ] モーダル開閉テスト
- [ ] カテゴリフィルタリングテスト

### 3. ブラウザ互換性テスト

- [ ] Chrome（最新）
- [ ] Firefox（最新）
- [ ] Safari（最新）
- [ ] Edge（最新）

---

## 📝 チェックリスト

### 開始前の準備

- [ ] 現在のブランチをコミット
- [ ] `feature/mui-migration`ブランチ作成
- [ ] package.jsonのバックアップ

### 導入作業

- [ ] MUIパッケージインストール
- [ ] テーマファイル作成
- [ ] App.tsxにThemeProvider追加
- [ ] グローバルCSSの整理

### 移行作業（コンポーネントごと）

- [ ] Header.tsx
- [ ] Notification.tsx
- [ ] CategoryNav.tsx
- [ ] TermsList.tsx
- [ ] AddTermForm.tsx
- [ ] EditTermModal.tsx
- [ ] StudySection.tsx
- [ ] その他コンポーネント

### 完了後

- [ ] 全機能の動作確認
- [ ] 不要なCSS削除
- [ ] ドキュメント更新
- [ ] VERSION.md更新（v0.4.0リリースノート）

---

## 📚 参考リソース

- [Material-UI公式ドキュメント](https://mui.com/)
- [MUI v5 Migration Guide](https://mui.com/material-ui/migration/migration-v4/)
- [MUI Theming](https://mui.com/material-ui/customization/theming/)
- [MUI Component API](https://mui.com/material-ui/api/button/)

---

## 🚀 次のアクション

1. **今すぐ**: MUIパッケージインストール
   ```bash
   npm install @mui/material @emotion/react @emotion/styled @mui/icons-material
   ```

2. **次に**: テーマ設定ファイル作成
   ```bash
   mkdir src/theme
   touch src/theme/theme.ts
   ```

3. **その後**: Phase 1の基盤構築を開始

---

**作成者**: Yusei Maekawa  
**最終更新**: 2025年11月2日  
**対象バージョン**: v0.4.0
