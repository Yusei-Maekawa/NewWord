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
  const [showRichTextHelp, setShowRichTextHelp] = useState(false);

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
    
    // undefined チェックを追加してエラーを防ぐ
    const termValue = formData.term || '';
    const meaningValue = formData.meaning || '';
    const exampleValue = formData.example || '';
    
    if (!termValue.trim() || !meaningValue.trim()) {
      alert('用語と意味は必須項目です。');
      return;
    }

    onAddTerm({
      category: formData.category,
      term: termValue.trim(),
      meaning: meaningValue.trim(),
      example: exampleValue.trim() || undefined
    });

    // フォームリセット（カテゴリはactiveCategoryで固定）
    setFormData({
      category: activeCategory && activeCategory !== 'all' ? activeCategory : (categories.length > 0 ? categories[0].key : 'english'),
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
          <div className="rich-text-info">
            <button 
              type="button" 
              className="help-button"
              onClick={() => setShowRichTextHelp(!showRichTextHelp)}
            >
              💡 書式設定ヘルプ
            </button>
            {showRichTextHelp && (
              <div className="rich-text-help">
                <p><strong>使用可能な書式:</strong></p>
                <ul>
                  <li><code>**太字**</code> → <strong>太字</strong></li>
                  <li><code>*斜体*</code> → <em>斜体</em></li>
                  <li><code>`コード`</code> → <code>コード</code></li>
                  <li><code>~~取り消し~~</code> → <del>取り消し</del></li>
                  <li>改行はそのまま反映されます</li>
                </ul>
              </div>
            )}
          </div>
          <textarea
            id="meaning"
            value={formData.meaning}
            onChange={(e) => handleInputChange('meaning', e.target.value)}
            placeholder="**重要**な概念です。`コード`や*斜体*も使えます。&#10;改行も反映されます。"
            rows={6}
            required
          />
          <div className="preview-section">
            <h4>プレビュー:</h4>
            <div 
              className="rich-text-preview"
              dangerouslySetInnerHTML={{ 
                __html: formData.meaning
                  .replace(/\n/g, '<br>')
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\*(.*?)\*/g, '<em>$1</em>')
                  .replace(/`(.*?)`/g, '<code>$1</code>')
                  .replace(/~~(.*?)~~/g, '<del>$1</del>')
              }}
            />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="example">例文・使用例:</label>
          <textarea
            id="example"
            value={formData.example}
            onChange={(e) => handleInputChange('example', e.target.value)}
            placeholder="例文やコードサンプルなど。&#10;**太字**や`コード`も使えます。"
            rows={4}
          />
          {formData.example && (
            <div className="preview-section">
              <h4>プレビュー:</h4>
              <div 
                className="rich-text-preview"
                dangerouslySetInnerHTML={{ 
                  __html: formData.example
                    .replace(/\n/g, '<br>')
                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.*?)\*/g, '<em>$1</em>')
                    .replace(/`(.*?)`/g, '<code>$1</code>')
                    .replace(/~~(.*?)~~/g, '<del>$1</del>')
                }}
              />
            </div>
          )}
        </div>
        
        <button type="submit" className="btn">追加</button>
      </form>
    </section>
  );
};

export default AddTermForm;
