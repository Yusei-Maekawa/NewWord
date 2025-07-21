import React, { useState, useEffect } from 'react';
import { Term } from '../types';

interface EditTermModalProps {
  term: Term | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: number, termData: Omit<Term, 'id' | 'createdAt'>) => void;
}

const EditTermModal: React.FC<EditTermModalProps> = ({ term, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    category: 'english' as Term['category'],
    term: '',
    meaning: '',
    example: ''
  });

  useEffect(() => {
    if (term) {
      setFormData({
        category: term.category,
        term: term.term,
        meaning: term.meaning,
        example: term.example || ''
      });
    }
  }, [term]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.term.trim() || !formData.meaning.trim()) {
      alert('用語と意味は必須項目です。');
      return;
    }

    if (term) {
      onSave(term.id, {
        category: formData.category,
        term: formData.term.trim(),
        meaning: formData.meaning.trim(),
        example: formData.example.trim() || undefined
      });
      onClose();
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !term) return null;

  return (
    <div className="modal" onClick={handleBackdropClick}>
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h3>語句を編集</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="editCategory">カテゴリ:</label>
            <select
              id="editCategory"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              required
            >
              <option value="english">英語</option>
              <option value="applied">応用情報</option>
              <option value="advanced">高度情報</option>
              <option value="gkentei">G検定</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="editTerm">用語:</label>
            <input
              type="text"
              id="editTerm"
              value={formData.term}
              onChange={(e) => handleInputChange('term', e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="editMeaning">意味・説明:</label>
            <textarea
              id="editMeaning"
              value={formData.meaning}
              onChange={(e) => handleInputChange('meaning', e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="editExample">例文・使用例:</label>
            <textarea
              id="editExample"
              value={formData.example}
              onChange={(e) => handleInputChange('example', e.target.value)}
            />
          </div>
          
          <div className="form-actions">
            <button type="submit" className="btn">更新</button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              キャンセル
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTermModal;
