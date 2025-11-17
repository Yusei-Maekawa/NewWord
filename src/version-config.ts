/**
 * version-config.ts
 *
 * ============================================================================
 * 📖 ファイル概要 / File Overview
 * ============================================================================
 *
 * 【日本語】
 * アプリケーション全体のバージョン情報を一元管理するファイル。
 * セマンティックバージョニング（Semantic Versioning）を採用しています。
 *
 * 【English】
 * Centralized version information management file for the entire application.
 * Follows Semantic Versioning (SemVer) conventions.
 *
 * ============================================================================
 * 📦 バージョン情報 / Version Information
 * ============================================================================
 *
 * - APP_VERSION: アプリケーションのメインバージョン
 * - VERSION_NAME: バージョンの名称・コードネーム
 * - RELEASE_DATE: リリース日
 * - BUILD_NUMBER: ビルド番号（自動インクリメント用）
 *
 * ============================================================================
 * 🔢 セマンティックバージョニングについて / About Semantic Versioning
 * ============================================================================
 *
 * バージョン形式: MAJOR.MINOR.PATCH
 *
 * - MAJOR (メジャー): 互換性のない大きな変更
 * - MINOR (マイナー): 後方互換性のある機能追加
 * - PATCH (パッチ): 後方互換性のあるバグ修正
 *
 * 開発段階 (0.x.x):
 * - 0.1.0 から開始
 * - 破壊的変更が自由に行える
 * - 安定版リリース時に 1.0.0 へ移行
 *
 * ============================================================================
 *
 * @author Yusei Maekawa
 * @version 0.3.0
 * @since 2025-11-02
 * @updated 2025-11-02
 */

/**
 * アプリケーションのバージョン情報
 */
export const VERSION_INFO = {
  /** メインバージョン番号（セマンティックバージョニング） */
  APP_VERSION: '0.3.0',
  
  /** バージョン名称・コードネーム */
  VERSION_NAME: 'Alpha Release - Recursive Favorites',
  
  /** リリース日 */
  RELEASE_DATE: '2025-11-02',
  
  /** ビルド番号 */
  BUILD_NUMBER: 3,
  
  /** 開発段階フラグ */
  IS_DEVELOPMENT: true,
  
  /** 完全なバージョン文字列 */
  get FULL_VERSION(): string {
    return `v${this.APP_VERSION}-build.${this.BUILD_NUMBER}`;
  },
  
  /** バージョン表示用文字列 */
  get DISPLAY_VERSION(): string {
    return `${this.APP_VERSION} (${this.VERSION_NAME})`;
  }
} as const;

/**
 * バージョン履歴
 */
export const VERSION_HISTORY = [
  {
    version: '0.3.0',
    date: '2025-11-02',
    name: 'Recursive Favorites',
    features: [
      '再帰的お気に入り機能の実装',
      '包括的ドキュメントヘッダーの追加（26ファイル）',
      '変数名エラーの修正',
      'セマンティックバージョニングの採用'
    ]
  },
  {
    version: '0.2.0',
    date: '2025-11-01',
    name: 'Firestore Integration',
    features: [
      'Firestoreカテゴリ管理の実装',
      'Firestore用語句管理の実装',
      'デバッグツールの追加',
      'バックエンドモード切り替え機能'
    ]
  },
  {
    version: '0.1.0',
    date: '2025-08-01',
    name: 'Initial Release',
    features: [
      '基本CRUD機能',
      '学習機能',
      'カテゴリ管理',
      'CSVインポート',
      'MySQL連携'
    ]
  }
] as const;

/**
 * コンソールにバージョン情報を表示
 */
export const printVersionInfo = (): void => {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║  📚 学習用語句振り返りアプリ                                    ║
║  English-Studying Application                                 ║
╠═══════════════════════════════════════════════════════════════╣
║  Version: ${VERSION_INFO.FULL_VERSION.padEnd(49)} ║
║  Name:    ${VERSION_INFO.VERSION_NAME.padEnd(49)} ║
║  Date:    ${VERSION_INFO.RELEASE_DATE.padEnd(49)} ║
║  Status:  ${(VERSION_INFO.IS_DEVELOPMENT ? '🚧 Development' : '✅ Production').padEnd(49)} ║
╚═══════════════════════════════════════════════════════════════╝
  `);
};

export default VERSION_INFO;
