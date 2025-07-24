/**
 * 毒性スコアエンティティ
 */
export interface ToxicityScore {
    /** 毒性 */
    toxicity?: number;
    /** 重度の毒性 */
    severeToxicity?: number;
    /** アイデンティティ攻撃 */
    identityAttack?: number;
    /** 侮辱 */
    insult?: number;
    /** 冒涜 */
    profanity?: number;
    /** 脅迫 */
    threat?: number;
}
