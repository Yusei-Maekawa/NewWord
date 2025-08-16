import React, { useState, useEffect } from 'react';

interface Category {
  id: number;
  category_key: string;
  category_name: string;
  category_icon: string;
  category_color: string;
  is_default: boolean;
  created_at: string;
}

interface CategoryManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoryUpdate: () => void; // カテゴリが更新されたときの通知
}

const CategoryManager: React.FC<CategoryManagerProps> = ({ isOpen, onClose, onCategoryUpdate }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState({
    category_name: '',
    category_icon: '📝',
    category_color: '#6c757d'
  });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // アイコン選択肢
  const iconOptions = [
    '📝', '📚', '💻', '🔧', '🌐', '🤖', '🇺🇸', '🇯🇵',
    '⚙️', '🎯', '📊', '🔒', '☁️', '🗄️', '🧮', '📱',
    '🎨', '🚀', '⭐', '🔥', '💡', '🎪', '🎭', '🎲'
  ];

  // カテゴリ一覧を取得
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:4000/api/categories');
      if (!response.ok) throw new Error('カテゴリの取得に失敗しました');
      const data = await response.json();
      setCategories(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
      console.error('カテゴリ取得エラー:', err);
    } finally {
      setLoading(false);
    }
  };

  // カテゴリを追加
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCategory.category_name.trim()) {
      setError('カテゴリ名を入力してください');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('http://localhost:4000/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCategory)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'カテゴリの追加に失敗しました');
      }

      // 成功時：フォームをリセットしてカテゴリ一覧を再取得
      setNewCategory({ category_name: '', category_icon: '📝', category_color: '#6c757d' });
      await fetchCategories();
      onCategoryUpdate(); // 親コンポーネントに更新を通知
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
      console.error('カテゴリ追加エラー:', err);
    } finally {
      setLoading(false);
    }
  };

  // カテゴリを編集
  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingCategory) return;

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:4000/api/categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category_name: editingCategory.category_name,
          category_icon: editingCategory.category_icon,
          category_color: editingCategory.category_color
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'カテゴリの更新に失敗しました');
      }

      // 成功時：編集モードを終了してカテゴリ一覧を再取得
      setEditingCategory(null);
      await fetchCategories();
      onCategoryUpdate(); // 親コンポーネントに更新を通知
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
      console.error('カテゴリ編集エラー:', err);
    } finally {
      setLoading(false);
    }
  };

  // カテゴリを削除
  const handleDeleteCategory = async (category: Category) => {
    if (!window.confirm(`カテゴリ「${category.category_name}」を削除してもよろしいですか？`)) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:4000/api/categories/${category.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'カテゴリの削除に失敗しました');
      }

      await fetchCategories();
      onCategoryUpdate(); // 親コンポーネントに更新を通知
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'エラーが発生しました');
      console.error('カテゴリ削除エラー:', err);
    } finally {
      setLoading(false);
    }
  };

  // モーダルが開かれたときにカテゴリ一覧を取得
  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content category-manager" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>カテゴリ管理</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {error && (
            <div className="error-message" style={{ 
              background: '#ffe6e6', 
              color: '#d63031', 
              padding: '10px', 
              borderRadius: '4px', 
              marginBottom: '15px' 
            }}>
              {error}
            </div>
          )}

          {/* 新しいカテゴリ追加フォーム */}
          <div className="add-category-section">
            <h4>新しいカテゴリを追加</h4>
            <form onSubmit={handleAddCategory} className="add-category-form">
              <div className="form-row">
                <div className="form-group">
                  <label>カテゴリ名:</label>
                  <input
                    type="text"
                    value={newCategory.category_name}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, category_name: e.target.value }))}
                    placeholder="例: プログラミング"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>アイコン:</label>
                  <select
                    className="icon-select"
                    value={newCategory.category_icon}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, category_icon: e.target.value }))}
                  >
                    {iconOptions.map(icon => (
                      <option key={icon} value={icon}>
                        {icon}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>色:</label>
                  <input
                    type="color"
                    value={newCategory.category_color}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, category_color: e.target.value }))}
                    style={{ width: '60px', height: '40px' }}
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn btn-success"
                  disabled={loading}
                  style={{ alignSelf: 'flex-end' }}
                >
                  追加
                </button>
              </div>
            </form>
          </div>

          {/* カテゴリ一覧 */}
          <div className="categories-list">
            <h4>既存のカテゴリ</h4>
            {loading && <p>読み込み中...</p>}
            {categories.length === 0 && !loading && <p>カテゴリがありません。</p>}
            
            {categories.map(category => (
              <div key={category.id} className="category-item">
                {editingCategory?.id === category.id ? (
                  // 編集モード
                  <form onSubmit={handleEditCategory} className="edit-category-form">
                    <div className="form-row">
                      <input
                        type="text"
                        value={editingCategory.category_name}
                        onChange={(e) => setEditingCategory(prev => prev ? { ...prev, category_name: e.target.value } : null)}
                        required
                      />
                      <select
                        className="icon-select"
                        value={editingCategory.category_icon}
                        onChange={(e) => setEditingCategory(prev => prev ? { ...prev, category_icon: e.target.value } : null)}
                      >
                        {iconOptions.map(icon => (
                          <option key={icon} value={icon}>
                            {icon}
                          </option>
                        ))}
                      </select>
                      <input
                        type="color"
                        value={editingCategory.category_color}
                        onChange={(e) => setEditingCategory(prev => prev ? { ...prev, category_color: e.target.value } : null)}
                        style={{ width: '60px', height: '40px' }}
                      />
                      <button type="submit" className="btn btn-success btn-sm" disabled={loading}>
                        保存
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-secondary btn-sm"
                        onClick={() => setEditingCategory(null)}
                      >
                        キャンセル
                      </button>
                    </div>
                  </form>
                ) : (
                  // 表示モード
                  <div className="category-display">
                    <div className="category-info">
                      <span 
                        className="category-badge"
                        style={{ backgroundColor: category.category_color }}
                      >
                        {category.category_icon} {category.category_name}
                      </span>
                    </div>
                    <div className="category-actions">
                      <button 
                        className="btn btn-success btn-sm"
                        onClick={() => setEditingCategory(category)}
                        disabled={loading}
                      >
                        編集
                      </button>
                      <button 
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeleteCategory(category)}
                        disabled={loading}
                      >
                        削除
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryManager;
