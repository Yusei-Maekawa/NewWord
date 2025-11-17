/**
 * src/firebaseClient.ts
 *
 * ============================================================================
 * 📖 ファイル概要 / File Overview
 * ============================================================================
 *
 * 【日本語】
 * クライアント (ブラウザ) 側で Firebase を初期化するファイル。
 * Firebase Console から取得した設定値を使用して、Firestore、Authentication、
 * Storage などの Firebase サービスを初期化します。
 *
 * 【主な機能】
 * 1. Firebase アプリの初期化
 * 2. Firestore データベースインスタンスのエクスポート
 * 3. Authentication インスタンスのエクスポート
 * 4. Storage インスタンスのエクスポート
 *
 * 【English】
 * Client-side Firebase initializer for the browser.
 * Uses configuration values from Firebase Console to initialize Firebase services
 * such as Firestore, Authentication, and Storage.
 *
 * 【Key Features】
 * 1. Initialize Firebase app
 * 2. Export Firestore database instance
 * 3. Export Authentication instance
 * 4. Export Storage instance
 *
 * ============================================================================
 * 📦 エクスポート変数 / Exported Variables
 * ============================================================================
 *
 * - firebaseConfig: object - Firebase設定オブジェクト（apiKey, authDomain等）
 * - db: Firestore - Firestoreクライアントインスタンス
 * - auth: Auth - Firebase Authenticationインスタンス
 * - storage: FirebaseStorage - Firebase Storageインスタンス
 *
 * ============================================================================
 * 🔗 依存関係 / Dependencies
 * ============================================================================
 *
 * Firebase SDK:
 * - firebase/app: initializeApp
 * - firebase/firestore: getFirestore
 * - firebase/auth: getAuth
 * - firebase/storage: getStorage
 *
 * ============================================================================
 *
 * @author Yusei Maekawa
 * @version 0.3.0
 * @since 2025-08-01
 * @updated 2025-11-02
 */

/**
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
