# バグ修正履歴

このファイルは、アプリケーション開発中に発生したバグとその修正内容を記録します。
バグ修正の積み重ねが、アプリの品質向上と進化につながります。

## フォーマット
各バグ修正は以下の形式で記録します：
- **日付**: バグ修正日
- **バージョン**: 修正時のバージョン
- **重要度**: 🔴Critical / 🟠High / 🟡Medium / 🟢Low
- **カテゴリ**: UI/UX, データ処理, パフォーマンス, セキュリティ など
- **問題**: バグの内容と発生条件
- **原因**: なぜバグが発生したか
- **修正内容**: どのように修正したか
- **影響範囲**: どのファイル・機能が変更されたか
- **コミットID**: 関連するgitコミット

---

## 2025年11月2日

### 🟠 プレビューでHTMLタグが表示される問題

**バージョン**: v0.4.0-dev  
**カテゴリ**: UI/UX  
**コミットID**: `0d82d95`

#### 問題
- 語句追加・編集画面のプレビューで、画像のHTMLタグ（`alt="画像1" class="uploaded-image" style="..."`）が生のテキストとして表示されてしまう
- ユーザーに技術的な情報が見えてしまい、UXが悪い
- ITに詳しくないユーザーには混乱を招く

#### 原因
1. `renderRichText`関数で画像をHTMLタグに変換
2. その後のHTML除去処理で画像タグも部分的に除去されてしまう
3. 結果として不完全なHTMLタグの文字列が残る

```typescript
// 問題のあったコード
formattedText = formattedText.replace(/\[画像(\d+)\]/g, (match, imageNum) => {
  return `<img src="${imageData}" alt="画像${imageNum}" class="uploaded-image" />`;
});
// この後のHTML除去処理で部分的に削除される
formattedText = formattedText.replace(/<[^>]*>/g, '');
```

#### 修正内容
**プレースホルダー方式の導入**：
1. 画像HTMLタグを生成する前に、一時的なプレースホルダー（`___IMAGE_PLACEHOLDER_0___`など）に置き換え
2. HTML除去処理を実行（プレースホルダーは保護される）
3. すべての処理が完了した後、プレースホルダーを実際の画像HTMLに戻す

```typescript
// 修正後のコード
const imageMarkers: { [key: string]: string } = {};
let imageCount = 0;

// Step 1: 画像をプレースホルダーに置き換え
formattedText = formattedText.replace(/\[画像(\d+)\]/g, (match, imageNum) => {
  const placeholder = `___IMAGE_PLACEHOLDER_${imageCount}___`;
  imageMarkers[placeholder] = `<img src="${imageData}" alt="画像${imageNum}" />`;
  imageCount++;
  return placeholder;
});

// Step 2: HTML除去処理（プレースホルダーは保護される）
formattedText = formattedText.replace(/<[^>]*>/g, '');

// Step 3: 最後にプレースホルダーを実際のHTMLに戻す
Object.keys(imageMarkers).forEach(placeholder => {
  formattedText = formattedText.replace(placeholder, imageMarkers[placeholder]);
});
```

#### 影響範囲
- `src/components/AddTermForm.tsx` - `renderRichText`関数
- `src/components/EditTermModal.tsx` - `renderRichText`関数
- `src/components/TermsList.tsx` - `renderRichText`関数

#### 学んだこと
- HTMLの動的生成と除去処理の順序が重要
- ユーザー向けテキスト処理では、技術的な情報を完全に隠す必要がある
- プレースホルダーパターンは複雑な文字列処理で有効

---

### 🟡 EditTermModalでisModalパラメータが渡されていない

**バージョン**: v0.4.0-dev  
**カテゴリ**: バグ修正  
**関連コミット**: 同上（`0d82d95`）

#### 問題
- `EditTermModal`のプレビューで`renderRichText`関数を呼び出す際、`isModal`パラメータを渡していなかった
- デフォルト値の`false`が使われ、画像処理が正しく動作しない可能性があった

#### 原因
- コピー＆ペーストで関数呼び出しを追加した際、パラメータの追加を忘れた

