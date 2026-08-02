const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

function formatDate(date) {
  return date.toISOString().split("T")[0].replace(/-/g, "/");
}

function toTimestamp(date) {
  return Math.floor(date.getTime() / 1000);
}

function getUnicodeCodePoints(emoji) {
  return [...emoji]
    .map((character) =>
      `U+${character.codePointAt(0).toString(16).toUpperCase()}`
    )
    .join(" ");
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("emojiinfo")
    .setDescription("يعرض معلومات الإيموجي بشكل مفصل")
    .addStringOption((option) =>
      option
        .setName("emoji")
        .setDescription("أرسل الإيموجي الذي تريد عرض معلوماته")
        .setRequired(true)
    ),

  async execute(interaction) {
    const input = interaction.options
      .getString("emoji", true)
      .trim();

    const customEmojiMatch = input.match(
      /^<(?<animated>a?):(?<name>[\w~]+):(?<id>\d+)>$/
    );

    if (!customEmojiMatch) {
      const embed = new EmbedBuilder()
        .setColor(0x5865f2)
        .setTitle("😀 معلومات الإيموجي")
        .setDescription(input)
        .addFields(
          {
            name: "📌 النوع",
            value: "إيموجي Unicode",
            inline: true,
          },
          {
            name: "🔢 الرمز البرمجي",
            value: `\`${getUnicodeCodePoints(input)}\``,
            inline: false,
          },
          {
            name: "📋 النص",
            value: `\`${input}\``,
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

      return interaction.reply({
        embeds: [embed],
      });
    }

    const { id, name, animated } = customEmojiMatch.groups;

    let emoji =
      interaction.guild?.emojis.cache.get(id) || null;

    if (!emoji && interaction.inGuild()) {
      try {
        emoji = await interaction.guild.emojis.fetch(id);
      } catch {
        emoji = null;
      }
    }

    const isAnimated = animated === "a";
    const extension = isAnimated ? "gif" : "png";
    const emojiURL =
      `https://cdn.discordapp.com/emojis/${id}.${extension}` +
      "?size=4096&quality=lossless";

    const createdAt = new Date(
      Number((BigInt(id) >> 22n) + 1420070400000n)
    );

    const createdTimestamp = toTimestamp(createdAt);
    const createdDate = formatDate(createdAt);

    let author = null;

    if (emoji) {
      try {
        author = await emoji.fetchAuthor();
      } catch {
        author = null;
      }
    }

    const allowedRoles =
      emoji?.roles?.cache?.size > 0
        ? emoji.roles.cache
            .first(10)
            .map((role) => role.toString())
            .join(" ")
        : "متاح لجميع الرتب";

    const embed = new EmbedBuilder()
      .setColor(0x5865f2)
      .setAuthor({
        name: `معلومات إيموجي ${name}`,
        iconURL: emojiURL,
      })
      .setTitle("😀 معلومات الإيموجي")
      .setDescription(`<${isAnimated ? "a" : ""}:${name}:${id}>`)
      .setThumbnail(emojiURL)
      .setImage(emojiURL)
      .addFields(
        {
          name: "🏷️ الاسم",
          value: `\`${name}\``,
          inline: true,
        },
        {
          name: "🆔 المعرّف",
          value: `\`${id}\``,
          inline: true,
        },
        {
          name: "📌 النوع",
          value: isAnimated ? "متحرك 🎞️" : "ثابت 🖼️",
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
          name: "✅ متوفر",
          value:
            emoji?.available === false
              ? "لا ❌"
              : "نعم ✅",
          inline: true,
        },
        {
          name: "⚙️ مُدار خارجيًا",
          value: emoji?.managed ? "نعم ✅" : "لا ❌",
          inline: true,
        },
        {
          name: "👤 منشئ الإيموجي",
          value: author
            ? `${author}\n\`${author.username}\``
            : "غير معروف",
          inline: false,
        },
        {
          name: "🎭 الرتب المسموحة",
          value: allowedRoles,
          inline: false,
        },
        {
          name: "📋 الصيغة",
          value: `\`<${isAnimated ? "a" : ""}:${name}:${id}>\``,
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

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("فتح الإيموجي")
        .setEmoji("😀")
        .setStyle(ButtonStyle.Link)
        .setURL(emojiURL)
    );

    await interaction.reply({
      embeds: [embed],
      components: [row],
    });
  },
};
