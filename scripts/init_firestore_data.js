/**
 * scripts/init_firestore_data.js
 *
 * 日本語:
 * Firestoreに初期データを投入するスクリプトです。
 * サンプルデータとしてカテゴリと用語を追加します。
 *
 * 前提:
 * - サービスアカウント JSON を `./secrets/serviceAccountKey.json` に配置していること
 * - 管理者権限で Firestore へ書き込みできること
 *
 * 実行:
 * - node scripts/init_firestore_data.js
 *
 * 目次:
 * - 依存: firebase-admin
 * - 関数: initFirestoreData() - メイン処理。カテゴリと用語を Firestore に追加
 * - 重要変数:
 *   - sampleCategories: 初期カテゴリデータ
 *   - sampleTerms: 初期用語データ
 */

const admin = require('firebase-admin');
const path = require('path');

// Firebase Admin初期化
try {
  const serviceAccount = require(path.resolve(__dirname, '../secrets/serviceAccountKey.json'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('✅ Firebase Admin初期化成功');
} catch (error) {
  console.error('❌ Firebase Admin初期化失敗:', error.message);
  process.exit(1);
}

const db = admin.firestore();

/**
 * 初期カテゴリデータ
 */
const sampleCategories = [
  {
    id: 'english',
    name: '英語',
    description: '英単語・英語フレーズの学習',
    displayOrder: 1,
    parentId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'applied',
    name: '応用情報',
    description: '応用情報技術者試験の用語',
    displayOrder: 2,
    parentId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'advanced',
    name: '高度情報',
    description: '高度情報処理技術者試験の用語',
    displayOrder: 3,
    parentId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'gkentei',
    name: 'G検定',
    description: 'G検定（ジェネラリスト検定）の用語',
    displayOrder: 4,
    parentId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

/**
 * 初期用語データ
 */
const sampleTerms = [
  // 英語カテゴリ
  {
    category: 'english',
    term: 'Algorithm',
    meaning: 'アルゴリズム - 問題を解決するための手順や計算方法',
    example: 'The sorting algorithm efficiently organizes the data.',
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    category: 'english',
    term: 'Database',
    meaning: 'データベース - 構造化された情報の集合',
    example: 'The database stores user information securely.',
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    category: 'english',
    term: 'Framework',
    meaning: 'フレームワーク - アプリケーション開発のための基盤',
    example: 'React is a popular JavaScript framework.',
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  
  // 応用情報カテゴリ
  {
    category: 'applied',
    term: 'データベース正規化',
    meaning: 'データの重複を排除し、整合性を保つためのデータベース設計技法',
    example: '第3正規形まで正規化することで、データの整合性が向上する',
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    category: 'applied',
    term: 'TCP/IP',
    meaning: 'インターネットで使用される通信プロトコルの集合',
    example: 'TCP/IPは4層のアーキテクチャで構成されている',
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    category: 'applied',
    term: 'オブジェクト指向',
    meaning: '現実世界のオブジェクトを模したプログラミング手法',
    example: 'カプセル化、継承、ポリモーフィズムがオブジェクト指向の3大特徴',
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  
  // 高度情報カテゴリ
  {
    category: 'advanced',
    term: 'マイクロサービス',
    meaning: 'アプリケーションを小さな独立したサービスに分割するアーキテクチャ',
    example: '各サービスが独立してデプロイ・スケールできる',
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    category: 'advanced',
    term: 'DevOps',
    meaning: '開発（Development）と運用（Operations）を統合した手法',
    example: 'CI/CDパイプラインがDevOpsの重要な要素',
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    category: 'advanced',
    term: 'コンテナ',
    meaning: 'アプリケーションとその実行環境を軽量で可搬性の高い形でパッケージ化する技術',
    example: 'Dockerは代表的なコンテナ技術',
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  
  // G検定カテゴリ
  {
    category: 'gkentei',
    term: '深層学習',
    meaning: '多層のニューラルネットワークを用いた機械学習手法',
    example: '画像認識や自然言語処理で優れた性能を発揮',
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    category: 'gkentei',
    term: '過学習',
    meaning: '訓練データに特化しすぎて汎化性能が低下する現象',
    example: 'ドロップアウトや正則化で過学習を防ぐ',
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    category: 'gkentei',
    term: 'バックプロパゲーション',
    meaning: 'ニューラルネットワークの重みを最適化する学習アルゴリズム',
    example: '誤差を逆伝播させて勾配を計算する',
    isFavorite: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

/**
 * Firestoreに初期データを投入
 */
async function initFirestoreData() {
  try {
    console.log('🔥 Firestore初期データ投入開始...\n');

    // 1. カテゴリデータの投入
    console.log('📁 カテゴリデータを投入中...');
    const categoryBatch = db.batch();
    
    for (const category of sampleCategories) {
      const categoryRef = db.collection('categories').doc(category.id);
      categoryBatch.set(categoryRef, category);
      console.log(`  ✓ カテゴリ追加: ${category.name} (${category.id})`);
    }
    
    await categoryBatch.commit();
    console.log(`✅ カテゴリデータ投入完了: ${sampleCategories.length}件\n`);

    // 2. 用語データの投入
    console.log('📝 用語データを投入中...');
    const termBatch = db.batch();
    
    for (const term of sampleTerms) {
      const termRef = db.collection('terms').doc(); // 自動生成ID
      termBatch.set(termRef, term);
      console.log(`  ✓ 用語追加: ${term.term} (${term.category})`);
    }
    
    await termBatch.commit();
    console.log(`✅ 用語データ投入完了: ${sampleTerms.length}件\n`);

    // 3. データ件数確認
    const categoriesSnapshot = await db.collection('categories').get();
    const termsSnapshot = await db.collection('terms').get();
    
    console.log('📊 Firestoreデータ件数確認:');
    console.log(`  - カテゴリ: ${categoriesSnapshot.size}件`);
    console.log(`  - 用語: ${termsSnapshot.size}件`);
    
    console.log('\n✅ 初期データ投入完了！');
    console.log('   次: ブラウザで http://localhost:3000 を開いてデータを確認してください');

  } catch (error) {
    console.error('❌ エラー:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// スクリプト実行
initFirestoreData();
