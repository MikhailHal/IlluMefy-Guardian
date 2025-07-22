import { IConfigurationService } from "../../bot/configurationService/IConfigurationService";

/**
 * Perspective API分析結果
 */
export interface ToxicityAnalysis {
    scores: {
        TOXICITY: number;
        SEVERE_TOXICITY: number;
        IDENTITY_ATTACK: number;
        INSULT: number;
        PROFANITY: number;
        THREAT: number;
    };
    isToxic: boolean;
    confidence: number;
}

/**
 * Perspective APIクライアントインターフェース
 */
export interface IPerspectiveApiClient {
    /**
     * テキストの毒性を分析
     * @param {string} text 分析対象テキスト
     * @return {Promise<ToxicityAnalysis>} 分析結果
     */
    analyzeToxicity(text: string): Promise<ToxicityAnalysis>;

    /**
     * シンプルな毒性判定
     * @param {string} text 分析対象テキスト
     * @param {number} threshold 閾値（デフォルト0.7）
     * @return {Promise<boolean>} 有毒かどうか
     */
    isToxic(text: string, threshold?: number): Promise<boolean>;
}

/**
 * Google Perspective APIクライアント実装
 */
export class PerspectiveApiClient implements IPerspectiveApiClient {
    private apiKey: string | null = null;

    /**
     * コンストラクタ
     * @param {IConfigurationService} configService 設定サービス
     */
    constructor(private configService: IConfigurationService) {}

    /**
     * APIキーを取得（遅延初期化）
     */
    private async getApiKey(): Promise<string> {
        if (!this.apiKey) {
            this.apiKey = await this.configService.getPerspectiveApiKey();
        }
        return this.apiKey;
    }

    /**
     * テキストの毒性を分析
     */
    /**
     * テキストの毒性を分析
     * @param {string} text 分析対象テキスト
     * @return {Promise<ToxicityAnalysis>} 分析結果
     */
    async analyzeToxicity(text: string): Promise<ToxicityAnalysis> {
        try {
            const apiKey = await this.getApiKey();
            const url = `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${apiKey}`;

            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    languages: ["ja"],
                    requestedAttributes: {
                        TOXICITY: {},
                        SEVERE_TOXICITY: {},
                        IDENTITY_ATTACK: {},
                        INSULT: {},
                        PROFANITY: {},
                        THREAT: {},
                    },
                    comment: { text },
                }),
            });

            if (!response.ok) {
                throw new Error(`Perspective API error: ${response.status}`);
            }

            const data: any = await response.json();
            const scores = {
                TOXICITY: data.attributeScores.TOXICITY?.summaryScore?.value || 0,
                SEVERE_TOXICITY: data.attributeScores.SEVERE_TOXICITY?.summaryScore?.value || 0,
                IDENTITY_ATTACK: data.attributeScores.IDENTITY_ATTACK?.summaryScore?.value || 0,
                INSULT: data.attributeScores.INSULT?.summaryScore?.value || 0,
                PROFANITY: data.attributeScores.PROFANITY?.summaryScore?.value || 0,
                THREAT: data.attributeScores.THREAT?.summaryScore?.value || 0,
            };

            const toxicityScore = scores.TOXICITY;
            const confidence = data.attributeScores.TOXICITY?.summaryScore?.confidence || 0.5;

            return {
                scores,
                isToxic: toxicityScore > 0.7,
                confidence,
            };
        } catch (error) {
            console.error("Error analyzing toxicity:", error);
            throw new Error(`Failed to analyze toxicity: ${error}`);
        }
    }

    /**
     * シンプルな毒性判定
     */
    /**
     * シンプルな毒性判定
     * @param {string} text 分析対象テキスト
     * @param {number} threshold 闾値
     * @return {Promise<boolean>} 有毒かどうか
     */
    async isToxic(text: string, threshold = 0.7): Promise<boolean> {
        const analysis = await this.analyzeToxicity(text);
        return analysis.scores.TOXICITY > threshold;
    }
}
