/**
 * @fileoverview 学習セクションコンポーネント
 *
 * このコンポーネントは、語句の学習機能を提供します。
 * フラッシュカード形式での学習セッションを管理します。
 *
 * @author Yusei Maekawa
 * @version 1.0.0
 * @since 2025-08-01
 */

/**
 * @typedef {Object} StudySectionProps
 * @property {Term[]} terms - 学習対象となる語句データの配列
 * @property {string} activeCategory - 現在選択されているカテゴリ
 */

import React, { useEffect } from 'react';
import { Term } from '../types';
import { useStudySession } from '../hooks/useStudySession';
import { getCategoryName, getCategoryColor } from '../utils/helpers';

interface StudySectionProps {
  terms: Term[];
  activeCategory: string;
}

/**
 * 学習セクションコンポーネント
 *
 * 主な機能：
 * - フラッシュカード形式の学習
 * - 学習進捗の表示
 * - 答えの表示/非表示切り替え
 * - 次の語句への移動
 * - 学習セッションの開始・終了
 * - リッチテキストのレンダリング
 *
 * @component
 * @param {StudySectionProps} props - コンポーネントのプロパティ
 * @returns {JSX.Element} 学習セクションのJSX要素
 *
 * @example
 * ```tsx
 * <StudySection
 *   terms={terms}
 *   activeCategory="programming"
 * />
 * ```
 */
const StudySection: React.FC<StudySectionProps> = ({ terms, activeCategory }) => {
  /**
   * useStudySessionフックから学習セッションの状態と関数を取得
   */
  const {
    session,        // 現在の学習セッション状態
    startSession,   // セッション開始関数
    showAnswer,     // 答え表示関数
    nextTerm,       // 次の語句へ移動関数
    endSession,     // セッション終了関数
    getCurrentTerm, // 現在の語句取得関数
    getProgress,    // 進捗取得関数
    isSessionComplete // セッション完了判定関数
  } = useStudySession();

  /**
   * アクティブカテゴリでフィルタリングされた語句リスト
   * @type {Term[]}
   */
  const filteredTerms = activeCategory === 'all' ? terms : terms.filter(term => term.category === activeCategory);

  /**
   * 現在学習中の語句
   * @type {Term | null}
   */
  const currentTerm = getCurrentTerm();

  /**
   * 学習進捗情報
   * @type {{current: number, total: number, percentage: number}}
   */
  const progress = getProgress();

  /**
   * リッチテキストを安全にレンダリングする関数
   * マークダウン記法やHTMLタグを適切に処理して表示します
   *
   * @param {string} text - レンダリングするテキスト
   * @param {boolean} [isModal=false] - モーダル内での使用かどうか
   * @returns {string} HTML文字列
   */
  const renderRichText = (text: string, isModal: boolean = false) => {
    if (!text) return '';
    
    try {
      console.log('StudySection renderRichText:', { text: text.substring(0, 100), isModal });
      
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
      
      // マークダウン形式の画像を検出して変換 ![画像](data:image/...)
      formattedText = formattedText.replace(
        /!\[画像\]\((data:image\/[a-zA-Z0-9+\/;=,]+)\)/g, 
        (match, dataUrl) => {
          console.log('StudySection: マークダウン画像検出:', { match: match.substring(0, 50), dataUrl: dataUrl.substring(0, 50) });
          return `<div class="uploaded-image-container"><img src="${dataUrl}" alt="画像" class="uploaded-image" /></div>`;
        }
      );
      
      // 任意のテキストでの画像を検出 ![テキスト](data:image/...)
      formattedText = formattedText.replace(
        /!\[.*?\]\((data:image\/[a-zA-Z0-9+\/;=,]+)\)/g, 
        (match, dataUrl) => {
          console.log('StudySection: 任意マークダウン画像検出:', { match: match.substring(0, 50), dataUrl: dataUrl.substring(0, 50) });
          return `<div class="uploaded-image-container"><img src="${dataUrl}" alt="画像" class="uploaded-image" /></div>`;
        }
      );
      
      // 直接のBase64データを検出（マークダウンでラップされていない場合）
      formattedText = formattedText.replace(
        /data:image\/[a-zA-Z0-9+\/;=,]+/g,
        (match) => {
          console.log('StudySection: 直接Base64画像検出:', { match: match.substring(0, 50) });
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
      
      return formattedText;
    } catch (error) {
      console.error('StudySection renderRichText error:', error);
      return text.replace(/\n/g, '<br>');
    }
  };

  // セッションが完了したら自動的に終了
  useEffect(() => {
    if (isSessionComplete()) {
      setTimeout(() => {
        endSession();
      }, 1000);
    }
  }, [isSessionComplete, endSession]);

  const handleStartSession = () => {
    if (filteredTerms.length === 0) {
      alert('学習できる語句がありません。まず語句を追加してください。');
      return;
    }
    startSession(filteredTerms);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (!session.isActive) return;
    
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (!session.showAnswer) {
        showAnswer();
      } else {
        nextTerm();
      }
    } else if (e.key === 'Escape') {
      endSession();
    }
  };

  return (
    <section className="section">
      <h2>語句学習</h2>
      
      {session.isActive && (
        <div className="study-info">
          <div className="progress-info">
            {getCategoryName(activeCategory)} - {progress.current}/{progress.total} ({progress.percentage}%)
          </div>
        </div>
      )}
      
      <div className="study-controls">
        {!session.isActive ? (
          <button className="btn" onClick={handleStartSession}>
            ランダム表示
          </button>
        ) : (
          <>
            {!session.showAnswer ? (
              <button className="btn" onClick={showAnswer}>
                答えを表示
              </button>
            ) : (
              <>
                <button className="btn" onClick={nextTerm}>
                  次の語句
                </button>
                <button className="btn btn-danger" onClick={endSession}>
                  学習終了
                </button>
              </>
            )}
          </>
        )}
      </div>

      {session.isActive && currentTerm && (
        <div 
          className="study-card"
          onKeyDown={handleKeyPress}
          tabIndex={0}
        >
          {!session.showAnswer ? (
            <div className="card-front">
              <h3>{currentTerm.term}</h3>
              <span 
                className="category-tag"
                style={{ backgroundColor: getCategoryColor(currentTerm.category) }}
              >
                {getCategoryName(currentTerm.category)}
              </span>
            </div>
          ) : (
            <div className="card-back">
              <h4>意味・説明:</h4>
              <div dangerouslySetInnerHTML={{ __html: renderRichText(currentTerm.meaning) }} />
              <h4>例文・使用例・スクショ等:</h4>
              <div dangerouslySetInnerHTML={{ __html: renderRichText(currentTerm.example || '例文なし') }} />
            </div>
          )}
        </div>
      )}

      {!session.isActive && (
        <div className="study-card">
          <p>学習する語句を選択してください</p>
          <p style={{ fontSize: '0.9rem', color: '#666', marginTop: '10px' }}>
            ヒント: スペースキーやEnterキーで学習を進められます
          </p>
        </div>
      )}

      {isSessionComplete() && (
        <div className="study-card">
          <h3>🎉 学習完了!</h3>
          <p>{progress.total}個の語句を確認しました。</p>
        </div>
      )}
    </section>
  );
};

export default StudySection;
