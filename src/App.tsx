
import React, { useState } from 'react';

import Header from './components/Header';
import { format } from 'date-fns';
import CategoryNav from './components/CategoryNav';
import { categories as initialCategories } from './data/categories';
import TermsList from './components/TermsList';
import AddTermForm from './components/AddTermForm';
import CsvImportForm from './components/CsvImportForm';
import StudySection from './components/StudySection';
import SchedulePage from './components/SchedulePage';
import EditTermModal from './components/EditTermModal';
import Notification from './components/Notification';
import { Term, StudyLog } from './types';
import StudyTimeInput from './components/StudyTimeInput';
import './styles/App.css';


const App: React.FC = () => {
  // 語句一覧の状態
  const [terms, setTerms] = useState<Term[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [categories, setCategories] = useState([...initialCategories]);
  const [editTerm, setEditTerm] = useState<Term | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [studyLogs, setStudyLogs] = useState<StudyLog[]>([]);

  // 初回マウント時にAPIから取得
  React.useEffect(() => {
    fetch('http://localhost:4000/api/terms')
      .then(res => res.json())
      .then(data => {
        // DBの「word」フィールドをReactの「term」プロパティに変換
        const convertedData = data.map((item: any) => ({
          id: item.id,
          term: item.word,  // DB「word」→React「term」
          meaning: item.meaning,
          example: item.example,
          category: item.category,
          createdAt: item.created_at
        }));
        setTerms(convertedData);
      })
      .catch(error => {
        console.error('データ取得エラー:', error);
        setNotification({ message: 'データの取得に失敗しました', type: 'error' });
      });
  }, []);

  // 語句追加（API）
  const handleAddTerm = (termData: Omit<Term, 'id' | 'createdAt'>) => {
    // DBのカラム名は「word」なので、React側の「term」を「word」に変換して送信
    const apiData = {
      word: termData.term,  // React側「term」→DB側「word」
      meaning: termData.meaning,
      example: termData.example,
      category: termData.category
    };
    
    console.log('送信データ:', apiData); // デバッグ用：送信内容を確認
    
    fetch('http://localhost:4000/api/terms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(apiData)
    })
      .then(res => {
        console.log('APIレスポンス:', res.status); // デバッグ用：レスポンス確認
        return res.json();
      })
      .then(newTerm => {
        console.log('追加成功:', newTerm); // デバッグ用：追加結果確認
        setTerms(prev => [...prev, { ...termData, id: newTerm.id, createdAt: new Date().toISOString() }]);
        setNotification({ message: '用語を追加しました！', type: 'success' });
      })
      .catch(error => {
        console.error('追加エラー:', error); // エラーハンドリング
        setNotification({ message: '追加に失敗しました', type: 'error' });
      });
  };

  // 編集開始
  const handleEditTerm = (term: Term) => {
    setEditTerm(term);
  };

  // 語句編集（API）
  const handleSaveEdit = (id: number, termData: Omit<Term, 'id' | 'createdAt'>) => {
    // DBのカラム名は「word」なので、React側の「term」を「word」に変換して送信
    const apiData = {
      word: termData.term,  // React側「term」→DB側「word」
      meaning: termData.meaning,
      example: termData.example,
      category: termData.category
    };
    
    console.log('編集データ:', apiData); // デバッグ用：送信内容を確認
    
    fetch(`http://localhost:4000/api/terms/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(apiData)
    })
      .then(res => {
        console.log('編集APIレスポンス:', res.status); // デバッグ用
        return res.json();
      })
      .then(() => {
        setTerms(prev => prev.map(t => t.id === id ? { ...t, ...termData } : t));
        setEditTerm(null);
        setNotification({ message: '用語を更新しました！', type: 'success' });
      })
      .catch(error => {
        console.error('編集エラー:', error); // エラーハンドリング
        setNotification({ message: '更新に失敗しました', type: 'error' });
      });
  };

  // 語句削除（API）
  const handleDeleteTerm = (id: number) => {
    console.log('削除ID:', id); // デバッグ用：削除対象ID確認
    
    fetch(`http://localhost:4000/api/terms/${id}`, { method: 'DELETE' })
      .then(res => {
        console.log('削除APIレスポンス:', res.status); // デバッグ用
        return res.json();
      })
      .then(() => {
        setTerms(prev => prev.filter(t => t.id !== id));
        setNotification({ message: '用語を削除しました！', type: 'success' });
      })
      .catch(error => {
        console.error('削除エラー:', error); // エラーハンドリング
        setNotification({ message: '削除に失敗しました', type: 'error' });
      });
  };

  // 今日の日付
  const today = format(new Date(), 'yyyy-MM-dd');
  // 今日の語句追加数
  const todayTerms = terms.filter(t => t.createdAt?.slice(0, 10) === today).length;
  // 今日の勉強時間（studyLogsから集計）
  const todayTime = studyLogs.filter(log => log.date === today).reduce((sum, log) => sum + log.amount, 0);

  // 勉強時間記録（ストップウォッチ・手動入力）
  const handleRecordTime = (minutes: number) => {
    // 例: カテゴリは現在選択中のもの、なければ'all'
    const category = activeCategory === 'all' ? 'all' : activeCategory;
    // 既存の同日・同カテゴリがあれば加算
    setStudyLogs(prev => {
      const idx = prev.findIndex(log => log.date === today && log.category === category);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], amount: updated[idx].amount + minutes };
        return updated;
      } else {
        return [...prev, { date: today, category, amount: minutes }];
      }
    });
    setNotification({ message: `勉強時間を${minutes}分記録しました！`, type: 'success' });
  };

  return (
    <div className="app-container">
      <Header />
      <div style={{ display: 'flex', justifyContent: 'center', gap: '2em', margin: '18px 0 8px 0' }}>
        <div style={{ background: '#e0e7ef', borderRadius: '12px', padding: '12px 28px', fontWeight: 600, fontSize: '1.1em', color: '#2c3e50', boxShadow: '0 2px 8px rgba(44,62,80,0.08)' }}>
          今日の語句追加数: <span style={{ color: '#007bff', fontWeight: 700 }}>{todayTerms}</span>
        </div>
        <div style={{ background: '#e0e7ef', borderRadius: '12px', padding: '12px 28px', fontWeight: 600, fontSize: '1.1em', color: '#2c3e50', boxShadow: '0 2px 8px rgba(44,62,80,0.08)' }}>
          今日の勉強時間: <span style={{ color: '#28a745', fontWeight: 700 }}>{todayTime}分</span>
        </div>
      </div>
      <StudyTimeInput onRecord={handleRecordTime} />
      <button className="btn" style={{ margin: '20px' }} onClick={() => setShowSchedule(true)}>スケジュール一覧へ</button>
      {showSchedule ? (
        <SchedulePage
          terms={terms}
          onBack={() => setShowSchedule(false)}
          studyLogs={studyLogs}
          onDeleteLog={(date, category) => {
            setStudyLogs(prev => prev.filter(log => !(log.date === date && log.category === category)));
            setNotification({ message: '勉強記録を削除しました', type: 'success' });
          }}
        />
      ) : (
        <>
          <CategoryNav
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            categories={categories}
            onAddCategory={cat => setCategories(prev => [...prev, cat])}
            onDeleteCategory={key => setCategories(prev => prev.filter(c => c.key !== key))}
          />
          <div className="main-layout">
            <div className="left-panel">
              <CsvImportForm onImportTerms={(importedTerms) => {
                importedTerms.forEach(handleAddTerm);
                setNotification({ message: `CSVから${importedTerms.length}件追加しました！`, type: 'success' });
              }} />
              <AddTermForm
                onAddTerm={handleAddTerm}
                activeCategory={activeCategory}
                categories={categories}
              />
              <TermsList
                terms={activeCategory === 'all' ? terms : terms.filter(t => t.category === activeCategory)}
                onEditTerm={handleEditTerm}
                onDeleteTerm={handleDeleteTerm}
              />
            </div>
            <div className="right-panel">
              <StudySection terms={terms} activeCategory={activeCategory} />
            </div>
          </div>
          <EditTermModal
            term={editTerm}
            isOpen={!!editTerm}
            onClose={() => setEditTerm(null)}
            onSave={handleSaveEdit}
          />
          {notification && (
            <Notification
              message={notification.message}
              type={notification.type}
              onClose={() => setNotification(null)}
            />
          )}
        </>
      )}
    </div>
  );
};

export default App;
