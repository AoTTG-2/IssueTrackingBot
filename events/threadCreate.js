const { Events } = require('discord.js');
const fs = require('node:fs');


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
		// Log the thread title, body, creator, and tags
		console.log(`A new thread was created: ${thread}`);
		console.log(`Thread title: ${thread.name}`);

		const messages = await thread.messages.fetch();
		const post = messages.first();

		if (!post) return;

		console.log(`${post.author}: ${post.content}`);

		const createIssueResponse = await createIssue(process.env.OWNER, process.env.REPO, thread.name, post.content);
		const addIssueToProjectResponse = await addIssueToProject(process.env.OWNER, process.env.REPO, process.env.PROJECT, createIssueResponse.node_id);
		const setIssueStateResponse = await setIssueState(process.env.OWNER, process.env.REPO, process.env.PROJECT, addIssueToProjectResponse, ProjectStates.Ready);

		// Create the github reference message for discord (used to reference the github case later)
		const githubReferenceComment = `IssueID: ${createIssueResponse.number}\nIssueNodeID: ${createIssueResponse.node_id}\nIssueURL: ${createIssueResponse.html_url}`;
		thread.send(githubReferenceComment);

		// Create the discord thread reference message for github (used to reference the discord thread later)
		const discordReferenceComment = `DiscordThread: ${thread.id}\nDiscordThreadURL: ${thread.url}`;
		const addIssueCommentResponse = await addIssueComment(process.env.OWNER, process.env.REPO, createIssueResponse.number, discordReferenceComment);
	},
};


/*
async execute(thread, boolean) {
		// Log the thread title, body, creator, and tags
		console.log(`A new thread was created: ${thread}`);
		console.log(`Thread title: ${thread.name}`);

		const messages = await thread.messages.fetch();
		const post = messages.first();

		if (!post) return;

		console.log(`${post.author}: ${post.content}`);

		// Dynamically import Octokit
		const { Octokit } = await import("@octokit/rest");
		const octokit = new Octokit({ auth: process.env.GHTOKEN });

		// Create rest api call to github using octokit
		const response = await octokit.rest.issues.create({
			owner: process.env.OWNER,
			repo: process.env.REPO,
			title: thread.name,
			body: post.content
		});

		// Use GraphQL on octokit to get the project
		const projectResponse = await octokit.graphql(`
            query($owner: String!, $repo: String!) {
                repository(owner: $owner, name: $repo) {
                    projectsV2(first: 100) {
                        nodes {
                            id
                            title
                        }
                    }
                }
            }
        `, {
			owner: process.env.OWNER,
			repo: process.env.REPO
		});

		const project = projectResponse.repository.projectsV2.nodes.find(p => p.title === process.env.PROJECT);

		if (!project) {
			console.log(`Project ${process.env.PROJECT} not found`);
			return;
		}

		// Add the issue to the project in the state "Ready"
		const addIssueToProjectResponse = await octokit.graphql(`
            mutation($projectId: ID!, $contentId: ID!) {
                addProjectV2ItemById(input: {projectId: $projectId, contentId: $contentId}) {
                    item {
                        id
                    }
                }
            }
        `, {
			projectId: project.id,
			contentId: response.data.node_id
		});

		console.log(addIssueToProjectResponse);


		// Create a message under the thread with a link to the issue.
		const githubReferenceComment = `IssueID: ${response.data.number}
		IssueURL: ${response.data.html_url}`;
		thread.send(githubReferenceComment);

		// Create a string message that has the discord thread id
		const discordReferenceComment = `DiscordThread: ${thread.id}
		DiscordThreadURL: ${thread.url}`;

		// Create a comment on the issue
		await octokit.rest.issues.createComment({
			owner: process.env.OWNER,
			repo: process.env.REPO,
			issue_number: response.data.number,
			body: discordReferenceComment,
		})


	},
*/
