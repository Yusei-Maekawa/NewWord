/**
 * src/App.tsx
 *
 * ============================================================================
 * 📖 ファイル概要 / File Overview
 * ============================================================================
 *
 * 【日本語】
 * 学習用語句管理アプリケーションのメインコンポーネント。
 * ReactアプリケーションのエントリーポイントとなるAppコンポーネントを定義し、
 * 語句管理、学習記録、カテゴリ管理などすべての機能を統合しています。
 *
 * 【主な機能】
 * 1. 語句の一覧表示・追加・編集・削除（CRUD操作）
 * 2. カテゴリによるフィルタリング・階層表示
 * 3. お気に入り機能（語句・カテゴリ）
 * 4. 学習時間の記録・集計
 * 5. スケジュール管理・カレンダー表示
 * 6. CSVインポート機能
 * 7. Firestore/MySQL切り替え（環境変数REACT_APP_BACKEND_MODE）
 * 8. 通知システム（成功・エラーメッセージ）
 *
 * 【English】
 * Main component of the learning vocabulary management application.
 * Defines the App component that serves as the entry point of the React application
 * and integrates all features including term management, study records, and category management.
 *
 * 【Key Features】
 * 1. List, add, edit, and delete terms (CRUD operations)
 * 2. Filter by category and hierarchical display
 * 3. Favorite functionality (terms and categories)
 * 4. Record and aggregate study time
 * 5. Schedule management and calendar display
 * 6. CSV import functionality
 * 7. Firestore/MySQL switching (via REACT_APP_BACKEND_MODE env var)
 * 8. Notification system (success/error messages)
 *
 * ============================================================================
 * 📦 状態管理 / State Management
 * ============================================================================
 *
 * 【カスタムフック / Custom Hooks】
 * - useTermsFirestore() - 語句データのFirestore管理
 * - useTerms() - 語句データのMySQL管理（レガシー）
 * - useCategoriesFirestore() - カテゴリデータのFirestore管理
 *
 * 【ローカル状態 / Local State】
 * - activeCategory: string - 現在選択中のカテゴリ
 * - editTerm: Term | null - 編集中の語句データ
 * - notification: {message, type} | null - 通知メッセージ
 * - showSchedule: boolean - スケジュールページ表示フラグ
 * - studyLogs: StudyLog[] - 学習ログデータ
 *
 * ============================================================================
 * 🔧 主要関数 / Main Functions
 * ============================================================================
 *
 * 【語句操作 / Term Operations】
 * 1. handleAddTerm(termData) - 語句追加
 * 2. handleEditTerm(term) - 編集モーダルを開く
 * 3. handleSaveEdit(id, termData) - 語句更新
 * 4. handleDeleteTerm(id) - 語句削除
 *
 * 【カテゴリ操作 / Category Operations】
 * 5. fetchCategories() - カテゴリデータ取得（空関数、Firestore自動同期）
 * 6. handleToggleFavorite(categoryId) - カテゴリお気に入り切り替え
 *
 * 【学習記録 / Study Records】
 * 7. handleRecordTime(minutes) - 学習時間記録
 *
 * 【通知 / Notifications】
 * 8. setNotification({message, type}) - 通知表示
 *
 * ============================================================================
 * 🎨 コンポーネント構成 / Component Structure
 * ============================================================================
 *
 * App
 * ├── Header - ヘッダー
 * ├── StudyTimeInput - 学習時間入力
 * ├── CategoryNav - カテゴリナビゲーション
 * ├── AddTermForm - 語句追加フォーム
 * ├── CsvImportForm - CSVインポート
 * ├── TermsList - 語句一覧
 * ├── StudySection - 学習セクション
 * ├── SchedulePage - スケジュールページ（条件表示）
 * ├── EditTermModal - 編集モーダル
 * └── Notification - 通知システム
 *
 * ============================================================================
 * 🔗 依存関係 / Dependencies
 * ============================================================================
 *
 * React:
 * - useState - 状態管理
 * - useEffect - 副作用処理（将来的に追加予定）
 *
 * 外部ライブラリ:
 * - date-fns: format - 日付フォーマット
 *
 * 内部:
 * - types.ts: Term, StudyLog - 型定義
 * - hooks: useTermsFirestore, useTerms, useCategoriesFirestore
 * - components: 各種UIコンポーネント
 * - utils: debugFirestore - デバッグツール
 *
 * ============================================================================
 * ⚙️ 環境変数 / Environment Variables
 * ============================================================================
 *
 * - REACT_APP_BACKEND_MODE: 'firestore' | 'mysql'
 *   - デフォルト: 'firestore'
 *   - Firestoreまたは MySQLバックエンドを切り替え
 *
 * ============================================================================
 *
 * @author Yusei Maekawa
 * @version 0.3.0
 * @since 2025-08-01
 * @updated 2025-11-02
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
import { useTermsFirestore } from './hooks/useTermsFirestore';
import { useTerms } from './hooks/useTerms';
import { useCategoriesFirestore } from './hooks/useCategoriesFirestore';
import './styles/App.css';
import './utils/debugFirestore'; // デバッグツールを読み込む
import { VERSION_INFO, printVersionInfo } from './version-config';

// 環境変数からバックエンドモードを取得（デフォルトはfirestore）
const BACKEND_MODE = process.env.REACT_APP_BACKEND_MODE || 'firestore';

// コンソールにバージョン情報を表示
printVersionInfo();

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
  // ===== バックエンド切り替え =====

  /**
   * 環境変数に応じてFirestoreまたはMySQL(Express API)を使用
   * REACT_APP_BACKEND_MODE=firestore → Firestore使用（デフォルト）
   * REACT_APP_BACKEND_MODE=mysql → Express API + MySQL使用
   */
  const firestoreHook = useTermsFirestore();
  const mysqlHook = useTerms();
  
  const { terms, loading, error, addTerm, updateTerm, deleteTerm } = 
    BACKEND_MODE === 'mysql' ? mysqlHook : firestoreHook;

  console.log(`🔧 バックエンドモード: ${BACKEND_MODE}`);

  // ===== カテゴリ管理（Firestore） =====
  const { 
    categories, 
    loading: categoriesLoading, 
    error: categoriesError,
    toggleFavorite: toggleCategoryFavorite 
  } = useCategoriesFirestore();

  // カテゴリデータのデバッグログと循環参照チェック
  React.useEffect(() => {
    if (categories.length > 0) {
      console.log('📋 カテゴリデータ取得:', categories.length, '件');
      
      const parents = categories.filter(c => c.parent_id === null);
      const children = categories.filter(c => c.parent_id !== null);
      
      console.log('親カテゴリ:', parents.map(c => `${c.category_name} (ID: ${c.id})`));
      console.log('子カテゴリ:', children.map(c => {
        const parent = categories.find(p => p.id === c.parent_id);
        return `${c.category_name} (ID: ${c.id}, 親: ${parent?.category_name || 'なし'}[${c.parent_id}])`;
      }));
      
      // 循環参照チェック
      const visited = new Set<number>();
      const checkCircular = (catId: number, path: number[] = []): boolean => {
        if (path.includes(catId)) {
          console.error('🔴 循環参照を検出:', path.map(id => {
            const cat = categories.find(c => c.id === id);
            return `${cat?.category_name}(${id})`;
          }).join(' -> '), `-> ${categories.find(c => c.id === catId)?.category_name}(${catId})`);
          return true;
        }
        
        const cat = categories.find(c => c.id === catId);
        if (!cat || cat.parent_id === null) return false;
        
        return checkCircular(cat.parent_id, [...path, catId]);
      };
      
      categories.forEach(cat => {
        if (cat.parent_id !== null) {
          checkCircular(cat.id);
        }
      });
    }
  }, [categories]);

  /**
   * 現在選択されているカテゴリ
   * @type {[string, React.Dispatch<React.SetStateAction<string>>]}
   */
  const [activeCategory, setActiveCategory] = useState('all');

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
   * カテゴリ一覧を取得する関数（暫定的に無効化）
   * 現在はハードコードされたカテゴリデータを使用
   * TODO: 将来的に Firestore から取得するように変更
   */
  const fetchCategories = async () => {
    console.log('✅ カテゴリはハードコードデータを使用中（Firestore 移行予定）');
    // カテゴリデータは useState の初期化時に設定済み
  };

  /**
   * カテゴリのお気に入り切り替え（Firestoreで永続化）
   * 親カテゴリをお気に入りにすると、子カテゴリも自動的にお気に入りになります
   * @param {number} categoryId - 切り替えるカテゴリのID
   */
  const handleToggleFavorite = async (categoryId: number) => {
    try {
      const currentCategory = categories.find(cat => cat.id === categoryId);
      if (!currentCategory) {
        throw new Error('カテゴリが見つかりません');
      }

      const newFavoriteState = !currentCategory.is_favorite;
      console.log(`🌟 お気に入り切り替え: ${currentCategory.category_name} → ${newFavoriteState ? 'ON' : 'OFF'}`);

      // Firestoreでお気に入り状態を永続化（親カテゴリの場合は子カテゴリも連動）
      const result = await toggleCategoryFavorite(categoryId);
      
      if (result.success) {
        const affectedCount = result.affectedCount ?? 1;
        const message = newFavoriteState 
          ? affectedCount > 1 
            ? `お気に入りに追加しました（${affectedCount}件のカテゴリが更新されました）`
            : 'お気に入りに追加しました'
          : affectedCount > 1
            ? `お気に入りから削除しました（${affectedCount}件のカテゴリが更新されました）`
            : 'お気に入りから削除しました';
        
        setNotification({ message, type: 'success' });
      } else {
        throw new Error(result.error || '不明なエラー');
      }
    } catch (error) {
      console.error('❌ お気に入り切り替えエラー:', error);
      setNotification({ 
        message: 'お気に入りの切り替えに失敗しました', 
        type: 'error' 
      });
    }
  };

  // カテゴリデータは useState で初期化済み
  // 語句データは useTermsFirestore フックが自動的に取得・同期
  // React.useEffect は不要（API呼び出しなし）

  // 語句追加（Firestore）
  const handleAddTerm = async (termData: Omit<Term, 'id' | 'createdAt'>) => {
    try {
      await addTerm(termData);
      setNotification({ message: '用語を追加しました！', type: 'success' });
    } catch (error) {
      console.error('追加エラー:', error);
      setNotification({ message: '追加に失敗しました', type: 'error' });
    }
  };

  // 編集開始
  const handleEditTerm = (term: Term) => {
    setEditTerm(term);
  };

  // 語句編集（Firestore）
  const handleSaveEdit = async (id: string, termData: Omit<Term, 'id' | 'createdAt'>) => {
    try {
      await updateTerm(id, termData);
      setEditTerm(null);
      setNotification({ message: '用語を更新しました！', type: 'success' });
    } catch (error) {
      console.error('編集エラー:', error);
      setNotification({ message: '更新に失敗しました', type: 'error' });
    }
  };

  // 語句削除（Firestore）
  const handleDeleteTerm = async (id: string) => {
    try {
      await deleteTerm(id);
      setNotification({ message: '用語を削除しました！', type: 'success' });
    } catch (error) {
      console.error('削除エラー:', error);
      setNotification({ message: '削除に失敗しました', type: 'error' });
    }
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
                  display_order: cat.display_order
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
