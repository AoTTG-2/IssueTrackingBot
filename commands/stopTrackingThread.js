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

        // Remove from tracking list
        removeTrackedChannel(channel);
        
        await interaction.reply({content: `Removed ${channel.name} from tracking.`, ephemeral: true});
	},
};