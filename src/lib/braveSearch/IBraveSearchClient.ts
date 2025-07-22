/**
 * Brave Search 結果項目
 */
export interface SearchResult {
    title: string;
    url: string;
    snippet: string;
    published?: string;
}

/**
 * Brave Search レスポンス
 */
export interface BraveSearchResponse {
    query: string;
    results: SearchResult[];
    totalResults?: number;
}

/**
 * 検索設定
 */
export interface SearchConfig {
    count?: number; // 取得件数（デフォルト5）
    offset?: number; // オフセット
    market?: string; // 地域（デフォルト'ja-JP'）
    safeSearch?: string; // セーフサーチ（'strict' | 'moderate' | 'off'）
}

/**
 * Brave Search クライアントインターフェース
 */
export interface IBraveSearchClient {
    /**
     * ウェブ検索を実行
     * @param {string} query 検索クエリ
     * @param {SearchConfig} config 検索設定
     * @return {Promise<BraveSearchResponse>} 検索結果
     */
    search(query: string, config?: SearchConfig): Promise<BraveSearchResponse>;

    /**
     * クリエイター情報に特化した検索
     * @param {string} creatorName クリエイター名
     * @return {Promise<BraveSearchResponse>} 検索結果
     */
    searchCreatorInfo(creatorName: string): Promise<BraveSearchResponse>;
}
