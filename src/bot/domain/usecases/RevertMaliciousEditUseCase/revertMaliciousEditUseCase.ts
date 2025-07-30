import { Firestore } from "firebase-admin/firestore";
import { IRevertMaliciousEditUseCase } from "./iRevertMaliciousEditUseCase";
import { RevertMaliciousEditRequest } from "./revertMaliciousEditRequest";
import { RevertMaliciousEditResponse } from "./revertMaliciousEditResponse";
import { CreatorEditHistory } from "../../entities/creatorEditHistory";
import { UpdateCreatorRepository } from "../../../repository/creator/update/updateCreatorRepository";
import { UpdateCreatorRequest } from "../../../repository/creator/update/updateCreatorRequest";

/**
 * 悪意のある編集復元ユースケース実装
 */
export class RevertMaliciousEditUseCase implements IRevertMaliciousEditUseCase {
    private updateCreatorRepository: UpdateCreatorRepository;

    /**
     * コンストラクタ
     * @param {Firestore} firestore Firestoreインスタンス
     */
    constructor(private readonly firestore: Firestore) {
        this.updateCreatorRepository = new UpdateCreatorRepository(firestore);
    }

    /**
     * 悪意のある編集を復元
     * @param {RevertMaliciousEditRequest} request 復元リクエスト
     * @return {Promise<RevertMaliciousEditResponse>} 復元結果
     */
    async execute(request: RevertMaliciousEditRequest): Promise<RevertMaliciousEditResponse> {
        try {
            const editHistory = request.editHistory;
            const updateRequest = await this.createUpdateRequest(editHistory, request.revertReason);
            const updateResult = await this.updateCreatorRepository.updateCreator(updateRequest);
            if (!updateResult.isSuccess) {
                return {
                    isSuccess: false,
                    error: updateResult.error,
                };
            }

            return {
                isSuccess: true,
            };
        } catch (error) {
            console.error("Error reverting malicious edit:", error);
            return {
                isSuccess: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }

    /**
     * 復元用の更新リクエストを作成
     * @param {CreatorEditHistory} editHistory 編集履歴エンティティ
     * @param {string} revertReason 復元理由
     * @return {Promise<UpdateCreatorRequest>} 更新リクエスト
     */
    private async createUpdateRequest(
        editHistory: CreatorEditHistory,
        revertReason: string
    ): Promise<UpdateCreatorRequest> {
        const updateRequest: UpdateCreatorRequest = {
            creatorId: editHistory.creatorId,
            updateReason: revertReason,
            editHistoryId: editHistory.id,
        };

        // 基本情報の復元
        if (editHistory.basicInfoChanges) {
            updateRequest.basicInfo = {};

            if (editHistory.basicInfoChanges.name) {
                updateRequest.basicInfo.name = editHistory.basicInfoChanges.name.before;
            }
            if (editHistory.basicInfoChanges.description) {
                updateRequest.basicInfo.description = editHistory.basicInfoChanges.description.before;
            }
            if (editHistory.basicInfoChanges.profileImageUrl) {
                updateRequest.basicInfo.profileImageUrl = editHistory.basicInfoChanges.profileImageUrl.before;
            }
        }

        // SNSリンクの復元
        if (editHistory.socialLinksChanges) {
            updateRequest.socialLinks = {};

            Object.entries(editHistory.socialLinksChanges).forEach(([key, change]) => {
                if (change && updateRequest.socialLinks) {
                    updateRequest.socialLinks[key as keyof typeof updateRequest.socialLinks] = change.before;
                }
            });
        }

        // タグの復元
        if (editHistory.tagsChanges) {
            // 現在のタグ情報を取得
            const creatorDoc = await this.firestore
                .collection("creators")
                .doc(editHistory.creatorId)
                .get();

            if (creatorDoc.exists) {
                const currentTags = creatorDoc.data()?.tags || [];

                // 追加されたタグを除去し、削除されたタグを追加
                const revertedTags = [
                    ...currentTags.filter((tag: string) => !editHistory.tagsChanges?.added.includes(tag)),
                    ...editHistory.tagsChanges.removed,
                ];

                updateRequest.tags = revertedTags;
            }
        }

        return updateRequest;
    }
}
