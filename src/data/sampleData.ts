/**
 * @fileoverview サンプルデータファイル
 *
 * このファイルは、開発時やテスト時に使用するサンプル語句データを定義します。
 * 新機能の実装時やデモ用の初期データとして利用されます。
 *
 * @author Yusei Maekawa
 * @version 1.0.0
 * @since 2025-08-01
 */

import { Term } from '../types';

/**
 * サンプル語句データ配列
 *
 * 各カテゴリから代表的な語句をサンプルとして収録しています。
 * 開発時のテストデータや、新規ユーザーの初期データとして使用されます。
 *
 * サンプルデータの特徴：
 * - 各カテゴリからバランスよく収録
 * - 実践的な使用例を含む
 * - 日本語・英語の両方をカバー
 * - プログラミング、資格試験、ネットワークなどの分野
 *
 * @type {Term[]}
 */
export const sampleTerms: Term[] = [
  // ===== 英語カテゴリ =====

  /**
   * アルゴリズムのサンプル
   * プログラミングの基礎概念
   */
  {
    id: 1,
    category: 'english',
    term: 'Algorithm',
    meaning: 'アルゴリズム - 問題を解決するための手順や計算方法',
    example: 'The sorting algorithm efficiently organizes the data.',
    createdAt: new Date().toISOString()
  },

  /**
   * データベースのサンプル
   * データ管理の基礎概念
   */
  {
    id: 2,
    category: 'english',
    term: 'Database',
    meaning: 'データベース - 構造化された情報の集合',
    example: 'The database stores user information securely.',
    createdAt: new Date().toISOString()
  },

  /**
   * フレームワークのサンプル
   * 開発ツールの基礎概念
   */
  {
    id: 3,
    category: 'english',
    term: 'Framework',
    meaning: 'フレームワーク - アプリケーション開発のための基盤',
    example: 'React is a popular JavaScript framework.',
    createdAt: new Date().toISOString()
  },

  // ===== 応用情報カテゴリ =====

  /**
   * データベース正規化のサンプル
   * 応用情報技術者試験の重要概念
   */
  {
    id: 4,
    category: 'applied',
    term: 'データベース正規化',
    meaning: 'データの重複を排除し、整合性を保つためのデータベース設計技法',
    example: '第3正規形まで正規化することで、データの整合性が向上する',
    createdAt: new Date().toISOString()
  },

  /**
   * TCP/IPのサンプル
   * ネットワークの基礎プロトコル
   */
  {
    id: 5,
    category: 'applied',
    term: 'TCP/IP',
    meaning: 'インターネットで使用される通信プロトコルの集合',
    example: 'TCP/IPは4層のアーキテクチャで構成されている',
    createdAt: new Date().toISOString()
  },

  /**
   * オブジェクト指向のサンプル
   * プログラミングパラダイムの基礎概念
   */
  {
    id: 6,
    category: 'applied',
    term: 'オブジェクト指向',
    meaning: '現実世界のオブジェクトを模したプログラミング手法',
    example: 'カプセル化、継承、ポリモーフィズムがオブジェクト指向の3大特徴',
    createdAt: new Date().toISOString()
  },
  {
    id: 7,
    category: 'advanced',
    term: 'マイクロサービス',
    meaning: 'アプリケーションを小さな独立したサービスに分割するアーキテクチャ',
    example: '各サービスが独立してデプロイ・スケールできる',
    createdAt: new Date().toISOString()
  },
  {
    id: 8,
    category: 'advanced',
    term: 'DevOps',
    meaning: '開発（Development）と運用（Operations）を統合した手法',
    example: 'CI/CDパイプラインがDevOpsの重要な要素',
    createdAt: new Date().toISOString()
  },
  {
    id: 9,
    category: 'advanced',
    term: 'コンテナ',
    meaning: 'アプリケーションとその実行環境を軽量で可搬性の高い形でパッケージ化する技術',
    example: 'Dockerは代表的なコンテナ技術',
    createdAt: new Date().toISOString()
  },
  {
    id: 10,
    category: 'gkentei',
    term: '深層学習',
    meaning: '多層のニューラルネットワークを用いた機械学習手法',
    example: '画像認識や自然言語処理で優れた性能を発揮',
    createdAt: new Date().toISOString()
  },
  {
    id: 11,
    category: 'gkentei',
    term: '過学習',
    meaning: '訓練データに特化しすぎて汎化性能が低下する現象',
    example: 'ドロップアウトや正則化で過学習を防ぐ',
    createdAt: new Date().toISOString()
  },
  {
    id: 12,
    category: 'gkentei',
    term: 'バックプロパゲーション',
    meaning: 'ニューラルネットワークの重みを最適化する学習アルゴリズム',
    example: '誤差を逆伝播させて勾配を計算する',
    createdAt: new Date().toISOString()
  }
];

export const loadSampleData = (setTerms: (terms: Term[]) => void) => {
  const existingTerms = JSON.parse(localStorage.getItem('studyTerms') || '[]');
  if (existingTerms.length === 0) {
    setTerms(sampleTerms);
  }
};
