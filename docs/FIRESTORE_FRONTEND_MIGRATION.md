# Firestore フロントエンド切り替え手順

## 📝 概要

このドキュメントでは、フロントエンドを localStorage から Firestore に切り替える手順を説明します。

## ✅ 完了した作業

### 1. Firestore 対応フックの作成
`src/hooks/useTermsFirestore.ts` を作成しました。

**主な機能:**
- Firestore からのリアルタイムデータ取得
- CRUD 操作（追加・更新・削除）
- カテゴリ別フィルタリング
- 検索機能
- エラーハンドリングとローディング状態管理

**使い方:**
```typescript
import { useTermsFirestore } from './hooks/useTermsFirestore';

function MyComponent() {
  const { terms, loading, error, addTerm, updateTerm, deleteTerm } = useTermsFirestore();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return <div>{/* terms を使う */}</div>;
}
```

---

## 🔧 次に必要な作業

### Step 1: Firebase Web SDK の設定を取得

1. **Firebase Console を開く**
   - https://console.firebase.google.com/project/newword-f6f1e/settings/general

2. **「アプリを追加」または既存のウェブアプリを選択**

3. **SDK 設定と構成をコピー**
   以下のような設定が表示されます：
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "newword-f6f1e.firebaseapp.com",
     projectId: "newword-f6f1e",
     storageBucket: "newword-f6f1e.appspot.com",
     messagingSenderId: "...",
     appId: "1:...:web:..."
   };
   ```

### Step 2: firebaseClient.ts を更新

1. `src/firebaseClient.ts` を開く
2. `firebaseConfig` の `REPLACE` 部分を実際の値に置き換える

```typescript
export const firebaseConfig = {
  apiKey: "実際のAPIキーに置き換え",
  authDomain: "newword-f6f1e.firebaseapp.com",
  projectId: "newword-f6f1e",
  storageBucket: "newword-f6f1e.appspot.com",
  messagingSenderId: "実際の値に置き換え",
  appId: "実際の値に置き換え"
};
```

### Step 3: コンポーネントで useTermsFirestore に切り替え

**例: App.tsx の場合**

```typescript
// Before (localStorage版)
import { useTerms } from './hooks/useTerms';

// After (Firestore版)
import { useTermsFirestore } from './hooks/useTermsFirestore';

function App() {
  // Before
  // const { terms, addTerm, ... } = useTerms();
  
  // After
  const { terms, loading, error, addTerm, updateTerm, deleteTerm } = useTermsFirestore();
  
  if (loading) return <div>データを読み込み中...</div>;
  if (error) return <div>エラー: {error}</div>;
  
  // 以降は同じように使える
  return <div>...</div>;
}
```

---

## 🔒 セキュリティルール

Firestore のセキュリティルールを設定する必要があります。

### 開発用（読み書き自由 - テスト用のみ）
Firebase Console > Firestore Database > ルール:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // 開発用のみ！本番では使わない
    }
  }
}
```

### 本番用（認証必須）
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /terms/{termId} {
      allow read: if true; // 誰でも読み取り可能
      allow write: if request.auth != null; // 認証済みユーザーのみ書き込み可能
    }
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

---

## ✅ 動作確認手順

### 1. ビルドして起動
```bash
npm run build
npm start
```

### 2. ブラウザで確認
- http://localhost:3000 を開く
- 語句データが Firestore から読み込まれることを確認
- 語句の追加・編集・削除が動作することを確認

### 3. Firestore Console で確認
- https://console.firebase.google.com/project/newword-f6f1e/firestore
- terms コレクションを開く
- データの変更がリアルタイムで反映されることを確認

---

## 🐛 トラブルシューティング

### エラー: "Firebase: No Firebase App '[DEFAULT]' has been created"
- `src/firebaseClient.ts` の設定値が正しいか確認
- `npm install` を実行して依存関係を再インストール

### エラー: "Missing or insufficient permissions"
- Firestore のセキュリティルールを確認
- 開発時は一時的に `allow read, write: if true;` を設定

### データが表示されない
- Firestore Console でデータが存在するか確認
- ブラウザの開発者ツール（F12）でネットワークエラーを確認
- `loading` と `error` 状態を確認

---

## 📚 参考リソース

- [Firebase Web SDK ドキュメント](https://firebase.google.com/docs/web/setup)
- [Firestore セキュリティルール](https://firebase.google.com/docs/firestore/security/get-started)
- [React と Firebase の統合](https://firebase.google.com/docs/firestore/query-data/listen)

