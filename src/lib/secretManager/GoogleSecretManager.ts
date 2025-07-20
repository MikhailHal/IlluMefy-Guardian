import { SecretManagerServiceClient } from "@google-cloud/secret-manager";
import { ISecretManager } from "./ISecretManager";

/**
 * Google Cloud Secret Manager実装
 */
export class GoogleSecretManager implements ISecretManager {
    private client: SecretManagerServiceClient;
    private projectId: string;

    /**
     * コンストラクタ
     * @param {string} projectId Google Cloud Project ID
     */
    constructor(projectId: string) {
        this.client = new SecretManagerServiceClient();
        this.projectId = projectId;
    }

    /**
     * シークレットを取得
     * @param {string} secretName シークレット名
     * @return {Promise<string>} シークレット値
     */
    async getSecret(secretName: string): Promise<string> {
        try {
            const name = `projects/${this.projectId}/secrets/${secretName}/versions/latest`;

            const [version] = await this.client.accessSecretVersion({
                name: name,
            });

            const payload = version.payload?.data?.toString();
            if (!payload) {
                throw new Error(`Secret ${secretName} has no payload`);
            }

            return payload;
        } catch (error) {
            throw new Error(`Failed to get secret ${secretName}: ${error}`);
        }
    }
}
