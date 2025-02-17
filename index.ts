import { Client, Events, GatewayIntentBits } from 'discord.js';
import { bind_user } from './db';

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

client.on(Events.ClientReady, readyClient => {
  console.log(`Logged in as ${readyClient.user.tag}`)
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'ping') {
    await bind_user(interaction.user.id, interaction.guild?.id, interaction.channel?.id);
    console.log(interaction.user.id, interaction.channelId);
    console.log(interaction.guild?.id);
    await interaction.reply('pong')
  }

  if (interaction.commandName === 'bind') {

    // When you init the bot should bind a users "saved" messages to the current channel
    await bind_user(interaction.user.id, interaction.guild?.id, interaction.channel?.id);
    console.log(interaction.user.id, interaction.channelId);
    await interaction.reply('Successfully binded to channel');
  }

})

client.on(Events.MessageCreate, async message => {
  if (message.author.tag === client.user?.tag) return;

  const ref_msg_id = message.reference?.messageId;
  const channel = message.channel;
  const ref_msg = await channel.messages.fetch(ref_msg_id);
  const ref_msg_content = ref_msg.content;


  await message.forward(channel);
  if (message.reference && message.mentions.users.has(client.user?.id)) {
    console.log(ref_msg.attachments)
    // console.log(ref_msg_content);

  }
})

client.login(Bun.env.DISCORD_TOKEN);

