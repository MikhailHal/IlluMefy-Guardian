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
}
