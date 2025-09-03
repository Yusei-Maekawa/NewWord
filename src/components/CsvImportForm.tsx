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
