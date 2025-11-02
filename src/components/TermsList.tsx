/**
 * src/components/TermsList.tsx
 *
 * ============================================================================
 * 📖 ファイル概要 / File Overview
 * ============================================================================
 *
 * 【日本語】
 * 語句一覧表示コンポーネント。
 * 学習対象となる語句（Term）の一覧を表示し、検索、フィルタリング、
 * ソート、編集・削除などの操作を提供します。
 *
 * 【主な機能】
 * 1. 語句の一覧表示（カード形式・リスト形式）
 * 2. リアルタイム検索（語句、意味、例文から）
 * 3. カテゴリ別フィルタリング
 * 4. 複数ソートオプション（作成日、語句名、カテゴリ）
 * 5. お気に入りフィルタリング
 * 6. 編集・削除ボタン
 * 7. リッチテキスト表示（色付き、サイズ変更）
 * 8. ページネーション（将来実装予定）
 *
 * 【English】
 * Terms list display component.
 * Displays a list of terms (vocabulary) to be learned and provides
 * search, filtering, sorting, edit, and delete operations.
 *
 * 【Key Features】
 * 1. Display terms list (card format / list format)
 * 2. Real-time search (from term, meaning, example)
 * 3. Filter by category
 * 4. Multiple sort options (creation date, term name, category)
 * 5. Favorite filtering
 * 6. Edit and delete buttons
 * 7. Rich text display (colored, resized)
 * 8. Pagination (planned for future implementation)
 *
 * ============================================================================
 * 📦 Props定義 / Props Definition
 * ============================================================================
 *
 * TermsListProps
 * - terms: Term[] - 表示する語句データ配列
 * - categories: Category[] - カテゴリデータ配列
 * - onEditTerm: (term: Term) => void - 編集ボタンクリック時のコールバック
 * - onDeleteTerm: (id: string) => void - 削除ボタンクリック時のコールバック
 *
 * ============================================================================
 * 🔧 主要関数 / Main Functions
 * ============================================================================
 *
 * 1. handleSearchChange(e: ChangeEvent<HTMLInputElement>)
 *    - 日本語: 検索入力変更処理
 *    - English: Handle search input change
 *
 * 2. handleSortChange(e: ChangeEvent<HTMLSelectElement>)
 *    - 日本語: ソート方法変更処理
 *    - English: Handle sort method change
 *
 * 3. getFilteredAndSortedTerms(): Term[]
 *    - 日本語: フィルタリング＆ソート済みの語句リストを取得
 *    - English: Get filtered and sorted terms list
 *    - 検索クエリ、お気に入り、ソート順を適用
 *
 * 4. getCategoryInfo(categoryKey: string): Category | undefined
 *    - 日本語: カテゴリキーからカテゴリ情報を取得
 *    - English: Get category info from category key
 *
 * 5. renderRichText(text: string): JSX.Element
 *    - 日本語: リッチテキストをHTMLとしてレンダリング
 *    - English: Render rich text as HTML
 *    - 色、サイズなどのスタイル適用
 *
 * ============================================================================
 * 🎨 UI構成 / UI Structure
 * ============================================================================
 *
 * <div className="terms-list-container">
 *   ├── 検索バー
 *   ├── フィルタ・ソートコントロール
 *   │   ├── お気に入りフィルタチェックボックス
 *   │   └── ソート選択ドロップダウン
 *   └── 語句カードグリッド
 *       └── 各語句カード
 *           ├── カテゴリバッジ
 *           ├── 語句（Term）
 *           ├── 意味（Meaning）
 *           ├── 例文（Example）
 *           ├── 画像（Image）
 *           └── 編集・削除ボタン
 *
 * ============================================================================
 * 🔗 依存関係 / Dependencies
 * ============================================================================
 *
 * React:
 * - useState - 検索、フィルタ、ソート状態管理
 * - useMemo - パフォーマンス最適化（将来追加予定）
 *
 * 内部:
 * - types.ts: Term, Category
 *
 * ============================================================================
 *
 * @author Yusei Maekawa
 * @version 0.3.0
 * @since 2025-08-01
 * @updated 2025-11-02
 */

