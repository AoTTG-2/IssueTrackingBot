const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const {
    getTrackedChannels,
    addTrackedChannel,
    removeTrackedChannel
} = require('../utility/util');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('trackedchannels')
		.setDescription('List all tracked channels in the tracked.json file.')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
	async execute(interaction) {
        const tracked = getTrackedChannels();
        let message = "Tracked Channels:\n";
        tracked.forEach(channel => {
            message += `${channel.name} - ${channel.id}\n`;
        });
        await interaction.reply({content: message});
	},
};