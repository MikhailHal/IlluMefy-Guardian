import { Client, GatewayIntentBits, TextChannel, EmbedBuilder } from "discord.js";
import { IConfigurationService } from "./configurationService/IConfigurationService";
import { IGuardianBot } from "./IGuardianBot";
import { IGuardianDispatcher } from "./dispatcher/IGuardianDispatcher";
import { DetectNewEditHistoryWatcher } from "./surveillances/DetectNewEditHistory/DetectNewEditHistoryWatcher";
import { GuardianEventBus, NotificationEventData } from "./eventBus/GuardianEventBus";

/**
 * GuardianBot メインクラス
 */
export class GuardianBot implements IGuardianBot {
    private client: Client;
    private detectNewEditHistoryWatcher: DetectNewEditHistoryWatcher;

    /**
     * コンストラクタ
     * @param {IGuardianDispatcher} dispatcher ディスパッチャ
     * @param {IConfigurationService} configService 設定ツール
     * @param {GuardianEventBus} eventBus イベントバス
     */
    constructor(
        private dispatcher: IGuardianDispatcher,
        private configService: IConfigurationService,
        private eventBus: GuardianEventBus,
    ) {
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
            ],
        });
        this.detectNewEditHistoryWatcher = new DetectNewEditHistoryWatcher(this.dispatcher);
        this.setupEventListeners();
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

    /**
     * EventBusイベントリスナー設定
     */
    private setupEventListeners(): void {
        this.eventBus.on("discord-notification", this.handleDiscordNotification.bind(this));
        this.eventBus.on("emergency-alert", this.handleEmergencyAlert.bind(this));
        this.eventBus.on("command-reply", this.handleCommandReply.bind(this));
    }

    /**
     * Discord通知処理
     * @param {NotificationEventData} data 通知データ
     */
    private async handleDiscordNotification(data: NotificationEventData): Promise<void> {
        try {
            const channelId = await this.configService.getDiscordAlertChannelId();
            const channel = await this.client.channels.fetch(channelId);

            if (!channel || !channel.isTextBased()) {
                throw new Error(`Channel ${channelId} not found or not text-based`);
            }

            const textChannel = channel as TextChannel;

            // リッチな埋め込みメッセージを作成
            const embed = this.createMaliciousEditEmbed(data);

            await textChannel.send({
                content: "🚨 **悪意のある編集が検知されました**",
                embeds: [embed],
            });

            console.log(`Discord notification sent to channel ${channelId}`);
        } catch (error) {
            console.error("Failed to send Discord notification:", error);
        }
    }

    /**
     * 悪意のある編集用Discord埋め込みメッセージ作成
     * @param {NotificationEventData} data 通知データ
     * @return {EmbedBuilder} Discord埋め込みメッセージ
     */
    private createMaliciousEditEmbed(data: NotificationEventData): EmbedBuilder {
        const embed = new EmbedBuilder()
            .setTitle("🔍 悪意のある編集検知")
            .setColor(0xFF0000) // 赤色
            .setTimestamp()
            .setFooter({
                text: "IlluMefy Guardian",
                iconURL: "https://cdn.discordapp.com/avatars/bot-id/avatar.png",
            });

        // 基本情報
        embed.addFields(
            { name: "⚠️ 検知結果", value: data.message, inline: false },
        );

        // 追加データがある場合の詳細情報
        if (data.additionalData) {
            const additionalData = data.additionalData;

            // 危険度と理由を横並びで表示
            if (additionalData.riskScore) {
                embed.addFields({
                    name: "🎯 危険度",
                    value: `${Math.round((additionalData.riskScore as number) * 100)}%`,
                    inline: true,
                });
            }

            if (additionalData.reason) {
                const reason = String(additionalData.reason).substring(0, 1024);
                if (reason && reason.trim().length > 0) {
                    embed.addFields({
                        name: "📝 理由",
                        value: reason,
                        inline: true,
                    });
                }
            }

            // 編集詳細情報を表示（最初の1件のみ、フィールド数制限対応）
            if (additionalData.editDetails) {
                const editDetails = additionalData.editDetails as Array<Record<string, unknown>>;

                if (editDetails.length > 0) {
                    const detail = editDetails[0]; // 最初の1件のみ処理

                    // 1行にまとめて表示（フィールド数節約）
                    const summaryInfo = [
                        `🆔 **クリエイターID:** ${String(detail.creatorId)}`,
                        `📄 **編集履歴ID:** ${String(detail.editHistoryId)}`,
                        `📱 **編集者:** ${String(detail.userPhoneNumber)}`,
                        `👤 **対象クリエイター:** ${String(detail.creatorName)}`,
                    ].join("\n");

                    embed.addFields({
                        name: "📋 編集情報",
                        value: summaryInfo,
                        inline: false,
                    });

                    // 基本情報の変更を表示
                    if (detail.basicInfoChanges) {
                        const changes = detail.basicInfoChanges as Record<string, any>;
                        this.addChangeFields(embed, changes);
                    }
                }
            }

            // Perspective APIスコア
            if (additionalData.perspectiveScores) {
                const scores = additionalData.perspectiveScores as Record<string, number>;
                let scoreText = Object.entries(scores)
                    .map(([key, value]) => `${key}: ${Math.round(value * 100)}%`)
                    .join("\n");

                if (scoreText.length > 1024) {
                    scoreText = scoreText.substring(0, 1021) + "...";
                }

                if (scoreText && scoreText.trim().length > 0) {
                    embed.addFields({
                        name: "📊 Perspective API スコア",
                        value: scoreText,
                        inline: false,
                    });
                }
            }
        }

        return embed;
    }

    /**
     * 変更フィールドをEmbedに追加
     * @param {EmbedBuilder} embed Discord埋め込みビルダー
     * @param {Record<string, any>} changes 変更データ
     */
    private addChangeFields(embed: EmbedBuilder, changes: Record<string, any>): void {
        const fieldMap: Record<string, string> = {
            name: "📛 名前",
            description: "📄 説明",
            profileImageUrl: "🖼️ プロフィール画像",
        };

        for (const [field, fieldName] of Object.entries(fieldMap)) {
            if (changes[field]) {
                const change = changes[field];
                const before = String(change.before || "なし").substring(0, 500);
                const after = String(change.after || "なし").substring(0, 500);

                embed.addFields({
                    name: `${fieldName} 変更`,
                    value: `**変更前:** ${before}\n**変更後:** ${after}`,
                    inline: false,
                });
            }
        }
    }

    /**
     * 緊急アラート処理
     * @param {unknown} data アラートデータ
     */
    private async handleEmergencyAlert(data: unknown): Promise<void> {
        console.log("🔥 Emergency alert triggered:", data);
        // TODO: 緊急アラート実装
    }

    /**
     * コマンド返信処理
     * @param {NotificationEventData} data 返信データ
     */
    private async handleCommandReply(data: NotificationEventData): Promise<void> {
        console.log("💬 Command reply triggered:", data);
        // TODO: コマンド返信実装
    }
}
