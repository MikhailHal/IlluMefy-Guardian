/**
 * ウォッチャーインターフェース
 */
export interface IWatcher {
    /**
     * 初期化
     */
    initialize(): Promise<void>;

    /**
     * 監視開始
     */
    startMonitoring(): void;

    /**
     * 監視停止
     */
    stopMonitoring(): void;
}
