import { ISecretManager } from "../secretManager/ISecretManager";
import { IBraveSearchClient, BraveSearchResponse, SearchConfig, SearchResult } from "./IBraveSearchClient";

/**
 * Brave Search API クライアント実装
 */
export class BraveSearchClient implements IBraveSearchClient {
    private apiKey: string | null = null;
    private readonly baseURL = "https://api.search.brave.com/res/v1/web/search";

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
            this.apiKey = await this.secretManager.getSecret("brave-search-api-key");
        }
        return this.apiKey;
    }

    /**
     * ウェブ検索を実行
     */
    /**
     * ウェブ検索を実行
     * @param {string} query 検索クエリ
     * @param {SearchConfig} config 検索設定
     * @return {Promise<BraveSearchResponse>} 検索結果
     */
    async search(query: string, config: SearchConfig = {}): Promise<BraveSearchResponse> {
        try {
            const apiKey = await this.getApiKey();
            const {
                count = 20,
                offset = 0,
                market = "ja-JP",
                safeSearch = "moderate",
            } = config;

            const params = new URLSearchParams({
                q: query,
                count: count.toString(),
                offset: offset.toString(),
                market,
                safesearch: safeSearch,
            });

            const response = await fetch(`${this.baseURL}?${params}`, {
                method: "GET",
                headers: {
                    "Accept": "application/json",
                    "Accept-Encoding": "gzip",
                    "X-Subscription-Token": apiKey,
                },
            });

            if (!response.ok) {
                throw new Error(`Brave Search API error: ${response.status} ${response.statusText}`);
            }

            const data: any = await response.json();

            // Brave Search APIレスポンスを統一フォーマットに変換
            const results: SearchResult[] = (data.web?.results || []).map((result: any) => ({
                title: result.title || "",
                url: result.url || "",
                snippet: result.description || "",
                published: result.published || undefined,
            }));

            return {
                query,
                results,
                totalResults: data.web?.total || results.length,
            };
        } catch (error) {
            console.error("Error calling Brave Search API:", error);
            throw new Error(`Failed to call Brave Search API: ${error}`);
        }
    }

    /**
     * クリエイター情報に特化した検索
     */
    /**
     * クリエイター情報に特化した検索
     * @param {string} creatorName クリエイター名
     * @return {Promise<BraveSearchResponse>} 検索結果
     */
    async searchCreatorInfo(creatorName: string): Promise<BraveSearchResponse> {
        // クリエイター情報取得に最適化したクエリ
        const query = `"${creatorName}" プロフィール 活動内容 ジャンル 経歴`;

        return await this.search(query, {
            count: 3, // 関連性の高い結果のみ取得
            safeSearch: "moderate",
        });
    }
}
