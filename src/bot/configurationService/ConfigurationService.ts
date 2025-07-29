import { IConfigurationService } from "./IConfigurationService";
import { ISecretManager } from "../../lib/secretManager/ISecretManager";
import { DiscordNotificationType } from "../types/DiscordNotificationType";

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

    /**
     * OpenAI API Key取得
     * @return {Promise<string>} OpenAI API Key
     */
    async getOpenAIApiKey(): Promise<string> {
        return await this.secretManager.getSecret("openai-api-key");
    }

    /**
     * Brave Search API Key取得
     * @return {Promise<string>} Brave Search API Key
     */
    async getBraveSearchApiKey(): Promise<string> {
        return await this.secretManager.getSecret("brave-search-api-key");
    }

    /**
     * 通知タイプ別Discordチャンネル ID取得
     * @param {DiscordNotificationType} type 通知タイプ
     * @return {Promise<string>} Discord Channel ID
     */
    async getChannelIdForNotificationType(type: DiscordNotificationType): Promise<string> {
        switch (type) {
            case DiscordNotificationType.MALICIOUS_EDIT:
                try {
                    return await this.secretManager.getSecret("discord-malicious-edit-channel-id");
                } catch (error) {
                    console.warn(`No specific channel configured for ${type}, using default alert channel`);
                    return await this.secretManager.getSecret("discord-wander-channel-id");
                }
            default:
                console.warn(`Unknown notification type: ${type}, using default alert channel`);
                return await this.secretManager.getSecret("discord-wander-channel-id");
        }
    }
}
