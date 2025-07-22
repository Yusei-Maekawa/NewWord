import React, { useState } from 'react';
import { categories as initialCategories, getCategoryName } from '../data/categories';

interface CategoryNavProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  categories: typeof initialCategories;
  onAddCategory: (cat: { key: string; name: string; color: string }) => void;
  onDeleteCategory: (key: string) => void;
}

const CategoryNav: React.FC<CategoryNavProps> = ({ activeCategory, onCategoryChange, categories, onAddCategory, onDeleteCategory }) => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#6c757d');
  const [deleteMode, setDeleteMode] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<string[]>([]);

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const key = newCategoryName.trim().toLowerCase().replace(/\s+/g, '_');
    if (!key || categories.some(c => c.key === key)) {
      alert('カテゴリ名が空か、既に存在します');
      return;
    }
    onAddCategory({ key, name: newCategoryName.trim(), color: newCategoryColor });
    setNewCategoryName('');
    setNewCategoryColor('#6c757d');
  };

  return (
    <nav className="category-nav">
      <div style={{ marginBottom: '1em' }}>
        <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '0.5em', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="新しいカテゴリ名"
            value={newCategoryName}
            onChange={e => setNewCategoryName(e.target.value)}
            required
          />
          <input
            type="color"
            value={newCategoryColor}
            onChange={e => setNewCategoryColor(e.target.value)}
            title="色を選択"
          />
          <button type="submit">追加</button>
        </form>
      </div>
      <div style={{ marginBottom: '1em' }}>
        <button type="button" onClick={() => setDeleteMode(!deleteMode)} style={{ marginRight: '0.5em' }}>
          {deleteMode ? '削除モード解除' : 'カテゴリ削除モード'}
        </button>
        {deleteMode && (
          <button
            type="button"
            style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '0.3em 1em', borderRadius: '4px' }}
            disabled={selectedForDelete.length === 0}
            onClick={() => {
              if (window.confirm('選択したカテゴリを削除しますか？')) {
                selectedForDelete.forEach(key => onDeleteCategory(key));
                setSelectedForDelete([]);
                setDeleteMode(false);
              }
            }}
          >選択したカテゴリを削除</button>
        )}
      </div>
      {categories.map(category => (
        <div key={category.key} style={{ display: 'flex', alignItems: 'center', gap: '0.5em', marginBottom: '0.3em' }}>
          <button
            className={`category-btn ${activeCategory === category.key ? 'active' : ''}`}
            style={{ backgroundColor: category.color }}
            onClick={() => onCategoryChange(category.key)}
            disabled={deleteMode}
          >
            {category.name}
          </button>
          {deleteMode && category.key !== 'all' && (
            <input
              type="checkbox"
              checked={selectedForDelete.includes(category.key)}
              onChange={e => {
                if (e.target.checked) {
                  setSelectedForDelete(prev => [...prev, category.key]);
                } else {
                  setSelectedForDelete(prev => prev.filter(k => k !== category.key));
                }
              }}
            />
          )}
        </div>
      ))}
    </nav>
  );
};

export default CategoryNav;
