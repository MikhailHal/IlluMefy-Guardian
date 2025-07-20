import { CommandInteraction } from "discord.js";

/**
 * ガーディアンディスパッチャーインターフェース
 * コマンドとイベントの統合処理を行う
 */
export interface IGuardianDispatcher {
    /**
     * 初期化
     */
    initialize(): Promise<void>;

    /**
     * コマンド処理
     * @param {CommandInteraction} interaction コマンドインタラクション
     */
    handleCommand(interaction: CommandInteraction): Promise<void>;

    /**
     * イベント処理
     * @param {string} eventType イベント種別
     * @param {any} data イベントデータ
     */
    handleEvent(eventType: string, data: unknown): Promise<void>;
}
