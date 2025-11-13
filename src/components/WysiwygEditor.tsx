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
    
    // プレースホルダーマップ（カスタムタグ内のHTMLエスケープ文字を保護）
    const placeholders: { [key: string]: string } = {};
    let placeholderCount = 0;
    
    // 1. カスタムタグ内の内容を一時的にプレースホルダーに置き換え
    // カスタムカラータグ [color=#XXXXXX]...[/color]
    html = html.replace(/(\[color=#[0-9A-Fa-f]{6}\])(.*?)(\[\/color\])/g, (match, openTag, content, closeTag) => {
      const placeholder = `___PLACEHOLDER_${placeholderCount}___`;
      placeholders[placeholder] = content;
      placeholderCount++;
      return openTag + placeholder + closeTag;
    });
    
    // プリセットカラータグ
    html = html.replace(/(\[(?:red|blue|green|orange|purple|pink|yellow|brown|gray|black|cyan|lime|xsmall|small|large|xlarge)\])(.*?)(\[\/(?:red|blue|green|orange|purple|pink|yellow|brown|gray|black|cyan|lime|xsmall|small|large|xlarge)\])/g, (match, openTag, content, closeTag) => {
      const placeholder = `___PLACEHOLDER_${placeholderCount}___`;
      placeholders[placeholder] = content;
      placeholderCount++;
      return openTag + placeholder + closeTag;
    });
    
    // マークダウン風タグも同様に
    html = html.replace(/(\*\*)(.*?)(\*\*)/g, (match, open, content, close) => {
      const placeholder = `___PLACEHOLDER_${placeholderCount}___`;
      placeholders[placeholder] = content;
      placeholderCount++;
      return open + placeholder + close;
    });
    
    html = html.replace(/(\*)(.*?)(\*)/g, (match, open, content, close) => {
      const placeholder = `___PLACEHOLDER_${placeholderCount}___`;
      placeholders[placeholder] = content;
      placeholderCount++;
      return open + placeholder + close;
    });
    
    html = html.replace(/(`)(.*?)(`)/g, (match, open, content, close) => {
      const placeholder = `___PLACEHOLDER_${placeholderCount}___`;
      placeholders[placeholder] = content;
      placeholderCount++;
      return open + placeholder + close;
    });
    
    html = html.replace(/(~~)(.*?)(~~)/g, (match, open, content, close) => {
      const placeholder = `___PLACEHOLDER_${placeholderCount}___`;
      placeholders[placeholder] = content;
      placeholderCount++;
      return open + placeholder + close;
    });
    
    // 2. HTMLエスケープ（タグ外の<>を保護）
    html = html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    
    // 3. カスタムタグをHTMLに変換
    html = html
      // カスタムカラータグ [color=#XXXXXX]
      .replace(/\[color=(#[0-9A-Fa-f]{6})\](.*?)\[\/color\]/g, '<span style="color: $1; font-weight: 600;">$2</span>')
      // プリセット色タグ (12色)
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
    
    // 4. プレースホルダーを元のコンテンツに戻す（HTMLエスケープして）
    Object.keys(placeholders).forEach(placeholder => {
      const content = placeholders[placeholder];
      // HTMLエンティティに変換してから戻す
      const escapedContent = content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      html = html.replace(placeholder, escapedContent);
    });
    
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
      // カスタムカラータグ（任意のHEXカラー）
      .replace(/<span style="color: (#[0-9A-Fa-f]{6}); font-weight: 600;">(.*?)<\/span>/g, '[color=$1]$2[/color]')
      // プリセット色タグ (12色)
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
