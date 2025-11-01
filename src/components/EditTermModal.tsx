/**
 * @fileoverview 語句編集モーダルコンポーネント
 *
 * このコンポーネントは、既存の語句を編集するためのモーダルダイアログを提供します。
 * 編集フォームと画像管理機能を備えています。
 *
 * @author Yusei Maekawa
 * @version 1.0.0
 * @since 2025-08-01
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
 * @typedef {Object} EditTermModalProps
 * @property {Term | null} term - 編集対象の語句データ
 * @property {boolean} isOpen - モーダルが開いているかどうか
 * @property {Category[]} categories - カテゴリデータの配列
 * @property {() => void} onClose - モーダルを閉じるコールバック関数
 * @property {(id: number, termData: Omit<Term, 'id' | 'createdAt'>) => void} onSave - 保存時のコールバック関数
 */

/**
 * @typedef {Object} FormData
 * @property {Term['category']} category - 選択されたカテゴリ
 * @property {string} term - 語句（英単語など）
 * @property {string} meaning - 語句の意味・説明
 * @property {string} example - 使用例・例文
 */

import React, { useState, useEffect } from 'react';
import { Term } from '../types';

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

interface EditTermModalProps {
  term: Term | null;
  isOpen: boolean;
  categories: Category[];
  onClose: () => void;
  onSave: (id: string, termData: Omit<Term, 'id' | 'createdAt'>) => void;
}

/**
 * 語句編集モーダルコンポーネント
 *
 * 主な機能：
 * - 既存語句の編集フォーム
 * - カテゴリの変更
 * - リッチテキスト入力（マークダウン記法対応）
 * - 画像貼り付け機能（Ctrl+V）
 * - リアルタイムバリデーション
 * - 変更の保存・キャンセル
 *
 * @component
 * @param {EditTermModalProps} props - コンポーネントのプロパティ
 * @returns {JSX.Element} 編集モーダルのJSX要素
 *
 * @example
 * ```tsx
 * <EditTermModal
 *   term={selectedTerm}
 *   isOpen={isModalOpen}
 *   categories={categories}
 *   onClose={handleCloseModal}
 *   onSave={handleSaveTerm}
 * />
 * ```
 */
