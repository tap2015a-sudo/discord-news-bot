const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

const badgeNames = {
  Staff: "موظف ديسكورد",
  Partner: "شريك ديسكورد",
  Hypesquad: "فعاليات HypeSquad",
  BugHunterLevel1: "صائد أخطاء مستوى 1",
  HypeSquadOnlineHouse1: "Bravery",
  HypeSquadOnlineHouse2: "Brilliance",
  HypeSquadOnlineHouse3: "Balance",
  PremiumEarlySupporter: "الداعم المبكر",
  TeamPseudoUser: "فريق ديسكورد",
  BugHunterLevel2: "صائد أخطاء مستوى 2",
  VerifiedBot: "بوت موثق",
  VerifiedDeveloper: "مطور بوتات موثق",
  CertifiedModerator: "مشرف ديسكورد معتمد",
  BotHTTPInteractions: "بوت HTTP",
  ActiveDeveloper: "مطور نشط",
};

function formatDate(date) {
  return date.toISOString().split("T")[0].replace(/-/g, "/");
}

function unixTimestamp(date) {
  return Math.floor(date.getTime() / 1000);
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("يعرض معلومات حسابك بشكل مفصل")
    .setDescriptionLocalizations({
      "en-US": "Shows detailed information about your account",
      "en-GB": "Shows detailed information about your account",
    }),

  async execute(interaction) {
    const isArabic = interaction.locale?.startsWith("ar");
    const user = await interaction.user.fetch(true);
    const member = interaction.inGuild() ? interaction.member : null;

    const avatar = user.displayAvatarURL({
      size: 1024,
    });

    const banner = user.bannerURL({
      size: 2048,
    });

    const accountTimestamp = unixTimestamp(user.createdAt);
    const accountDate = formatDate(user.createdAt);

    const joinedTimestamp = member?.joinedAt
      ? unixTimestamp(member.joinedAt)
      : null;

    const joinedDate = member?.joinedAt
      ? formatDate(member.joinedAt)
      : null;

    const displayName =
      member?.displayName ||
      user.globalName ||
      user.username;

    const publicBadges =
      user.flags
        ?.toArray()
        .map((badge) => badgeNames[badge] || badge) || [];

    if (member?.premiumSince) {
      publicBadges.push(
        isArabic ? "داعم السيرفر" : "Server Booster"
      );
    }

    const badges =
      publicBadges.length > 0
        ? publicBadges.join(" • ")
        : isArabic
          ? "لا توجد شارات ظاهرة"
          : "No visible badges";

    const roles = member
      ? member.roles.cache
          .filter((role) => role.id !== interaction.guild.id)
          .sort((first, second) => second.position - first.position)
          .first(10)
          .map((role) => role.toString())
          .join(" ")
      : "";

    const roleText =
      roles ||
      (isArabic ? "لا توجد رتب" : "No roles");

    const highestRole =
      member &&
      member.roles.highest.id !== interaction.guild.id
        ? member.roles.highest.toString()
        : isArabic
          ? "لا توجد"
          : "None";

    const embedColor =
      member?.displayColor || 0x5865f2;

    const embed = new EmbedBuilder()
      .setColor(embedColor)
      .setAuthor({
        name: isArabic
          ? `معلومات ${displayName}`
          : `${displayName}'s Information`,
        iconURL: avatar,
      })
      .setTitle(
        isArabic
          ? "👤 معلومات المستخدم"
          : "👤 User Information"
      )
      .setThumbnail(avatar)
      .addFields(
        {
          name: isArabic
            ? "👤 اسم المستخدم"
            : "👤 Username",
          value: `\`${user.username}\``,
          inline: true,
        },
        {
          name: isArabic
            ? "🏷️ اسم العرض"
            : "🏷️ Display Name",
          value: `\`${displayName}\``,
          inline: true,
        },
        {
          name: "🆔 ID",
          value: `\`${user.id}\``,
          inline: false,
        },
        {
          name: isArabic
            ? "📅 إنشاء الحساب"
            : "📅 Account Created",
          value:
            `\`${accountDate}\`\n` +
            `<t:${accountTimestamp}:R>`,
          inline: true,
        },
        {
          name: isArabic
            ? "📥 دخول السيرفر"
            : "📥 Joined Server",
          value: joinedTimestamp
            ? `\`${joinedDate}\`\n<t:${joinedTimestamp}:R>`
            : isArabic
              ? "غير متوفر"
              : "Unavailable",
          inline: true,
        },
        {
          name: isArabic
            ? "⭐ أعلى رتبة"
            : "⭐ Highest Role",
          value: highestRole,
          inline: false,
        },
        {
          name: isArabic
            ? "🎭 الرتب"
            : "🎭 Roles",
          value: roleText,
          inline: false,
        },
        {
          name: isArabic
            ? "🏅 الشارات"
            : "🏅 Badges",
          value: badges,
          inline: false,
        }
      )
      .setFooter({
        text: isArabic
          ? `طلب بواسطة ${interaction.user.username}`
          : `Requested by ${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL(),
      })
      .setTimestamp();

    if (banner) {
      embed.setImage(banner);
    }

    const buttons = [
      new ButtonBuilder()
        .setLabel(
          isArabic ? "فتح الصورة" : "Open Avatar"
        )
        .setEmoji("🖼️")
        .setStyle(ButtonStyle.Link)
        .setURL(avatar),
    ];

    if (banner) {
      buttons.push(
        new ButtonBuilder()
          .setLabel(
            isArabic ? "فتح البانر" : "Open Banner"
          )
          .setEmoji("🎨")
          .setStyle(ButtonStyle.Link)
          .setURL(banner)
      );
    }

    const row = new ActionRowBuilder().addComponents(buttons);

    await interaction.reply({
      embeds: [embed],
      components: [row],
    });
  },
};
