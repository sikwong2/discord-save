import { Client, Events, GatewayIntentBits, REST } from 'discord.js';
import { load_db, save_db } from './db';

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
var db = await load_db('./db.json');
const rest = new REST({ version: '10' }).setToken(`${Bun.env.DISCORD_TOKEN}`);

client.on(Events.ClientReady, readyClient => {
  console.log(`Logged in as ${readyClient.user.tag}`)
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'ping') {
    await interaction.reply('pong')
  }

  if (interaction.commandName === 'init') {

    if (!Object.keys(db).includes(interaction.user.id)) {
      db[interaction.user.id] = {
        message_refs: [],
      }

      await save_db('./db.json', db);
      await interaction.reply('User successfully created');
    }
  }

  if (interaction.commandName === 'collection') {
    if (!Object.keys(db).includes(interaction.user.id)) {
      interaction.reply('User does not exist');
      return;
    };

    const user_id = interaction.user.id;
    const msgs = [];
    for (const ref_msg of db[user_id].message_refs) {
      const channel_id = ref_msg[0];
      const ref_msg_id = ref_msg[1];

      const msg = await rest.get(`/channels/${channel_id}/messages/${ref_msg_id}`);
      const msg_content = msg.content;
      const attachments = msg.attachments.map((x) => x.url);

      msgs.push(
        `<@${msg.author.id}>
${msg_content ? `\`\`\`${msg_content}\`\`\`` : ''}
${attachments ? attachments.join(' ') : ''}
`
      );
    }
    await interaction.user.send(msgs.join('\n'));
    return;
  }

  if (interaction.commandName === 'reset') {
    if (interaction.user.id != Bun.env.ADMIN_ID) return;

    db = {};
    await save_db('./db.json', {});
    await interaction.reply('Database reset');
  }



})

client.on(Events.MessageCreate, async message => {
  if (message.author.tag === client.user?.tag) return;

  if (!Object.keys(db).includes(message.author.id)) return;

  const ref_msg_id = message.reference?.messageId;
  const channel = message.channel;
  const ref_msg = await channel.messages.fetch(ref_msg_id);
  const ref_msg_content = ref_msg.content;
  // const test = await rest.get(`/channels/${message.channelId}/messages/${message.id}`);
  // console.log(test);
  // await message.forward(channel);
  if (message.reference && message.mentions.users.has(client.user?.id)) {
    db[message.author.id].message_refs.push([channel.id, ref_msg_id]);
    await save_db('./db.json', db);
  }
})

client.login(Bun.env.DISCORD_TOKEN);

