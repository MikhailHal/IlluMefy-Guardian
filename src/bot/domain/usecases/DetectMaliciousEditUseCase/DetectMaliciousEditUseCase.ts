import { DocumentChange } from "firebase-admin/firestore";
import { IDetectMaliciousEditUseCase } from "./IDetectMaliciousEditUseCase";
import { MaliciousEditAnalysis } from "../../entities/MaliciousEditAnalysis";
import { ToxicityScore } from "../../entities/ToxicityScore";
import { PerspectiveApiClient } from "../../../../lib/perspective/PerspectiveApiClient";
import { IConfigurationService } from "../../../configurationService/IConfigurationService";

/**
 * 悪意のある編集検知ユースケース実装
 */
export class DetectMaliciousEditUseCase implements IDetectMaliciousEditUseCase {
    private perspectiveClient: PerspectiveApiClient;

    /**
     * コンストラクタ
     * @param {IConfigurationService} configService 設定サービス
     */
    constructor(private configService: IConfigurationService) {
        this.perspectiveClient = new PerspectiveApiClient(configService);
    }

    /**
     * DocumentChangeから悪意のある編集を検知
     * @param {DocumentChange[]} changes Firestore変更データ
     * @return {Promise<MaliciousEditAnalysis>} 分析結果
     */
    async analyzeChanges(changes: DocumentChange[]): Promise<MaliciousEditAnalysis> {
        try {
            // 新規追加された編集履歴のみを対象
            const newChanges = changes.filter((change) => change.type === "added");

            if (newChanges.length === 0) {
                return this.createCleanResult("No new changes to analyze");
            }

            // 各変更を分析
            const analysisResults = await Promise.all(
                newChanges.map((change) => this.analyzeEditHistoryDocument(change.doc.data()))
            );

            // 分析結果を統合して最終判定
            const finalResult = this.evaluateResults(analysisResults);
            return finalResult;
        } catch (error) {
            console.error("Error analyzing changes:", error);
            return this.createErrorResult("Analysis failed due to internal error");
        }
    }


    /**
     * 編集履歴ドキュメントを分析
     * @param {any} editHistoryData 編集履歴データ
     * @return {Promise<MaliciousEditAnalysis>} 分析結果
     */
    private async analyzeEditHistoryDocument(editHistoryData: any): Promise<MaliciousEditAnalysis> {
        const textsToAnalyze: string[] = [];

        // 基本情報変更からテキストを抽出
        if (editHistoryData.basicInfoChanges) {
            if (editHistoryData.basicInfoChanges.name?.after) {
                textsToAnalyze.push(editHistoryData.basicInfoChanges.name.after);
            }
            if (editHistoryData.basicInfoChanges.description?.after) {
                textsToAnalyze.push(editHistoryData.basicInfoChanges.description.after);
            }
        }

        if (textsToAnalyze.length === 0) {
            return this.createCleanResult("No text content to analyze");
        }

        // Perspective API で分析
        const results = await Promise.all(
            textsToAnalyze.map((text) => this.analyzeSingleText(text))
        );

        return this.evaluateResults(results);
    }

    /**
     * 単一テキストをPerspective APIで分析
     * @param {string} text 分析対象テキスト
     * @return {Promise<MaliciousEditAnalysis>} 分析結果
     */
    private async analyzeSingleText(text: string): Promise<MaliciousEditAnalysis> {
        try {
            const analysis = await this.perspectiveClient.analyzeToxicity(text);

            // 分析結果を使用
            const isMalicious = analysis.isToxic;
            const confidence = analysis.confidence;

            return {
                isMalicious,
                confidence,
                reason: isMalicious ? "Toxic content detected" : "Content appears clean",
                details: isMalicious ? `Toxicity score: ${analysis.scores.TOXICITY}` : undefined,
                flaggedContent: isMalicious ? [text] : undefined,
                perspectiveScores: {
                    toxicity: analysis.scores.TOXICITY,
                    severeToxicity: analysis.scores.SEVERE_TOXICITY,
                    identityAttack: analysis.scores.IDENTITY_ATTACK,
                    insult: analysis.scores.INSULT,
                    profanity: analysis.scores.PROFANITY,
                    threat: analysis.scores.THREAT,
                } as ToxicityScore,
            };
        } catch (error) {
            console.error("Error analyzing text with Perspective API:", error);
            return this.createErrorResult(`Failed to analyze text: "${text.substring(0, 50)}..."`);
        }
    }

    /**
     * 複数の分析結果から最終結果を決定（一つでも悪意があれば悪意ありと判定）
     * @param {MaliciousEditAnalysis[]} results 分析結果配列
     * @return {MaliciousEditAnalysis} 最終判定結果
     */
    private evaluateResults(results: MaliciousEditAnalysis[]): MaliciousEditAnalysis {
        if (results.length === 0) {
            return this.createCleanResult("No results to evaluate");
        }

        // 一つでも悪意のあるものがあれば、その結果を返す
        const maliciousResult = results.find((r) => r.isMalicious);
        if (maliciousResult) {
            return maliciousResult;
        }

        // すべてクリーンな場合は最初の結果を返す
        return results[0];
    }

    /**
     * クリーンな結果を作成
     * @param {string} reason 理由
     * @return {MaliciousEditAnalysis} クリーンな結果
     */
    private createCleanResult(reason: string): MaliciousEditAnalysis {
        return {
            isMalicious: false,
            confidence: 0,
            reason,
        };
    }

    /**
     * エラー結果を作成
     * @param {string} reason エラー理由
     * @return {MaliciousEditAnalysis} エラー結果
     */
    private createErrorResult(reason: string): MaliciousEditAnalysis {
        return {
            isMalicious: false,
            confidence: 0,
            reason,
            details: "Error occurred during analysis",
        };
    }
}
