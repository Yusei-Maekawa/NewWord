# 🔧 トラブルシューティング

このドキュメントでは、アプリケーション開発・運用時によく発生する問題とその解決方法をまとめています。

## 目次

- [よくある問題と解決方法](#よくある問題と解決方法)
  - [問題1: 画面上で語句追加できるが、DBに反映されない](#問題1-画面上で語句追加できるがdbに反映されない)
  - [問題2: APIエラーが画面に表示されない](#問題2-apiエラーが画面に表示されない)
  - [問題3: サーバーが起動しない・接続できない](#問題3-サーバーが起動しない接続できない)
  - [問題4: CORS エラーが発生する](#問題4-cors-エラーが発生する)
  - [問題5: "Cannot read properties of undefined" エラー](#問題5-cannot-read-properties-of-undefined-エラー)
  - [問題6: 削除機能・編集機能が動作しない](#問題6-削除機能編集機能が動作しない)
  - [問題7: 語句一覧が表示されない・再読み込み後に消える](#問題7-語句一覧が表示されない再読み込み後に消える)
  - [問題8: 新しいカテゴリが保存されない・表示されない](#問題8-新しいカテゴリが保存されない表示されない)

---

## よくある問題と解決方法

### 問題1: 画面上で語句追加できるが、DBに反映されない

**原因**: React側のプロパティ名とDB側のカラム名が不一致  
- React側: `term` プロパティ
- DB側: `word` カラム

**解決方法**: API送信時にプロパティ名を変換する

```tsx
// App.tsx の handleAddTerm 内
const apiData = {
  word: termData.term,  // React「term」→DB「word」
  meaning: termData.meaning,
  example: termData.example,
  category: termData.category
};
```

---

### 問題2: APIエラーが画面に表示されない

**原因**: fetchでのエラーハンドリング不足

**解決方法**: `.catch()`でエラーをキャッチし、通知表示

```tsx
.catch(error => {
  console.error('APIエラー:', error);
  setNotification({ message: '操作に失敗しました', type: 'error' });
});
```

---

### 問題3: サーバーが起動しない・接続できない

**チェックリスト**:
1. XAMPPでMySQLが起動しているか
2. `node server.js` でAPIサーバーが起動しているか
3. http://localhost:4000/api/terms にアクセスできるか
4. ファイアウォールでポート4000がブロックされていないか

**確認コマンド**:
```bash
# MySQLプロセスの確認（Windows）
tasklist | findstr mysql

# Node.jsプロセスの確認
tasklist | findstr node

# ポートの使用状況確認
netstat -ano | findstr :4000
```

---

### 問題4: CORS エラーが発生する

**エラーメッセージ例**:
```
Access to fetch at 'http://localhost:4000/api/terms' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```

**解決方法**: server.js で CORS を有効化

```js
const cors = require('cors');
app.use(cors());
```

---

### 問題5: "Cannot read properties of undefined (reading 'trim')" エラー

**原因**: フォームの入力値が`undefined`の状態で`.trim()`を呼び出している

**解決方法**: undefined チェックを追加

```tsx
// AddTermForm.tsx, EditTermModal.tsx
const termValue = formData.term || '';
const meaningValue = formData.meaning || '';

if (!termValue.trim() || !meaningValue.trim()) {
  setNotification({ 
    message: '語句と意味は必須項目です', 
    type: 'error' 
  });
  return;
}
```

---

### 問題6: 削除機能・編集機能が動作しない

**原因**: server.js に DELETE/PUT エンドポイントが未実装

**解決方法**: server.js に削除・編集APIを追加

```js
// 削除API
app.delete('/api/terms/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM terms WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ message: '語句を削除しました' });
  });
});

// 編集API  
app.put('/api/terms/:id', (req, res) => {
  const { id } = req.params;
  const { word, meaning, example, category } = req.body;
  db.query(
    'UPDATE terms SET word = ?, meaning = ?, example = ?, category = ? WHERE id = ?',
    [word, meaning, example, category, id],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ message: '語句を更新しました' });
    }
  );
});
```

---

### 問題7: 語句一覧が表示されない・再読み込み後に消える

**原因**: APIから取得したデータのプロパティ名変換不足
- DB側: `word` カラム
- React側: `term` プロパティ

**解決方法**: データ取得時にプロパティ名を変換

```tsx
// App.tsx のuseEffect内
.then(data => {
  const convertedData = data.map((item: any) => ({
    id: item.id,
    term: item.word,  // DB「word」→React「term」
    meaning: item.meaning,
    example: item.example,
    category: item.category,
    createdAt: item.created_at
  }));
  setTerms(convertedData);
})
```

---

### 問題8: 新しいカテゴリが保存されない・表示されない

**原因**: 
1. DBのcategoryカラムの文字数制限（VARCHAR(50)）で長いカテゴリ名が切り詰められる
2. フロントエンドでカテゴリ定義が不足している
3. CSSでカテゴリの色スタイルが未定義

**解決手順**:

#### Step 1: DBのカテゴリカラムを拡張

```sql
-- phpMyAdminのSQLタブで実行
-- 現在の VARCHAR(50) から VARCHAR(100) に拡張
ALTER TABLE terms MODIFY COLUMN category VARCHAR(100);
```

#### Step 2: カテゴリ定義ファイルの作成・更新

```tsx
// src/data/categories.ts を作成または更新
export const categories = [
  // 既存カテゴリ
  { id: 'english', name: '英語', icon: '🇺🇸', color: '#3498db' },
  { id: 'applied', name: '応用情報', icon: '💻', color: '#27ae60' },
  { id: 'advanced', name: '高度情報', icon: '🔧', color: '#e74c3c' },
  { id: 'gkentei', name: 'G検定', icon: '🤖', color: '#f39c12' },
  
  // 新しいカテゴリを追加
  { id: 'security', name: '情報セキュリティ', icon: '🔒', color: '#9b59b6' },
  { id: 'cloud', name: 'クラウド', icon: '☁️', color: '#17a2b8' },
  { id: 'database', name: 'データベース', icon: '🗄️', color: '#fd7e14' },
  { id: 'network', name: 'ネットワーク', icon: '🌐', color: '#6c757d' },
  { id: 'programming', name: 'プログラミング', icon: '⌨️', color: '#343a40' }
];

// カテゴリIDから名前を取得するヘルパー関数
export const getCategoryName = (categoryId: string): string => {
  const category = categories.find(cat => cat.id === categoryId);
  return category ? category.name : categoryId;
};

// カテゴリIDからアイコンを取得するヘルパー関数
export const getCategoryIcon = (categoryId: string): string => {
  const category = categories.find(cat => cat.id === categoryId);
  return category ? category.icon : '📝';
};
```

#### Step 3: CSSにカテゴリ色を追加

```css
/* App.css の最後に追加 */

/* 新しいカテゴリのバッジ色 */
.category-badge.category-security { background: #9b59b6; }
.category-badge.category-cloud { background: #17a2b8; }
.category-badge.category-database { background: #fd7e14; }
.category-badge.category-network { background: #6c757d; }
.category-badge.category-programming { background: #343a40; }

/* カテゴリナビゲーションボタンの色（アクティブ時） */
.category-btn.active.category-security { 
  background: #9b59b6; 
  border-color: #9b59b6; 
}
.category-btn.active.category-cloud { 
  background: #17a2b8; 
  border-color: #17a2b8; 
}
.category-btn.active.category-database { 
  background: #fd7e14; 
  border-color: #fd7e14; 
}
.category-btn.active.category-network { 
  background: #6c757d; 
  border-color: #6c757d; 
}
.category-btn.active.category-programming { 
  background: #343a40; 
  border-color: #343a40; 
}
```

#### Step 4: AddTermForm.tsx のカテゴリ選択を動的に更新

```tsx
// src/components/AddTermForm.tsx
import { categories } from '../data/categories';

// カテゴリ選択のselect要素
<select
  value={formData.category}
  onChange={(e) => handleInputChange('category', e.target.value)}
  required
>
  <option value="">カテゴリを選択</option>
  {categories.map(category => (
    <option key={category.id} value={category.id}>
      {category.icon} {category.name}
    </option>
  ))}
</select>
```

#### 確認方法

1. **データベース確認**
   - phpMyAdminでtermsテーブルの構造確認
   - categoryがVARCHAR(100)になっているか確認

2. **動作テスト**
   - 新しいカテゴリで語句を追加
   - DBに保存されるかテスト

3. **表示確認**
   - 語句一覧で新しいカテゴリの色・アイコンが正しく表示されるか確認
   - カテゴリフィルタリングが正常に動作するか確認

#### デバッグ用のコンソールログ

```tsx
// AddTermForm.tsx のhandleSubmit内に追加
console.log('送信するカテゴリ:', formData.category);
console.log('利用可能なカテゴリ:', categories);

// App.tsx のhandleAddTerm内に追加  
console.log('APIに送信するデータ:', apiData);
```

---

## サポート

上記の方法で解決しない場合は、以下をご確認ください：

- [開発ガイド](guides/development.md) - 開発環境のセットアップ
- [GitHub Issues](https://github.com/Yusei-Maekawa/English-Studying/issues) - バグ報告・質問

---

**最終更新**: 2025年11月1日
