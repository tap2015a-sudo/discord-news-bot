const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("serverbanner")
    .setDescription("يعرض بانر السيرفر بأعلى جودة")
    .setDMPermission(false),

  async execute(interaction) {
    if (!interaction.inGuild()) {
      return interaction.reply({
        content: "❌ هذا الأمر يعمل داخل السيرفرات فقط.",
        ephemeral: true,
      });
    }

    await interaction.deferReply();

    const guild = await interaction.guild.fetch();

    const bannerURL = guild.bannerURL({
      size: 4096,
      extension: "png",
      forceStatic: false,
    });

    if (!bannerURL) {
      return interaction.editReply({
        content: "❌ هذا السيرفر لا يملك بانر حاليًا.",
      });
    }

    const iconURL =
      guild.iconURL({
        size: 1024,
        extension: "png",
        forceStatic: false,
      }) ||
      interaction.client.user.displayAvatarURL({
        size: 1024,
      });

    const embedColor =
      guild.members.me?.displayColor || 0x5865f2;

    const embed = new EmbedBuilder()
      .setColor(embedColor)
      .setAuthor({
        name: guild.name,
        iconURL,
      })
      .setTitle("🎨 بانر السيرفر")
      .setDescription(
        `**اسم السيرفر:** \`${guild.name}\`\n` +
        `**معرّف السيرفر:** \`${guild.id}\``
      )
      .setImage(bannerURL)
      .setFooter({
        text: `طلب بواسطة ${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL({
          size: 256,
        }),
      })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("فتح البانر")
        .setEmoji("🎨")
        .setStyle(ButtonStyle.Link)
        .setURL(bannerURL)
    );

    await interaction.editReply({
      embeds: [embed],
      components: [row],
    });
  },
};
