const { Events } = require('discord.js');
const fs = require('node:fs');

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
    listIssues,
    findBotCommentOnIssue,
} = require('../utility/github');

module.exports = {
	name: Events.ThreadCreate,
	async execute(thread, boolean) {
		// check if channel is tracked
		//if (!isChannelTracked(thread.parentId)) return;
		await pairCreatedThreadWithIssue(thread);
		// // Log the thread title, body, creator, and tags
		// console.log(`A new thread was created: ${thread}`);
		// console.log(`Thread title: ${thread.name}`);

		// const messages = await thread.messages.fetch();
		// const post = messages.first();

		// if (!post) return;

		// console.log(`${post.author}: ${post.content}`);

		// const createIssueResponse = await createIssue(process.env.OWNER, process.env.REPO, thread.name, post.content);
		// const addIssueToProjectResponse = await addIssueToProject(process.env.OWNER, process.env.REPO, process.env.PROJECT, createIssueResponse.node_id);
		// const setIssueStateResponse = await setIssueState(process.env.OWNER, process.env.REPO, process.env.PROJECT, addIssueToProjectResponse, ProjectStates.Ready);

		// // Create the github reference message for discord (used to reference the github case later)
		// const githubReferenceComment = createGithubReference(createIssueResponse.number, createIssueResponse.node_id, addIssueToProjectResponse, createIssueResponse.html_url);
		// thread.send(githubReferenceComment);

		// // Create the discord thread reference message for github (used to reference the discord thread later)
		// const discordReferenceComment = createDiscordReference(thread.parentId, thread.id, thread.url, addIssueToProjectResponse);
		// const addIssueCommentResponse = await addIssueComment(process.env.OWNER, process.env.REPO, createIssueResponse.number, discordReferenceComment);

		// const tag = thread.parent.availableTags.find(tag => tag.name === "Ready");

		// if (tag)
		// {
		// 	thread.setAppliedTags([tag.id]);
		// }
	},
};

