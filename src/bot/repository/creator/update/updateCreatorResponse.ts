/**
 * クリエイター更新レスポンス
 */
export interface UpdateCreatorResponse {
    /** 更新成功フラグ */
    isSuccess: boolean;

    /** エラーメッセージ（失敗時のデバッグ用） */
    error?: string;
}
