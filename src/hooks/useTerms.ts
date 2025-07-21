import { useState, useEffect } from 'react';
import { Term } from '../types';

const STORAGE_KEY = 'studyTerms';

export const useTerms = () => {
  const [terms, setTerms] = useState<Term[]>([]);
  
  // ローカルストレージからデータを読み込み
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setTerms(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to parse saved terms:', error);
      }
    }
  }, []);

  // データが変更されたらローカルストレージに保存
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(terms));
  }, [terms]);

  const addTerm = (termData: Omit<Term, 'id' | 'createdAt'>) => {
    const newTerm: Term = {
      ...termData,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    };
    setTerms(prev => [...prev, newTerm]);
  };

  const updateTerm = (id: number, termData: Omit<Term, 'id' | 'createdAt'>) => {
    setTerms(prev => prev.map(term => 
      term.id === id 
        ? { ...term, ...termData, updatedAt: new Date().toISOString() }
        : term
    ));
  };

  const deleteTerm = (id: number) => {
    setTerms(prev => prev.filter(term => term.id !== id));
  };

  const getTermsByCategory = (category: string) => {
    if (category === 'all') return terms;
    return terms.filter(term => term.category === category);
  };

  const searchTerms = (query: string, category: string = 'all') => {
    const filteredTerms = getTermsByCategory(category);
    if (!query) return filteredTerms;
    
    return filteredTerms.filter(term =>
      term.term.toLowerCase().includes(query.toLowerCase()) ||
      term.meaning.toLowerCase().includes(query.toLowerCase()) ||
      (term.example && term.example.toLowerCase().includes(query.toLowerCase()))
    );
  };

  return {
    terms,
    addTerm,
    updateTerm,
    deleteTerm,
    getTermsByCategory,
    searchTerms,
    setTerms
  };
};
