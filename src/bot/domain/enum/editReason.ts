/**
 * 編集理由の列挙型
 */
export enum EditReason {
    /** ユーザーによる通常の編集 */
    USER_EDIT = "user_edit",
    /** モデレーターによる編集 */
    MODERATION = "moderation",
    /** 情報訂正要求に基づく編集（誤情報の修正など） */
    CORRECTION_REQUEST = "correction_request",
    /** 一括更新処理による編集 */
    BULK_UPDATE = "bulk_update",
}

/**
 * 編集理由の型定義
 */
export type EditReasonType = `${EditReason}`;
