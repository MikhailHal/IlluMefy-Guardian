/**
 * 設定管理サービスインターフェース
 */
export interface IConfigurationService {
    /**
     * Discord Bot トークン取得
     * @return {Promise<string>} Discord Bot Token
     */
    getDiscordToken(): Promise<string>;

    /**
     * Perspective APIキー取得
     * @return {Promise<string>} Perspective APIキー
     */
    getPerspectiveApiKey(): Promise<string>;

    /**
     * Discord Application ID取得
     * @return {Promise<string>} Discord Application ID
     */
    getDiscordApplicationId(): Promise<string>;

    /**
     * OpenAI API Key取得
     * @return {Promise<string>} OpenAI API Key
     */
    getOpenAIApiKey(): Promise<string>;

    /**
     * Brave Search API Key取得
     * @return {Promise<string>} Brave Search API Key
     */
    getBraveSearchApiKey(): Promise<string>;
}
