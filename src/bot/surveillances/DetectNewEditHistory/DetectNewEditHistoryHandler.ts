import { HandlerResult, IHandler } from "../interfaces/IHandler";

/**
 * DetectNewEditHistoryWatcher検知時のイベントハンドラ
 */
export class DetectNewEditHistoryHandler implements IHandler {
    /**
     * ハンドラ
     */
    onDetect(): Promise<HandlerResult> {
        throw new Error("Method not implemented.");
    }
}
