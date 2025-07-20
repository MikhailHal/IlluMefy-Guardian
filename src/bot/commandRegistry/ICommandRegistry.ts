import { ICommand } from "../commands/interface/ICommand";

/**
 * コマンド登録管理インターフェース
 */
export interface ICommandRegistry {
    /**
     * コマンド取得
     * @param {string} commandName コマンド名
     * @return {ICommand | undefined} コマンド
     */
    getCommand(commandName: string): ICommand | undefined;

    /**
     * Discord APIにスラッシュコマンドを登録
     * @param {string} token Discord Bot Token
     * @param {string} clientId Discord Application ID
     */
    registerSlashCommands(token: string, clientId: string): Promise<void>;
}
