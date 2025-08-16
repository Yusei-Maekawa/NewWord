# 学習用語句振り返りアプリ (React版)
資格試験の学習用語句を効率的に管理・復習するためのReact Webアプリケーションです。

##　開発背景
これからいろいろな資格に挑戦していきたいことから、自分の学習記録を残しておくと楽しく勉強できると思い開発に至った。

---


# サーバー・DB連携の手順（進捗記録）

## アプリ起動手順（全体の流れ）

1. XAMPPコントロールパネルでMySQLとApacheを「Start」
2. ターミナルでAPIサーバー（Node.js/Express）を起動
   ```bash
   node server.js
   ```
3. 別のターミナルでReactアプリを起動
   ```bash
   npm start
   ```
4. ブラウザで http://localhost:3000 を開く

※APIサーバーは http://localhost:4000 で動作します。


1. XAMPPコントロールパネルでMySQLとApacheを「Start」
2. ブラウザで http://localhost/phpmyadmin を開く
3. データベース「study_app」を作成
4. 「study_app」内で「SQL」タブから下記を実行し、termsテーブルを作成
   ```sql
   CREATE TABLE terms (
     id INT AUTO_INCREMENT PRIMARY KEY,
     word VARCHAR(255) NOT NULL,
     meaning TEXT,
     example TEXT,
     category VARCHAR(50),
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```
5. プロジェクト直下に server.js を作成し、APIサンプルコードを貼り付け
6. ターミナルで必要なパッケージをインストール
   ```bash
   npm install express mysql2 cors
   ```
7. サーバーを起動
   ```bash
   node server.js
   ```
8. ブラウザで http://localhost:4000/api/terms にアクセスし、空配列 [] が返ることを確認
9. POST（語句追加）APIでデータを追加し、GETで配列に反映されることを確認



10. ReactからAPIを使うサンプル（fetch）

#### 語句一覧取得（GET）・語句追加（POST）の例

```js
// 語句一覧を取得
fetch('http://localhost:4000/api/terms')
  .then(res => res.json())
  .then(data => console.log(data));

// 語句を追加
fetch('http://localhost:4000/api/terms', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    word: 'test',
    meaning: 'テスト',
    example: 'This is a test.',
    category: '英語'
  })
})
  .then(res => res.json())
  .then(data => console.log(data));
```

---

#### 【応用】親コンポーネントでAPIからtermsを取得し、TermsListに渡す例

```tsx
// App.tsx 例
import React, { useEffect, useState } from 'react';
import TermsList from './components/TermsList';
import { Term } from './types';

const App: React.FC = () => {
  const [terms, setTerms] = useState<Term[]>([]);

  useEffect(() => {
    fetch('http://localhost:4000/api/terms')
      .then(res => res.json())
      .then(data => setTerms(data));
  }, []);

  const handleEditTerm = (term: Term) => {
    // 編集処理
  };
  const handleDeleteTerm = (id: number) => {
    fetch(`http://localhost:4000/api/terms/${id}`, { method: 'DELETE' })
      .then(() => setTerms(terms => terms.filter(t => t.id !== id)));
  };

  return (
    <TermsList
      terms={terms}
      onEditTerm={handleEditTerm}
      onDeleteTerm={handleDeleteTerm}
    />
  );
};
```


---

#### 【応用2】useTermsを使わずAPI fetch+useStateで管理する場合（本番用UIでAPI連携したい場合）

```tsx
// App.tsx 抜粋
const [terms, setTerms] = useState<Term[]>([]);
// 初回取得
useEffect(() => {
  fetch('http://localhost:4000/api/terms')
    .then(res => res.json())
    .then(data => setTerms(data));
}, []);

