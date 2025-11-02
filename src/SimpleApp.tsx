/**
 * src/SimpleApp.tsx
 *
 * ============================================================================
 * 📖 ファイル概要 / File Overview
 * ============================================================================
 *
 * 【日本語】
 * Reactアプリケーション動作確認用のシンプルなテストコンポーネント。
 * 開発中の動作チェックに使用します。
 *
 * 【English】
 * Simple test component for verifying React application functionality.
 * Used for development sanity checks.
 *
 * ============================================================================
 *
 * @author Yusei Maekawa
 * @version 1.0.0
 * @since 2025-08-01
 * @updated 2025-11-02
 */

import React from 'react';

const SimpleApp: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>学習用語句振り返りアプリ (React版)</h1>
      <p>アプリが正常に動作しています!</p>
    </div>
  );
};

export default SimpleApp;
