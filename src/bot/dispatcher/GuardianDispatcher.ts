import { CommandInteraction } from "discord.js";
import { DocumentChange, getFirestore } from "firebase-admin/firestore";
import { IGuardianDispatcher } from "./IGuardianDispatcher";
import { CommandRegistry } from "../commandRegistry/CommandRegistry";
import { ICommandRegistry } from "../commandRegistry/ICommandRegistry";
import { DetectNewEditHistoryHandler } from "../surveillances/DetectNewEditHistory/DetectNewEditHistoryHandler";
import { IConfigurationService } from "../configurationService/IConfigurationService";
import { NotificationActionType, HandlerResult } from "../surveillances/interfaces/IHandler";
import { GuardianEventBus } from "../eventBus/GuardianEventBus";

/**
 * GuardianDispatcher実装
 * コマンドとイベントの統合処理を行う
 */
export class GuardianDispatcher implements IGuardianDispatcher {
    private commandRegistry: ICommandRegistry;

    /**
     * コンストラクタ
     * @param {IConfigurationService} configService 設定サービス
     * @param {GuardianEventBus} eventBus イベントバス
     */
    constructor(
        private configService: IConfigurationService,
        private eventBus: GuardianEventBus,
    ) {
        this.commandRegistry = new CommandRegistry();
    }

    /**
     * 初期化
     */
    async initialize(): Promise<void> {
        console.log("GuardianDispatcher initialized");
    }

    /**
     * スラッシュコマンド登録
     * @param {string} token Discord Bot Token
     * @param {string} clientId Discord Application ID
     */
    async registerSlashCommands(token: string, clientId: string): Promise<void> {
        await this.commandRegistry.registerSlashCommands(token, clientId);
    }

    /**
     * コマンド処理
     * @param {CommandInteraction} interaction コマンドインタラクション
     */
    async handleCommand(interaction: CommandInteraction): Promise<void> {
        try {
            console.log(`Processing command: ${interaction.commandName}`);

            const command = this.commandRegistry.getCommand(interaction.commandName);
            if (command) {
                const result = await command.execute(interaction);
                console.log(`Command ${interaction.commandName} result:`, result);
            } else {
                await interaction.reply("Unknown command");
            }
        } catch (error) {
            console.error("Error handling command:", error);
            if (!interaction.replied) {
                await interaction.reply("Command execution failed");
            }
        }
    }

    /**
     * イベント処理
     * @param {string} eventType イベント種別
     * @param {unknown} _data イベントデータ
     */
    async handleEvent(eventType: string, _data: unknown): Promise<void> {
        try {
            console.log(`Processing event: ${eventType}`);

            let handlerResult: HandlerResult | null = null;

            // イベント別の固有処理
            switch (eventType) {
            case "messageCreate":
                console.log("Message monitoring...");
                // TODO: メッセージ監視処理
                break;
            case "editHistoryChange": {
                console.log("Edit history change detected");
                const firestore = getFirestore();
                const handler = new DetectNewEditHistoryHandler(this.configService, firestore);
                handlerResult = await handler.onDetect(_data as DocumentChange[]);
                console.log(`Handler result: ${handlerResult.message}`);
                break;
            }
            case "maliciousEdit":
                console.log("Malicious edit detected, reverting...");
                // TODO: 不正編集復元処理
                break;
            default:
                console.log(`Unhandled event type: ${eventType}`);
                return;
            }

            // アクションタイプ別の共通処理
            if (handlerResult) {
                await this.processHandlerAction(handlerResult);
            }
        } catch (error) {
            console.error(`Error handling event ${eventType}:`, error);
        }
    }

    /**
     * ハンドラー結果に基づくアクション処理
     * @param {HandlerResult} result ハンドラー結果
     */
    private async processHandlerAction(result: HandlerResult): Promise<void> {
        switch (result.actionType) {
        case NotificationActionType.DISCORD_NOTIFICATION:
            console.log("🚨 Processing Discord notification");
            this.eventBus.emitDiscordNotification(result.message, result.additionalData);
            break;
        case NotificationActionType.COMMAND_REPLY:
            console.log("💬 Processing command reply");
            this.eventBus.emitCommandReply(result.message, result.additionalData);
            break;
        case NotificationActionType.EMERGENCY_ALERT:
            console.log("🔥 Processing emergency alert");
            this.eventBus.emitEmergencyAlert(result.additionalData);
            break;
        case NotificationActionType.NONE:
        default:
            // 何もしない
            break;
        }
    }
}
