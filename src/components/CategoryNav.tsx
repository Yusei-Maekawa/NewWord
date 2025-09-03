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
  onToggleFavorite?: (categoryId: number) => Promise<void>; // お気に入り切り替え
}

const CategoryNav: React.FC<CategoryNavProps> = ({ 
  activeCategory, 
  onCategoryChange, 
  categories,
  onCategoryUpdate,
  onToggleFavorite 
}) => {
  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());
  const [showAllCategories, setShowAllCategories] = useState(false);

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

  const handleFavoriteToggle = async (categoryId: number, event: React.MouseEvent) => {
    event.stopPropagation(); // カテゴリ選択をトリガーしないようにする
    if (onToggleFavorite) {
      try {
        await onToggleFavorite(categoryId);
        onCategoryUpdate(); // カテゴリリストを更新
      } catch (error) {
        console.error('お気に入り切り替えエラー:', error);
      }
    }
  };

  // 階層構造でカテゴリを表示するためのヘルパー関数
  const renderHierarchicalCategories = () => {
    // 表示対象のカテゴリを決定
    let displayCategories: Category[];
    
    if (showAllCategories) {
      displayCategories = categories;
    } else {
      // お気に入りカテゴリとその親カテゴリを含める
      const favoriteCategories = categories.filter(cat => cat.is_favorite);
      const parentIds = new Set<number>();
      
      // お気に入りカテゴリの親を遡って取得
      favoriteCategories.forEach(favCat => {
        let currentCat: Category | null = favCat;
        while (currentCat && currentCat.parent_id !== null) {
          parentIds.add(currentCat.parent_id);
          currentCat = categories.find(c => c.id === currentCat!.parent_id) || null;
        }
      });
      
      // お気に入りカテゴリ + その親カテゴリをすべて含める
      displayCategories = categories.filter(cat => 
        cat.is_favorite || parentIds.has(cat.id)
      );
    }
    
    const rootCategories = displayCategories.filter(cat => cat.parent_id === null);
    const result: React.ReactElement[] = [];

    const renderCategory = (category: Category, level: number = 0) => {
      // 表示対象の子カテゴリのみを取得
      const childCategories = displayCategories.filter(cat => cat.parent_id === category.id);
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
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {category.category_icon} {category.category_name}
                  {hasChildren && (
                    <span style={{ 
                      marginLeft: '4px', 
                      fontSize: '11px', 
                      opacity: 0.7 
                    }}>
                      ({childCategories.length})
                    </span>
                  )}
                </span>
                {onToggleFavorite && showAllCategories && (
                  <button
                    className={`favorite-button ${category.is_favorite ? 'favorited' : 'not-favorited'}`}
                    onClick={(e) => handleFavoriteToggle(category.id, e)}
                    title={category.is_favorite ? 'お気に入りから削除' : 'お気に入りに追加'}
                  >
                    ★
                  </button>
                )}
              </span>
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

      // お気に入りの子カテゴリを再帰的に表示（展開されている場合のみ）
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
      
      {/* カテゴリ表示切り替えボタン */}
      <div className="category-display-toggle">
        <button
          className={`toggle-nav-btn ${!showAllCategories ? 'active' : ''}`}
          onClick={() => setShowAllCategories(false)}
        >
          ⭐ お気に入りのみ
        </button>
        <button
          className={`toggle-nav-btn ${showAllCategories ? 'active' : ''}`}
          onClick={() => setShowAllCategories(true)}
        >
          📋 すべてのカテゴリ
        </button>
      </div>
      
      {/* お気に入りカテゴリセクション */}
      <div className="favorite-section">
        <h3 className="favorite-header">
          {showAllCategories ? '📋 全カテゴリ' : '⭐ お気に入りカテゴリ'}
        </h3>
        {!showAllCategories && (
          <div className="favorite-notice">
            💡 親カテゴリをお気に入りにすると、その配下の子カテゴリもすべてお気に入りになります
          </div>
        )}
        
        {/* 階層カテゴリボタン */}
        {(() => {
          const displayCategories = showAllCategories ? categories : categories.filter(cat => cat.is_favorite);
          if (displayCategories.length === 0) {
            return (
              <div className="no-favorites-message">
                {showAllCategories 
                  ? "📝 カテゴリがありません"
                  : "📝 まだお気に入りカテゴリがありません<br />カテゴリ管理から設定してください"
                }
              </div>
            );
          }
          return renderHierarchicalCategories();
        })()}
      </div>
      
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
