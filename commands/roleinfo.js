const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField,
} = require("discord.js");

const PERMISSION_NAMES = {
  Administrator: "المسؤول الكامل",
  ViewAuditLog: "عرض سجل التدقيق",
  ViewGuildInsights: "عرض إحصائيات السيرفر",
  ManageGuild: "إدارة السيرفر",
  ManageRoles: "إدارة الرتب",
  ManageChannels: "إدارة الرومات",
  KickMembers: "طرد الأعضاء",
  BanMembers: "حظر الأعضاء",
  CreateInstantInvite: "إنشاء دعوات",
  ChangeNickname: "تغيير الاسم المستعار",
  ManageNicknames: "إدارة الأسماء المستعارة",
  ManageEmojisAndStickers: "إدارة الإيموجيات والملصقات",
  ManageWebhooks: "إدارة Webhooks",
  ViewChannel: "عرض الرومات",
  SendMessages: "إرسال الرسائل",
  SendMessagesInThreads: "إرسال الرسائل في الثريدات",
  CreatePublicThreads: "إنشاء ثريدات عامة",
  CreatePrivateThreads: "إنشاء ثريدات خاصة",
  ManageThreads: "إدارة الثريدات",
  EmbedLinks: "تضمين الروابط",
  AttachFiles: "إرفاق الملفات",
  AddReactions: "إضافة التفاعلات",
  UseExternalEmojis: "استخدام إيموجيات خارجية",
  UseExternalStickers: "استخدام ملصقات خارجية",
  MentionEveryone: "منشن الجميع",
  ManageMessages: "إدارة الرسائل",
  ReadMessageHistory: "قراءة سجل الرسائل",
  SendTTSMessages: "إرسال رسائل TTS",
  UseApplicationCommands: "استخدام أوامر التطبيقات",
  Connect: "الدخول للرومات الصوتية",
  Speak: "التحدث",
  Stream: "مشاركة الشاشة",
  MuteMembers: "كتم الأعضاء صوتيًا",
  DeafenMembers: "تصميم الأعضاء",
  MoveMembers: "نقل الأعضاء",
  UseVAD: "استخدام اكتشاف الصوت",
  PrioritySpeaker: "المتحدث ذو الأولوية",
  RequestToSpeak: "طلب التحدث",
  UseEmbeddedActivities: "استخدام الأنشطة",
  ModerateMembers: "تقييد الأعضاء",
  ViewCreatorMonetizationAnalytics: "عرض تحليلات تحقيق الدخل",
  UseSoundboard: "استخدام الساوندبورد",
  UseExternalSounds: "استخدام أصوات خارجية",
  SendVoiceMessages: "إرسال رسائل صوتية",
};

function formatDate(date) {
  return date.toISOString().split("T")[0].replace(/-/g, "/");
}

function toTimestamp(date) {
  return Math.floor(date.getTime() / 1000);
}

function formatNumber(number) {
  return new Intl.NumberFormat("ar-SA").format(number);
}

