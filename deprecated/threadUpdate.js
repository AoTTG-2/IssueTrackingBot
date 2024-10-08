const { Events, Thread } = require('discord.js');
const fs = require('node:fs');
const {
    createGithubReference,
    createDiscordReference,
    parseDiscordReference,
    parseGithubReference,
    isChannelTracked,
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
} = require('../utility/github.js');
const threadCreate = require('../events/threadCreate.js');

module.exports = {
	name: Events.ThreadUpdate,
	async execute(oldThread, newThread) {
        // If thread parentid is not tracked, return
        if (!isChannelTracked(newThread.parentId)) return;

        console.log(`A thread was updated`);

        // if thread is now archived, unarchive it
        if (newThread.archived) {
            await newThread.setArchived(false);
        }

        // check if theres a difference in applied tags
        const oldTags = oldThread.appliedTags;
        const newTags = newThread.appliedTags;

        // If the tags are the same, return
        if (oldTags === newTags) return;

        // Tags expected are Ready, Assigned, and Closed
        // old tags does not contain closed and new tags contains closed, close the ticket
        if (!oldTags.includes("Closed") && newTags.includes("Closed")) {
            // get the first bot message
            const messages = await newThread.messages.fetch();
            const botMessage = messages.filter(m => m.author.id === newThread.client.user.id).first();
            const {issueId, issueNodeId, projv2Id, issueUrl} = parseGithubReference(botMessage.content);
            updateIssue(process.env.OWNER, process.env.REPO, issueId, {state: "closed", state_reason: "completed"});
        }
        // else if old tags does not contain assigned and new tags contains assigned, set the ticket to in progress via projectv2
        else if (!oldTags.includes("Assigned") && newTags.includes("Assigned")) {
            // get the first bot message
            const messages = await newThread.messages.fetch();
            const botMessage = messages.filter(m => m.author.id === newThread.client.user.id).first();
            const {issueId, issueNodeId, projv2Id, issueUrl} = parseGithubReference(botMessage.content);
            setIssueState(process.env.OWNER, process.env.REPO, process.env.PROJECT, projv2Id, ProjectStates.InProgress);
        }
        else if (!oldTags.includes("Ready") && newTags.includes("Ready")) {
            // get the first bot message
            const messages = await newThread.messages.fetch();
            const botMessage = messages.filter(m => m.author.id === newThread.client.user.id).first();
            const {issueId, issueNodeId, projv2Id, issueUrl} = parseGithubReference(botMessage.content);
            setIssueState(process.env.OWNER, process.env.REPO, process.env.PROJECT, projv2Id, ProjectStates.Ready);
        }
	},
};