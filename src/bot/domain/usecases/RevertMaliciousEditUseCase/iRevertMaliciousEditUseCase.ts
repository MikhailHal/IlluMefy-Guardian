import { RevertMaliciousEditRequest } from "./revertMaliciousEditRequest";
import { RevertMaliciousEditResponse } from "./revertMaliciousEditResponse";

/**
 * 悪意のある編集復元ユースケースインターフェース
 */
export interface IRevertMaliciousEditUseCase {
    /**
     * 悪意のある編集を復元
     * @param {RevertMaliciousEditRequest} request 復元リクエスト
     * @return {Promise<RevertMaliciousEditResponse>} 復元結果
     */
    execute(request: RevertMaliciousEditRequest): Promise<RevertMaliciousEditResponse>;
}
