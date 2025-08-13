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
  const [showRichTextHelp, setShowRichTextHelp] = useState(false);

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
    
    // undefined チェックを追加してエラーを防ぐ
    const termValue = formData.term || '';
    const meaningValue = formData.meaning || '';
    const exampleValue = formData.example || '';
    
    if (!termValue.trim() || !meaningValue.trim()) {
      alert('用語と意味は必須項目です。');
      return;
    }

    if (term) {
      onSave(term.id, {
        category: formData.category,
        term: termValue.trim(),
        meaning: meaningValue.trim(),
        example: exampleValue.trim() || undefined
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
              id="editMeaning"
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
            <label htmlFor="editExample">例文・使用例:</label>
            <textarea
              id="editExample"
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