const EditTermModal: React.FC<EditTermModalProps> = ({ term, isOpen, categories, onClose, onSave }) => {
  /**
   * フォームデータの状態
   * @type {[FormData, React.Dispatch<React.SetStateAction<FormData>>]}
   */
  const [formData, setFormData] = useState({
    category: 'english' as Term['category'],
    term: '',
    meaning: '',
    example: ''
  });

  /**
   * リッチテキストヘルプ表示の状態
   * @type {[boolean, React.Dispatch<React.SetStateAction<boolean>>]}
   */
  const [showRichTextHelp, setShowRichTextHelp] = useState(false);

  /**
   * アップロードされた画像の状態
   * @type {[string[], React.Dispatch<React.SetStateAction<string[]>>]}
   */
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  /**
   * termプロパティが変更されたらフォームデータを更新
   * 編集対象の語句が変更された場合にフォームを初期化する
   */
  useEffect(() => {
    if (term) {
      setFormData({
        category: term.category,
        term: term.term,
        meaning: term.meaning,
        example: term.example || ''
      });
      
      // 既存の画像を抽出
      const existingImages: string[] = [];
      const imageMatches = (term.example || '').match(/!\[画像\]\((data:image\/[^)]+)\)/g);
      if (imageMatches) {
        imageMatches.forEach(match => {
          const srcMatch = match.match(/!\[画像\]\((data:image\/[^)]+)\)/);
          if (srcMatch && srcMatch[1]) {
            existingImages.push(srcMatch[1]);
          }
        });
      }
      setUploadedImages(existingImages);
    }
  }, [term]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // undefined チェックを追加してエラーを防ぐ
    const termValue = formData.term || '';
    const meaningValue = formData.meaning || '';
    const exampleValue = formData.example || '';
    
    if (!termValue.trim() || !meaningValue.trim()) {
      alert('用語と意味は必須項目です。');
      return;
    }

    if (term) {
      onSave(term.id, {
        category: formData.category,
        term: termValue.trim(),
        meaning: meaningValue.trim(),
        example: exampleValue.trim() || undefined
      });
      onClose();
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // 画像ファイルを処理する関数
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setUploadedImages(prev => [...prev, result]);
          
          // 画像をexampleフィールドに追加
          const imageMarkdown = `\n![画像](${result})\n`;
          setFormData(prev => ({ 
            ...prev, 
            example: prev.example + imageMarkdown 
          }));
        };
        reader.readAsDataURL(file);
      }
    });
  };

  // 画像を削除する関数
  const removeImage = (imageIndex: number) => {
    const imageToRemove = uploadedImages[imageIndex];
    setUploadedImages(prev => prev.filter((_, index) => index !== imageIndex));
    
    // exampleフィールドからも画像を削除
    const imageMarkdown = `![画像](${imageToRemove})`;
    setFormData(prev => ({
      ...prev,
      example: prev.example.replace(imageMarkdown, '').replace(/\n\n+/g, '\n\n').trim()
    }));
  };

  // リッチテキストを安全にレンダリングする関数（TermsListと同じ）
  const renderRichText = (text: string, isModal: boolean = false) => {
    if (!text) return '';
    
    try {
      console.log('EditTermModal renderRichText:', { text: text.substring(0, 100), isModal });
      
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
      .replace(/[ \t]+/g, ' ') // 複数のスペース・タブを1つにまとめる（改行は保護）
      .trim();
      
      // 保護された改行文字をHTMLの<br>タグに変換
      formattedText = formattedText.replace(/___NEWLINE___/g, '<br>');      // 改行をHTMLの<br>タグに変換
      formattedText = formattedText.replace(/\n/g, '<br>');
      
      // マークダウン形式の画像を検出して変換 ![画像](data:image/...)
      formattedText = formattedText.replace(
        /!\[画像\]\((data:image\/[a-zA-Z0-9+\/;=,]+)\)/g, 
        (match, dataUrl) => {
          console.log('EditTermModal: マークダウン画像検出:', { match: match.substring(0, 50), dataUrl: dataUrl.substring(0, 50) });
          return `<div class="uploaded-image-container"><img src="${dataUrl}" alt="画像" class="uploaded-image" /></div>`;
        }
      );
      
      // 任意のマークダウン画像を検出 ![任意](data:image/...)
      formattedText = formattedText.replace(
        /!\[.*?\]\((data:image\/[a-zA-Z0-9+\/;=,]+)\)/g, 
        (match, dataUrl) => {
          console.log('EditTermModal: 任意マークダウン画像検出:', { match: match.substring(0, 50), dataUrl: dataUrl.substring(0, 50) });
          return `<div class="uploaded-image-container"><img src="${dataUrl}" alt="画像" class="uploaded-image" /></div>`;
        }
      );
      
      // 直接のBase64データを検出（マークダウンでラップされていない場合）
      formattedText = formattedText.replace(
        /data:image\/[a-zA-Z0-9+\/;=,]+/g,
        (match) => {
          console.log('EditTermModal: 直接Base64画像検出:', { match: match.substring(0, 50) });
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
      
      // フォントサイズ記法をHTMLに変換
      formattedText = formattedText
        .replace(/\[xsmall\](.*?)\[\/xsmall\]/g, '<span style="font-size: 0.7em;">$1</span>') // 極小サイズ
        .replace(/\[small\](.*?)\[\/small\]/g, '<span style="font-size: 0.85em;">$1</span>') // 小サイズ
        .replace(/\[normal\](.*?)\[\/normal\]/g, '<span style="font-size: 1em;">$1</span>') // 標準サイズ
        .replace(/\[large\](.*?)\[\/large\]/g, '<span style="font-size: 1.2em;">$1</span>') // 大サイズ
        .replace(/\[xlarge\](.*?)\[\/xlarge\]/g, '<span style="font-size: 1.5em;">$1</span>'); // 極大サイズ
      
      // マークダウン風記法をHTMLに変換
      formattedText = formattedText
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // **太字**
        .replace(/\*(.*?)\*/g, '<em>$1</em>') // *斜体*
        .replace(/`(.*?)`/g, '<code>$1</code>') // `コード`
        .replace(/~~(.*?)~~/g, '<del>$1</del>'); // ~~取り消し線~~
      
      return formattedText;
    } catch (error) {
      console.error('EditTermModal renderRichText error:', error);
      return text.replace(/\n/g, '<br>');
    }
  };

  // テキストエリアに記法を適用する関数
  const applyFormat = (field: 'meaning' | 'example', format: string) => {
    const textarea = document.getElementById(field === 'meaning' ? 'editMeaning' : 'editExample') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    if (selectedText.length === 0) {
      alert('テキストを選択してからボタンをクリックしてください。');
      return;
    }

    let formattedText = '';
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'code':
        formattedText = `\`${selectedText}\``;
        break;
      case 'strike':
        formattedText = `~~${selectedText}~~`;
        break;
      case 'red':
        formattedText = `[red]${selectedText}[/red]`;
        break;
      case 'blue':
        formattedText = `[blue]${selectedText}[/blue]`;
        break;
      case 'green':
        formattedText = `[green]${selectedText}[/green]`;
        break;
      case 'orange':
        formattedText = `[orange]${selectedText}[/orange]`;
        break;
      case 'purple':
        formattedText = `[purple]${selectedText}[/purple]`;
        break;
      case 'pink':
        formattedText = `[pink]${selectedText}[/pink]`;
        break;
      case 'xsmall':
        formattedText = `[xsmall]${selectedText}[/xsmall]`;
        break;
      case 'small':
        formattedText = `[small]${selectedText}[/small]`;
        break;
      case 'normal':
        formattedText = `[normal]${selectedText}[/normal]`;
        break;
      case 'large':
        formattedText = `[large]${selectedText}[/large]`;
        break;
      case 'xlarge':
        formattedText = `[xlarge]${selectedText}[/xlarge]`;
        break;
      default:
        formattedText = selectedText;
    }

    const currentValue = formData[field];
    const newValue = currentValue.substring(0, start) + formattedText + currentValue.substring(end);
    handleInputChange(field, newValue);
    
    // フォーカスを戻して新しい位置にカーソルを設定
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + formattedText.length);
    }, 0);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen || !term) return null;

  return (
    <div className="modal" onClick={handleBackdropClick}>
      <div className="modal-content">
        <span className="close" onClick={onClose}>&times;</span>
        <h3>語句を編集</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="editCategory">カテゴリ:</label>
            <select
              id="editCategory"
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              required
            >
              <option value="">カテゴリを選択</option>
              {categories.map(category => (
                <option key={category.id} value={category.category_key}>
                  {category.category_icon} {category.category_name}
                  {category.breadcrumb && category.breadcrumb !== category.category_name && 
                    ` (${category.breadcrumb})`}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="editTerm">用語:</label>
            <input
              type="text"
              id="editTerm"
              value={formData.term}
              onChange={(e) => handleInputChange('term', e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="editMeaning">意味・説明:</label>
            <div className="rich-text-info">
              <button 
                type="button" 
                className="help-button"
                onClick={() => setShowRichTextHelp(!showRichTextHelp)}
              >
                💡 書式設定ヘルプ
              </button>
              {showRichTextHelp && (
                <div className="rich-text-help">
                  <p><strong>使用可能な書式:</strong></p>
                  <ul>
                    <li><code>**太字**</code> → <strong>太字</strong></li>
                    <li><code>*斜体*</code> → <em>斜体</em></li>
                    <li><code>`コード`</code> → <code>コード</code></li>
                    <li><code>~~取り消し~~</code> → <del>取り消し</del></li>
                    <li><code>[small]小さい[/small]</code> → <span style={{fontSize: '0.8em'}}>小さい</span></li>
                    <li><code>[large]大きい[/large]</code> → <span style={{fontSize: '1.2em', fontWeight: 600}}>大きい</span></li>
                    <li><code>[xlarge]特大[/xlarge]</code> → <span style={{fontSize: '1.5em', fontWeight: 600}}>特大</span></li>
                    <li><code>[red]赤色[/red]</code> → <span style={{color: '#e74c3c', fontWeight: 600}}>赤色</span></li>
                    <li><code>[blue]青色[/blue]</code> → <span style={{color: '#3498db', fontWeight: 600}}>青色</span></li>
                    <li><code>[green]緑色[/green]</code> → <span style={{color: '#27ae60', fontWeight: 600}}>緑色</span></li>
                    <li><code>[orange]オレンジ[/orange]</code> → <span style={{color: '#f39c12', fontWeight: 600}}>オレンジ</span></li>
                    <li><code>[purple]紫色[/purple]</code> → <span style={{color: '#9b59b6', fontWeight: 600}}>紫色</span></li>
                    <li><code>[pink]ピンク[/pink]</code> → <span style={{color: '#e91e63', fontWeight: 600}}>ピンク</span></li>
                    <li>改行はそのまま反映されます</li>
                  </ul>
                </div>
              )}
            </div>
            <div className="rich-text-toolbar">
              <div className="toolbar-section">
                <span className="toolbar-label">書式:</span>
                <button type="button" className="format-btn" onClick={() => applyFormat('meaning', 'bold')} title="太字">
                  <strong>B</strong>
                </button>
                <button type="button" className="format-btn" onClick={() => applyFormat('meaning', 'italic')} title="斜体">
                  <em>I</em>
                </button>
                <button type="button" className="format-btn" onClick={() => applyFormat('meaning', 'code')} title="コード">
                  <code>C</code>
                </button>
                <button type="button" className="format-btn" onClick={() => applyFormat('meaning', 'strike')} title="取り消し線">
                  <del>S</del>
                </button>
              </div>
              <div className="toolbar-section">
                <span className="toolbar-label">色:</span>
                <button type="button" className="color-btn red" onClick={() => applyFormat('meaning', 'red')} title="赤色">赤</button>
                <button type="button" className="color-btn blue" onClick={() => applyFormat('meaning', 'blue')} title="青色">青</button>
                <button type="button" className="color-btn green" onClick={() => applyFormat('meaning', 'green')} title="緑色">緑</button>
                <button type="button" className="color-btn orange" onClick={() => applyFormat('meaning', 'orange')} title="オレンジ">橙</button>
                <button type="button" className="color-btn purple" onClick={() => applyFormat('meaning', 'purple')} title="紫色">紫</button>
                <button type="button" className="color-btn pink" onClick={() => applyFormat('meaning', 'pink')} title="ピンク">桃</button>
              </div>
              <div className="toolbar-section">
                <span className="toolbar-label">サイズ:</span>
                <button type="button" className="size-btn" onClick={() => applyFormat('meaning', 'xsmall')} title="極小">極小</button>
                <button type="button" className="size-btn" onClick={() => applyFormat('meaning', 'small')} title="小">小</button>
                <button type="button" className="size-btn" onClick={() => applyFormat('meaning', 'normal')} title="標準">標準</button>
                <button type="button" className="size-btn" onClick={() => applyFormat('meaning', 'large')} title="大">大</button>
                <button type="button" className="size-btn" onClick={() => applyFormat('meaning', 'xlarge')} title="極大">極大</button>
              </div>
            </div>
            <textarea
              id="editMeaning"
              value={formData.meaning}
              onChange={(e) => handleInputChange('meaning', e.target.value)}
              placeholder="**重要**な概念です。`コード`や*斜体*も使えます。&#10;改行も反映されます。"
              rows={6}
              required
            />
            <div className="preview-section">
              <h4>プレビュー:</h4>
              <div 
                className="rich-text-preview"
                dangerouslySetInnerHTML={{ __html: renderRichText(formData.meaning) }}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="editExample">例文・使用例・スクショ等:</label>
            <div className="rich-text-toolbar">
              <div className="toolbar-section">
                <span className="toolbar-label">書式:</span>
                <button type="button" className="format-btn" onClick={() => applyFormat('example', 'bold')} title="太字">
                  <strong>B</strong>
                </button>
                <button type="button" className="format-btn" onClick={() => applyFormat('example', 'italic')} title="斜体">
                  <em>I</em>
                </button>
                <button type="button" className="format-btn" onClick={() => applyFormat('example', 'code')} title="コード">
                  <code>C</code>
                </button>
                <button type="button" className="format-btn" onClick={() => applyFormat('example', 'strike')} title="取り消し線">
                  <del>S</del>
                </button>
              </div>
              <div className="toolbar-section">
                <span className="toolbar-label">色:</span>
                <button type="button" className="color-btn red" onClick={() => applyFormat('example', 'red')} title="赤色">赤</button>
                <button type="button" className="color-btn blue" onClick={() => applyFormat('example', 'blue')} title="青色">青</button>
                <button type="button" className="color-btn green" onClick={() => applyFormat('example', 'green')} title="緑色">緑</button>
                <button type="button" className="color-btn orange" onClick={() => applyFormat('example', 'orange')} title="オレンジ">橙</button>
                <button type="button" className="color-btn purple" onClick={() => applyFormat('example', 'purple')} title="紫色">紫</button>
                <button type="button" className="color-btn pink" onClick={() => applyFormat('example', 'pink')} title="ピンク">桃</button>
              </div>
              <div className="toolbar-section">
                <span className="toolbar-label">サイズ:</span>
                <button type="button" className="size-btn" onClick={() => applyFormat('example', 'xsmall')} title="極小">極小</button>
                <button type="button" className="size-btn" onClick={() => applyFormat('example', 'small')} title="小">小</button>
                <button type="button" className="size-btn" onClick={() => applyFormat('example', 'normal')} title="標準">標準</button>
                <button type="button" className="size-btn" onClick={() => applyFormat('example', 'large')} title="大">大</button>
                <button type="button" className="size-btn" onClick={() => applyFormat('example', 'xlarge')} title="極大">極大</button>
              </div>
              <div className="toolbar-section">
                <span className="toolbar-label">画像:</span>
                <input
                  type="file"
                  id="editImageUpload"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  className="format-btn"
                  onClick={() => document.getElementById('editImageUpload')?.click()}
                  title="画像を追加"
                >
                  📷 画像追加
                </button>
              </div>
            </div>
            {uploadedImages.length > 0 && (
              <div className="uploaded-images-preview">
                <h4>アップロード済み画像:</h4>
                <div className="image-preview-grid">
                  {uploadedImages.map((imageBase64, index) => (
                    <div key={index} className="image-preview-item">
                      <img src={imageBase64} alt={`アップロード画像 ${index + 1}`} />
                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={() => removeImage(index)}
                        title="画像を削除"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <textarea
              id="editExample"
              value={formData.example}
              onChange={(e) => handleInputChange('example', e.target.value)}
              placeholder="例文やコードサンプルなど。&#10;**太字**や`コード`も使えます。"
              rows={4}
            />
            {formData.example && (
              <div className="preview-section">
                <h4>プレビュー:</h4>
                <div 
                  className="rich-text-preview"
                  dangerouslySetInnerHTML={{ __html: renderRichText(formData.example) }}
                />
              </div>
            )}
          </div>
          
          <div className="form-actions">
            <button type="submit" className="btn">更新</button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              キャンセル
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTermModal;
