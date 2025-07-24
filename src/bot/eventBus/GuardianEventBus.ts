import { EventEmitter } from "events";

/**
 * Guardian用イベントバス
 * Observer パターンの実装
 */
export class GuardianEventBus extends EventEmitter {
    /**
     * Discord通知イベント発行
     * @param {string} message 通知メッセージ
     * @param {Record<string, unknown>} additionalData 追加データ
     */
    emitDiscordNotification(message: string, additionalData?: Record<string, unknown>): void {
        this.emit("discord-notification", { message, additionalData });
    }

    /**
     * 緊急アラートイベント発行
     * @param {unknown} data アラートデータ
     */
    emitEmergencyAlert(data: unknown): void {
        this.emit("emergency-alert", data);
    }

    /**
     * コマンド返信イベント発行
     * @param {string} message 返信メッセージ
     * @param {Record<string, unknown>} additionalData 追加データ
     */
    emitCommandReply(message: string, additionalData?: Record<string, unknown>): void {
        this.emit("command-reply", { message, additionalData });
    }
}

/**
 * 通知イベントデータ
 */
export interface NotificationEventData {
    message: string;
    additionalData?: Record<string, unknown>;
}
