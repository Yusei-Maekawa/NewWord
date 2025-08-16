/**
 * カテゴリ定義ファイル
 * 新しいカテゴリを追加する際は、ここに定義を追加してください
 */

export interface Category {
  key: string;       // データベースに保存される一意のID（既存のkeyと互換性維持）
  name: string;      // 画面に表示される名前
  icon: string;      // 表示用アイコン（絵文字）
  color: string;     // カテゴリの代表色（HEXコード）
}

/**
 * 利用可能なカテゴリ一覧
 * 新しいカテゴリを追加する場合:
 * 1. ここに新しいカテゴリオブジェクトを追加
 * 2. App.css にカテゴリ色のスタイルを追加
 * 3. データベースのcategoryカラムが十分な長さであることを確認（VARCHAR(100)推奨）
 */
export const categories: Category[] = [
  // 既存カテゴリ（アイコン追加）
  { 
    key: 'english', 
    name: '英語', 
    icon: '🇺🇸', 
    color: '#007bff' 
  },
  { 
    key: 'applied', 
    name: '応用情報', 
    icon: '💻', 
    color: '#28a745' 
  },
  { 
    key: 'advanced', 
    name: '高度情報', 
    icon: '🔧', 
    color: '#dc3545' 
  },
  { 
    key: 'gkentei', 
    name: 'G検定', 
    icon: '🤖', 
    color: '#ffc107' 
  },
  { 
    key: 'ycne', 
    name: 'YCNE', 
    icon: '🌐', 
    color: '#6c757d' 
  },
  
  // 新しいカテゴリを追加
  { 
    key: 'security', 
    name: '情報セキュリティ', 
    icon: '🔒', 
    color: '#9b59b6' 
  },
  { 
    key: 'cloud', 
    name: 'クラウド', 
    icon: '☁️', 
    color: '#17a2b8' 
  },
  { 
    key: 'database', 
    name: 'データベース', 
    icon: '🗄️', 
    color: '#fd7e14' 
  },
  { 
    key: 'network', 
    name: 'ネットワーク', 
    icon: '🌐', 
    color: '#6f42c1' 
  },
  { 
    key: 'programming', 
    name: 'プログラミング', 
    icon: '⌨️', 
    color: '#343a40' 
  }
];

export type CategoryKey = typeof categories[number]['key'];

/**
 * カテゴリキーから名前を取得するヘルパー関数
 * @param key - カテゴリのキー
 * @returns カテゴリ名（見つからない場合はキーをそのまま返す）
 */
export const getCategoryName = (key: CategoryKey | string): string => {
  const found = categories.find(c => c.key === key);
  return found ? found.name : key;
};

/**
 * カテゴリキーから色を取得するヘルパー関数
 * @param key - カテゴリのキー
 * @returns カテゴリ色（見つからない場合はデフォルト色）
 */
export const getCategoryColor = (key: CategoryKey | string): string => {
  const found = categories.find(c => c.key === key);
  return found ? found.color : '#6c757d';
};

/**
 * カテゴリキーからアイコンを取得するヘルパー関数
 * @param key - カテゴリのキー
 * @returns カテゴリアイコン（見つからない場合はデフォルトアイコン）
 */
export const getCategoryIcon = (key: CategoryKey | string): string => {
  const found = categories.find(c => c.key === key);
  return found ? found.icon : '📝';
};

/**
 * すべてのカテゴリキーを取得するヘルパー関数
 * @returns カテゴリキーの配列
 */
export const getAllCategoryKeys = (): string[] => {
  return categories.map(cat => cat.key);
};

/**
 * カテゴリが存在するかチェックするヘルパー関数
 * @param key - チェックするカテゴリのキー
 * @returns 存在する場合true、存在しない場合false
 */
export const isValidCategory = (key: string): boolean => {
  return categories.some(cat => cat.key === key);
};
