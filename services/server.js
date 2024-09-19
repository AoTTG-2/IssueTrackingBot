const express = require('express');
const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const path = require('node:path');

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
    getIssueByNumber,
} = require('../utility/github');
const { parseDiscordReference } = require('../utility/util');

const createServer = client => {
  const app = express()
  app.get("/", (_, res) => {
    res.send(`${client.user.username} says hello`)
  })

  // Define a post route called events that will get json data from github webhooks
    app.post("/events", express.json({type: 'application/json'}), async (req, res) => {
        // Log request body to a unique file name prefixed with "github-webhook-"
        res.status(202).send('Accepted');
        
        const githubEvent = req.headers['x-github-event'];

        // We only care about issues (other event is issue_comment created)
        if (githubEvent !== 'issues') {
            return;
        }

        const event = req.body;
        if (event.issue.user == process.env.BOTUSER || event.issue.performed_via_github_app)
        {
          return;
        }
        if (event.action == "opened")
        {
          const number = event.issue.number;
          const node_id = event.issue.node_id;
          const html_url = event.issue.html_url;
        }
        else if (event.action == "assigned")
        {
          // Change the state of the issue to "In Progress", update the tag on discord to "In Progress"
          const number = event.issue.number;
          let node_id = event.issue.node_id;

          const issueResponse = await getIssueByNumber(process.env.OWNER, process.env.REPO, number);
          console.log(`${node_id}, ${issueResponse.node_id}`);
          node_id = issueResponse.node_id;
          

          // Set issue state to "In Progress"
          await setIssueState(process.env.OWNER, process.env.REPO, process.env.PROJECT, node_id, ProjectStates.InProgress);

          const comment = await findBotCommentOnIssue(process.env.OWNER, process.env.REPO, number);
          console.log(comment);

          const { channelId, threadId, threadUrl } = parseDiscordReference(comment.body);

          // Get the thread
          const channel = await client.channels.fetch(channelId);
          const thread = await channel.threads.fetch(threadId);

          // Get the applied tags
          console.log(channel.appliedTags);

          // Update the tag on discord to "In Progress"
          thread.setArchived(false);
          thread.setLocked(false);
          
          // remove all thread tags and add "In Progress" tag
          thread.setAppliedTags(["In Progress"]);
        }
        else if (event.action == "closed")
        {
          // Update the tag on discord to "closed" and archive the thread.
          const number = event.issue.number;
          const comment = await findBotCommentOnIssue(process.env.OWNER, process.env.REPO, number);
          console.log(comment);

          const { channelId, threadId, threadUrl } = parseDiscordReference(comment.body);

          // Get the thread
          const channel = await client.channels.fetch(channelId);
          const thread = await channel.threads.fetch(threadId);

          // Get the applied tags
          console.log(channel.appliedTags);

          // Update the tag on discord to "In Progress"
          thread.setArchived(true);
          thread.setLocked(true);
          
          // remove all thread tags and add "In Progress" tag
          thread.setAppliedTags(["Closed"]);
        }

    })

  return app
}

module.exports = { createServer }