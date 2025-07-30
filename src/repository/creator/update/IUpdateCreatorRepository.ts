import { UpdateCreatorRequest } from "./UpdateCreatorRequest";
import { UpdateCreatorResponse } from "./UpdateCreatorResponse";

/**
 * クリエイター更新リポジトリインターフェース
 */
export interface IUpdateCreatorRepository {
    /**
     * クリエイター情報を更新
     * @param {UpdateCreatorRequest} request 更新リクエスト
     * @return {Promise<UpdateCreatorResponse>} 更新結果
     */
    updateCreator(request: UpdateCreatorRequest): Promise<UpdateCreatorResponse>;
}