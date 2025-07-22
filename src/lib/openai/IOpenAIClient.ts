/**
 * OpenAI API レスポンス
 */
export interface OpenAIResponse {
    content: string;
    finishReason: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}

/**
 * OpenAI チャット完了設定
 */
export interface ChatCompletionConfig {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
}

/**
 * OpenAI クライアントインターフェース
 */
export interface IOpenAIClient {
    /**
     * チャット完了APIを呼び出し
     * @param {string} prompt プロンプト
     * @param {ChatCompletionConfig} config 設定
     * @return {Promise<OpenAIResponse>} レスポンス
     */
    chatCompletion(prompt: string, config?: ChatCompletionConfig): Promise<OpenAIResponse>;

    /**
     * JSON形式のレスポンスを期待するチャット完了
     * @param {string} prompt プロンプト
     * @param {ChatCompletionConfig} config 設定
     * @return {Promise<any>} JSONパース済みレスポンス
     */
    chatCompletionJSON(prompt: string, config?: ChatCompletionConfig): Promise<any>;
}
