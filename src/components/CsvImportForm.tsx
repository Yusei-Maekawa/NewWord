/**
 * src/components/CsvImportForm.tsx
 *
 * ============================================================================
 * 📖 ファイル概要 / File Overview
 * ============================================================================
 *
 * 【日本語】
 * CSV形式のファイルから語句データを一括インポートするコンポーネント。
 * ファイル選択後、CSV内容をパースして語句オブジェクトに変換します。
 *
 * 【主な機能】
 * 1. CSVファイルのアップロード
 * 2. CSVパース処理（カンマ区切り）
 * 3. 必須項目チェック（term, meaning）
 * 4. 例文の自動生成（example未指定時）
 *
 * 【English】
 * Component for bulk importing term data from CSV files.
 * Parses CSV content and converts it to term objects after file selection.
 *
 * 【Key Features】
 * 1. CSV file upload
 * 2. CSV parsing (comma-separated)
 * 3. Required field validation (term, meaning)
 * 4. Auto-generate examples (when example not specified)
 *
 * ============================================================================
 * 📦 Props定義 / Props Definition
 * ============================================================================
 *
 * - onImportTerms: (terms: Omit<Term, 'id' | 'createdAt'>[]) => void
 *   - 日本語: インポート完了時のコールバック（語句配列を渡す）
 *   - English: Callback on import completion (passes term array)
 *
 * ============================================================================
 *
 * @author Yusei Maekawa
 * @version 1.0.0
 * @since 2025-08-01
 * @updated 2025-11-02
 */

import React, { useRef } from 'react';
import { Term } from '../types';

interface CsvImportFormProps {
  onImportTerms: (terms: Omit<Term, 'id' | 'createdAt'>[]) => void;
}

const CsvImportForm: React.FC<CsvImportFormProps> = ({ onImportTerms }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split(/\r?\n/).filter(line => line.trim());
      const header = lines[0].split(',').map(h => h.trim().toLowerCase());
      const terms: Omit<Term, 'id' | 'createdAt'>[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',');
        const termObj: any = {};
        header.forEach((h, idx) => {
          termObj[h] = cols[idx]?.trim() || '';
        });
        // 必須項目チェック
        if (!termObj.term || !termObj.meaning) return;
        // 例文自動生成
        if (!termObj.example) {
          termObj.example = `Example: This is a sentence using '${termObj.term}'.`;
        }
        // カテゴリ未指定ならenglish
        if (!termObj.category) termObj.category = 'english';
        terms.push({
          category: termObj.category,
          term: termObj.term,
          meaning: termObj.meaning,
          example: termObj.example
        });
      }
      onImportTerms(terms);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="csv-import-form">
      <label htmlFor="csv-input" style={{ fontWeight: 'bold' }}>CSV一括インポート:</label>
      <input
        id="csv-input"
        type="file"
        accept=".csv"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ marginLeft: '10px' }}
      />
      <div style={{ fontSize: '0.9em', marginTop: '8px', color: '#666' }}>
        カラム例: term,meaning,category,example（例文は空欄でもOK）
      </div>
    </div>
  );
};

export default CsvImportForm;
