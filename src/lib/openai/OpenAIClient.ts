import { ISecretManager } from "../secretManager/ISecretManager";
import { IOpenAIClient, OpenAIResponse, ChatCompletionConfig } from "./IOpenAIClient";

/**
 * OpenAI API クライアント実装
 */
export class OpenAIClient implements IOpenAIClient {
    private apiKey: string | null = null;
    private readonly baseURL = "https://api.openai.com/v1";

    /**
     * コンストラクタ
     * @param {ISecretManager} secretManager シークレット管理サービス
     */
    constructor(private secretManager: ISecretManager) {}

    /**
     * APIキーを取得（遅延初期化）
     */
    private async getApiKey(): Promise<string> {
        if (!this.apiKey) {
            this.apiKey = await this.secretManager.getSecret("openai-api-key");
        }
        return this.apiKey;
    }

    /**
     * チャット完了APIを呼び出し
     */
    /**
     * チャット完了APIを呼び出し
     * @param {string} prompt プロンプト
     * @param {ChatCompletionConfig} config 設定
     * @return {Promise<OpenAIResponse>} レスポンス
     */
    async chatCompletion(prompt: string, config: ChatCompletionConfig = {}): Promise<OpenAIResponse> {
        try {
            const apiKey = await this.getApiKey();
            const {
                model = "gpt-4o-mini",
                temperature = 0.1,
                maxTokens = 1000,
                topP = 0.9,
            } = config;

            const response = await fetch(`${this.baseURL}/chat/completions`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model,
                    messages: [
                        {
                            role: "user",
                            content: prompt,
                        },
                    ],
                    temperature,
                    max_tokens: maxTokens,
                    top_p: topP,
                }),
            });

            if (!response.ok) {
                throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
            }

            const data: any = await response.json();
            const choice = data.choices[0];

            return {
                content: choice.message.content,
                finishReason: choice.finish_reason,
                usage: data.usage ? {
                    promptTokens: data.usage.prompt_tokens,
                    completionTokens: data.usage.completion_tokens,
                    totalTokens: data.usage.total_tokens,
                } : undefined,
            };
        } catch (error) {
            console.error("Error calling OpenAI API:", error);
            throw new Error(`Failed to call OpenAI API: ${error}`);
        }
    }

    /**
     * JSON形式のレスポンスを期待するチャット完了
     */
    /**
     * JSON形式のレスポンスを期待するチャット完了
     * @param {string} prompt プロンプト
     * @param {ChatCompletionConfig} config 設定
     * @return {Promise<any>} JSONパース済みレスポンス
     */
    async chatCompletionJSON(prompt: string, config: ChatCompletionConfig = {}): Promise<any> {
        const response = await this.chatCompletion(prompt, {
            ...config,
            temperature: config.temperature ?? 0.1, // JSON出力は温度を低めに
        });

        try {
            return JSON.parse(response.content);
        } catch (error) {
            console.error("Failed to parse JSON response:", response.content);
            throw new Error(`Invalid JSON response from OpenAI: ${error}`);
        }
    }
}
