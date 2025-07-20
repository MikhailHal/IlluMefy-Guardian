import { CommandInteraction } from "discord.js";
import { CommandResult } from "./CommandResult";

/**
 * コマンドインターフェース
 */
export interface ICommand {
    /** コマンド名 */
    name: string;
    /** コマンド説明 */
    description: string;
    /**
     * コマンド実行
     * @param {CommandInteraction} commandInteraction コマンド情報
     * @return {CommandResult} コマンド実行結果
     */
    execute(commandInteraction: CommandInteraction): Promise<CommandResult>;
}