```typescript
// 問題のあったコード
dangerouslySetInnerHTML={{ __html: renderRichText(formData.meaning) }}
dangerouslySetInnerHTML={{ __html: renderRichText(formData.example) }}
```

#### 修正内容
- `isModal: true`パラメータを追加

```typescript
// 修正後のコード
dangerouslySetInnerHTML={{ __html: renderRichText(formData.meaning, true) }}
dangerouslySetInnerHTML={{ __html: renderRichText(formData.example, true) }}
```

#### 影響範囲
- `src/components/EditTermModal.tsx` - プレビュー表示部分（2箇所）

#### 学んだこと
- 関数のデフォルトパラメータに頼りすぎない
- コードレビュー時は関数呼び出しの引数も確認する

---

## 2025年11月3日

### 🔴 HTMLタグ記号（`<>`）が消える問題

**バージョン**: v0.4.0-dev  
**カテゴリ**: データ処理  
**重要度**: 🔴Critical  
**コミットID**: `8385e06`

#### 問題
- ユーザーが「意味・説明」や「例文」で`<`や`>`を使うと、保存後に消えてしまう
- 例：「`<div>`タグを使う」→「タグを使う」になる
- プログラミング用語を扱うアプリなのに、コード記号が使えない致命的なバグ

#### 原因
- base64画像対策として追加した`replace(/<[^>]*>/g, '')`処理が、ユーザーが入力した`<>`記号も削除してしまっていた
- HTMLインジェクション対策が過剰だった

```typescript
// 問題のあったコード（AddTermForm.tsx）
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // ❌ ユーザー入力の<>も削除されてしまう
  const cleanedMeaning = formData.meaning.replace(/<[^>]*>/g, '');
  const cleanedExample = formData.example.replace(/<[^>]*>/g, '');
  
  onAddTerm({
    ...formData,
    meaning: cleanedMeaning,
    example: cleanedExample,
  });
};
```

#### 修正内容
1. **HTML除去処理を削除**：ユーザー入力の`<>`を保持
2. **renderRichText関数でエスケープ**：表示時に安全にHTMLエスケープ
3. **base64画像は別途処理**：`dangerouslySetInnerHTML`使用時のみ注意

```typescript
// 修正後のコード
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // ✅ HTML除去処理を削除、生データをそのまま保存
  onAddTerm({
    ...formData,
    meaning: formData.meaning,
    example: formData.example,
  });
};

// renderRichText関数内で適切にエスケープ
const renderRichText = (text: string) => {
  let formattedText = text
    .replace(/&/g, '&amp;')   // &を最初にエスケープ
    .replace(/</g, '&lt;')    // <をエスケープ
    .replace(/>/g, '&gt;');   // >をエスケープ
  
  // その後、カスタムタグを処理
  formattedText = formattedText
    .replace(/\[red\](.*?)\[\/red\]/g, '<span style="color: #e74c3c;">$1</span>')
    // ...
  
  return formattedText;
};
```

#### 影響範囲
- `src/components/AddTermForm.tsx` - `handleSubmit`関数、`renderRichText`関数
- `src/components/EditTermModal.tsx` - `handleSubmit`関数、`renderRichText`関数
- `src/components/TermsList.tsx` - `renderRichText`関数

#### 学んだこと
- ユーザー入力を削除するのではなく、表示時にエスケープする方が安全
- XSS対策はReactの`dangerouslySetInnerHTML`を慎重に使うことで対応
- プログラミング学習アプリでは、コード記号の入力が必須要件

---

### 🟡 フローティングツールバーの選択範囲が見えなくなる問題

**バージョン**: v0.4.0-dev  
**カテゴリ**: UI/UX  
**重要度**: 🟡Medium  
**コミットID**: `5bdc1c2`, `624eb5b`

#### 問題
- テキストを選択してフローティングツールバーが表示されると、選択部分が見えなくなる
- どのテキストに書式を適用しようとしているか分からない
- ツールバーをクリックした瞬間に選択が解除されてしまう

