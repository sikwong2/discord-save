import { Client, Events, GatewayIntentBits, REST, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ComponentType } from 'discord.js';
import { load_db, save_db } from './db';

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
let db = await load_db('./db.json');

const rest = new REST({ version: '10' }).setToken(`${Bun.env.DISCORD_TOKEN}`);
const win_img = 'https://media.discordapp.net/attachments/1141259150005899329/1342670558722134057/miku_retard.png?ex=67ba7ae6&is=67b92966&hm=1ec32dc3e58725fc6f891d21d891e40f824661ac69a3675ad59ecad60ef11a41&=&format=webp&quality=lossless&width=326&height=282';
const lose_img = 'https://media.discordapp.net/attachments/1091699978088484905/1342671510623485992/Miku_08_st.ayaka.one.png?ex=67ba7bc9&is=67b92a49&hm=28e72a30525cbb0766f163461a5f87380324cc354e15964e184481d6766ab95c&=&format=webp&quality=lossless&width=326&height=282';

const ranks = {
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  '10': 10,
  'J': 10,
  'Q': 10,
  'K': 10,
  'A': 11
};

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function get_score(hand): number {
  let score = 0;
  hand?.forEach((x) => {
    score += ranks[x];
  });

  hand?.forEach((x) => {
    if (x == 'A' && score > 21) {
      score -= 10;
    }
  })
  return score;
}

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

  if (interaction.commandName === 'blackjack') {
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
      {
        name: 'Split',
        style: ButtonStyle.Primary,
        disabled: true
      }

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

    const cards = [2, 3, 4, 5, 6, 7, 8, 9, 10, 'J', 'Q', 'K', 'A'];


    let embed = new EmbedBuilder()
      .setTitle('GOLD GOLD GOLD')
      .setDescription('gamba')
      .setColor('Random')
      .addFields([
        {
          name: 'Dealers Hand',
          value: `${cards[getRandomInt(0, 12)]}`,
        },
        {
          name: 'Your Hand',
          value: `${cards[getRandomInt(0, 12)]} ${cards[getRandomInt(0, 12)]}`
        }
      ]);


    const filter = i => i.user.id === interaction.user.id;


    /* check if dealt hand is a winning or losing before hitting */
    const hand = embed.data.fields?.[1].value.split(' ');
    const score = get_score(hand);

    if (score == 21) {
      embed.setImage(win_img)
      button_components.forEach((x) => x.setDisabled(true));
    }

    const reply = await interaction.reply({ components: [row], embeds: [embed] });
    const collector = reply.createMessageComponentCollector({
      componentType: ComponentType.Button,
      filter
    });

    collector.on('collect', interaction => {
      if (interaction.customId === 'Hit') {
        let new_embed = new EmbedBuilder(embed.data);
        new_embed.setFields([
          embed.data.fields?.[0],
          {
            name: 'Your Hand',
            value: embed.data.fields?.[1].value + ` ${cards[getRandomInt(0, 12)]}`
          }
        ])

        const hand = new_embed.data.fields?.[1].value.split(' ');
        const score = get_score(hand);

        if (score > 21) {
          new_embed.setImage(lose_img)
          button_components.forEach((x) => x.setDisabled(true));
        } else if (score == 21) {
          new_embed.setImage(win_img);
          button_components.forEach((x) => x.setDisabled(true));
        }

        embed = new_embed;
      }

      if (interaction.customId === 'Stand') {
        const dealer_hand = embed.data.fields?.[0].value.split(' ');
        dealer_hand.push(cards[getRandomInt(0, 12)]);

        let score = get_score(dealer_hand);

        while (score < 17) {
          dealer_hand.push(cards[getRandomInt(0, 12)]);
          score = get_score(dealer_hand);
        }

        const player_hand = embed.data.fields?.[1].value.split(' ');
        const player_score = get_score(player_hand);
        let win = score > 21;

        if (player_score < score || score == 21) {
          win = false;
        }
        /* check if winning hand */

        let new_embed = new EmbedBuilder(embed.data)
          .setFields([
            {
              name: 'Dealers Hand',
              value: dealer_hand?.join(' ')
            },
            embed.data.fields?.[1]
          ]);
        new_embed.setImage(win ? win_img : lose_img);
        embed = new_embed;
        button_components.forEach((x) => x.setDisabled(true));
      }

      reply.edit({ embeds: [embed], components: [row] });


      interaction.deferUpdate();
    });
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

