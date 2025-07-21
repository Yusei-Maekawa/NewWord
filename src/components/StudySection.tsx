import React, { useEffect } from 'react';
import { Term } from '../types';
import { useStudySession } from '../hooks/useStudySession';
import { getCategoryName, getCategoryColor } from '../utils/helpers';

interface StudySectionProps {
  terms: Term[];
  activeCategory: string;
}

const StudySection: React.FC<StudySectionProps> = ({ terms, activeCategory }) => {
  const {
    session,
    startSession,
    showAnswer,
    nextTerm,
    endSession,
    getCurrentTerm,
    getProgress,
    isSessionComplete
  } = useStudySession();

  const filteredTerms = activeCategory === 'all' ? terms : terms.filter(term => term.category === activeCategory);
  const currentTerm = getCurrentTerm();
  const progress = getProgress();

  // セッションが完了したら自動的に終了
  useEffect(() => {
    if (isSessionComplete()) {
      setTimeout(() => {
        endSession();
      }, 1000);
    }
  }, [isSessionComplete, endSession]);

  const handleStartSession = () => {
    if (filteredTerms.length === 0) {
      alert('学習できる語句がありません。まず語句を追加してください。');
      return;
    }
    startSession(filteredTerms);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (!session.isActive) return;
    
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (!session.showAnswer) {
        showAnswer();
      } else {
        nextTerm();
      }
    } else if (e.key === 'Escape') {
      endSession();
    }
  };

  return (
    <section className="section">
      <h2>語句学習</h2>
      
      {session.isActive && (
        <div className="study-info">
          <div className="progress-info">
            {getCategoryName(activeCategory)} - {progress.current}/{progress.total} ({progress.percentage}%)
          </div>
        </div>
      )}
      
      <div className="study-controls">
        {!session.isActive ? (
          <button className="btn" onClick={handleStartSession}>
            ランダム表示
          </button>
        ) : (
          <>
            {!session.showAnswer ? (
              <button className="btn" onClick={showAnswer}>
                答えを表示
              </button>
            ) : (
              <>
                <button className="btn" onClick={nextTerm}>
                  次の語句
                </button>
                <button className="btn btn-danger" onClick={endSession}>
                  学習終了
                </button>
              </>
            )}
          </>
        )}
      </div>

      {session.isActive && currentTerm && (
        <div 
          className="study-card"
          onKeyDown={handleKeyPress}
          tabIndex={0}
        >
          {!session.showAnswer ? (
            <div className="card-front">
              <h3>{currentTerm.term}</h3>
              <span 
                className="category-tag"
                style={{ backgroundColor: getCategoryColor(currentTerm.category) }}
              >
                {getCategoryName(currentTerm.category)}
              </span>
            </div>
          ) : (
            <div className="card-back">
              <h4>意味・説明:</h4>
              <p>{currentTerm.meaning}</p>
              <h4>例文・使用例:</h4>
              <p>{currentTerm.example || '例文なし'}</p>
            </div>
          )}
        </div>
      )}

      {!session.isActive && (
        <div className="study-card">
          <p>学習する語句を選択してください</p>
          <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '10px' }}>
            ヒント: スペースキーやEnterキーで学習を進められます
          </p>
        </div>
      )}

      {isSessionComplete() && (
        <div className="study-card">
          <h3>🎉 学習完了!</h3>
          <p>{progress.total}個の語句を確認しました。</p>
        </div>
      )}
    </section>
  );
};

export default StudySection;
