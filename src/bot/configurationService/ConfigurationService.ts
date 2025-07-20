import { IConfigurationService } from "../../bot/interface/IConfigurationService";
import { ISecretManager } from "../../lib/secretManager/ISecretManager";

/**
 * 設定管理サービス実装
 */
export class ConfigurationService implements IConfigurationService {
    /**
     * コンストラクタ
     * @param {ISecretManager} secretManager シークレット管理サービス
     */
    constructor(private secretManager: ISecretManager) {}

    /**
     * Discord Bot Token取得
     * @return {Promise<string>} Discord Bot Token
     */
    async getDiscordToken(): Promise<string> {
        return await this.secretManager.getSecret("discord-bot-key");
    }

    /**
     * Perspective API Key取得
     * @return {Promise<string>} Perspective API Key
     */
    async getPerspectiveApiKey(): Promise<string> {
        return await this.secretManager.getSecret("perspective-api-key");
    }

    /**
     * Discord Application ID取得
     * @return {Promise<string>} Discord Application ID
     */
    async getDiscordApplicationId(): Promise<string> {
        return await this.secretManager.getSecret("discord-application-id");
    }
}
