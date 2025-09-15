# Playwright 完全チュートリアル

## 目次
1. [Playwrightとは](#playwrightとは)
2. [なぜPlaywrightを使うのか](#なぜplaywrightを使うのか)
3. [基本概念](#基本概念)
4. [環境セットアップ](#環境セットアップ)
5. [基本構文と書き方](#基本構文と書き方)
6. [ロケーターの使い方](#ロケーターの使い方)
7. [アクション](#アクション)
8. [アサーション（検証）](#アサーション検証)
9. [待機処理](#待機処理)
10. [応用テクニック](#応用テクニック)
11. [実践例](#実践例)

---

## Playwrightとは

**Playwright**は、Microsoftが開発したモダンなWeb自動化・E2E（End-to-End）テストフレームワークです。

### 主な特徴

- **クロスブラウザ対応**: Chromium、Firefox、WebKit（Safari）で同じコードが動作
- **高速・安定性**: 自動的な待機処理により、flaky testを最小限に抑制
- **多言語サポート**: JavaScript/TypeScript、Python、Java、C#で利用可能
- **モバイル対応**: モバイルブラウザのエミュレーション機能
- **並列実行**: テストの高速化のための並列実行をサポート
- **強力なデバッグ**: ステップ実行、スクリーンショット、動画録画機能

---

## なぜPlaywrightを使うのか

### 従来のテストツールの問題点
- **不安定なテスト**: 要素の読み込み待ちでテストが失敗しやすい
- **保守コストの高さ**: ブラウザ固有のバグやAPI変更への対応
- **限定的なブラウザサポート**: 特定ブラウザでしか動作しない

### Playwrightの解決方法
```javascript
// 従来のツール（問題のあるコード例）
await driver.findElement(By.id('button')).click();
// ↑ 要素が存在しない場合エラー

// Playwright（自動的に待機）
await page.getByRole('button', { name: 'Submit' }).click();
// ↑ 要素が表示されるまで自動的に待機
```

---

## 基本概念

### 1. Browser（ブラウザ）
実際のブラウザプロセス。一つのブラウザは複数のコンテキストを持てる。

### 2. BrowserContext（ブラウザコンテキスト）
ブラウザの独立したセッション。クッキーやローカルストレージが分離される。

### 3. Page（ページ）
ブラウザのタブやウィンドウに相当。実際のWebページとの相互作用を行う。

### 4. Locator（ロケーター）
ページ上の要素を特定するためのオブジェクト。

```javascript
// 基本的な階層構造
Browser
├── BrowserContext
    ├── Page
    │   ├── Locator (要素1)
    │   ├── Locator (要素2)
    │   └── Locator (要素3)
    └── Page (別のタブ)
```

---

## 環境セットアップ

### 1. 新規プロジェクト作成
```bash
npm init -y
npm install --save-dev @playwright/test
npx playwright install
```

### 2. 設定ファイル（playwright.config.js）
```javascript
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  // テストファイルの場所
  testDir: './tests',

  // 並列実行
  fullyParallel: true,

  // 失敗時のリトライ回数
  retries: process.env.CI ? 2 : 0,

  // ワーカー数（並列実行数）
  workers: process.env.CI ? 1 : undefined,

  // レポート形式
  reporter: 'html',

  // 共通設定
  use: {
    // ベースURL
    baseURL: 'http://localhost:3000',

    // 失敗時にスクリーンショット撮影
    screenshot: 'only-on-failure',

    // 失敗時に動画録画
    video: 'retain-on-failure',

    // デバッグ用トレース
    trace: 'on-first-retry',
  },

  // テスト対象ブラウザ
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
```

---

## JavaScript基礎知識

### async/await とは？

Playwrightを理解する前に、JavaScriptの**非同期処理**について理解する必要があります。Webブラウザでの操作（ページの読み込み、ボタンクリック、データの取得など）は時間がかかるため、これらの処理が完了するまで「待つ」必要があります。

**従来の問題のあるコード例**:
```javascript
// ❌ 悪い例：これは動作しません
page.goto('/login');
page.getByLabel('ユーザー名').fill('testuser');  // ページがまだ読み込まれていない可能性
```

**async/awaitを使った正しいコード**:
```javascript
// ✅ 良い例：awaitで処理の完了を待つ
await page.goto('/login');          // ページ読み込み完了まで待機
await page.getByLabel('ユーザー名').fill('testuser');  // 要素が見つかるまで待機
```

### async/awaitの基本ルール

1. **async**：関数の前に付けて「この関数は非同期処理を含む」ことを宣言
2. **await**：「この処理が完了するまで待つ」という意味
3. **awaitはasync関数の中でのみ使用可能**

```javascript
// async関数の基本形
async function testFunction() {
  // await を使って非同期処理の完了を待つ
  await page.goto('/login');
  await page.getByLabel('名前').fill('太郎');
}

// Playwrightのテストでの使用例
test('ログインテスト', async ({ page }) => {  // ← asyncを付ける
  await page.goto('/login');                   // ← awaitで待機
  await page.getByLabel('ユーザー名').fill('testuser');  // ← awaitで待機
});
```

### なぜawaitが必要なのか？

Webブラウザでの操作は以下のような理由で時間がかかります：

1. **ページの読み込み時間**：HTMLファイル、CSS、JavaScriptの読み込み
2. **要素の描画時間**：画面に要素が表示されるまでの時間
3. **ネットワーク通信**：APIからのデータ取得
4. **アニメーション**：要素の表示・非表示のアニメーション

awaitを使わないと、まだ存在しない要素にアクセスしてエラーになったり、処理が途中で止まったりします。

```javascript
// 具体的な時間の例
test('処理時間の例', async ({ page }) => {
  await page.goto('/dashboard');        // 約1-3秒（ページ読み込み）
  await page.getByText('ローディング中').waitFor({ state: 'hidden' }); // 約2-5秒（データ読み込み完了まで）
  await page.getByRole('button', { name: '送信' }).click();  // 約0.1-0.5秒（ボタン認識）
});
```

---

## 基本構文と書き方

### テスト基本構造の詳細解説

Playwrightのテストは、**テスト関数**と**テストグループ**で構成されます。これにより、関連するテストをまとめて管理し、共通の準備処理を効率的に行えます。

```javascript
const { test, expect } = require('@playwright/test');

// テストグループ：関連するテストをまとめる
test.describe('ユーザー管理機能', () => {

  // 共通準備処理：このグループの各テスト実行前に毎回実行される
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  // 個別テスト：具体的なテストケース
  test('ログイン機能のテスト', async ({ page }) => {
    // テスト内容をここに記述
    await page.getByLabel('ユーザー名').fill('testuser');
    await page.getByLabel('パスワード').fill('password123');
    await page.getByRole('button', { name: 'ログイン' }).click();

    // 検証：期待通りの結果になったかチェック
    await expect(page.getByText('ダッシュボード')).toBeVisible();
  });

  test('ユーザー登録機能のテスト', async ({ page }) => {
    // 別のテスト内容
  });
});
```

**この構造の利点**：
- **再利用性**：共通の準備処理（ログインなど）を一度書けば、すべてのテストで利用可能
- **保守性**：関連するテストがグループ化されているため、修正時に見つけやすい
- **実行効率**：テストグループ単位で実行したり、特定のテストのみ実行したりできる

### フィクスチャ（Fixtures）とは？

フィクスチャは、Playwrightがテスト実行時に**自動的に提供してくれる便利なオブジェクト**です。これらを使うことで、ブラウザの操作やページの管理を簡単に行えます。

```javascript
test('複数フィクスチャの使用例', async ({ page, context, browser }) => {
  // page: 現在のページオブジェクト（最も頻繁に使用）
  // context: ブラウザコンテキスト（クッキーやセッション管理）
  // browser: ブラウザオブジェクト（新しいページの作成等）
});
```

**各フィクスチャの用途**：

1. **page**：最も基本的なオブジェクト。Webページ上でのクリック、入力、画面確認などすべてこれで行う
2. **context**：ブラウザのセッション（ログイン状態、クッキー等）を管理。複数タブのテストで重要
3. **browser**：ブラウザ全体を制御。通常は使わないが、特殊な設定が必要な場合に使用

**実際の使い分け例**：
```javascript
// 90%のテストではpageだけで十分
test('基本的なテスト', async ({ page }) => {
  await page.goto('/home');
  await page.getByText('ボタン').click();
});

// 複数タブを扱う場合はcontextを使用
test('新しいタブのテスト', async ({ page, context }) => {
  const newPage = await context.newPage();
  // 元のページと新しいページを同時に操作
});

// 特別なブラウザ設定が必要な場合はbrowserを使用
test('特殊設定のテスト', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();
});
```

---

## ロケーターの使い方

### ロケーターとは何か？

**ロケーター**とは、Webページ上の特定の要素（ボタン、リンク、入力フィールドなど）を見つけるための「住所」のようなものです。人間がWebページを見るときは、目で「ログインボタン」や「検索ボックス」を探しますが、Playwrightは文字や位置の情報を使って要素を特定します。

適切なロケーターの選択は、テストの**安定性**と**保守性**に大きく影響します。なぜなら、Webページのデザインや構造が変わっても動作し続けるテストを作るには、変更に強いロケーターを使う必要があるからです。

### ロケーター選択の優先順位

Playwrightでは、**ユーザーの視点で要素を特定する方法**を最優先に推奨しています。これは「実際のユーザーが要素をどう認識するか」に基づいているため、最も自然で安定したテストになります。

**優先順位（高い順）**：
1. **ロール + アクセシブルネーム**：ボタン、リンク、見出しなど
2. **ラベル**：フォーム要素の説明文
3. **プレースホルダー**：入力欄のヒント文字
4. **テキスト内容**：画面に表示される文字
5. **テストID**：開発者が設定した識別子
6. **CSS/XPath**：最終手段

### 1. 推奨ロケーター（ユーザー視点）

#### ロール（役割）による特定
**ロール**とは、HTML要素の「役割」のことです。ボタンは「button」、リンクは「link」、見出しは「heading」といった具合に、要素の機能に基づいて特定します。これは、実際のユーザーが「これはボタンだ」「これはリンクだ」と認識する方法と同じです。

```javascript
// ボタンを名前で特定
await page.getByRole('button', { name: '送信' });

// リンクを名前で特定
await page.getByRole('link', { name: 'ホームページ' });

// 見出しを名前で特定
await page.getByRole('heading', { name: 'タイトル' });
```

**この方法の利点**：
- **直感的**：人間の認識方法と一致している
- **安定性**：CSSクラス名やID変更の影響を受けにくい
- **アクセシビリティ**：スクリーンリーダー等の支援技術と同じ方法を使用

**実際の使用場面**：
- 「保存」「キャンセル」「削除」などのアクションボタン
- ナビゲーションメニューのリンク
- ページの見出しやセクションタイトル

#### ラベルによる特定
**ラベル**は、フォーム要素（入力欄、チェックボックスなど）に付けられる説明文のことです。これは、ユーザーが「このフィールドには何を入力すべきか」を理解するための文字です。

```javascript
// フォームフィールドをラベルで特定
await page.getByLabel('メールアドレス');
await page.getByLabel('パスワード');
await page.getByLabel('生年月日');
```

**この方法の利点**：
- **意味が明確**：何のための入力欄かが分かりやすい
- **フォームに最適**：入力フィールドの特定で最も確実
- **アクセシビリティ対応**：視覚障害者にも優しい

**実際の使用場面**：
- ログインフォームの「ユーザー名」「パスワード」欄
- 会員登録フォームの各種入力欄
- 設定画面のオプション項目

#### プレースホルダーによる特定
**プレースホルダー**は、入力欄の中に薄い文字で表示されるヒント文字のことです。「何を入力すればよいかの例」を示すために使われます。

```javascript
// 検索ボックスなどで使用
await page.getByPlaceholder('検索ワードを入力');
await page.getByPlaceholder('例: 田中太郎');
```

**使用する場面**：
- 検索ボックス
- ラベルが省略されている入力欄
- 入力例を示したい場合

#### テキスト内容による特定
画面に実際に表示されている文字そのもので要素を特定します。これは人間が画面を見て要素を探す方法と最も近い方法です。

```javascript
// 画面に表示される文字で特定
await page.getByText('こんにちは');
await page.getByText('ログアウト');
await page.getByText('商品が見つかりません');
```

**使用する場面**：
- メッセージやお知らせの確認
- 動的に生成されるテキストの確認
- エラーメッセージの表示確認

#### テストIDによる特定
**テストID**は、開発者がテスト用に要素に付ける特別な識別子です。通常は `data-testid` という属性を使用します。これは、テストの安定性を高めるために開発チームが協力して設定するものです。

```javascript
// 開発者が設定したテストIDで特定
await page.getByTestId('user-profile');
await page.getByTestId('submit-form');
```

**使用する場面**：
- 複雑な画面で他の方法では特定困難な要素
- 開発チームとテストチームが連携している場合
- 長期的な保守性を重視する場合

### 2. CSS/XPathロケーター（最終手段）

これらの方法は、上記の推奨方法で要素を特定できない場合の**最終手段**として使用します。これらは技術的な仕様に依存するため、デザイン変更などで壊れやすい特徴があります。

#### CSSセレクタ
HTML の構造やスタイル情報を使って要素を特定します。

```javascript
// ID による特定（#で始まる）
await page.locator('#submit-button');

// クラス名による特定（.で始まる）
await page.locator('.error-message');

// 属性による特定
await page.locator('input[type="email"]');
```

#### XPath
XML/HTMLの構造を辿って要素を特定する方法です。非常に強力ですが、理解が困難で保守性が低いため、最終手段として使用します。

```javascript
// XPath での特定（//で始まる）
await page.locator('//button[contains(text(), "送信")]');
```

#### 組み合わせ使用
推奨ロケーターとCSS/XPathを組み合わせることで、より確実な特定が可能になります。

```javascript
// フォーム内の送信ボタンを特定
await page.locator('form').getByRole('button', { name: '送信' });
```

### 3. ロケーターの絞り込み

同じページに似たような要素が複数ある場合、さらに詳細な条件で絞り込む必要があります。

#### 順序による絞り込み
同じ種類の要素が複数ある場合、何番目の要素かで特定します。

```javascript
// 最初のボタン
await page.getByRole('button').first();

// 最後のボタン
await page.getByRole('button').last();

// 3番目のボタン（0から数えるので index 2）
await page.getByRole('button').nth(2);
```

**使用する場面**：
- 商品一覧の最初の商品をクリック
- ページネーションの最後のページに移動
- 特定の順序にある項目の選択

#### 条件によるフィルタリング
特定の条件に一致する要素のみに絞り込みます。

```javascript
// 「重要」という文字を含むリスト項目の中のボタン
await page
  .getByRole('listitem')
  .filter({ hasText: '重要' })
  .getByRole('button');
```

**使用する場面**：
- 特定の商品の「購入」ボタン
- 特定のユーザーの「編集」リンク
- 条件付きで表示される要素

#### 親子関係による特定
ページの構造を利用して、親要素から子要素を特定します。

```javascript
// 田中太郎のユーザーカード内の編集ボタン
await page
  .locator('.user-card')
  .filter({ hasText: '田中太郎' })
  .getByRole('button', { name: '編集' });
```

**使用する場面**：
- 一覧表示での特定行の操作
- カード形式レイアウトでの個別操作
- 階層構造を持つメニューの操作

### ロケーター選択のベストプラクティス

1. **ユーザー視点を優先**：まずロール、ラベル、テキストで試す
2. **意味のある名前を使用**：「button1」より「保存ボタン」
3. **安定性を重視**：デザイン変更に強い方法を選ぶ
4. **開発チームと連携**：必要に応じてテストIDの設定を依頼
5. **文書化**：特殊なロケーターには理由をコメントで記載

---

## アクション

### アクションとは何か？

**アクション**とは、Webページ上で実際にユーザーが行う操作のことです。マウスでボタンをクリックしたり、キーボードで文字を入力したり、スクロールしたりする動作を、Playwrightが自動的に実行してくれます。

アクションは、テストの中で「操作」の部分を担当します。つまり、「ログインボタンをクリックする」「フォームにデータを入力する」などの動作をコードで表現したものです。

### 1. 基本アクション

#### クリック操作
**クリック**は、Webページで最も基本的な操作です。ボタンを押したり、リンクを選択したりするときに使用します。Playwrightは自動的に要素が表示されてクリック可能な状態になるまで待ってから操作を実行します。

```javascript
// 基本的なクリック
await page.getByRole('button', { name: '送信' }).click();
```

**実際の使用場面**：
- フォームの送信ボタンを押す
- ナビゲーションメニューのリンクを選択
- モーダルダイアログの「OK」ボタンを押す

#### ダブルクリック
**ダブルクリック**は、短時間に2回続けてクリックする操作です。デスクトップアプリケーションのような動作をWebアプリで実装している場合に使用します。

```javascript
// ファイルを開くなどの操作
await page.getByText('ファイル名').dblclick();
```

**実際の使用場面**：
- ファイル管理画面でファイルを開く
- 編集モードに切り替える
- 詳細ビューを表示する

#### 右クリック（コンテキストメニュー）
**右クリック**は、コンテキストメニュー（右クリックメニュー）を表示するために使用します。

```javascript
// 右クリックでコンテキストメニューを表示
await page.getByText('メニュー').click({ button: 'right' });
```

**実際の使用場面**：
- コピー・貼り付けなどの操作メニュー
- 削除・編集などのアクションメニュー
- 設定やオプションメニュー

#### ホバー（マウスオーバー）
**ホバー**は、マウスカーソルを要素の上に置く操作です。ツールチップの表示やサブメニューの展開などで使用されます。

```javascript
// マウスを要素の上に置く
await page.getByText('ツールチップ').hover();
```

**実際の使用場面**：
- ツールチップやヘルプメッセージの表示
- ドロップダウンメニューの展開
- 画像のズーム機能の有効化

#### フォーカス
**フォーカス**は、要素にキーボードの入力対象を設定する操作です。アクセシビリティやキーボード操作のテストで重要です。

```javascript
// 入力フィールドにフォーカスを設定
await page.getByLabel('名前').focus();
```

**実際の使用場面**：
- キーボード操作のテスト
- Tab順序の確認
- アクセシビリティのテスト

### 2. 入力アクション

#### テキスト入力
Webフォームでの文字入力は、テストで最も頻繁に行われる操作の一つです。Playwrightには入力の方法がいくつかあり、状況に応じて使い分けます。

##### fill() - 完全置換入力
`fill()` は、入力フィールドの内容を**完全に置き換える**方法です。既存の内容があれば削除してから新しい内容を入力します。最も一般的で推奨される入力方法です。

```javascript
// フィールドの内容を完全に置き換え
await page.getByLabel('名前').fill('田中太郎');
```

**使用する場面**：
- フォームの初期入力
- 既存データの更新
- 一般的なテキスト入力

##### type() - 追加入力
`type()` は、既存の内容に**文字を追加する**方法です。実際のキーボード入力をシミュレートするため、一文字ずつ入力されます。

```javascript
// 既存テキストに追加で入力
await page.getByLabel('コメント').type('追加テキスト');
```

**使用する場面**：
- 段階的な入力のテスト
- オートコンプリート機能のテスト
- 入力途中でのイベント発生をテストしたい場合

##### clear() - 内容消去
入力フィールドの内容を空にします。

```javascript
// フィールドの内容を消去
await page.getByLabel('名前').clear();
```

**使用する場面**：
- フォームのリセット機能テスト
- 入力エラー後の再入力
- 空の状態でのバリデーションテスト

#### キーボード操作
特殊なキーの入力や、キーボードショートカットのテストで使用します。

```javascript
// Enterキーで検索実行
await page.getByLabel('検索').press('Enter');

// Ctrl+A で全選択
await page.getByLabel('テキスト').press('Control+A');

// Tab キーでフィールド移動
await page.keyboard.press('Tab');
```

**実際の使用場面**：
- 検索フォームでのEnter送信
- テキスト編集でのショートカット操作
- キーボードナビゲーションのテスト

#### セレクトボックス（プルダウン）
ドロップダウンメニューでの選択操作です。値（value）またはラベル（表示文字）で選択できます。

```javascript
// 値で選択
await page.getByLabel('国').selectOption('japan');

// 表示ラベルで選択
await page.getByLabel('国').selectOption({ label: '日本' });

// インデックスで選択（0から開始）
await page.getByLabel('国').selectOption({ index: 2 });
```

**実際の使用場面**：
- 国や地域の選択
- カテゴリーの選択
- 設定オプションの変更

### 3. ファイル操作

#### ファイルアップロード
Webアプリケーションでファイルをアップロードする機能のテストです。ローカルファイルを指定してアップロードをシミュレートします。

```javascript
// 単一ファイルのアップロード
await page.getByLabel('ファイル選択').setInputFiles('path/to/file.pdf');

// 複数ファイルの同時アップロード
await page.getByLabel('ファイル選択').setInputFiles([
  'file1.jpg',
  'file2.jpg'
]);

// アップロードのキャンセル（空配列を指定）
await page.getByLabel('ファイル選択').setInputFiles([]);
```

**実際の使用場面**：
- プロフィール画像のアップロード
- 文書ファイルの添付
- 一括データのインポート

#### ファイルダウンロード
Webアプリケーションからファイルをダウンロードする操作のテストです。ダウンロードイベントを監視して、ファイルが正しくダウンロードされたかを確認できます。

```javascript
// ダウンロード処理のテスト
const downloadPromise = page.waitForEvent('download');
await page.getByText('ダウンロード').click();
const download = await downloadPromise;

// ダウンロードしたファイルを保存
await download.saveAs('downloaded-file.pdf');

// ファイル情報の確認
console.log('ファイル名:', download.suggestedFilename());
console.log('ファイルサイズ:', await download.path());
```

**実際の使用場面**：
- レポートのエクスポート
- 画像や文書のダウンロード
- バックアップファイルの取得

### 4. スクロール操作

#### 要素までのスクロール
ページが長い場合、目的の要素が画面外にあることがあります。`scrollIntoViewIfNeeded()` を使用すると、要素が見える位置まで自動的にスクロールします。

```javascript
// 指定要素が見えるまでスクロール
await page.getByText('フッター').scrollIntoViewIfNeeded();
```

**実際の使用場面**：
- 長いページの下部要素にアクセス
- 表示領域外のボタンをクリック前に表示
- 無限スクロールのテスト

#### 手動スクロール
より細かいスクロール制御が必要な場合の方法です。

```javascript
// マウスホイールでのスクロール（x方向：0、y方向：100ピクセル）
await page.mouse.wheel(0, 100);

// キーボードでのページ移動
await page.keyboard.press('End');   // ページの最下部へ
await page.keyboard.press('Home');  // ページの最上部へ
await page.keyboard.press('PageDown'); // 1画面分下へ
await page.keyboard.press('PageUp');   // 1画面分上へ
```

**実際の使用場面**：
- 無限スクロールページでの段階的読み込み
- 大きな表やリストでの部分的な確認
- スクロール位置に依存する機能のテスト

### アクション実行時の注意点

#### 自動待機機能
Playwrightは、アクション実行前に自動的に以下を確認・待機します：

1. **要素の存在確認**：要素がDOMに存在するまで待機
2. **要素の表示確認**：要素が画面に表示されるまで待機
3. **要素の有効確認**：要素がクリック可能な状態まで待機
4. **要素の安定確認**：要素の位置が安定するまで待機

これにより、以下のような問題が自動的に回避されます：

```javascript
// ❌ 従来のツールでありがちな問題
// await page.goto('/page');
// await page.click('#button');  // ページが読み込まれる前にクリックしてエラー

// ✅ Playwrightでは自動的に待機
await page.goto('/page');
await page.getByRole('button', { name: 'クリック' }).click();  // 安全に実行される
```

#### エラーハンドリング
アクションが失敗する場合の一般的な原因と対処法：

1. **要素が見つからない**：ロケーターを見直す
2. **要素がクリックできない**：他の要素に隠されていないか確認
3. **タイムアウトエラー**：待機時間を調整するか、待機条件を変更
4. **要素が移動中**：アニメーション完了を待つ

```javascript
// タイムアウト時間を調整
await page.getByRole('button').click({ timeout: 10000 });

// 強制的にクリック（通常は推奨されない）
await page.getByRole('button').click({ force: true });
```

---

## アサーション（検証）

### アサーションとは何か？

**アサーション**とは、テストで「期待した結果になっているかどうかを確認する」処理のことです。例えば、ログインボタンを押した後に「ダッシュボードページに移動したか？」「ようこそメッセージが表示されたか？」などを確認するのがアサーションです。

Playwrightでは `expect()` 関数を使ってアサーションを行います。これは「〜であることを期待する」という意味で、期待通りでなければテストが失敗します。

**アサーションの基本的な流れ**：
1. **操作実行**：ボタンクリック、フォーム送信など
2. **結果確認**：操作後の画面状態をチェック
3. **テスト判定**：期待通りなら成功、違えば失敗

### 1. 要素の状態検証

#### 要素の表示・非表示確認
Webページでは、条件によって要素が表示されたり隠されたりします。例えば、ログイン前は「ログインボタン」が表示され、ログイン後は「ログアウトボタン」が表示される、といった動作です。

```javascript
// 要素が画面に表示されているか確認
await expect(page.getByText('成功')).toBeVisible();

// 要素が画面に表示されていないか確認
await expect(page.getByText('エラー')).not.toBeVisible();

// 要素が完全に隠されているか確認
await expect(page.getByText('非表示')).toBeHidden();
```

**実際の使用場面**：
- ログイン成功後に「ダッシュボード」という文字が表示されるか
- エラー時にエラーメッセージが表示されるか
- ローディング完了後にスピナーが非表示になるか

#### ボタンやフォームの有効・無効状態
フォームでは、必要な情報がすべて入力されるまで送信ボタンが無効になっていることがよくあります。また、処理中は二重送信を防ぐためボタンを無効にします。

```javascript
// ボタンがクリック可能な状態か確認
await expect(page.getByRole('button')).toBeEnabled();

// ボタンがクリック不可能な状態か確認
await expect(page.getByRole('button')).toBeDisabled();
```

**実際の使用場面**：
- フォームの必須項目をすべて入力後、送信ボタンが有効になるか
- 送信処理中は送信ボタンが無効になるか
- 権限のないユーザーには編集ボタンが無効表示されるか

#### チェックボックス・ラジオボタンの状態
フォームでの同意確認や選択状態の確認で使用します。

```javascript
// チェックボックスがチェックされているか
await expect(page.getByRole('checkbox')).toBeChecked();

// チェックボックスがチェックされていないか
await expect(page.getByRole('checkbox')).not.toBeChecked();
```

**実際の使用場面**：
- プライバシーポリシー同意チェックボックスの状態確認
- 設定画面でのオプション選択状態確認
- 商品選択での複数選択状態確認

#### フォーカス状態の確認
ユーザビリティの観点で、適切な要素にフォーカスが当たっているかを確認します。

```javascript
// 指定した要素にフォーカスが当たっているか
await expect(page.getByLabel('名前')).toBeFocused();
```

**実際の使用場面**：
- ページ読み込み後、最初の入力フィールドにフォーカスが当たるか
- エラー発生時、エラーのある入力フィールドにフォーカスが移るか
- Tabキーでの順次移動が正しく動作するか

### 2. テキスト・値の検証

#### 画面に表示されるテキストの確認
ページに期待通りの文字が表示されているかを確認します。これはユーザーが実際に見る内容の確認なので、非常に重要です。

```javascript
// 要素のテキストが完全に一致するか
await expect(page.getByRole('heading')).toHaveText('タイトル');

// テキストに特定の文字列が含まれるか
await expect(page.getByText('エラー')).toContainText('パスワード');
```

**実際の使用場面**：
- 商品ページで正しい商品名が表示されるか
- エラーメッセージに適切な説明が含まれるか
- ユーザー名やメールアドレスが正しく表示されるか

#### 入力フィールドの値確認
フォームに入力した内容や、初期値として設定された内容が正しいかを確認します。

```javascript
// 入力フィールドの値が期待通りか
await expect(page.getByLabel('名前')).toHaveValue('田中太郎');
```

**実際の使用場面**：
- 編集画面で既存データが正しく表示されるか
- フォーム送信エラー後、入力内容が保持されるか
- 自動入力機能が正しく動作するか

#### HTML属性の確認
リンクのURL、画像のalt属性、フォームのaction属性など、HTMLの属性値を確認します。

```javascript
// 要素の属性値が期待通りか
await expect(page.getByRole('link')).toHaveAttribute('href', '/home');
```

**実際の使用場面**：
- リンクが正しいページに向いているか
- 画像のalt属性がアクセシビリティ対応されているか
- フォームの送信先URLが正しいか

#### CSSスタイルの確認
要素の見た目（色、サイズ、位置など）が期待通りかを確認します。

```javascript
// 要素のCSSプロパティが期待通りか
await expect(page.getByText('警告')).toHaveCSS('color', 'rgb(255, 0, 0)');
```

**実際の使用場面**：
- エラーメッセージが赤色で表示されるか
- ボタンの無効状態でグレー表示になるか
- モバイル表示時に適切なレイアウトになるか

### 3. ページレベル検証

#### ページタイトルの確認
ブラウザのタイトルバーに表示される内容を確認します。SEOやユーザビリティの観点で重要です。

```javascript
// ページタイトルが完全一致するか
await expect(page).toHaveTitle('ホーム - マイアプリ');

// ページタイトルに特定の文字列が含まれるか（正規表現使用）
await expect(page).toHaveTitle(/ホーム/);
```

**実際の使用場面**：
- 各ページで適切なタイトルが設定されているか
- 動的なタイトル（ユーザー名含む等）が正しく生成されるか
- 多言語対応で言語別のタイトルが表示されるか

#### URLの確認
現在表示されているページのURLが期待通りかを確認します。ページ遷移やリダイレクトの確認で重要です。

```javascript
// URLが完全一致するか
await expect(page).toHaveURL('/dashboard');

// URLが特定のパターンに一致するか（正規表現使用）
await expect(page).toHaveURL(/\/user\/\d+/);  // /user/123 のような形式
```

**実際の使用場面**：
- ログイン後に正しいページにリダイレクトされるか
- 権限のないページアクセス時にエラーページに遷移するか
- URLパラメータが正しく設定されるか

#### スクリーンショット比較
ページ全体やの見た目が期待通りかを画像で比較します。デザインの回帰テストで威力を発揮します。

```javascript
// ページ全体のスクリーンショット比較
await expect(page).toHaveScreenshot('homepage.png');

// 特定要素のスクリーンショット比較
await expect(page.getByRole('dialog')).toHaveScreenshot();
```

**実際の使用場面**：
- デザイン変更時に意図しない見た目の変化がないか
- 異なるブラウザでの表示差異確認
- アニメーション完了後の最終的な見た目確認

### 4. カウント・リスト検証

#### 要素数の確認
画面に表示される項目数や選択肢数などを確認します。データの表示や検索結果の確認で重要です。

```javascript
// 要素数が正確にN個かを確認
await expect(page.getByRole('listitem')).toHaveCount(5);

// 最低N個以上あるかを確認
await expect(page.getByRole('row')).toHaveCount({ min: 1 });

// 最大N個以下かを確認
await expect(page.getByRole('option')).toHaveCount({ max: 10 });
```

**実際の使用場面**：
- 検索結果で期待した件数が表示されるか
- ページネーションで正しい件数が表示されるか
- 選択肢（プルダウン等）に適切な数の項目があるか

#### 配列内容の検証
複数の要素の内容を一括で確認します。リスト表示やメニュー項目の確認で使用します。

```javascript
// 配列内容が期待通りかを確認
const items = await page.getByRole('listitem').allTextContents();
expect(items).toEqual(['項目1', '項目2', '項目3']);
```

**実際の使用場面**：
- ナビゲーションメニューの項目順序確認
- 商品一覧の表示順序確認
- フィルタリング結果の内容確認

**これらのアサーションを使う理由**：
- **自動化**：人間が手動で確認していた作業を自動化できる
- **精度**：人間の目では見落としがちな細かい変化も検出できる
- **継続性**：コード変更のたびに同じチェックを確実に実行できる
- **回帰防止**：過去に動いていた機能が壊れていないことを確認できる

---

## 待機処理

### 待機処理が必要な理由

現代のWebアプリケーションは**動的**です。つまり、ページを開いた瞬間にすべての内容が表示されるわけではなく、時間をかけて段階的に読み込まれたり、ユーザーの操作に応じて内容が変化したりします。

**Webページでよくある動的な動作**：
- APIからデータを取得して表示する（例：商品一覧の読み込み）
- ユーザーの操作に応じて新しい画面に移動する（例：ログイン後のダッシュボード）
- アニメーションやエフェクトで要素が段階的に表示される
- フォーム送信後にサーバーからの応答を待つ

Playwrightは**自動的に多くの待機を処理**してくれますが、複雑な状況では明示的に「何を待つか」を指定する必要があります。適切な待機処理により、「まだ読み込まれていない要素にアクセスしてエラー」という問題を回避できます。

### Playwrightの自動待機 vs 明示的待機

#### 自動待機（Playwrightが自動的に行う）
```javascript
// 以下の操作では自動的に待機が発生
await page.getByRole('button', { name: '送信' }).click();
// → ボタンが存在し、表示され、クリック可能になるまで自動待機

await expect(page.getByText('成功')).toBeVisible();
// → 「成功」というテキストが表示されるまで自動待機
```

#### 明示的待機（特別な状況で必要）
```javascript
// 複雑な条件や特殊な状況では明示的に待機を指定
await page.waitForLoadState('networkidle');
// → ネットワーク通信が落ち着くまで待機
```

### 1. 要素の待機

#### 要素の状態変化を待つ
特定の要素が期待した状態（表示・非表示・有効・無効など）になるまで待機します。これは、動的に表示される要素や、処理完了後に状態が変わる要素で重要です。

```javascript
// 要素が表示されるまで待機
await page.waitForSelector('.loading-complete');

// 要素が非表示になるまで待機（ローディングスピナーなど）
await page.waitForSelector('.spinner', { state: 'hidden' });

// 要素が存在し、かつ表示されるまで待機
await page.waitForSelector('button', { state: 'visible' });

// 要素がDOM内に追加されるまで待機（表示/非表示は問わない）
await page.waitForSelector('.dynamic-element', { state: 'attached' });
```

**実際の使用場面**：

**ローディング完了の待機**：
```javascript
// データ読み込み中はスピナーが表示される
await page.getByRole('button', { name: 'データ読み込み' }).click();

// スピナーが消えるまで待機
await page.waitForSelector('.loading-spinner', { state: 'hidden' });

// その後、データが表示されたことを確認
await expect(page.getByText('データ読み込み完了')).toBeVisible();
```

**動的要素の出現待機**：
```javascript
// 検索後に結果が動的に表示される場合
await page.getByPlaceholder('商品を検索').fill('ノートパソコン');
await page.getByRole('button', { name: '検索' }).click();

// 検索結果コンテナが表示されるまで待機
await page.waitForSelector('.search-results', { state: 'visible' });

// 具体的な結果を確認
await expect(page.getByText('ノートパソコン')).toBeVisible();
```

### 2. ナビゲーション待機

#### ページ遷移の完了を待つ
リンクをクリックしたりフォームを送信したりした後、新しいページの読み込みが完了するまで待機します。この待機により、「ページがまだ読み込まれていないのに次の操作を実行してエラー」という問題を回避できます。

```javascript
// 特定のURLに遷移するまで待機
await page.waitForURL('/dashboard');

// URLパターンに一致するまで待機（正規表現使用）
await page.waitForURL(/\/user\/\d+/);  // /user/123 のような形式
```

**実際の使用場面**：

**ログイン後のリダイレクト待機**：
```javascript
// ログインフォームの操作
await page.goto('/login');
await page.getByLabel('メール').fill('user@example.com');
await page.getByLabel('パスワード').fill('password123');

// ログインボタンをクリック
await page.getByRole('button', { name: 'ログイン' }).click();

// ダッシュボードページに遷移するまで待機
await page.waitForURL('/dashboard');

// ダッシュボードの内容を確認
await expect(page.getByText('ようこそ')).toBeVisible();
```

#### ページ読み込み状態の待機
ページの読み込み段階を細かく制御したい場合に使用します。

```javascript
// ネットワーク通信が落ち着くまで待機（500ms間リクエストがない状態）
await page.waitForLoadState('networkidle');

// DOM の構築完了まで待機（画像等の読み込み完了は待たない）
await page.waitForLoadState('domcontentloaded');

// ページの完全な読み込み完了まで待機
await page.waitForLoadState('load');
```

**使い分けの例**：
- **domcontentloaded**：基本的なページ構造が欲しい場合（高速）
- **load**：すべてのリソース読み込み完了を待つ場合（確実だが遅い）
- **networkidle**：動的なデータ読み込みも含めて落ち着くまで待つ場合（SPA向け）

### 3. ネットワーク待機

#### API通信の完了を待つ
現代のWebアプリケーションはAPIを使ってサーバーからデータを取得します。ボタンをクリックした後にAPIが呼ばれ、その結果によって画面が更新される場合、API通信の完了を待つ必要があります。

```javascript
// 特定のAPIエンドポイントへのリクエスト完了を待機
const responsePromise = page.waitForResponse('/api/users');
await page.getByRole('button', { name: 'ユーザー一覧読み込み' }).click();
const response = await responsePromise;

// APIレスポンスの確認
expect(response.status()).toBe(200);
const data = await response.json();
expect(data.users.length).toBeGreaterThan(0);
```

**実際の使用場面**：

**データ読み込みボタンのテスト**：
```javascript
// 売上データ読み込みのテスト
const responsePromise = page.waitForResponse('/api/sales/monthly');

// データ読み込みボタンをクリック
await page.getByRole('button', { name: '月次売上データ読み込み' }).click();

// APIレスポンス完了を待機
const response = await responsePromise;
expect(response.status()).toBe(200);

// 画面にデータが反映されたことを確認
await expect(page.getByText('1月度売上：')).toBeVisible();
```

#### 複数のAPI通信を同時に待機
一つの操作で複数のAPIが呼ばれる場合の処理です。

```javascript
// 複数のAPIリクエストを並行して待機
const [userResponse, postsResponse] = await Promise.all([
  page.waitForResponse('/api/user'),
  page.waitForResponse('/api/posts'),
  page.getByRole('button', { name: 'プロフィール表示' }).click()
]);

// 両方のAPIが成功したことを確認
expect(userResponse.status()).toBe(200);
expect(postsResponse.status()).toBe(200);
```

#### 条件付きレスポンス待機
URLやレスポンス内容に条件を付けて待機する方法です。

```javascript
// 成功レスポンス（200番台）のみを待機
const responsePromise = page.waitForResponse(response =>
  response.url().includes('/api/submit') && response.status() >= 200 && response.status() < 300
);

await page.getByRole('button', { name: 'データ送信' }).click();
const response = await responsePromise;
```

### 4. カスタム待機

#### 独自の条件での待機
標準的な待機方法では対応できない複雑な条件の場合、JavaScript関数を使って待機条件を定義できます。

```javascript
// DOM内の要素数が特定の数に達するまで待機
await page.waitForFunction(() => {
  return document.querySelectorAll('.item').length > 5;
});

// 特定の値になるまで待機
await page.waitForFunction(() => {
  const element = document.querySelector('#progress');
  return element && element.textContent === '100%完了';
});

// 複雑な条件の組み合わせ
await page.waitForFunction(() => {
  const isDataLoaded = document.querySelector('.data-loaded');
  const hasNoErrors = !document.querySelector('.error-message');
  return isDataLoaded && hasNoErrors;
});
```

**実際の使用場面**：

**無限スクロールのテスト**：
```javascript
// ページの最下部までスクロール
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

// 新しいアイテムが追加されるまで待機
await page.waitForFunction(() => {
  return document.querySelectorAll('.product-item').length >= 20;
});
```

**プログレスバーの完了待機**：
```javascript
// ファイルアップロード開始
await page.getByLabel('ファイル').setInputFiles('large-file.zip');
await page.getByRole('button', { name: 'アップロード' }).click();

// プログレスバーが100%になるまで待機
await page.waitForFunction(() => {
  const progress = document.querySelector('.progress-bar');
  return progress && progress.style.width === '100%';
});

await expect(page.getByText('アップロード完了')).toBeVisible();
```

#### タイムアウトの調整
待機処理には**タイムアウト時間**を設定できます。デフォルトは30秒ですが、処理によっては調整が必要です。

```javascript
// 長時間かかる処理のため、タイムアウトを延長
await page.waitForSelector('.result', { timeout: 60000 }); // 60秒

// 即座に確認したい場合、タイムアウトを短縮
await expect(page.getByText('即座に表示')).toBeVisible({ timeout: 1000 });

// 待機を無効化（即座にチェック）
await expect(page.getByText('既に表示済み')).toBeVisible({ timeout: 0 });
```

### 待機処理のベストプラクティス

#### 1. 適切な待機方法の選択
- **要素の表示待ち**：`waitForSelector` または `expect().toBeVisible()`
- **ページ遷移待ち**：`waitForURL`
- **API通信待ち**：`waitForResponse`
- **複雑な条件**：`waitForFunction`

#### 2. タイムアウトの設定
```javascript
// 処理時間に応じたタイムアウト設定
await page.waitForResponse('/api/heavy-process', { timeout: 120000 }); // 重い処理は長めに
await page.waitForSelector('.instant-message', { timeout: 5000 });     // 即座の応答は短めに
```

#### 3. エラーハンドリング
```javascript
try {
  await page.waitForSelector('.success-message', { timeout: 10000 });
  console.log('処理成功');
} catch (error) {
  // タイムアウトした場合の処理
  await expect(page.getByText('エラーメッセージ')).toBeVisible();
}
```

#### 4. 不要な待機の回避
```javascript
// ❌ 不必要な待機
await page.goto('/page');
await page.waitForTimeout(3000); // 固定時間待機は避ける

// ✅ 適切な待機
await page.goto('/page');
await page.waitForLoadState('networkidle'); // 条件付き待機
```

適切な待機処理により、安定したテストを作成し、false negative（本当は成功するのに失敗と判定される）やfalse positive（本当は失敗するのに成功と判定される）を防ぐことができます。

---

## 応用テクニック

### 1. 複数タブ・ウィンドウ処理

**問題**: 「新しいタブで開く」「外部リンク」「PDFプレビュー」等、現在のページから別のタブ・ウィンドウが開かれる操作をテストしたい場合があります。

**解決方法**: Playwrightではcontextのpageイベントを監視することで、新しく開かれたページを取得できます。

```javascript
test('新しいタブで開くリンクのテスト', async ({ context, page }) => {
  // 例：ヘルプページに「新しいタブで開く」リンクがある場合

  // 1. 新しいページが開かれることを事前に監視開始
  //    これをクリック前に設定することが重要！
  const pagePromise = context.waitForEvent('page');

  // 2. 新しいタブで開くリンクをクリック
  //    target="_blank"属性のあるリンクや、window.open()を呼ぶボタンなど
  await page.getByText('ヘルプを新しいタブで開く').click();

  // 3. 新しく開かれたページオブジェクトを取得
  const newPage = await pagePromise;

  // 4. 新しいページが完全に読み込まれるまで待機
  await newPage.waitForLoadState();

  // 5. 新しいページの内容を検証
  await expect(newPage).toHaveTitle(/ヘルプ/);
  await expect(newPage.getByText('よくある質問')).toBeVisible();

  // 6. 必要に応じて新しいページで追加操作
  await newPage.getByRole('link', { name: 'お問い合わせ' }).click();

  // 7. 新しいページを閉じる（任意）
  await newPage.close();
});
```

**なぜこの手順が必要？**
- ブラウザで新しいタブが開かれるタイミングは非同期なので、事前に監視が必要
- 複数のページを同時に操作する場合、どのページで何をしているかを明確にする必要がある

### 2. ファイルダウンロード処理

**問題**: レポート出力、CSVエクスポート、PDF生成等、ファイルをダウンロードする機能をテストしたい場合

**解決方法**: downloadイベントを監視して、ダウンロードされたファイルの検証を行います。

```javascript
test('売上レポートのCSVダウンロード', async ({ page }) => {
  // 例：売上管理画面でCSVレポートをダウンロードする場合

  // 1. 売上管理ページに移動
  await page.goto('/admin/sales');

  // 2. 期間を設定（2023年1月）
  await page.getByLabel('開始日').fill('2023-01-01');
  await page.getByLabel('終了日').fill('2023-01-31');

  // 3. ダウンロード処理の監視を開始（クリック前に設定！）
  const downloadPromise = page.waitForEvent('download');

  // 4. CSVダウンロードボタンをクリック
  await page.getByRole('button', { name: 'CSVダウンロード' }).click();

  // 5. ダウンロード完了まで待機
  const download = await downloadPromise;

  // 6. ダウンロードされたファイルの検証

  // ファイルが正常にダウンロードされたか
  const downloadPath = await download.path();
  expect(downloadPath).toBeTruthy();

  // ファイル名が期待通りか
  expect(download.suggestedFilename()).toBe('sales_2023-01.csv');

  // ファイルサイズが0でないか（空でない）
  const fs = require('fs');
  const stats = fs.statSync(downloadPath);
  expect(stats.size).toBeGreaterThan(0);

  // 7. 任意：ファイル内容の検証
  const fileContent = fs.readFileSync(downloadPath, 'utf-8');
  expect(fileContent).toContain('売上日,商品名,金額'); // CSVヘッダー確認
  expect(fileContent).toContain('2023-01'); // 期間データ確認

  // 8. テスト用ファイルを特定の場所に保存（任意）
  await download.saveAs('./test-results/downloaded-sales.csv');
});
```

**なぜこの手順が必要？**
- ダウンロードは非同期処理なので、事前に監視が必要
- ファイルの整合性確認により、機能が正しく動作していることを保証
- ダウンロード機能は外部システム連携でよく使われるため、重要なテスト項目

### 3. アラート・ダイアログ処理

**問題**: JavaScript のalert(), confirm(), prompt()ダイアログや、ブラウザネイティブダイアログが表示される操作をテストしたい

**解決方法**: dialogイベントを監視して、ダイアログの内容確認と操作を行います。

```javascript
test('重要データ削除時の確認ダイアログ', async ({ page }) => {
  // 例：ユーザーアカウント削除時に確認ダイアログが表示される場合

  // 1. ユーザー管理ページに移動
  await page.goto('/admin/users');

  // 2. 削除対象ユーザーを見つける
  const userRow = page.getByRole('row', { name: '田中太郎' });
  await expect(userRow).toBeVisible();

  // 3. ダイアログ処理を事前に設定（削除ボタンクリック前に！）
  page.on('dialog', async dialog => {
    // ダイアログの種類を確認（alert, confirm, prompt）
    expect(dialog.type()).toBe('confirm');

    // ダイアログメッセージの内容確認
    expect(dialog.message()).toBe('ユーザー「田中太郎」を削除します。この操作は元に戻せません。本当に削除しますか？');

    // OKボタンを押す（削除実行）
    await dialog.accept();

    // キャンセルしたい場合は以下を使用
    // await dialog.dismiss();
  });

  // 4. 削除ボタンをクリック
  await userRow.getByRole('button', { name: '削除' }).click();

  // 5. 削除後の確認
  await expect(page.getByText('ユーザーを削除しました')).toBeVisible();
  await expect(userRow).not.toBeVisible();
});

// プロンプトダイアログの例
test('コメント入力プロンプト', async ({ page }) => {
  // 例：承認処理でコメント入力が求められる場合

  await page.goto('/admin/approvals');

  page.on('dialog', async dialog => {
    expect(dialog.type()).toBe('prompt');
    expect(dialog.message()).toBe('承認コメントを入力してください：');

    // プロンプトに値を入力して OK
    await dialog.accept('承認します。問題ありません。');
  });

  await page.getByRole('button', { name: '承認' }).click();

  // 承認後の確認
  await expect(page.getByText('承認が完了しました')).toBeVisible();
});
```

**なぜこの重要？**
- ユーザーの重要な操作（削除、決済等）では確認ダイアログが一般的
- ダイアログが表示されないとテストが止まってしまう
- セキュリティ上重要な確認プロセスのテストが可能

### 4. APIモッキング（外部API依存の回避）

**問題**: テスト中に外部API、決済システム、メール送信等の外部サービスを呼び出すことなく、フロントエンドの動作をテストしたい

**解決方法**: page.route()でAPIリクエストをインターセプトし、モックレスポンスを返します。

```javascript
test('ユーザー一覧表示（APIモック）', async ({ page }) => {
  // 例：ユーザー一覧ページが /api/users からデータを取得して表示する場合

  // 1. APIエンドポイントをモック化
  await page.route('/api/users', route => {
    // 実際のAPIサーバーに送信せず、モックデータを返す
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify([
        {
          id: 1,
          name: '田中太郎',
          email: 'tanaka@example.com',
          role: 'admin',
          lastLogin: '2023-12-01T10:30:00Z'
        },
        {
          id: 2,
          name: '佐藤花子',
          email: 'sato@example.com',
          role: 'user',
          lastLogin: '2023-11-28T15:45:00Z'
        },
        {
          id: 3,
          name: '鈴木一郎',
          email: 'suzuki@example.com',
          role: 'user',
          lastLogin: null  // 未ログインユーザー
        }
      ])
    });
  });

  // 2. ページに移動（この時点でモックAPIが呼ばれる）
  await page.goto('/admin/users');

  // 3. モックデータに基づく表示確認
  await expect(page.getByText('田中太郎')).toBeVisible();
  await expect(page.getByText('tanaka@example.com')).toBeVisible();
  await expect(page.getByText('admin')).toBeVisible();

  // 4. 条件分岐の確認（最終ログイン未設定ユーザー）
  await expect(page.getByText('鈴木一郎')).toBeVisible();
  await expect(page.getByText('未ログイン')).toBeVisible();

  // 5. UI操作のテスト（検索機能等）
  await page.getByPlaceholder('ユーザー検索').fill('田中');
  await expect(page.getByText('田中太郎')).toBeVisible();
  await expect(page.getByText('佐藤花子')).not.toBeVisible();
});

// エラーケースのテスト
test('APIエラー時の表示', async ({ page }) => {
  // サーバーエラーをモック
  await page.route('/api/users', route => {
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({
        error: 'Internal Server Error',
        message: 'データベース接続エラー'
      })
    });
  });

  await page.goto('/admin/users');

  // エラー表示の確認
  await expect(page.getByText('データの取得に失敗しました')).toBeVisible();
  await expect(page.getByRole('button', { name: '再試行' })).toBeVisible();
});
```

**なぜAPIモッキングが重要？**
- 外部サービスの状態に依存しない安定したテスト
- テスト環境で決済や送信を実際に行うリスクを回避
- 様々なエラーケースを簡単に再現可能
- テスト実行速度の向上

### 5. ローカルストレージ・クッキー（認証状態の模擬）

**問題**: ログイン済み状態でのみアクセス可能なページや機能をテストしたいが、毎回ログイン処理を行うのは時間がかかる

**解決方法**: 認証トークンやセッション情報を直接設定して、ログイン状態を模擬します。

```javascript
test('ログイン済み状態でのダッシュボード表示', async ({ page, context }) => {
  // 例：JWTトークンベースの認証システムの場合

  // 1. ページ読み込み前にローカルストレージを設定
  await page.addInitScript(() => {
    // 実際のアプリケーションで使用される認証トークン
    localStorage.setItem('auth_token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
    localStorage.setItem('user_id', '12345');
    localStorage.setItem('user_role', 'admin');

    // ユーザー情報のキャッシュ
    localStorage.setItem('user_info', JSON.stringify({
      id: 12345,
      name: '管理者太郎',
      email: 'admin@example.com',
      permissions: ['user_read', 'user_write', 'system_admin']
    }));
  });

  // 2. セッションクッキーの設定
  await context.addCookies([
    {
      name: 'session_id',
      value: 'sess_abc123xyz789',
      domain: 'localhost',
      path: '/',
      httpOnly: true,  // JSからアクセス不可
      secure: false,   // HTTPSでのみ送信（開発環境ではfalse）
      sameSite: 'Lax'  // CSRF対策
    },
    {
      name: 'remember_token',
      value: 'remember_token_456',
      domain: 'localhost',
      path: '/',
      expires: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30日後
    }
  ]);

  // 3. ダッシュボードに直接アクセス
  await page.goto('/dashboard');

  // 4. ログイン状態の確認
  await expect(page.getByText('管理者太郎さん、こんにちは')).toBeVisible();
  await expect(page.getByRole('link', { name: 'ログアウト' })).toBeVisible();

  // 5. 認証が必要な機能の確認
  await expect(page.getByRole('link', { name: 'ユーザー管理' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'システム設定' })).toBeVisible();

  // 6. 権限に基づく表示確認
  await page.getByRole('link', { name: 'ユーザー管理' }).click();
  await expect(page).toHaveURL('/admin/users');
  await expect(page.getByRole('button', { name: '新規追加' })).toBeVisible();
});

// 異なる権限レベルでのテスト
test('一般ユーザー権限での制限確認', async ({ page, context }) => {
  // 一般ユーザーとして設定
  await page.addInitScript(() => {
    localStorage.setItem('auth_token', 'user_token_xyz');
    localStorage.setItem('user_role', 'user');
    localStorage.setItem('user_info', JSON.stringify({
      id: 67890,
      name: '一般ユーザー',
      email: 'user@example.com',
      permissions: ['user_read']  // 読み取り専用
    }));
  });

  await page.goto('/dashboard');

  // 管理者機能へのアクセス制限確認
  await expect(page.getByRole('link', { name: 'ユーザー管理' })).not.toBeVisible();
  await expect(page.getByRole('link', { name: 'システム設定' })).not.toBeVisible();

  // 直接URLアクセスでも制限されることを確認
  await page.goto('/admin/users');
  await expect(page.getByText('アクセス権限がありません')).toBeVisible();
});
```

**なぜこの手法が有効？**
- テストの実行時間短縮（ログイン処理をスキップ）
- 様々な権限レベルでの動作確認が簡単
- セッション期限切れ等の状態も簡単に再現可能

### 6. モバイル・レスポンシブテスト

**問題**: スマートフォン、タブレット等の異なる画面サイズでWebサイトが正しく表示・動作するかテストしたい

**解決方法**: デバイスエミュレーション機能を使用して、実際のデバイス環境を模擬します。

```javascript
const { devices } = require('@playwright/test');

test('スマートフォンでのナビゲーションテスト', async ({ browser }) => {
  // 例：ECサイトのスマホ版ナビゲーションをテスト

  // 1. iPhone 12の環境を作成
  const context = await browser.newContext({
    ...devices['iPhone 12'],  // 画面サイズ、ユーザーエージェント等を設定
    // カスタム設定も可能
    locale: 'ja-JP',
    timezoneId: 'Asia/Tokyo'
  });

  const page = await context.newPage();

  // 2. ECサイトのトップページに移動
  await page.goto('/');

  // 3. デスクトップ版では表示されるナビが、スマホでは非表示になることを確認
  await expect(page.getByRole('navigation', { name: 'デスクトップメニュー' })).not.toBeVisible();

  // 4. ハンバーガーメニューボタンの表示確認
  const menuButton = page.getByRole('button', { name: 'メニュー' });
  await expect(menuButton).toBeVisible();

  // 5. ハンバーガーメニューを開く
  await menuButton.click();

  // 6. スライドアウトメニューの表示確認
  const mobileMenu = page.getByRole('navigation', { name: 'モバイルメニュー' });
  await expect(mobileMenu).toBeVisible();

  // 7. モバイルメニュー内のリンク確認
  await expect(mobileMenu.getByRole('link', { name: 'カテゴリ' })).toBeVisible();
  await expect(mobileMenu.getByRole('link', { name: 'マイページ' })).toBeVisible();
  await expect(mobileMenu.getByRole('link', { name: 'カート' })).toBeVisible();

  // 8. カテゴリメニューの展開テスト
  await mobileMenu.getByRole('link', { name: 'カテゴリ' }).click();
  await expect(page.getByText('ファッション')).toBeVisible();
  await expect(page.getByText('家電')).toBeVisible();

  // 9. 商品検索機能（スマホ版）
  const searchInput = page.getByPlaceholder('商品を検索');
  await expect(searchInput).toBeVisible();
  await searchInput.fill('iPhone');

  // スマホでは検索ボタンがアイコンのみ
  await page.getByRole('button', { name: '検索' }).click();

  // 10. 検索結果の表示（モバイル最適化）
  await expect(page.getByRole('heading', { name: '検索結果' })).toBeVisible();

  // スマホでは商品が縦並びで表示されることを確認
  const productList = page.getByRole('list', { name: '商品一覧' });
  await expect(productList).toHaveCSS('flex-direction', 'column');

  await context.close();
});

// タブレット向けテスト
test('タブレットでの横画面表示', async ({ browser }) => {
  // iPad横画面での表示テスト
  const context = await browser.newContext({
    ...devices['iPad Pro landscape']
  });

  const page = await context.newPage();
  await page.goto('/products');

  // タブレットでは商品が2列で表示されることを確認
  const productGrid = page.getByRole('list', { name: '商品一覧' });
  await expect(productGrid).toHaveCSS('grid-template-columns', 'repeat(2, 1fr)');

  // サイドバーが表示されることを確認（スマホでは非表示）
  await expect(page.getByRole('complementary', { name: 'フィルター' })).toBeVisible();

  await context.close();
});

// カスタムデバイス設定
test('カスタム画面サイズでのテスト', async ({ browser }) => {
  // 例：特定の企業タブレットの画面サイズ
  const context = await browser.newContext({
    viewport: { width: 1024, height: 600 },  // カスタムサイズ
    deviceScaleFactor: 1.5,  // 高DPI
    isMobile: true,  // タッチイベント有効
    hasTouch: true,
    userAgent: 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15'
  });

  const page = await context.newPage();
  await page.goto('/admin/dashboard');

  // この画面サイズでの管理画面レイアウト確認
  await expect(page.getByRole('main')).toBeVisible();

  await context.close();
});
```

**なぜモバイルテストが重要？**
- 現在のWebトラフィックの多くがモバイルデバイス経由
- デスクトップとモバイルで異なるユーザーエクスペリエンス
- レスポンシブデザインの動作確認が必要
- タッチ操作特有の動作テストが可能

---

## 実践例

### 実例1: ログインフローのテスト

**テスト目的**: Webアプリケーションの認証機能が正しく動作することを確認する

**テストシナリオ**:
1. 正しい認証情報でのログイン成功
2. 間違った認証情報でのログイン失敗
3. ログアウト機能の動作確認

```javascript
test.describe('認証機能', () => {
  test('正常ログイン', async ({ page }) => {
    // ステップ1: ログインページに移動
    await page.goto('/login');

    // ページが正しく読み込まれたことを確認
    await expect(page.getByRole('heading', { name: 'ログイン' })).toBeVisible();

    // ステップ2: 認証情報の入力
    // 正しいメールアドレスを入力
    await page.getByLabel('メールアドレス').fill('user@example.com');

    // 正しいパスワードを入力
    await page.getByLabel('パスワード').fill('password123');

    // 入力内容が正しく表示されていることを確認（パスワードは隠される）
    await expect(page.getByLabel('メールアドレス')).toHaveValue('user@example.com');

    // ステップ3: ログイン実行
    await page.getByRole('button', { name: 'ログイン' }).click();

    // ステップ4: ログイン成功の確認
    // URL がダッシュボードに変わったことを確認
    await expect(page).toHaveURL('/dashboard');

    // ログイン後のウェルカムメッセージが表示されることを確認
    await expect(page.getByText('ようこそ')).toBeVisible();

    // ナビゲーションバーにユーザー名が表示されることを確認
    await expect(page.getByText('user@example.com')).toBeVisible();

    // ステップ5: ログアウト機能の確認
    // ログアウトボタンが表示されていることを確認
    const logoutButton = page.getByRole('button', { name: 'ログアウト' });
    await expect(logoutButton).toBeVisible();

    // ログアウト実行
    await logoutButton.click();

    // ログアウト後にログインページに戻ることを確認
    await expect(page).toHaveURL('/login');

    // セッションが正しく終了し、ダッシュボードに直接アクセスできないことを確認
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/login'); // リダイレクトされる
  });

  test('パスワード間違い', async ({ page }) => {
    // ステップ1: ログインページに移動
    await page.goto('/login');

    // ステップ2: 間違った認証情報の入力
    await page.getByLabel('メールアドレス').fill('user@example.com');
    await page.getByLabel('パスワード').fill('wrong_password'); // 意図的に間違ったパスワード

    // ステップ3: ログイン試行
    await page.getByRole('button', { name: 'ログイン' }).click();

    // ステップ4: エラー処理の確認
    // エラーメッセージが表示されることを確認
    await expect(page.getByText('メールアドレスまたはパスワードが違います')).toBeVisible();

    // ログインページに留まることを確認（リダイレクトされない）
    await expect(page).toHaveURL('/login');

    // 入力フィールドがクリアされることを確認（セキュリティ上の理由）
    await expect(page.getByLabel('パスワード')).toHaveValue('');

    // エラー状態でもページが正常に機能することを確認
    await expect(page.getByRole('button', { name: 'ログイン' })).toBeEnabled();
  });

  test('必須フィールドのバリデーション', async ({ page }) => {
    // ステップ1: ログインページに移動
    await page.goto('/login');

    // ステップ2: 空の状態でログインボタンを押す
    await page.getByRole('button', { name: 'ログイン' }).click();

    // ステップ3: バリデーションエラーの確認
    // HTML5のrequired属性によるバリデーション
    const emailField = page.getByLabel('メールアドレス');
    const isEmailInvalid = await emailField.evaluate(el => !el.checkValidity());
    expect(isEmailInvalid).toBe(true);

    // ステップ4: 段階的な入力確認
    // メールアドレスのみ入力
    await page.getByLabel('メールアドレス').fill('user@example.com');
    await page.getByRole('button', { name: 'ログイン' }).click();

    // パスワードフィールドのバリデーション確認
    const passwordField = page.getByLabel('パスワード');
    const isPasswordInvalid = await passwordField.evaluate(el => !el.checkValidity());
    expect(isPasswordInvalid).toBe(true);
  });

  test('セッション有効期限切れの処理', async ({ page, context }) => {
    // ステップ1: 正常ログイン
    await page.goto('/login');
    await page.getByLabel('メールアドレス').fill('user@example.com');
    await page.getByLabel('パスワード').fill('password123');
    await page.getByRole('button', { name: 'ログイン' }).click();
    await expect(page).toHaveURL('/dashboard');

    // ステップ2: セッション切れを模擬（クッキーを削除）
    await context.clearCookies();

    // ステップ3: 認証が必要なアクションを実行
    await page.getByRole('link', { name: 'プロフィール設定' }).click();

    // ステップ4: セッション切れ処理の確認
    // ログインページにリダイレクトされることを確認
    await expect(page).toHaveURL('/login');

    // セッション切れメッセージが表示されることを確認
    await expect(page.getByText('セッションの有効期限が切れました')).toBeVisible();
  });
});
```

### 実例2: お問い合わせフォームのテスト

**テスト目的**: 複雑なフォームの入力、バリデーション、送信処理が正しく動作することを確認

**テストシナリオ**:
1. 各入力フィールドの正常な動作確認
2. バリデーション機能の確認
3. 送信処理とAPIコール確認
4. 成功・失敗時の適切なフィードバック

```javascript
test.describe('お問い合わせフォーム機能', () => {
  test('正常な問い合わせ送信', async ({ page }) => {
    // ステップ1: お問い合わせページに移動
    await page.goto('/contact');

    // ページタイトルとフォームの存在確認
    await expect(page.getByRole('heading', { name: 'お問い合わせ' })).toBeVisible();
    await expect(page.getByRole('form')).toBeVisible();

    // ステップ2: 基本情報の入力
    // お名前フィールドの入力
    const nameField = page.getByLabel('お名前');
    await nameField.fill('山田太郎');
    await expect(nameField).toHaveValue('山田太郎');

    // メールアドレスの入力と形式確認
    const emailField = page.getByLabel('メールアドレス');
    await emailField.fill('yamada@example.com');
    await expect(emailField).toHaveValue('yamada@example.com');

    // ステップ3: 件名の選択
    // セレクトボックスの動作確認
    const subjectSelect = page.getByLabel('件名');
    await subjectSelect.selectOption('サポート');

    // 選択された値の確認
    await expect(subjectSelect).toHaveValue('サポート');

    // 他の選択肢も利用可能か確認
    await expect(subjectSelect.getByRole('option', { name: '一般的な質問' })).toBeVisible();
    await expect(subjectSelect.getByRole('option', { name: '技術的なサポート' })).toBeVisible();

    // ステップ4: メッセージ本文の入力
    const messageField = page.getByLabel('メッセージ');
    const testMessage = 'サービスの使い方について質問があります。\n初心者でも使いやすい機能はありますか？';
    await messageField.fill(testMessage);

    // 長文の入力が正しく処理されることを確認
    await expect(messageField).toHaveValue(testMessage);

    // 文字数制限の確認（例：1000文字以内）
    const charCount = await messageField.evaluate(el => el.value.length);
    expect(charCount).toBeLessThanOrEqual(1000);

    // ステップ5: プライバシーポリシー同意
    const privacyCheckbox = page.getByLabel('プライバシーポリシーに同意する');

    // 初期状態では未チェック
    await expect(privacyCheckbox).not.toBeChecked();

    // チェックボックスをチェック
    await privacyCheckbox.check();
    await expect(privacyCheckbox).toBeChecked();

    // ステップ6: 送信前の状態確認
    // すべてのフィールドが正しく入力されると送信ボタンが有効になる
    const submitButton = page.getByRole('button', { name: '送信' });
    await expect(submitButton).toBeEnabled();

    // ステップ7: フォーム送信とAPIレスポンス確認
    // API リクエストの監視を開始
    const responsePromise = page.waitForResponse('/api/contact');

    // 送信ボタンをクリック
    await submitButton.click();

    // ローディング状態の確認
    await expect(page.getByText('送信中...')).toBeVisible();
    await expect(submitButton).toBeDisabled(); // 二重送信防止

    // API レスポンスの確認
    const response = await responsePromise;
    expect(response.status()).toBe(200);

    // レスポンスボディの確認
    const responseData = await response.json();
    expect(responseData.success).toBe(true);
    expect(responseData.messageId).toBeTruthy(); // メッセージIDが生成される

    // ステップ8: 送信成功フィードバック
    // 成功メッセージの表示確認
    await expect(page.getByText('お問い合わせを受け付けました')).toBeVisible();
    await expect(page.getByText(`受付番号: ${responseData.messageId}`)).toBeVisible();

    // フォームがリセットされることを確認
    await expect(nameField).toHaveValue('');
    await expect(messageField).toHaveValue('');
    await expect(privacyCheckbox).not.toBeChecked();

    // 送信後の案内メッセージ
    await expect(page.getByText('24時間以内に返信いたします')).toBeVisible();
  });

  test('フォームバリデーションの確認', async ({ page }) => {
    await page.goto('/contact');

    // ステップ1: 必須フィールド未入力での送信試行
    const submitButton = page.getByRole('button', { name: '送信' });

    // 初期状態では送信ボタンが無効
    await expect(submitButton).toBeDisabled();

    // ステップ2: 段階的な入力とバリデーション確認
    // 名前のみ入力
    await page.getByLabel('お名前').fill('山田太郎');
    await expect(submitButton).toBeDisabled(); // まだ無効

    // 不正なメールアドレスの入力
    const emailField = page.getByLabel('メールアドレス');
    await emailField.fill('invalid-email');

    // HTML5バリデーションの確認
    await submitButton.click();
    const isEmailValid = await emailField.evaluate(el => el.checkValidity());
    expect(isEmailValid).toBe(false);

    // カスタムバリデーションメッセージの確認
    await expect(page.getByText('正しいメールアドレスを入力してください')).toBeVisible();

    // ステップ3: 正しいメールアドレスに修正
    await emailField.clear();
    await emailField.fill('yamada@example.com');

    // ステップ4: 件名未選択の状態確認
    await expect(submitButton).toBeDisabled();

    // 件名を選択
    await page.getByLabel('件名').selectOption('一般的な質問');

    // ステップ5: メッセージが短すぎる場合
    const messageField = page.getByLabel('メッセージ');
    await messageField.fill('短い'); // 10文字未満

    await expect(page.getByText('メッセージは10文字以上入力してください')).toBeVisible();

    // 適切な長さのメッセージに修正
    await messageField.clear();
    await messageField.fill('適切な長さのメッセージを入力しました。');

    // ステップ6: プライバシーポリシー未同意
    await expect(submitButton).toBeDisabled();

    // 同意チェック
    await page.getByLabel('プライバシーポリシーに同意する').check();

    // 全て正しく入力されると送信ボタンが有効になる
    await expect(submitButton).toBeEnabled();
  });

  test('送信エラー時の処理', async ({ page }) => {
    await page.goto('/contact');

    // 正常なフォーム入力
    await page.getByLabel('お名前').fill('エラーテスト');
    await page.getByLabel('メールアドレス').fill('error@example.com');
    await page.getByLabel('件名').selectOption('技術的なサポート');
    await page.getByLabel('メッセージ').fill('エラーのテストです');
    await page.getByLabel('プライバシーポリシーに同意する').check();

    // APIエラーをモック
    await page.route('/api/contact', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'サーバーエラーが発生しました'
        })
      });
    });

    // 送信実行
    const submitButton = page.getByRole('button', { name: '送信' });
    await submitButton.click();

    // エラー処理の確認
    await expect(page.getByText('送信に失敗しました')).toBeVisible();
    await expect(page.getByText('サーバーエラーが発生しました')).toBeVisible();

    // 再試行ボタンの表示
    await expect(page.getByRole('button', { name: '再試行' })).toBeVisible();

    // フォームデータが保持されることを確認
    await expect(page.getByLabel('お名前')).toHaveValue('エラーテスト');
    await expect(page.getByLabel('メールアドレス')).toHaveValue('error@example.com');
  });

  test('ファイル添付機能', async ({ page }) => {
    await page.goto('/contact');

    // 基本情報入力
    await page.getByLabel('お名前').fill('ファイルテスト');
    await page.getByLabel('メールアドレス').fill('file@example.com');
    await page.getByLabel('件名').selectOption('技術的なサポート');
    await page.getByLabel('メッセージ').fill('ファイルを添付します');

    // ファイル添付
    const fileInput = page.getByLabel('ファイル添付');
    await fileInput.setInputFiles([
      './test-files/screenshot.png',
      './test-files/log.txt'
    ]);

    // 添付ファイルの表示確認
    await expect(page.getByText('screenshot.png')).toBeVisible();
    await expect(page.getByText('log.txt')).toBeVisible();

    // ファイルサイズ制限の確認
    const fileSizes = await page.locator('.file-size').allTextContents();
    for (const sizeText of fileSizes) {
      const size = parseInt(sizeText.replace(/[^\d]/g, ''));
      expect(size).toBeLessThanOrEqual(10 * 1024 * 1024); // 10MB制限
    }

    await page.getByLabel('プライバシーポリシーに同意する').check();

    // 送信とファイルアップロード確認
    const responsePromise = page.waitForResponse('/api/contact/upload');
    await page.getByRole('button', { name: '送信' }).click();

    const response = await responsePromise;
    expect(response.status()).toBe(200);

    await expect(page.getByText('ファイル付きで送信完了')).toBeVisible();
  });
});
```

### 実例3: データテーブル操作テスト

```javascript
test('ユーザー管理テーブル', async ({ page }) => {
  await page.goto('/admin/users');

  // 初期データ確認
  await expect(page.getByRole('table')).toBeVisible();
  const initialRowCount = await page.getByRole('row').count();

  // ユーザー追加
  await page.getByRole('button', { name: '新規追加' }).click();
  await page.getByLabel('名前').fill('新規ユーザー');
  await page.getByLabel('メール').fill('new@example.com');
  await page.getByRole('button', { name: '保存' }).click();

  // 追加確認
  await expect(page.getByRole('row')).toHaveCount(initialRowCount + 1);
  await expect(page.getByCell('新規ユーザー')).toBeVisible();

  // 編集機能
  await page
    .getByRole('row', { name: '新規ユーザー' })
    .getByRole('button', { name: '編集' })
    .click();

  await page.getByLabel('名前').fill('編集済みユーザー');
  await page.getByRole('button', { name: '更新' }).click();

  await expect(page.getByCell('編集済みユーザー')).toBeVisible();

  // 削除機能
  page.on('dialog', dialog => dialog.accept());
  await page
    .getByRole('row', { name: '編集済みユーザー' })
    .getByRole('button', { name: '削除' })
    .click();

  await expect(page.getByCell('編集済みユーザー')).not.toBeVisible();
});
```

### 実例4: 検索・フィルタリング機能

```javascript
test('商品検索機能', async ({ page }) => {
  await page.goto('/products');

  // 初期状態確認
  const initialProducts = await page.getByRole('article').count();
  expect(initialProducts).toBeGreaterThan(0);

  // テキスト検索
  await page.getByPlaceholder('商品を検索').fill('ノートパソコン');
  await page.getByRole('button', { name: '検索' }).click();

  // 検索結果確認
  await expect(page.getByText('ノートパソコン')).toBeVisible();
  const searchResults = await page.getByRole('article').count();
  expect(searchResults).toBeLessThan(initialProducts);

  // カテゴリフィルター
  await page.getByLabel('カテゴリ').selectOption('electronics');
  await page.getByRole('button', { name: 'フィルター適用' }).click();

  // 価格範囲フィルター
  await page.getByLabel('最小価格').fill('10000');
  await page.getByLabel('最大価格').fill('50000');
  await page.getByRole('button', { name: 'フィルター適用' }).click();

  // 結果確認
  const products = await page.getByRole('article').all();
  for (const product of products) {
    const priceText = await product.getByClass('price').textContent();
    const price = parseInt(priceText.replace(/[^\d]/g, ''));
    expect(price).toBeGreaterThanOrEqual(10000);
    expect(price).toBeLessThanOrEqual(50000);
  }

  // フィルタークリア
  await page.getByRole('button', { name: 'クリア' }).click();
  const clearedResults = await page.getByRole('article').count();
  expect(clearedResults).toBe(initialProducts);
});
```

---

## デバッグとトラブルシューティング

### デバッグモード
```bash
# ステップ実行モード
npx playwright test --debug

# UIモード（ブラウザでインタラクティブ実行）
npx playwright test --ui

# ヘッド付きモード（ブラウザを表示）
npx playwright test --headed
```

### よくあるエラーと対処法

1. **要素が見つからない**
   ```javascript
   // 悪い例
   await page.locator('#dynamic-button').click();

   // 良い例
   await page.getByRole('button', { name: '動的ボタン' }).click();
   ```

2. **タイムアウトエラー**
   ```javascript
   // タイムアウトを調整
   await expect(page.getByText('処理中')).toBeVisible({ timeout: 10000 });
   ```

3. **不安定なテスト**
   ```javascript
   // 適切な待機処理を追加
   await page.waitForLoadState('networkidle');
   await expect(page.getByText('データ読み込み完了')).toBeVisible();
   ```

---

## まとめ

Playwrightは現代的なWeb自動化の強力なツールです。このチュートリアルで学んだ概念を活用して、安定で保守性の高いE2Eテストを作成してください。

### 学習の次のステップ
1. 実際のプロジェクトでの小さなテストから始める
2. CI/CD パイプラインでの自動実行を設定
3. Page Object Model パターンの導入
4. カスタムフィクスチャの作成
5. パフォーマンステストの実装

継続的な学習と実践により、Playwrightの真価を最大限に活用できるようになるでしょう。