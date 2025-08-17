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

const AddTermForm: React.FC<AddTermFormProps> = ({ onAddTerm, activeCategory, categories }) => {
  const [formData, setFormData] = useState({
    category: activeCategory && activeCategory !== 'all' ? activeCategory : (categories.length > 0 ? categories[0].key : 'english'),
    term: '',
    meaning: '',
    example: ''
  });
  const [showRichTextHelp, setShowRichTextHelp] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(new Set());

  const toggleExpanded = (categoryId: number) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // 階層構造でカテゴリを表示するヘルパー関数
  const renderHierarchicalCategorySelection = () => {
    const rootCategories = categories.filter(cat => cat.parent_id === null);
    const result: React.ReactElement[] = [];

    const renderCategory = (category: Category, level: number = 0) => {
      const childCategories = categories.filter(cat => cat.parent_id === category.id);
      const isSelected = formData.category === category.key;
      const isExpanded = expandedCategories.has(category.id);
      const hasChildren = childCategories.length > 0;
      
      result.push(
        <div key={category.key} className="category-selection-group" data-level={level}>
          <div className="category-selection-wrapper">
            {hasChildren && (
              <button
                type="button"
                className="expand-toggle-selection"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpanded(category.id);
                }}
                style={{
                  transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease'
                }}
              >
                ▶
              </button>
            )}
            <label
              className={`category-selection-label ${isSelected ? 'selected' : ''}`}
              onClick={() => {
                setFormData(prev => ({ ...prev, category: category.key }));
              }}
              style={{
                backgroundColor: isSelected ? category.color : undefined,
                borderColor: isSelected ? category.color : undefined,
                color: isSelected ? 'white' : undefined,
                marginLeft: hasChildren ? '0' : '20px',
                '--category-color': category.color
              } as React.CSSProperties}
            >
              <input
                type="radio"
                name="category"
                value={category.key}
                checked={isSelected}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, category: e.target.value }));
                }}
                style={{ display: 'none' }}
              />
              {category.icon} {category.name}
              {hasChildren && (
                <span style={{ 
                  marginLeft: '8px', 
                  fontSize: '11px', 
                  opacity: 0.7 
                }}>
                  ({childCategories.length})
                </span>
              )}
            </label>
          </div>

          {/* 子カテゴリを表示（展開されている場合のみ） */}
          <div 
            className={`child-categories-selection ${isExpanded ? 'expanded' : 'collapsed'}`}
            style={{
              maxHeight: isExpanded ? `${childCategories.length * 50}px` : '0px',
              transition: 'max-height 0.3s ease-in-out, opacity 0.3s ease-in-out',
              opacity: isExpanded ? 1 : 0,
              overflow: 'hidden'
            }}
          >
            {/* この部分は下の再帰的呼び出しで処理される */}
          </div>
        </div>
      );

      // 子カテゴリを再帰的に表示（展開されている場合のみ）
      if (hasChildren && isExpanded) {
        childCategories.forEach(child => {
          renderCategory(child, level + 1);
        });
      }
    };

    rootCategories.forEach(rootCategory => {
      renderCategory(rootCategory);
    });

    return result;
  };

  // activeCategoryが変更されたらカテゴリも自動で変更
  useEffect(() => {
    if (activeCategory && activeCategory !== 'all') {
      setFormData(prev => ({ ...prev, category: activeCategory }));
    }
  }, [activeCategory]);

  // カテゴリ一覧が変わったら、選択肢も更新
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
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // リッチテキストを安全にレンダリングする関数（TermsListと同じ）
  const renderRichText = (text: string) => {
    if (!text) return '';
    
    // 改行をHTMLの<br>タグに変換
    let formattedText = text.replace(/\n/g, '<br>');
    
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
          <label htmlFor="category">カテゴリ（階層表示）:</label>
          <div className="category-selection-container">
            {renderHierarchicalCategorySelection()}
          </div>
          {/* 選択中のカテゴリの階層パスを視覚的に表示 */}
          {formData.category && (
            <div className="selected-category-path">
              {(() => {
                const selectedCat = categories.find(c => c.key === formData.category);
                return selectedCat ? (
                  <div className="breadcrumb-display">
                    <span className="breadcrumb-label">選択中:</span>
                    <div className="notion-breadcrumb">
                      {(selectedCat.breadcrumb || `[${selectedCat.name}]`).split(' / ').map((crumb, index, array) => (
                        <React.Fragment key={index}>
                          <span className="crumb">{crumb.replace(/[\[\]]/g, '')}</span>
                          {index < array.length - 1 && <span className="separator">▶</span>}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          )}
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
          <label htmlFor="example">例文・使用例:</label>
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
          </div>
          <textarea
            id="example"
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
        
        <button type="submit" className="btn">追加</button>
      </form>
    </section>
  );
};

export default AddTermForm;
