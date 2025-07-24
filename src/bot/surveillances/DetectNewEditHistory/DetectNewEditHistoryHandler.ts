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
            for (const change of changes) {
                const analysisResult = await this.detectMaliciousEditUseCase.analyzeSingleEditHistory(change);
                
                // 危険度が50%以上の場合のみDiscord通知を送信
                const shouldNotify = analysisResult.isMalicious && analysisResult.riskScore >= 0.5;
                
                if (shouldNotify) {
                    const editDetails = this.extractEditDetails([change]);
                    return {
                        isSucceed: true,
                        message: `🚨 Malicious edit detected (危険度: ${Math.round(analysisResult.riskScore * 100)}%): ${analysisResult.reason}`,
                        actionType: NotificationActionType.DISCORD_NOTIFICATION,
                        additionalData: {
                            isMalicious: analysisResult.isMalicious,
                            riskScore: analysisResult.riskScore,
                            reason: analysisResult.reason,
                            flaggedContent: analysisResult.flaggedContent,
                            editDetails: editDetails,
                            perspectiveScores: analysisResult.perspectiveScores,
                        },
                    };
                }
            }

            // すべてクリーンな場合
            return {
                isSucceed: true,
                message: `✅ All ${changes.length} edit histories analyzed - no threats detected`,
                actionType: NotificationActionType.NONE,
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

    /**
     * 編集履歴から詳細情報を抽出
     * @param {DocumentChange[]} changes Firestore変更データ
     * @return {Array} 編集詳細情報
     */
    private extractEditDetails(changes: DocumentChange[]): Array<Record<string, unknown>> {
        return changes.map((change) => {
            const data = change.doc.data();
            return {
                editHistoryId: change.doc.id, // 編集履歴のID（混同を避けるため名前変更）
                creatorId: data.creatorId || data.targetCreatorId || "不明", // 実際のクリエイターID
                userPhoneNumber: data.userPhoneNumber || "不明",
                creatorName: data.creatorName || "不明",
                timestamp: data.timestamp || null,
                basicInfoChanges: data.basicInfoChanges || null,
                socialLinksChanges: data.socialLinksChanges || null,
                tagsChanges: data.tagsChanges || null,
            };
        });
    }
}
