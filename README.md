# 🎓 学習用語句振り返りアプリ (React版)

資格試験の学習用語句を効率的に管理・復習するためのReact Webアプリケーションです。

## 📊 開発背景

これからいろいろな資格に挑戦していきたいことから、自分の学習記録を残しておくと楽しく勉強できると思い開発に至った。
また、学習した用語をいつでも振り返ることができるようにすることで、知識の定着を図りたいと考えています。
その後の話ではあるが、勉強は「人に教えることでも成長する」と言われているため、自分の作ったカードを他の人にも共有できるようにしたいという思いもあります。

## 🚀 クイックスタート

```bash
# 1. Docker環境起動（推奨）
docker-compose up -d

# 2. APIサーバー起動
node server.js

# 3. Reactアプリ起動
npm start

# 4. ブラウザでアクセス
# http://localhost:3000
```

📖 **詳細な手順**: [アプリケーション起動ガイド](docs/guides/getting-started.md)

## 📁 プロジェクト構造

```
StudyingEverything/
├── 🖥️ src/                   # React アプリケーション
│   ├── components/           # UIコンポーネント
│   ├── hooks/               # カスタムフック (useTerms, useStudySession)
│   ├── data/                # 静的データ・設定ファイル
│   ├── styles/              # CSSスタイルシート
│   ├── utils/               # ユーティリティ関数・ヘルパー
│   └── types.ts             # TypeScript型定義
├── 🛢️ database/              # データベース関連ファイル
│   ├── sql/                 # SQLスクリプト（テーブル作成・更新）
│   └── debug/               # デバッグ用ファイル
├── 🤖 batch-scripts/         # 自動化バッチファイル（起動・修正）
├── 🧪 tests/                 # テストファイル（API・ブラウザテスト）
├── 📚 docs/                  # ドキュメント
│   ├── guides/              # 使用ガイド（起動・開発手順）
│   └── setup/               # 環境セットアップガイド
├── ⚙️ scripts/               # 自動化スクリプト（バックアップ等）
├── 🐳 mysql-conf/           # MySQL設定ファイル
├── 🐳 mysql-init/           # Docker MySQL初期化スクリプト
├── 📦 build/                # ビルド済みファイル
├── 📁 backup/               # 旧バージョンのバックアップ
├── 🐳 docker-compose.yml    # Docker設定
├── 📄 server.js             # Node.js APIサーバー
├── 📄 package.json          # npm依存関係・スクリプト
└── 📄 tsconfig.json         # TypeScript設定
```

### 📂 各ディレクトリの詳細

