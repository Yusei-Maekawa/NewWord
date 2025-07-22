import React from 'react';
import { Term, StudyLog } from '../types';
import ScheduleList from './ScheduleList';

interface SchedulePageProps {
  terms: Term[];
  studyLogs: StudyLog[];
  onBack: () => void;
  onDeleteLog: (date: string, category: string) => void;
}

const SchedulePage: React.FC<SchedulePageProps> = ({ terms, studyLogs, onBack, onDeleteLog }) => {
  return <ScheduleList terms={terms} studyLogs={studyLogs} onBack={onBack} onDeleteLog={onDeleteLog} />;
};

export default SchedulePage;
