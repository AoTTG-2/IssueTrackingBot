const { SlashCommandBuilder, PermissionFlagsBits, ForumChannel } = require('discord.js');
const {
    createGithubReference,
    parseGithubReference,
    createDiscordReference,
    parseDiscordReference,
    getTrackedChannels,
    addTrackedChannel,
    removeTrackedChannel,
    pairCreatedThreadWithIssue,
    isChannelTracked
} = require('../utility/util');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('trackthread')
		.setDescription('Will track a thread and backfill issues.')
        .addChannelOption(option => option.setName('channel').setDescription('The channel to track threads in.').setRequired(true))
        .addBooleanOption(option => option.setName('backfill').setDescription('Whether to backfill issues').setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
	async execute(interaction) {
        // Get the channel
        const channel = interaction.options.getChannel('channel');

        // check if channel has availabletags
        if (!channel.availableTags) {
            await interaction.reply({content: 'The channel must be a thread.', ephemeral: true});
            return;
        }

        // Check that channel has the required tags Ready, Assigned, and Closed
        const requiredTags = ['Ready', 'Assigned', 'Closed'];
        const missingTags = requiredTags.filter(tag => !channel.availableTags.find(t => t.name === tag));
        if (missingTags.length > 0) {
            await interaction.reply({content: `The channel is missing the following tags: ${missingTags.join(', ')}`, ephemeral: true});
            return;
        }

        // Add channel to tracked channels
        addTrackedChannel({name: channel.name, id: channel.id});

        // Get backfill
        const backfill = interaction.options.getBoolean('backfill');
        if (!backfill) {
            await interaction.reply({content: `Tracking ${channel.name} without backfilling.`, ephemeral: true});
            return;
        }
        
        // Get all threads in channel
        const threads = await channel.threads.fetch();
        
        // Iterate through threads
        for (const thread of threads.threads) {
            await pairCreatedThreadWithIssue(thread);
        }
        
        await interaction.reply({content: `Tracking ${channel.name} and backfilled ${threads.threads.length} threads.`, ephemeral: true});
	},
};