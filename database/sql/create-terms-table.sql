-- termsテーブルの確認と更新
USE study_app;

-- 現在のtermsテーブル構造を確認
DESCRIBE terms;

-- 既存のテーブル構造を確認（id, word, meaning, example, category, created_at）
-- 新しいフロントエンドは "term" カラムを期待しているので、wordカラムをtermにリネーム
-- または、サーバー側を既存のwordカラムに合わせる

-- 現在のterms一覧を確認
SELECT 
  id,
  category,
  word,
  LEFT(meaning, 50) as meaning_preview,
  created_at
FROM terms
ORDER BY category, created_at;

-- 各カテゴリの用語数を確認
SELECT 
  category,
  COUNT(*) as term_count
FROM terms
GROUP BY category
ORDER BY term_count DESC;
