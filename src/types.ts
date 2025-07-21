export interface Term {
  id: number;
  category: 'english' | 'applied' | 'advanced' | 'gkentei';
  term: string;
  meaning: string;
  example?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface StudySession {
  terms: Term[];
  currentIndex: number;
  totalTerms: number;
  isActive: boolean;
  showAnswer: boolean;
}
