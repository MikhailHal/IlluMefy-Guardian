/**
 * Discord Clientラッパーインターフェース
 * Discord.jsのClientを抽象化してテスタビリティを向上
 */
export interface IDiscordClientWrapper {
    /**
     * ログイン
     * @param {string} token Discord Bot Token
     */
    login(token: string): Promise<void>;

    /**
     * ログアウト
     */
    logout(): Promise<void>;

    /**
     * イベントリスナー登録
     * @param {string} event イベント名
     * @param {Function} listener イベントハンドラー
     */
    on(event: string, listener: (...args: any[]) => void): void;
}
