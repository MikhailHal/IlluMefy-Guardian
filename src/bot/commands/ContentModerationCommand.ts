import { CommandInteraction } from "discord.js";
import { ICommand } from "./interface/ICommand";
import { CommandResult } from "./interface/CommandResult";

/**
 * コンテンツモデレーションコマンド
 * メッセージの内容を分析して不適切なコンテンツを検出・対処する
 */
export class ContentModerationCommand implements ICommand {
    public readonly name = "moderate";
    public readonly description = "不適切なコンテンツを検出・対処します";

    /**
     * コマンド実行
     * @param {CommandInteraction} commandInteraction コマンド情報
     * @return {Promise<CommandResult>} コマンド実行結果
     */
    async execute(commandInteraction: CommandInteraction): Promise<CommandResult> {
        try {
            // TODO: UseCaseを使用したコンテンツモデレーション処理
            // 現在はHello World応答のみ
            await commandInteraction.reply("Hello World from ContentModerationCommand! 🛡️");

            return {
                isSuccess: true,
                message: "Content moderation command executed successfully",
            };
        } catch (error) {
            console.error("Error in ContentModerationCommand:", error);

            if (!commandInteraction.replied) {
                await commandInteraction.reply("Content moderation failed");
            }

            return {
                isSuccess: false,
                message: `Content moderation command failed: ${error}`,
            };
        }
    }
}
