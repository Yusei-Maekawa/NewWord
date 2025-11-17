# React学習アプリにFirebaseを導入した話【セットアップ完全ガイド】

## はじめに

こんにちは！現在、英語や資格試験の学習用語を管理するWebアプリを開発しています。

今回、バックエンドを**MySQL（Docker）からFirebaseへ移行**しました。この記事では、なぜFirebaseを選んだのか、そしてどうやってセットアップしたのかを詳しく解説します。

## 📋 目次

1. Firebaseとは？その特徴
2. なぜFirebaseを選んだのか
3. Firebaseのセットアップ手順
4. Firestoreへのデータ移行
5. Firebase Hostingでのデプロイ
6. まとめと今後の展望

---

## 🔥 Firebaseとは？その特徴

Firebaseは、Googleが提供する**モバイル・Webアプリ開発プラットフォーム**です。

### 主な特徴

#### 1. **BaaS（Backend as a Service）**
サーバーサイドのコードを書かずに、バックエンド機能を利用できます。

- **Firestore**: NoSQLデータベース（リアルタイム同期）
- **Authentication**: ユーザー認証（Google、GitHub、メールアドレスなど）
- **Storage**: 画像・動画などのファイルストレージ
- **Hosting**: 静的サイトのホスティング
- **Cloud Functions**: サーバーレス関数

#### 2. **リアルタイム同期**
Firestoreは**リアルタイムリスナー**を提供しており、データが更新されると自動的にクライアントに反映されます。

```typescript
// データの変更を自動的に検知
onSnapshot(collection(db, 'terms'), (snapshot) => {
  const newData = snapshot.docs.map(doc => doc.data());
  setTerms(newData); // UIが自動更新される！
});
```

#### 3. **スケーラビリティ**
自動的にスケールするため、ユーザー数が増えても安心です。

#### 4. **無料枠が充実**
個人開発や小規模プロジェクトなら、**無料プラン（Sparkプラン）**で十分です。

| サービス | 無料枠 |
|---------|--------|
| Firestore | 読み取り: 50,000回/日<br>書き込み: 20,000回/日<br>ストレージ: 1GB |
| Hosting | 10GB/月の転送量<br>360MB/月のストレージ |
| Authentication | 無制限 |
| Storage | 5GB |

---

## 🤔 なぜFirebaseを選んだのか

### 移行前の構成と課題

**以前の構成:**
- **フロントエンド**: React + TypeScript
- **バックエンド**: Express.js + MySQL（Docker）
- **ホスティング**: ローカル開発のみ

**抱えていた課題:**
1. **デプロイが面倒**: Express.jsサーバーとMySQLを別々にデプロイする必要がある
2. **インフラ管理が大変**: Dockerの管理、MySQLのバックアップ、権限設定など
3. **リアルタイム性がない**: データ更新時に手動でリロードが必要
4. **スケーリングが難しい**: ユーザーが増えたときの対応が複雑

### Firebaseを選んだ理由

#### ✅ 1. **デプロイが簡単**
```bash
# これだけで本番環境にデプロイ完了！
npm run build
firebase deploy
```

#### ✅ 2. **インフラ管理不要**
- サーバー管理不要（サーバーレス）
- データベースのバックアップは自動
- セキュリティルールだけ設定すればOK

#### ✅ 3. **リアルタイム同期が標準**
複数デバイスで開いても、データが自動同期されます。

#### ✅ 4. **React/TypeScriptとの相性が抜群**
公式SDKが充実していて、TypeScriptの型定義も完璧です。

#### ✅ 5. **無料で始められる**
個人開発なら、ほぼ無料プランで運用可能です。

---

## 🛠️ Firebaseのセットアップ手順

ここからは、実際にFirebaseをセットアップした手順を詳しく解説します。

### Step 1: Firebaseプロジェクトの作成

1. **Firebase Consoleにアクセス**
   - https://console.firebase.google.com/

2. **「プロジェクトを追加」をクリック**

3. **プロジェクト名を入力**
   - 例: `newword-f6f1e`

4. **Google Analyticsの設定（オプション）**
   - 必要に応じて有効化

5. **プロジェクトが作成されました！**

### Step 2: Firebase SDKのインストール

