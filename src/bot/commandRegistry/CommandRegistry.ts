import { REST, Routes, SlashCommandBuilder } from "discord.js";
import { ICommand } from "../commands/interface/ICommand";
import { PingCommand } from "../commands/PingCommand";
import { ICommandRegistry } from "./ICommandRegistry";

/**
 * コマンド登録管理
 */
export class CommandRegistry implements ICommandRegistry {
    private commands: Map<string, ICommand> = new Map();

    /**
     * コンストラクタ
     */
    constructor() {
        this.registerCommands();
    }

    /**
     * コマンド登録
     */
    private registerCommands(): void {
        const pingCommand = new PingCommand();
        this.commands.set(pingCommand.name, pingCommand);
    }

    /**
     * コマンド取得
     * @param {string} commandName コマンド名
     * @return {ICommand | undefined} コマンド
     */
    getCommand(commandName: string): ICommand | undefined {
        return this.commands.get(commandName);
    }

    /**
     * Discord APIにスラッシュコマンドを登録
     * @param {string} token Discord Bot Token
     * @param {string} clientId Discord Application ID
     */
    async registerSlashCommands(token: string, clientId: string): Promise<void> {
        const slashCommands = Array.from(this.commands.values()).map((command) =>
            new SlashCommandBuilder()
                .setName(command.name)
                .setDescription(command.description)
                .toJSON()
        );

        const rest = new REST().setToken(token);

        try {
            console.log(`Registering ${slashCommands.length} slash commands...`);

            await rest.put(
                Routes.applicationCommands(clientId),
                { body: slashCommands }
            );

            console.log("Successfully registered slash commands!");
        } catch (error) {
            console.error("Failed to register slash commands:", error);
        }
    }
}
