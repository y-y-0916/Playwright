# Playwright Tutorial Project

このプロジェクトはPlaywrightを学習するためのチュートリアルプロジェクトです。E2Eテストの基礎から応用まで、実践的な例を通じて学ぶことができます。

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. ブラウザのインストール

```bash
npm run install-browsers
```

## プロジェクト構成

```
playwright-tutorial/
├── tests/                     # テストファイル
│   ├── example.spec.js        # 基本的なテスト例
│   ├── forms.spec.js          # フォームテストの例
│   ├── advanced.spec.js       # 応用的なテスト例
│   └── local.spec.js          # ローカルページのテスト
├── public/                    # 静的ファイル
│   └── index.html            # テスト用サンプルページ
├── playwright.config.js       # Playwright設定ファイル
└── package.json
```

## テストの実行

### 基本的なテスト実行

```bash
# すべてのテストを実行
npm test

# ヘッドレスモードでテスト実行（ブラウザを表示）
npm run test:headed

# インタラクティブUIモードでテスト実行
npm run test:ui

# デバッグモードでテスト実行
npm run test:debug
```

### 特定のテストファイルを実行

```bash
# 基本的なテスト例
npm run test:basic

# フォームテストの例
npm run test:forms

# 応用的なテスト例
npm run test:advanced

# ローカルページのテスト
npm run test:local
```

### ローカルページのテスト

ローカルのサンプルページをテストする場合は、まずローカルサーバーを起動してからテストを実行してください：

```bash
# ターミナル1: サーバー起動
npm run serve

# ターミナル2: ローカルページのテスト実行
npm run test:local
```

### テストレポート

```bash
# HTMLレポートを表示
npm run report
```

## テストファイルの説明

### example.spec.js
- Playwright公式サイトを使った基本的なテスト
- ページタイトルの確認
- リンクのクリック
- 検索機能のテスト

### forms.spec.js
- 外部サイトを使ったフォームテストの例
- ログイン機能のテスト
- バリデーションのテスト
- ファイルアップロードのテスト

### advanced.spec.js
- APIモッキング
- ネットワークリクエストの待機
- スクリーンショット比較
- モバイルビューポートのテスト
- クッキーとストレージのテスト

### local.spec.js
- ローカルサンプルページのテスト
- フォーム送信機能
- 動的要素の操作
- ダイアログ処理
- 非同期処理のテスト

## サンプルページ（public/index.html）

学習用のローカルサンプルページには以下の機能が含まれています：

- **基本フォーム**: 様々な入力タイプのテスト
- **インタラクティブ要素**: ボタン、アラート、ダイアログ
- **動的コンテンツ**: リスト項目の追加、背景色変更
- **データテーブル**: 行の削除機能
- **非同期処理**: データ読み込みのシミュレーション

## 学習のポイント

### 1. 基本的なロケーター
```javascript
// テキストで要素を特定
page.getByText('送信')

// ロール（役割）で要素を特定
page.getByRole('button', { name: '送信' })

// ラベルで要素を特定
page.getByLabel('名前:')

// プレースホルダーで要素を特定
page.getByPlaceholder('検索...')
```

### 2. アクション
```javascript
// クリック
await page.getByRole('button').click()

// テキスト入力
await page.getByLabel('名前').fill('テスト')

// セレクトボックスの選択
await page.getByLabel('国').selectOption('japan')

// ファイルアップロード
await page.setInputFiles('input[type=file]', 'path/to/file')
```

### 3. アサーション（検証）
```javascript
// 要素の可視性
await expect(page.getByText('成功')).toBeVisible()

// ページタイトル
await expect(page).toHaveTitle(/Expected Title/)

// 入力値
await expect(page.getByLabel('名前')).toHaveValue('期待値')

// テキスト内容
await expect(page.getByRole('heading')).toHaveText('見出し')
```

### 4. 待機処理
```javascript
// 要素が表示されるまで待機
await page.waitForSelector('.loading-complete')

// ネットワークリクエスト完了まで待機
await page.waitForResponse('**/api/data')

// ページ遷移完了まで待機
await page.waitForURL('**/success')
```

## トラブルシューティング

### よくあるエラーと対処法

1. **要素が見つからないエラー**
   - ロケーターを確認する
   - 要素の読み込み完了を待つ
   - 正確なテキストやロールを指定する

2. **タイムアウトエラー**
   - `playwright.config.js`でタイムアウト時間を調整
   - 明示的な待機処理を追加

3. **ブラウザ起動エラー**
   - `npm run install-browsers`でブラウザを再インストール
   - システムの依存関係を確認

## 参考資料

- [Playwright公式ドキュメント](https://playwright.dev/)
- [Playwright APIリファレンス](https://playwright.dev/docs/api/class-playwright)
- [Best Practices](https://playwright.dev/docs/best-practices)# Playwright
