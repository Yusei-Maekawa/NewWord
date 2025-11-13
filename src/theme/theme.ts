/**
 * src/theme/theme.ts
 *
 * ============================================================================
 * 📖 ファイル概要 / File Overview
 * ============================================================================
 *
 * 【日本語】
 * Material-UI (MUI) v5のテーマ設定ファイル。
 * アプリケーション全体のカラーパレット、タイポグラフィ、スペーシング、
 * コンポーネントのデフォルトスタイルを定義します。
 *
 * 【主な機能】
 * 1. カラーパレット（Primary, Secondary, Success, Error等）
 * 2. タイポグラフィ（フォント、サイズ、ウェイト）
 * 3. スペーシングシステム（8pxベース）
 * 4. ブレークポイント（レスポンシブ対応）
 * 5. コンポーネント共通スタイル
 *
 * 【English】
 * Material-UI (MUI) v5 theme configuration file.
 * Defines the application-wide color palette, typography, spacing,
 * and default component styles.
 *
 * 【Key Features】
 * 1. Color palette (Primary, Secondary, Success, Error, etc.)
 * 2. Typography (fonts, sizes, weights)
 * 3. Spacing system (8px base)
 * 4. Breakpoints (responsive design)
 * 5. Common component styles
 *
 * ============================================================================
 * 🎨 使用方法 / Usage
 * ============================================================================
 *
 * App.tsxで以下のようにインポート:
 * 
 * ```tsx
 * import { ThemeProvider } from '@mui/material/styles';
 * import { theme } from './theme/theme';
 * 
 * function App() {
 *   return (
 *     <ThemeProvider theme={theme}>
 *       <YourApp />
 *     </ThemeProvider>
 *   );
 * }
 * ```
 *
 * ============================================================================
 *
 * @author Yusei Maekawa
 * @version 0.4.0
 * @since 2025-11-02
 * @updated 2025-11-02
 */

import { createTheme, ThemeOptions } from '@mui/material/styles';

/**
 * アプリケーションのカラーパレット
 * カテゴリアイコンの色と調和するよう設計
 */
const palette = {
  primary: {
    main: '#2196f3',        // ブルー（メインカラー）
    light: '#64b5f6',       // 明るいブルー
    dark: '#1976d2',        // 濃いブルー
    contrastText: '#ffffff', // 白文字
  },
  secondary: {
    main: '#ff9800',        // オレンジ（アクセントカラー）
    light: '#ffb74d',       // 明るいオレンジ
    dark: '#f57c00',        // 濃いオレンジ
    contrastText: '#000000', // 黒文字
  },
  success: {
    main: '#4caf50',        // グリーン（成功メッセージ）
    light: '#81c784',
    dark: '#388e3c',
  },
  error: {
    main: '#f44336',        // レッド（エラーメッセージ）
    light: '#e57373',
    dark: '#d32f2f',
  },
  warning: {
    main: '#ff9800',        // オレンジ（警告）
    light: '#ffb74d',
    dark: '#f57c00',
  },
  info: {
    main: '#2196f3',        // ブルー（情報）
    light: '#64b5f6',
    dark: '#1976d2',
  },
  background: {
    default: '#f5f5f5',     // 全体背景色（グレー）
    paper: '#ffffff',       // カード・モーダル背景（白）
  },
  text: {
    primary: '#333333',     // メインテキスト（濃いグレー）
    secondary: '#666666',   // サブテキスト（グレー）
    disabled: '#999999',    // 無効テキスト（薄いグレー）
  },
  divider: '#e0e0e0',      // 区切り線
};

/**
 * タイポグラフィ設定
 * 日本語フォントを優先しつつ、欧文フォントも指定
 */
const typography = {
  fontFamily: [
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
    '"Noto Sans JP"',        // 日本語フォント
    '"Hiragino Sans"',       // macOS日本語
    '"Yu Gothic"',           // Windows日本語
    'Meiryo',                // Windows日本語
  ].join(','),
  
  // 見出し
  h1: {
    fontSize: '2.5rem',      // 40px
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.01562em',
  },
  h2: {
    fontSize: '2rem',        // 32px
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: '-0.00833em',
  },
  h3: {
    fontSize: '1.75rem',     // 28px
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: '0em',
  },
  h4: {
    fontSize: '1.5rem',      // 24px
    fontWeight: 500,
    lineHeight: 1.4,
    letterSpacing: '0.00735em',
  },
  h5: {
    fontSize: '1.25rem',     // 20px
    fontWeight: 500,
    lineHeight: 1.5,
    letterSpacing: '0em',
  },
  h6: {
    fontSize: '1rem',        // 16px
    fontWeight: 500,
    lineHeight: 1.6,
    letterSpacing: '0.0075em',
  },
  
  // 本文
  body1: {
    fontSize: '1rem',        // 16px
    lineHeight: 1.6,
    letterSpacing: '0.00938em',
  },
  body2: {
    fontSize: '0.875rem',    // 14px
    lineHeight: 1.5,
    letterSpacing: '0.01071em',
  },
  
  // その他
  button: {
    fontSize: '0.875rem',    // 14px
    fontWeight: 500,
    textTransform: 'none' as const, // 大文字変換しない（日本語対応）
    letterSpacing: '0.02857em',
  },
  caption: {
    fontSize: '0.75rem',     // 12px
    lineHeight: 1.66,
    letterSpacing: '0.03333em',
  },
  overline: {
    fontSize: '0.75rem',     // 12px
    fontWeight: 400,
    lineHeight: 2.66,
    letterSpacing: '0.08333em',
    textTransform: 'uppercase' as const,
  },
};

/**
 * スペーシングシステム
 * 基本単位: 8px
 * theme.spacing(1) = 8px, theme.spacing(2) = 16px, etc.
 */
const spacing = 8;

/**
 * ブレークポイント（レスポンシブデザイン）
 */
const breakpoints = {
  values: {
    xs: 0,        // スマートフォン
    sm: 600,      // タブレット縦
    md: 960,      // タブレット横
    lg: 1280,     // デスクトップ
    xl: 1920,     // 大画面
  },
};

/**
 * コンポーネント共通スタイル
 */
const components = {
  // ボタン
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,        // 角丸
        padding: '8px 16px',
        textTransform: 'none' as const, // 大文字変換しない
      },
      contained: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        '&:hover': {
          boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
        },
      },
    },
  },
  
  // カード
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 12,       // 角丸
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        },
      },
    },
  },
  
  // テキストフィールド
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 8,
        },
      },
    },
  },
  
  // ダイアログ
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: 16,
        padding: '8px',
      },
    },
  },
  
  // チップ
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 16,
      },
    },
  },
};

/**
 * テーマオプションを結合
 */
const themeOptions: ThemeOptions = {
  palette,
  typography,
  spacing,
  breakpoints,
  components,
};

/**
 * メインテーマをエクスポート
 */
export const theme = createTheme(themeOptions);

export default theme;