// 追加
const handleAddTerm = (termData) => {
  fetch('http://localhost:4000/api/terms', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(termData)
  })
    .then(res => res.json())
    .then(newTerm => setTerms(prev => [...prev, { ...termData, ...newTerm }]));
};
// 編集
const handleSaveEdit = (id, termData) => {
  fetch(`http://localhost:4000/api/terms/${id}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(termData)
  })
    .then(() => setTerms(prev => prev.map(t => t.id === id ? { ...t, ...termData } : t)));
};
// 削除
const handleDeleteTerm = (id) => {
  fetch(`http://localhost:4000/api/terms/${id}`, { method: 'DELETE' })
    .then(() => setTerms(prev => prev.filter(t => t.id !== id)));
};
```

> useTermsを使わずAPI fetch+useStateで管理する場合、追加・編集・削除も全てAPI経由で行う必要があります。

---


```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm start

# プロダクションビルド
npm run build
```

アプリケーションは http://localhost:3000 で起動します。

## �️ 技術スタック

- **React** 18 (TypeScript)
- **React Hooks** (カスタムフック使用)
- **CSS3** (グラデーション、アニメーション)
- **LocalStorage** (データ永続化)

## �📚 機能

### 🎯 語句管理
- **追加**: 新しい語句を4つのカテゴリに分けて追加
- **編集**: 既存の語句をモーダルで編集・更新
- **削除**: 不要な語句を削除（確認ダイアログ付き）
- **検索**: 語句、意味、例文から リアルタイム検索

### � 学習機能
- **ランダム表示**: カテゴリ別または全体からランダムに語句を出題
- **フラッシュカード**: 語句→意味の学習フロー
- **進捗表示**: 現在の学習進捗をリアルタイム表示
- **キーボードショートカット**: スペース/Enterキーで学習進行

### 💾 データ管理
- **自動保存**: ブラウザのローカルストレージに自動保存
- **初期データ**: 初回起動時にサンプルデータを自動読み込み
- **レスポンシブ**: モバイル・タブレット対応


## 🗄️ MySQLデータベースの作成手順

### 1. データベースの作成場所
XAMPPのMySQLを利用する場合、phpMyAdmin（http://localhost/phpmyadmin）からデータベースを作成してください。

例: データベース名 `study_app`

### 2. テーブル作成SQL
phpMyAdminの「SQL」タブ、またはMySQLコンソールで以下を実行：

```sql
CREATE TABLE terms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  word VARCHAR(255) NOT NULL,
  meaning TEXT,
  example TEXT,
  category VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Node.js/Express APIサーバーの概要
`server.js` などでAPIサーバーを作成し、Reactから語句データを取得・追加・編集・削除できるようにします。

#### 例: APIエンドポイント
- GET    `/api/terms`   : 全語句取得
- POST   `/api/terms`   : 語句追加
- PUT    `/api/terms/:id` : 語句編集
- DELETE `/api/terms/:id` : 語句削除

#### サンプル: Node.js/Express + mysql2
```js
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '', // XAMPPのデフォルトは空
  database: 'study_app'
});

app.get('/api/terms', (req, res) => {
  db.query('SELECT * FROM terms', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
});

app.post('/api/terms', (req, res) => {
  const { word, meaning, example, category } = req.body;
  db.query(
    'INSERT INTO terms (word, meaning, example, category) VALUES (?, ?, ?, ?)',
    [word, meaning, example, category],
    (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json({ id: result.insertId });
    }
  );
});

// ...PUT, DELETEも同様に追加

app.listen(4000, () => console.log('API server running on port 4000'));
```

---

この手順・サンプルを参考に、MySQLで語句管理を実装してください。

## 🎨 コンポーネント設計

```
src/
├── components/           # Reactコンポーネント
│   ├── Header.tsx       # ヘッダー
│   ├── CategoryNav.tsx  # カテゴリナビゲーション
│   ├── AddTermForm.tsx  # 語句追加フォーム
│   ├── StudySection.tsx # 学習セクション
│   ├── TermsList.tsx    # 語句一覧
│   ├── EditTermModal.tsx # 編集モーダル
│   └── Notification.tsx # 通知
├── hooks/               # カスタムフック
│   ├── useTerms.ts      # 語句管理
│   └── useStudySession.ts # 学習セッション
├── data/                # データ
│   └── sampleData.ts    # サンプルデータ
├── utils/               # ユーティリティ
│   └── helpers.ts       # ヘルパー関数
├── styles/              # スタイル
│   └── App.css          # メインCSS
├── types.ts             # TypeScript型定義
├── App.tsx              # メインアプリ
└── index.tsx            # エントリーポイント
```

## 🎯 使用方法

### 基本的な使い方
1. アプリ起動後、自動的にサンプルデータが読み込まれます
2. 「新しい語句を追加」で語句を追加
3. カテゴリボタンで表示を絞り込み
4. 「語句学習」でランダム学習開始
5. スペースキー/Enterキーで学習を進行

### キーボードショートカット
- `Ctrl+N` (Cmd+N): 新しい語句の入力フォームにフォーカス
- `Space` / `Enter`: 学習中の答え表示/次の語句
- `Escape`: 学習セッション終了

## 🔧 開発

### カスタムフック
- **useTerms**: 語句の CRUD 操作とローカルストレージ管理
- **useStudySession**: 学習セッションの状態管理

### TypeScript対応
- 完全な型安全性
- インターフェースによる厳密な型定義
- コンパイル時エラー検出

## 📱 レスポンシブ対応

- **デスクトップ**: フル機能
- **タブレット**: 適応レイアウト
- **モバイル**: シングルカラムレイアウト

## 🎨 カテゴリ

| カテゴリ | 色 | 説明 |
|---------|-----|------|
| 🇺🇸 英語 | 青 | プログラミング・技術英語 |
| 💻 応用情報 | 緑 | 応用情報技術者試験用語 |
| 🔧 高度情報 | 赤 | 高度情報技術者試験用語 |
| 🤖 G検定 | 黄 | AI・機械学習用語 |

## 🚀 今後の予定

### 🎯 最重要（次のアップデート）
- [ ] **意味・説明欄のリッチテキスト対応**
  - 太字、色変更、下線などの装飾機能
  - マークダウン記法やリッチエディタの導入
  - 重要な部分を強調表示できる機能

- [ ] **語句一覧の視認性向上**
  - カード型レイアウトの改善
  - カテゴリ別の色分け強化
  - アイコンやバッジの追加
  - グリッド表示/リスト表示の切り替え
  - 優先度・難易度の表示

### 🔥 学習機能の強化
- [ ] **間違えた語句の重点復習**
  - 正答率の記録・表示
  - 苦手語句の自動抽出
  - 復習優先度の自動設定
  - 間違い回数に応じた出題頻度調整

- [ ] **学習統計・進捗グラフ**
  - 日別・週別・月別の学習時間グラフ
  - カテゴリ別習得率の円グラフ
  - 学習継続日数（ストリーク）表示
  - 目標設定と達成率の可視化

- [ ] **スケジュール管理の改善**
  - 復習スケジュールの自動生成
  - リマインダー機能
  - 学習計画のテンプレート
  - 進捗に応じたスケジュール調整

### 🎨 UI/UX改善
- [ ] ダークモード対応
- [ ] より詳細な検索フィルター（難易度、習得率など）
- [ ] モバイル最適化の強化
- [ ] キーボードショートカットの拡充

---

### 💡 実装アイデア・メモ

#### 意味・説明欄のリッチテキスト化
```tsx
// 例：マークダウン記法対応
meaning: "**重要**な概念です。`コード`や*斜体*も使える"

// 例：色指定対応
meaning: "[red]重要[/red]な概念で、[blue]青色[/blue]で強調したい部分"

// 使用可能な色：
// [red]赤色[/red], [blue]青色[/blue], [green]緑色[/green]
// [orange]オレンジ[/orange], [purple]紫色[/purple], [pink]ピンク[/pink], [gray]グレー[/gray]
```

#### 語句一覧の改善案
- カード型レイアウト（現在のリスト型から変更）
- カテゴリ別アイコン（📚英語、💻応用情報など）
- 習得率バッジ（🔥完璧、⚡要復習、❓未学習）
- ソート機能（追加日、習得率、カテゴリ順）

#### 学習統計の実装例
```tsx
interface StudyStats {
  totalStudyTime: number;
  streakDays: number;
  categoryProgress: { [key: string]: number };
  weakTerms: Term[];
}
```

## 📄 以前のバージョン

バニラJavaScriptで作成された以前のバージョンは `backup/` フォルダに保存されています。

---

## 🔧 トラブルシューティング

### 🚨 よくある問題と解決方法

#### ❌ 問題1: 画面上で語句追加できるが、DBに反映されない

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

#### ❌ 問題2: APIエラーが画面に表示されない

**原因**: fetchでのエラーハンドリング不足

**解決方法**: `.catch()`でエラーをキャッチし、通知表示
```tsx
.catch(error => {
  console.error('APIエラー:', error);
  setNotification({ message: '操作に失敗しました', type: 'error' });
});
```

#### ❌ 問題3: サーバーが起動しない・接続できない

**チェックリスト**:
1. XAMPPでMySQLが起動しているか
2. `node server.js` でAPIサーバーが起動しているか
3. http://localhost:4000/api/terms にアクセスできるか
4. ファイアウォールでポート4000がブロックされていないか

#### ❌ 問題4: CORS エラーが発生する

**解決方法**: server.js で CORS を有効化
```js
const cors = require('cors');
app.use(cors());
```

#### ❌ 問題5: "Cannot read properties of undefined (reading 'trim')" エラー

**原因**: フォームの入力値が`undefined`の状態で`.trim()`を呼び出している

**解決方法**: undefined チェックを追加
```tsx
// AddTermForm.tsx, EditTermModal.tsx
const termValue = formData.term || '';
const meaningValue = formData.meaning || '';
if (!termValue.trim() || !meaningValue.trim()) {
  // バリデーション処理
}
```

#### ❌ 問題6: 削除機能・編集機能が動作しない

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

#### ❌ 問題7: 語句一覧が表示されない・再読み込み後に消える

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

#### ❌ 問題8: 新しいカテゴリが保存されない・表示されない

**原因**: 
1. DBのcategoryカラムの文字数制限（VARCHAR(50)）で長いカテゴリ名が切り詰められる
2. フロントエンドでカテゴリ定義が不足している
3. CSSでカテゴリの色スタイルが未定義

**解決手順**:

**Step 1: DBのカテゴリカラムを拡張**
```sql
-- phpMyAdminのSQLタブで実行
-- 現在の VARCHAR(50) から VARCHAR(100) に拡張
ALTER TABLE terms MODIFY COLUMN category VARCHAR(100);
```

**Step 2: カテゴリ定義ファイルの作成・更新**
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

**Step 3: CSSにカテゴリ色を追加**
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

**Step 4: AddTermForm.tsx のカテゴリ選択を動的に更新**
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

**確認方法**:
1. phpMyAdminでtermsテーブルの構造確認（categoryがVARCHAR(100)になっているか）
2. 新しいカテゴリで語句を追加してDBに保存されるかテスト
3. 語句一覧で新しいカテゴリの色・アイコンが正しく表示されるか確認
4. カテゴリフィルタリングが正常に動作するか確認

**詳細な手順**:
```bash
# 1. データベース更新
# phpMyAdminで database_update.sql を実行

# 2. アプリケーション起動テスト
# test-new-categories.bat を実行して動作確認

# 3. 手動テスト手順
# - 語句追加フォームで「情報セキュリティ」カテゴリを選択
# - 語句を追加して保存
# - phpMyAdminでデータが正しく保存されているか確認
# - 語句一覧でカテゴリの色とアイコンが表示されるか確認
```

**デバッグ用のコンソールログ**:
```tsx
// AddTermForm.tsx のhandleSubmit内に追加
console.log('送信するカテゴリ:', formData.category);
console.log('利用可能なカテゴリ:', categories);

// App.tsx のhandleAddTerm内に追加  
console.log('APIに送信するデータ:', apiData);
```

#### 🛠️ デバッグ方法

1. **ブラウザのDevTools → Network タブ**でAPI リクエスト/レスポンスを確認
2. **Console タブ**でJavaScriptエラーやconsole.logの出力を確認  
3. **server.js でconsole.log**を追加してリクエスト受信を確認
4. **phpMyAdmin**でDBに実際にデータが入っているか確認

---

💡 **開発者向けヒント**: React Developer Toolsを使用してコンポーネントの状態を確認できます。
FLUSH PRIVILEGES;
GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost' IDENTIFIED BY '' WITH GRANT OPTION;
FLUSH PRIVILEGES;