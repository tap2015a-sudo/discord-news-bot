const {
  SlashCommandBuilder,
  EmbedBuilder,
} = require("discord.js");

function formatNumber(number) {
  return new Intl.NumberFormat("ar-SA").format(number || 0);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("membercount")
    .setDescription("يعرض عدد أعضاء السيرفر بشكل مرتب")
    .setDMPermission(false),

  async execute(interaction) {
    if (!interaction.inGuild()) {
      return interaction.reply({
        content: "❌ هذا الأمر يعمل داخل السيرفرات فقط.",
        ephemeral: true,
      });
    }

    const guild = interaction.guild;
    const cachedMembers = guild.members.cache;

    const cachedBots = cachedMembers.filter(
      (member) => member.user.bot
    ).size;

    const cachedHumans = cachedMembers.filter(
      (member) => !member.user.bot
    ).size;

    const onlineMembers = cachedMembers.filter(
      (member) =>
        member.presence &&
        member.presence.status !== "offline"
    ).size;

    const boostingMembers = cachedMembers.filter(
      (member) => member.premiumSince
    ).size;

    const embedColor =
      guild.members.me?.displayColor || 0x5865f2;

    const guildIcon =
      guild.iconURL({
        size: 1024,
        extension: "png",
      }) ||
      interaction.client.user.displayAvatarURL({
        size: 1024,
      });

    const embed = new EmbedBuilder()
      .setColor(embedColor)
      .setAuthor({
        name: `إحصائيات أعضاء ${guild.name}`,
        iconURL: guildIcon,
      })
      .setTitle("👥 عدد أعضاء السيرفر")
      .setThumbnail(guildIcon)
      .addFields(
        {
          name: "👥 إجمالي الأعضاء",
          value: `\`${formatNumber(guild.memberCount)}\``,
          inline: false,
        },
        {
          name: "👤 الأعضاء المحمّلون",
          value: `\`${formatNumber(cachedHumans)}\``,
          inline: true,
        },
        {
          name: "🤖 البوتات المحمّلة",
          value: `\`${formatNumber(cachedBots)}\``,
          inline: true,
        },
        {
          name: "🟢 المتصلون الظاهرون",
          value: `\`${formatNumber(onlineMembers)}\``,
          inline: true,
        },
        {
          name: "🚀 داعمو السيرفر الظاهرون",
          value: `\`${formatNumber(boostingMembers)}\``,
          inline: true,
        },
        {
          name: "📦 المحمّل في ذاكرة البوت",
          value: `\`${formatNumber(cachedMembers.size)}\``,
          inline: true,
        },
        {
          name: "🏠 عدد السيرفرات لدى البوت",
          value: `\`${formatNumber(
            interaction.client.guilds.cache.size
          )}\``,
          inline: true,
        }
      )
      .setDescription(
        "ملاحظة: الإجمالي دقيق، أما تفاصيل البوتات والمتصلين فتعتمد على الأعضاء المحمّلين لدى البوت."
      )
      .setFooter({
        text: `طلب بواسطة ${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL({
          size: 256,
        }),
      })
      .setTimestamp();

    await interaction.reply({
      embeds: [embed],
    });
  },
};
