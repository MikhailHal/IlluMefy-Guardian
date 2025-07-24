/**
 * ハンドラーインターフェース
 */
export interface IHandler {
    onDetect(data: unknown): Promise<HandlerResult>;
}

/**
 * 通知・返信タイプ
 */
export enum NotificationActionType {
    /** 何もしない */
    NONE = "none",
    /** Discord通知 */
    DISCORD_NOTIFICATION = "discord_notification",
    /** コマンド返信 */
    COMMAND_REPLY = "command_reply",
    /** 緊急アラート */
    EMERGENCY_ALERT = "emergency_alert",
}

/**
 * ハンドラーリザルト
 */
export interface HandlerResult {
    /** 成功したかどうか */
    isSucceed: boolean;
    /** メッセージ */
    message: string;
    /** 通知・返信のタイプ */
    actionType: NotificationActionType;
    /** 追加データ（JSON形式） */
    additionalData?: Record<string, unknown>;
}
