/**
 * src/components/CategoryNav.tsx
 *
 * ============================================================================
 * 📖 ファイル概要 / File Overview
 * ============================================================================
 *
 * 【日本語】
 * カテゴリナビゲーションコンポーネント。
 * カテゴリの階層表示、フィルタリング、お気に入り管理を行います。
 * 親カテゴリの展開/折りたたみ、お気に入り表示切り替えなどのインタラクティブ機能を提供します。
 *
 * 【主な機能】
 * 1. 階層構造のカテゴリ表示（親→子→孫）
 * 2. カテゴリの展開/折りたたみ
 * 3. お気に入りカテゴリのフィルタリング表示
 * 4. アクティブカテゴリのハイライト
 * 5. お気に入りボタンによる登録/解除
 * 6. 循環参照チェック（無限ループ防止）
 *
 * 【English】
 * Category navigation component.
 * Handles hierarchical display, filtering, and favorite management of categories.
 * Provides interactive features such as expand/collapse parent categories
 * and toggle favorite display.
 *
 * 【Key Features】
 * 1. Hierarchical category display (parent → child → grandchild)
 * 2. Expand/collapse categories
 * 3. Filter display by favorite categories
 * 4. Highlight active category
 * 5. Register/unregister favorites via favorite button
 * 6. Circular reference check (prevent infinite loops)
 *
 * ============================================================================
 * 📦 型定義 / Type Definitions
 * ============================================================================
 *
 * Category - カテゴリデータ
 * - id: number - カテゴリID
 * - category_key: string - カテゴリキー
 * - category_name: string - カテゴリ名
 * - category_icon: string - カテゴリアイコン（絵文字）
 * - category_color: string - カテゴリカラー（HEX）
 * - parent_id: number | null - 親カテゴリID
 * - is_favorite: boolean - お気に入りフラグ
 * - display_order: number - 表示順序
 * - created_at: string - 作成日時
 *
 * CategoryNavProps - コンポーネントProps
 * - activeCategory: string - 現在選択中のカテゴリキー
 * - onCategoryChange: (category: string) => void - カテゴリ変更コールバック
 * - categories: Category[] - カテゴリデータ配列
 * - onCategoryUpdate: () => void - カテゴリ更新通知
 * - onToggleFavorite?: (categoryId: number) => Promise<void> - お気に入り切り替え
 *
 * ============================================================================
 * 🔧 主要関数 / Main Functions
 * ============================================================================
 *
 * 1. toggleExpanded(categoryId: number)
 *    - 日本語: カテゴリの展開/折りたたみを切り替え
 *    - English: Toggle expand/collapse of category
 *
 * 2. handleFavoriteToggle(categoryId: number, e: Event)
 *    - 日本語: お気に入りボタンクリック処理
 *    - English: Handle favorite button click
 *
 * 3. renderHierarchicalCategories()
 *    - 日本語: 階層構造のカテゴリを再帰的にレンダリング
 *    - English: Recursively render hierarchical categories
 *
 * 4. renderCategory(category: Category, level: number)
 *    - 日本語: 単一カテゴリをレンダリング（再帰関数）
 *    - English: Render single category (recursive function)
 *    - 循環参照チェック機能付き
 *    - 最大階層深さ: 10
 *
 * ============================================================================
 * 🎨 UI構成 / UI Structure
 * ============================================================================
 *
 * <nav className="category-nav">
 *   ├── お気に入り表示切り替えボタン
 *   ├── 「すべて」カテゴリボタン
 *   └── 階層カテゴリセクション
 *       ├── 親カテゴリ
 *       │   ├── 展開ボタン (▶)
 *       │   ├── カテゴリボタン
 *       │   └── お気に入りボタン (★)
 *       └── 子カテゴリ（展開時に表示）
 *
 * ============================================================================
 * 🔗 依存関係 / Dependencies
 * ============================================================================
 *
 * React:
 * - useState - 展開状態、お気に入り表示切り替えの管理
 *
 * ============================================================================
 *
 * @author Yusei Maekawa
 * @version 0.3.0
 * @since 2025-08-01
 * @updated 2025-11-02
 */

import React, { useState } from 'react';
// import CategoryManager from './CategoryManager'; // 暫定的に無効化（Firestore 移行予定）

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
    const processedIds = new Set<number>(); // 循環参照防止用

    const renderCategory = (category: Category, level: number = 0) => {
      // IDの検証
      if (category.id === undefined || category.id === null) {
        console.error(`❌ カテゴリにIDがありません: ${category.category_name}`);
        return;
      }
      
      // 無限ループ防止: 既に処理済みのIDはスキップ
      if (processedIds.has(category.id)) {
        console.warn(`⚠️ 循環参照を検出: ${category.category_name} (ID: ${category.id})`);
        return;
      }
      
      // 深さ制限（最大10階層まで）
      if (level > 10) {
        console.warn(`⚠️ 階層が深すぎます: ${category.category_name} (level: ${level})`);
        return;
      }

      processedIds.add(category.id);

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
            </button>
            {onToggleFavorite && showAllCategories && (
              <button
                className={`favorite-button ${category.is_favorite ? 'favorited' : 'not-favorited'}`}
                onClick={(e) => handleFavoriteToggle(category.id, e)}
                title={category.is_favorite ? 'お気に入りから削除' : 'お気に入りに追加'}
                style={{
                  marginLeft: '4px'
                }}
              >
                ★
              </button>
            )}
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
      
      {/* カテゴリ管理ボタン（暫定的に無効化 - Firestore 移行後に再実装） */}
      {/* <button
        className="category-btn category-manage-btn"
        onClick={() => setIsManagerOpen(true)}
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          fontWeight: '600'
        }}
      >
        ⚙️ カテゴリ管理
      </button> */}

      {/* カテゴリ管理モーダル（暫定的に無効化 - Firestore 移行後に再実装） */}
      {/* <CategoryManager
        isOpen={isManagerOpen}
        onClose={() => setIsManagerOpen(false)}
        onCategoryUpdate={handleCategoryUpdate}
      /> */}
    </nav>
  );
};

export default CategoryNav;
