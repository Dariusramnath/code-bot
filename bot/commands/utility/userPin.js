const { SlashCommandBuilder } = require("discord.js");
const { getPin } = require("../../utils/pinManager");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("user_pin")
    .setDescription("Provides information about the user pin."),
  async execute(interaction) {
    const userId = interaction.user.id;
    // interaction.user is the object representing the User who ran the command
    // interaction.member is the GuildMember object, which represents the user in the specific guild
    await interaction.reply(
      `This command was run by ${
        interaction.user.username
      }, who's pin is ${getPin(userId) ?? "not set"}`
    );
  },
};
