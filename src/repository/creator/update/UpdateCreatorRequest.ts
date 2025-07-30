/**
 * クリエイター更新リクエスト
 */
export interface UpdateCreatorRequest {
    /** 更新対象のクリエイターID */
    creatorId: string;
    
    /** 基本情報の更新（値があるフィールドのみ更新） */
    basicInfo?: {
        name?: string;
        description?: string;
        profileImageUrl?: string;
    };
    
    /** SNSリンクの更新（値があるフィールドのみ更新） */
    socialLinks?: {
        youtubeUrl?: string;
        twitchUrl?: string;
        tiktokUrl?: string;
        instagramUrl?: string;
        xUrl?: string;
        discordUrl?: string;
        niconicoUrl?: string;
    };
    
    /** タグの更新（完全置き換え） */
    tags?: string[];
    
    /** 更新理由（監査用） */
    updateReason: string;
    
    /** 編集履歴ID（復元時のみ指定） */
    editHistoryId?: string;
}