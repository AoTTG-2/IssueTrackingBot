const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { ChangeThreadState } = require('../utility/discUtil');

// Command takes in a user or by default uses the user who called the command and sets the tag of the thread to assigned
module.exports = {
	data: new SlashCommandBuilder()
		.setName('assign')
		.setDescription('Assign the thread to a user!')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addUserOption(option => option.setName('user').setDescription('User to assign').setRequired(false)),
	async execute(interaction) {
		// Get the user who called the command
		const user = interaction.options.getUser('user') || interaction.user;

		// Set the tag of the thread to assigned
		 // if thread is now archived, unarchive it
		 if (interaction.channel.archived) {
            await interaction.channel.setArchived(false);
        }
		const threadName = interaction.channel.name;
		// Append assigned user's name to thread name
		await interaction.channel.setName(`${threadName}-assigned-${user.username}`);
		ChangeThreadState(interaction.channel, 'assigned');
		await interaction.reply({ content: `Thread assigned to ${user.username}`, ephemeral: false });
	},
};