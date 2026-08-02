const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("ping")
    .setDescription("يتأكد أن البوت شغال"),

  async execute(interaction) {
    await interaction.reply("🏓 البوت شغال!");
  },
};
