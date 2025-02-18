import { Client, Events, GatewayIntentBits } from 'discord.js';
import { load_db, save_db } from './db';

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
var db = await load_db('./db.json');

client.on(Events.ClientReady, readyClient => {
  console.log(`Logged in as ${readyClient.user.tag}`)
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'ping') {
    await interaction.reply('pong')
  }

  if (interaction.commandName === 'bind') {
    if (!db.has(interaction.user.id)) {
      db.set(interaction.user.id, interaction.channelId);
    }
    db.set(interaction.user.id, interaction.channelId);
    await save_db('./db.json', db);
    await interaction.reply(`Successfully bound to ${interaction.channelId}`);
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

  }
})

client.login(Bun.env.DISCORD_TOKEN);

