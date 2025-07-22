import React, { useState } from 'react';
import { Term } from '../types';
import { categories } from '../data/categories';
import ScheduleList from './ScheduleList';

// 簡易学習記録（ダミーデータ）
const dummyLogs = [
  { date: '2025-07-20', category: 'english', amount: 30 },
  { date: '2025-07-20', category: 'ycne', amount: 45 },
  { date: '2025-07-21', category: 'gkentei', amount: 20 },
];

const SchedulePage: React.FC<{ terms: Term[]; onBack: () => void }> = ({ terms, onBack }) => {
  const [studyLogs] = useState(dummyLogs); // 本来はAppからpropsで受け取る
  return <ScheduleList terms={terms} studyLogs={studyLogs} onBack={onBack} />;
};

export default SchedulePage;
