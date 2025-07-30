import type { Timestamp } from "firebase-admin/firestore";
import type { EditReasonType } from "../enum/editReason";

/** 復元操作を表す型 */
export interface RevertOperation {
    field: string;
    revertToValue: string | boolean | number | null;
}

/** タグ復元操作を表す型 */
export interface RevertTagsOperation {
    tagsToRemove: string[];
    tagsToAdd: string[];
}

/**
 * クリエイター編集履歴のモデル定義
 */
export class CreatorEditHistory {
    /** Firestore ドキュメントID */
    id: string;
    /** 編集対象のクリエイターID */
    creatorId: string;
    /** 編集対象のクリエイター名（表示用、削除されても履歴で見える） */
    creatorName: string;

    /** 基本情報の変更 */
    basicInfoChanges?: {
        name?: { before: string; after: string };
        description?: { before: string; after: string };
        profileImageUrl?: { before: string; after: string };
    };

    /** SNSリンクの変更 */
    socialLinksChanges?: {
        youtubeUrl?: { before: string; after: string };
        twitchUrl?: { before: string; after: string };
        tiktokUrl?: { before: string; after: string };
        instagramUrl?: { before: string; after: string };
        xUrl?: { before: string; after: string };
        discordUrl?: { before: string; after: string };
        niconicoUrl?: { before: string; after: string };
    };

    /** タグの変更 */
    tagsChanges?: {
        added: string[]; // 追加されたタグ名
        removed: string[]; // 削除されたタグ名
    };

    /** 編集者情報 */
    userId: string;
    userPhoneNumber: string; // BAN用

    /** メタデータ */
    timestamp: Timestamp;
    editReason?: EditReasonType;
    moderatorNote?: string; // モデレーターが編集した場合のメモ

    /**
     * コンストラクタ
     * @param {Partial<CreatorEditHistory>} data 編集履歴データ
     */
    constructor(data: Partial<CreatorEditHistory>) {
        this.id = data.id || "";
        this.creatorId = data.creatorId || "";
        this.creatorName = data.creatorName || "";
        this.userId = data.userId || "";
        this.userPhoneNumber = data.userPhoneNumber || "";
        this.timestamp = data.timestamp || ({} as Timestamp);

        if (data.basicInfoChanges) {
            this.basicInfoChanges = data.basicInfoChanges;
        }
        if (data.socialLinksChanges) {
            this.socialLinksChanges = data.socialLinksChanges;
        }
        if (data.tagsChanges) {
            this.tagsChanges = data.tagsChanges;
        }
        if (data.editReason) {
            this.editReason = data.editReason;
        }
        if (data.moderatorNote) {
            this.moderatorNote = data.moderatorNote;
        }
    }


    /**
     * 変更内容が存在するか判定
     * @return {boolean} 変更がある場合true
     */
    hasChanges(): boolean {
        return !!(this.basicInfoChanges || this.socialLinksChanges || this.tagsChanges);
    }

    /**
     * 復元操作を生成
     * @return {RevertOperation[]} 復元操作の配列
     */
    getRevertOperations(): RevertOperation[] {
        const operations: RevertOperation[] = [];

        // 基本情報の復元操作
        if (this.basicInfoChanges) {
            if (this.basicInfoChanges.name) {
                operations.push({
                    field: "name",
                    revertToValue: this.basicInfoChanges.name.before,
                });
            }
            if (this.basicInfoChanges.description) {
                operations.push({
                    field: "description",
                    revertToValue: this.basicInfoChanges.description.before,
                });
            }
            if (this.basicInfoChanges.profileImageUrl) {
                operations.push({
                    field: "profileImageUrl",
                    revertToValue: this.basicInfoChanges.profileImageUrl.before,
                });
            }
        }

        // SNSリンクの復元操作
        if (this.socialLinksChanges) {
            Object.entries(this.socialLinksChanges).forEach(([key, change]) => {
                if (change) {
                    operations.push({
                        field: key,
                        revertToValue: change.before,
                    });
                }
            });
        }

        return operations;
    }

    /**
     * タグの復元操作を生成
     * @return {RevertTagsOperation | null} タグ復元操作
     */
    getRevertTagsOperation(): RevertTagsOperation | null {
        if (!this.tagsChanges) {
            return null;
        }

        return {
            tagsToRemove: this.tagsChanges.added, // 追加されたタグを削除
            tagsToAdd: this.tagsChanges.removed, // 削除されたタグを追加
        };
    }

    /**
     * Firestoreドキュメントに変換
     * @return {CreatorEditHistoryDocument} Firestoreに保存可能なドキュメント
     */
    toDocument(): CreatorEditHistoryDocument {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...doc } = this;
        return doc;
    }
}

/** Firestoreに保存する際の型（idとメソッドを除外） */
export type CreatorEditHistoryDocument = Omit<CreatorEditHistory, "id" | "hasChanges" | "getRevertOperations" | "getRevertTagsOperation" | "toDocument">;
