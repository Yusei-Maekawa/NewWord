/**
 * src/utils/dateUtils.ts
 *
 * ============================================================================
 * 📖 ファイル概要 / File Overview
 * ============================================================================
 *
 * 【日本語】
 * 日本時間（JST）対応のユーティリティ関数を提供します。
 * Firestoreに保存する際に、日本時間のTimestampを生成します。
 *
 * 【主な機能】
 * 1. 現在の日本時間のTimestampを取得
 * 2. DateオブジェクトをJST Timestampに変換
 * 3. TimestampからJST Dateオブジェクトに変換
 * 4. 日本時間の日付文字列を取得
 *
 * 【English】
 * Provides utility functions for Japan Standard Time (JST) support.
 * Generates JST Timestamps for storing in Firestore.
 *
 * 【Key Features】
 * 1. Get current JST Timestamp
 * 2. Convert Date object to JST Timestamp
 * 3. Convert Timestamp to JST Date object
 * 4. Get JST date strings
 *
 * ============================================================================
 * 🔧 関数リスト / Function List
 * ============================================================================
 *
 * 1. getJSTTimestamp(): Timestamp
 *    - 現在の日本時間のTimestampを返す
 *
 * 2. toJSTTimestamp(date: Date): Timestamp
 *    - DateオブジェクトをJST Timestampに変換
 *
 * 3. fromJSTTimestamp(timestamp: Timestamp): Date
 *    - TimestampをJST Dateオブジェクトに変換
 *
 * 4. getJSTDateString(): string
 *    - "YYYY-MM-DD"形式の日本時間日付文字列を返す
 *
 * 5. getJSTDateTimeString(): string
 *    - "YYYY-MM-DD HH:mm:ss"形式の日本時間日付時刻文字列を返す
 *
 * ============================================================================
 *
 * @author Yusei Maekawa
 * @version 1.0.0
 * @since 2025-12-08
 */

import { Timestamp } from 'firebase/firestore';

/**
 * 現在の日本時間のTimestampを取得
 * 
 * 【日本語】
 * 現在のUTC時刻に9時間を加算して日本時間のTimestampを返します。
 * Firestoreへの保存時に使用します。
 * 
 * 【English】
 * Returns current JST Timestamp by adding 9 hours to UTC time.
 * Used when storing data in Firestore.
 * 
 * @returns {Timestamp} 日本時間のTimestamp
 * 
 * @example
 * const jstTime = getJSTTimestamp();
 * await addDoc(collection(db, 'terms'), {
 *   word: 'example',
 *   created_at: jstTime
 * });
 */
export const getJSTTimestamp = (): Timestamp => {
  const now = new Date();
  // 日本時間に変換（UTC+9）
  const jstDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
  return Timestamp.fromDate(jstDate);
};

/**
 * DateオブジェクトをJST Timestampに変換
 * 
 * 【日本語】
 * 指定されたDateオブジェクトを日本時間として解釈し、Timestampに変換します。
 * 
 * 【English】
 * Converts a Date object to JST Timestamp.
 * 
 * @param {Date} date - 変換するDateオブジェクト
 * @returns {Timestamp} 日本時間のTimestamp
 * 
 * @example
 * const date = new Date('2025-12-08');
 * const jstTimestamp = toJSTTimestamp(date);
 */
export const toJSTTimestamp = (date: Date): Timestamp => {
  const jstDate = new Date(date.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
  return Timestamp.fromDate(jstDate);
};

/**
 * TimestampをJST Dateオブジェクトに変換
 * 
 * 【日本語】
 * FirestoreのTimestampを日本時間のDateオブジェクトに変換します。
 * 
 * 【English】
 * Converts Firestore Timestamp to JST Date object.
 * 
 * @param {Timestamp} timestamp - 変換するTimestamp
 * @returns {Date} 日本時間のDateオブジェクト
 * 
 * @example
 * const jstDate = fromJSTTimestamp(firestoreTimestamp);
 * console.log(jstDate.toLocaleString('ja-JP'));
 */
export const fromJSTTimestamp = (timestamp: Timestamp): Date => {
  const utcDate = timestamp.toDate();
  return new Date(utcDate.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
};

/**
 * 日本時間の日付文字列を取得（YYYY-MM-DD）
 * 
 * 【日本語】
 * 現在の日本時間を"YYYY-MM-DD"形式の文字列で返します。
 * 
 * 【English】
 * Returns current JST date as "YYYY-MM-DD" format string.
 * 
 * @returns {string} "YYYY-MM-DD"形式の日付文字列
 * 
 * @example
 * const dateStr = getJSTDateString(); // "2025-12-08"
 */
export const getJSTDateString = (): string => {
  const now = new Date();
  const jstDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
  
  const year = jstDate.getFullYear();
  const month = String(jstDate.getMonth() + 1).padStart(2, '0');
  const day = String(jstDate.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * 日本時間の日付時刻文字列を取得（YYYY-MM-DD HH:mm:ss）
 * 
 * 【日本語】
 * 現在の日本時間を"YYYY-MM-DD HH:mm:ss"形式の文字列で返します。
 * 
 * 【English】
 * Returns current JST datetime as "YYYY-MM-DD HH:mm:ss" format string.
 * 
 * @returns {string} "YYYY-MM-DD HH:mm:ss"形式の日付時刻文字列
 * 
 * @example
 * const dateTimeStr = getJSTDateTimeString(); // "2025-12-08 14:30:45"
 */
export const getJSTDateTimeString = (): string => {
  const now = new Date();
  const jstDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' }));
  
  const year = jstDate.getFullYear();
  const month = String(jstDate.getMonth() + 1).padStart(2, '0');
  const day = String(jstDate.getDate()).padStart(2, '0');
  const hours = String(jstDate.getHours()).padStart(2, '0');
  const minutes = String(jstDate.getMinutes()).padStart(2, '0');
  const seconds = String(jstDate.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};
