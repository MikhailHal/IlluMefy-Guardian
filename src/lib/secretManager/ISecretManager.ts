/**
 * シークレット管理サービスインターフェース
 */
export interface ISecretManager {
    /**
     * シークレットを取得
     * @param {string} secretName シークレット名
     * @return {Promise<string>} シークレット値
     */
    getSecret(secretName: string): Promise<string>;
}
