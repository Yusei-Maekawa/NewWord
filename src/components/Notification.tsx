/**
 * src/components/Notification.tsx
 *
 * ============================================================================
 * 📖 ファイル概要 / File Overview
 * ============================================================================
 *
 * 【日本語】
 * 通知メッセージを一時的に表示するコンポーネント。
 * Material-UIのSnackbarとAlertを使用して、
 * 成功メッセージ（緑色）とエラーメッセージ（赤色）の2種類をサポートし、
 * 指定時間後に自動的にフェードアウトします。
 *
 * 【主な機能】
 * 1. 成功/エラーメッセージの表示
 * 2. 自動フェードアウト（デフォルト3秒）
 * 3. 手動クローズ機能（×ボタン）
 * 4. スライドインアニメーション
 *
 * 【English】
 * Component for temporarily displaying notification messages.
 * Uses Material-UI's Snackbar and Alert to support two types:
 * success messages (green) and error messages (red),
 * automatically fading out after a specified duration.
 *
 * 【Key Features】
 * 1. Display success/error messages
 * 2. Auto fade-out (default 3 seconds)
 * 3. Manual close (× button)
 * 4. Slide-in animation
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
 * 🔧 使用しているMUIコンポーネント / MUI Components Used
 * ============================================================================
 *
 * - Snackbar: 通知バーの表示位置とアニメーション管理
 * - Alert: 成功/エラーのスタイリングとアイコン表示
 *
 * ============================================================================
 *
 * @author Yusei Maekawa
 * @version 2.0.0
 * @since 2025-08-01
 * @updated 2025-11-02
 */

import React from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

interface NotificationProps {
  message: string;
  type: 'success' | 'error';
  duration?: number;
  onClose: () => void;
}

/**
 * 通知コンポーネント
 * 
 * Material-UIのSnackbarとAlertを使用した通知表示。
 * 指定された時間後に自動的に消えます。
 *
 * @component
 * @param {NotificationProps} props - コンポーネントのプロパティ
 * @returns {JSX.Element} 通知のJSX要素
 */
const Notification: React.FC<NotificationProps> = ({ 
  message, 
  type, 
  duration = 3000, 
  onClose 
}) => {
  /**
   * Snackbarクローズハンドラー
   * 自動クローズまたは手動クローズ（×ボタン）時に呼ばれる
   * 
   * @param _event - イベントオブジェクト（未使用）
   * @param reason - クローズ理由（'clickaway'の場合は無視）
   */
  const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    // 'clickaway'（背景クリック）では閉じない
    if (reason === 'clickaway') {
      return;
    }
    onClose();
  };

  return (
    <Snackbar
      open={true}
      autoHideDuration={duration}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      sx={{ marginTop: '70px' }} // ヘッダーの下に表示
    >
      <Alert 
        onClose={handleClose} 
        severity={type} 
        variant="filled"
        sx={{ width: '100%' }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Notification;
