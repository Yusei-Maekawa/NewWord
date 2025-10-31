/**
 * src/firebaseClient.ts
 *
 * Japanese:
 * クライアント (ブラウザ) 側で Firebase を初期化するファイルのテンプレートです。
 * - `firebaseConfig` の値は Firebase コンソールの Web アプリ設定から取得して置き換えてください。
 * - エクスポート:
 *   - `firebaseConfig` - クライアント用設定オブジェクト
 *   - `db` - Firestore のクライアントインスタンス
 *   - `auth` - Firebase Authentication のインスタンス
 *   - `storage` - Firebase Storage のインスタンス
 *
 * English:
 * Client-side Firebase initializer template for the browser.
 * - Replace `firebaseConfig` values with your project's config from the Firebase Console.
 * - Exports:
 *   - `firebaseConfig` - the client configuration object
 *   - `db` - Firestore client instance
 *   - `auth` - Authentication instance
 *   - `storage` - Storage instance
 *
 * Variables / 目次:
 * - firebaseConfig: object with apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId
 * - app: initialized Firebase app (internal)
 * - db: Firestore client (exported)
 * - auth: Auth client (exported)
 * - storage: Storage client (exported)
 *
 * 変数の詳細 (Variables Details):
 *
 * firebaseConfig (exported const)
 * - 日本語: Firebase プロジェクトのクライアント設定オブジェクト。Firebase コンソールから取得した値に置き換えてください。
 * - English: Client configuration object for Firebase project. Replace with values from Firebase Console.
 * - Type: { apiKey: string, authDomain: string, projectId: string, storageBucket: string, messagingSenderId: string, appId: string }
 *
 * app (internal const)
 * - 日本語: Firebase アプリの初期化済みインスタンス。他のサービス（Firestore, Auth, Storage）の取得に使用します。
 * - English: Initialized Firebase app instance used to access other services (Firestore, Auth, Storage).
 * - Type: FirebaseApp
 *
 * db (exported const)
 * - 日本語: Firestore のクライアントインスタンス。データベース操作（読み取り・書き込み）に使用します。
 * - English: Firestore client instance for database operations (read/write).
 * - Type: Firestore
 * - Usage: collection(db, 'collectionName'), doc(db, 'collectionName', 'docId')
 *
 * auth (exported const)
 * - 日本語: Firebase Authentication のインスタンス。ユーザー認証（ログイン・サインアップ）に使用します。
 * - English: Firebase Authentication instance for user authentication (login, signup).
 * - Type: Auth
 * - Usage: signInWithEmailAndPassword(auth, email, password)
 *
 * storage (exported const)
 * - 日本語: Firebase Storage のインスタンス。ファイルのアップロード・ダウンロードに使用します。
 * - English: Firebase Storage instance for file upload/download operations.
 * - Type: FirebaseStorage
 * - Usage: ref(storage, 'path/to/file')
 */

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

export const firebaseConfig = {
  apiKey: "AIzaSyA9Pmi66A72OstDEVtXRdoPu5dme97vWe4",
  authDomain: "newword-f6f1e.firebaseapp.com",
  projectId: "newword-f6f1e",
  storageBucket: "newword-f6f1e.firebasestorage.app",
  messagingSenderId: "641661182467",
  appId: "1:641661182467:web:abde50e9c9467b088c6436"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
