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

  const filteredTerms = terms.filter(term =>
    term.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
    term.meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (term.example && term.example.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleDelete = (id: number, term: string) => {
    if (window.confirm(`「${term}」を削除してもよろしいですか？`)) {
      onDeleteTerm(id);
    }
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
        <div className="terms-list">
          {filteredTerms.map(term => (
            <div key={term.id} className="term-item">
              <h4>{term.term}</h4>
              <span className={`category category-${term.category}`}>
                {getCategoryName(term.category)}
              </span>
              <p><strong>意味:</strong> {term.meaning}</p>
              {term.example && <p><strong>例文:</strong> {term.example}</p>}
              <div className="term-actions">
                <button 
                  className="btn btn-success"
                  onClick={() => onEditTerm(term)}
                >
                  編集
                </button>
                <button 
                  className="btn btn-danger"
                  onClick={() => handleDelete(term.id, term.term)}
                >
                  削除
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default TermsList;
