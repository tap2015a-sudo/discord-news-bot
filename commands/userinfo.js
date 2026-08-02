const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

const BADGE_NAMES = {
  Staff: "موظف ديسكورد",
  Partner: "شريك ديسكورد",
  Hypesquad: "فعاليات HypeSquad",
  BugHunterLevel1: "صائد أخطاء — المستوى الأول",
  HypeSquadOnlineHouse1: "HypeSquad Bravery",
  HypeSquadOnlineHouse2: "HypeSquad Brilliance",
  HypeSquadOnlineHouse3: "HypeSquad Balance",
  PremiumEarlySupporter: "الداعم المبكر",
  TeamPseudoUser: "فريق ديسكورد",
  BugHunterLevel2: "صائد أخطاء — المستوى الثاني",
  VerifiedBot: "بوت موثّق",
  VerifiedDeveloper: "مطوّر بوتات موثّق",
  CertifiedModerator: "مشرف ديسكورد معتمد",
  BotHTTPInteractions: "بوت HTTP",
  ActiveDeveloper: "مطوّر نشط",
};

function formatDate(date) {
  return date.toISOString().split("T")[0].replace(/-/g, "/");
}

function toTimestamp(date) {
  return Math.floor(date.getTime() / 1000);
}

function shorten(text, maxLength = 1000) {
  if (!text) return "لا يوجد";
  return text.length > maxLength
    ? `${text.slice(0, maxLength - 3)}...`
    : text;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("يعرض معلومات المستخدم بشكل احترافي")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("المستخدم الذي تريد عرض معلوماته")
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

    const avatar = member
      ? member.displayAvatarURL({ size: 1024 })
      : user.displayAvatarURL({ size: 1024 });

    const banner =
      member?.displayBannerURL({ size: 2048 }) ||
      user.bannerURL({ size: 2048 });

    const decoration =
      member?.displayAvatarDecorationURL() ||
      user.avatarDecorationURL();

    const displayName =
      member?.displayName ||
      user.globalName ||
      user.username;

    const accountTimestamp = toTimestamp(user.createdAt);
    const accountDate = formatDate(user.createdAt);

    const joinedTimestamp = member?.joinedAt
      ? toTimestamp(member.joinedAt)
      : null;

    const joinedDate = member?.joinedAt
      ? formatDate(member.joinedAt)
      : null;

    const badgeList =
      user.flags
        ?.toArray()
        .map((badge) => BADGE_NAMES[badge] || badge) || [];

    if (member?.premiumSince) {
      badgeList.push("داعم السيرفر");
    }

    const badges =
      badgeList.length > 0
        ? badgeList.join(" • ")
        : "لا توجد شارات ظاهرة";

    const rolesCollection = member
      ? member.roles.cache
          .filter(
            (role) =>
              role.id !== interaction.guild.id
          )
          .sort(
            (first, second) =>
              second.position - first.position
          )
      : null;

    const roles =
      rolesCollection && rolesCollection.size > 0
        ? rolesCollection
            .first(10)
            .map((role) => role.toString())
            .join(" ")
        : "لا توجد رتب";

    const highestRole =
      member &&
      member.roles.highest.id !== interaction.guild.id
        ? member.roles.highest.toString()
        : "لا توجد";

    const accountType = user.bot
      ? "بوت 🤖"
      : "مستخدم 👤";

    const boostStatus = member?.premiumSince
      ? `منذ <t:${toTimestamp(member.premiumSince)}:R>`
      : "غير داعم";

    const embedColor =
      member?.displayColor ||
      user.accentColor ||
      0x5865f2;

    const embed = new EmbedBuilder()
      .setColor(embedColor)
      .setAuthor({
        name: `معلومات ${displayName}`,
        iconURL: avatar,
      })
      .setTitle("👤 معلومات المستخدم")
      .setThumbnail(avatar)
      .addFields(
        {
          name: "👤 اسم المستخدم",
          value: `\`${user.username}\``,
          inline: true,
        },
        {
          name: "🏷️ اسم العرض",
          value: `\`${displayName}\``,
          inline: true,
        },
        {
          name: "🆔 المعرّف",
          value: `\`${user.id}\``,
          inline: false,
        },
        {
          name: "📌 نوع الحساب",
          value: accountType,
          inline: true,
        },
        {
          name: "🚀 تعزيز السيرفر",
          value: boostStatus,
          inline: true,
        },
        {
          name: "📅 إنشاء الحساب",
          value:
            `\`${accountDate}\`\n` +
            `<t:${accountTimestamp}:R>`,
          inline: true,
        },
        {
          name: "📥 دخول السيرفر",
          value: joinedTimestamp
            ? `\`${joinedDate}\`\n<t:${joinedTimestamp}:R>`
            : "غير متوفر",
          inline: true,
        },
        {
          name: "⭐ أعلى رتبة",
          value: highestRole,
          inline: true,
        },
        {
          name: "🎭 الرتب",
          value: shorten(roles),
          inline: false,
        },
        {
          name: "🏅 الشارات",
          value: shorten(badges),
          inline: false,
        }
      )
      .setFooter({
        text: `طلب بواسطة ${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL({
          size: 256,
        }),
      })
      .setTimestamp();

    // يعرض البانر بصورة كبيرة، وإن لم يوجد يعرض الأفتار.
    embed.setImage(banner || avatar);

    const buttons = [
      new ButtonBuilder()
        .setLabel("فتح الصورة")
        .setEmoji("🖼️")
        .setStyle(ButtonStyle.Link)
        .setURL(avatar),

      new ButtonBuilder()
        .setLabel("فتح الحساب")
        .setEmoji("👤")
        .setStyle(ButtonStyle.Link)
        .setURL(`https://discord.com/users/${user.id}`),
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

    if (decoration) {
      buttons.push(
        new ButtonBuilder()
          .setLabel("فتح الزخرفة")
          .setEmoji("✨")
          .setStyle(ButtonStyle.Link)
          .setURL(decoration)
      );
    }

    const row = new ActionRowBuilder().addComponents(
      buttons
    );

    await interaction.reply({
      embeds: [embed],
      components: [row],
    });
  },
};
