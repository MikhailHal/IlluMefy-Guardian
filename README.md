# IlluMefy Guardian

## 概要

IlluMefy Guardianは、IlluMefyプラットフォームの品質維持を目的としたDiscord監視ボットです。ユーザーによる悪意のある編集（不適切なクリエイター登録、タグの不正な削除・追加等）を自動検知し、復元する機能を提供します。

## 主な機能

### 🛡️ 監視・検知機能
- **不正なクリエイター登録の検知**: 偽のクリエイター情報や重複登録を自動検知
- **タグの不正編集監視**: 意味不明なタグの追加や正当なタグの削除を監視
- **コンテンツ品質チェック**: Perspective APIを使用した有害コンテンツの検出

### 🔄 自動復元機能
- **即座の復元処理**: 問題のある編集を検知後、自動的に前の状態に戻す
- **編集履歴の保持**: 変更内容と復元理由を記録・管理
- **通知機能**: 問題検知と復元処理をDiscordチャンネルに通知

### 🤖 Discordボット機能
- **スラッシュコマンド対応**: `/ping`, `/status`等の基本コマンド
- **リアルタイム監視**: Discord内での即座な反応と処理
- **管理者権限制御**: 権限に応じた機能制限

## 技術仕様

### アーキテクチャ
```
Entry Point (index.ts)
    ↓
GuardianBot (DI Container)
    ↓
├── GuardianDispatcher (Command/Event Router)
│   ├── CommandRegistry (Slash Command Management)
│   └── Event Handlers (Monitoring Logic)
├── ConfigurationService (Secret Management)
└── External APIs (Perspective API, etc.)
```

### 技術スタック
- **Runtime**: Node.js + TypeScript
- **Discord**: discord.js v14
- **Cloud**: Google Cloud Platform
  - Secret Manager (認証情報管理)
  - Cloud Functions (将来的なサーバーレス展開用)
- **AI/ML**: Google Perspective API (コンテンツ品質判定)
- **Architecture Pattern**: 
  - Dependency Injection (DI)
  - Clean Architecture
  - Observer Pattern

### 開発ツール
- **Linting**: ESLint (Google Style Guide)
- **Build**: TypeScript Compiler
- **Package Manager**: npm

## 使用方法

### Discord コマンド(現在追加中)

| コマンド | 説明 |
|---------|------|
| `/ping` | ボットの動作確認 |
| `/status` | 監視システムの状態確認 |

### 監視対象

1. **クリエイター関連**
   - 新規クリエイター登録時の情報検証
   - 既存クリエイター情報の不正な変更

2. **タグ関連**  
   - 不適切なタグの追加
   - 正当なタグの削除
   - タグ内容の品質チェック

## 開発

### ビルド
```bash
npm run build
```

### リント
```bash
npm run lint
npm run lint:fix  # 自動修正
```

### ディレクトリ構造
```
src/
├── bot/                    # Botメイン機能
│   ├── commands/          # Discord コマンド実装
│   ├── commandRegistry/   # コマンド登録管理
│   ├── configurationService/ # 設定管理
│   ├── dispatcher/        # イベント・コマンド制御
│   └── guardianBot.ts     # Bot メインクラス
├── lib/                   # 共通ライブラリ
│   └── secretManager/     # Secret Manager 抽象化
└── index.ts              # エントリーポイント
```

## コントリビューション

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. Pull Requestを作成

## サポート

質問や問題がある場合は、[Issues](https://github.com/MikhailHal/IlluMefy-Guardian/issues)でお知らせください。

---

**Note**: このボットはIlluMefyプラットフォームの品質維持を目的として開発されており、悪意のある使用を禁止します。