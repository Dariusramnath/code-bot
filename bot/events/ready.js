const { Events, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log(`✅ Ready! Logged in as ${client.user.tag}`);

    const channel = await client.channels.fetch(process.env.CHANNEL_ID);
    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('link_account')
        .setLabel('Get a code')
        .setStyle(ButtonStyle.Primary)
    );

    const messages = await channel.messages.fetch({ limit: 10 });
    const existing = messages.find(m => m.author.id === client.user.id && m.components.length > 0);
    
    if (!existing) {
      await channel.send({
        content: 'Click the button below to begin the process:',
        components: [row],
      });
    }
  },
};
