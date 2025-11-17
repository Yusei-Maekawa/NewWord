/**
 * @fileoverview Notionライクなエディタコンポーネント
 * 
 * 主な機能:
 * - テキスト選択時のフローティングツールバー
 * - マークダウンショートカット (**太字**, *斜体*, `コード`)
 * - スラッシュコマンド (/red, /bold など)
 * - ネイティブUndo/Redo対応
 * 
 * @author Yusei Maekawa
 * @version 2.0.0
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import '../styles/NotionEditor.css';

interface NotionEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  id?: string;
  editorRef?: React.RefObject<HTMLDivElement | null>;
  onColorPickerOpen?: () => void;
}

interface FloatingToolbarPosition {
  top: number;
  left: number;
}

const NotionEditor: React.FC<NotionEditorProps> = ({
  value,
  onChange,
  placeholder = 'テキストを入力...',
  rows = 4,
  id,
  editorRef,
  onColorPickerOpen
}) => {
  const localRef = useRef<HTMLDivElement>(null);
  const ref = editorRef || localRef;
  const [isFocused, setIsFocused] = useState(false);
  const [showFloatingToolbar, setShowFloatingToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState<FloatingToolbarPosition>({ top: 0, left: 0 });
  const [showMoreColors, setShowMoreColors] = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [customColor, setCustomColor] = useState('#e74c3c');
  const [colorHistory, setColorHistory] = useState<string[]>([]);
  
  // Undo/Redo用のカスタム履歴管理
  const [history, setHistory] = useState<string[]>([value]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const isUndoRedoRef = useRef(false);
  const prevValueRef = useRef(value);

  // valueが外部から変更された場合、履歴をリセット
  useEffect(() => {
    if (value !== prevValueRef.current && !isUndoRedoRef.current) {
      setHistory([value]);
      setHistoryIndex(0);
      prevValueRef.current = value;
    }
  }, [value]);

  // ブラウザのネイティブ編集機能を無効化
  useEffect(() => {
    if (ref.current) {
      // Undo/Redo履歴を無効化
      try {
        document.execCommand('enableObjectResizing', false, 'false');
        document.execCommand('enableInlineTableEditing', false, 'false');
      } catch (e) {
        // 一部のブラウザでは動作しない
      }
    }
  }, []);

  // カラー履歴をLocalStorageから読み込み
  useEffect(() => {
    const savedHistory = localStorage.getItem('customColorHistory');
    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory);
        setColorHistory(history);
      } catch (error) {
        console.error('Failed to parse color history:', error);
      }
    }
  }, []);



  // カラー履歴を保存
  const saveColorToHistory = (color: string) => {
    const newHistory = [color, ...colorHistory.filter(c => c.toLowerCase() !== color.toLowerCase())].slice(0, 10);
    setColorHistory(newHistory);
    localStorage.setItem('customColorHistory', JSON.stringify(newHistory));
  };

  // カラー履歴をクリア
  const clearColorHistory = () => {
    setColorHistory([]);
    localStorage.removeItem('customColorHistory');
  };

  /**
   * 履歴にスナップショットを追加
   */
  const addToHistory = (newValue: string) => {
    if (isUndoRedoRef.current) {
      console.log('[NotionEditor] Skipping history add - Undo/Redo in progress');
      return;
    }
    
    console.log('[NotionEditor] Adding to history - Current index:', historyIndex, 'New value:', newValue);
    
    // 現在位置より後ろの履歴を削除して新しい履歴を追加
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newValue);
    
    console.log('[NotionEditor] New history length:', newHistory.length);
    
    // 履歴の最大数を50に制限
    if (newHistory.length > 50) {
      newHistory.shift();
    } else {
      setHistoryIndex(historyIndex + 1);
    }
    
    setHistory(newHistory);
  };

  /**
   * Undo/Redoのキーボードショートカット
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // エディタがフォーカスされている場合のみ動作
      if (!ref.current || document.activeElement !== ref.current) return;
      
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        // Undo (Ctrl+Z / Cmd+Z)
        e.preventDefault();
        e.stopPropagation();
        
        console.log('[NotionEditor] Undo triggered - Current index:', historyIndex, 'History length:', history.length);
        
        if (historyIndex > 0) {
          isUndoRedoRef.current = true;
          const newIndex = historyIndex - 1;
          const previousValue = history[newIndex];
          
          console.log('[NotionEditor] Undo to index:', newIndex, 'Value:', previousValue);
          
          setHistoryIndex(newIndex);
          onChange(previousValue);
          
          setTimeout(() => {
            isUndoRedoRef.current = false;
          }, 50);
        } else {
          console.log('[NotionEditor] Cannot undo - already at first history');
        }
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        // Redo (Ctrl+Y / Cmd+Y / Ctrl+Shift+Z / Cmd+Shift+Z)
        e.preventDefault();
        e.stopPropagation();
        
        console.log('[NotionEditor] Redo triggered - Current index:', historyIndex, 'History length:', history.length);
        
        if (historyIndex < history.length - 1) {
          isUndoRedoRef.current = true;
          const newIndex = historyIndex + 1;
          const nextValue = history[newIndex];
          
          console.log('[NotionEditor] Redo to index:', newIndex, 'Value:', nextValue);
          
          setHistoryIndex(newIndex);
          onChange(nextValue);
          
          setTimeout(() => {
            isUndoRedoRef.current = false;
          }, 50);
        } else {
          console.log('[NotionEditor] Cannot redo - already at last history');
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [history, historyIndex, onChange, ref]);

  /**
   * カスタムタグをHTMLに変換
   */
  const tagsToHtml = (text: string): string => {
    if (!text) return '';
    
    let html = text;
    
    // HTMLエスケープ
    html = html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    
    // カスタムタグをHTMLに変換
    html = html
      // カスタムカラー
      .replace(/\[color=(#[0-9A-Fa-f]{6})\](.*?)\[\/color\]/g, '<span style="color: $1; font-weight: 600;">$2</span>')
      // プリセット色 (12色)
      .replace(/\[red\](.*?)\[\/red\]/g, '<span style="color: #e74c3c; font-weight: 600;">$1</span>')
      .replace(/\[blue\](.*?)\[\/blue\]/g, '<span style="color: #3498db; font-weight: 600;">$1</span>')
      .replace(/\[green\](.*?)\[\/green\]/g, '<span style="color: #27ae60; font-weight: 600;">$1</span>')
      .replace(/\[orange\](.*?)\[\/orange\]/g, '<span style="color: #f39c12; font-weight: 600;">$1</span>')
      .replace(/\[purple\](.*?)\[\/purple\]/g, '<span style="color: #9b59b6; font-weight: 600;">$1</span>')
      .replace(/\[pink\](.*?)\[\/pink\]/g, '<span style="color: #e91e63; font-weight: 600;">$1</span>')
      .replace(/\[yellow\](.*?)\[\/yellow\]/g, '<span style="color: #f1c40f; font-weight: 600;">$1</span>')
      .replace(/\[brown\](.*?)\[\/brown\]/g, '<span style="color: #8b4513; font-weight: 600;">$1</span>')
      .replace(/\[gray\](.*?)\[\/gray\]/g, '<span style="color: #7f8c8d; font-weight: 600;">$1</span>')
      .replace(/\[black\](.*?)\[\/black\]/g, '<span style="color: #2c3e50; font-weight: 600;">$1</span>')
      .replace(/\[cyan\](.*?)\[\/cyan\]/g, '<span style="color: #00bcd4; font-weight: 600;">$1</span>')
      .replace(/\[lime\](.*?)\[\/lime\]/g, '<span style="color: #8bc34a; font-weight: 600;">$1</span>')
      // サイズ
      .replace(/\[xsmall\](.*?)\[\/xsmall\]/g, '<span style="font-size: 0.7em;">$1</span>')
      .replace(/\[small\](.*?)\[\/small\]/g, '<span style="font-size: 0.85em;">$1</span>')
      .replace(/\[large\](.*?)\[\/large\]/g, '<span style="font-size: 1.2em;">$1</span>')
      .replace(/\[xlarge\](.*?)\[\/xlarge\]/g, '<span style="font-size: 1.5em;">$1</span>')
      // マークダウン風
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/~~(.*?)~~/g, '<del>$1</del>')
      // 改行
      .replace(/\n/g, '<br>');
    
    return html;
  };

  /**
   * HTMLをカスタムタグに変換
   */
  const htmlToTags = (html: string): string => {
    if (!html) return '';
    
    let text = html;
    
    // HTMLタグをカスタムタグに変換
    text = text
      // カスタムカラー
      .replace(/<span style="color: (#[0-9A-Fa-f]{6}); font-weight: 600;">(.*?)<\/span>/g, '[color=$1]$2[/color]')
      // プリセット色
      .replace(/<span style="color: #e74c3c; font-weight: 600;">(.*?)<\/span>/g, '[red]$1[/red]')
      .replace(/<span style="color: #3498db; font-weight: 600;">(.*?)<\/span>/g, '[blue]$1[/blue]')
      .replace(/<span style="color: #27ae60; font-weight: 600;">(.*?)<\/span>/g, '[green]$1[/green]')
      .replace(/<span style="color: #f39c12; font-weight: 600;">(.*?)<\/span>/g, '[orange]$1[/orange]')
      .replace(/<span style="color: #9b59b6; font-weight: 600;">(.*?)<\/span>/g, '[purple]$1[/purple]')
      .replace(/<span style="color: #e91e63; font-weight: 600;">(.*?)<\/span>/g, '[pink]$1[/pink]')
      .replace(/<span style="color: #f1c40f; font-weight: 600;">(.*?)<\/span>/g, '[yellow]$1[/yellow]')
      .replace(/<span style="color: #8b4513; font-weight: 600;">(.*?)<\/span>/g, '[brown]$1[/brown]')
      .replace(/<span style="color: #7f8c8d; font-weight: 600;">(.*?)<\/span>/g, '[gray]$1[/gray]')
      .replace(/<span style="color: #2c3e50; font-weight: 600;">(.*?)<\/span>/g, '[black]$1[/black]')
      .replace(/<span style="color: #00bcd4; font-weight: 600;">(.*?)<\/span>/g, '[cyan]$1[/cyan]')
      .replace(/<span style="color: #8bc34a; font-weight: 600;">(.*?)<\/span>/g, '[lime]$1[/lime]')
      // サイズ
      .replace(/<span style="font-size: 0\.7em;">(.*?)<\/span>/g, '[xsmall]$1[/xsmall]')
      .replace(/<span style="font-size: 0\.85em;">(.*?)<\/span>/g, '[small]$1[/small]')
      .replace(/<span style="font-size: 1\.2em;">(.*?)<\/span>/g, '[large]$1[/large]')
      .replace(/<span style="font-size: 1\.5em;">(.*?)<\/span>/g, '[xlarge]$1[/xlarge]')
      // マークダウン風
      .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
      .replace(/<em>(.*?)<\/em>/g, '*$1*')
      .replace(/<code>(.*?)<\/code>/g, '`$1`')
      .replace(/<del>(.*?)<\/del>/g, '~~$1~~')
      // 改行とdiv
      .replace(/<br\s*\/?>/g, '\n')
      .replace(/<div><br\s*\/?><\/div>/g, '\n')
      .replace(/<div>(.*?)<\/div>/g, '\n$1')
      .replace(/<\/div>/g, '')
      .replace(/<div>/g, '\n');
    
    // HTMLエンティティをデコード
    text = text
      .replace(/&nbsp;/g, ' ')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&');
    
    text = text.replace(/^\n+/, '');
    
    return text;
  };

  /**
   * エディタの内容を更新
   */
  useEffect(() => {
    if (ref.current) {
      const html = tagsToHtml(value);
      // Undo/Redo操作中、またはHTMLが異なる場合のみ更新
      if (isUndoRedoRef.current || (!isFocused && ref.current.innerHTML !== html)) {
        ref.current.innerHTML = html;
        
        // Undo/Redo後はカーソル位置を末尾に移動
        if (isUndoRedoRef.current) {
          const range = document.createRange();
          const selection = window.getSelection();
          if (ref.current.lastChild) {
            range.setStartAfter(ref.current.lastChild);
            range.collapse(true);
            selection?.removeAllRanges();
            selection?.addRange(range);
          }
        }
      }
    }
  }, [value, isFocused]);

  /**
   * テキスト選択時のフローティングツールバー表示
   */
  const handleSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !ref.current) {
      setShowFloatingToolbar(false);
      return;
    }

    const range = selection.getRangeAt(0);
    
    // 複数行選択チェック: 選択範囲に改行が含まれている場合はツールバーを表示しない
    const selectedFragment = range.cloneContents();
    const tempDiv = document.createElement('div');
    tempDiv.appendChild(selectedFragment);
    const selectedHtml = tempDiv.innerHTML;
    
    if (selectedHtml.includes('<br>') || selectedHtml.includes('<div>') || selectedHtml.includes('</div>')) {
      console.log('[NotionEditor] Multi-line selection detected, hiding toolbar');
      setShowFloatingToolbar(false);
      return;
    }
    
    const rect = range.getBoundingClientRect();
    const editorRect = ref.current.getBoundingClientRect();
    
    // エディタ内の選択かチェック
    if (rect.width > 0 && rect.top >= editorRect.top && rect.bottom <= editorRect.bottom) {
      // ツールバーの幅を仮定（実測値: 約300px）
      const toolbarWidth = 300;
      
      // 中央配置を基本とするが、画面からはみ出さないように調整
      let leftPosition = rect.left - editorRect.left + rect.width / 2 + ref.current.scrollLeft;
      
      // 左端チェック: ツールバーの半分が左にはみ出る場合
      if (leftPosition - toolbarWidth / 2 < 0) {
        leftPosition = toolbarWidth / 2;
      }
      
      // 右端チェック: ツールバーの半分が右にはみ出る場合
      if (leftPosition + toolbarWidth / 2 > editorRect.width) {
        leftPosition = editorRect.width - toolbarWidth / 2;
      }
      
      setToolbarPosition({
        top: rect.top - editorRect.top + ref.current.scrollTop - 50,
        left: leftPosition
      });
      setShowFloatingToolbar(true);
    } else {
      setShowFloatingToolbar(false);
    }
  }, []);

  /**
   * 書式適用
   * HTML構造を保持したまま新しいフォーマットを適用
   * 制限: 1行のみの選択に限定（複数行の選択は不可）
   */
  const applyFormat = (format: string) => {
    console.log('[NotionEditor] applyFormat called:', format);
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      console.log('[NotionEditor] No selection or range');
      return;
    }

    const range = selection.getRangeAt(0);
    
    // HTML構造を保持して選択テキストを取得
    const selectedFragment = range.cloneContents();
    const tempDiv = document.createElement('div');
    tempDiv.appendChild(selectedFragment);
    const selectedHtml = tempDiv.innerHTML;
    console.log('[NotionEditor] Selected HTML:', selectedHtml);
    
    if (!selectedHtml) {
      console.log('[NotionEditor] Empty selection');
      return;
    }

    // 改行チェック: 複数行の選択は許可しない
    if (selectedHtml.includes('<br>') || selectedHtml.includes('<div>') || selectedHtml.includes('</div>')) {
      console.log('[NotionEditor] Multi-line selection detected, aborting');
      alert('書式の適用は1行のみ可能です。複数行を選択しないでください。');
      setShowFloatingToolbar(false);
      return;
    }

    // HTMLをタグ形式に変換して既存のフォーマットを取得
    let selectedTags = htmlToTags(selectedHtml);
    console.log('[NotionEditor] Selected tags (before):', selectedTags);
    
    // タグ形式でも改行チェック
    if (selectedTags.includes('\n')) {
      console.log('[NotionEditor] Newline in tags detected, aborting');
      alert('書式の適用は1行のみ可能です。複数行を選択しないでください。');
      setShowFloatingToolbar(false);
      return;
    }

    // 既存の色・サイズタグを削除（他のフォーマットは保持）
    const colorPattern = /\[(red|blue|green|orange|purple|pink|yellow|brown|gray|black|cyan|lime|color=#[0-9a-fA-F]{6})\](.*?)\[\/(?:red|blue|green|orange|purple|pink|yellow|brown|gray|black|cyan|lime|color)\]/g;
    const sizePattern = /\[(size=[^\]]+)\](.*?)\[\/size\]/g;
    
    // フォーマットタイプによって既存タグを削除
    if (format === 'bold' || format === 'italic' || format === 'code' || format === 'strike') {
      // テキストフォーマットの場合は何も削除しない（重ねがけ可能）
    } else if (format.startsWith('color=') || ['red', 'blue', 'green', 'orange', 'purple', 'pink', 'yellow', 'brown', 'gray', 'black', 'cyan', 'lime'].includes(format)) {
      // 色の場合は既存の色タグを削除
      selectedTags = selectedTags.replace(colorPattern, '$2');
    } else if (format.startsWith('size=')) {
      // サイズの場合は既存のサイズタグを削除
      selectedTags = selectedTags.replace(sizePattern, '$2');
    }

    // 新しいフォーマットを適用
    let wrappedText = '';
    
    switch (format) {
      case 'bold':
        wrappedText = `**${selectedTags}**`;
        break;
      case 'italic':
        wrappedText = `*${selectedTags}*`;
        break;
      case 'code':
        wrappedText = `\`${selectedTags}\``;
        break;
      case 'strike':
        wrappedText = `~~${selectedTags}~~`;
        break;
      // 12色のプリセット
      case 'red':
        wrappedText = `[red]${selectedTags}[/red]`;
        break;
      case 'blue':
        wrappedText = `[blue]${selectedTags}[/blue]`;
        break;
      case 'green':
        wrappedText = `[green]${selectedTags}[/green]`;
        break;
      case 'orange':
        wrappedText = `[orange]${selectedTags}[/orange]`;
        break;
      case 'purple':
        wrappedText = `[purple]${selectedTags}[/purple]`;
        break;
      case 'pink':
        wrappedText = `[pink]${selectedTags}[/pink]`;
        break;
      case 'yellow':
        wrappedText = `[yellow]${selectedTags}[/yellow]`;
        break;
      case 'brown':
        wrappedText = `[brown]${selectedTags}[/brown]`;
        break;
      case 'gray':
        wrappedText = `[gray]${selectedTags}[/gray]`;
        break;
      case 'black':
        wrappedText = `[black]${selectedTags}[/black]`;
        break;
      case 'cyan':
        wrappedText = `[cyan]${selectedTags}[/cyan]`;
        break;
      case 'lime':
        wrappedText = `[lime]${selectedTags}[/lime]`;
        break;
      default:
        // カスタムカラーの場合 (format = "color=#XXXXXX")
        if (format.startsWith('color=')) {
          wrappedText = `[${format}]${selectedTags}[/color]`;
        } else {
          console.log('[NotionEditor] Unknown format:', format);
          return;
        }
    }

    console.log('[NotionEditor] Wrapped text (after):', wrappedText);

    // エディタ全体のコンテンツを取得
    if (!ref.current) return;
    
    // エディタ全体のHTMLとタグ形式を取得
    const fullHtml = ref.current.innerHTML;
    const fullTags = htmlToTags(fullHtml);
    console.log('[NotionEditor] Full tags:', fullTags);
    
    // 選択範囲の位置を特定（タグ形式での位置）
    // 選択範囲の前のコンテンツを取得
    const beforeRange = document.createRange();
    beforeRange.setStart(ref.current, 0);
    beforeRange.setEnd(range.startContainer, range.startOffset);
    const beforeFragment = beforeRange.cloneContents();
    const beforeDiv = document.createElement('div');
    beforeDiv.appendChild(beforeFragment);
    const beforeHtml = beforeDiv.innerHTML;
    const beforeTags = htmlToTags(beforeHtml);
    
    // 選択テキストの長さ
    const selectedLength = selectedTags.length;
    
    // 前・選択・後に分割
    const startPos = beforeTags.length;
    const endPos = startPos + selectedLength;
    
    const tagsBefore = fullTags.substring(0, startPos);
    const tagsAfter = fullTags.substring(endPos);
    
    console.log('[NotionEditor] Before:', tagsBefore);
    console.log('[NotionEditor] Selected:', selectedTags);
    console.log('[NotionEditor] After:', tagsAfter);
    
    // 新しいテキストを構築
    const newText = tagsBefore + wrappedText + tagsAfter;
    
    // HTMLに変換してエディタに反映（即座にレンダリング）
    const newHtml = tagsToHtml(newText);
    ref.current.innerHTML = newHtml;
    
    // カーソル位置を計算して復元
    const cursorPos = tagsBefore.length + wrappedText.length;
    const textNodes: Text[] = [];
    const getTextNodes = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        textNodes.push(node as Text);
      } else {
        node.childNodes.forEach(getTextNodes);
      }
    };
    getTextNodes(ref.current);
    
    let currentLength = 0;
    for (const textNode of textNodes) {
      const nodeLength = textNode.textContent?.length || 0;
      if (currentLength + nodeLength >= cursorPos) {
        const offset = cursorPos - currentLength;
        const newRange = document.createRange();
        newRange.setStart(textNode, Math.min(offset, nodeLength));
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
        break;
      }
      currentLength += nodeLength;
    }
    
    setShowFloatingToolbar(false);
    
    console.log('[NotionEditor] After format - New text:', newText);
    
    // 書式適用は即座に履歴に追加（1つの操作として扱う）
    addToHistory(newText);
    
    // 変更を親に通知
    onChange(newText);
  };

  /**
   * 入力時のハンドラ
   */
  const handleInput = () => {
    if (ref.current) {
      const html = ref.current.innerHTML;
      const taggedText = htmlToTags(html);
      onChange(taggedText);
    }
  };

  /**
   * カスタムカラーを適用
   */
  const applyCustomColor = () => {
    saveColorToHistory(customColor);
    applyFormat(`color=${customColor}`);
    setColorPickerOpen(false);
  };

  /**
   * ペースト時のハンドラ
   */
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  /**
   * キーダウンハンドラ
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Enterキーでスナップショット作成（改行＝1つの操作の区切り）
    if (e.key === 'Enter' && ref.current) {
      console.log('[NotionEditor] Enter key pressed - creating snapshot');
      setTimeout(() => {
        const html = ref.current!.innerHTML;
        const taggedText = htmlToTags(html);
        console.log('[NotionEditor] Snapshot created:', taggedText);
        addToHistory(taggedText);
        console.log('[NotionEditor] History length:', history.length + 1, 'Index:', historyIndex + 1);
      }, 10);
    }
  };



  const minHeight = rows * 1.6 * 14;

  return (
    <div className="notion-editor-container">
      {/* メインエディタ */}
      <div
        ref={ref}
        id={id}
        contentEditable
        onInput={handleInput}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          setTimeout(() => setShowFloatingToolbar(false), 200);
        }}
        onMouseUp={handleSelection}
        onKeyUp={handleSelection}
        onSelect={handleSelection}
        suppressContentEditableWarning
        spellCheck={false}
        autoCorrect="off"
        autoCapitalize="off"
        data-enable-grammarly="false"
        style={{
          minHeight: `${minHeight}px`,
          padding: '12px 14px',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: isFocused ? '#3498db' : '#e0e0e0',
          borderRadius: '6px',
          fontSize: '15px',
          lineHeight: '1.6',
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica', 'Arial', sans-serif",
          outline: 'none',
          backgroundColor: '#fff',
          cursor: 'text',
          overflowY: 'auto',
          maxHeight: '400px',
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
          boxShadow: isFocused ? '0 0 0 3px rgba(52, 152, 219, 0.08)' : 'none'
        }}
        data-placeholder={placeholder}
        className="notion-editor"
      />

      {/* フローティングツールバー */}
      {showFloatingToolbar && (
        <div
          className="floating-toolbar"
          style={{
            position: 'absolute',
            top: `${toolbarPosition.top}px`,
            left: `${toolbarPosition.left}px`,
            transform: 'translateX(-50%)',
            zIndex: 1000
          }}
          onMouseDown={(e) => e.preventDefault()}
        >
          <button type="button" onClick={(e) => { e.preventDefault(); applyFormat('bold'); }} title="太字 (⌘B)">
            <strong>B</strong>
          </button>
          <button type="button" onClick={(e) => { e.preventDefault(); applyFormat('italic'); }} title="斜体 (⌘I)">
            <em>I</em>
          </button>
          <button type="button" onClick={(e) => { e.preventDefault(); applyFormat('code'); }} title="コード">
            <code>&lt;/&gt;</code>
          </button>
          <button type="button" onClick={(e) => { e.preventDefault(); applyFormat('strike'); }} title="取り消し線">
            <del>S</del>
          </button>
          
          <div className="toolbar-divider"></div>
          
          {/* 基本の4色 */}
          <button type="button" onClick={(e) => { e.preventDefault(); applyFormat('red'); }} title="赤色" style={{ color: '#e74c3c' }}>A</button>
          <button type="button" onClick={(e) => { e.preventDefault(); applyFormat('blue'); }} title="青色" style={{ color: '#3498db' }}>A</button>
          <button type="button" onClick={(e) => { e.preventDefault(); applyFormat('green'); }} title="緑色" style={{ color: '#27ae60' }}>A</button>
          <button type="button" onClick={(e) => { e.preventDefault(); applyFormat('orange'); }} title="オレンジ" style={{ color: '#f39c12' }}>A</button>
          
          {/* 追加色（展開式） */}
          {showMoreColors && (
            <>
              <button type="button" onClick={(e) => { e.preventDefault(); applyFormat('purple'); }} title="紫色" style={{ color: '#9b59b6' }}>A</button>
              <button type="button" onClick={(e) => { e.preventDefault(); applyFormat('pink'); }} title="ピンク" style={{ color: '#e91e63' }}>A</button>
              <button type="button" onClick={(e) => { e.preventDefault(); applyFormat('yellow'); }} title="黄色" style={{ color: '#f1c40f' }}>A</button>
              <button type="button" onClick={(e) => { e.preventDefault(); applyFormat('brown'); }} title="茶色" style={{ color: '#8b4513' }}>A</button>
              <button type="button" onClick={(e) => { e.preventDefault(); applyFormat('gray'); }} title="グレー" style={{ color: '#7f8c8d' }}>A</button>
              <button type="button" onClick={(e) => { e.preventDefault(); applyFormat('black'); }} title="黒色" style={{ color: '#2c3e50' }}>A</button>
              <button type="button" onClick={(e) => { e.preventDefault(); applyFormat('cyan'); }} title="シアン" style={{ color: '#00bcd4' }}>A</button>
              <button type="button" onClick={(e) => { e.preventDefault(); applyFormat('lime'); }} title="ライム" style={{ color: '#8bc34a' }}>A</button>
            </>
          )}
          
          {/* もっと見る/閉じるボタン */}
          <button 
            type="button"
            onClick={(e) => { e.preventDefault(); setShowMoreColors(!showMoreColors); }} 
            title={showMoreColors ? '色を閉じる' : 'もっと色を見る'}
            style={{ fontSize: '10px' }}
          >
            {showMoreColors ? '▲' : '▼'}
          </button>
          
          {/* カスタムカラーボタン */}
          <button 
            type="button"
            onClick={(e) => { e.preventDefault(); setColorPickerOpen(true); }} 
            title="カスタムカラー"
            style={{ fontSize: '14px' }}
          >
            🎨
          </button>
        </div>
      )}
      
      {/* カスタムカラーピッカーダイアログ */}
      <Dialog
        open={colorPickerOpen}
        onClose={() => setColorPickerOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>カスタムカラーを選択</DialogTitle>
        <DialogContent>
          <div style={{ padding: '20px 0' }}>
            {/* カラーピッカー */}
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <input
                type="color"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                style={{
                  width: '200px',
                  height: '100px',
                  border: '2px solid #ddd',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              />
              <div style={{ marginTop: '16px', fontSize: '14px', color: '#666' }}>
                選択中の色: <strong style={{ color: customColor }}>{customColor.toUpperCase()}</strong>
              </div>
            </div>

            {/* カラー履歴 */}
            {colorHistory.length > 0 && (
              <div style={{ marginTop: '24px' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '12px' 
                }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#555' }}>
                    📋 最近使った色
                  </div>
                  <Button 
                    size="small" 
                    onClick={clearColorHistory}
                    sx={{ fontSize: '11px', textTransform: 'none' }}
                  >
                    クリア
                  </Button>
                </div>
                <div style={{ 
                  display: 'flex', 
                  gap: '8px', 
                  flexWrap: 'wrap',
                  padding: '12px',
                  background: '#f5f5f5',
                  borderRadius: '8px'
                }}>
                  {colorHistory.map((color, index) => {
                    const isSelected = customColor.toLowerCase() === color.toLowerCase();
                    return (
                      <Tooltip key={index} title={color.toUpperCase()}>
                        <div
                          onClick={() => setCustomColor(color)}
                          style={{
                            width: '40px',
                            height: '40px',
                            backgroundColor: color,
                            borderRadius: '6px',
                            cursor: 'pointer',
                            borderWidth: isSelected ? '3px' : '2px',
                            borderStyle: 'solid',
                            borderColor: isSelected ? '#1976d2' : '#ddd',
                            transition: 'transform 0.2s, border-width 0.2s, border-color 0.2s',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                          }}
                        />
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setColorPickerOpen(false)}>
            キャンセル
          </Button>
          <Button onClick={applyCustomColor} variant="contained">
            適用
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default NotionEditor;
