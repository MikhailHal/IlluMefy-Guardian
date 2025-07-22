import { CommandInteraction } from "discord.js";
import { ICommand } from "./interface/ICommand";
import { CommandResult } from "./interface/CommandResult";

/**
 * 編集監視コマンド
 * コンテンツの編集を監視して悪意のある変更を検出する
 */
export class EditMonitoringCommand implements ICommand {
    public readonly name = "monitor";
    public readonly description = "コンテンツの編集を監視して悪意のある変更を検出します";

    /**
     * コマンド実行
     * @param {CommandInteraction} commandInteraction コマンド情報
     * @return {Promise<CommandResult>} コマンド実行結果
     */
    async execute(commandInteraction: CommandInteraction): Promise<CommandResult> {
        try {
            // TODO: UseCaseを使用した編集監視処理
            // 現在はHello World応答のみ
            await commandInteraction.reply("Hello World from EditMonitoringCommand! 👁️");
            
            return {
                isSuccess: true,
                message: "Edit monitoring command executed successfully",
            };
        } catch (error) {
            console.error("Error in EditMonitoringCommand:", error);

            if (!commandInteraction.replied) {
                await commandInteraction.reply("Edit monitoring failed");
            }

            return {
                isSuccess: false,
                message: `Edit monitoring command failed: ${error}`,
            };
        }
    }
}
