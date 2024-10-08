const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const {
    pairCreatedThreadWithIssue,
    isChannelTracked
} = require('../utility/util.js');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('createissue')
		.setDescription('Creates a discord issue for the given thread!')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
	async execute(interaction) {
		const thread = interaction.channel;
		if (!isChannelTracked(thread.parentId)) return;
		await pairCreatedThreadWithIssue(thread);
	},
};