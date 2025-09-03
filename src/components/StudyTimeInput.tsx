import React, { useState, useRef } from 'react';

interface StudyTimeInputProps {
  onRecord: (minutes: number) => void;
}

const StudyTimeInput: React.FC<StudyTimeInputProps> = ({ onRecord }) => {
  // ストップウォッチ用
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 手動入力用
  const [manualMinutes, setManualMinutes] = useState('');

  // ストップウォッチ開始
  const handleStart = () => {
    if (!isRunning) {
      setIsRunning(true);
      intervalRef.current = setInterval(() => {
        setSeconds(prev => prev + 1);
      }, 1000);
    }
  };

  // ストップウォッチ停止
  const handleStop = () => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };


  // ストップウォッチリセット
  const handleReset = () => {
    setSeconds(0);
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  // 記録（ストップウォッチ）
  const handleRecord = () => {
    const minutes = Math.floor(seconds / 60);
    if (minutes > 0) {
      onRecord(minutes);
      setSeconds(0);
      setIsRunning(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
  };

  // 手動記録
  const handleManualRecord = () => {
    const minutes = parseInt(manualMinutes, 10);
    if (!isNaN(minutes) && minutes > 0) {
      onRecord(minutes);
      setManualMinutes('');
    }
  };

  return (
    <div style={{ margin: '1em 0', padding: '1em', background: '#f5f7fa', borderRadius: '8px', boxShadow: '0 2px 8px #e0e7ef' }}>
      <h3>勉強時間記録</h3>
      <div style={{ marginBottom: '1em' }}>
        <span>ストップウォッチ: </span>
        <span style={{ fontWeight: 'bold', fontSize: '1.2em' }}>{Math.floor(seconds / 60)}:{('0' + (seconds % 60)).slice(-2)}</span>
        <button className="btn" onClick={handleStart} disabled={isRunning} style={{ marginLeft: '1em' }}>開始</button>
        <button className="btn" onClick={handleStop} disabled={!isRunning} style={{ marginLeft: '0.5em' }}>停止</button>
        <button className="btn" onClick={handleReset} style={{ marginLeft: '0.5em' }}>リセット</button>
        <button className="btn" onClick={handleRecord} disabled={seconds < 60} style={{ marginLeft: '0.5em' }}>記録</button>
      </div>
      <div>
        <span>手動入力: </span>
        <input type="number" min="1" value={manualMinutes} onChange={e => setManualMinutes(e.target.value)} style={{ width: '60px', marginRight: '0.5em' }} />
        <span>分</span>
        <button className="btn" onClick={handleManualRecord} style={{ marginLeft: '0.5em' }}>記録</button>
      </div>
    </div>
  );
};

export default StudyTimeInput;
