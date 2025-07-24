import { Client, EmbedBuilder, TextChannel } from "discord.js";
import { INotificationService } from "./INotificationService";

/**
 * Discord通知サービス実装
 */
export class DiscordNotificationService implements INotificationService {
    /**
     * コンストラクタ
     * @param {Client} client Discordクライアント
     */
    constructor(private client: Client) {}

    /**
     * Discord通知送信
     * @param {string} channelId チャンネルID
     * @param {string} message メッセージ
     * @param {EmbedBuilder} embed 埋め込みメッセージ（オプション）
     */
    async sendDiscordNotification(
        channelId: string,
        message: string,
        embed?: EmbedBuilder,
    ): Promise<void> {
        try {
            const channel = await this.client.channels.fetch(channelId);

            if (!channel || !channel.isTextBased()) {
                throw new Error(`Channel ${channelId} not found or not text-based`);
            }

            const textChannel = channel as TextChannel;

            if (embed) {
                await textChannel.send({ content: message, embeds: [embed] });
            } else {
                await textChannel.send(message);
            }
        } catch (error) {
            console.error(`Failed to send Discord notification to ${channelId}:`, error);
            throw error;
        }
    }

    /**
     * 緊急アラート送信
     * @param {unknown} data アラートデータ
     */
    async sendEmergencyAlert(data: unknown): Promise<void> {
        console.log("🔥 Emergency alert triggered:", data);
        // TODO: 緊急アラート実装
    }
}
