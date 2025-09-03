-- MySQLの設定確認とテーブル情報の取得
SHOW VARIABLES LIKE 'max_allowed_packet';
SHOW VARIABLES LIKE 'innodb_log_file_size';

-- テーブル構造確認
DESCRIBE terms;

-- データ長の確認
SELECT 
  id, 
  term, 
  CHAR_LENGTH(meaning) as meaning_length,
  CHAR_LENGTH(example) as example_length,
  SUBSTRING(meaning, 1, 100) as meaning_start,
  SUBSTRING(example, 1, 100) as example_start
FROM terms 
WHERE meaning LIKE '%data:image%' OR example LIKE '%data:image%'
ORDER BY meaning_length DESC, example_length DESC
LIMIT 5;
