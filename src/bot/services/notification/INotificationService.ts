import { EmbedBuilder } from "discord.js";

/**
 * 通知サービスインターフェース
 */
export interface INotificationService {
    /**
     * Discord通知送信
     * @param {string} channelId チャンネルID
     * @param {string} message メッセージ
     * @param {EmbedBuilder} embed 埋め込みメッセージ（オプション）
     */
    sendDiscordNotification(
        channelId: string,
        message: string,
        embed?: EmbedBuilder,
    ): Promise<void>;

    /**
     * 緊急アラート送信
     * @param {unknown} data アラートデータ
     */
    sendEmergencyAlert(data: unknown): Promise<void>;
}
