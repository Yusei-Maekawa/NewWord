/**
 * src/components/Notification.tsx
 *
 * ============================================================================
 * 📖 ファイル概要 / File Overview
 * ============================================================================
 *
 * 【日本語】
 * 通知メッセージを一時的に表示するコンポーネント。
 * 成功メッセージ（緑色）とエラーメッセージ（赤色）の2種類をサポートし、
 * 指定時間後に自動的にフェードアウトします。
 *
 * 【English】
 * Component for temporarily displaying notification messages.
 * Supports two types: success messages (green) and error messages (red),
 * automatically fading out after a specified duration.
 *
 * ============================================================================
 * 📦 Props定義 / Props Definition
 * ============================================================================
 *
 * - message: string - 表示するメッセージテキスト
 * - type: 'success' | 'error' - 通知タイプ（成功 or エラー）
 * - duration?: number - 表示時間（ミリ秒、デフォルト3000）
 * - onClose: () => void - 通知クローズ時のコールバック
 *
 * ============================================================================
 *
 * @author Yusei Maekawa
 * @version 1.0.0
 * @since 2025-08-01
 * @updated 2025-11-02
 */

import React, { useEffect, useState } from 'react';

interface NotificationProps {
  message: string;
  type: 'success' | 'error';
  duration?: number;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ 
  message, 
  type, 
  duration = 3000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // アニメーション完了後にクリーンアップ
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className={`notification ${type}`}>
      {message}
    </div>
  );
};

export default Notification;
