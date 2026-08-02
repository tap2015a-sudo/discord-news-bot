const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("يعرض جميع أوامر البوت"),

  async execute(interaction) {
    await interaction.reply(
      "📋 الأوامر المتوفرة:\n/ping - يتأكد أن البوت شغال\n/help - يعرض جميع الأوامر\n/avatar - يعرض صورة حسابك\n/userinfo - يعرض معلومات حسابك"
    );
  },
};
