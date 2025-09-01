/**
 * @fileoverview 語句追加フォームコンポーネント
 *
 * このコンポーネントは、新しい語句を追加するためのフォームを提供します。
 * リッチテキスト入力、画像貼り付け、カテゴリ選択機能を備えています。
 *
 * @author Yusei Maekawa
 * @version 1.0.0
 * @since 2025-08-01
 */

/**
 * @typedef {Object} Category
 * @property {number} id - カテゴリの一意の識別子
 * @property {string} key - カテゴリキー（データベース用）
 * @property {string} name - 表示用カテゴリ名
 * @property {string} color - カテゴリカラー（HEXコード）
 * @property {string} icon - カテゴリアイコン（絵文字）
 * @property {number|null} parent_id - 親カテゴリID（階層構造用）
 * @property {boolean} is_favorite - お気に入りフラグ
 * @property {number} display_order - 表示順序
 * @property {string} [breadcrumb] - 階層表示用パンくずリスト（オプション）
 * @property {Array<{id: number, name: string, icon: string, color: string}>} [path] - 階層パス（オプション）
 */

/**
 * @typedef {Object} AddTermFormProps
 * @property {(termData: Omit<Term, 'id' | 'createdAt'>) => void} onAddTerm - 語句追加時のコールバック関数
 * @property {string} [activeCategory] - 現在選択されているカテゴリ（オプション）
 * @property {Category[]} categories - カテゴリデータの配列
 */

/**
 * @typedef {Object} FormData
 * @property {string} category - 選択されたカテゴリキー
 * @property {string} term - 語句（英単語など）
 * @property {string} meaning - 語句の意味・説明
 * @property {string} example - 使用例・例文
 */

import React, { useState, useEffect } from 'react';
import { Term } from '../types';

interface Category {
  id: number;
  key: string;
  name: string;
  color: string;
  icon: string;
  parent_id: number | null;
  is_favorite: boolean;
  display_order: number;
  breadcrumb?: string;
  path?: Array<{
    id: number;
    name: string;
    icon: string;
    color: string;
  }>;
}

interface AddTermFormProps {
  onAddTerm: (termData: Omit<Term, 'id' | 'createdAt'>) => void;
  activeCategory?: string;
  categories: Category[];
}

/**
 * 語句追加フォームコンポーネント
 *
 * 主な機能：
 * - 語句・意味・例文の入力
 * - カテゴリ選択
 * - リッチテキスト入力（マークダウン記法対応）
 * - 画像貼り付け機能（Ctrl+V）
 * - リアルタイムバリデーション
 * - ヘルプ表示機能
 *
 * @component
 * @param {AddTermFormProps} props - コンポーネントのプロパティ
 * @returns {JSX.Element} 語句追加フォームのJSX要素
 *
 * @example
 * ```tsx
 * <AddTermForm
 *   onAddTerm={handleAddTerm}
 *   activeCategory="programming"
 *   categories={categories}
 * />
 * ```
 */
