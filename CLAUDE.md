# Claude Code Notes

## Playwright Tutorial Project

### Overview
このプロジェクトはPlaywrightを学習するための包括的なチュートリアルプロジェクトです。

### Created Files
- `PLAYWRIGHT_TUTORIAL.md` - Playwrightの詳細チュートリアルドキュメント
- `README.md` - プロジェクトの概要と使用方法
- `playwright.config.js` - Playwright設定ファイル
- `package.json` - 依存関係とスクリプト設定
- `tests/` - 各種テストサンプル
  - `example.spec.js` - 基本的なテスト例
  - `forms.spec.js` - フォームテストの例
  - `advanced.spec.js` - 応用的なテスト例
  - `local.spec.js` - ローカルページのテスト
- `public/index.html` - 学習用サンプルページ

### Tutorial Content
`PLAYWRIGHT_TUTORIAL.md`には以下の内容を網羅:
- Playwrightとは何か、なぜ使うのか
- 基本概念（Browser, Context, Page, Locator）
- 環境セットアップ
- 基本構文とテスト書き方
- ロケーターの詳細な使い方
- アクション（クリック、入力、スクロール等）
- アサーション（検証）の全パターン
- 待機処理の詳細
- 応用テクニック（複数タブ、ダウンロード、APIモック等）
- 実践的な例（ログイン、フォーム、データテーブル、検索機能）
- デバッグとトラブルシューティング

### Next Steps
ユーザーはこのチュートリアルを使って:
1. Playwrightの基礎概念を理解
2. 実際のサンプルコードで練習
3. 自分のプロジェクトでテストを作成

### Commands to Remember
```bash
# 基本テスト実行
npm test

# ローカルページテスト（推奨）
npm run serve &
npm run test:local

# デバッグモード
npm run test:debug

# UIモード
npm run test:ui
```