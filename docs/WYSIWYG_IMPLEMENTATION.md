# WYSIWYG編集機能 実装ドキュメント

## 📅 実装日
2025年11月3日

## 🎯 実装目的
書式タグ（`[red][/red]`、`**太字**`等）が編集時に視認性を損なう問題を解決し、装飾された状態で直感的に編集できるWYSIWYG編集機能を実装する。

---

## 🚀 主な変更内容

### 1. WysiwygEditorコンポーネントの作成
**ファイル**: `src/components/WysiwygEditor.tsx`

#### 概要
`contentEditable`を使用したリッチテキストエディタコンポーネント。カスタムタグ形式（`[red][/red]`等）を内部的に保持しながら、表示はHTML装飾された状態で行う。

#### 主な機能
- **カスタムタグ→HTML変換** (`tagsToHtml`関数)
  - `[red]テキスト[/red]` → `<span style="color: #e74c3c; font-weight: 600;">テキスト</span>`
  - `**太字**` → `<strong>太字</strong>`
  - `*斜体*` → `<em>斜体</em>`
  - 色タグ: red, blue, green, orange, purple, pink
  - サイズタグ: xsmall, small, large, xlarge

- **HTML→カスタムタグ変換** (`htmlToTags`関数)
  - 編集後のHTMLを再びカスタムタグ形式に戻してデータを保存
  - HTMLエンティティのエスケープ/デコード処理

- **プレーンテキストペースト**
  - ペースト時に書式を除去し、プレーンテキストとして挿入

- **スタイリング**
  - フォーカス時のボーダーハイライト
  - プレースホルダー表示
  - カスタムスクロールバー

#### プロパティ
```typescript
interface WysiwygEditorProps {
  value: string;              // カスタムタグ形式のテキスト
  onChange: (value: string) => void; // 変更時のコールバック
  placeholder?: string;       // プレースホルダーテキスト
  rows?: number;              // 高さ（行数）
  id?: string;                // 要素ID
  onSelect?: () => void;      // テキスト選択時のコールバック
  editorRef?: React.RefObject<HTMLDivElement>; // 外部からのRef
}
```

---

### 2. AddTermForm.tsxの変更

#### 変更点
1. **WysiwygEditorのインポート**
   ```typescript
   import WysiwygEditor from './WysiwygEditor';
   ```

2. **Refの型変更**
   ```typescript
   // 変更前
   const meaningTextareaRef = useRef<HTMLTextAreaElement>(null);
   const exampleTextareaRef = useRef<HTMLTextAreaElement>(null);
   
   // 変更後
   const meaningTextareaRef = useRef<HTMLDivElement>(null);
   const exampleTextareaRef = useRef<HTMLDivElement>(null);
   ```

3. **textareaをWysiwygEditorに置き換え**
   ```tsx
   {/* 変更前 */}
   <textarea
     id="meaning"
     ref={meaningTextareaRef}
     value={formData.meaning}
     onChange={(e) => handleInputChange('meaning', e.target.value)}
     // ...
   />
   
   {/* 変更後 */}
   <WysiwygEditor
     id="meaning"
     value={formData.meaning}
     onChange={(value) => handleInputChange('meaning', value)}
     onSelect={() => handleTextSelection('meaning')}
     placeholder="テキストを入力してください。書式ツールバーから装飾を適用できます。"
     rows={6}
     editorRef={meaningTextareaRef}
   />
   ```

4. **handleTextSelection関数の修正**
   ```typescript
   // window.getSelection()を使用
   const selection = window.getSelection();
   const selectedText = selection.toString();
   ```

5. **applyFormat関数の簡素化**
   - WYSIWYGでは固定ツールバーを使わないため、アラート表示のみに変更

6. **applyFormatWithSelection関数の修正**
   - `textarea.value.substring()`の代わりに、formData内でテキストを検索
   - `setSelectionRange`の削除（contentEditableでは使用不可）

---

### 3. EditTermModal.tsxの変更

AddTermForm.tsxと同様の変更を適用：
- WysiwygEditorのインポート
- Refの型変更（HTMLDivElement）
- textareaをWysiwygEditorに置き換え
- handleTextSelection関数の修正
- applyFormat/applyFormatWithSelection関数の修正

---

### 4. App.cssの変更

WYSIWYGエディタ用のスタイルを追加：

