import React, { useState } from 'react';
import CategoryManager from './CategoryManager';

interface Category {
  id: number;
  category_key: string;
  category_name: string;
  category_icon: string;
  category_color: string;
  parent_id: number | null;
  is_favorite: boolean;
  display_order: number;
  created_at: string;
  parent_name?: string;
  parent_icon?: string;
  child_count?: number;
  breadcrumb?: string;
  path?: Array<{
    id: number;
    name: string;
    icon: string;
    color: string;
  }>;
}

interface CategoryNavProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  categories: Category[];
  onCategoryUpdate: () => void; // カテゴリが更新されたときの通知
}

const CategoryNav: React.FC<CategoryNavProps> = ({ 
  activeCategory, 
  onCategoryChange, 
  categories,
  onCategoryUpdate 
}) => {
  const [isManagerOpen, setIsManagerOpen] = useState(false);

  const handleCategoryUpdate = () => {
    onCategoryUpdate(); // 親コンポーネントに更新を通知
    setIsManagerOpen(false); // モーダルを閉じる
  };

  return (
    <nav className="category-nav">
      {/* 全件表示ボタン */}
      <button
        className={`category-btn ${activeCategory === 'all' ? 'active' : ''}`}
        onClick={() => onCategoryChange('all')}
      >
        📋 すべて
      </button>
      
      {/* 動的カテゴリボタン */}
      {categories.map(category => (
        <button
          key={category.category_key}
          className={`category-btn ${activeCategory === category.category_key ? 'active' : ''}`}
          onClick={() => onCategoryChange(category.category_key)}
          style={{
            backgroundColor: activeCategory === category.category_key ? category.category_color : undefined,
            borderColor: activeCategory === category.category_key ? category.category_color : undefined,
            color: activeCategory === category.category_key ? 'white' : undefined
          }}
        >
          {category.category_icon} {category.category_name}
        </button>
      ))}
      
      {/* カテゴリ管理ボタン */}
      <button
        className="category-btn category-manage-btn"
        onClick={() => setIsManagerOpen(true)}
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          fontWeight: '600'
        }}
      >
        ⚙️ カテゴリ管理
      </button>

      {/* カテゴリ管理モーダル */}
      <CategoryManager
        isOpen={isManagerOpen}
        onClose={() => setIsManagerOpen(false)}
        onCategoryUpdate={handleCategoryUpdate}
      />
    </nav>
  );
};

export default CategoryNav;
