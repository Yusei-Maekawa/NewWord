# 📋 データ保護チェックリスト

## 🛡️ データを絶対に失わないための確認事項

### ✅ 毎日の確認項目

1. **自動バックアップの確認**
   ```powershell
   # 最新のバックアップファイルを確認
   Get-ChildItem "C:\backups" -Filter "all_db_*.sql*" | Sort-Object LastWriteTime -Descending | Select-Object -First 1
   ```

2. **Docker MySQLの稼働確認**
   ```bash
   docker-compose ps
   # studying_mysql が Up状態であることを確認
   ```

3. **XAMPPの状態確認**
   - XAMPPコントロールパネルでMySQLが緑色（Running）

### ✅ 週次の確認項目

1. **バックアップスクリプトの動作テスト**
   ```powershell
   .\scripts\backup_mysql.ps1
   ```

2. **古いバックアップの整理確認**
   - C:\backupsフォルダ内が7世代以内に保たれているか

3. **Dockerコンテナの更新**
   ```bash
   docker-compose pull mysql
   docker-compose up -d
   ```

### 🚨 緊急時の復旧手順

#### バックアップからの復旧
```powershell
# 最新のバックアップファイルを確認
$latestBackup = Get-ChildItem "C:\backups" -Filter "all_db_*.sql*" | Sort-Object LastWriteTime -Descending | Select-Object -First 1

# Dockerに復旧
docker-compose exec mysql mysql -u root -p < $latestBackup.FullName

# XAMPPに復旧
"C:\xampp\mysql\bin\mysql.exe" -u root -p < $latestBackup.FullName
```

#### コンテナの完全再構築
```bash
# 危険：データボリュームも削除される
docker-compose down -v
docker-compose up -d

# データの復旧
docker-compose exec mysql mysql -u root -p < C:\backups\all_db_最新日時.sql
```

### 📊 データ保護レベル

- **レベル1**: XAMPP MySQLのみ → ❌ リスク高
- **レベル2**: XAMPP + 手動バックアップ → ⚠️ リスク中
- **レベル3**: XAMPP + 自動バックアップ → ✅ リスク低
- **レベル4**: Docker + 自動バックアップ → ✅✅ リスク極低
- **レベル5**: Docker + XAMPP + 自動バックアップ → 🛡️ **現在のレベル（最強）**

### 🔄 定期メンテナンス

#### 月次
- Dockerイメージの更新
- バックアップフォルダの容量確認
- 復旧テストの実施

#### 年次
- 外部ストレージへのバックアップ
- システム全体の見直し

---

**重要**: このチェックリストを定期的に確認し、データ保護体制を維持してください。
