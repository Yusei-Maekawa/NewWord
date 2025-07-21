import { useState, useCallback } from 'react';
import { Term, StudySession } from '../types';

export const useStudySession = () => {
  const [session, setSession] = useState<StudySession>({
    terms: [],
    currentIndex: 0,
    totalTerms: 0,
    isActive: false,
    showAnswer: false
  });

  const shuffleArray = (array: Term[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const startSession = useCallback((terms: Term[]) => {
    if (terms.length === 0) return false;
    
    const shuffledTerms = shuffleArray(terms);
    setSession({
      terms: shuffledTerms,
      currentIndex: 0,
      totalTerms: shuffledTerms.length,
      isActive: true,
      showAnswer: false
    });
    return true;
  }, []);

  const showAnswer = useCallback(() => {
    setSession(prev => ({ ...prev, showAnswer: true }));
  }, []);

  const nextTerm = useCallback(() => {
    setSession(prev => ({
      ...prev,
      currentIndex: prev.currentIndex + 1,
      showAnswer: false
    }));
  }, []);

  const endSession = useCallback(() => {
    setSession({
      terms: [],
      currentIndex: 0,
      totalTerms: 0,
      isActive: false,
      showAnswer: false
    });
  }, []);

  const getCurrentTerm = () => {
    if (!session.isActive || session.currentIndex >= session.terms.length) {
      return null;
    }
    return session.terms[session.currentIndex];
  };

  const getProgress = () => {
    if (!session.isActive) return { current: 0, total: 0, percentage: 0 };
    
    return {
      current: session.currentIndex + 1,
      total: session.totalTerms,
      percentage: Math.round(((session.currentIndex + 1) / session.totalTerms) * 100)
    };
  };

  const isSessionComplete = () => {
    return session.isActive && session.currentIndex >= session.terms.length;
  };

  return {
    session,
    startSession,
    showAnswer,
    nextTerm,
    endSession,
    getCurrentTerm,
    getProgress,
    isSessionComplete
  };
};
