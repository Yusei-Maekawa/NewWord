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

### 🟠 書式ボタンを2回押すとタグが重複する問題

**バージョン**: v0.4.0-dev  
**カテゴリ**: UI/UX  
**重要度**: 🟠High  
**日時**: 2025年11月3日

#### 問題
- 同じテキストに同じ書式を2回適用すると、タグが重複してしまう
- 例：「テスト」を選択して赤色を2回押すと`[red]テスト[/red]`(すべて赤文字)になる
- ユーザーは書式のON/OFF切り替え（トグル）を期待している

#### 原因
- 書式適用時に、既に書式が適用されているかチェックしていなかった
- 常に新しいタグを追加するだけのロジックだった

```typescript
// 問題のあったコード
const formattedText = `[red]${selectedText}[/red]`;
const newValue = currentValue.substring(0, index) + formattedText + ...;
// 既存の書式を考慮せず、常に追加
```

#### 修正内容
**トグル動作の実装**：
1. 書式を適用する前に、`currentValue.includes(formatPattern)`で既存書式をチェック
2. 既に書式が適用されている場合は除去（トグルOFF）
3. 書式がない場合は適用（トグルON）

```typescript
// 修正後のコード
const formatPattern = `[red]${selectedText}[/red]`;
const isFormatted = currentValue.includes(formatPattern);

if (isFormatted) {
  // 既に書式が適用されている場合は除去（トグルOFF）
  newValue = currentValue.replace(formatPattern, selectedText);
} else {
  // 書式を適用（トグルON）
  const index = currentValue.indexOf(selectedText);
  newValue = currentValue.substring(0, index) + formatPattern + currentValue.substring(index + selectedText.length);
}
```

#### 影響範囲
- `src/components/AddTermForm.tsx` - `applyFormatWithSelection`関数
- `src/components/EditTermModal.tsx` - `applyFormatWithSelection`関数

#### 学んだこと
- UI操作は直感的であるべき（同じボタンを2回押す=元に戻す）
- 状態のトグル動作はユーザビリティの基本
- 適用前に現在の状態を確認する習慣が重要

---

### 🔴 `<>`記号があると書式が反映されない問題

**バージョン**: v0.4.0-dev  
**カテゴリ**: データ処理  
**重要度**: 🔴Critical  
**日時**: 2025年11月3日 午後

#### 問題
- テキストに`<>`記号が含まれていると、色・サイズなどの書式が全く反映されない
- 例：「`<div>`タグ」に赤色を適用しても、赤くならない
- プログラミング学習アプリとして致命的

#### 原因
- WysiwygEditorの`tagsToHtml`関数で、処理順序が間違っていた
- **HTMLエスケープを先に実行** → `<` が `&lt;` に変換される
- その後カスタムタグを処理 → `[red]&lt;div&gt;[/red]` となり、正規表現がマッチしない

```typescript
// 問題のあった処理順序
// 1. HTMLエスケープ（先に実行）
html = html
  .replace(/</g, '&lt;')  // <div> → &lt;div&gt;
  .replace(/>/g, '&gt;');

// 2. カスタムタグ処理（後に実行）
html = html
  .replace(/\[red\](.*?)\[\/red\]/g, '<span style="color: #e74c3c;">$1</span>');
  // ❌ [red]<div>[/red] の<>はすでに&lt;&gt;になっているため、マッチしない
```

#### 修正内容
**プレースホルダーパターンの導入**：
1. カスタムタグ内の内容を一時的にプレースホルダー（`___PLACEHOLDER_0___`）に置き換え
2. HTMLエスケープを実行（プレースホルダーは保護される）
3. カスタムタグをHTMLに変換
4. プレースホルダーを元のコンテンツに戻す

```typescript
// 修正後のコード
const placeholders: { [key: string]: string } = {};
let placeholderCount = 0;

// 1. カスタムタグ内の内容をプレースホルダーに置き換え
html = html.replace(/(\[red\])(.*?)(\[\/red\])/g, (match, openTag, content, closeTag) => {
  const placeholder = `___PLACEHOLDER_${placeholderCount}___`;
  placeholders[placeholder] = content; // <div>を保存
  placeholderCount++;
  return openTag + placeholder + closeTag; // [red]___PLACEHOLDER_0___[/red]
});

// 2. HTMLエスケープ（タグ外のみ）
html = html
  .replace(/</g, '&lt;')  // プレースホルダー内は保護される
  .replace(/>/g, '&gt;');

// 3. カスタムタグをHTMLに変換
html = html
  .replace(/\[red\](.*?)\[\/red\]/g, '<span style="color: #e74c3c;">$1</span>');
  // ✅ [red]___PLACEHOLDER_0___[/red] → <span>___PLACEHOLDER_0___</span>

// 4. プレースホルダーを元に戻す
Object.keys(placeholders).forEach(placeholder => {
  html = html.replace(placeholder, placeholders[placeholder]); // <div>を復元
});
// 最終結果: <span style="color: #e74c3c;"><div></span> ✅ 正しく表示
```

