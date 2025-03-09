# 歯科医院経営診断アプリ (Dental Clinic App)

歯科医院の経営状態を診断し、改善提案を行うWebアプリケーションです。

## 機能

- 20の質問に回答することで、医院の経営状態を診断
- 財務管理、患者数・売上、スタッフ管理、患者満足度の4カテゴリで評価
- レーダーチャートによる視覚的な経営バランス分析
- 診断結果のPDFダウンロード機能
- 診断データのデータベース保存機能

## 技術スタック

- **フロントエンド**: Next.js, React, Tailwind CSS, Recharts
- **バックエンド**: Next.js API Routes
- **データベース**: MongoDB
- **PDF生成**: jsPDF, jsPDF-AutoTable

## 開発環境のセットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いて結果を確認できます。

## デプロイ

Vercelを使用して簡単にデプロイできます：

1. GitHubリポジトリにプッシュ
2. Vercelでプロジェクトをインポート
3. 環境変数（MONGODB_URI）を設定
4. デプロイボタンをクリック

## 環境変数

`.env.local`ファイルに以下の環境変数を設定してください：

```
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/?retryWrites=true&w=majority
```
