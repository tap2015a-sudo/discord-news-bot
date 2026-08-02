const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("servericon")
    .setDescription("يعرض صورة السيرفر بأعلى جودة")
    .setDMPermission(false),

  async execute(interaction) {
    if (!interaction.inGuild()) {
      return interaction.reply({
        content: "❌ هذا الأمر يعمل داخل السيرفرات فقط.",
        ephemeral: true,
      });
    }

    const guild = interaction.guild;

    const iconURL = guild.iconURL({
      size: 4096,
      extension: "png",
      forceStatic: false,
    });

    if (!iconURL) {
      return interaction.reply({
        content: "❌ هذا السيرفر لا يملك صورة.",
        ephemeral: true,
      });
    }

    const embedColor =
      guild.members.me?.displayColor || 0x5865f2;

    const embed = new EmbedBuilder()
      .setColor(embedColor)
      .setAuthor({
        name: guild.name,
        iconURL,
      })
      .setTitle("🖼️ صورة السيرفر")
      .setDescription(
        `**اسم السيرفر:** \`${guild.name}\`\n` +
        `**معرّف السيرفر:** \`${guild.id}\``
      )
      .setImage(iconURL)
      .setFooter({
        text: `طلب بواسطة ${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL({
          size: 256,
        }),
      })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("فتح الصورة")
        .setEmoji("🖼️")
        .setStyle(ButtonStyle.Link)
        .setURL(iconURL)
    );

    await interaction.reply({
      embeds: [embed],
      components: [row],
    });
  },
};
