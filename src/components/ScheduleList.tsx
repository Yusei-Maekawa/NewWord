/**
 * src/components/ScheduleList.tsx
 *
 * ============================================================================
 * 📖 ファイル概要 / File Overview
 * ============================================================================
 *
 * 【日本語】
 * 学習スケジュール一覧表示コンポーネント。
 * 日付ごとに語句数と学習時間をカテゴリ別に集計して表示します。
 * 削除モードでログを削除可能です。
 *
 * 【主な機能】
 * 1. 日付ごとの学習サマリー表示
 * 2. カテゴリ別の語句数・学習時間集計
 * 3. ログ削除機能
 * 4. カテゴリ情報の表示（アイコン、名前、色）
 *
 * 【English】
 * Study schedule list display component.
 * Displays term count and study time by category for each date.
 * Allows log deletion in delete mode.
 *
 * 【Key Features】
 * 1. Display study summary by date
 * 2. Aggregate term count and study time by category
 * 3. Log deletion function
 * 4. Display category info (icon, name, color)
 *
 * ============================================================================
 * 📦 Props定義 / Props Definition
 * ============================================================================
 *
 * - terms: Term[] - 語句データ配列
 * - studyLogs: StudyLog[] - 学習ログデータ配列
 * - onBack: () => void - 戻るボタンクリック時のコールバック
 * - onDeleteLog?: (date: string, category: string) => void - ログ削除時のコールバック
 *
 * ============================================================================
 *
 * @author Yusei Maekawa
 * @version 0.1.0
 * @since 2025-08-01
 * @updated 2025-11-02
 */

import React from 'react';
import { Term, StudyLog } from '../types';
import { categories } from '../data/categories';

export interface ScheduleListProps {
  terms: Term[];
  studyLogs: StudyLog[];
  onBack: () => void;
  onDeleteLog?: (date: string, category: string) => void;
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

const ScheduleList: React.FC<ScheduleListProps> = ({ terms, studyLogs, onBack, onDeleteLog }) => {
  const [deleteMode, setDeleteMode] = React.useState(false);
  const summary = getScheduleSummary(terms, studyLogs);
  const dates = Object.keys(summary).sort((a, b) => b.localeCompare(a));
  return (
    <div>
      <section className="section">
        <h2>スケジュール一覧</h2>
        <button className="btn" onClick={onBack} style={{ marginBottom: '1em' }}>戻る</button>
        <button className="btn btn-danger" onClick={() => setDeleteMode(m => !m)} style={{ marginBottom: '1em', marginLeft: '1em' }}>
          {deleteMode ? '削除モード解除' : '削除モード'}
        </button>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: '8px', overflow: 'hidden' }}>
          <thead>
            <tr style={{ background: '#e0e7ef' }}>
              <th style={{ padding: '8px' }}>日付</th>
              <th style={{ padding: '8px' }}>科目</th>
              <th style={{ padding: '8px' }}>語句追加数</th>
              <th style={{ padding: '8px' }}>勉強時間(分)</th>
              {deleteMode && <th style={{ padding: '8px' }}>削除</th>}
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
                  {deleteMode && (
                    <td style={{ padding: '8px', textAlign: 'center' }}>
                      <button className="btn btn-danger" onClick={() => onDeleteLog && onDeleteLog(date, category)}>
                        削除
                      </button>
                    </td>
                  )}
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
