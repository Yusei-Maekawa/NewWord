// カテゴリ（種目）一覧と名前・色
export const categories = [
  { key: 'english', name: '英語', color: '#007bff' },
  { key: 'applied', name: '応用情報', color: '#28a745' },
  { key: 'advanced', name: '高度情報', color: '#dc3545' },
  { key: 'gkentei', name: 'G検定', color: '#ffc107' }
];

export type CategoryKey = typeof categories[number]['key'];

export const getCategoryName = (key: CategoryKey): string => {
  const found = categories.find(c => c.key === key);
  return found ? found.name : key;
};

export const getCategoryColor = (key: CategoryKey): string => {
  const found = categories.find(c => c.key === key);
  return found ? found.color : '#6c757d';
};