function shorten(text, maxLength = 1000) {
  if (!text) return "لا يوجد";

  return text.length > maxLength
    ? `${text.slice(0, maxLength - 3)}...`
    : text;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("roleinfo")
    .setDescription("يعرض معلومات أي رتبة بشكل مفصل واحترافي")
    .addRoleOption((option) =>
      option
        .setName("role")
        .setDescription("اختر الرتبة التي تريد عرض معلوماتها")
        .setRequired(true)
    )
    .setDMPermission(false),

  async execute(interaction) {
    if (!interaction.inGuild()) {
      return interaction.reply({
        content: "❌ هذا الأمر يعمل داخل السيرفرات فقط.",
        ephemeral: true,
      });
    }

    const role = interaction.options.getRole("role", true);

    await interaction.deferReply();

    const createdTimestamp = toTimestamp(role.createdAt);
    const createdDate = formatDate(role.createdAt);

    const roleIcon = role.iconURL({
      size: 4096,
      extension: "png",
    });

    const colorHex =
      role.color === 0
        ? "#000000"
        : role.hexColor.toUpperCase();

    const rolePosition =
      interaction.guild.roles.cache
        .sort((first, second) => second.position - first.position)
        .map((cachedRole) => cachedRole.id)
        .indexOf(role.id) + 1;

    const permissions = role.permissions
      .toArray()
      .map(
        (permission) =>
          PERMISSION_NAMES[permission] || permission
      );

    const permissionsText =
      permissions.length > 0
        ? permissions.map((permission) => `• ${permission}`).join("\n")
        : "لا توجد صلاحيات";

    const memberCount = role.members.size;

    const managedBy = role.managed
      ? role.tags?.botId
        ? `بوت <@${role.tags.botId}>`
        : role.tags?.integrationId
          ? "تكامل خارجي"
          : role.tags?.subscriptionListingId
            ? "اشتراك رتبة"
            : "نظام ديسكورد"
      : "تدار يدويًا";

    const roleType =
      role.id === interaction.guild.id
        ? "رتبة الجميع (@everyone)"
        : role.managed
          ? "رتبة مُدارة"
          : "رتبة عادية";

    const roleAppearance = [
      role.hoist
        ? "✅ تظهر منفصلة في قائمة الأعضاء"
        : "❌ لا تظهر منفصلة في قائمة الأعضاء",
      role.mentionable
        ? "✅ يمكن منشنها"
        : "❌ لا يمكن منشنها",
      role.managed
        ? "✅ مُدارة بواسطة نظام أو بوت"
        : "❌ غير مُدارة تلقائيًا",
    ].join("\n");

    const embedColor =
      role.color !== 0 ? role.color : 0x5865f2;

    const embed = new EmbedBuilder()
      .setColor(embedColor)
      .setAuthor({
        name: `معلومات رتبة ${role.name}`,
        iconURL:
          roleIcon ||
          interaction.guild.iconURL({ size: 256 }) ||
          interaction.client.user.displayAvatarURL(),
      })
      .setTitle("🎭 معلومات الرتبة")
      .setDescription(
        [
          `**الرتبة:** ${role}`,
          role.unicodeEmoji
            ? `**رمز الرتبة:** ${role.unicodeEmoji}`
            : null,
        ]
          .filter(Boolean)
          .join("\n")
      )
      .addFields(
        {
          name: "🏷️ اسم الرتبة",
          value: `\`${role.name}\``,
          inline: true,
        },
        {
          name: "🆔 معرّف الرتبة",
          value: `\`${role.id}\``,
          inline: true,
        },
        {
          name: "📌 نوع الرتبة",
          value: roleType,
          inline: true,
        },
        {
          name: "🎨 لون الرتبة",
          value:
            `Hex: \`${colorHex}\`\n` +
            `Decimal: \`${role.color}\``,
          inline: true,
        },
        {
          name: "📊 ترتيب الرتبة",
          value:
            `الترتيب الظاهر: \`${formatNumber(rolePosition)}\`\n` +
            `الموضع البرمجي: \`${formatNumber(role.position)}\``,
          inline: true,
        },
        {
          name: "👥 الأعضاء الظاهرون",
          value: `\`${formatNumber(memberCount)}\``,
          inline: true,
        },
        {
          name: "📅 تاريخ الإنشاء",
          value:
            `\`${createdDate}\`\n` +
            `<t:${createdTimestamp}:R>`,
          inline: true,
        },
        {
          name: "⚙️ طريقة الإدارة",
          value: managedBy,
          inline: true,
        },
        {
          name: "🔐 عدد الصلاحيات",
          value: `\`${formatNumber(permissions.length)}\``,
          inline: true,
        },
        {
          name: "✨ خصائص الرتبة",
          value: roleAppearance,
          inline: false,
        },
        {
          name: "🛡️ الصلاحيات",
          value: shorten(permissionsText),
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

    if (roleIcon) {
      embed
        .setThumbnail(roleIcon)
        .setImage(roleIcon);
    } else {
      embed.setThumbnail(
        interaction.guild.iconURL({ size: 1024 }) ||
          interaction.client.user.displayAvatarURL()
      );
    }

    const replyData = {
      embeds: [embed],
    };

    if (roleIcon) {
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setLabel("فتح أيقونة الرتبة")
          .setEmoji("🖼️")
          .setStyle(ButtonStyle.Link)
          .setURL(roleIcon)
      );

      replyData.components = [row];
    }

    await interaction.editReply(replyData);
  },
};
