import { Client, GatewayIntentBits } from "discord.js";
import { IConfigurationService } from "./interface/IConfigurationService";
import { IGuardianBot } from "./interface/IGuardianBot";
import { IGuardianDispatcher } from "./interface/IGuardianDispatcher";

export class GuardianBot implements IGuardianBot {
    private client: Client
    /**
     * コンストラクタ
     *
     * @param {IGuardianDispatcher} dispatcher ディスパッチャ 
     * @param {IConfigurationService} configService 設定ツール
     */
    constructor(
        private dispatcher: IGuardianDispatcher,
        private configService: IConfigurationService,
    ) {
        this.client = new Client({
              intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent
            ]
        });
    }
    /**
     * 初期化
     */
    async initialize(): Promise<void> {
        await this.dispatcher.initialize();
    }
    /**
     * 開始
     */
    async start(): Promise<void> {
        const token = await this.configService.getDiscordToken();
        await this.client.login(token);
    }
    /**
     * 終了
     */
    async stop(): Promise<void> {
        await this.client.destroy();
    }
}