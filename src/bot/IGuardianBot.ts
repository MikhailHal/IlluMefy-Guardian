/**
 * ガーディアンボットインターフェース
 */
export interface IGuardianBot {
    /** 初期化 */
    initialize(): Promise<void>;
    /** 開始 */
    start(): Promise<void>;
    /** 停止 */
    stop(): Promise<void>;
}
