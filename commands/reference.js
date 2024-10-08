const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reference')
		.setDescription('Creates a reference to the current thread and sends it to the designated channel!')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
		// add a channel option to the command if none supplied, use the current channel
		.addChannelOption(option => option.setName('destination').setDescription('The channel to reference the current thread from').setRequired(true))
		.addChannelOption(option => option.setName('source').setDescription('The channel to reference the current thread from').setRequired(false))
		.addStringOption(option => option.setName('reason').setDescription('Reason for referencing the thread').setRequired(false)),
	async execute(interaction) {
		const source = interaction.options.getChannel('source') || interaction.channel;
		const channel = interaction.options.getChannel('destination');
		const reason = interaction.options.getString('reason') || 'No reason provided';
		const user = interaction.user;
		await channel.send(`${user} referenced ${source} with reason: ${reason}`);
		// Send a message to the destination channel with a reference to the source channel
		await interaction.reply({ content: `${user} referenced ${source} with reason: ${reason}`, ephemeral: false });
	},
};