const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const {
	ProjectStates,
    createIssue,
    addIssueComment,
    getIssueCommentByReference,
    addIssueToProject,
    setIssueState,
    updateIssue,
    listIssueEvents,
    listIssues,
    findBotCommentOnIssue,
    getIssueByNumber
} = require('../utility/github');

const {
    getTrackedChannels,
    addTrackedChannel,
    removeTrackedChannel
} = require('../utility/util');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('stoptrackingthread')
		.setDescription('Will remove the thread from the tracking list.')
        .addChannelOption(option => option.setName('channel').setDescription('The channel to track threads in.').setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
	async execute(interaction) {
        // Get the channel
        const channel = interaction.options.getChannel('channel');
                
        // if the channel is not a forum, return an ephemeral error
        if (channel.type !== "Forum") {
            await interaction.reply({content: 'The channel must be a thread.', ephemeral: true});
            return;
        }

        // Remove from tracking list
        removeTrackedChannel(channel);
        
	},
};