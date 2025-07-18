const { Events, EmbedBuilder, MessageFlags } = require("discord.js");
const { generatePin, cachePin, getPin } = require("../utils/pinManager");
const {
  storePinInMongo,
  findPinByUserId,
  expirePin,
} = require("../db/pinService");
const wait = require("node:timers/promises").setTimeout;
require("dotenv").config();
const { WAIT_TIME } = process.env;

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {

    if (interaction.isButton()) {
      if (interaction.customId !== "link_account") return;

      const userId = interaction.user.id;
      const pin = generatePin();

      try {
        await storePinInMongo(userId, pin); 

        console.log(`Generated pin for ${interaction.user.username}: ${pin}`);

        const embed = new EmbedBuilder()
          .setTitle(`${interaction.user.username}`)
          .setDescription(`Here's your pin!\n**${pin}**`)
          .setColor(0x00ae86);

        await interaction.reply({
          embeds: [embed],
          flags: MessageFlags.Ephemeral,
        });

        setTimeout(async () => {
          console.log("Timeout reached, checking pin expiration...");

          const existingPin = await findPinByUserId(interaction.user.id);

          if (existingPin) {
            await expirePin(interaction.user.id);
            console.log(
              `Pin for ${interaction.user.username} expired and removed.`
            );
          }

          const expiredEmbed = new EmbedBuilder()
            .setTitle(`${interaction.user.username}`)
            .setDescription("❌ Your pin expired, click the button again.")
            .setColor(0xff0000);

          try {
            await interaction.editReply({
              embeds: [expiredEmbed],
              components: [], 
            });
          } catch (e) {
            console.warn(
              `Could not edit reply to show expiration message for ${interaction.user.username}`,
              e
            );
          }
        }, WAIT_TIME);
      } catch (error) {
        console.error("Error during pin generation or reply:", error);
        await interaction.reply({
          content:
            "❌ Something went wrong generating your pin. Please try again later.",
          ephemeral: true,
        });
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
