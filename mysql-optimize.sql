-- MySQLの設定を画像保存に適したものに変更
-- これらの設定を my.cnf または my.ini ファイルに追加してください

-- [mysqld] セクションに以下を追加:
-- max_allowed_packet=64M
-- innodb_log_file_size=256M
-- wait_timeout=28800

-- 現在のセッションで一時的に設定を変更（再起動後は元に戻ります）
SET GLOBAL max_allowed_packet=67108864; -- 64MB

-- テーブルのカラムタイプを確認・変更
-- 必要に応じてLONGTEXTに変更
ALTER TABLE terms MODIFY COLUMN meaning LONGTEXT;
ALTER TABLE terms MODIFY COLUMN example LONGTEXT;

-- インデックスがある場合は削除してから変更
-- DROP INDEX idx_meaning ON terms;
-- DROP INDEX idx_example ON terms;

-- 設定確認
SHOW VARIABLES LIKE 'max_allowed_packet';
DESCRIBE terms;
