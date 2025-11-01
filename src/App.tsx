/**
 * @fileoverview 学習用語句管理アプリケーションのメインコンポーネント
 *
 * このファイルは、ReactアプリケーションのメインエントリーポイントとなるAppコンポーネントを定義しています。
 * 語句管理、学習記録、カテゴリ管理などの全ての機能を統合したメインアプリケーションです。
 *
 * @author Yusei Maekawa
 * @version 1.0.0
 * @since 2025-08-01
 */

/**
 * @typedef {Object} Category
 * @property {number} id - カテゴリの一意の識別子
 * @property {string} category_key - カテゴリキー（データベース用）
 * @property {string} category_name - 表示用カテゴリ名
 * @property {string} category_icon - カテゴリアイコン（絵文字）
 * @property {string} category_color - カテゴリカラー（HEXコード）
 * @property {number|null} parent_id - 親カテゴリID（階層構造用）
 * @property {boolean} is_favorite - お気に入りフラグ
 * @property {number} display_order - 表示順序
 * @property {string} created_at - 作成日時
 * @property {string} [parent_name] - 親カテゴリ名（オプション）
 * @property {string} [parent_icon] - 親カテゴリアイコン（オプション）
 * @property {number} [child_count] - 子カテゴリ数（オプション）
 * @property {string} [breadcrumb] - 階層表示用パンくずリスト（オプション）
 * @property {Array<{id: number, name: string, icon: string, color: string}>} [path] - 階層パス（オプション）
 */

/**
 * @typedef {Object} AppState
 * @property {Term[]} terms - 語句データの配列
 * @property {string} activeCategory - 現在選択されているカテゴリキー
 * @property {Category[]} categories - カテゴリデータの配列
 * @property {Term|null} editTerm - 編集中の語句データ
 * @property {{message: string, type: 'success'|'error'}|null} notification - 通知メッセージ
 * @property {boolean} showSchedule - スケジュールページ表示フラグ
 * @property {StudyLog[]} studyLogs - 学習ログデータの配列
 */

import React, { useState } from 'react';

import Header from './components/Header';
import { format } from 'date-fns';
import CategoryNav from './components/CategoryNav';
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

interface Category {
  id: number;
  category_key: string;
  category_name: string;
  category_icon: string;
  category_color: string;
  parent_id: number | null;
  is_favorite: boolean;
  display_order: number;
  created_at: string;
  parent_name?: string;
  parent_icon?: string;
  child_count?: number;
  breadcrumb?: string;
  path?: Array<{
    id: number;
    name: string;
    icon: string;
    color: string;
  }>;
}

/**
 * メインアプリケーションコンポーネント
 *
 * このコンポーネントは以下の機能を統合しています：
 * - 語句の一覧表示・追加・編集・削除
 * - カテゴリによるフィルタリング
 * - 学習時間の記録
 * - スケジュール管理
 * - CSVインポート機能
 *
 * @component
 * @returns {JSX.Element} アプリケーション全体のJSX要素
 */
