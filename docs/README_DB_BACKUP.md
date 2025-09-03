# DB バックアップと復旧（短縮版）

目的  
ローカル開発環境（XAMPP 等）での MySQL/MariaDB データを安全に保存・復旧するための最小手順と注意点。

前提
- バックアップ前に必ず現在の data フォルダを丸ごと別名でコピーして保管する。  
- 復元は可能な限り「元と同じ MySQL/MariaDB バージョン」を使う。

## 自動バックアップスクリプト

定期的なバックアップを自動化するために、PowerShellスクリプトを用意しています。

### スクリプトの実行方法

1. PowerShellを管理者権限で起動
2. スクリプトを実行
   ```powershell
   .\scripts\backup_mysql.ps1
   ```
   ※初回実行時はMySQL rootパスワードの入力を求められます

### スクリプトの機能
- 全データベースの論理ダンプ（mysqldump）
- 自動圧縮（7-Zip使用）
- 世代管理（最新7世代を保持）
- エラーハンドリング

### 定期実行の設定（Windowsタスクスケジューラ）

1. タスクスケジューラを開く
2. 「タスクの作成」を選択
3. 以下の設定を行う：
   - 名前：MySQL Backup
   - トリガー：毎日 02:00
   - 操作：プログラムの開始
     - プログラム：powershell.exe
     - 引数：-ExecutionPolicy Bypass -File "C:\Users\Owner\Desktop\StudyingEverything\scripts\backup_mysql.ps1"
   - 条件：コンピュータがAC電源で動作している場合のみ実行

## 推奨方針
- まずは「論理ダンプ（mysqldump／mysqlpump）」を自動化する。復旧が簡単でバージョン差に強い。  
- 物理コピー（datadir）は最終手段／同一バージョン・同一ファイルセット（ibdata / ib_logfile 等）が揃っている場合のみ実行。

---

## 方法 A — 推奨（論理ダンプ）
メリット：移行やバージョン差に強く、復元が確実。  
よく使う mysqldump 例（InnoDB での整合性を保つ）：
```powershell
"C:\xampp\mysql\bin\mysqldump.exe" -u root -p --all-databases --single-transaction --routines --events --triggers --quick > C:\backups\all_databases_$(Get-Date -Format yyyyMMdd_HHmmss).sql
# 圧縮
"C:\Program Files\7-Zip\7z.exe" a C:\backups\all_databases_$(Get-Date -Format yyyyMMdd_HHmmss).7z C:\backups\all_databases_*.sql
```
補足
- MyISAM を含む場合は mysqldump 実行前にテーブルロックかサーバ停止を検討する。  
- mysqlpump は並列ダンプが可能で高速（大きなDB向け）。

---

## 方法 B — 物理コピー（datadir の丸ごと退避）
メリット：ファイルを丸ごと戻すだけで復元できることがある。リスク：バージョン差や ib_logfile の不整合で起動不能になる可能性が高い。  
手順（必ず MySQL 停止後）：
```powershell
# 既存 data を退避
Rename-Item "C:\xampp\mysql\data" "C:\xampp\mysql\data_backup_$(Get-Date -Format yyyyMMdd_HHmmss)"
# バックアップを復元
$src = "D:\mysql_backup\mysql_datadir_backup"
$dst = "C:\xampp\mysql\data"
robocopy $src $dst /MIR /COPYALL /R:0 /W:0
icacls $dst /grant "NT AUTHORITY\SYSTEM:(OI)(CI)F" "BUILTIN\Administrators:(OI)(CI)F" /T
```
必須ファイル（InnoDB 使用時）
- ibdata1, ib_logfile0, ib_logfile1, ibtmp1（存在する場合）  
- 各 DB フォルダの .ibd / .frm（MyISAM は .MYI/.MYD）  
- my.ini（設定）

---

## 起動できないとき（最優先はデータ保全）
1. datadir を丸ごと別名でバックアップ（必須）  
2. my.ini に `innodb_force_recovery=1` を追加して起動を試す（必要なら 1→2→3 と段階的に上げる）  
   - 起動できたら即 mysqldump でダンプを取得（最重要）  
3. innodb_force_recovery の値を上げるほどリスク増（5,6 は最終手段）

例（my.ini に追記）
```ini
[mysqld]
# ...既存設定...
innodb_force_recovery=1
```

---

## 自動化（短い例）
- PowerShell スクリプトを作り Windows Task Scheduler で日次実行 → 圧縮 → クラウドアップロード（S3/Azure/Google）  
- 世代管理（例：7世代）で古いバックアップを自動削除する。

---

## XAMPP を壊さないための注意（運用上のコツ）
- XAMPP は「C:\xampp」等 UAC の影響が少ない場所へインストール。C:\Program Files は避ける。  
- XAMPP コントロールパネルは管理者権限で実行する（権限不足で停止処理が不完全になり DB が壊れる事例あり）。  
- C:\xampp（mysql\data, mysql\bin）をウイルス対策ソフトの除外に追加。  
- datadir のファイル操作は必ず MySQL 停止後に行う。  
- MySQL バージョンは README に記録しておく（復元時に重要）。

---

## クラウド保管（運用ポイント）
- 推奨先：AWS S3 / Google Cloud Storage / Azure Blob  
- 転送後はサーバ側暗号化（SSE）＋クライアント側暗号化（7zip AES256）を推奨。  
- バージョニングとライフサイクル（古い世代の自動削除）を有効にする。  
- アップロードは専用の最小権限アカウントを使う。

簡易アップロード例（AWS CLI）
```powershell
aws s3 cp "C:\backups\all_db_20250903.sql.7z" s3://your-bucket/backups/ --sse AES256
```

---

## チェックリスト（必ず）
- [ ] datadir の丸ごとバックアップ済み（別名）  
- [ ] 定期的に mysqldump を取得している  
- [ ] バックアップは圧縮＋暗号化して別場所へ保管（クラウド推奨）  
- [ ] 復元テストを別環境で定期的に実施  
- [ ] XAMPP は管理者として起動している

---

## 参考（追加）
- 参考記事（手順・自動化の実例）: https://zenn.dev/mof_moriko/articles/1ad174cbd123ae  
- MySQL / MariaDB 公式ドキュメント（InnoDB リカバリ、innodb_force_recovery）

短くまとめると：まずは「定期的な論理ダンプの自動化とクラウド保管」を定着させ、物理 datadir は最終手段としてください。復元テストを習慣化すれば事故の被害は最小化できます。