const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
} = require("discord.js");

const VERIFICATION_LEVELS = {
  0: "بدون",
  1: "منخفض",
  2: "متوسط",
  3: "مرتفع",
  4: "مرتفع جدًا",
};

const CONTENT_FILTER_LEVELS = {
  0: "معطّل",
  1: "فحص رسائل الأعضاء بدون رتب",
  2: "فحص رسائل جميع الأعضاء",
};

const NOTIFICATION_LEVELS = {
  0: "جميع الرسائل",
  1: "المنشن فقط",
};

const MFA_LEVELS = {
  0: "غير مطلوب",
  1: "مطلوب للإدارة",
};

const PREMIUM_TIERS = {
  0: "بدون مستوى",
  1: "المستوى الأول",
  2: "المستوى الثاني",
  3: "المستوى الثالث",
};

const FEATURE_NAMES = {
  ANIMATED_BANNER: "بانر متحرك",
  ANIMATED_ICON: "أيقونة متحركة",
  APPLICATION_COMMAND_PERMISSIONS_V2: "صلاحيات أوامر متقدمة",
  AUTO_MODERATION: "الحماية التلقائية",
  BANNER: "بانر السيرفر",
  COMMUNITY: "سيرفر مجتمعي",
  CREATOR_MONETIZABLE_PROVISIONAL: "تحقيق الدخل",
  CREATOR_STORE_PAGE: "متجر المنشئ",
  DEVELOPER_SUPPORT_SERVER: "سيرفر دعم مطورين",
  DISCOVERABLE: "ظاهر في الاستكشاف",
  FEATURABLE: "قابل للتمييز",
  GUESTS_ENABLED: "دخول الضيوف",
  HUB: "مجتمع طلابي",
  INVITES_DISABLED: "الدعوات معطلة",
  MEMBER_VERIFICATION_GATE_ENABLED: "فحص العضوية",
  MEMBER_PROFILES: "ملفات الأعضاء",
  MEMBER_SAFETY_PAGE_ROLLOUT: "صفحة سلامة الأعضاء",
  MONETIZATION_ENABLED: "تحقيق الدخل مفعل",
  MORE_SOUNDBOARD: "ساوندبورد موسع",
  MORE_STICKERS: "ملصقات إضافية",
  NEWS: "قنوات إعلانات",
  PARTNERED: "شريك ديسكورد",
  PREMIUM_TIER_3_OVERRIDE: "مزايا المستوى الثالث",
  PREVIEW_ENABLED: "معاينة السيرفر",
  RAID_ALERTS_DISABLED: "تنبيهات الهجمات معطلة",
  RELAY_ENABLED: "Relay مفعل",
  ROLE_ICONS: "أيقونات الرتب",
  ROLE_SUBSCRIPTIONS_AVAILABLE_FOR_PURCHASE: "اشتراكات رتب متاحة",
  ROLE_SUBSCRIPTIONS_ENABLED: "اشتراكات الرتب",
  SOUNDBOARD: "ساوندبورد",
  TICKETED_EVENTS_ENABLED: "فعاليات بتذاكر",
  VANITY_URL: "رابط مخصص",
  VERIFIED: "سيرفر موثّق",
  VIP_REGIONS: "مناطق صوتية مميزة",
  WELCOME_SCREEN_ENABLED: "شاشة ترحيب",
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
    .setName("serverinfo")
    .setDescription("يعرض معلومات السيرفر بشكل مفصل واحترافي")
    .setDMPermission(false),

  async execute(interaction) {
    if (!interaction.inGuild()) {
      return interaction.reply({
        content: "❌ هذا الأمر يعمل داخل السيرفرات فقط.",
        ephemeral: true,
      });
    }

    await interaction.deferReply();

    const guild = interaction.guild;

    let owner;

    try {
      owner = await guild.fetchOwner();
    } catch {
      owner = null;
    }

    try {
      await guild.roles.fetch();
      await guild.emojis.fetch();
      await guild.stickers.fetch();
      await guild.channels.fetch();
    } catch (error) {
      console.error("تعذر تحديث بعض معلومات السيرفر:", error);
    }

    const icon = guild.iconURL({
      size: 4096,
      extension: "png",
    });

    const banner = guild.bannerURL({
      size: 4096,
      extension: "png",
    });

    const splash = guild.splashURL({
      size: 4096,
      extension: "png",
    });

    const createdTimestamp = toTimestamp(guild.createdAt);
    const createdDate = formatDate(guild.createdAt);

    const channels = guild.channels.cache;

    const textChannels = channels.filter((channel) =>
      [
        ChannelType.GuildText,
        ChannelType.GuildAnnouncement,
        ChannelType.GuildForum,
        ChannelType.GuildMedia,
      ].includes(channel.type)
    ).size;

    const voiceChannels = channels.filter((channel) =>
      [
        ChannelType.GuildVoice,
        ChannelType.GuildStageVoice,
      ].includes(channel.type)
    ).size;

    const categories = channels.filter(
      (channel) =>
        channel.type === ChannelType.GuildCategory
    ).size;

    const threads = channels.filter((channel) =>
      [
        ChannelType.PublicThread,
        ChannelType.PrivateThread,
        ChannelType.AnnouncementThread,
      ].includes(channel.type)
    ).size;

    const rolesCount = Math.max(guild.roles.cache.size - 1, 0);

    const emojisCount = guild.emojis.cache.size;
    const animatedEmojis = guild.emojis.cache.filter(
      (emoji) => emoji.animated
    ).size;
    const staticEmojis = emojisCount - animatedEmojis;

    const stickersCount = guild.stickers.cache.size;

    const features =
      guild.features.length > 0
        ? guild.features
            .map(
              (feature) =>
                FEATURE_NAMES[feature] ||
                feature
                  .toLowerCase()
                  .replaceAll("_", " ")
            )
            .join(" • ")
        : "لا توجد مميزات خاصة";

    const vanityURL = guild.vanityURLCode
      ? `discord.gg/${guild.vanityURLCode}`
      : "لا يوجد";

    const serverDescription =
      guild.description || "لا يوجد وصف للسيرفر";

    const boostCount =
      guild.premiumSubscriptionCount || 0;

    const embedColor =
      guild.members.me?.displayColor || 0x5865f2;

    const embed = new EmbedBuilder()
      .setColor(embedColor)
      .setAuthor({
        name: `معلومات سيرفر ${guild.name}`,
        iconURL:
          icon ||
          interaction.client.user.displayAvatarURL(),
      })
      .setTitle("🏠 معلومات السيرفر")
      .setDescription(
        `> ${shorten(serverDescription, 350)}`
      )
      .setThumbnail(
        icon ||
          interaction.client.user.displayAvatarURL({
            size: 1024,
          })
      )
      .addFields(
        {
          name: "🏷️ اسم السيرفر",
          value: `\`${guild.name}\``,
          inline: true,
        },
        {
          name: "🆔 معرّف السيرفر",
          value: `\`${guild.id}\``,
          inline: true,
        },
        {
          name: "👑 مالك السيرفر",
          value: owner
            ? `${owner}\n\`${owner.user.username}\``
            : "تعذر جلب المالك",
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
          name: "👥 عدد الأعضاء",
          value: `\`${formatNumber(guild.memberCount)}\``,
          inline: true,
        },
        {
          name: "🌐 لغة السيرفر",
          value: `\`${guild.preferredLocale || "غير محددة"}\``,
          inline: true,
        },
        {
          name: "💬 الرومات النصية",
          value: `\`${formatNumber(textChannels)}\``,
          inline: true,
        },
        {
          name: "🔊 الرومات الصوتية",
          value: `\`${formatNumber(voiceChannels)}\``,
          inline: true,
        },
        {
          name: "📁 التصنيفات",
          value: `\`${formatNumber(categories)}\``,
          inline: true,
        },
        {
          name: "🧵 الثريدات",
          value: `\`${formatNumber(threads)}\``,
          inline: true,
        },
        {
          name: "🎭 الرتب",
          value: `\`${formatNumber(rolesCount)}\``,
          inline: true,
        },
        {
          name: "🏷️ الملصقات",
          value: `\`${formatNumber(stickersCount)}\``,
          inline: true,
        },
        {
          name: "😀 الإيموجيات",
          value:
            `الكل: \`${formatNumber(emojisCount)}\`\n` +
            `ثابتة: \`${formatNumber(staticEmojis)}\`\n` +
            `متحركة: \`${formatNumber(animatedEmojis)}\``,
          inline: true,
        },
        {
          name: "🚀 تعزيز السيرفر",
          value:
            `المستوى: \`${PREMIUM_TIERS[guild.premiumTier] || "غير معروف"}\`\n` +
            `عدد التعزيزات: \`${formatNumber(boostCount)}\``,
          inline: true,
        },
        {
          name: "🛡️ مستوى التحقق",
          value: `\`${VERIFICATION_LEVELS[guild.verificationLevel] || "غير معروف"}\``,
          inline: true,
        },
        {
          name: "🔍 فلتر المحتوى",
          value: `\`${CONTENT_FILTER_LEVELS[guild.explicitContentFilter] || "غير معروف"}\``,
          inline: true,
        },
        {
          name: "🔔 الإشعارات الافتراضية",
          value: `\`${NOTIFICATION_LEVELS[guild.defaultMessageNotifications] || "غير معروف"}\``,
          inline: true,
        },
        {
          name: "🔐 التحقق الثنائي للإدارة",
          value: `\`${MFA_LEVELS[guild.mfaLevel] || "غير معروف"}\``,
          inline: true,
        },
        {
          name: "🔗 الرابط المخصص",
          value: `\`${vanityURL}\``,
          inline: true,
        },
        {
          name: "✨ مميزات السيرفر",
          value: shorten(features),
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

    if (banner) {
      embed.setImage(banner);
    } else if (splash) {
      embed.setImage(splash);
    }

    const buttons = [];

    if (icon) {
      buttons.push(
        new ButtonBuilder()
          .setLabel("فتح أيقونة السيرفر")
          .setEmoji("🖼️")
          .setStyle(ButtonStyle.Link)
          .setURL(icon)
      );
    }

    if (banner) {
      buttons.push(
        new ButtonBuilder()
          .setLabel("فتح بانر السيرفر")
          .setEmoji("🎨")
          .setStyle(ButtonStyle.Link)
          .setURL(banner)
      );
    }

    if (splash && splash !== banner) {
      buttons.push(
        new ButtonBuilder()
          .setLabel("فتح صورة الدعوة")
          .setEmoji("🌆")
          .setStyle(ButtonStyle.Link)
          .setURL(splash)
      );
    }

    if (guild.vanityURLCode) {
      buttons.push(
        new ButtonBuilder()
          .setLabel("رابط السيرفر")
          .setEmoji("🔗")
          .setStyle(ButtonStyle.Link)
          .setURL(
            `https://discord.gg/${guild.vanityURLCode}`
          )
      );
    }

    const replyData = {
      embeds: [embed],
    };

    if (buttons.length > 0) {
      const row =
        new ActionRowBuilder().addComponents(buttons);

      replyData.components = [row];
    }

    await interaction.editReply(replyData);
  },
};
