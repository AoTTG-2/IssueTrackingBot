const { Events } = require('discord.js');
const fs = require('node:fs');
const {
    createGithubReference,
    createDiscordReference,
    parseDiscordReference,
    parseGithubReference,
} = require('../utility/util.js');


const {
	ProjectStates,
	createIssue,
	addIssueComment,
	getIssueCommentByReference,
	addIssueToProject,
	setIssueState,
    updateIssue,
    listIssueEvents,
} = require('../utility/github');

module.exports = {
	name: Events.ThreadUpdate,
	async execute(oldThread, newThread) {
		// Sync difference with github
        
        // Name Change, update issue title, body
        // Archive State change, if closed, close issue, if open, open issue
        // Lock State change, if locked, close issue, if unlocked, open issue

        // Find the first message the bot sent in the thread
        const messages = await newThread.messages.fetch();
        
        // Filter for messages from the bot
        const botMessages = messages.filter(m => m.author.id === newThread.client.user.id);

        // Find the first message from the bot
        const botMessage = botMessages.first();
        
        // If the bot message doesn't exist, return
        if (!botMessage) return;

        // Parse the discord reference message
        const {issueId, issueNodeId, issueUrl} = parseGithubReference(botMessage.content);

        // If thread name changed, change issue title
        const updateBody = {};
        
        // Change state of issue based on archive and locked state
        if (oldThread.archived !== newThread.archived) {
            // If the thread is archived, close the issue
            if (newThread.archived) {
                updateBody.state = "closed";
                updateBody.state_reason = "completed";
            } else {
                updateBody.state = "open";
                updateBody.state_reason = "not_planned";
            }
            updateIssue(process.env.OWNER, process.env.REPO, issueId, updateBody);
        }
	},
};