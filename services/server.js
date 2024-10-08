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
          console.log("on opened, but we do nothing");
          const number = event.issue.number;
          const node_id = event.issue.node_id;
          const html_url = event.issue.html_url;
        }
        else if (event.action == "assigned")
        {
          console.log("on assigned");
          const number = event.issue.number;
          const comment = await findBotCommentOnIssue(process.env.OWNER, process.env.REPO, number);
          const { channelId, threadId, threadUrl, projV2Id } = parseDiscordReference(comment.body);

          // Set issue state to "In Progress"
          await setIssueState(process.env.OWNER, process.env.REPO, process.env.PROJECT, projV2Id, ProjectStates.InProgress);

          // Get the thread
          const channel = await client.channels.fetch(channelId);
          const thread = await channel.threads.fetch(threadId);

          // Update the tag on discord to "In Progress"
          thread.setArchived(false);
          thread.setLocked(false);
          
          const tag = thread.parent.availableTags.find(tag => tag.name === "Assigned");

          if (tag)
          {
            thread.setAppliedTags([tag.id]);
          }
        }
        else if (event.action == "closed")
        {
          console.log("on closed");
          const number = event.issue.number;
          const comment = await findBotCommentOnIssue(process.env.OWNER, process.env.REPO, number);
          const { channelId, threadId, threadUrl, projV2Id } = parseDiscordReference(comment.body);

          // Get the thread
          const channel = await client.channels.fetch(channelId);
          const thread = await channel.threads.fetch(threadId);

          // If thread is already closed, return
          if (thread.archived) return;

          const tag = thread.parent.availableTags.find(tag => tag.name === "Closed");

          if (tag)
          {
            thread.setAppliedTags([tag.id]);
          }
        }

    })

  return app
}

module.exports = { createServer }