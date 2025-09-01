/**
 * @fileoverview Reactアプリケーションのエントリーポイント
 *
 * このファイルは、Reactアプリケーションの起動点となるファイルです。
 * React 18のcreateRoot APIを使用してAppコンポーネントをDOMにマウントします。
 *
 * @author Yusei Maekawa
 * @version 1.0.0
 * @since 2025-08-01
 */

/**
 * @description Reactアプリケーションの初期化とDOMマウント
 *
 * 処理の流れ：
 * 1. ReactDOM.createRoot()でルート要素を取得
 * 2. Appコンポーネントをrender()でマウント
 * 3. StrictModeを一時的に無効化（デバッグ用）
 *
 * @remarks
 * - React 18のConcurrent Featuresを使用
 * - ルート要素はpublic/index.htmlの<div id="root">を参照
 * - StrictModeは開発時の副作用検出用（現在は無効化）
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/**
 * Reactアプリケーションのルートインスタンスを作成
 * @type {ReactDOM.Root}
 */
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// デバッグ用：StrictModeを外して単純化
root.render(<App />);
