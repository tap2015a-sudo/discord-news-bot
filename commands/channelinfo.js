const {
  SlashCommandBuilder,
  EmbedBuilder,
  ChannelType,
  PermissionsBitField,
} = require("discord.js");

const CHANNEL_TYPES = {
  [ChannelType.GuildText]: "روم نصي",
  [ChannelType.GuildVoice]: "روم صوتي",
  [ChannelType.GuildCategory]: "تصنيف",
  [ChannelType.GuildAnnouncement]: "روم إعلانات",
  [ChannelType.AnnouncementThread]: "ثريد إعلانات",
  [ChannelType.PublicThread]: "ثريد عام",
  [ChannelType.PrivateThread]: "ثريد خاص",
  [ChannelType.GuildStageVoice]: "منصة صوتية",
  [ChannelType.GuildForum]: "منتدى",
  [ChannelType.GuildMedia]: "روم وسائط",
};

const VIDEO_QUALITY = {
  1: "تلقائية",
  2: "جودة كاملة",
};

const ARCHIVE_DURATIONS = {
  60: "ساعة",
  1440: "يوم",
  4320: "3 أيام",
  10080: "7 أيام",
};

function formatDate(date) {
  return date.toISOString().split("T")[0].replace(/-/g, "/");
}

function toTimestamp(date) {
  return Math.floor(date.getTime() / 1000);
}

function formatNumber(number) {
  return new Intl.NumberFormat("ar-SA").format(number || 0);
}

function formatSeconds(seconds) {
  if (!seconds) return "معطّل";

  if (seconds < 60) {
    return `${seconds} ثانية`;
  }

  return `${Math.floor(seconds / 60)} دقيقة`;
}

