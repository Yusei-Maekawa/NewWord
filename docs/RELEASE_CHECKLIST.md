# Release checklist (短縮)

- [ ] version を package.json / manifest に反映（SemVer）
- [ ] すべてのユニット/統合テストが通る
- [ ] lint/styling チェック通過
- [ ] ビルド済み成果物（dist / build / zip）を生成
- [ ] DB マイグレーションファイルを用意（例: migrations/）
- [ ] バックアップ手順を README_DB_BACKUP.md に記載（完了済み）
- [ ] CHANGELOG.md を更新（何が変わったか簡潔に）
- [ ] Git tag を作成: git tag -a vX.Y.Z -m "release vX.Y.Z"
- [ ] GitHub Release を作成してアーティファクトを添付
- [ ] 簡易復旧手順（ロールバック手順）を記載
- [ ] リリース後の監視・バックアップスケジュールを設定