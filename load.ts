import { REST, Routes, SlashCommandBuilder } from 'discord.js';

const commands = [
  {
    name: 'ping',
    description: 'pong'
  },
  {
    name: 'bind',
    description: 'Binds a users saved messages to the channel'
  }
];

const rest = new REST({ version: '10' }).setToken(`${Bun.env.DISCORD_TOKEN}`);

try {

  console.log('Started refreshing application (/) commands.');

  await rest.put(Routes.applicationCommands('1141257152388939877'), { body: commands });

  console.log('Successfully reloaded application (/) commands.');
} catch (error) {
  console.log(error);
}
