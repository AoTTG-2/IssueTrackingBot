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
		.setName('movethread')
		.setDescription('Will track a thread and backfill issues.')
        .addChannelOption(option => option.setName('thread').setDescription('The thread to copy').setRequired(true))
        .addChannelOption(option => option.setName('channel').setDescription('The channel to move the current thread to.').setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
	async execute(interaction) {
        // Get the channel
        const channel = interaction.options.getChannel('channel');
        const thread = interaction.options.getChannel('thread');

        // if the thread is archived, do nothing
        if (thread.archived) {
            await interaction.reply({content: 'The thread is archived.', ephemeral: true});
            return;
        }

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

        const messages = await thread.messages.fetch();
        const post = messages.first();
        if (!post) return;

        // create a link to previous thread
        const threadUrl = `https://discord.com/channels/${thread.guild.id}/${thread.id}`;

        // Copy the thread over to the new channel by creating a new thread with the same name, content, and messages (up to 20)
        const newThread = await channel.threads.create({
            name: thread.name,
            message: `Referenced Thread:${threadUrl}\n${post.content}`,
            autoArchiveDuration: 60,
            type: ForumChannel,
        });

        await interaction.reply({content: `Referenced ${thread.name} to ${channel.name}.`, ephemeral: true});
	},
};