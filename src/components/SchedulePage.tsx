/**
 * src/components/SchedulePage.tsx
 *
 * ============================================================================
 * 📖 ファイル概要 / File Overview
 * ============================================================================
 *
 * 【日本語】
 * 学習スケジュール表示ページのラッパーコンポーネント。
 * ScheduleListコンポーネントをレンダリングします。
 *
 * 【English】
 * Wrapper component for the study schedule display page.
 * Renders the ScheduleList component.
 *
 * ============================================================================
 * 📦 Props定義 / Props Definition
 * ============================================================================
 *
 * - terms: Term[] - 語句データ配列
 * - studyLogs: StudyLog[] - 学習ログデータ配列
 * - onBack: () => void - 戻るボタンクリック時のコールバック
 * - onDeleteLog: (date: string, category: string) => void - ログ削除時のコールバック
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
