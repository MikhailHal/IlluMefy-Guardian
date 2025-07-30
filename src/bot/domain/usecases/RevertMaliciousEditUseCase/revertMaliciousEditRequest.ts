import { CreatorEditHistory } from "../../entities/creatorEditHistory";

/**
 * 悪意のある編集復元リクエスト
 */
export interface RevertMaliciousEditRequest {
    /** 復元対象の編集履歴エンティティ */
    editHistory: CreatorEditHistory;

    /** 復元理由 */
    revertReason: string;
}
