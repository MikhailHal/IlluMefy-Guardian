import { DocumentChange } from "firebase-admin/firestore";
import { MaliciousEditAnalysis } from "../../entities/MaliciousEditAnalysis";

/**
 * 悪意のある編集検知ユースケースインターフェース
 */
export interface IDetectMaliciousEditUseCase {
    /**
     * DocumentChangeから悪意のある編集を検知
     * @param {DocumentChange[]} changes Firestore変更データ
     * @return {Promise<MaliciousEditAnalysis>} 分析結果
     */
    analyzeChanges(changes: DocumentChange[]): Promise<MaliciousEditAnalysis>;
}
