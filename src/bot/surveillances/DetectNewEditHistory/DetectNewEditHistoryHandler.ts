import { DocumentChange, Firestore } from "firebase-admin/firestore";
import { HandlerResult, IHandler, NotificationActionType } from "../interfaces/IHandler";
import { AnalyzeMaliciousEditUseCase } from "../../domain/usecases/AnalyzeMaliciousEditUseCase/analyzeMaliciousEditUseCase";
import { RevertMaliciousEditUseCase } from "../../domain/usecases/RevertMaliciousEditUseCase/revertMaliciousEditUseCase";
import { CreatorEditHistory } from "../../domain/entities/creatorEditHistory";
import { IConfigurationService } from "../../configurationService/IConfigurationService";
import { DiscordNotificationType } from "../../types/DiscordNotificationType";

/**
 * DetectNewEditHistoryWatcher検知時のイベントハンドラ
 */
export class DetectNewEditHistoryHandler implements IHandler {
    private analyzeMaliciousEditUseCase: AnalyzeMaliciousEditUseCase;
    private revertMaliciousEditUseCase: RevertMaliciousEditUseCase;

    /**
     * コンストラクタ
     * @param {IConfigurationService} configService 設定サービス
     * @param {Firestore} firestore Firestoreインスタンス
     */
    constructor(
        configService: IConfigurationService,
        private readonly firestore: Firestore
    ) {
        this.analyzeMaliciousEditUseCase = new AnalyzeMaliciousEditUseCase(configService);
        this.revertMaliciousEditUseCase = new RevertMaliciousEditUseCase(firestore);
    }

    /**
     * 編集履歴変更検知時のハンドラ
     * @param {DocumentChange[]} changes Firestore変更データ
     * @return {Promise<HandlerResult>} ハンドラ結果
     */
    async onDetect(changes: DocumentChange[]): Promise<HandlerResult> {
        try {
            for (const change of changes) {
                const analysisResult = await this.analyzeMaliciousEditUseCase.analyzeSingleEditHistory(change);

                // 危険度が50%以上の場合のみDiscord通知を送信
                const shouldNotify = analysisResult.isMalicious && analysisResult.riskScore >= 0.5;

                if (shouldNotify) {
                    // 悪意のある編集を自動復元
                    const editHistory = this.createEditHistoryFromChange(change);
                    const revertResult = await this.revertMaliciousEditUseCase.execute({
                        editHistory: editHistory,
                        revertReason: `自動復元: 悪意のある編集検知 (危険度: ${Math.round(analysisResult.riskScore * 100)}%)`,
                    });

                    let message = `🚨 Malicious edit detected (危険度: ${Math.round(analysisResult.riskScore * 100)}%): ${analysisResult.reason}`;

                    if (revertResult.isSuccess) {
                        message += " → ✅ 自動復元完了";
                    } else {
                        message += ` → ❌ 自動復元失敗: ${revertResult.error}`;
                    }

                    const editDetails = this.extractEditDetails([change]);
                    return {
                        isSucceed: true,
                        message: message,
                        actionType: NotificationActionType.DISCORD_NOTIFICATION,
                        additionalData: {
                            isMalicious: analysisResult.isMalicious,
                            riskScore: analysisResult.riskScore,
                            reason: analysisResult.reason,
                            flaggedContent: analysisResult.flaggedContent,
                            editDetails: editDetails,
                            perspectiveScores: analysisResult.perspectiveScores,
                            notificationType: DiscordNotificationType.MALICIOUS_EDIT,
                            autoRevertSuccess: revertResult.isSuccess,
                            autoRevertError: revertResult.error,
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
     * DocumentChangeからCreatorEditHistoryエンティティを作成
     * @param {DocumentChange} change Firestore変更データ
     * @return {CreatorEditHistory} 編集履歴エンティティ
     */
    private createEditHistoryFromChange(change: DocumentChange): CreatorEditHistory {
        const data = change.doc.data();
        return new CreatorEditHistory({
            id: change.doc.id,
            creatorId: data.creatorId || data.targetCreatorId || "",
            creatorName: data.creatorName || "",
            userId: data.userId || "",
            userPhoneNumber: data.userPhoneNumber || "",
            timestamp: data.timestamp || new Date(),
            basicInfoChanges: data.basicInfoChanges || null,
            socialLinksChanges: data.socialLinksChanges || null,
            tagsChanges: data.tagsChanges || null,
            editReason: data.editReason || undefined,
            moderatorNote: data.moderatorNote || undefined,
        });
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
