/**
 * src/components/StudyTimeInput.tsx
 *
 * ============================================================================
 * 📖 ファイル概要 / File Overview
 * ============================================================================
 *
 * 【日本語】
 * 学習時間を記録するための入力コンポーネント。
 * ストップウォッチ機能と手動入力の2つの方法で学習時間を記録できます。
 *
 * 【主な機能】
 * 1. ストップウォッチ機能（開始/停止/リセット）
 * 2. 手動入力による分数指定
 * 3. カテゴリ選択機能
 * 4. 学習時間の記録コールバック
 *
 * 【English】
 * Input component for recording study time.
 * Supports stopwatch function, manual input, and category selection.
 *
 * 【Key Features】
 * 1. Stopwatch function (start/stop/reset)
 * 2. Manual minute input
 * 3. Category selection
 * 4. Record study time callback
 *
 * ============================================================================
 * 📦 Props定義 / Props Definition
 * ============================================================================
 *
 * - onRecord: (minutes: number, category: string) => void - 学習時間記録時のコールバック
 * - categories: Category[] - カテゴリ一覧
 * - activeCategory?: string - 現在選択中のカテゴリ（オプション）
 *
 * ============================================================================
 *
 * @author Yusei Maekawa
 * @version 0.4.0
 * @since 2025-08-01
 * @updated 2025-11-15
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
  Save as SaveIcon
} from '@mui/icons-material';

interface Category {
  id: number;
  category_key: string;
  category_name: string;
  category_icon: string;
  category_color: string;
}

interface StudyTimeInputProps {
  onRecord: (minutes: number, category: string) => void;
  categories: Category[];
  activeCategory?: string;
}

const StudyTimeInput: React.FC<StudyTimeInputProps> = ({ 
  onRecord, 
  categories,
  activeCategory = 'all'
}) => {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [manualInput, setManualInput] = useState('');
  
  // カテゴリの初期選択: activeCategoryが'all'の場合は最初の有効なカテゴリを選択
  const getInitialCategory = () => {
    if (activeCategory !== 'all') {
      return activeCategory;
    }
    const firstCategory = categories.find(cat => cat.category_key !== 'all');
    return firstCategory ? firstCategory.category_key : '';
  };
  
  const [selectedCategory, setSelectedCategory] = useState(getInitialCategory());

  // activeCategoryが変更されたら自動的に選択カテゴリを更新
  useEffect(() => {
    if (activeCategory !== 'all') {
      setSelectedCategory(activeCategory);
    } else {
      // 'all'に戻った場合も最初のカテゴリを選択
      const firstCategory = categories.find(cat => cat.category_key !== 'all');
      if (firstCategory) {
        setSelectedCategory(firstCategory.category_key);
      }
    }
  }, [activeCategory, categories]);

  // ストップウォッチのタイマー
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    } else if (interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  // 時間フォーマット (HH:MM:SS)
  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // カテゴリ選択ハンドラー
  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    setSelectedCategory(event.target.value);
  };

  // ストップウォッチ記録
  const handleStopwatchRecord = () => {
    if (!selectedCategory) {
      alert('カテゴリを選択してください');
      return;
    }

    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) {
      onRecord(minutes, selectedCategory);
      setSeconds(0);
      setIsRunning(false);
    } else {
      alert('1分以上記録してください');
    }
  };

  // 手動入力記録
  const handleManualRecord = () => {
    if (!selectedCategory) {
      alert('カテゴリを選択してください');
      return;
    }

    const minutes = parseInt(manualInput, 10);
    if (!isNaN(minutes) && minutes > 0) {
      onRecord(minutes, selectedCategory);
      setManualInput('');
    } else {
      alert('正しい時間（分）を入力してください');
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, m: 2 }}>
      <Typography variant="h6" gutterBottom>
        ⏱️ 学習時間記録
      </Typography>

      {/* カテゴリ選択 */}
      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel id="study-category-label">科目を選択</InputLabel>
        <Select
          labelId="study-category-label"
          id="study-category-select"
          value={selectedCategory}
          label="科目を選択"
          onChange={handleCategoryChange}
        >
          {categories
            .filter(cat => cat.category_key !== 'all')
            .map(cat => (
              <MenuItem key={cat.id} value={cat.category_key}>
                {cat.category_icon} {cat.category_name}
              </MenuItem>
            ))}
        </Select>
      </FormControl>

      {/* ストップウォッチ */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          ストップウォッチ
        </Typography>
        <Typography variant="h4" sx={{ mb: 2, fontFamily: 'monospace' }}>
          {formatTime(seconds)}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {!isRunning ? (
            <Button
              variant="contained"
              color="primary"
              startIcon={<PlayArrowIcon />}
              onClick={() => setIsRunning(true)}
            >
              開始
            </Button>
          ) : (
            <Button
              variant="contained"
              color="warning"
              startIcon={<PauseIcon />}
              onClick={() => setIsRunning(false)}
            >
              一時停止
            </Button>
          )}
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<StopIcon />}
            onClick={() => {
              setIsRunning(false);
              setSeconds(0);
            }}
          >
            リセット
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<SaveIcon />}
            onClick={handleStopwatchRecord}
            disabled={seconds < 60 || !selectedCategory}
          >
            記録
          </Button>
        </Box>
      </Box>

      {/* 手動入力 */}
      <Box>
        <Typography variant="subtitle1" gutterBottom>
          手動入力
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            type="number"
            label="時間（分）"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            inputProps={{ min: 1 }}
            sx={{ flexGrow: 1 }}
          />
          <Button
            variant="contained"
            color="success"
            startIcon={<SaveIcon />}
            onClick={handleManualRecord}
            disabled={!manualInput || !selectedCategory}
          >
            記録
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default StudyTimeInput;
