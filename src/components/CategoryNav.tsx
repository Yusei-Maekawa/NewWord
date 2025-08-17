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
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

  const handleCategoryUpdate = () => {
    onCategoryUpdate(); // 親コンポーネントに更新を通知
    setIsManagerOpen(false); // モーダルを閉じる
  };

  const toggleExpanded = (categoryId: number) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // 階層構造でカテゴリを表示するためのヘルパー関数
  const renderHierarchicalCategories = () => {
    const rootCategories = categories.filter(cat => cat.parent_id === null);
    const result: React.ReactElement[] = [];

    const renderCategory = (category: Category, level: number = 0) => {
      const childCategories = categories.filter(cat => cat.parent_id === category.id);
      const isActive = activeCategory === category.category_key;
      const isExpanded = expandedCategories.has(category.id);
      const hasChildren = childCategories.length > 0;
      
      result.push(
        <div key={category.category_key} className="category-group" data-level={level}>
          <div className="category-button-wrapper">
            {hasChildren && (
              <button
                className="expand-toggle"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpanded(category.id);
                }}
                style={{
                  transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease'
                }}
              >
                ▶
              </button>
            )}
            <button
              className={`category-btn hierarchical ${isActive ? 'active' : ''}`}
              onClick={() => onCategoryChange(category.category_key)}
              style={{
                backgroundColor: isActive ? category.category_color : undefined,
                borderColor: isActive ? category.category_color : undefined,
                color: isActive ? 'white' : undefined,
                marginLeft: hasChildren ? '0' : '20px',
                '--category-color': category.category_color
              } as React.CSSProperties}
            >
              {category.category_icon} {category.category_name}
              {hasChildren && (
                <span style={{ 
                  marginLeft: '8px', 
                  fontSize: '11px', 
                  opacity: 0.7 
                }}>
                  ({childCategories.length})
                </span>
              )}
            </button>
          </div>

          {/* 子カテゴリを表示（アニメーション付き） */}
          <div 
            className={`child-categories ${isExpanded ? 'expanded' : 'collapsed'}`}
            style={{
              maxHeight: isExpanded ? `${childCategories.length * 60}px` : '0px',
              transition: 'max-height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease-in-out',
              opacity: isExpanded ? 1 : 0,
              overflow: 'hidden'
            }}
          >
            {/* この部分は下の再帰的呼び出しで処理される */}
          </div>
        </div>
      );

      // 子カテゴリを再帰的に表示（展開されている場合のみ）
      if (hasChildren && isExpanded) {
        childCategories.forEach(child => {
          renderCategory(child, level + 1);
        });
      }
    };

    rootCategories.forEach(rootCategory => {
      renderCategory(rootCategory);
    });

    return result;
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
      
      {/* 階層カテゴリボタン */}
      {renderHierarchicalCategories()}
      
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
