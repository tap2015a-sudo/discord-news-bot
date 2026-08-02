const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  version: discordJsVersion,
} = require("discord.js");

function formatNumber(number) {
  return new Intl.NumberFormat("ar-SA").format(number || 0);
}

function formatUptime(milliseconds) {
  const totalSeconds = Math.floor(milliseconds / 1000);

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts = [];

  if (days) parts.push(`${days} يوم`);
  if (hours) parts.push(`${hours} ساعة`);
  if (minutes) parts.push(`${minutes} دقيقة`);
  if (seconds || parts.length === 0) {
    parts.push(`${seconds} ثانية`);
  }

  return parts.join(" و");
}

function formatDate(date) {
  return date.toISOString().split("T")[0].replace(/-/g, "/");
}

function toTimestamp(date) {
  return Math.floor(date.getTime() / 1000);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("botinfo")
    .setDescription("يعرض معلومات البوت بشكل مفصل واحترافي"),

  async execute(interaction) {
    await interaction.deferReply();

    const client = interaction.client;
    const bot = client.user;

    const application = await client.application.fetch();

    const owner = application.owner;

    const avatar = bot.displayAvatarURL({
      size: 4096,
      extension: "png",
    });

    const banner = bot.bannerURL({
      size: 4096,
      extension: "png",
    });

    const createdTimestamp = toTimestamp(bot.createdAt);
    const createdDate = formatDate(bot.createdAt);

    const guildCount = client.guilds.cache.size;

    const channelCount = client.channels.cache.size;

    const userCount = client.guilds.cache.reduce(
      (total, guild) => total + guild.memberCount,
      0
    );

    const commandCount = client.commands?.size || 0;

    const ping = Math.round(client.ws.ping);

    const uptime = formatUptime(client.uptime || 0);

    const memoryUsage = process.memoryUsage();
    const usedMemory = (
      memoryUsage.heapUsed /
      1024 /
      1024
    ).toFixed(2);

    const totalMemory = (
      memoryUsage.heapTotal /
      1024 /
      1024
    ).toFixed(2);

    const ownerText = owner
      ? "tag" in owner
        ? `${owner}\n\`${owner.tag}\``
        : `فريق ديسكورد\n\`${owner.name}\``
      : "غير معروف";

    const embedColor =
      interaction.guild?.members.me?.displayColor ||
      bot.accentColor ||
      0x5865f2;

    const embed = new EmbedBuilder()
      .setColor(embedColor)
      .setAuthor({
        name: `معلومات ${bot.username}`,
        iconURL: avatar,
      })
      .setTitle("🤖 معلومات البوت")
      .setDescription(
        application.description ||
          "بوت ديسكورد متعدد الأوامر والأنظمة."
      )
      .setThumbnail(avatar)
      .addFields(
        {
          name: "🏷️ اسم البوت",
          value: `\`${bot.username}\``,
          inline: true,
        },
        {
          name: "🆔 معرّف البوت",
          value: `\`${bot.id}\``,
          inline: true,
        },
        {
          name: "👑 مالك البوت",
          value: ownerText,
          inline: false,
        },
        {
          name: "📅 تاريخ الإنشاء",
          value:
            `\`${createdDate}\`\n` +
            `<t:${createdTimestamp}:R>`,
          inline: true,
        },
        {
          name: "⏱️ مدة التشغيل",
          value: `\`${uptime}\``,
          inline: true,
        },
        {
          name: "📡 سرعة الاستجابة",
          value: `\`${ping}ms\``,
          inline: true,
        },
        {
          name: "🏠 السيرفرات",
          value: `\`${formatNumber(guildCount)}\``,
          inline: true,
        },
        {
          name: "👥 الأعضاء",
          value: `\`${formatNumber(userCount)}\``,
          inline: true,
        },
        {
          name: "📺 الرومات",
          value: `\`${formatNumber(channelCount)}\``,
          inline: true,
        },
        {
          name: "⌨️ الأوامر",
          value: `\`${formatNumber(commandCount)}\``,
          inline: true,
        },
        {
          name: "🟢 إصدار Node.js",
          value: `\`${process.version}\``,
          inline: true,
        },
        {
          name: "📦 إصدار discord.js",
          value: `\`v${discordJsVersion}\``,
          inline: true,
        },
        {
          name: "💾 استخدام الذاكرة",
          value:
            `المستخدم: \`${usedMemory} MB\`\n` +
            `المحجوز: \`${totalMemory} MB\``,
          inline: true,
        },
        {
          name: "🖥️ نظام التشغيل",
          value: `\`${process.platform}\``,
          inline: true,
        },
        {
          name: "⚙️ المعمارية",
          value: `\`${process.arch}\``,
          inline: true,
        }
      )
      .setFooter({
        text: `طلب بواسطة ${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL({
          size: 256,
        }),
      })
      .setTimestamp();

    if (banner) {
      embed.setImage(banner);
    }

    const buttons = [
      new ButtonBuilder()
        .setLabel("فتح صورة البوت")
        .setEmoji("🖼️")
        .setStyle(ButtonStyle.Link)
        .setURL(avatar),

      new ButtonBuilder()
        .setLabel("إضافة البوت")
        .setEmoji("➕")
        .setStyle(ButtonStyle.Link)
        .setURL(
          `https://discord.com/oauth2/authorize?client_id=${bot.id}&scope=bot%20applications.commands&permissions=0`
        ),

      new ButtonBuilder()
        .setLabel("فتح حساب البوت")
        .setEmoji("🤖")
        .setStyle(ButtonStyle.Link)
        .setURL(`https://discord.com/users/${bot.id}`),
    ];

    if (banner) {
      buttons.push(
        new ButtonBuilder()
          .setLabel("فتح البانر")
          .setEmoji("🎨")
          .setStyle(ButtonStyle.Link)
          .setURL(banner)
      );
    }

    const row = new ActionRowBuilder().addComponents(
      buttons
    );

    await interaction.editReply({
      embeds: [embed],
      components: [row],
    });
  },
};
