
import React, { useState } from 'react';
import { Term } from '../types';
import { getCategoryName } from '../utils/helpers';


interface TermsListProps {
  terms: Term[];
  onEditTerm: (term: Term) => void;
  onDeleteTerm: (id: number) => void;
}


const TermsList: React.FC<TermsListProps> = ({ terms, onEditTerm, onDeleteTerm }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTerm, setSelectedTerm] = useState<Term | null>(null);


  const filteredTerms = terms.filter(term =>
    (term.term?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      term.meaning?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (term.example && term.example.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const handleDelete = (id: number, termName: string) => {
    if (window.confirm(`「${termName}」を削除してもよろしいですか？`)) {
      onDeleteTerm(id);
    }
  };

  const handleTermClick = (term: Term) => {
    setSelectedTerm(term);
  };

  const handleCloseDetail = () => {
    setSelectedTerm(null);
  };

  // リッチテキストを安全にレンダリングする関数
  const renderRichText = (text: string) => {
    if (!text) return '';
    
    // 改行をHTMLの<br>タグに変換
    let formattedText = text.replace(/\n/g, '<br>');
    
    // 色指定記法をHTMLに変換 - [red]テキスト[/red] 形式
    formattedText = formattedText
      .replace(/\[red\](.*?)\[\/red\]/g, '<span style="color: #e74c3c; font-weight: 600;">$1</span>') // 赤色
      .replace(/\[blue\](.*?)\[\/blue\]/g, '<span style="color: #3498db; font-weight: 600;">$1</span>') // 青色
      .replace(/\[green\](.*?)\[\/green\]/g, '<span style="color: #27ae60; font-weight: 600;">$1</span>') // 緑色
      .replace(/\[orange\](.*?)\[\/orange\]/g, '<span style="color: #f39c12; font-weight: 600;">$1</span>') // オレンジ色
      .replace(/\[purple\](.*?)\[\/purple\]/g, '<span style="color: #9b59b6; font-weight: 600;">$1</span>') // 紫色
      .replace(/\[pink\](.*?)\[\/pink\]/g, '<span style="color: #e91e63; font-weight: 600;">$1</span>') // ピンク色
      .replace(/\[gray\](.*?)\[\/gray\]/g, '<span style="color: #95a5a6; font-weight: 600;">$1</span>'); // グレー色
    
    // マークダウン風記法をHTMLに変換
    formattedText = formattedText
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // **太字**
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // *斜体*
      .replace(/`(.*?)`/g, '<code>$1</code>') // `コード`
      .replace(/~~(.*?)~~/g, '<del>$1</del>'); // ~~取り消し線~~
    
    return formattedText;
  };

  return (
    <section className="section">
      <h2>語句一覧</h2>
      <div className="search-controls">
        <input
          type="text"
          placeholder="語句を検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <span className="term-count">{filteredTerms.length}個の語句</span>
      </div>

      {filteredTerms.length === 0 ? (
        <div className="text-center" style={{ padding: '40px' }}>
          <p style={{ fontSize: '1.2rem', color: '#666' }}>
            {searchQuery ? '該当する語句がありません。' : '語句がありません。まず語句を追加してください。'}
          </p>
        </div>
      ) : (
        <div className="terms-grid">
          {filteredTerms.map(term => (
            <div key={term.id} className="term-card" onClick={() => handleTermClick(term)}>
              <div className="term-card-header">
                <h4 className="term-title">{term.term}</h4>
                <span className={`category-badge category-${term.category}`}>
                  {getCategoryName(term.category)}
                </span>
              </div>
              <div className="term-card-content">
                <div 
                  className="term-meaning-preview"
                  dangerouslySetInnerHTML={{ 
                    __html: renderRichText(term.meaning || '').length > 200 
                      ? renderRichText(term.meaning || '').substring(0, 200) + '...' 
                      : renderRichText(term.meaning || '')
                  }}
                />
              </div>
              <div className="term-card-actions" onClick={(e) => e.stopPropagation()}>
                <button 
                  className="btn btn-success btn-sm"
                  onClick={() => onEditTerm(term)}
                >
                  編集
                </button>
                <button 
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(term.id, term.term)}
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 詳細モーダル */}
      {selectedTerm && (
        <div className="modal-overlay" onClick={handleCloseDetail}>
          <div className="modal-content term-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedTerm.term}</h3>
              <span className={`category-badge category-${selectedTerm.category}`}>
                {getCategoryName(selectedTerm.category)}
              </span>
              <button className="modal-close" onClick={handleCloseDetail}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h4>意味・説明</h4>
                <div 
                  className="rich-text-content"
                  dangerouslySetInnerHTML={{ __html: renderRichText(selectedTerm.meaning || '') }}
                />
              </div>
              {selectedTerm.example && (
                <div className="detail-section">
                  <h4>例文・使用例</h4>
                  <div 
                    className="rich-text-content"
                    dangerouslySetInnerHTML={{ __html: renderRichText(selectedTerm.example) }}
                  />
                </div>
              )}
              {selectedTerm.createdAt && (
                <div className="detail-section">
                  <h4>追加日時</h4>
                  <p>{new Date(selectedTerm.createdAt).toLocaleString()}</p>
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button 
                className="btn btn-success"
                onClick={() => {
                  onEditTerm(selectedTerm);
                  handleCloseDetail();
                }}
              >
                編集
              </button>
              <button 
                className="btn btn-danger"
                onClick={() => {
                  handleDelete(selectedTerm.id, selectedTerm.term);
                  handleCloseDetail();
                }}
              >
                削除
              </button>
              <button className="btn btn-secondary" onClick={handleCloseDetail}>
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default TermsList;
