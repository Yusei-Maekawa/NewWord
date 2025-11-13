# Firebase Hosting と GitHub Actions の設定手順

## ✅ 完了した作業

1. **Firebase Hosting 設定ファイルの作成**
   - `firebase.json`: Hosting の設定（public ディレクトリ: `build`, SPA 設定）
   - `.firebaserc`: Firebase プロジェクト ID の設定（`newword-f6f1e`）

2. **GitHub Actions ワークフローの作成**
   - `.github/workflows/firebase-hosting-merge.yml`: main ブランチへのマージ時に自動デプロイ
   - `.github/workflows/firebase-hosting-pull-request.yml`: PR 作成時にプレビューデプロイ

3. **コミット & プッシュ**
   - すべての設定ファイルをコミットして `feature/term-management` ブランチにプッシュ完了

---

## 🔐 次のステップ: GitHub Secret の設定

GitHub Actions でデプロイを実行するために、Firebase サービスアカウントを GitHub Secret に登録する必要があります。

### 手順:

1. **GitHub リポジトリの Settings を開く**
   - https://github.com/Yusei-Maekawa/NewWord/settings/secrets/actions

2. **New repository secret をクリック**

3. **Secret を追加**
   - **Name**: `FIREBASE_SERVICE_ACCOUNT_NEWWORD_F6F1E`
   - **Value**: Base64 エンコードされた値をコピー＆ペースト

    - 例: `eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Ij...` （実際の値は長い文字列になります）

4. **Add secret をクリック**

---

## 📝 動作確認

Secret を設定したら、以下の手順で動作確認できます：

### 方法1: main ブランチにマージ
```bash
# feature/term-management を main にマージすると自動デプロイが実行されます
git checkout main
git merge feature/term-management
git push origin main
```

### 方法2: 手動デプロイ（テスト用）
```bash
# ビルドしてから手動でデプロイ
npm run build
firebase deploy --only hosting
```

---

## 🔗 デプロイ先 URL

デプロイが成功すると、以下の URL でアクセスできます：
- **本番**: https://newword-f6f1e.web.app/
- **Firebase Console**: https://console.firebase.google.com/project/newword-f6f1e/hosting

---

## 📚 追加リソース

- [Firebase Hosting ドキュメント](https://firebase.google.com/docs/hosting)
- [GitHub Actions for Firebase](https://github.com/FirebaseExtended/action-hosting-deploy)

