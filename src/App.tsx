
import React, { useState } from 'react';

import Header from './components/Header';
import CategoryNav from './components/CategoryNav';
import { categories as initialCategories } from './data/categories';
import TermsList from './components/TermsList';
import AddTermForm from './components/AddTermForm';
import CsvImportForm from './components/CsvImportForm';
import StudySection from './components/StudySection';
import EditTermModal from './components/EditTermModal';
import Notification from './components/Notification';
import { useTerms } from './hooks/useTerms';
import { Term } from './types';
import './styles/App.css';

const App: React.FC = () => {
  const { terms, addTerm, updateTerm, deleteTerm } = useTerms();
  const [activeCategory, setActiveCategory] = useState('all');
  const [categories, setCategories] = useState([...initialCategories]);
  const [editTerm, setEditTerm] = useState<Term | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleAddTerm = (termData: Omit<Term, 'id' | 'createdAt'>) => {
    addTerm(termData);
    setNotification({ message: '用語を追加しました！', type: 'success' });
  };

  const handleEditTerm = (term: Term) => {
    setEditTerm(term);
  };

  const handleSaveEdit = (id: number, termData: Omit<Term, 'id' | 'createdAt'>) => {
    updateTerm(id, termData);
    setEditTerm(null);
    setNotification({ message: '用語を更新しました！', type: 'success' });
  };

  const handleDeleteTerm = (id: number) => {
    deleteTerm(id);
    setNotification({ message: '用語を削除しました！', type: 'success' });
  };

  return (
    <div className="app-container">
      <Header />
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
    </div>
  );
};

export default App;
