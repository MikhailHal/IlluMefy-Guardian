/**
 * コマンド実行結果
 *
 * @param {boolean} isSuccess 成功したかどうか
 * @param {string} message 返信メッセージ
 */
export interface CommandResult {
    isSuccess: boolean;
    message: string;
}
