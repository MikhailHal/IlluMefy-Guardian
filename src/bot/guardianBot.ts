import { Client, GatewayIntentBits } from "discord.js";
import { IConfigurationService } from "./configurationService/IConfigurationService";
import { IGuardianBot } from "./IGuardianBot";
import { IGuardianDispatcher } from "./dispatcher/IGuardianDispatcher";
import { DetectNewEditHistoryWatcher } from "./surveillances/DetectNewEditHistory/DetectNewEditHistoryWatcher";

/**
 * GuardianBot メインクラス
 */
export class GuardianBot implements IGuardianBot {
    private client: Client;
    private detectNewEditHistoryWatcher: DetectNewEditHistoryWatcher;
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
                GatewayIntentBits.MessageContent,
            ],
        });
        this.detectNewEditHistoryWatcher = new DetectNewEditHistoryWatcher(this.dispatcher);
    }
    /**
     * 初期化
     */
    async initialize(): Promise<void> {
        await this.dispatcher.initialize();
        this.setupEventHandlers();

        // スラッシュコマンド登録
        const token = await this.configService.getDiscordToken();
        const applicationId = await this.configService.getDiscordApplicationId();
        await this.dispatcher.registerSlashCommands(token, applicationId);

        // ウォッチャー初期化
        await this.initializeWatcher();
    }

    /**
     * イベントハンドラー設定
     */
    private setupEventHandlers(): void {
        this.client.on("ready", () => {
            console.log(`${this.client.user?.tag} でログイン完了`);
        });

        this.client.on("interactionCreate", async (interaction) => {
            if (interaction.isCommand()) {
                await this.dispatcher.handleCommand(interaction);
            }
        });

        this.client.on("messageCreate", async (message) => {
            if (!message.author.bot) {
                await this.dispatcher.handleEvent("messageCreate", message);
            }
        });
    }
    /**
     * 開始
     */
    async start(): Promise<void> {
        const token = await this.configService.getDiscordToken();
        await this.client.login(token);

        await this.startWatcher();
    }

    /**
     * 終了
     */
    async stop(): Promise<void> {
        await this.stopWatcher();
        await this.client.destroy();
    }

    /**
     * ウォッチャー初期化
     */
    async initializeWatcher(): Promise<void> {
        await this.detectNewEditHistoryWatcher.initialize();
    }

    /**
     * ウォッチャー開始
     */
    async startWatcher(): Promise<void> {
        this.detectNewEditHistoryWatcher.startMonitoring();
    }

    /**
     * ウォッチャー停止
     */
    async stopWatcher(): Promise<void> {
        this.detectNewEditHistoryWatcher.stopMonitoring();
    }
}
