
import React from 'react';
import { Term, StudyLog } from '../types';
import { categories } from '../data/categories';

export interface ScheduleListProps {
  terms: Term[];
  studyLogs: StudyLog[];
  onBack: () => void;
}

function getScheduleSummary(terms: Term[], studyLogs: StudyLog[]) {
  const summary: { [date: string]: { [category: string]: { terms: number; time: number } } } = {};
  terms.forEach(term => {
    const date = term.createdAt?.slice(0, 10);
    if (!date) return;
    if (!summary[date]) summary[date] = {};
    if (!summary[date][term.category]) summary[date][term.category] = { terms: 0, time: 0 };
    summary[date][term.category].terms++;
  });
  studyLogs.forEach(log => {
    if (!summary[log.date]) summary[log.date] = {};
    if (!summary[log.date][log.category]) summary[log.date][log.category] = { terms: 0, time: 0 };
    summary[log.date][log.category].time += log.amount;
  });
  return summary;
}

const ScheduleList: React.FC<ScheduleListProps> = ({ terms, studyLogs, onBack }) => {
  const summary = getScheduleSummary(terms, studyLogs);
  const dates = Object.keys(summary).sort((a, b) => b.localeCompare(a));
  return (
    <div>
      <section className="section">
        <h2>スケジュール一覧</h2>
        <button className="btn" onClick={onBack} style={{ marginBottom: '1em' }}>戻る</button>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden' }}>
          <thead>
            <tr style={{ background: '#e0e7ef' }}>
              <th style={{ padding: '8px' }}>日付</th>
              <th style={{ padding: '8px' }}>科目</th>
              <th style={{ padding: '8px' }}>語句追加数</th>
              <th style={{ padding: '8px' }}>勉強時間(分)</th>
            </tr>
          </thead>
          <tbody>
            {dates.map((date: string) => (
              Object.keys(summary[date]).map((category: string) => (
                <tr key={date + category}>
                  <td style={{ padding: '8px', textAlign: 'center' }}>{date}</td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>{categories.find(c => c.key === category)?.name || category}</td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>{summary[date][category].terms}</td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>{summary[date][category].time}</td>
                </tr>
              ))
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default ScheduleList;
// ...existing code...
