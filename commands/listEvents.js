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
} = require('../utility/github');


module.exports = {
	data: new SlashCommandBuilder()
		.setName('listevents')
		.setDescription('Replies with Pong!')
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
	async execute(interaction) {
        // list events
        const events = await listIssueEvents(process.env.OWNER, process.env.REPO, 30);
		
        // Send events back as json file to user
        const fs = require('fs');
        fs.writeFileSync('events.json', JSON.stringify(events, null, 4));
        await interaction.reply({files: ['events.json']});

        // delete the file
        fs.unlinkSync('events.json');
	},
};