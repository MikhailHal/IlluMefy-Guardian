import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import type { IGuardianDispatcher } from "../dispatcher/IGuardianDispatcher";
import type { IMonitor } from "./IMonitor";

/**
 * 編集履歴監視クラス
 * Firestore CreatorEditHistory コレクションの変更を監視
 */
export class EditHistoryMonitor implements IMonitor {
    private db?: FirebaseFirestore.Firestore;
    private unsubscribe?: () => void;

    /**
     * コンストラクタ
     * @param {IGuardianDispatcher} dispatcher イベント処理用ディスパッチャー
     */
    constructor(private readonly dispatcher: IGuardianDispatcher) {}

    /**
     * Firebase初期化
     */
    async initialize(): Promise<void> {
        try {
            if (getApps().length === 0) {
                initializeApp({
                    projectId: "illumefy-dev",
                });
            }
            this.db = getFirestore();
            console.log("EditHistoryMonitor Firebase initialized");
        } catch (error) {
            console.error("Failed to initialize Firebase in EditHistoryMonitor:", error);
            throw error;
        }
    }

    /**
     * 監視開始
     */
    startMonitoring(): void {
        if (!this.db) {
            throw new Error("Firebase not initialized. Call initialize() first.");
        }

        console.log("Starting edit history monitoring...");

        this.unsubscribe = this.db
            .collection("creatorEditHistories")
            .onSnapshot((snapshot) => {
                console.log(`Firestore snapshot: ${snapshot.size} docs, ${snapshot.docChanges().length} changes`);

                const changes = snapshot.docChanges();
                const newDocs = changes.filter((change) => change.type === "added");

                if (newDocs.length > 0) {
                    console.log(`Processing ${newDocs.length} new edit history documents`);
                    this.dispatcher.handleEvent("editHistoryChange", newDocs);
                }
            }, (error) => {
                console.error("Error listening to edit history:", error);
            });

        console.log("Edit history monitoring started");
    }

    /**
     * 監視停止
     */
    stopMonitoring(): void {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = undefined;
            console.log("Edit history monitoring stopped");
        }
    }
}
