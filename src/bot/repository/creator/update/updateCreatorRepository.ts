import { Firestore, FieldValue } from "firebase-admin/firestore";
import { IUpdateCreatorRepository } from "./iUpdateCreatorRepository";
import { UpdateCreatorRequest } from "./updateCreatorRequest";
import { UpdateCreatorResponse } from "./updateCreatorResponse";

/**
 * クリエイター更新リポジトリ実装
 */
export class UpdateCreatorRepository implements IUpdateCreatorRepository {
    /**
     * コンストラクタ
     * @param {Firestore} firestore Firestoreインスタンス
     */
    constructor(private readonly firestore: Firestore) {}

    /**
     * クリエイター情報を更新
     * @param {UpdateCreatorRequest} request 更新リクエスト
     * @return {Promise<UpdateCreatorResponse>} 更新結果
     */
    async updateCreator(request: UpdateCreatorRequest): Promise<UpdateCreatorResponse> {
        try {
            const creatorRef = this.firestore.collection("creators").doc(request.creatorId);
            const updateData: Record<string, any> = {};
            const updatedFields: string[] = [];

            // 基本情報の更新
            if (request.basicInfo) {
                Object.entries(request.basicInfo).forEach(([field, value]) => {
                    if (value !== undefined) {
                        updateData[field] = value;
                        updatedFields.push(field);
                    }
                });
            }

            // SNSリンクの更新
            if (request.socialLinks) {
                Object.entries(request.socialLinks).forEach(([field, value]) => {
                    if (value !== undefined) {
                        updateData[field] = value;
                        updatedFields.push(field);
                    }
                });
            }

            // タグの更新（完全置き換え）
            if (request.tags !== undefined) {
                updateData.tags = request.tags;
                updatedFields.push("tags");
            }

            // 更新実行
            updateData.updatedAt = FieldValue.serverTimestamp();
            await creatorRef.update(updateData);

            // 復元時は編集履歴にマークを付ける
            if (request.editHistoryId) {
                await this.markEditHistoryAsReverted(request.editHistoryId, request.updateReason);
            }

            return {
                isSuccess: true,
            };
        } catch (error) {
            console.error("Failed to update creator:", error);
            return {
                isSuccess: false,
                error: error instanceof Error ? error.message : "Unknown error",
            };
        }
    }

    /**
     * 編集履歴に復元済みマークを付ける（内部用）
     * @param {string} editHistoryId 編集履歴ID
     * @param {string} revertReason 復元理由
     * @return {Promise<void>}
     */
    private async markEditHistoryAsReverted(editHistoryId: string, revertReason: string): Promise<void> {
        try {
            const editHistoryRef = this.firestore.collection("creatorEditHistories").doc(editHistoryId);
            await editHistoryRef.update({
                moderatorNote: `[Reverted by Guardian Bot] ${revertReason}`,
            });
        } catch (error) {
            console.error("Failed to mark edit history as reverted:", error);
            throw error;
        }
    }
}