| ディレクトリ | 説明 | 主要ファイル |
|-------------|------|-------------|
| **src/** | Reactアプリのソースコード | App.tsx, index.tsx, types.ts |
| **database/** | データベース関連の管理ファイル | SQLスクリプト、デバッグツール |
| **batch-scripts/** | Windows用自動化スクリプト | 起動・修正・テスト用.batファイル |
| **tests/** | テスト・検証ファイル | API動作テスト、ブラウザテスト |
| **docs/** | プロジェクトドキュメント | セットアップ・開発・運用ガイド |
| **scripts/** | 自動化スクリプト | MySQL自動バックアップ等 |
| **mysql-conf/** | MySQL設定 | Docker用設定ファイル |
| **mysql-init/** | DB初期化 | Docker起動時の初期SQL |
| **build/** | 本番用ビルド | React本番ビルド成果物 |
| **backup/** | 旧バージョン保管 | 以前のバニラJS版等 |

📋 **詳細構成**: [プロジェクト構造](docs/DIRECTORY_STRUCTURE.md)

## 🛡️ データ保護システム

### 3重保護体制で絶対にデータを失いません

| 保護レベル | 説明 | 状態 |
|------------|------|------|
| **自動バックアップ** | 毎日自動実行・7世代管理 | ✅ 稼働中 |
| **Docker MySQL** | 安定コンテナ環境（ポート3307） | ✅ 稼働中 |
| **XAMPP MySQL** | 緊急時の保険（ポート3306） | ✅ 併用可能 |

📋 **詳細**: [データ保護チェックリスト](docs/DATA_PROTECTION_CHECKLIST.md)

## 📖 ドキュメント

### 🚀 セットアップガイド
- [アプリケーション起動ガイド](docs/guides/getting-started.md) - 基本的な起動手順
- [Docker環境セットアップ](docs/setup/docker-setup.md) - 推奨環境の構築
- [XAMPP環境セットアップ](docs/setup/xampp-setup.md) - 従来環境の構築

### 🔧 開発者向け
- [開発ガイド](docs/guides/development.md) - 開発環境・ワークフロー
- [プロジェクト構造](docs/DIRECTORY_STRUCTURE.md) - ファイル構成の詳細

### 🛡️ 運用・保守
- [データ保護システム](docs/DATA_PROTECTION_CHECKLIST.md) - バックアップ・復旧手順
- [データベースバックアップ](docs/README_DB_BACKUP.md) - バックアップの詳細
- [リリースチェックリスト](docs/RELEASE_CHECKLIST.md) - デプロイ前確認事項

## 🎯 主な機能

- ✅ **用語管理**: 追加・編集・削除・検索
- ✅ **カテゴリ管理**: 階層構造・お気に入り
- ✅ **リッチテキスト**: 色・サイズ指定可能
- ✅ **データ保護**: 3重バックアップ体制
- ✅ **環境選択**: Docker/XAMPP両対応

## 🏗️ コンポーネント設計

### React コンポーネント構成

```
src/components/
├── AddTermForm.tsx        # 用語追加フォーム
├── CategoryManager.tsx    # カテゴリ管理
├── CategoryNav.tsx        # カテゴリナビゲーション
├── CsvImportForm.tsx      # CSV インポート
├── EditTermModal.tsx      # 用語編集モーダル
├── Header.tsx             # ヘッダー
├── Notification.tsx       # 通知システム
├── ScheduleList.tsx       # スケジュール一覧
├── SchedulePage.tsx       # スケジュールページ
├── StudyLogCalendar.tsx   # 学習ログカレンダー
├── StudySection.tsx       # 学習セクション
├── StudyTimeInput.tsx     # 学習時間入力
├── TermsList.tsx          # 用語一覧表示
└── TermsList_fixed.tsx    # 修正版用語一覧
```

### 主要コンポーネントの役割

- **AddTermForm**: 新規用語の追加・リッチテキスト対応
- **TermsList**: 用語一覧表示・検索・フィルタリング
- **CategoryManager**: カテゴリの階層管理・色設定
- **EditTermModal**: 用語の編集・削除機能
- **StudySection**: 学習モード・復習機能

## 🛠️ 技術スタック

| 分野 | 技術 |
|------|------|
| **フロントエンド** | React, TypeScript, CSS3 |
| **バックエンド** | Node.js, Express, MySQL |
| **インフラ** | Docker, Docker Compose |
| **開発ツール** | npm, Git, VS Code |


## 🤝 コントリビューション

プロジェクトへの貢献を歓迎します！

1. このリポジトリをフォーク
2. フィーチャーブランチを作成 (`git checkout -b feature/AmazingFeature`)
3. 変更をコミット (`git commit -m 'Add some AmazingFeature'`)
4. ブランチをプッシュ (`git push origin feature/AmazingFeature`)
5. プルリクエストを作成

## 📞 サポート

- **Issues**: [GitHub Issues](https://github.com/Yusei-Maekawa/English-Studying/issues)
- **Documentation**: [docs/](docs/) フォルダ内の各種ガイド

## 📄 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

---

**🎉 Happy Learning! 楽しく学習しましょう！**
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

## 🐛 最近のバグ修正履歴

### 2025年8月17日 - 詳細表示のバグ修正
- **問題**: 語句一覧の詳細表示で以下のバグが発生
  - カテゴリ名の表示が正しく動作しない（新しい階層表示が適用されていない）
  - カード表示と詳細表示で書式（色など）の表示が異なる
- **解決策**: 
  - 詳細モーダルのカテゴリ表示を`getCategoryDisplay`関数を使用するよう修正
  - パンくずリスト表示も詳細モーダルに追加
  - ラベルを「例文・使用例・スクショ等」に統一
- **影響範囲**: `TermsList.tsx`の詳細モーダル部分

### 2025年8月17日 - EditTermModalへのスクリーンショット機能追加
- **新機能**: 編集モーダルにもスクリーンショットアップロード機能を追加
- **実装内容**:
  - 画像アップロード処理（Base64エンコーディング）
  - 画像プレビュー表示
  - 画像削除機能
  - 既存画像の抽出と表示
- **影響範囲**: `EditTermModal.tsx`全体

---

💡 **開発者向けヒント**: React Developer Toolsを使用してコンポーネントの状態を確認できます。