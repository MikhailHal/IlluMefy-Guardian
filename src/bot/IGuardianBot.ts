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
    /** ウォッチャー初期化 */
    initializeWatcher(): Promise<void>;
    /** ウォッチャー開始 */
    startWatcher(): Promise<void>;
    /** ウォッチャー停止 */
    stopWatcher(): Promise<void>;
}
