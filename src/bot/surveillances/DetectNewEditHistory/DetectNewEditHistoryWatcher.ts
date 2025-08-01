import { initializeApp, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import type { IGuardianDispatcher } from "../../dispatcher/IGuardianDispatcher";
import type { IWatcher } from "../interfaces/IWatcher";

/**
 * 編集履歴の更新を検知するウォッチャー
 * Firestore CreatorEditHistory コレクションの変更を監視
 */
export class DetectNewEditHistoryWatcher implements IWatcher {
    private db?: FirebaseFirestore.Firestore;
    private unsubscribe?: () => void;
    private isInitialLoad = true;

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

                // 初回起動時の全件取得は無視
                if (this.isInitialLoad) {
                    this.isInitialLoad = false;
                    console.log("Initial load ignored - skipping existing edit histories");
                    return;
                }

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
