/**
 * 悪意のある編集復元レスポンス
 */
export interface RevertMaliciousEditResponse {
    /** 復元成功フラグ */
    isSuccess: boolean;

    /** エラーメッセージ（失敗時） */
    error?: string;
}
