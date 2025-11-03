/**
 * @fileoverview WYSIWYGエディタコンポーネント
 * 
 * カスタムタグ形式（[red][/red]等）を使用したリッチテキストエディタ
 * contentEditableを使用してタグを表示せずに装飾された状態で編集可能
 * 
 * @author GitHub Copilot(Checker: Yusei Maekawa)
 * @version 1.0.0
 */

import React, { useRef, useEffect, useState } from 'react';

interface WysiwygEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  id?: string;
  onSelect?: () => void;
  editorRef?: React.RefObject<HTMLDivElement | null>;
}

/**
 * WYSIWYGエディタコンポーネント
 * 
 * カスタムタグをHTMLに変換して表示し、編集時にタグ形式に戻す
 */
const WysiwygEditor: React.FC<WysiwygEditorProps> = ({
  value,
  onChange,
  placeholder = 'テキストを入力...',
  rows = 4,
  id,
  onSelect,
  editorRef
}) => {
  const localRef = useRef<HTMLDivElement>(null);
  const ref = editorRef || localRef;
  const [isFocused, setIsFocused] = useState(false);

  /**
   * カスタムタグをHTMLに変換
   */
  const tagsToHtml = (text: string): string => {
    if (!text) return '';
    
    let html = text;
    
    // HTMLエスケープ（タグ以外）
    html = html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    
    // カスタムタグをHTMLに変換
    html = html
      // 色タグ
      .replace(/\[red\](.*?)\[\/red\]/g, '<span style="color: #e74c3c; font-weight: 600;">$1</span>')
      .replace(/\[blue\](.*?)\[\/blue\]/g, '<span style="color: #3498db; font-weight: 600;">$1</span>')
      .replace(/\[green\](.*?)\[\/green\]/g, '<span style="color: #27ae60; font-weight: 600;">$1</span>')
      .replace(/\[orange\](.*?)\[\/orange\]/g, '<span style="color: #f39c12; font-weight: 600;">$1</span>')
      .replace(/\[purple\](.*?)\[\/purple\]/g, '<span style="color: #9b59b6; font-weight: 600;">$1</span>')
      .replace(/\[pink\](.*?)\[\/pink\]/g, '<span style="color: #e91e63; font-weight: 600;">$1</span>')
      // サイズタグ
      .replace(/\[xsmall\](.*?)\[\/xsmall\]/g, '<span style="font-size: 0.7em;">$1</span>')
      .replace(/\[small\](.*?)\[\/small\]/g, '<span style="font-size: 0.85em;">$1</span>')
      .replace(/\[large\](.*?)\[\/large\]/g, '<span style="font-size: 1.2em;">$1</span>')
      .replace(/\[xlarge\](.*?)\[\/xlarge\]/g, '<span style="font-size: 1.5em;">$1</span>')
      // マークダウン風タグ
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
    text = text
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&');
    
    return text;
  };

  /**
   * エディタの内容を更新
   */
  useEffect(() => {
    if (ref.current && !isFocused) {
      const html = tagsToHtml(value);
      if (ref.current.innerHTML !== html) {
        ref.current.innerHTML = html;
      }
    }
  }, [value, isFocused]);

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
   * ペースト時のハンドラ（プレーンテキストとして貼り付け）
   */
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  const minHeight = rows * 1.6 * 14; // rows * line-height * font-size

  return (
    <div
      ref={ref}
      id={id}
      contentEditable
      onInput={handleInput}
      onPaste={handlePaste}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onMouseUp={onSelect}
      onSelect={onSelect}
      suppressContentEditableWarning
      style={{
        minHeight: `${minHeight}px`,
        padding: '10px',
        border: '2px solid #ddd',
        borderRadius: '8px',
        fontSize: '14px',
        lineHeight: '1.6',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        outline: 'none',
        backgroundColor: '#fff',
        cursor: 'text',
        overflowY: 'auto',
        maxHeight: '400px',
        transition: 'border-color 0.2s ease',
        ...(isFocused && {
          borderColor: '#3498db',
          boxShadow: '0 0 0 3px rgba(52, 152, 219, 0.1)'
        })
      }}
      data-placeholder={placeholder}
      className="wysiwyg-editor"
    />
  );
};

export default WysiwygEditor;