/**
 * @typedef {Object} Category
 * @property {number} id - カテゴリの一意の識別子
 * @property {string} category_key - カテゴリキー（データベース用）
 * @property {string} category_name - 表示用カテゴリ名
 * @property {string} category_icon - カテゴリアイコン（絵文字）
 * @property {string} category_color - カテゴリカラー（HEXコード）
 * @property {number|null} parent_id - 親カテゴリID（階層構造用）
 * @property {boolean} is_favorite - お気に入りフラグ
 * @property {number} display_order - 表示順序
 * @property {string} created_at - 作成日時
 * @property {string} [parent_name] - 親カテゴリ名（オプション）
 * @property {string} [parent_icon] - 親カテゴリアイコン（オプション）
 * @property {number} [child_count] - 子カテゴリ数（オプション）
 * @property {string} [breadcrumb] - 階層表示用パンくずリスト（オプション）
 * @property {Array<{id: number, name: string, icon: string, color: string}>} [path] - 階層パス（オプション）
 */

/**
 * @typedef {Object} TermsListProps
 * @property {Term[]} terms - 表示する語句データの配列
 * @property {Category[]} categories - カテゴリデータの配列
 * @property {(term: Term) => void} onEditTerm - 語句編集時のコールバック関数
 * @property {(id: number) => void} onDeleteTerm - 語句削除時のコールバック関数
 */

/**
 * @typedef {Object} ImageModalState
 * @property {boolean} isOpen - モーダルが開いているかどうか
 * @property {string} imageSrc - 表示する画像のソースURL
 */

import React, { useState, useEffect } from 'react';
import { Term } from '../types';
import { getCategoryName } from '../utils/helpers';

interface Category {
  id: number;
  category_key: string;
  category_name: string;
  category_icon: string;
  category_color: string;
  parent_id: number | null;
  is_favorite: boolean;
  display_order: number;
  created_at: string;
  parent_name?: string;
  parent_icon?: string;
  child_count?: number;
  breadcrumb?: string;
  path?: Array<{
    id: number;
    name: string;
    icon: string;
    color: string;
  }>;
}

interface TermsListProps {
  terms: Term[];
  categories: Category[];
  onEditTerm: (term: Term) => void;
  onDeleteTerm: (id: string) => void;
}

/**
 * 語句一覧表示コンポーネント
 *
 * 主な機能：
 * - 語句の一覧表示（グリッド形式）
 * - 検索機能（語句・意味・例文での検索）
 * - カテゴリフィルタリング
 * - 語句の編集・削除
 * - 詳細表示モーダル
 * - 画像クリック拡大機能
 * - 全画面表示モード
 *
 * @component
 * @param {TermsListProps} props - コンポーネントのプロパティ
 * @returns {JSX.Element} 語句一覧のJSX要素
 *
 * @example
 * ```tsx
 * <TermsList
 *   terms={terms}
 *   categories={categories}
 *   onEditTerm={handleEditTerm}
 *   onDeleteTerm={handleDeleteTerm}
 * />
 * ```
 */
