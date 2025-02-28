import { REST, Routes, SlashCommandBuilder } from 'discord.js';

const commands = [
  {
    name: 'ping',
    description: 'pong'
  },
  {
    name: 'init',
    description: 'Adds the user to the databse'
  },
  {
    name: 'collection',
    description: 'Get all your saved messages'
  },
  {
    name: 'reset',
    description: 'Reset the database'
  },
  new SlashCommandBuilder()
    .setName('blackjack')
    .setDescription('GOLD GOLD GOLD')
    .addIntegerOption(option =>
      option.setName('wager')
        .setDescription('bet amount').setRequired(true))
  ,
  new SlashCommandBuilder()
    .setName('balance')
    .setDescription('Check your chip balance'),
  new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Chip leaderboard'),
];

const rest = new REST({ version: '10' }).setToken(`${Bun.env.DISCORD_TOKEN}`);

try {

  console.log('Started refreshing application (/) commands.');

  await rest.put(Routes.applicationCommands('1141257152388939877'), { body: commands });

  console.log('Successfully reloaded application (/) commands.');
} catch (error) {
  console.log(error);
}
