const { Events } = require('discord.js');

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

        // Dynamically import Octokit
        const { Octokit } = await import("@octokit/rest");
        const octokit = new Octokit({auth: process.env.GHTOKEN});

        // Create rest api call to github using octokit
        const response = await octokit.rest.issues.create({
            owner: process.env.OWNER,
            repo: process.env.REPO,
            title: thread.name,
            body: post.content,
        });

        console.log(`Issue created: ${response}`);

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
};
