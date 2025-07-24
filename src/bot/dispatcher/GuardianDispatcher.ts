import { CommandInteraction } from "discord.js";
import { IGuardianDispatcher } from "./IGuardianDispatcher";
import { CommandRegistry } from "../commandRegistry/CommandRegistry";
import { ICommandRegistry } from "../commandRegistry/ICommandRegistry";

/**
 * GuardianDispatcher実装
 * コマンドとイベントの統合処理を行う
 */
export class GuardianDispatcher implements IGuardianDispatcher {
    private commandRegistry: ICommandRegistry;

    /**
     * コンストラクタ
     */
    constructor() {
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

            // TODO: イベントルーティング実装
            switch (eventType) {
            case "messageCreate":
                console.log("Message monitoring...");
                // TODO: メッセージ監視処理
                break;
            case "editHistoryChange":
                console.log("Edit history change detected");
                // TODO: 編集履歴変更処理
                break;
            case "maliciousEdit":
                console.log("Malicious edit detected, reverting...");
                // TODO: 不正編集復元処理
                break;
            default:
                console.log(`Unhandled event type: ${eventType}`);
            }
        } catch (error) {
            console.error(`Error handling event ${eventType}:`, error);
        }
    }
}