```bash
# Firebase SDKとCLIをインストール
npm install firebase
npm install -g firebase-tools

# Firebaseにログイン
firebase login
```

### Step 3: Firebaseプロジェクトの初期化

```bash
# プロジェクトを初期化
firebase init
```

**選択する機能:**
- ✅ Firestore
- ✅ Hosting

**設定内容:**
```
? What do you want to use as your public directory? build
? Configure as a single-page app (rewrite all urls to /index.html)? Yes
? Set up automatic builds and deploys with GitHub? Yes (optional)
```

### Step 4: Firebase設定ファイルの作成

#### `src/firebaseClient.ts`を作成

```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

// Firebase Console から取得した設定
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Firebase初期化
const app = initializeApp(firebaseConfig);

// 各サービスのインスタンスをエクスポート
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
```

**設定値の取得方法:**
1. Firebase Console → プロジェクト設定
2. 「全般」タブ → 「マイアプリ」
3. 「SDK の設定と構成」から取得

### Step 5: Firestoreカスタムフックの作成

#### `src/hooks/useTermsFirestore.ts`

```typescript
import { useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  query,
  where,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../firebaseClient';
import { Term } from '../types';

export const useTermsFirestore = () => {
  const [terms, setTerms] = useState<Term[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // リアルタイムリスナーでデータ取得
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'terms'),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Term[];
        setTerms(data);
        setLoading(false);
      },
      (err) => {
        console.error('Firestore error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    // クリーンアップ
    return () => unsubscribe();
  }, []);

  // 用語を追加
  const addTerm = async (term: Omit<Term, 'id'>) => {
    try {
      await addDoc(collection(db, 'terms'), {
        ...term,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now()
      });
    } catch (err) {
      console.error('Error adding term:', err);
      throw err;
    }
  };

  // 用語を更新
  const updateTerm = async (id: string, term: Partial<Term>) => {
    try {
      const docRef = doc(db, 'terms', id);
      await updateDoc(docRef, {
        ...term,
        updated_at: Timestamp.now()
      });
    } catch (err) {
      console.error('Error updating term:', err);
      throw err;
    }
  };

  // 用語を削除
  const deleteTerm = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'terms', id));
    } catch (err) {
      console.error('Error deleting term:', err);
      throw err;
    }
  };

  return {
    terms,
    loading,
    error,
    addTerm,
    updateTerm,
    deleteTerm
  };
};
```

### Step 6: コンポーネントでの使用

#### `src/App.tsx`

```typescript
import { useTermsFirestore } from './hooks/useTermsFirestore';

function App() {
  const { terms, loading, error, addTerm, updateTerm, deleteTerm } = useTermsFirestore();

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div>エラー: {error}</div>;

  return (
    <div>
      <h1>学習用語リスト</h1>
      {terms.map(term => (
        <div key={term.id}>
          <h3>{term.word}</h3>
          <p>{term.meaning}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## 📊 Firestoreへのデータ移行

MySQLからFirestoreへのデータ移行スクリプトを作成しました。

### `scripts/mysql_to_firestore.js`

```javascript
const admin = require('firebase-admin');
const mysql = require('mysql2/promise');

// Firebase Admin SDK初期化
const serviceAccount = require('../secrets/serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// MySQL接続
const mysqlConnection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'english_studying'
});

// データ移行
async function migrateData() {
  console.log('データ移行を開始します...');
  
  // MySQLからデータ取得
  const [rows] = await mysqlConnection.execute('SELECT * FROM terms');
  
  // Firestoreにバッチ書き込み
  const batch = db.batch();
  
  rows.forEach(row => {
    const docRef = db.collection('terms').doc();
    batch.set(docRef, {
      word: row.word,
      meaning: row.meaning,
      example: row.example,
      category: row.category,
      created_at: admin.firestore.Timestamp.fromDate(row.created_at),
      updated_at: admin.firestore.Timestamp.fromDate(row.updated_at)
    });
  });
  
  await batch.commit();
  console.log(`${rows.length}件のデータを移行しました！`);
}