#### 原因
1. Popoverがフォーカスを奪うため、選択がクリアされる
2. 選択範囲の情報が保存されていない
3. ツールバー表示で選択部分が隠れる

#### 修正内容（2段階）

**第1段階**（コミット`5bdc1c2`）：
- フローティングツールバーをカーソル位置に表示
- Material-UIの`Popover`コンポーネントを使用
- テキスト選択時に`handleTextSelection`関数を実行

```typescript
const handleTextSelection = (field: 'meaning' | 'example') => {
  const textarea = document.getElementById(field) as HTMLTextAreaElement;
  if (!textarea) return;
  
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = textarea.value.substring(start, end);
  
  if (selectedText.length > 0) {
    setFloatingToolbar({
      anchorEl: textarea,
      field: field
    });
  }
};
```

**第2段階**（コミット`624eb5b`）：
- 選択範囲情報（start/end/selectedText）を状態として保存
- ツールバー上部に選択中のテキストを表示（50文字まで）
- 書式適用時は保存した選択範囲を使用

```typescript
const [floatingToolbar, setFloatingToolbar] = useState<{
  anchorEl: HTMLElement | null;
  field: 'meaning' | 'example' | null;
  selectedText: string;        // ✅ 追加
  selectionStart: number;      // ✅ 追加
  selectionEnd: number;        // ✅ 追加
}>({
  anchorEl: null,
  field: null,
  selectedText: '',
  selectionStart: 0,
  selectionEnd: 0
});

// ツールバー内で選択テキストを表示
<div style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
  <Typography variant="caption" color="text.secondary">
    選択中: {floatingToolbar.selectedText.substring(0, 50)}
    {floatingToolbar.selectedText.length > 50 && '...'}
  </Typography>
</div>
```

#### 影響範囲
- `src/components/AddTermForm.tsx` - フローティングツールバー実装
- `src/components/EditTermModal.tsx` - フローティングツールバー実装

#### 学んだこと
- Popoverは`disableRestoreFocus`を使ってもフォーカス管理が難しい
- 選択範囲情報を状態として保存することで、フォーカスが移動しても書式適用可能
- UXでは「今何をしているか」の視覚的フィードバックが重要

----

### 🔴 `textarea.setSelectionRange is not a function` エラー

**バージョン**: v0.4.0-dev  
**カテゴリ**: WYSIWYG編集機能実装  
**重要度**: 🔴Critical

#### 問題
- WYSIWYG編集機能実装後、書式を適用しようとすると`textarea.setSelectionRange is not a function`エラーが発生
- アプリケーションが動作しない重大なバグ

#### 原因
- `contentEditable` divには`setSelectionRange`メソッドが存在しない
- textareaからWYSIWYGエディタに変更したが、古いAPIを使用していた

```typescript
// 問題のあったコード
setTimeout(() => {
  textarea.focus();
  textarea.setSelectionRange(start, start + formattedText.length); // ❌ エラー
}, 0);
```

#### 修正内容
- `setSelectionRange`呼び出しを削除
- フォーカスのみを戻すように変更

```typescript
// 修正後のコード
setTimeout(() => {
  textarea.focus(); // ✅ フォーカスのみ
}, 0);
```

#### 影響範囲
- `src/components/AddTermForm.tsx` - `applyFormatWithSelection`関数
- `src/components/EditTermModal.tsx` - `applyFormatWithSelection`関数

---

### 🔴 `Cannot read properties of undefined (reading 'substring')` エラー

**バージョン**: v0.4.0-dev  
**カテゴリ**: WYSIWYG編集機能実装  
**重要度**: 🔴Critical

#### 問題
- フローティングツールバーから書式を適用しようとすると`Cannot read properties of undefined (reading 'substring')`エラーが発生
- 書式適用機能が完全に動作しない

#### 原因
- `contentEditable` divには`value`プロパティが存在しない
- `textarea.value.substring()`がエラーを引き起こす

