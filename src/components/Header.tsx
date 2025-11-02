/**
 * src/components/Header.tsx
 *
 * ============================================================================
 * 📖 ファイル概要 / File Overview
 * ============================================================================
 *
 * 【日本語】
 * アプリケーションのヘッダーコンポーネント。
 * Material-UIのAppBar、Toolbar、Typographyを使用して、
 * タイトルとサブタイトルを表示するシンプルな静的コンポーネントです。
 *
 * 【主な機能】
 * 1. アプリケーションタイトルの表示
 * 2. 学習対象の説明（サブタイトル）表示
 * 3. MUIのAppBarによるモダンなヘッダーUI
 *
 * 【English】
 * Application header component.
 * Simple static component that displays the title and subtitle
 * using Material-UI's AppBar, Toolbar, and Typography.
 *
 * 【Key Features】
 * 1. Display application title
 * 2. Display subtitle (description of study subjects)
 * 3. Modern header UI with MUI AppBar
 *
 * ============================================================================
 * 🎨 UI構成 / UI Structure
 * ============================================================================
 *
 * <AppBar position="static">
 *   <Toolbar>
 *     <Box>
 *       ├── <Typography variant="h5"> - アプリケーションタイトル
 *       └── <Typography variant="body2"> - サブタイトル（学習対象の説明）
 *
 * ============================================================================
 * 🔧 使用しているMUIコンポーネント / MUI Components Used
 * ============================================================================
 *
 * - AppBar: ヘッダーバー
 * - Toolbar: ヘッダー内のコンテンツ配置
 * - Typography: テキスト表示（variant指定でスタイル自動適用）
 * - Box: レイアウト用コンテナ
 *
 * ============================================================================
 *
 * @author Yusei Maekawa
 * @version 0.4.0
 * @since 2025-08-01
 * @updated 2025-11-02
 */

import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

/**
 * ヘッダーコンポーネント
 * 
 * Material-UIのAppBarを使用したアプリケーションヘッダー。
 * タイトルとサブタイトルを縦並びで表示します。
 *
 * @component
 * @returns {JSX.Element} ヘッダーのJSX要素
 */
const Header: React.FC = () => {
  return (
    <AppBar position="static" color="primary" elevation={2}>
      <Toolbar>
        <Box sx={{ flexGrow: 1, textAlign: 'center', py: 1 }}>
          <Typography 
            variant="h5" 
            component="h1" 
            sx={{ 
              fontWeight: 700,
              letterSpacing: '0.05em',
              mb: 0.5
            }}
          >
            NewWord
          </Typography>
          <Typography 
            variant="body2" 
            component="p"
            sx={{ 
              opacity: 0.9,
              fontWeight: 500
            }}
          >
            資格試験等や受験等の用語を効率的に学習
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