function shorten(text, maxLength = 1000) {
  if (!text) return "لا يوجد";

  return text.length > maxLength
    ? `${text.slice(0, maxLength - 3)}...`
    : text;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("channelinfo")
    .setDescription("يعرض معلومات أي روم بشكل مفصل واحترافي")
    .addChannelOption((option) =>
      option
        .setName("channel")
        .setDescription("اختر الروم الذي تريد عرض معلوماته")
        .setRequired(false)
    )
    .setDMPermission(false),

  async execute(interaction) {
    if (!interaction.inGuild()) {
      return interaction.reply({
        content: "❌ هذا الأمر يعمل داخل السيرفرات فقط.",
        ephemeral: true,
      });
    }

    const channel =
      interaction.options.getChannel("channel") ||
      interaction.channel;

    if (!channel || !channel.guild) {
      return interaction.reply({
        content: "❌ تعذر العثور على معلومات هذا الروم.",
        ephemeral: true,
      });
    }

    await interaction.deferReply();

    const createdTimestamp = toTimestamp(channel.createdAt);
    const createdDate = formatDate(channel.createdAt);

    const channelType =
      CHANNEL_TYPES[channel.type] ||
      `نوع غير معروف (${channel.type})`;

    const parent = channel.parent
      ? `${channel.parent}\n\`${channel.parent.name}\``
      : "بدون تصنيف";

    const permissionsSynced =
      channel.parent &&
      "permissionsLocked" in channel
        ? channel.permissionsLocked
          ? "✅ متزامنة مع التصنيف"
          : "❌ غير متزامنة مع التصنيف"
        : "غير متوفر";

    const permissionOverwrites =
      "permissionOverwrites" in channel
        ? channel.permissionOverwrites.cache.size
        : 0;

    const membersCount =
      "members" in channel
        ? channel.members.size
        : 0;

    const fields = [
      {
        name: "🏷️ اسم الروم",
        value: `\`${channel.name || "بدون اسم"}\``,
        inline: true,
      },
      {
        name: "🆔 معرّف الروم",
        value: `\`${channel.id}\``,
        inline: true,
      },
      {
        name: "📌 نوع الروم",
        value: channelType,
        inline: true,
      },
      {
        name: "📁 التصنيف",
        value: parent,
        inline: true,
      },
      {
        name: "📊 ترتيب الروم",
        value:
          "position" in channel
            ? `\`${formatNumber(channel.position)}\``
            : "غير متوفر",
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
        name: "🔐 مزامنة الصلاحيات",
        value: permissionsSynced,
        inline: true,
      },
      {
        name: "⚙️ تعديلات الصلاحيات",
        value: `\`${formatNumber(permissionOverwrites)}\``,
        inline: true,
      },
      {
        name: "👥 الأعضاء الظاهرون",
        value: `\`${formatNumber(membersCount)}\``,
        inline: true,
      },
    ];

    if ("topic" in channel) {
      fields.push({
        name: "📝 وصف الروم",
        value: shorten(channel.topic || "لا يوجد وصف"),
        inline: false,
      });
    }

    if ("nsfw" in channel) {
      fields.push({
        name: "🔞 روم للبالغين",
        value: channel.nsfw ? "نعم ✅" : "لا ❌",
        inline: true,
      });
    }

    if ("rateLimitPerUser" in channel) {
      fields.push({
        name: "⏱️ الوضع البطيء",
        value: `\`${formatSeconds(
          channel.rateLimitPerUser
        )}\``,
        inline: true,
      });
    }

    if ("bitrate" in channel) {
      fields.push({
        name: "🎙️ جودة الصوت",
        value: `\`${formatNumber(
          Math.round(channel.bitrate / 1000)
        )} Kbps\``,
        inline: true,
      });
    }

    if ("userLimit" in channel) {
      fields.push({
        name: "👥 حد المستخدمين",
        value:
          channel.userLimit > 0
            ? `\`${formatNumber(channel.userLimit)}\``
            : "بدون حد",
        inline: true,
      });
    }

    if ("rtcRegion" in channel) {
      fields.push({
        name: "🌍 المنطقة الصوتية",
        value: `\`${channel.rtcRegion || "تلقائية"}\``,
        inline: true,
      });
    }

    if ("videoQualityMode" in channel) {
      fields.push({
        name: "📹 جودة الفيديو",
        value:
          VIDEO_QUALITY[channel.videoQualityMode] ||
          "تلقائية",
        inline: true,
      });
    }

    if ("defaultAutoArchiveDuration" in channel) {
      fields.push({
        name: "🗄️ أرشفة الثريدات",
        value:
          ARCHIVE_DURATIONS[
            channel.defaultAutoArchiveDuration
          ] || "غير محددة",
        inline: true,
      });
    }

    if ("defaultThreadRateLimitPerUser" in channel) {
      fields.push({
        name: "🧵 بطء الثريدات",
        value: `\`${formatSeconds(
          channel.defaultThreadRateLimitPerUser
        )}\``,
        inline: true,
      });
    }

    if ("archived" in channel) {
      fields.push({
        name: "📦 حالة الثريد",
        value: channel.archived
          ? "مؤرشف ✅"
          : "مفتوح ✅",
        inline: true,
      });
    }

    if ("locked" in channel) {
      fields.push({
        name: "🔒 قفل الثريد",
        value: channel.locked
          ? "مقفل 🔒"
          : "غير مقفل 🔓",
        inline: true,
      });
    }

    if ("ownerId" in channel) {
      fields.push({
        name: "👑 منشئ الثريد",
        value: channel.ownerId
          ? `<@${channel.ownerId}>\n\`${channel.ownerId}\``
          : "غير معروف",
        inline: true,
      });
    }

    if ("messageCount" in channel) {
      fields.push({
        name: "💬 عدد الرسائل",
        value: `\`${formatNumber(
          channel.messageCount
        )}\``,
        inline: true,
      });
    }

    if ("memberCount" in channel) {
      fields.push({
        name: "👥 أعضاء الثريد",
        value: `\`${formatNumber(
          channel.memberCount
        )}\``,
        inline: true,
      });
    }

    if ("availableTags" in channel) {
      const tags =
        channel.availableTags?.length > 0
          ? channel.availableTags
              .slice(0, 15)
              .map((tag) => `• ${tag.emoji?.name || "🏷️"} ${tag.name}`)
              .join("\n")
          : "لا توجد وسوم";

      fields.push({
        name: "🏷️ وسوم المنتدى",
        value: shorten(tags),
        inline: false,
      });
    }

    const embedColor =
      interaction.guild.members.me?.displayColor ||
      0x5865f2;

    const guildIcon =
      interaction.guild.iconURL({
        size: 1024,
        extension: "png",
      }) ||
      interaction.client.user.displayAvatarURL({
        size: 1024,
      });

    const embed = new EmbedBuilder()
      .setColor(embedColor)
      .setAuthor({
        name: `معلومات روم ${channel.name || channel.id}`,
        iconURL: guildIcon,
      })
      .setTitle("📺 معلومات الروم")
      .setDescription(
        [
          `**الروم:** ${channel}`,
          `**السيرفر:** \`${interaction.guild.name}\``,
        ].join("\n")
      )
      .setThumbnail(guildIcon)
      .addFields(fields)
      .setFooter({
        text: `طلب بواسطة ${interaction.user.username}`,
        iconURL: interaction.user.displayAvatarURL({
          size: 256,
        }),
      })
      .setTimestamp();

    await interaction.editReply({
      embeds: [embed],
    });
  },
};
