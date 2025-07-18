const { Events, EmbedBuilder, MessageFlags } = require("discord.js");
const { generatePin, cachePin, getPin } = require("../utils/pinManager");
const wait = require("node:timers/promises").setTimeout;

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    // Handle button interactions
    if (interaction.isButton()) {
      if (interaction.customId !== "link_account") return;

      const userId = interaction.user.id;
      const pin = generatePin();
      cachePin(userId, pin);
      console.log(
        `Generated pin for ${interaction.user.username}: ${getPin(userId)}`
      );

      const embed = new EmbedBuilder()
        .setTitle(`${interaction.user.username}`)
        .setDescription(`Here's your pin!\n**${pin}**`)
        .setColor(0x00ae86);

      try {
        await interaction.reply({
          embeds: [embed],
          flags: MessageFlags.Ephemeral,
        });

        await wait(1 * 60 * 1000);
        console.log("Timeout reached, checking pin expiration...");
        console.log(`Pin for ${interaction.user.username} is: ${getPin(userId)}`);

        // Expire the pin after 5 minutes
        if (!getPin(userId)) {
          const expiredEmbed = new EmbedBuilder()
            .setTitle(`${interaction.user.username}`)
            .setDescription("❌ Your pin expired, click the button again.")
            .setColor(0xff0000);
          try {
            await interaction.editReply({
              embeds: [expiredEmbed],
            });
          } catch (e) {
            console.warn(
              `Could not send expiration message to ${interaction.user.username}`
            );
          }
        }
      } catch (error) {
        console.error("Failed to send embed:", error);
      }

      return; // Prevent processing as a chat input command
    }

    // Handle slash commands
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) {
      console.error(
        `No command matching ${interaction.commandName} was found.`
      );
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      const errorReply = {
        content: "There was an error while executing this command!",
        flags: MessageFlags.Ephemeral,
      };
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(errorReply);
      } else {
        await interaction.reply(errorReply);
      }
    }
  },
};