const App: React.FC = () => {
  // ===== 状態管理 =====

  /**
   * 語句データの状態
   * @type {[Term[], React.Dispatch<React.SetStateAction<Term[]>>]}
   */
  const [terms, setTerms] = useState<Term[]>([]);

  /**
   * 現在選択されているカテゴリ
   * @type {[string, React.Dispatch<React.SetStateAction<string>>]}
   */
  const [activeCategory, setActiveCategory] = useState('all');

  /**
   * カテゴリデータの状態
   * @type {[Category[], React.Dispatch<React.SetStateAction<Category[]>>]}
   */
  const [categories, setCategories] = useState<Category[]>([]);

  /**
   * 編集中の語句データ
   * @type {[Term | null, React.Dispatch<React.SetStateAction<Term | null>>]}
   */
  const [editTerm, setEditTerm] = useState<Term | null>(null);

  /**
   * 通知メッセージの状態
   * @type {[{message: string, type: 'success'|'error'} | null, React.Dispatch<React.SetStateAction<{message: string, type: 'success'|'error'} | null>>]}
   */
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  /**
   * スケジュールページ表示フラグ
   * @type {[boolean, React.Dispatch<React.SetStateAction<boolean>>]}
   */
  const [showSchedule, setShowSchedule] = useState(false);

  /**
   * 学習ログデータの状態
   * @type {[StudyLog[], React.Dispatch<React.SetStateAction<StudyLog[]>>]}
   */
  const [studyLogs, setStudyLogs] = useState<StudyLog[]>([]);

  // ===== 関数定義 =====

  /**
   * カテゴリ一覧を取得する関数
   * APIからカテゴリデータを取得して状態を更新します
   *
   * @async
   * @function fetchCategories
   * @returns {Promise<void>}
   */
  const fetchCategories = async () => {
    try {
      console.log('🔄 カテゴリ取得開始...');
      const response = await fetch('http://localhost:4000/api/categories');
      console.log('📡 レスポンス状態:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ APIエラー詳細:', errorText);
        throw new Error(`カテゴリの取得に失敗しました (${response.status}): ${errorText}`);
      }
      
      const data = await response.json();
      console.log('✅ カテゴリ取得成功:', data);
      setCategories(data);
    } catch (error) {
      console.error('❌ カテゴリ取得エラー:', error);
      setNotification({ 
        message: `カテゴリの取得に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`, 
        type: 'error' 
      });
    }
  };

  // お気に入り切り替え関数
  const handleToggleFavorite = async (categoryId: number) => {
    try {
      // 現在の状態を取得
      const currentCategory = categories.find(cat => cat.id === categoryId);
      if (!currentCategory) {
        throw new Error('カテゴリが見つかりません');
      }

      // 子カテゴリを取得
      const childCategories = categories.filter(cat => cat.parent_id === currentCategory.id);
      const hasChildren = childCategories.length > 0;
      
      // 親カテゴリの場合の確認メッセージ
      if (hasChildren) {
        const action = currentCategory.is_favorite ? 'お気に入りから外す' : 'お気に入りに追加';
        const message = `「${currentCategory.category_name}」を${action}しますか？\n\n💡 この操作により、配下の子カテゴリ（${childCategories.length}個）も同時に${action}されます。`;
        
        if (!confirm(message)) {
          return;
        }
      }

      const newFavoriteState = !currentCategory.is_favorite;
      console.log(`🌟 お気に入り切り替え開始: ${currentCategory.category_name} (ID: ${categoryId}) → ${newFavoriteState ? 'ON' : 'OFF'}`);

      const response = await fetch(`http://localhost:4000/api/categories/${categoryId}/favorite`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_favorite: newFavoriteState }),
      });

      if (!response.ok) {
        throw new Error('お気に入りの切り替えに失敗しました');
      }

      const result = await response.json();
      console.log(`✅ お気に入り切り替え成功:`, result);
      
      setNotification({ 
        message: result.message || (result.is_favorite ? 'お気に入りに追加しました' : 'お気に入りから削除しました'), 
        type: 'success' 
      });
      
      // カテゴリリストを更新
      await fetchCategories();
    } catch (error) {
      console.error('❌ お気に入り切り替えエラー:', error);
      setNotification({ 
        message: 'お気に入りの切り替えに失敗しました', 
        type: 'error' 
      });
    }
  };

  // 初回マウント時にAPIから取得
  React.useEffect(() => {
    // 語句データを取得
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
    
    // カテゴリデータを取得
    fetchCategories();
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
  const handleSaveEdit = (id: string, termData: Omit<Term, 'id' | 'createdAt'>) => {
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
  const handleDeleteTerm = (id: string) => {
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
            onCategoryUpdate={fetchCategories}
            onToggleFavorite={handleToggleFavorite}
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
                categories={categories.map(cat => ({
                  id: cat.id,
                  key: cat.category_key,
                  name: cat.category_name,
                  color: cat.category_color,
                  icon: cat.category_icon,
                  parent_id: cat.parent_id,
                  is_favorite: cat.is_favorite,
                  display_order: cat.display_order,
                  breadcrumb: cat.breadcrumb,
                  path: cat.path
                }))}
              />
              <TermsList
                terms={activeCategory === 'all' ? terms : terms.filter(t => t.category === activeCategory)}
                categories={categories}
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
            categories={categories}
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
