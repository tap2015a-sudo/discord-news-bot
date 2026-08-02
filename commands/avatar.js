const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("يعرض صورة المستخدم بأعلى جودة")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("اختر المستخدم الذي تريد عرض صورته")
        .setRequired(false)
    ),

  async execute(interaction) {
    const selectedUser =
      interaction.options.getUser("user") || interaction.user;

    const user = await selectedUser.fetch(true);

    let member = null;

    if (interaction.inGuild()) {
      try {
        member = await interaction.guild.members.fetch(user.id);
      } catch {
        member = null;
      }
    }

    const globalAvatar = user.displayAvatarURL({
      size: 4096,
      extension: "png",
    });

    const serverAvatar = member?.avatar
      ? member.displayAvatarURL({
          size: 4096,
          extension: "png",
        })
      : null;

    const displayedAvatar = serverAvatar || globalAvatar;

    const decoration =
      member?.displayAvatarDecorationURL() ||
      user.avatarDecorationURL();

    const displayName =
      member?.displayName ||
      user.globalName ||
      user.username;

    const embedColor =
      member?.displayColor ||
      user.accentColor ||
      0x5865f2;

    const embed = new EmbedBuilder()
      .setColor(embedColor)
      .setAuthor({
        name: `صورة ${displayName}`,
        iconURL: displayedAvatar,
      })
      .setTitle("🖼️ الصورة الشخصية")
      .setDescription(
        [
          `👤 **المستخدم:** ${user}`,
          `🏷️ **اسم العرض:** \`${displayName}\``,
          `🆔 **المعرّف:** \`${user.id}\``,
          serverAvatar
            ? "✅ يعرض الصورة الخاصة بهذا السيرفر"
            : "🌐 يعرض صورة الحساب العامة",
        ].join("\n")
      )
      .setImage(displayedAvatar)
      .setThumbnail(displayedAvatar)
      .setFooter({
        text: `طلب بواسطة ${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL({
          size: 256,
        }),
      })
      .setTimestamp();

    const buttons = [
      new ButtonBuilder()
        .setLabel("فتح الصورة")
        .setEmoji("🖼️")
        .setStyle(ButtonStyle.Link)
        .setURL(displayedAvatar),

      new ButtonBuilder()
        .setLabel("فتح الحساب")
        .setEmoji("👤")
        .setStyle(ButtonStyle.Link)
        .setURL(`https://discord.com/users/${user.id}`),
    ];

    if (serverAvatar && serverAvatar !== globalAvatar) {
      buttons.push(
        new ButtonBuilder()
          .setLabel("الصورة العامة")
          .setEmoji("🌐")
          .setStyle(ButtonStyle.Link)
          .setURL(globalAvatar)
      );
    }

    if (decoration) {
      buttons.push(
        new ButtonBuilder()
          .setLabel("فتح الزخرفة")
          .setEmoji("✨")
          .setStyle(ButtonStyle.Link)
          .setURL(decoration)
      );
    }

    const row = new ActionRowBuilder().addComponents(buttons);

    await interaction.reply({
      embeds: [embed],
      components: [row],
    });
  },
};
