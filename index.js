const http = require("http");
const fs = require("fs");
const path = require("path");

const {
  Client,
  Collection,
  GatewayIntentBits,
  Events,
} = require("discord.js");

const token = process.env.DISCORD_TOKEN;

if (!token) {
  console.log("Missing DISCORD_TOKEN");
  process.exit(1);
}

const port = process.env.PORT || 3000;

http
  .createServer((req, res) => {
    res.writeHead(200);
    res.end("Bot is running");
  })
  .listen(port);

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);

  if (
    command.data &&
    typeof command.execute === "function"
  ) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(`Invalid command file: ${file}`);
  }
}

client.once(Events.ClientReady, async (readyClient) => {
  console.log(`Bot is online as ${readyClient.user.tag}`);

  const commandsData = client.commands.map((command) =>
    command.data.toJSON()
  );

  for (const guild of readyClient.guilds.cache.values()) {
    await guild.commands.set(commandsData);
  }

  console.log(
    `Loaded ${client.commands.size} commands successfully`
  );
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(
    interaction.commandName
  );

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(
      `Error executing /${interaction.commandName}:`,
      error
    );

    const errorMessage = {
      content: "❌ حدث خطأ أثناء تنفيذ الأمر.",
      ephemeral: true,
    };

    if (
      interaction.replied ||
      interaction.deferred
    ) {
      await interaction.followUp(errorMessage);
    } else {
      await interaction.reply(errorMessage);
    }
  }
});

client.login(token);
