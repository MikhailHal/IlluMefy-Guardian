import { DocumentChange } from "firebase-admin/firestore";
import { HandlerResult, IHandler, NotificationActionType } from "../interfaces/IHandler";
import { DetectMaliciousEditUseCase } from "../../domain/usecases/DetectMaliciousEditUseCase/DetectMaliciousEditUseCase";
import { IConfigurationService } from "../../configurationService/IConfigurationService";

/**
 * DetectNewEditHistoryWatcher検知時のイベントハンドラ
 */
export class DetectNewEditHistoryHandler implements IHandler {
    private detectMaliciousEditUseCase: DetectMaliciousEditUseCase;

    /**
     * コンストラクタ
     * @param {IConfigurationService} configService 設定サービス
     */
    constructor(configService: IConfigurationService) {
        this.detectMaliciousEditUseCase = new DetectMaliciousEditUseCase(configService);
    }

    /**
     * 編集履歴変更検知時のハンドラ
     * @param {DocumentChange[]} changes Firestore変更データ
     * @return {Promise<HandlerResult>} ハンドラ結果
     */
    async onDetect(changes: DocumentChange[]): Promise<HandlerResult> {
        try {
            console.log(`Processing ${changes.length} edit history changes`);

            // UseCaseで悪意のある編集を検知
            const analysisResult = await this.detectMaliciousEditUseCase.analyzeChanges(changes);

            // 結果に基づいてHandlerResultを作成
            return {
                isSucceed: true,
                message: analysisResult.isMalicious ?
                    `🚨 Malicious edit detected: ${analysisResult.reason}` :
                    `✅ Edit history analyzed: ${analysisResult.reason}`,
                actionType: analysisResult.isMalicious ?
                    NotificationActionType.DISCORD_NOTIFICATION :
                    NotificationActionType.NONE,
                additionalData: {
                    isMalicious: analysisResult.isMalicious,
                    confidence: analysisResult.confidence,
                    reason: analysisResult.reason,
                    flaggedContent: analysisResult.flaggedContent,
                },
            };
        } catch (error) {
            console.error("Error in DetectNewEditHistoryHandler:", error);
            return {
                isSucceed: false,
                message: `❌ Handler failed: ${error instanceof Error ? error.message : "Unknown error"}`,
                actionType: NotificationActionType.NONE,
            };
        }
    }
}
