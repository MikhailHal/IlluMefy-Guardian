/**
 * ハンドラーインターフェース
 */
export interface IHandler {
    onDetect(): Promise<HandlerResult>;
}

/**
 * ハンドラーリザルト
 */
export interface HandlerResult {
    /** 成功したかどうか */
    isSucceed: boolean;
    /** メッセージ */
    message: string;
}
