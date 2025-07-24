import { GuardianBot } from "./bot/GuardianBot";
import { GoogleSecretManager } from "./lib/secretManager/GoogleSecretManager";
import { ConfigurationService } from "./bot/configurationService/ConfigurationService";
import { GuardianDispatcher } from "./bot/dispatcher/GuardianDispatcher";

/**
 * アプリケーションエントリーポイント
 */
async function main(): Promise<void> {
    try {
        const projectId = "405184515768";

        // 依存関係の構築 (DI)
        const secretManager = new GoogleSecretManager(projectId);
        const configService = new ConfigurationService(secretManager);

        const dispatcher = new GuardianDispatcher(configService);

        // GuardianBot初期化
        const bot = new GuardianBot(dispatcher, configService);

        console.log("IlluMefy-Guardian starting...");

        // Bot起動処理
        await bot.initialize();
        await bot.start();

        console.log("IlluMefy-Guardian started successfully!");

        // プロセス終了時の処理
        process.on("SIGINT", async () => {
            console.log("Shutting down IlluMefy-Guardian...");
            await bot.stop();
            process.exit(0);
        });
    } catch (error) {
        console.error("Failed to start IlluMefy-Guardian:", error);
        process.exit(1);
    }
}

// アプリケーション開始
main().catch((error) => {
    console.error("Unhandled error:", error);
    process.exit(1);
});