```css
/* プレースホルダー表示 */
.wysiwyg-editor:empty:before {
  content: attr(data-placeholder);
  color: #95a5a6;
  pointer-events: none;
  font-style: italic;
}

/* コードタグのスタイル */
.wysiwyg-editor code {
  background-color: #ecf0f1;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 0.9em;
}

/* 取り消し線の色 */
.wysiwyg-editor del {
  color: #95a5a6;
}

/* カスタムスクロールバー */
.wysiwyg-editor::-webkit-scrollbar {
  width: 8px;
}

.wysiwyg-editor::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.wysiwyg-editor::-webkit-scrollbar-thumb {
  background: #bdc3c7;
  border-radius: 4px;
}

.wysiwyg-editor::-webkit-scrollbar-thumb:hover {
  background: #95a5a6;
}
```

---

## 🐛 修正したバグ

### 1. `textarea.setSelectionRange is not a function`
**原因**: contentEditableには`setSelectionRange`メソッドが存在しない

**修正**: 
- `applyFormatWithSelection`関数から`setSelectionRange`呼び出しを削除
- フォーカスのみを戻すように変更

### 2. `Cannot read properties of undefined (reading 'substring')`
**原因**: contentEditableには`value`プロパティが存在せず、`textarea.value.substring()`がエラー

**修正**:
- formDataから直接値を取得するように変更
- 選択されたテキストをformData内で検索して置き換える方式に変更

```typescript
// 修正前
const currentValue = formData[field];
const newValue = currentValue.substring(0, start) + formattedText + currentValue.substring(end);

// 修正後
const currentValue = formData[field] || '';
const index = currentValue.indexOf(selectedText);
if (index !== -1) {
  const newValue = currentValue.substring(0, index) + formattedText + currentValue.substring(index + selectedText.length);
  handleInputChange(field, newValue);
}
```

### 3. 選択した文字列が編集後に重複して表示される
**原因**: 
- WYSIWYGエディタでは、選択範囲の正確な位置（start/end）が取得できない
- `selectionStart`/`selectionEnd`がcontentEditableでは機能しない

**修正**:
- 選択されたテキストをformData内で検索
- 最初に見つかった箇所を書式付きテキストで置き換え
- 見つからない場合は末尾に追加

---

## 🎨 ユーザーエクスペリエンスの改善

### 変更前
```
[red]重要な単語[/red]を覚える

**太字**や*斜体*が使える

[large]大きな文字[/large]
```
👆 タグが見えて読みづらい、編集しづらい

### 変更後
```
重要な単語を覚える  ← 赤色・太字で表示

太字や斜体が使える  ← 実際に太字・斜体で表示

大きな文字  ← 実際に大きく表示
```
👆 タグは非表示、装飾された状態で編集可能

---

## 📝 内部データの保持

WYSIWYGエディタは表示上はHTML装飾されているが、内部的にはカスタムタグ形式でデータを保持：

```typescript
// 表示: <span style="color: #e74c3c;">重要</span>
// 保存: [red]重要[/red]
```

これにより、データベースへの保存形式は変更せず、UI/UXのみを改善。

---

## 🔄 変換フロー

```
ユーザー入力
    ↓
contentEditable (HTML形式で表示)
    ↓
onChange発火
    ↓
htmlToTags関数でカスタムタグに変換
    ↓
formDataに保存 ([red][/red]形式)
    ↓
データベースに保存
```

```
データベースから読み込み
    ↓
formDataに格納 ([red][/red]形式)
    ↓
tagsToHtml関数でHTMLに変換
    ↓
contentEditableに表示 (<span style="...">形式)
```

---

## 🚀 次のステップ

### 完了項目
- ✅ WYSIWYGエディタコンポーネント作成
- ✅ AddTermFormへの適用
- ✅ EditTermModalへの適用
- ✅ バグ修正（setSelectionRange、substring、重複表示）

### 今後の改善案
- [ ] 固定ツールバーの完全削除または非表示化
- [ ] フローティングツールバーの位置調整
- [ ] カラーピッカーの拡張（12色＋RGB）
- [ ] カスタムカラーの保存機能
- [ ] Undo/Redo機能の追加
- [ ] ドラッグ＆ドロップでの画像挿入
- [ ] キーボードショートカット（Ctrl+B、Ctrl+I等）

---

## 📚 参考資料

- [MDN: contentEditable](https://developer.mozilla.org/ja/docs/Web/HTML/Global_attributes/contenteditable)
- [MDN: Selection API](https://developer.mozilla.org/ja/docs/Web/API/Selection)
- [React Controlled Components](https://react.dev/learn/sharing-state-between-components)

---

## 👤 作成者
Yusei Maekawa

## 📅 最終更新日
2025年11月3日
