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

export const getCategoryColor = (category: string): string => {
  const categoryColors: Record<string, string> = {
    'english': '#007bff',
    'applied': '#28a745',
    'advanced': '#dc3545',
    'gkentei': '#ffc107'
  };
  return categoryColors[category] || '#6c757d';
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};