const AddTermForm: React.FC<AddTermFormProps> = ({ onAddTerm, activeCategory, categories }) => {
  /**
   * フォームデータの状態
   * @type {[FormData, React.Dispatch<React.SetStateAction<FormData>>]}
   */
  const [formData, setFormData] = useState({
    category: activeCategory && activeCategory !== 'all' ? activeCategory : (categories.length > 0 ? categories[0].key : 'english'),
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
   * activeCategoryが変更されたらカテゴリも自動で変更
   * 親コンポーネントから渡されたカテゴリが変更された場合に同期する
   */
  useEffect(() => {
    if (activeCategory && activeCategory !== 'all') {
      setFormData(prev => ({ ...prev, category: activeCategory }));
    }
  }, [activeCategory]);

  /**
   * カテゴリ一覧が変わったら、選択肢も更新
   * 選択中のカテゴリが削除された場合のフォールバック処理
   */
  useEffect(() => {
    if (!categories.some(c => c.key === formData.category)) {
      setFormData(prev => ({ ...prev, category: categories.length > 0 ? categories[0].key : 'english' }));
    }
  }, [categories]);

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

    onAddTerm({
      category: formData.category,
      term: termValue.trim(),
      meaning: meaningValue.trim(),
      example: exampleValue.trim() || undefined
    });

    // フォームリセット（カテゴリはactiveCategoryで固定）
    setFormData({
      category: activeCategory && activeCategory !== 'all' ? activeCategory : (categories.length > 0 ? categories[0].key : 'english'),
      term: '',
      meaning: '',
      example: ''
    });
    setUploadedImages([]); // 画像もクリア
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
  const renderRichText = (text: string) => {
    if (!text) return '';
    
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
    formattedText = formattedText.replace(/___NEWLINE___/g, '<br>');
    
    // 改行をHTMLの<br>タグに変換
    formattedText = formattedText.replace(/\n/g, '<br>');
    
    // 画像表示記法を変換 ![画像](data:image/...)
    formattedText = formattedText.replace(
      /!\[画像\]\((data:image\/[^)]+)\)/g, 
      '<div class="uploaded-image-container"><img src="$1" alt="画像" class="uploaded-image" /></div>'
    );
    
    // 任意のマークダウン画像を検出 ![任意](data:image/...)
    formattedText = formattedText.replace(
      /!\[.*?\]\((data:image\/[^)]+)\)/g, 
      '<div class="uploaded-image-container"><img src="$1" alt="画像" class="uploaded-image" /></div>'
    );
    
    // 直接のBase64データを検出
    formattedText = formattedText.replace(
      /data:image\/[a-zA-Z0-9+\/;=,]+/g,
      (match) => `<div class="uploaded-image-container"><img src="${match}" alt="画像" class="uploaded-image" /></div>`
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
    
    return formattedText;
  };

  // テキストエリアに記法を適用する関数
  const applyFormat = (field: 'meaning' | 'example', format: string) => {
    const textarea = document.getElementById(field) as HTMLTextAreaElement;
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
      default:
        formattedText = selectedText;
    }

    const newValue = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
    handleInputChange(field, newValue);
    
    // フォーカスを戻して新しい位置にカーソルを設定
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + formattedText.length);
    }, 0);
  };

  return (
    <section className="section">
      <h2>新しい語句を追加</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="category">選択中のカテゴリ:</label>
          <div className="selected-category-display">
            {(() => {
              const selectedCat = categories.find(c => c.key === formData.category);
              return selectedCat ? (
                <div className="current-category-info">
                  <div className="category-badge" style={{backgroundColor: selectedCat.color}}>
                    {selectedCat.icon} {selectedCat.name}
                  </div>
                  <div className="breadcrumb-display">
                    <span className="breadcrumb-label">階層:</span>
                    <div className="notion-breadcrumb">
                      {(selectedCat.breadcrumb || `[${selectedCat.name}]`).split(' / ').map((crumb, index, array) => (
                        <React.Fragment key={index}>
                          <span className="crumb">{crumb.replace(/[\[\]]/g, '')}</span>
                          {index < array.length - 1 && <span className="separator">▶</span>}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="no-category-selected">
                  <span>カテゴリが選択されていません</span>
                  <small>※ ヘッダーからカテゴリを選択してください</small>
                </div>
              );
            })()}
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="term">用語:</label>
          <input
            type="text"
            id="term"
            value={formData.term}
            onChange={(e) => handleInputChange('term', e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="meaning">意味・説明:</label>
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
          </div>
          <textarea
            id="meaning"
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
          <label htmlFor="example">例文・使用例・スクショ等:</label>
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
              <span className="toolbar-label">画像:</span>
              <label className="image-upload-btn" title="画像をアップロード">
                📷 画像追加
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>
          <textarea
            id="example"
            value={formData.example}
            onChange={(e) => handleInputChange('example', e.target.value)}
            placeholder="例文やコードサンプルなど。&#10;**太字**や`コード`も使えます。画像も追加できます。"
            rows={4}
          />
          
          {/* アップロードした画像のプレビュー */}
          {uploadedImages.length > 0 && (
            <div className="uploaded-images-preview">
              <h5>アップロード済み画像:</h5>
              <div className="image-grid">
                {uploadedImages.map((image, index) => (
                  <div key={index} className="image-preview-item">
                    <img src={image} alt={`アップロード画像 ${index + 1}`} className="preview-image" />
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={() => removeImage(index)}
                      title="画像を削除"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
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
        
        <button type="submit" className="btn">追加</button>
      </form>
    </section>
  );
};

export default AddTermForm;
