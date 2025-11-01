/**
 * src/TestFirestore.tsx
 *
 * 日本語: Firestore 接続テストページ
 * useTermsFirestore フックの動作確認用コンポーネント
 *
 * English: Firestore connection test page
 * Component for testing useTermsFirestore hook functionality
 */

import React, { useState } from 'react';
import { useTermsFirestore } from './hooks/useTermsFirestore';

const TestFirestore: React.FC = () => {
  const { terms, loading, error, addTerm, updateTerm, deleteTerm } = useTermsFirestore();
  const [newTerm, setNewTerm] = useState('');
  const [newMeaning, setNewMeaning] = useState('');

  // 新規追加
  const handleAdd = async () => {
    if (!newTerm || !newMeaning) {
      alert('用語と意味を入力してください');
      return;
    }
    await addTerm({
      term: newTerm,
      meaning: newMeaning,
      category: 'programming',
      example: ''
    });
    setNewTerm('');
    setNewMeaning('');
  };

  // 削除
  const handleDelete = async (id: string) => {
    if (confirm('本当に削除しますか？')) {
      await deleteTerm(id);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>🔄 Firestore からデータを読み込み中...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>❌ エラーが発生しました</h2>
        <p style={{ color: 'red' }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🔥 Firestore 接続テスト</h1>
      
      {/* 接続状態 */}
      <div style={{ 
        background: '#d4edda', 
        border: '1px solid #c3e6cb', 
        borderRadius: '8px', 
        padding: '16px', 
        marginBottom: '24px' 
      }}>
        <h3>✅ Firestore に接続成功！</h3>
        <p>取得件数: <strong>{terms.length}</strong> 件</p>
      </div>

      {/* 新規追加フォーム */}
      <div style={{ 
        background: '#f8f9fa', 
        border: '1px solid #dee2e6', 
        borderRadius: '8px', 
        padding: '20px', 
        marginBottom: '24px' 
      }}>
        <h3>📝 新しい用語を追加</h3>
        <div style={{ marginBottom: '12px' }}>
          <input
            type="text"
            placeholder="用語（例: closure）"
            value={newTerm}
            onChange={(e) => setNewTerm(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '10px', 
              fontSize: '16px', 
              marginBottom: '8px',
              borderRadius: '4px',
              border: '1px solid #ced4da'
            }}
          />
          <input
            type="text"
            placeholder="意味（例: 関数とスコープの参照）"
            value={newMeaning}
            onChange={(e) => setNewMeaning(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '10px', 
              fontSize: '16px',
              borderRadius: '4px',
              border: '1px solid #ced4da'
            }}
          />
        </div>
        <button
          onClick={handleAdd}
          style={{ 
            background: '#007bff', 
            color: 'white', 
            border: 'none', 
            padding: '12px 24px', 
            fontSize: '16px', 
            borderRadius: '4px', 
            cursor: 'pointer' 
          }}
        >
          ➕ 追加
        </button>
      </div>

      {/* 用語一覧 */}
      <div>
        <h3>📚 用語一覧（Firestore から取得）</h3>
        {terms.length === 0 ? (
          <p style={{ color: '#6c757d' }}>まだ用語がありません。上のフォームから追加してください。</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {terms.map((term) => (
              <li
                key={term.id}
                style={{
                  background: 'white',
                  border: '1px solid #dee2e6',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <strong style={{ fontSize: '18px', color: '#007bff' }}>
                    {term.term}
                  </strong>
                  <p style={{ margin: '8px 0 0 0', color: '#495057' }}>
                    {term.meaning}
                  </p>
                  {term.example && (
                    <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6c757d' }}>
                      例: {term.example}
                    </p>
                  )}
                  <small style={{ color: '#adb5bd' }}>
                    ID: {term.id} | カテゴリ: {term.category}
                  </small>
                </div>
                <button
                  onClick={() => handleDelete(term.id)}
                  style={{
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  🗑️ 削除
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TestFirestore;
