/**
 * scripts/firebase_init_client.js
 *
 * Japanese:
 * `src/firebaseClient.ts` に貼り付けるためのクライアント設定テンプレートを標準出力に出力します。
 * - 使い方: `node scripts/firebase_init_client.js` を実行して、表示されたテンプレートを `src/firebaseClient.ts` に貼り付けてください。
 * - エクスポート/目次:
 *   - 出力されるテンプレートには `firebaseConfig`, `db`, `auth`, `storage` が含まれます。
 *
 * English:
 * Prints a client-side firebase config template that you can paste into `src/firebaseClient.ts`.
 * - Usage: run `node scripts/firebase_init_client.js` and paste the printed template into `src/firebaseClient.ts`.
 * - Exports/TOC:
 *   - The template contains `firebaseConfig`, `db`, `auth`, and `storage`.
 *
 * スクリプトの詳細 (Script Details):
 *
 * このスクリプト (firebase_init_client.js)
 * - 日本語: このファイルは関数を定義せず、実行時に即座に console.log でテンプレートコードを出力します。
 *           出力されるテンプレートは、Firebase SDK v9 のモジュラー形式を使用したクライアント初期化コードです。
 * - English: This file does not define functions; it immediately prints template code to console.log when executed.
 *            The printed template uses Firebase SDK v9 modular format for client-side initialization.
 * - Inputs: なし (コマンドライン引数不要)
 * - Outputs: テンプレートコードを標準出力に出力
 * - Usage: node scripts/firebase_init_client.js > output.txt (または手動でコピー＆ペースト)
 */

// Prints a client-side firebase config template to paste into src/firebaseClient.ts
// Usage: node scripts/firebase_init_client.js
console.log(`// src/firebaseClient.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Replace the values below with your Firebase project's config from the console
export const firebaseConfig = {
  apiKey: "REPLACE",
  authDomain: "REPLACE",
  projectId: "REPLACE",
  storageBucket: "REPLACE",
  messagingSenderId: "REPLACE",
  appId: "REPLACE"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
`);
