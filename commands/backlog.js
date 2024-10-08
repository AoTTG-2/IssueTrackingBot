const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { ChangeThreadState } = require('../utility/discUtil');

// Command takes in a user or by default uses the user who called the command and sets the tag of the thread to assigned
module.exports = {
	data: new SlashCommandBuilder()
		.setName('backlog')
		.setDescription('Sets thread state to backlog!')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
	async execute(interaction) {
		// Set the tag of the thread to assigned
		 // if thread is now archived, unarchive it
		 if (interaction.channel.archived) {
            await interaction.channel.setArchived(false);
        }
		const threadName = interaction.channel.name;

		// If thread name contains -assigned-, remove it and everything that comes after it
		if (threadName.includes('-assigned-')) {
			await interaction.channel.setName(threadName.substring(0, threadName.indexOf('-assigned-')));
		}
		ChangeThreadState(interaction.channel, 'backlog');

		// return ephemeral message
		await interaction.reply({ content: 'Thread sent to backlog', ephemeral: false });
	},
};