# 🔧 開発ガイド

## 🎯 開発環境の準備

### 必要なツール

- **Node.js** (v18以上推奨)
- **npm** (Node.jsに含まれる)
- **Docker Desktop** (推奨)
- **Git**
- **VS Code** (推奨エディタ)

### VS Code拡張機能（推奨）

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "ms-vscode-remote.remote-containers"
  ]
}
```

## 📁 プロジェクト構造

詳細: [プロジェクト構造ドキュメント](../DIRECTORY_STRUCTURE.md)

```
StudyingEverything/
├── 🖥️ src/                   # React アプリケーション
│   ├── components/           # UIコンポーネント
│   ├── hooks/               # カスタムフック
│   ├── utils/               # ユーティリティ
│   └── types.ts             # TypeScript型定義
├── 🛢️ database/              # データベース関連
├── 🐳 docker-compose.yml     # Docker設定
├── 📄 server.js             # APIサーバー
└── 📚 docs/                 # ドキュメント
```

## 🔄 開発ワークフロー

### 1. ローカル開発環境

```bash
# リポジトリクローン
git clone https://github.com/Yusei-Maekawa/English-Studying.git
cd StudyingEverything

# 依存関係インストール
npm install

# Docker環境起動
docker-compose up -d

# 開発サーバー起動
npm run dev
```

### 2. 機能開発

```bash
# フィーチャーブランチ作成
git checkout -b feature/new-feature

# 開発作業
# ...

# コミット
git add .
git commit -m "feat: add new feature"

# プッシュ
git push origin feature/new-feature
```

### 3. コード品質

```bash
# TypeScript型チェック
npm run type-check

# ESLint実行
npm run lint

# Prettier実行
npm run format

# テスト実行
npm test
```

## 🛠️ 技術スタック

### フロントエンド

- **React** - UIライブラリ
- **TypeScript** - 型安全性
- **CSS3** - スタイリング
- **Fetch API** - HTTP通信

### バックエンド

- **Node.js** - ランタイム
- **Express** - Webフレームワーク
- **MySQL** - データベース
- **mysql2** - MySQLドライバー

### インフラ

- **Docker** - コンテナ化
- **Docker Compose** - マルチコンテナ管理

## 📊 API設計

### エンドポイント

| メソッド | エンドポイント | 説明 |
|----------|----------------|------|
| GET | `/api/terms` | 用語一覧取得 |
| POST | `/api/terms` | 用語追加 |
| GET | `/api/terms/:id` | 用語詳細取得 |
| PUT | `/api/terms/:id` | 用語更新 |
| DELETE | `/api/terms/:id` | 用語削除 |
| GET | `/api/categories` | カテゴリ一覧取得 |

### データ型

```typescript
interface Term {
  id: number;
  word: string;
  meaning: string;
  example?: string;
  category: string;
  created_at: string;
  updated_at: string;
}

interface Category {
  id: number;
  category_key: string;
  category_name: string;
  category_icon: string;
  category_color: string;
  parent_id?: number;
  is_favorite: boolean;
  display_order: number;
}
```

## 🧪 テスト戦略

### ユニットテスト

```bash
# Jestでコンポーネントテスト
npm test

# カバレッジレポート
npm run test:coverage
```

### 統合テスト

```bash
# APIテスト
node tests/test_favorite_api.js

# ブラウザテスト
# tests/browser-test.html をブラウザで開く
```

### E2Eテスト

```bash
# 手動テストチェックリスト
# docs/guides/getting-started.md の確認項目参照
```

## 🔧 設定ファイル

### TypeScript設定

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"]
}
```

### Docker設定

```yaml
# docker-compose.yml
version: '3.8'
services:
  mysql:
    image: mysql:8.0
    container_name: studying_mysql
    ports:
      - "3307:3306"  # XAMPPと共存
    volumes:
      - mysql_data:/var/lib/mysql
      - ./mysql-init:/docker-entrypoint-initdb.d
```

## 🚀 デプロイメント

### ビルド

```bash
# 本番用ビルド
npm run build

# ビルド成果物確認
ls -la build/
```

### 環境変数

```bash
# .env.production
REACT_APP_API_URL=https://your-api-domain.com
NODE_ENV=production
```

## 📝 コーディング規約

### React

```typescript
// ✅ Good
const TermsList: React.FC<TermsListProps> = ({ terms, onEdit }) => {
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // 副作用処理
  }, []);

  return (
    <div className="terms-list">
      {/* JSX */}
    </div>
  );
};

// ❌ Bad
function TermsList(props) {
  // TypeScript型定義なし
}
```

### CSS

```css
/* ✅ Good - BEM記法 */
.terms-list {
  /* ベース */
}

.terms-list__item {
  /* 要素 */
}

.terms-list__item--active {
  /* 修飾子 */
}
```

## 🐛 デバッグ

### Chrome DevTools

1. **Console**: エラーログ確認
2. **Network**: API通信確認
3. **Application**: Local Storage確認

### VS Code デバッグ

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug React App",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/src/index.tsx",
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

## 📚 参考資料

- [React公式ドキュメント](https://react.dev/)
- [TypeScript公式ドキュメント](https://www.typescriptlang.org/docs/)
- [Express.js公式ドキュメント](https://expressjs.com/)
- [MySQL公式ドキュメント](https://dev.mysql.com/doc/)
- [Docker公式ドキュメント](https://docs.docker.com/)

## 📞 サポート

- **Issues**: [GitHub Issues](https://github.com/Yusei-Maekawa/English-Studying/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Yusei-Maekawa/English-Studying/discussions)
- **Wiki**: [プロジェクトWiki](https://github.com/Yusei-Maekawa/English-Studying/wiki)