```typescript
// 問題のあったコード
const start = textarea.selectionStart; // ❌ undefined
const end = textarea.selectionEnd;     // ❌ undefined
const selectedText = textarea.value.substring(start, end); // ❌ エラー

const currentValue = formData[field];
const newValue = currentValue.substring(0, start) + formattedText + currentValue.substring(end);
```

#### 修正内容
1. `applyFormat`関数を簡素化（WYSIWYGではフローティングツールバーのみ使用）
2. `applyFormatWithSelection`関数で、formData内でテキストを検索して置き換える方式に変更

```typescript
// 修正後のコード
const applyFormat = (field: 'meaning' | 'example', format: string) => {
  // WYSIWYGエディタではフローティングツールバーを使用するため、この関数は呼ばれない
  alert('テキストを選択してからフローティングツールバーで書式を適用してください。');
};

const applyFormatWithSelection = (
  field: 'meaning' | 'example', 
  format: string, 
  selectedText: string, 
  start: number, 
  end: number
) => {
  // WYSIWYGエディタでは、選択されたテキストをformData内で検索して置き換え
  const currentValue = formData[field] || '';
  const index = currentValue.indexOf(selectedText);
  
  if (index !== -1) {
    // 最初に見つかった箇所を置き換え
    const newValue = currentValue.substring(0, index) + formattedText + currentValue.substring(index + selectedText.length);
    handleInputChange(field, newValue);
  } else {
    // 見つからない場合は末尾に追加
    const newValue = currentValue + formattedText;
    handleInputChange(field, newValue);
  }
};
```

#### 影響範囲
- `src/components/AddTermForm.tsx` - `applyFormat`, `applyFormatWithSelection`関数
- `src/components/EditTermModal.tsx` - `applyFormat`, `applyFormatWithSelection`関数

---

### 🟠 選択した文字列が編集後に重複して表示される

**バージョン**: v0.4.0-dev  
**カテゴリ**: WYSIWYG編集機能実装  
**重要度**: 🟠High

#### 問題
- テキストを選択してフローティングツールバーから書式を適用すると、選択したテキストが重複して表示される
- 例：「テスト」を赤色にすると「テスト[red]テスト[/red]」のように二重に表示される

#### 原因
- WYSIWYGエディタでは`selectionStart`/`selectionEnd`が正確に取得できない
- contentEditableの選択範囲とformDataの文字列位置が一致しない
- 誤った位置に書式が挿入される

#### 修正内容
- 選択範囲の位置情報（start/end）に頼らず、選択されたテキスト自体をformData内で検索
- 最初に見つかった箇所を書式付きテキストで置き換える方式に変更

```typescript
// 修正後のアプローチ
const currentValue = formData[field] || '';
const index = currentValue.indexOf(selectedText); // テキストを検索

if (index !== -1) {
  // 見つかった位置で置き換え
  const newValue = currentValue.substring(0, index) + formattedText + currentValue.substring(index + selectedText.length);
  handleInputChange(field, newValue);
}
```

#### 影響範囲
- `src/components/AddTermForm.tsx` - `applyFormatWithSelection`関数
- `src/components/EditTermModal.tsx` - `applyFormatWithSelection`関数

#### 学んだこと
- contentEditableとtextareaではAPIが大きく異なる
- 選択範囲の位置情報ではなく、選択されたテキスト内容で検索する方が堅牢
- WYSIWYG実装では従来のDOM APIが使えないことを前提に設計する必要がある

---

### 📝 WYSIWYG編集機能実装の詳細

今回のWYSIWYG編集機能実装に関する詳細なドキュメントは、以下のファイルを参照してください：

📄 **[WYSIWYG_IMPLEMENTATION.md](./WYSIWYG_IMPLEMENTATION.md)**
- 実装の目的と背景
- 変更内容の詳細
- 修正したバグの一覧
- 内部データフロー
- 今後の改善案

---

## 今後のバグ修正もここに追記していきます

各バグ修正を記録することで：
- 同じミスを繰り返さない
- 修正パターンを学習できる
- 新しいメンバーへの知識共有
- アプリケーションの品質向上の歴史を残す
