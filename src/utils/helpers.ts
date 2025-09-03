/**
 * @fileoverview 汎用ヘルパー関数ファイル
 *
 * このファイルは、アプリケーション全体で使用される汎用的なユーティリティ関数を定義します。
 * 文字列処理、日付処理、データ変換などの共通機能を集約しています。
 *
 * @author Yusei Maekawa
 * @version 1.0.0
 * @since 2025-08-01
 */

/**
 * カテゴリキーからカテゴリ名を取得する関数
 *
 * @param {string} category - カテゴリキー
 * @returns {string} カテゴリ名（日本語）
 *
 * @example
 * ```typescript
 * getCategoryName('english'); // '英語'
 * getCategoryName('applied'); // '応用情報'
 * getCategoryName('unknown'); // 'unknown'（未定義の場合はキーをそのまま返す）
 * ```
 */
export const getCategoryName = (category: string): string => {
  const categoryNames: Record<string, string> = {
    'english': '英語',
    'applied': '応用情報',
    'advanced': '高度情報',
    'gkentei': 'G検定',
    'all': '全て'
  };
  return categoryNames[category] || category;
};

/**
 * カテゴリキーからカテゴリ色を取得する関数
 *
 * @param {string} category - カテゴリキー
 * @returns {string} カテゴリ色（HEXコード）
 *
 * @example
 * ```typescript
 * getCategoryColor('english'); // '#007bff'
 * getCategoryColor('applied'); // '#28a745'
 * getCategoryColor('unknown'); // '#6c757d'（デフォルトグレー）
 * ```
 */
export const getCategoryColor = (category: string): string => {
  const categoryColors: Record<string, string> = {
    'english': '#007bff',
    'applied': '#28a745',
    'advanced': '#dc3545',
    'gkentei': '#ffc107'
  };
  return categoryColors[category] || '#6c757d';
};

/**
 * 日付文字列を日本語形式にフォーマットする関数
 *
 * @param {string} dateString - ISO 8601形式の日付文字列
 * @returns {string} 日本語形式の日付文字列（YYYY年MM月DD日）
 *
 * @example
 * ```typescript
 * formatDate('2025-09-01T10:00:00Z'); // '2025年9月1日'
 * formatDate('2025-12-25'); // '2025年12月25日'
 * ```
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
