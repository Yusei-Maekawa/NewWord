import React, { useState, useEffect } from 'react';
import { Term } from '../types';
import { categories } from '../data/categories';

interface AddTermFormProps {
  onAddTerm: (termData: Omit<Term, 'id' | 'createdAt'>) => void;
  activeCategory?: string;
  categories: { key: string; name: string; color: string }[];
}

const AddTermForm: React.FC<AddTermFormProps> = ({ onAddTerm, activeCategory, categories }) => {
  const [formData, setFormData] = useState({
    category: activeCategory && activeCategory !== 'all' ? activeCategory : (categories.length > 0 ? categories[0].key : 'english'),
    term: '',
    meaning: '',
    example: ''
  });

  // activeCategoryが変更されたらカテゴリも自動で変更
  useEffect(() => {
    if (activeCategory && activeCategory !== 'all') {
      setFormData(prev => ({ ...prev, category: activeCategory }));
    }
  }, [activeCategory]);

  // カテゴリ一覧が変わったら、選択肢も更新
  useEffect(() => {
    if (!categories.some(c => c.key === formData.category)) {
      setFormData(prev => ({ ...prev, category: categories.length > 0 ? categories[0].key : 'english' }));
    }
  }, [categories]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.term.trim() || !formData.meaning.trim()) {
      alert('用語と意味は必須項目です。');
      return;
    }

    onAddTerm({
      category: formData.category,
      term: formData.term.trim(),
      meaning: formData.meaning.trim(),
      example: formData.example.trim() || undefined
    });

    // フォームリセット
    setFormData({
      category: 'english',
      term: '',
      meaning: '',
      example: ''
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <section className="section">
      <h2>新しい語句を追加</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="category">カテゴリ:</label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => handleInputChange('category', e.target.value)}
            required
          >
            {categories.map(cat => (
              <option key={cat.key} value={cat.key}>{cat.name}</option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="term">用語:</label>
          <input
            type="text"
            id="term"
            value={formData.term}
            onChange={(e) => handleInputChange('term', e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="meaning">意味・説明:</label>
          <textarea
            id="meaning"
            value={formData.meaning}
            onChange={(e) => handleInputChange('meaning', e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="example">例文・使用例:</label>
          <textarea
            id="example"
            value={formData.example}
            onChange={(e) => handleInputChange('example', e.target.value)}
          />
        </div>
        
        <button type="submit" className="btn">追加</button>
      </form>
    </section>
  );
};

export default AddTermForm;
