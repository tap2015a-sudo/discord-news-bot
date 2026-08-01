const http = require("http");
const {
  Client,
  GatewayIntentBits,
  Events,
  SlashCommandBuilder
} = require("discord.js");

const token = process.env.DISCORD_TOKEN;

if (!token) {
  console.log("Missing DISCORD_TOKEN");
  process.exit(1);
}

const port = process.env.PORT || 3000;

http.createServer((req, res) => {
  res.writeHead(200);
  res.end("Bot is running");
}).listen(port);

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const commands = [
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("يتأكد أن البوت شغال")
    .toJSON(),
 new SlashCommandBuilder()
  .setName("help")
 .setDescription("يعرض جميع أوامر البوت")
  .toJSON(),
  new SlashCommandBuilder()
  .setName("avatar")
  .setDescription("يعرض صورة حسابك")
  .toJSON()
];

client.once(Events.ClientReady, async () => {
  console.log(`Bot is online as ${client.user.tag}`);

  for (const guild of client.guilds.cache.values()) {
    await guild.commands.set(commands);
  }
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "ping") {
    await interaction.reply("🏓 البوت شغال!");
  }
  if (interaction.commandName === "help") {
    await interaction.reply("📋 الأوامر المتوفرة:\n/ping - يتأكد أن البوت شغال\n/help - يعرض جميع أوامر البوت");
}
  if (interaction.commandName === "avatar") {
    const avatar = interaction.user.displayAvatarURL({ size: 1024 });
    await interaction.reply(avatar);
    }
  });

client.login(token);
