import { Client, Events, GatewayIntentBits, REST, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ComponentType } from 'discord.js';
import { load_db, save_db } from './db';
import { GameState } from './gameState';

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
let db = await load_db('./db.json');

const rest = new REST({ version: '10' }).setToken(`${Bun.env.DISCORD_TOKEN}`);
const win_img = 'https://media.discordapp.net/attachments/1141259150005899329/1342670558722134057/miku_retard.png?ex=67ba7ae6&is=67b92966&hm=1ec32dc3e58725fc6f891d21d891e40f824661ac69a3675ad59ecad60ef11a41&=&format=webp&quality=lossless&width=326&height=282';
const lose_img = 'https://media.discordapp.net/attachments/1091699978088484905/1342671510623485992/Miku_08_st.ayaka.one.png?ex=67ba7bc9&is=67b92a49&hm=28e72a30525cbb0766f163461a5f87380324cc354e15964e184481d6766ab95c&=&format=webp&quality=lossless&width=326&height=282';
const tie_img = 'https://cdn.discordapp.com/attachments/1141259150005899329/1344084344649678860/Miku_06_st.ayaka.one.png?ex=67bf9f97&is=67be4e17&hm=c8f9498ea62a644ad18e6ddfd4c3f3865ad2a609271355d3a012fd28a65052b3&'
const ohne_gif = 'https://media1.tenor.com/m/lb-o-EPqTrsAAAAC/ohnepixel-gold.gif'

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
        chips: 10000,
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

  if (interaction.commandName === 'blackjack') {

    const wager = interaction.options.data[0].value;

    if (!Object.keys(db).includes(interaction.user.id)) return await interaction.reply('Type /init to claim your chips');

    if (db[interaction.user.id]?.chips < wager) return await interaction.reply('You do not have enough chips');

    const buttons = [
      {
        name: 'Hit',
        style: ButtonStyle.Success,
        disabled: false
      },
      {
        name: 'Stand',
        style: ButtonStyle.Danger,
        disabled: false,
      },
    ]
    const button_components = buttons.map((x) => {
      return new ButtonBuilder()
        .setLabel(x.name)
        .setDisabled(x.disabled)
        .setCustomId(x.name)
        .setStyle(x.style)
    });

    const row = new ActionRowBuilder()
      .addComponents(button_components);


    let gameState = new GameState();

    let embed = new EmbedBuilder()
      .setTitle('GOLD GOLD GOLD')
      .setDescription('GOLD GOLD GOLD')
      .setColor('Random')
      .setImage(ohne_gif)
      .addFields([
        {
          name: 'Dealers Hand',
          value: `**${gameState.dealer_hand.join(' ')}**`,
        },
        {
          name: 'Your Hand',
          value: `**${gameState.hand.join(' ')}**`
        }
      ]);


    const filter = i => i.user.id === interaction.user.id;


    /* check if dealt hand is a winning or losing before hitting */
    let player_score = gameState.get_score(gameState.hand);
    if (player_score == 21) {
      button_components.forEach((x) => x.setDisabled(true));
      embed.setImage(win_img);
    }


    const reply = await interaction.reply({ components: [row], embeds: [embed] });
    const collector = reply.createMessageComponentCollector({
      componentType: ComponentType.Button,
      filter
    });

    collector.on('collect', interaction => {
      let stand = false;
      if (interaction.customId === 'Hit') {
        gameState.hit();
      }

      if (interaction.customId === 'Stand') {
        gameState.stand();
        button_components.forEach((x) => x.setDisabled(true));
        stand = true;
      }
      let new_embed = new EmbedBuilder(embed.data)
        .setFields([
          {
            name: `Dealer's Hand`,
            value: `**${gameState.dealer_hand.join(' ')}**`
          },
          {
            name: "Your Hand",
            value: `**${gameState.hand.join(' ')}**`
          }
        ]);

      if (gameState.score > 21 || (stand && gameState.score < gameState.dealer_score && gameState.dealer_score <= 21)) {
        new_embed.setImage(lose_img);
        button_components.forEach((x) => x.setDisabled(true));
        db[interaction.user.id].chips -= wager;
      }
      if (gameState.score == 21 || gameState.dealer_score > 21 || (stand && gameState.score > gameState.dealer_score && gameState.score <= 21)) {
        new_embed.setImage(win_img);
        button_components.forEach((x) => x.setDisabled(true));
        db[interaction.user.id].chips += wager;
      }

      if (stand && gameState.score == gameState.dealer_score) {
        new_embed.setImage(tie_img);
      }

      embed = new_embed;
      reply.edit({ embeds: [embed], components: [row] });


      interaction.deferUpdate();
    });
  }

  if (interaction.commandName === 'balance') {
    if (!Object.keys(db).includes(interaction.user.id)) return await interaction.reply('Type /init');


    await interaction.reply(`You have ${db[interaction.user.id].chips} chips`);
  }

})

client.on(Events.MessageCreate, async message => {
  if (message.author.tag === client.user?.tag) return;

  if (!Object.keys(db).includes(message.author.id)) return;

  const ref_msg_id = message.reference?.messageId;
  const channel = message.channel;

  if (message.reference && message.mentions.users.has(client.user?.id)) {
    db[message.author.id].message_refs.push([channel.id, ref_msg_id]);
    await save_db('./db.json', db);
  }
})

client.login(Bun.env.DISCORD_TOKEN);

