
import React, { useState } from 'react';
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
  onDeleteTerm: (id: number) => void;
}


const TermsList: React.FC<TermsListProps> = ({ terms, categories, onEditTerm, onDeleteTerm }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTerm, setSelectedTerm] = useState<Term | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

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

  const handleDelete = (id: number, termName: string) => {
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
      
      let formattedText = text;
      
      // 既存のHTMLタグを完全に除去（HTMLが表示される問題を根本的に解決）
      formattedText = formattedText.replace(/<[^>]*>/g, '');
      
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
      .replace(/\s+/g, ' ') // 複数の空白を1つにまとめる
      .trim();      // 改行をHTMLの<br>タグに変換
      formattedText = formattedText.replace(/\n/g, '<br>');
      
      // マークダウン形式の画像を検出して変換 ![画像](data:image/...)
      formattedText = formattedText.replace(
        /!\[画像\]\((data:image\/[a-zA-Z0-9+\/;=,]+)\)/g, 
        (match, dataUrl) => {
          console.log('TermsList: マークダウン画像検出:', { match: match.substring(0, 50), dataUrl: dataUrl.substring(0, 50) });
          return `<div class="uploaded-image-container"><img src="${dataUrl}" alt="画像" class="uploaded-image" /></div>`;
        }
      );
      
      // 任意のマークダウン画像を検出 ![任意](data:image/...)
      formattedText = formattedText.replace(
        /!\[.*?\]\((data:image\/[a-zA-Z0-9+\/;=,]+)\)/g, 
        (match, dataUrl) => {
          console.log('TermsList: 任意マークダウン画像検出:', { match: match.substring(0, 50), dataUrl: dataUrl.substring(0, 50) });
          return `<div class="uploaded-image-container"><img src="${dataUrl}" alt="画像" class="uploaded-image" /></div>`;
        }
      );
      
      // 直接のBase64データを検出（マークダウンでラップされていない場合）
      formattedText = formattedText.replace(
        /data:image\/[a-zA-Z0-9+\/;=,]+/g,
        (match) => {
          console.log('TermsList: 直接Base64画像検出:', { match: match.substring(0, 50) });
          return `<div class="uploaded-image-container"><img src="${match}" alt="画像" class="uploaded-image" /></div>`;
        }
      );
      
      // 色指定記法をHTMLに変換 - [red]テキスト[/red] 形式
      formattedText = formattedText
        .replace(/\[red\](.*?)\[\/red\]/g, '<span style="color: #e74c3c; font-weight: 600;">$1</span>') // 赤色
        .replace(/\[blue\](.*?)\[\/blue\]/g, '<span style="color: #3498db; font-weight: 600;">$1</span>') // 青色
        .replace(/\[green\](.*?)\[\/green\]/g, '<span style="color: #27ae60; font-weight: 600;">$1</span>') // 緑色
        .replace(/\[orange\](.*?)\[\/orange\]/g, '<span style="color: #f39c12; font-weight: 600;">$1</span>') // オレンジ色
        .replace(/\[purple\](.*?)\[\/purple\]/g, '<span style="color: #9b59b6; font-weight: 600;">$1</span>') // 紫色
        .replace(/\[pink\](.*?)\[\/pink\]/g, '<span style="color: #e91e63; font-weight: 600;">$1</span>') // ピンク色
        .replace(/\[gray\](.*?)\[\/gray\]/g, '<span style="color: #95a5a6; font-weight: 600;">$1</span>'); // グレー色
      
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
                      // 元のテキストが200文字以上の場合は切り詰めてから書式を適用
                      if (meaningText.length > 200) {
                        return renderRichText(meaningText.substring(0, 200) + '...');
                      }
                      return renderRichText(meaningText);
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
    </section>
  );
};

export default TermsList;