const TermsList: React.FC<TermsListProps> = ({ terms, categories, onEditTerm, onDeleteTerm }) => {
  /**
   * 検索クエリの状態
   * @type {[string, React.Dispatch<React.SetStateAction<string>>]}
   */
  const [searchQuery, setSearchQuery] = useState('');

  /**
   * 詳細表示する語句の状態
   * @type {[Term | null, React.Dispatch<React.SetStateAction<Term | null>>]}
   */
  const [selectedTerm, setSelectedTerm] = useState<Term | null>(null);

  /**
   * 全画面表示モードの状態
   * @type {[boolean, React.Dispatch<React.SetStateAction<boolean>>]}
   */
  const [isFullScreen, setIsFullScreen] = useState(false);

  /**
   * 画像モーダルの状態
   * @type {[ImageModalState, React.Dispatch<React.SetStateAction<ImageModalState>>]}
   */
  const [imageModal, setImageModal] = useState<{ isOpen: boolean; imageSrc: string }>({ isOpen: false, imageSrc: '' });

  /**
   * 画像クリック時の処理
   * クリックされた画像をモーダルで拡大表示します
   *
   * @param {string} imageSrc - 拡大表示する画像のソースURL
   */
  const handleImageClick = (imageSrc: string) => {
    setImageModal({ isOpen: true, imageSrc });
  };

  /**
   * 画像モーダルを閉じる処理
   */
  const closeImageModal = () => {
    setImageModal({ isOpen: false, imageSrc: '' });
  };

  // 画像クリックイベントを処理
  useEffect(() => {
    const handleImageClick = (e: Event) => {
      const target = e.target as HTMLImageElement;
      if (target.classList.contains('uploaded-image')) {
        const imageSrc = target.getAttribute('data-image-src');
        if (imageSrc) {
          setImageModal({ isOpen: true, imageSrc });
        }
      }
    };

    document.addEventListener('click', handleImageClick);
    return () => {
      document.removeEventListener('click', handleImageClick);
    };
  }, []);

  // カテゴリ情報を取得する関数
  const getCategoryInfo = (categoryKey: string) => {
    const category = categories.find(cat => cat.category_key === categoryKey);
    return category || null;
  };

  // カテゴリの階層表示を取得する関数
  const getCategoryDisplay = (categoryKey: string) => {
    const category = getCategoryInfo(categoryKey);
    if (!category) {
      return { name: getCategoryName(categoryKey), color: '#6c757d', icon: '📝', breadcrumb: '' };
    }
    
    return {
      name: category.category_name,
      color: category.category_color,
      icon: category.category_icon,
      breadcrumb: category.breadcrumb || category.category_name
    };
  };

  // テキストから画像を抽出する関数
  const extractImages = (text: string): string[] => {
    if (!text) return [];
    const images: string[] = [];
    
    // マークダウン形式の画像を検出 ![任意](data:image/...)
    const markdownRegex = /!\[.*?\]\((data:image\/[^)]+)\)/g;
    let match;
    while ((match = markdownRegex.exec(text)) !== null) {
      images.push(match[1]);
    }
    
    // 直接のBase64データを検出（マークダウンでラップされていない場合）
    const base64Regex = /data:image\/[a-zA-Z0-9+\/;=,]+/g;
    const base64Matches = text.match(base64Regex);
    if (base64Matches) {
      base64Matches.forEach(imageData => {
        if (!images.includes(imageData)) {
          images.push(imageData);
        }
      });
    }
    
    console.log('TermsList extractImages:', { text: text.substring(0, 100), foundImages: images.length });
    return images;
  };


  const filteredTerms = terms.filter(term =>
    (term.term?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      term.meaning?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (term.example && term.example.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const handleDelete = (id: string, termName: string) => {
    if (window.confirm(`「${termName}」を削除してもよろしいですか？`)) {
      onDeleteTerm(id);
    }
  };

  const handleTermClick = (term: Term) => {
    setSelectedTerm(term);
  };

  const handleCloseDetail = () => {
    setSelectedTerm(null);
  };

  const handleToggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  // リッチテキストを安全にレンダリングする関数
  const renderRichText = (text: string, isModal: boolean = false) => {
    if (!text) return '';
    
    try {
      console.log('TermsList renderRichText:', { text: text.substring(0, 100), isModal, fullText: text });
      console.log('画像データ検索中...', { textLength: text.length, hasDataImage: text.includes('data:image') });
      
      let formattedText = text;
      
      // 既存のHTMLタグを完全に除去（HTMLが表示される問題を根本的に解決）
      formattedText = formattedText.replace(/<[^>]*>/g, '');
      
      // 改行文字を一時的に保護
      formattedText = formattedText.replace(/\n/g, '___NEWLINE___');
      
    // HTMLエンティティや残ったHTML断片も除去
    formattedText = formattedText
      .replace(/&lt;/g, '')
      .replace(/&gt;/g, '')
      .replace(/&quot;/g, '')
      .replace(/&amp;/g, '')
      .replace(/alt="[^"]*"/g, '')
      .replace(/class="[^"]*"/g, '')
      .replace(/style="[^"]*"/g, '')
      .replace(/src="[^"]*"/g, '')
      .replace(/\/>/g, '')
      .replace(/>\s*</g, '><')
      .replace(/alt="画像"\s*class="uploaded-image"\s*\/>/g, '')
      .replace(/alt="画像"\s*class="uploaded-image"/g, '')
      .replace(/class="uploaded-image"\s*\/>/g, '')
      .replace(/class="uploaded-image"/g, '')
      .replace(/📷/g, '') // 写真マーク（カメラ絵文字）を除去
      .replace(/📸/g, '') // カメラ絵文字を除去
      .replace(/🖼️/g, '') // 額縁絵文字を除去
      .replace(/🎨/g, '') // アート絵文字を除去
      .replace(/🖊️/g, '') // ペン絵文字を除去
      .replace(/✏️/g, '') // 鉛筆絵文字を除去
      .replace(/\[画像\]/g, '') // [画像]テキストを除去
      .replace(/\(画像\)/g, '') // (画像)テキストを除去
      .replace(/画像:/g, '') // 画像:テキストを除去
      .replace(/!\[画像\]/g, '') // マークダウンの画像記法 ![画像] を除去
      .replace(/!\[.*?\]/g, '') // 任意のマークダウン画像記法 ![任意] を除去
      .replace(/\(\s*data:image\/[a-zA-Z0-9+\/;=,]+\s*\)/g, '') // 画像URL部分も除去（念のため）
      .replace(/[ \t]+/g, ' ') // 複数のスペース・タブを1つにまとめる（改行は保護）
      .replace(/\s*\n\s*/g, '\n') // 改行周りの余分なスペースを除去
      .trim();
      
      // 保護された改行文字をHTMLの<br>タグに変換
      formattedText = formattedText.replace(/___NEWLINE___/g, '<br>');
      
      // マークダウン形式の画像を検出して変換 ![画像](data:image/...)
      formattedText = formattedText.replace(
        /!\[画像\]\((data:image\/[a-zA-Z0-9+\/;=,]+)\)/g, 
        (match, dataUrl) => {
          console.log('TermsList: マークダウン画像検出:', { match: match.substring(0, 50), dataUrl: dataUrl.substring(0, 50) });
          const imageId = `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          // マークダウンのテキスト部分を完全に除去し、画像だけを表示
          return `<div class="uploaded-image-container" style="display: block; margin: 8px 0;"><img src="${dataUrl}" alt="" class="uploaded-image" data-image-src="${dataUrl}" data-image-id="${imageId}" style="max-width: 100%; height: auto;" /></div>`;
        }
      );
      
      // 任意のマークダウン画像を検出 ![任意](data:image/...)
      formattedText = formattedText.replace(
        /!\[.*?\]\((data:image\/[a-zA-Z0-9+\/;=,]+)\)/g, 
        (match, dataUrl) => {
          console.log('TermsList: 任意マークダウン画像検出:', { match: match.substring(0, 50), dataUrl: dataUrl.substring(0, 50) });
          const imageId = `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          // マークダウンのテキスト部分を完全に除去し、画像だけを表示
          return `<div class="uploaded-image-container" style="display: block; margin: 8px 0;"><img src="${dataUrl}" alt="" class="uploaded-image" data-image-src="${dataUrl}" data-image-id="${imageId}" style="max-width: 100%; height: auto;" /></div>`;
        }
      );
      
      // 直接のBase64データを検出（マークダウンでラップされていない場合）
      formattedText = formattedText.replace(
        /data:image\/[a-zA-Z0-9+\/;=,]+/g,
        (match) => {
          console.log('TermsList: 直接Base64画像検出:', { match: match.substring(0, 50) });
          const imageId = `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          return `<div class="uploaded-image-container"><img src="${match}" alt="画像" class="uploaded-image" data-image-src="${match}" data-image-id="${imageId}" /></div>`;
        }
      );
      
      // HTML対応のタグ処理システム
      console.log('TermsList 変換前:', { text: formattedText.substring(0, 200) });
      
      // Step 1: 既存のHTMLタグを一時的にプレースホルダーに置き換え
      const htmlPlaceholders: { [key: string]: string } = {};
      let placeholderCounter = 0;
      
      // 既存のspanタグを保護（ES5互換の正規表現）
      formattedText = formattedText.replace(/<span[^>]*>[\s\S]*?<\/span>/g, (match) => {
        const placeholder = `__HTML_PLACEHOLDER_${placeholderCounter++}__`;
        htmlPlaceholders[placeholder] = match;
        console.log('HTML保護:', { placeholder, match: match.substring(0, 50) });
        return placeholder;
      });
      
      console.log('HTML保護後:', { text: formattedText.substring(0, 200) });
      
      // Step 2: 通常の書式処理（HTMLタグがない状態で）
      // 色指定記法をHTMLに変換
      formattedText = formattedText
        .replace(/\[red\](.*?)\[\/red\]/g, '<span style="color: #e74c3c; font-weight: 600;">$1</span>')
        .replace(/\[blue\](.*?)\[\/blue\]/g, '<span style="color: #3498db; font-weight: 600;">$1</span>')
        .replace(/\[green\](.*?)\[\/green\]/g, '<span style="color: #27ae60; font-weight: 600;">$1</span>')
        .replace(/\[orange\](.*?)\[\/orange\]/g, '<span style="color: #f39c12; font-weight: 600;">$1</span>')
        .replace(/\[purple\](.*?)\[\/purple\]/g, '<span style="color: #9b59b6; font-weight: 600;">$1</span>')
        .replace(/\[pink\](.*?)\[\/pink\]/g, '<span style="color: #e91e63; font-weight: 600;">$1</span>')
        .replace(/\[gray\](.*?)\[\/gray\]/g, '<span style="color: #95a5a6; font-weight: 600;">$1</span>');
      
      console.log('色変換後:', { text: formattedText.substring(0, 200) });
      
      // フォントサイズ記法をHTMLに変換
      formattedText = formattedText
        .replace(/\[xsmall\](.*?)\[\/xsmall\]/g, '<span style="font-size: 11px; line-height: 1.4;">$1</span>')
        .replace(/\[small\](.*?)\[\/small\]/g, '<span style="font-size: 13px; line-height: 1.4;">$1</span>')
        .replace(/\[normal\](.*?)\[\/normal\]/g, '<span style="font-size: 15px; line-height: 1.4;">$1</span>')
        .replace(/\[large\](.*?)\[\/large\]/g, '<span style="font-size: 18px; line-height: 1.4;">$1</span>')
        .replace(/\[xlarge\](.*?)\[\/xlarge\]/g, '<span style="font-size: 22px; line-height: 1.4;">$1</span>');
      
      console.log('フォントサイズ変換後:', { text: formattedText.substring(0, 200) });
      
      // Step 3: プレースホルダーを元のHTMLに復元
      Object.keys(htmlPlaceholders).forEach(placeholder => {
        formattedText = formattedText.replace(placeholder, htmlPlaceholders[placeholder]);
        console.log('HTML復元:', { placeholder, restored: htmlPlaceholders[placeholder].substring(0, 50) });
      });
      
      console.log('TermsList 最終結果:', { text: formattedText.substring(0, 200) });
      
      console.log('TermsList フォントサイズ変換後:', { formattedText: formattedText.substring(0, 300) });
      
      // マークダウン風記法をHTMLに変換
      formattedText = formattedText
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // **太字**
        .replace(/\*(.*?)\*/g, '<em>$1</em>') // *斜体*
        .replace(/`(.*?)`/g, '<code>$1</code>') // `コード`
        .replace(/~~(.*?)~~/g, '<del>$1</del>'); // ~~取り消し線~~
      
      console.log('TermsList renderRichText result:', { original: text.substring(0, 50), formatted: formattedText.substring(0, 200) });
      return formattedText;
    } catch (error) {
      console.error('TermsList renderRichText error:', error);
      return text.replace(/\n/g, '<br>');
    }
  };

  return (
    <section className={`section ${isFullScreen ? 'fullscreen' : ''}`}>
      <div className="terms-list-header">
        <h2>語句一覧</h2>
        <button 
          className="fullscreen-toggle-btn"
          onClick={handleToggleFullScreen}
          title={isFullScreen ? '通常表示に戻る' : '全画面表示'}
        >
          {isFullScreen ? '🗗' : '🗖'}
        </button>
      </div>
      <div className="search-controls">
        <input
          type="text"
          placeholder="語句を検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <span className="term-count">{filteredTerms.length}個の語句</span>
      </div>

      {filteredTerms.length === 0 ? (
        <div className="text-center" style={{ padding: '40px' }}>
          <p style={{ fontSize: '1.2rem', color: '#666' }}>
            {searchQuery ? '該当する語句がありません。' : '語句がありません。まず語句を追加してください。'}
          </p>
        </div>
      ) : (
        <div className="terms-grid">
          {filteredTerms.map(term => {
            const categoryDisplay = getCategoryDisplay(term.category);
            const images = extractImages(term.meaning + ' ' + (term.example || ''));
            return (
              <div key={term.id} className="term-card" onClick={() => handleTermClick(term)}>
                <div className="term-card-header">
                  <h4 className="term-title">{term.term}</h4>
                  <div className="category-info">
                    <span 
                      className="category-badge-new"
                      style={{ backgroundColor: categoryDisplay.color }}
                      title={categoryDisplay.breadcrumb}
                    >
                      {categoryDisplay.icon} {categoryDisplay.name}
                    </span>
                    {categoryDisplay.breadcrumb !== categoryDisplay.name && (
                      <small className="category-breadcrumb">
                        {categoryDisplay.breadcrumb}
                      </small>
                    )}
                  </div>
                </div>
                {/* 画像表示セクション */}
                {images.length > 0 && (
                  <div className="term-card-images">
                    {images.slice(0, 3).map((imageUrl, index) => (
                      <div key={index} className="uploaded-image-container">
                        <img src={imageUrl} alt={`画像 ${index + 1}`} className="uploaded-image" />
                      </div>
                    ))}
                    {images.length > 3 && (
                      <span className="more-images-indicator">+{images.length - 3} more</span>
                    )}
                  </div>
                )}
              <div className="term-card-content">
                <div 
                  className="term-meaning-preview"
                  dangerouslySetInnerHTML={{ 
                    __html: (() => {
                      const meaningText = term.meaning || '';
                      // 最初に書式を適用してからHTMLの長さで切り詰める
                      const formattedHtml = renderRichText(meaningText);
                      // HTMLの場合は単純な文字数カットではなく、適切に処理
                      if (formattedHtml.length > 400) { // HTMLタグ分を考慮して400文字
                        // HTMLタグを保持しながら適切に切り詰める
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = formattedHtml;
                        const textContent = tempDiv.textContent || tempDiv.innerText || '';
                        if (textContent.length > 200) {
                          // プレーンテキストが200文字以上の場合のみ切り詰める
                          return renderRichText(meaningText.substring(0, 150)) + '...';
                        }
                      }
                      return formattedHtml;
                    })()
                  }}
                />
              </div>
              <div className="term-card-actions" onClick={(e) => e.stopPropagation()}>
                <button 
                  className="btn btn-success btn-sm"
                  onClick={() => onEditTerm(term)}
                >
                  編集
                </button>
                <button 
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(term.id, term.term)}
                >
                  削除
                </button>
              </div>
            </div>
            );
          })}
        </div>
      )}

      {/* 詳細モーダル */}
      {selectedTerm && (
        <div className="modal-overlay" onClick={handleCloseDetail}>
          <div className="modal-content term-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedTerm.term}</h3>
              <div className="category-info">
                {(() => {
                  const categoryDisplay = getCategoryDisplay(selectedTerm.category);
                  return (
                    <>
                      <span 
                        className="category-badge-new"
                        style={{ backgroundColor: categoryDisplay.color }}
                        title={categoryDisplay.breadcrumb}
                      >
                        {categoryDisplay.icon} {categoryDisplay.name}
                      </span>
                      {categoryDisplay.breadcrumb !== categoryDisplay.name && (
                        <small className="category-breadcrumb">
                          {categoryDisplay.breadcrumb}
                        </small>
                      )}
                    </>
                  );
                })()}
              </div>
              <button className="modal-close" onClick={handleCloseDetail}>×</button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h4>意味・説明</h4>
                <div 
                  className="rich-text-content"
                  dangerouslySetInnerHTML={{ __html: renderRichText(selectedTerm.meaning || '', true) }}
                />
              </div>
              {selectedTerm.example && (
                <div className="detail-section">
                  <h4>例文・使用例・スクショ等</h4>
                  <div 
                    className="rich-text-content"
                    dangerouslySetInnerHTML={{ __html: renderRichText(selectedTerm.example, true) }}
                  />
                </div>
              )}
              {selectedTerm.createdAt && (
                <div className="detail-section">
                  <h4>追加日時</h4>
                  <p>{new Date(selectedTerm.createdAt).toLocaleString()}</p>
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button 
                className="btn btn-success"
                onClick={() => {
                  onEditTerm(selectedTerm);
                  handleCloseDetail();
                }}
              >
                編集
              </button>
              <button 
                className="btn btn-danger"
                onClick={() => {
                  handleDelete(selectedTerm.id, selectedTerm.term);
                  handleCloseDetail();
                }}
              >
                削除
              </button>
              <button className="btn btn-secondary" onClick={handleCloseDetail}>
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 画像モーダル */}
      {imageModal.isOpen && (
        <div className="image-modal" onClick={closeImageModal}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="image-modal-close" onClick={closeImageModal}>
              ×
            </button>
            <img src={imageModal.imageSrc} alt="拡大画像" />
          </div>
        </div>
      )}
    </section>
  );
};

export default TermsList;
