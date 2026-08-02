const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("يعرض صورة حسابك بجودة عالية"),

  async execute(interaction) {
    const avatar = interaction.user.displayAvatarURL({ size: 1024 });

    await interaction.reply(avatar);
  },
};