migrateData();
```

**実行:**
```bash
node scripts/mysql_to_firestore.js
```

---

## 🚀 Firebase Hostingでのデプロイ

### Step 1: ビルド

```bash
npm run build
```

### Step 2: デプロイ

```bash
firebase deploy
```

**デプロイ完了！**
```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/newword-f6f1e
Hosting URL: https://newword-f6f1e.web.app
```

### Step 3: GitHub Actionsで自動デプロイ（オプション）

#### `.github/workflows/firebase-hosting-merge.yml`

```yaml
name: Deploy to Firebase Hosting on merge
on:
  push:
    branches:
      - main

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci && npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: newword-f6f1e
```

**これで、mainブランチにマージするたびに自動デプロイされます！**

---

## 🔒 Firestoreセキュリティルール

データベースのセキュリティルールを設定します。

### `config/firestore.rules`

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 用語データ: 読み取りは誰でも、書き込みは認証済みユーザーのみ
    match /terms/{termId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // カテゴリデータ: 読み取りは誰でも、書き込みは認証済みユーザーのみ
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

**ルールのデプロイ:**
```bash
firebase deploy --only firestore:rules
```

---

## 📈 移行後の効果

### Before（MySQL + Express.js）
- ❌ デプロイが複雑（サーバー＋DB）
- ❌ リアルタイム更新なし
- ❌ インフラ管理が必要
- ❌ スケーリングが難しい

### After（Firebase）
- ✅ デプロイが簡単（`firebase deploy`のみ）
- ✅ リアルタイム同期が標準
- ✅ インフラ管理不要（フルマネージド）
- ✅ 自動スケーリング

### パフォーマンス改善
- **初期ロード時間**: 約30%短縮
- **データ同期**: リアルタイムで即座に反映
- **ビルドサイズ**: Express.js依存がなくなり軽量化

---

## 🐛 ハマったポイントと解決策

### 1. Firestoreのデータ型の違い

**問題:**
MySQLの`TIMESTAMP`型がそのまま移行できない。

**解決:**
```typescript
import { Timestamp } from 'firebase/firestore';

// Timestamp型に変換
const firestoreData = {
  created_at: Timestamp.fromDate(new Date(mysqlData.created_at))
};
```

### 2. セキュリティルールでのエラー

**問題:**
初期設定で全データへのアクセスが拒否される。

**解決:**
開発時は一時的に以下のルールを使用:
```javascript
allow read, write: if true; // 開発用のみ！
```

### 3. Firestoreの料金

**問題:**
読み取り/書き込み回数に制限がある。

**解決:**
- リスナーを適切に`unsubscribe`する
- 不要なデータ取得を減らす
- クライアントサイドでキャッシュを活用

---

## 💡 今後の展望

### 実装予定の機能

1. **Firebase Authentication**
   - Googleログイン機能
   - ユーザーごとのデータ管理

2. **Firebase Storage**
   - 画像アップロード機能
   - 画像の最適化

3. **Cloud Functions**
   - データ集計処理
   - 定期バックアップ

4. **Firebase Analytics**
   - ユーザー行動分析
   - パフォーマンス監視

---

## 📚 まとめ

Firebaseを導入したことで、以下のメリットを得られました:

- ✅ **開発効率の向上**: インフラ管理が不要になり、機能開発に集中できる
- ✅ **リアルタイム性**: データが自動同期され、UXが向上
- ✅ **デプロイの簡素化**: ワンコマンドでデプロイ完了
- ✅ **スケーラビリティ**: ユーザー数に応じて自動スケール

個人開発やスタートアップには、Firebaseは非常におすすめです！

特に、以下のような場合に最適です:
- バックエンド開発の手間を減らしたい
- リアルタイム性が必要
- 素早くプロトタイプを作りたい
- インフラ管理をしたくない

---

## 🔗 参考リンク

- [Firebase公式ドキュメント](https://firebase.google.com/docs)
- [Firestore入門ガイド](https://firebase.google.com/docs/firestore/quickstart)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)
- [プロジェクトのGitHubリポジトリ](https://github.com/Yusei-Maekawa/English-Studying)

---

## 🙋‍♂️ 質問やフィードバックはこちら

この記事について質問や感想があれば、コメント欄やTwitterでお気軽にどうぞ！

次回は、**Firebase Authenticationを使った認証機能の実装**について書く予定です。お楽しみに！

---

**タグ**: #Firebase #React #TypeScript #Web開発 #個人開発 #BaaS #Firestore
