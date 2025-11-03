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

import React, { useState, useEffect, useRef } from 'react';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { Term } from '../types';
import WysiwygEditor from './WysiwygEditor';

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
   * 意味フィールドのプレビュー表示状態
   * @type {[boolean, React.Dispatch<React.SetStateAction<boolean>>]}
   */
  const [showMeaningPreview, setShowMeaningPreview] = useState(false);

  /**
   * 例文フィールドのプレビュー表示状態
   * @type {[boolean, React.Dispatch<React.SetStateAction<boolean>>]}
   */
  const [showExamplePreview, setShowExamplePreview] = useState(false);

  /**
   * アップロードされた画像の状態
   * @type {[string[], React.Dispatch<React.SetStateAction<string[]>>]}
   */
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  /**
   * フローティングツールバーの状態
   */
  const [floatingToolbar, setFloatingToolbar] = useState<{
    anchorEl: HTMLElement | null;
    field: 'meaning' | 'example' | null;
    selectedText: string;
    selectionStart: number;
    selectionEnd: number;
  }>({
    anchorEl: null,
    field: null,
    selectedText: '',
    selectionStart: 0,
    selectionEnd: 0
  });

  // WYSIWYGエディタの参照
  const meaningTextareaRef = useRef<HTMLDivElement>(null);
  const exampleTextareaRef = useRef<HTMLDivElement>(null);

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
    let exampleValue = formData.example || '';
    
    // 画像マーカー([画像1], [画像2]等)を実際のbase64データに置き換え
    uploadedImages.forEach((imageData, index) => {
      const imageMarker = `[画像${index + 1}]`;
      const imageMarkdown = `![画像](${imageData})`;
      exampleValue = exampleValue.replace(imageMarker, imageMarkdown);
    });
    
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
          
          // ユーザーにはbase64文字列を見せず、プレビューだけ表示
          // テキストエリアには画像マーカーのみ追加
          const imageMarker = `\n[画像${uploadedImages.length + 1}]\n`;
          setFormData(prev => ({ 
            ...prev, 
            example: prev.example + imageMarker
          }));
        };
        reader.readAsDataURL(file);
      }
    });
  };

  // 画像を削除する関数
  const removeImage = (imageIndex: number) => {
    setUploadedImages(prev => prev.filter((_, index) => index !== imageIndex));
    
    // exampleフィールドから画像マーカーを削除して番号を振り直す
    const imageMarkerRegex = /\[画像\d+\]/g;
    setFormData(prev => {
      let newExample = prev.example;
      let markerCount = 0;
      
      // すべてのマーカーを検出して番号を振り直す
      newExample = newExample.replace(imageMarkerRegex, (match) => {
        markerCount++;
        if (markerCount === imageIndex + 1) {
          // 削除対象のマーカーは空文字に置き換え
          return '';
        } else if (markerCount > imageIndex + 1) {
          // 削除後のマーカーは番号を1つ減らす
          return `[画像${markerCount - 1}]`;
        }
        return match;
      });
      
      return {
        ...prev,
        example: newExample.replace(/\n\n+/g, '\n\n').trim()
      };
    });
  };

  // リッチテキストを安全にレンダリングする関数（プレビュー用）
  const renderRichText = (text: string) => {
    if (!text) return '';
    
    let formattedText = text;
    
    // 画像タグを一時的にプレースホルダーに置き換えて保護
    const imageMarkers: { [key: string]: string } = {};
    let imageCount = 0;
    
    // 画像マーカー [画像1], [画像2] を実際の画像に置き換え（プレースホルダーで保護）
    formattedText = formattedText.replace(/\[画像(\d+)\]/g, (match, imageNum) => {
      const imageIndex = parseInt(imageNum) - 1;
      if (imageIndex >= 0 && imageIndex < uploadedImages.length) {
        const imageData = uploadedImages[imageIndex];
        const placeholder = `___IMAGE_PLACEHOLDER_${imageCount}___`;
        imageMarkers[placeholder] = `<div class="uploaded-image-container" style="margin: 8px 0;"><img src="${imageData}" alt="画像${imageNum}" class="uploaded-image" style="max-width: 100%; height: auto; border-radius: 4px;" /></div>`;
        imageCount++;
        return placeholder;
      }
      return match;
    });
    
    // ユーザーが入力した < > をHTMLエンティティに変換して保護
    formattedText = formattedText
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    
    // 改行文字を一時的に保護
    formattedText = formattedText.replace(/\n/g, '___NEWLINE___');
    
    // 不要な絵文字や記号を除去
    formattedText = formattedText
      .replace(/📷/g, '') // 写真マーク（カメラ絵文字）を除去
      .replace(/📸/g, '') // カメラ絵文字を除去
      .replace(/🖼️/g, '') // 額縁絵文字を除去
      .replace(/🎨/g, '') // アート絵文字を除去
      .replace(/🖊️/g, '') // ペン絵文字を除去
      .replace(/✏️/g, '') // 鉛筆絵文字を除去
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
    
    // フォントサイズ記法をHTMLに変換（pxで絶対指定）
    formattedText = formattedText
      .replace(/\[xsmall\](.*?)\[\/xsmall\]/g, '<span style="font-size: 11px; line-height: 1.4;">$1</span>') // 極小サイズ
      .replace(/\[small\](.*?)\[\/small\]/g, '<span style="font-size: 13px; line-height: 1.4;">$1</span>') // 小サイズ
      .replace(/\[normal\](.*?)\[\/normal\]/g, '<span style="font-size: 15px; line-height: 1.4;">$1</span>') // 標準サイズ
      .replace(/\[large\](.*?)\[\/large\]/g, '<span style="font-size: 18px; line-height: 1.4;">$1</span>') // 大サイズ
      .replace(/\[xlarge\](.*?)\[\/xlarge\]/g, '<span style="font-size: 22px; line-height: 1.4;">$1</span>'); // 極大サイズ
    
    // マークダウン風記法をHTMLに変換
    formattedText = formattedText
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // **太字**
      .replace(/\*(.*?)\*/g, '<em>$1</em>') // *斜体*
      .replace(/`(.*?)`/g, '<code>$1</code>') // `コード`
      .replace(/~~(.*?)~~/g, '<del>$1</del>'); // ~~取り消し線~~
    
    // 最後に画像プレースホルダーを実際のHTMLに戻す
    Object.keys(imageMarkers).forEach(placeholder => {
      formattedText = formattedText.replace(placeholder, imageMarkers[placeholder]);
    });
    
    return formattedText;
  };

  /**
   * 選択範囲のHTMLをタグ形式のテキストに変換
   */
  const getSelectedTextWithTags = (selection: Selection): string => {
    if (selection.rangeCount === 0) return '';
    
    const range = selection.getRangeAt(0);
    const container = document.createElement('div');
    container.appendChild(range.cloneContents());
    
    let html = container.innerHTML;
    
    // HTMLタグをカスタムタグに変換
    html = html
      // 色タグ
      .replace(/<span style="color: #e74c3c; font-weight: 600;">(.*?)<\/span>/g, '[red]$1[/red]')
      .replace(/<span style="color: #3498db; font-weight: 600;">(.*?)<\/span>/g, '[blue]$1[/blue]')
      .replace(/<span style="color: #27ae60; font-weight: 600;">(.*?)<\/span>/g, '[green]$1[/green]')
      .replace(/<span style="color: #f39c12; font-weight: 600;">(.*?)<\/span>/g, '[orange]$1[/orange]')
      .replace(/<span style="color: #9b59b6; font-weight: 600;">(.*?)<\/span>/g, '[purple]$1[/purple]')
      .replace(/<span style="color: #e91e63; font-weight: 600;">(.*?)<\/span>/g, '[pink]$1[/pink]')
      // サイズタグ
      .replace(/<span style="font-size: 0\.7em;">(.*?)<\/span>/g, '[xsmall]$1[/xsmall]')
      .replace(/<span style="font-size: 0\.85em;">(.*?)<\/span>/g, '[small]$1[/small]')
      .replace(/<span style="font-size: 1\.2em;">(.*?)<\/span>/g, '[large]$1[/large]')
      .replace(/<span style="font-size: 1\.5em;">(.*?)<\/span>/g, '[xlarge]$1[/xlarge]')
      // マークダウン風タグ
      .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
      .replace(/<em>(.*?)<\/em>/g, '*$1*')
      .replace(/<code>(.*?)<\/code>/g, '`$1`')
      .replace(/<del>(.*?)<\/del>/g, '~~$1~~')
      // 改行
      .replace(/<br\s*\/?>/g, '\n')
      .replace(/<div>(.*?)<\/div>/g, '\n$1');
    
    // HTMLエンティティをデコード
    html = html
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&');
    
    // 残りのHTMLタグを除去
    html = html.replace(/<[^>]+>/g, '');
    
    return html;
  };

  // テキスト選択時にフローティングツールバーを表示
  const handleTextSelection = (field: 'meaning' | 'example') => {
    const editor = field === 'meaning' ? meaningTextareaRef.current : exampleTextareaRef.current;
    if (!editor) return;

    const selection = window.getSelection();
    if (!selection) {
      // selectionが取得できない場合はツールバーを非表示
      setFloatingToolbar({
        anchorEl: null,
        field: null,
        selectedText: '',
        selectionStart: 0,
        selectionEnd: 0
      });
      return;
    }

    // 選択範囲のHTMLをタグ形式に変換して取得
    const selectedText = getSelectedTextWithTags(selection);

    // テキストが選択されている場合のみツールバーを表示
    if (selectedText.length > 0 && !selection.isCollapsed) {
      setFloatingToolbar({
        anchorEl: editor,
        field: field,
        selectedText: selectedText,
        selectionStart: 0, // WYSIWYGでは使用しない
        selectionEnd: 0    // WYSIWYGでは使用しない
      });
    } else {
      // 選択が解除されたら、または範囲が折りたたまれている場合はツールバーを非表示
      setFloatingToolbar({
        anchorEl: null,
        field: null,
        selectedText: '',
        selectionStart: 0,
        selectionEnd: 0
      });
    }
  };

  // フローティングツールバーを閉じる
  const handleCloseFloatingToolbar = () => {
    setFloatingToolbar({
      anchorEl: null,
      field: null,
      selectedText: '',
      selectionStart: 0,
      selectionEnd: 0
    });
  };

  // フローティングツールバーから書式を適用
  const applyFormatFromToolbar = (format: string) => {
    if (!floatingToolbar.field) return;
    
    // 保存した選択範囲情報を使用
    const { field, selectedText, selectionStart, selectionEnd } = floatingToolbar;
    
    if (selectedText.length === 0) {
      alert('テキストを選択してからボタンをクリックしてください。');
      handleCloseFloatingToolbar();
      return;
    }

    applyFormatWithSelection(field, format, selectedText, selectionStart, selectionEnd);
    handleCloseFloatingToolbar();
  };

  // テキストエリアに記法を適用する関数（WYSIWYGエディタでは使用しない）
  const applyFormat = (field: 'meaning' | 'example', format: string) => {
    // WYSIWYGエディタではフローティングツールバーを使用するため、この関数は呼ばれない
    alert('テキストを選択してからフローティングツールバーで書式を適用してください。');
  };

  // 選択範囲情報を使って書式を適用する共通関数
  const applyFormatWithSelection = (
    field: 'meaning' | 'example', 
    format: string, 
    selectedText: string, 
    start: number, 
    end: number
  ) => {
    const editor = document.getElementById(field);
    if (!editor) return;

    const currentValue = formData[field] || '';
    
    // 色タグとサイズタグのカテゴリを定義
    const colorFormats = ['red', 'blue', 'green', 'orange', 'purple', 'pink'];
    const sizeFormats = ['xsmall', 'small', 'normal', 'large', 'xlarge'];
    const styleFormats = ['bold', 'italic', 'code', 'strike'];
    
    // 現在のフォーマットがどのカテゴリに属するか判定
    const isColorFormat = colorFormats.includes(format);
    const isSizeFormat = sizeFormats.includes(format);
    
    // 既存のタグを除去する必要があるかチェック
    let cleanedText = selectedText;
    
    // 色を変更する場合、既存の色タグを除去
    if (isColorFormat) {
      colorFormats.forEach(color => {
        const pattern = `[${color}]`;
        const endPattern = `[/${color}]`;
        if (cleanedText.startsWith(pattern) && cleanedText.endsWith(endPattern)) {
          cleanedText = cleanedText.substring(pattern.length, cleanedText.length - endPattern.length);
        }
      });
    }
    
    // サイズを変更する場合、既存のサイズタグを除去
    if (isSizeFormat) {
      sizeFormats.forEach(size => {
        const pattern = `[${size}]`;
        const endPattern = `[/${size}]`;
        if (cleanedText.startsWith(pattern) && cleanedText.endsWith(endPattern)) {
          cleanedText = cleanedText.substring(pattern.length, cleanedText.length - endPattern.length);
        }
      });
    }
    
    // 書式のトグル動作：既に同じ書式が適用されている場合は除去
    let formatPattern = '';
    let isFormatted = false;
    
    switch (format) {
      case 'bold':
        formatPattern = `**${cleanedText}**`;
        isFormatted = currentValue.includes(formatPattern);
        break;
      case 'italic':
        formatPattern = `*${cleanedText}*`;
        isFormatted = currentValue.includes(formatPattern);
        break;
      case 'code':
        formatPattern = `\`${cleanedText}\``;
        isFormatted = currentValue.includes(formatPattern);
        break;
      case 'strike':
        formatPattern = `~~${cleanedText}~~`;
        isFormatted = currentValue.includes(formatPattern);
        break;
      case 'red':
        formatPattern = `[red]${cleanedText}[/red]`;
        isFormatted = currentValue.includes(formatPattern);
        break;
      case 'blue':
        formatPattern = `[blue]${cleanedText}[/blue]`;
        isFormatted = currentValue.includes(formatPattern);
        break;
      case 'green':
        formatPattern = `[green]${cleanedText}[/green]`;
        isFormatted = currentValue.includes(formatPattern);
        break;
      case 'orange':
        formatPattern = `[orange]${cleanedText}[/orange]`;
        isFormatted = currentValue.includes(formatPattern);
        break;
      case 'purple':
        formatPattern = `[purple]${cleanedText}[/purple]`;
        isFormatted = currentValue.includes(formatPattern);
        break;
      case 'pink':
        formatPattern = `[pink]${cleanedText}[/pink]`;
        isFormatted = currentValue.includes(formatPattern);
        break;
      case 'xsmall':
        formatPattern = `[xsmall]${cleanedText}[/xsmall]`;
        isFormatted = currentValue.includes(formatPattern);
        break;
      case 'small':
        formatPattern = `[small]${cleanedText}[/small]`;
        isFormatted = currentValue.includes(formatPattern);
        break;
      case 'normal':
        formatPattern = `[normal]${cleanedText}[/normal]`;
        isFormatted = currentValue.includes(formatPattern);
        break;
      case 'large':
        formatPattern = `[large]${cleanedText}[/large]`;
        isFormatted = currentValue.includes(formatPattern);
        break;
      case 'xlarge':
        formatPattern = `[xlarge]${cleanedText}[/xlarge]`;
        isFormatted = currentValue.includes(formatPattern);
        break;
      default:
        formatPattern = cleanedText;
    }

    let newValue = '';
    
    if (isFormatted) {
      // 既に同じ書式が適用されている場合は除去（トグルOFF）
      newValue = currentValue.replace(formatPattern, cleanedText);
    } else {
      // 書式を適用（トグルON）
      // 元のselectedText（タグ付き）を検索して置き換え
      const index = currentValue.indexOf(selectedText);
      
      if (index !== -1) {
        // 最初に見つかった箇所を置き換え（元のselectedTextをformatPatternで置換）
        newValue = currentValue.substring(0, index) + formatPattern + currentValue.substring(index + selectedText.length);
      } else {
        // 見つからない場合は末尾に追加
        newValue = currentValue + formatPattern;
      }
    }
    
    handleInputChange(field, newValue);
    
    // WYSIWYGエディタを再レンダリングするため、一時的にフォーカスを外して戻す
    setTimeout(() => {
      // フォーカスを外す（useEffectが発火してHTMLを更新）
      editor.blur();
      
      // 少し待ってからフォーカスを戻す
      setTimeout(() => {
        editor.focus();
      }, 10);
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
                  <li><code>[xsmall]極小[/xsmall]</code> → <span style={{fontSize: '0.7em'}}>極小</span></li>
                  <li><code>[small]小[/small]</code> → <span style={{fontSize: '0.85em'}}>小</span></li>
                  <li><code>[normal]標準[/normal]</code> → <span style={{fontSize: '1em'}}>標準</span></li>
                  <li><code>[large]大[/large]</code> → <span style={{fontSize: '1.2em'}}>大</span></li>
                  <li><code>[xlarge]極大[/xlarge]</code> → <span style={{fontSize: '1.5em'}}>極大</span></li>
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
          <div className="rich-text-editor-wrapper">
            <WysiwygEditor
              id="meaning"
              value={formData.meaning}
              onChange={(value) => handleInputChange('meaning', value)}
              onSelect={() => handleTextSelection('meaning')}
              placeholder="テキストを入力してください。書式ツールバーから装飾を適用できます。"
              rows={6}
              editorRef={meaningTextareaRef}
            />
          </div>

          {/* プレビューセクション（デバッグ用） */}
          {showMeaningPreview && (
            <div className="preview-section" style={{ marginTop: '8px' }}>
              <h4>タグ形式（内部データ）:</h4>
              <div style={{
                padding: '10px',
                background: '#f8f9fa',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                fontSize: '12px',
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all'
              }}>
                {formData.meaning || '(空欄)'}
              </div>
              <div 
                className="rich-text-preview"
                dangerouslySetInnerHTML={{ __html: renderRichText(formData.meaning) }}
              />
            </div>
          )}
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
              <span className="toolbar-label">サイズ:</span>
              <button type="button" className="size-btn" onClick={() => applyFormat('example', 'xsmall')} title="極小">極小</button>
              <button type="button" className="size-btn" onClick={() => applyFormat('example', 'small')} title="小">小</button>
              <button type="button" className="size-btn" onClick={() => applyFormat('example', 'normal')} title="標準">標準</button>
              <button type="button" className="size-btn" onClick={() => applyFormat('example', 'large')} title="大">大</button>
              <button type="button" className="size-btn" onClick={() => applyFormat('example', 'xlarge')} title="極大">極大</button>
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
          <div className="rich-text-editor-wrapper">
            <WysiwygEditor
              id="example"
              value={formData.example}
              onChange={(value) => handleInputChange('example', value)}
              onSelect={() => handleTextSelection('example')}
              placeholder="例文やコードサンプルなど。画像も追加可能です。"
              rows={4}
              editorRef={exampleTextareaRef}
            />
          </div>
          
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
          
          {/* プレビューセクション（デバッグ用） */}
          {showExamplePreview && (
            <div className="preview-section" style={{ marginTop: '8px' }}>
              <h4>タグ形式（内部データ）:</h4>
              <div style={{
                padding: '10px',
                background: '#f8f9fa',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                fontSize: '12px',
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all'
              }}>
                {formData.example || '(空欄)'}
              </div>
            </div>
          )}
        </div>
        
        <Button 
          type="submit" 
          variant="contained" 
          color="primary"
          size="large"
          fullWidth
          sx={{ mt: 2 }}
        >
          追加
        </Button>
      </form>

      {/* フローティングツールバー */}
      <Popover
        open={Boolean(floatingToolbar.anchorEl)}
        anchorEl={floatingToolbar.anchorEl}
        onClose={handleCloseFloatingToolbar}
        disableRestoreFocus
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        slotProps={{
          paper: {
            onMouseDown: (e) => {
              // Popover内のクリックでフォーカスが外れないようにする
              e.preventDefault();
            }
          }
        }}
        sx={{
          '& .MuiPopover-paper': {
            padding: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            maxWidth: '400px'
          }
        }}
      >
        {/* 選択テキストの表示 */}
        {floatingToolbar.selectedText && (
          <div style={{ 
            padding: '6px 8px', 
            background: '#f0f0f0', 
            borderRadius: '4px',
            fontSize: '13px',
            color: '#333',
            maxHeight: '60px',
            overflow: 'auto',
            wordBreak: 'break-word',
            borderLeft: '3px solid #1976d2'
          }}>
            <div style={{ fontSize: '11px', color: '#666', marginBottom: '2px' }}>選択中:</div>
            <div style={{ fontWeight: 500 }}>
              {floatingToolbar.selectedText.length > 50 
                ? floatingToolbar.selectedText.substring(0, 50) + '...' 
                : floatingToolbar.selectedText}
            </div>
          </div>
        )}
        
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {/* 書式ボタン */}
          <Tooltip title="太字">
            <IconButton size="small" onClick={() => applyFormatFromToolbar('bold')} sx={{ fontSize: '14px' }}>
              <strong>B</strong>
            </IconButton>
          </Tooltip>
          <Tooltip title="斜体">
            <IconButton size="small" onClick={() => applyFormatFromToolbar('italic')} sx={{ fontSize: '14px' }}>
              <em>I</em>
            </IconButton>
          </Tooltip>
          <Tooltip title="取り消し線">
            <IconButton size="small" onClick={() => applyFormatFromToolbar('strike')} sx={{ fontSize: '14px' }}>
              <del>S</del>
            </IconButton>
          </Tooltip>

          <div style={{ width: '1px', background: '#ddd', margin: '0 4px' }} />

          {/* 色ボタン */}
          <Tooltip title="赤色">
            <IconButton size="small" onClick={() => applyFormatFromToolbar('red')} sx={{ color: '#e74c3c' }}>
              A
            </IconButton>
          </Tooltip>
          <Tooltip title="青色">
            <IconButton size="small" onClick={() => applyFormatFromToolbar('blue')} sx={{ color: '#3498db' }}>
              A
            </IconButton>
          </Tooltip>
          <Tooltip title="緑色">
            <IconButton size="small" onClick={() => applyFormatFromToolbar('green')} sx={{ color: '#27ae60' }}>
              A
            </IconButton>
          </Tooltip>
          <Tooltip title="オレンジ">
            <IconButton size="small" onClick={() => applyFormatFromToolbar('orange')} sx={{ color: '#f39c12' }}>
              A
            </IconButton>
          </Tooltip>

          <div style={{ width: '1px', background: '#ddd', margin: '0 4px' }} />

          {/* サイズボタン */}
          <Tooltip title="小">
            <IconButton size="small" onClick={() => applyFormatFromToolbar('small')} sx={{ fontSize: '11px' }}>
              小
            </IconButton>
          </Tooltip>
          <Tooltip title="標準">
            <IconButton size="small" onClick={() => applyFormatFromToolbar('normal')} sx={{ fontSize: '14px' }}>
              標
            </IconButton>
          </Tooltip>
          <Tooltip title="大">
            <IconButton size="small" onClick={() => applyFormatFromToolbar('large')} sx={{ fontSize: '17px' }}>
              大
            </IconButton>
          </Tooltip>
        </div>
      </Popover>
    </section>
  );
};

export default AddTermForm;