#### 影響範囲
- `src/components/WysiwygEditor.tsx` - `tagsToHtml`関数

#### 学んだこと
- **処理順序が結果を大きく左右する**（特に文字列変換）
- エスケープ処理は「保護すべき部分」を先に退避させる
- プレースホルダーパターンは複雑な文字列処理で有効
- プログラミング学習では`<>`が頻出するため、特別な配慮が必要
- 同様の問題が過去にもあった（画像タグ問題）→ パターンとして学習すべき

---
### 🟠 色変更時に古い色タグが残る問題

**バージョン**: v0.4.0-dev  
**カテゴリ**: UI/UX  
**ブランチ**: feature/term-management

#### 問題
- WYSIWYG編集で、既に色がついているテキスト（例: `[red]テスト[/red]`）に対して別の色（例: 青）を適用すると、古い色タグが残ってしまう
- 結果: `[blue][red]テスト[/red][/blue]` のように二重にタグが付く
- サイズ変更でも同じ問題が発生（例: `[large][small]text[/small][/large]`）
- ユーザーが意図した見た目にならず、混乱を招く

#### 原因
`applyFormatWithSelection`関数で、**同一カテゴリ**のフォーマット間の競合を考慮していなかった：

```typescript
// 問題のあったコード
const formatPattern = `[blue]${selectedText}[/blue]`;
const isFormatted = currentValue.includes(formatPattern);

if (isFormatted) {
  newValue = currentValue.replace(formatPattern, selectedText);
} else {
  // selectedText が既に [red]text[/red] の場合でも
  // そのまま [blue][red]text[/red][/blue] になってしまう
  newValue = currentValue.replace(selectedText, formatPattern);
}
```

- `selectedText`に既存のタグが含まれている場合、それをチェックせずにそのまま新しいタグで囲んでしまう
- 色カテゴリやサイズカテゴリ内で排他的であるべきという制約が実装されていなかった

#### 修正内容
**フォーマットカテゴリの概念を導入**：

1. フォーマットを3つのカテゴリに分類：
   - **色フォーマット**: `red`, `blue`, `green`, `orange`, `purple`, `pink`
   - **サイズフォーマット**: `xsmall`, `small`, `normal`, `large`, `xlarge`
   - **スタイルフォーマット**: `bold`, `italic`, `code`, `strike`（重複適用可能）

2. 色またはサイズを適用する前に、`selectedText`から既存の同カテゴリタグを除去：

```typescript
const colorFormats = ['red', 'blue', 'green', 'orange', 'purple', 'pink'];
const sizeFormats = ['xsmall', 'small', 'normal', 'large', 'xlarge'];

const isColorFormat = colorFormats.includes(format);
const isSizeFormat = sizeFormats.includes(format);

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

// cleanedText を使って新しいフォーマットパターンを作成
formatPattern = `[blue]${cleanedText}[/blue]`;
```

3. 操作の流れ：
   - ユーザーが `[red]テスト[/red]` を選択して青ボタンをクリック
   - `selectedText = "[red]テスト[/red]"`
   - 色フォーマット検出 → 既存の赤タグを除去 → `cleanedText = "テスト"`
   - 新しい青タグを適用 → `[blue]テスト[/blue]`

#### 影響範囲
- **修正ファイル**:
  - `src/components/AddTermForm.tsx`: `applyFormatWithSelection`関数（約40行追加）
  - `src/components/EditTermModal.tsx`: `applyFormatWithSelection`関数（約40行追加）

- **動作への影響**:
  - ✅ 色の変更が正しく動作（古い色が消えて新しい色のみ適用）
  - ✅ サイズの変更が正しく動作（古いサイズが消えて新しいサイズのみ適用）
  - ✅ 太字・斜体などのスタイルは重複適用可能（意図通り）
  - ✅ トグル動作は引き続き正常（同じボタンを2回押すと解除）

#### 学んだこと
1. **フォーマットにはカテゴリがある**: すべてのフォーマットを同じように扱うのではなく、排他的なグループ（色、サイズ）と重複可能なグループ（スタイル）を区別する必要がある
2. **ユーザーの期待を理解**: 色を変更するとき、ユーザーは「色を追加」ではなく「色を置き換える」ことを期待している
3. **段階的なデータクリーニング**: 新しい値を適用する前に、競合する古い値を除去するステップを設けることで、データの一貫性を保つ
4. **DRY原則の適用**: 色のループとサイズのループは似た構造なので、将来的にはヘルパー関数に抽出できる

## 今後のバグ修正もここに追記していきます

各バグ修正を記録することで：
- 同じミスを繰り返さない
- 修正パターンを学習できる
- 新しいメンバーへの知識共有
- アプリケーションの品質向上の歴史を残す
