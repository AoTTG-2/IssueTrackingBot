const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { ChangeThreadState } = require('../utility/discUtil');

// Command takes in a user or by default uses the user who called the command and sets the tag of the thread to assigned
module.exports = {
	data: new SlashCommandBuilder()
		.setName('close')
		.setDescription('Close the thread with a reason')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addStringOption(option => option.setName('reason').setDescription('Reason for closing the thread').setRequired(false)),
	async execute(interaction) {
		// Get the user who called the command
		const user = interaction.options.getUser('user') || interaction.user;
		// Set the tag of the thread to assigned
		 // if thread is now archived, unarchive it
		 if (interaction.channel.archived) {
            await interaction.channel.setArchived(false);
        }
		ChangeThreadState(interaction.channel, 'closed');
		await interaction.reply({ content: `${user.username} closed the thread`, ephemeral: false });
	},
};