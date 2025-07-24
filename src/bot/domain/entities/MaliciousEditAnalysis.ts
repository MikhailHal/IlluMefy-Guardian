import { ToxicityScore } from "./ToxicityScore";

/**
 * 悪意のある編集分析結果エンティティ
 */
export interface MaliciousEditAnalysis {
    /** 悪意のある編集かどうか */
    isMalicious: boolean;
    /** 危険度（0-1） */
    riskScore: number;
    /** 検知理由 */
    reason: string;
    /** 詳細メッセージ */
    details?: string;
    /** 検知されたテキスト */
    flaggedContent?: string[];
    /** Perspective APIスコア */
    perspectiveScores?: ToxicityScore;
}
