import React, { useState, useEffect } from 'react';

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

interface CategoryManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoryUpdate: () => void;
}

interface CategoryItemProps {
  category: Category;
  level: number;
  categories: Category[];
  editingCategory: Category | null;
  setEditingCategory: (category: Category | null) => void;
  handleEditCategory: (e: React.FormEvent) => void;
  handleToggleFavorite: (category: Category) => void;
  handleDeleteCategory: (category: Category) => void;
  handleAddChild: (category: Category) => void;
  iconOptions: string[];
  loading: boolean;
}

// 再帰的カテゴリアイテムコンポーネント
const CategoryItem: React.FC<CategoryItemProps> = ({
  category,
  level,
  categories,
  editingCategory,
  setEditingCategory,
  handleEditCategory,
  handleToggleFavorite,
  handleDeleteCategory,
  handleAddChild,
  iconOptions,
  loading
}) => {
  const childCategories = categories.filter(cat => cat.parent_id === category.id);
  const indentStyle = { marginLeft: `${level * 20}px` };

  return (
    <div style={indentStyle}>
      <div className="category-card">
        {editingCategory?.id === category.id ? (
          <form onSubmit={handleEditCategory} className="edit-form">
            <div className="form-row">
              <input
                type="text"
                value={editingCategory.category_name}
                onChange={(e) => setEditingCategory({
                  ...editingCategory,
                  category_name: e.target.value
                })}
                className="category-input"
                required
              />
              <select
                value={editingCategory.category_icon}
                onChange={(e) => setEditingCategory({
                  ...editingCategory,
                  category_icon: e.target.value
                })}
                className="icon-select"
              >
                {iconOptions.map(icon => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
              <input
                type="color"
                value={editingCategory.category_color}
                onChange={(e) => setEditingCategory({
                  ...editingCategory,
                  category_color: e.target.value
                })}
                className="color-input"
              />
              <button type="submit" disabled={loading} className="btn btn-success btn-sm">
                💾 保存
              </button>
              <button
                type="button"
                onClick={() => setEditingCategory(null)}
                className="btn btn-secondary btn-sm"
              >
                ❌ キャンセル
              </button>
            </div>
          </form>
        ) : (
          <div className="category-display">
            <div className="category-info">
              <span 
                className="category-badge"
                style={{ backgroundColor: category.category_color }}
              >
                {level > 0 && '└─ '}
                {category.is_favorite && '⭐ '}
                {category.category_icon} {category.category_name}
                {childCategories.length > 0 && ` (${childCategories.length}個の子)`}
              </span>
              <small style={{ display: 'block', color: '#666', fontSize: '11px', marginTop: '4px' }}>
                ID: {category.id} | 親ID: {category.parent_id || 'なし'} | レベル: {level}
              </small>
              {category.breadcrumb && (
                <div className="notion-breadcrumb">
                  {category.breadcrumb.split(' / ').map((crumb, index, array) => (
                    <React.Fragment key={index}>
                      <span className="crumb">{crumb}</span>
                      {index < array.length - 1 && <span className="separator">▶</span>}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
            <div className="category-actions">
              <button
                onClick={() => handleToggleFavorite(category)}
                className={`btn btn-sm ${category.is_favorite ? 'btn-warning' : 'btn-outline'}`}
                disabled={loading}
                title={category.is_favorite ? 'お気に入りから削除' : 'お気に入りに追加'}
              >
                {category.is_favorite ? '⭐' : '☆'}
              </button>
              <button
                onClick={() => setEditingCategory(category)}
                className="btn btn-outline btn-sm"
                disabled={loading}
                title="編集"
              >
                ✏️
              </button>
              <button
                onClick={() => handleAddChild(category)}
                className="btn btn-primary btn-sm"
                disabled={loading}
                title="子カテゴリを追加"
              >
                ➕
              </button>
              <button
                onClick={() => handleDeleteCategory(category)}
                className="btn btn-danger btn-sm"
                disabled={loading}
                title="削除"
              >
                🗑️
              </button>
            </div>
          </div>
        )}
      </div>
      
      {/* 子カテゴリを再帰的に表示 */}
      {childCategories.map(childCategory => (
        <CategoryItem
          key={childCategory.id}
          category={childCategory}
          level={level + 1}
          categories={categories}
          editingCategory={editingCategory}
          setEditingCategory={setEditingCategory}
          handleEditCategory={handleEditCategory}
          handleToggleFavorite={handleToggleFavorite}
          handleDeleteCategory={handleDeleteCategory}
          handleAddChild={handleAddChild}
          iconOptions={iconOptions}
          loading={loading}
        />
      ))}
    </div>
  );
};

const CategoryManager: React.FC<CategoryManagerProps> = ({ isOpen, onClose, onCategoryUpdate }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('📚');
  const [newCategoryColor, setNewCategoryColor] = useState('#007bff');
  const [selectedParent, setSelectedParent] = useState<number | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'tree' | 'list' | 'favorites'>('tree');

  // アイコンの選択肢
  const iconOptions = ['📚', '🎯', '💡', '🔥', '⭐', '📝', '🎨', '🔬', '🎵', '🏆', '💼', '🌟', '🚀', '🎪', '🎮'];

  // カテゴリ一覧を取得
  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/categories');
      if (!response.ok) throw new Error('カテゴリの取得に失敗しました');
      const data = await response.json();
      
      console.log('取得したカテゴリ一覧:', data);
      
      // 各カテゴリの階層情報をログ出力
      data.forEach((cat: any) => {
        console.log(`カテゴリ: ${cat.category_name}, ID: ${cat.id}, 親ID: ${cat.parent_id}, パンくず: ${cat.breadcrumb}`);
      });
      
      setCategories(data);
    } catch (error) {
      console.error('カテゴリ取得エラー:', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  // 新しいカテゴリを追加
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setLoading(true);
    
    const requestData = {
      category_name: newCategoryName.trim(),
      category_icon: newCategoryIcon,
      category_color: newCategoryColor,
      parent_id: selectedParent
    };
    
    console.log('カテゴリ追加リクエスト送信:', requestData);
    
    try {
      const response = await fetch('http://localhost:4000/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) throw new Error('カテゴリの追加に失敗しました');

      const result = await response.json();
      console.log('カテゴリ追加レスポンス:', result);

      setNewCategoryName('');
      setNewCategoryIcon('📚');
      setNewCategoryColor('#007bff');
      setSelectedParent(null);
      await fetchCategories();
      onCategoryUpdate();
    } catch (error) {
      console.error('カテゴリ追加エラー:', error);
      alert('カテゴリの追加に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // カテゴリの編集
  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:4000/api/categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category_name: editingCategory.category_name,
          category_icon: editingCategory.category_icon,
          category_color: editingCategory.category_color,
          parent_id: editingCategory.parent_id,
          is_favorite: editingCategory.is_favorite,
          display_order: editingCategory.display_order
        })
      });

      if (!response.ok) throw new Error('カテゴリの更新に失敗しました');

      setEditingCategory(null);
      await fetchCategories();
      onCategoryUpdate();
    } catch (error) {
      console.error('カテゴリ編集エラー:', error);
      alert('カテゴリの更新に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // お気に入りトグル
  const handleToggleFavorite = async (category: Category) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:4000/api/categories/${category.id}/favorite`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_favorite: !category.is_favorite })
      });

      if (!response.ok) throw new Error('お気に入りの更新に失敗しました');

      await fetchCategories();
      onCategoryUpdate();
    } catch (error) {
      console.error('お気に入りトグルエラー:', error);
      alert('お気に入りの更新に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // カテゴリの削除
  const handleDeleteCategory = async (category: Category) => {
    if (!confirm(`「${category.category_name}」を削除しますか？\n※子カテゴリがある場合は、子カテゴリも削除されます。`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:4000/api/categories/${category.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('カテゴリの削除に失敗しました');

      await fetchCategories();
      onCategoryUpdate();
    } catch (error) {
      console.error('カテゴリ削除エラー:', error);
      alert('カテゴリの削除に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  // 子カテゴリ追加
  const handleAddChild = (parentCategory: Category) => {
    setSelectedParent(parentCategory.id);
    setNewCategoryName('');
    setNewCategoryIcon('📚');
    setNewCategoryColor(parentCategory.category_color);
    // フォームまでスクロール
    setTimeout(() => {
      const input = document.querySelector('.category-input') as HTMLInputElement;
      if (input) input.focus();
    }, 100);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content category-manager" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📁 階層カテゴリ管理</h2>
          <button className="btn-close" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          {/* 表示モード切り替え */}
          <div className="view-mode-tabs">
            <button
              className={`tab-btn ${viewMode === 'tree' ? 'active' : ''}`}
              onClick={() => setViewMode('tree')}
            >
              🌳 ツリー表示
            </button>
            <button
              className={`tab-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              📋 リスト表示
            </button>
            <button
              className={`tab-btn ${viewMode === 'favorites' ? 'active' : ''}`}
              onClick={() => setViewMode('favorites')}
            >
              ⭐ お気に入り
            </button>
          </div>

          {/* 新しいカテゴリ追加フォーム */}
          <div className="category-section">
            <h3>📝 新しいカテゴリを追加</h3>
            <form onSubmit={handleAddCategory} className="category-form">
              <div className="form-row">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="カテゴリ名を入力"
                  className="category-input"
                  required
                />
                <select
                  value={newCategoryIcon}
                  onChange={(e) => setNewCategoryIcon(e.target.value)}
                  className="icon-select"
                >
                  {iconOptions.map(icon => (
                    <option key={icon} value={icon}>{icon}</option>
                  ))}
                </select>
                <input
                  type="color"
                  value={newCategoryColor}
                  onChange={(e) => setNewCategoryColor(e.target.value)}
                  className="color-input"
                />
                <select
                  value={selectedParent || ''}
                  onChange={(e) => setSelectedParent(e.target.value ? Number(e.target.value) : null)}
                  className="parent-select"
                >
                  <option value="">親カテゴリなし（ルート）</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.breadcrumb || `${cat.category_icon} ${cat.category_name}`} (ID: {cat.id})
                    </option>
                  ))}
                </select>
                <button type="submit" disabled={loading} className="btn btn-primary">
                  {loading ? '追加中...' : '➕ 追加'}
                </button>
              </div>
              {selectedParent && (
                <div className="parent-info">
                  <span>親カテゴリ:</span>
                  <div className="notion-breadcrumb">
                    {(() => {
                      const parentCat = categories.find(cat => cat.id === selectedParent);
                      console.log('選択された親カテゴリ:', parentCat);
                      if (!parentCat) return null;
                      const breadcrumb = parentCat.breadcrumb || parentCat.category_name;
                      return breadcrumb.split(' / ').map((crumb, index, array) => (
                        <React.Fragment key={index}>
                          <span className="crumb">{crumb}</span>
                          {index < array.length - 1 && <span className="separator">▶</span>}
                        </React.Fragment>
                      ));
                    })()}
                  </div>
                  <button type="button" onClick={() => setSelectedParent(null)} className="btn btn-xs btn-secondary">
                    クリア
                  </button>
                  <small style={{ display: 'block', marginTop: '4px', color: '#666' }}>
                    親ID: {selectedParent} | 新しいカテゴリはこの配下に作成されます
                  </small>
                </div>
              )}
            </form>
          </div>

          {/* カテゴリ表示エリア */}
          <div className="category-section">
            <h3>
              {viewMode === 'tree' && '🌳 ツリー表示'}
              {viewMode === 'list' && '📋 リスト表示'}
              {viewMode === 'favorites' && '⭐ お気に入りカテゴリ'}
            </h3>
            
            <div className="categories-container">
              {loading && <div className="loading">読み込み中...</div>}
              
              {viewMode === 'tree' && (
                <div className="category-tree">
                  <div style={{ marginBottom: '16px', padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                    <strong>デバッグ情報:</strong><br />
                    総カテゴリ数: {categories.length}<br />
                    ルートカテゴリ数: {categories.filter(cat => cat.parent_id === null).length}<br />
                    子カテゴリ数: {categories.filter(cat => cat.parent_id !== null).length}
                  </div>
                  {categories.filter(cat => cat.parent_id === null).map(cat => (
                    <CategoryItem
                      key={cat.id}
                      category={cat}
                      level={0}
                      categories={categories}
                      editingCategory={editingCategory}
                      setEditingCategory={setEditingCategory}
                      handleEditCategory={handleEditCategory}
                      handleToggleFavorite={handleToggleFavorite}
                      handleDeleteCategory={handleDeleteCategory}
                      handleAddChild={handleAddChild}
                      iconOptions={iconOptions}
                      loading={loading}
                    />
                  ))}
                </div>
              )}

              {viewMode === 'list' && (
                <div className="categories-list">
                  {categories.map(category => (
                    <div key={category.id} className="category-item">
                      {editingCategory?.id === category.id ? (
                        <form onSubmit={handleEditCategory} className="edit-form">
                          <div className="form-row">
                            <input
                              type="text"
                              value={editingCategory.category_name}
                              onChange={(e) => setEditingCategory({
                                ...editingCategory,
                                category_name: e.target.value
                              })}
                              className="category-input"
                              required
                            />
                            <select
                              value={editingCategory.category_icon}
                              onChange={(e) => setEditingCategory({
                                ...editingCategory,
                                category_icon: e.target.value
                              })}
                              className="icon-select"
                            >
                              {iconOptions.map(icon => (
                                <option key={icon} value={icon}>{icon}</option>
                              ))}
                            </select>
                            <input
                              type="color"
                              value={editingCategory.category_color}
                              onChange={(e) => setEditingCategory({
                                ...editingCategory,
                                category_color: e.target.value
                              })}
                              className="color-input"
                            />
                            <button type="submit" disabled={loading} className="btn btn-success btn-sm">
                              保存
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingCategory(null)}
                              className="btn btn-secondary btn-sm"
                            >
                              キャンセル
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div className="category-display">
                          <div className="category-info">
                            <span 
                              className="category-badge"
                              style={{ backgroundColor: category.category_color }}
                            >
                              {category.category_icon} {category.category_name}
                            </span>
                            {category.is_favorite && (
                              <span className="favorite-badge">⭐</span>
                            )}
                            {category.parent_name && (
                              <span className="parent-badge">
                                📁 {category.parent_icon} {category.parent_name}
                              </span>
                            )}
                          </div>
                          <div className="category-actions">
                            <button
                              onClick={() => handleToggleFavorite(category)}
                              className={`btn btn-sm ${category.is_favorite ? 'btn-warning' : 'btn-outline'}`}
                              disabled={loading}
                            >
                              {category.is_favorite ? '⭐' : '☆'}
                            </button>
                            <button
                              onClick={() => setEditingCategory(category)}
                              className="btn btn-outline btn-sm"
                              disabled={loading}
                            >
                              ✏️ 編集
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category)}
                              className="btn btn-danger btn-sm"
                              disabled={loading}
                            >
                              🗑️ 削除
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {viewMode === 'favorites' && (
                <div className="favorites-section">
                  {categories.some(cat => cat.is_favorite) ? (
                    <div className="category-tree">
                      {categories.filter(cat => cat.is_favorite && cat.parent_id === null).map(rootCategory => (
                        <CategoryItem
                          key={rootCategory.id}
                          category={rootCategory}
                          level={0}
                          categories={categories}
                          editingCategory={editingCategory}
                          setEditingCategory={setEditingCategory}
                          handleEditCategory={handleEditCategory}
                          handleToggleFavorite={handleToggleFavorite}
                          handleDeleteCategory={handleDeleteCategory}
                          handleAddChild={handleAddChild}
                          iconOptions={iconOptions}
                          loading={loading}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="no-favorites">
                      <p>⭐ お気に入りに登録されたカテゴリはありません</p>
                      <p>カテゴリの横にある ☆ ボタンをクリックしてお気に入りに追加しましょう！</p>
                    </div>
                  )}
                </div>
              )}

              {!loading && categories.length === 0 && (
                <div className="no-categories">
                  <p>📁 カテゴリがまだありません</p>
                  <p>上のフォームから新しいカテゴリを追加してください！</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;
