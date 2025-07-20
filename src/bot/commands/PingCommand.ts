import { CommandInteraction } from "discord.js";
import { ICommand } from "./interface/ICommand";
import { CommandResult } from "./interface/CommandResult";

/**
 * Pingコマンド実装
 */
export class PingCommand implements ICommand {
    /** コマンド名 */
    name = "ping";

    /** コマンド説明 */
    description = "Pong!を返します";

    /**
     * コマンド実行
     * @param {CommandInteraction} commandInteraction コマンド情報
     * @return {CommandResult} コマンド実行結果
     */
    async execute(commandInteraction: CommandInteraction): Promise<CommandResult> {
        try {
            await commandInteraction.reply("Pong! 🏓");
            return {
                isSuccess: true,
                message: "Ping command executed successfully",
            };
        } catch (error) {
            return {
                isSuccess: false,
                message: `Ping command failed: ${error}`,
            };
        }
    }
}
